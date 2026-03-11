"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Text, Line, Grid } from "@react-three/drei";
import * as THREE from "three";
import type { RobotData } from "@/lib/mock-data";
import { STATUS_COLORS } from "@/lib/mock-data";

/* ------------------------------------------------------------------ */
/* Joint — reusable sphere joint with label                            */
/* ------------------------------------------------------------------ */
function Joint({
  position,
  label,
  isSelected,
  size = 0.16,
}: {
  position: [number, number, number];
  label: string;
  isSelected: boolean;
  size?: number;
}) {
  return (
    <group position={position}>
      {/* Joint sphere */}
      <mesh>
        <sphereGeometry args={[size, 20, 20]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.85} roughness={0.15} />
      </mesh>
      {/* Orange ring around joint */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[size + 0.02, 0.02, 8, 32]} />
        <meshStandardMaterial color="#FD3E06" emissive="#FD3E06" emissiveIntensity={0.4} />
      </mesh>
      {/* Label (visible when selected) */}
      {isSelected && (
        <Text
          position={[0.4, 0, 0]}
          fontSize={0.13}
          color="#FD3E06"
          anchorX="left"
          anchorY="middle"
          font={undefined}
        >
          {label}
        </Text>
      )}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Link — reusable arm segment (cylinder between joints)               */
/* ------------------------------------------------------------------ */
function Link({
  start,
  end,
  radius = 0.08,
}: {
  start: THREE.Vector3;
  end: THREE.Vector3;
  radius?: number;
}) {
  const mid = useMemo(() => new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5), [start, end]);
  const dir = useMemo(() => new THREE.Vector3().subVectors(end, start), [start, end]);
  const length = useMemo(() => dir.length(), [dir]);
  const orientation = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    return new THREE.Euler().setFromQuaternion(q);
  }, [dir]);

  return (
    <mesh position={mid} rotation={orientation}>
      <cylinderGeometry args={[radius, radius, length, 12]} />
      <meshStandardMaterial color="#d4d4d8" metalness={0.75} roughness={0.2} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* 6-DOF Robot Arm — realistic industrial robot arm                    */
/* ------------------------------------------------------------------ */
function RobotArm({
  robot,
  isSelected,
  onClick,
}: {
  robot: RobotData;
  isSelected: boolean;
  onClick: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const statusColor = STATUS_COLORS[robot.status];
  const timeRef = useRef(0);

  // Smooth oscillation for running robots
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (robot.status === "running") {
      timeRef.current += delta;
      groupRef.current.rotation.y = Math.sin(timeRef.current * 0.5) * 0.4;
    }
  });

  // Joint positions for the 6-DOF arm (relative offsets)
  const basePos: [number, number, number] = [0, 0.15, 0];
  const shoulderPos: [number, number, number] = [0, 0.55, 0];
  const upperArmEnd: [number, number, number] = [0, 1.5, 0];
  const elbowPos: [number, number, number] = [0, 1.5, 0];
  const forearmEnd: [number, number, number] = [0.2, 2.2, 0.15];
  const wristPos: [number, number, number] = [0.2, 2.2, 0.15];
  const wrist2Pos: [number, number, number] = [0.45, 2.55, 0.2];
  const endEffectorPos: [number, number, number] = [0.6, 2.75, 0.22];

  return (
    <group position={robot.position} onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onClick(); }}>
      {/* Selection ring on floor */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[1.0, 1.15, 48]} />
          <meshStandardMaterial color="#FD3E06" emissive="#FD3E06" emissiveIntensity={1.0} transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Status glow disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.9, 32]} />
        <meshStandardMaterial color={statusColor} emissive={statusColor} emissiveIntensity={0.15} transparent opacity={0.2} />
      </mesh>

      {/* ── BASE ── */}
      {/* Base plate */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.55, 0.6, 0.1, 24]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.15} />
      </mesh>
      {/* Base column */}
      <mesh position={basePos}>
        <cylinderGeometry args={[0.35, 0.45, 0.3, 20]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Base detail ring */}
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.37, 0.37, 0.04, 20]} />
        <meshStandardMaterial color="#FD3E06" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* ── ROTATING ASSEMBLY ── */}
      <group ref={groupRef} position={[0, 0.35, 0]}>

        {/* Shoulder joint */}
        <Joint position={[0, 0.2, 0]} label="shoulder_link" isSelected={isSelected} size={0.2} />

        {/* Upper arm segment (shoulder → elbow) */}
        <Link
          start={new THREE.Vector3(0, 0.2, 0)}
          end={new THREE.Vector3(...elbowPos).sub(new THREE.Vector3(0, 0.35, 0))}
          radius={0.09}
        />
        {/* Upper arm housing */}
        <mesh position={[0, 0.75, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.8, 12]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Elbow joint */}
        <Joint position={[0, 1.15, 0]} label="upperarm_link" isSelected={isSelected} size={0.18} />

        {/* Forearm segment (elbow → wrist) */}
        <Link
          start={new THREE.Vector3(0, 1.15, 0)}
          end={new THREE.Vector3(0.2, 1.85, 0.15)}
          radius={0.07}
        />
        {/* Forearm housing */}
        <mesh position={[0.1, 1.5, 0.075]} rotation={[0.15, 0, -0.25]}>
          <cylinderGeometry args={[0.08, 0.08, 0.65, 12]} />
          <meshStandardMaterial color="#d4d4d8" metalness={0.75} roughness={0.2} />
        </mesh>

        {/* Forearm label joint */}
        <Joint position={[0.2, 1.85, 0.15]} label="forearm_link" isSelected={isSelected} size={0.14} />

        {/* Wrist segment */}
        <Link
          start={new THREE.Vector3(0.2, 1.85, 0.15)}
          end={new THREE.Vector3(0.45, 2.2, 0.2)}
          radius={0.06}
        />

        {/* Wrist joint */}
        <Joint position={[0.45, 2.2, 0.2]} label="wrist2_link" isSelected={isSelected} size={0.12} />

        {/* End effector / tool */}
        <mesh position={[0.55, 2.38, 0.22]} rotation={[0.1, 0, -0.4]}>
          <cylinderGeometry args={[0.06, 0.09, 0.25, 12]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.15} />
        </mesh>
        {/* Tool tip */}
        <mesh position={[0.6, 2.5, 0.23]}>
          <cylinderGeometry args={[0.04, 0.06, 0.1, 12]} />
          <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Orange ring on tool */}
        <mesh position={[0.53, 2.28, 0.21]} rotation={[0.1, 0, -0.4]}>
          <torusGeometry args={[0.08, 0.015, 8, 24]} />
          <meshStandardMaterial color="#FD3E06" emissive="#FD3E06" emissiveIntensity={0.3} />
        </mesh>
      </group>

      {/* Robot ID label (above the arm) */}
      <Text
        position={[0, 3.0, 0]}
        fontSize={0.22}
        color={isSelected ? "#FD3E06" : "#64748b"}
        anchorX="center"
        anchorY="middle"
        font={undefined}
        outlineWidth={0.01}
        outlineColor="#0B0F17"
      >
        {robot.id}
      </Text>

      {/* Status label below ID */}
      <Text
        position={[0, 2.75, 0]}
        fontSize={0.12}
        color={statusColor}
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {robot.status.toUpperCase()}
      </Text>

      {/* Status point light */}
      <pointLight position={[0, 0.5, 0]} color={statusColor} intensity={isSelected ? 1.5 : 0.3} distance={4} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Conveyor Belt                                                      */
/* ------------------------------------------------------------------ */
function ConveyorBelt({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Belt surface */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[10, 0.12, 0.8]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Side rails */}
      {[-0.4, 0.4].map((z, i) => (
        <mesh key={`rail-${i}`} position={[0, 0.32, z]}>
          <boxGeometry args={[10, 0.04, 0.04]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      {/* Legs */}
      {[-4, -2, 0, 2, 4].map((x, i) => (
        <mesh key={i} position={[x, 0.1, 0]}>
          <boxGeometry args={[0.08, 0.2, 0.6]} />
          <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.5} />
        </mesh>
      ))}
      {/* Roller markers */}
      {Array.from({ length: 25 }).map((_, i) => (
        <mesh key={`seg-${i}`} position={[-4.8 + i * 0.4, 0.32, 0]}>
          <boxGeometry args={[0.03, 0.01, 0.75]} />
          <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Axis Indicator (XYZ like Foxglove)                                 */
/* ------------------------------------------------------------------ */
function AxisIndicator() {
  const axisLength = 1.5;
  return (
    <group position={[-8, 0.01, 8]}>
      {/* X axis — red */}
      <Line points={[[0, 0, 0], [axisLength, 0, 0]]} color="#ef4444" lineWidth={2} />
      <Text position={[axisLength + 0.2, 0, 0]} fontSize={0.15} color="#ef4444" font={undefined}>X</Text>
      {/* Y axis — green */}
      <Line points={[[0, 0, 0], [0, axisLength, 0]]} color="#22c55e" lineWidth={2} />
      <Text position={[0, axisLength + 0.2, 0]} fontSize={0.15} color="#22c55e" font={undefined}>Y</Text>
      {/* Z axis — blue */}
      <Line points={[[0, 0, 0], [0, 0, axisLength]]} color="#3b82f6" lineWidth={2} />
      <Text position={[0, 0, axisLength + 0.2]} fontSize={0.15} color="#3b82f6" font={undefined}>Z</Text>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Scene (composed)                                                   */
/* ------------------------------------------------------------------ */
function Scene({
  robots,
  selectedRobotId,
  onSelectRobot,
}: {
  robots: RobotData[];
  selectedRobotId: string | null;
  onSelectRobot: (id: string) => void;
}) {
  return (
    <>
      {/* Scene background */}
      <color attach="background" args={["#0B0F17"]} />

      {/* Lighting — brighter for white metallic arms */}
      <ambientLight intensity={0.35} />
      <directionalLight position={[8, 12, 5]} intensity={0.6} color="#f8fafc" castShadow />
      <directionalLight position={[-5, 8, -5]} intensity={0.2} color="#e2e8f0" />
      <pointLight position={[0, 8, 0]} intensity={0.3} color="#FD3E06" distance={25} />
      <hemisphereLight args={["#1e293b", "#0B0F17", 0.3]} />

      {/* Fog — pushed further for better depth */}
      <fog attach="fog" args={["#0B0F17", 15, 40]} />

      {/* Grid Floor (Foxglove-style) */}
      <Grid
        args={[30, 30]}
        position={[0, 0, 0]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#1e3a5f"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#2563eb"
        fadeDistance={30}
        fadeStrength={1}
        infiniteGrid
      />

      {/* Axis indicator */}
      <AxisIndicator />

      {/* Conveyor belts */}
      <ConveyorBelt position={[0, 0, -3]} />
      <ConveyorBelt position={[0, 0, 3]} />

      {/* Robot Arms */}
      {robots.map((robot) => (
        <RobotArm
          key={robot.id}
          robot={robot}
          isSelected={selectedRobotId === robot.id}
          onClick={() => onSelectRobot(robot.id)}
        />
      ))}

      {/* Camera Controls */}
      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={4}
        maxDistance={25}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Exported Component                                                 */
/* ------------------------------------------------------------------ */
interface FactorySceneProps {
  robots: RobotData[];
  selectedRobotId: string | null;
  onSelectRobot: (id: string) => void;
}

function WebGLFallback({ robots }: { robots: RobotData[] }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[#0B0F17] p-8 text-center">
      <div className="text-4xl">🏭</div>
      <p className="text-sm font-medium text-[#94A3B8]">3D Factory View</p>
      <p className="max-w-xs text-xs text-[#64748B]">
        WebGL is not supported in this browser. Open{" "}
        <span className="font-mono text-[#FD3E06]">localhost:3000/dashboard</span>{" "}
        in Chrome or Edge to see the interactive 3D scene.
      </p>
      <div className="mt-2 flex gap-3">
        {robots.map((r) => (
          <div key={r.id} className="rounded-md border border-[#1E293B] bg-[#0F172A] px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[r.status] }} />
              <span className="font-mono text-xs text-[#94A3B8]">{r.id}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FactoryScene({ robots, selectedRobotId, onSelectRobot }: FactorySceneProps) {
  const [webglSupported, setWebglSupported] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl") || c.getContext("experimental-webgl");
      if (!gl) setWebglSupported(false);
    } catch {
      setWebglSupported(false);
    }
  }, []);

  // Track container size so Canvas knows to resize on mobile
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      setSize({ w: rect.width, h: rect.height });
    });
    ro.observe(el);
    // initial
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const selectedRobot = robots.find((r) => r.id === selectedRobotId);

  if (!webglSupported) {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-lg border border-[#1E293B] bg-[#0B0F17]">
        <WebGLFallback robots={robots} />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden rounded-lg border border-[#1E293B] bg-[#0B0F17]"
      style={{ touchAction: "none" }}
    >
      {/* ── Top-left: Scene title ── */}
      <div className="pointer-events-none absolute left-3 top-3 z-10">
        <div className="rounded border border-[#1E293B] bg-[#0F172A]/90 px-2.5 py-1 backdrop-blur-sm">
          <span className="text-[10px] font-medium uppercase tracking-widest text-[#94A3B8]">
            3D Factory View
          </span>
        </div>
      </div>

      {/* ── Top-right: Robot count ── */}
      <div className="pointer-events-none absolute right-3 top-3 z-10">
        <div className="rounded border border-[#1E293B] bg-[#0F172A]/90 px-2.5 py-1 backdrop-blur-sm">
          <span className="text-[10px] text-[#94A3B8]">
            Robots: <span className="font-mono text-[#FD3E06]">{robots.length}</span>
          </span>
        </div>
      </div>

      {/* ── Bottom-left: Foxglove-style selected robot info panel ── */}
      {selectedRobot && (
        <div className="pointer-events-none absolute bottom-3 left-3 z-10 w-56">
          <div className="rounded border border-[#1E293B] bg-[#0F172A]/90 p-3 backdrop-blur-sm">
            <div className="mb-2 flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[selectedRobot.status] }}
              />
              <span className="font-mono text-xs font-semibold text-[#F8FAFC]">
                {selectedRobot.id}
              </span>
              <span className="ml-auto rounded bg-[#1E293B] px-1.5 py-0.5 text-[9px] font-medium uppercase"
                style={{ color: STATUS_COLORS[selectedRobot.status] }}>
                {selectedRobot.status}
              </span>
            </div>
            <div className="space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Temperature</span>
                <span className="font-mono text-[#CBD5E1]">{selectedRobot.temperature}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Load</span>
                <span className="font-mono text-[#CBD5E1]">{selectedRobot.load}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Cycle Time</span>
                <span className="font-mono text-[#CBD5E1]">{selectedRobot.cycleTime}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Position</span>
                <span className="font-mono text-[#CBD5E1]">
                  [{selectedRobot.position.join(", ")}]
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom-right: Camera hint ── */}
      <div className="pointer-events-none absolute bottom-3 right-3 z-10">
        <div className="rounded border border-[#1E293B] bg-[#0F172A]/90 px-2.5 py-1 backdrop-blur-sm">
          <span className="text-[9px] text-[#475569]">
            Orbit · Zoom · Pan
          </span>
        </div>
      </div>

      <Canvas
        camera={{ position: [8, 6, 8], fov: 50 }}
        dpr={[1, Math.min(1.5, window?.devicePixelRatio ?? 1)]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "default",
          failIfMajorPerformanceCaveat: false,
        }}
        style={{ background: "#0B0F17", width: "100%", height: "100%", display: "block" }}
        resize={{ debounce: 50 }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(0x0b0f17, 1);
          scene.background = new THREE.Color(0x0b0f17);
        }}
      >
        <Scene robots={robots} selectedRobotId={selectedRobotId} onSelectRobot={onSelectRobot} />
      </Canvas>
    </div>
  );
}
