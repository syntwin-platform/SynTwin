"use client";

import React, { useState, useEffect } from "react";
import type { RobotData } from "@/lib/mock-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

interface RobotFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (robot: RobotData) => void;
  onDelete?: (id: string) => void;
  robot?: RobotData | null;
  existingIds: string[];
}

function nextRobotId(existingIds: string[]): string {
  let max = 0;
  for (const id of existingIds) {
    const match = id.match(/^RA-(\d+)$/);
    if (match) max = Math.max(max, parseInt(match[1], 10));
  }
  return `RA-${String(max + 1).padStart(3, "0")}`;
}

export function RobotFormDialog({
  open,
  onClose,
  onSave,
  onDelete,
  robot,
  existingIds,
}: RobotFormDialogProps) {
  const isEdit = !!robot;

  const [name, setName] = useState("");
  const [posX, setPosX] = useState("0");
  const [posY, setPosY] = useState("0");
  const [posZ, setPosZ] = useState("0");

  useEffect(() => {
    if (robot) {
      setName(robot.name);
      setPosX(String(robot.position[0]));
      setPosY(String(robot.position[1]));
      setPosZ(String(robot.position[2]));
    } else {
      setName("");
      setPosX(String((existingIds.length) * 4 - 4));
      setPosY("0");
      setPosZ("0");
    }
  }, [robot, open, existingIds.length]);

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const data: RobotData = {
      id: robot?.id ?? nextRobotId(existingIds),
      name: trimmedName,
      status: robot?.status ?? "idle",
      temperature: robot?.temperature ?? 25,
      load: robot?.load ?? 0,
      cycleTime: robot?.cycleTime ?? 0,
      position: [
        parseFloat(posX) || 0,
        parseFloat(posY) || 0,
        parseFloat(posZ) || 0,
      ],
    };

    onSave(data);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Robot" : "Add Robot"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Update settings for ${robot?.id}`
              : "Configure a new robot to add to the factory floor."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* ID (read-only in edit mode, auto-generated in add) */}
          <div>
            <label className="mb-1 block text-xs font-medium text-[#64748B]">
              Robot ID
            </label>
            <Input
              value={robot?.id ?? nextRobotId(existingIds)}
              disabled
              className="font-mono text-sm bg-[#F1F5F9]"
            />
          </div>

          {/* Name */}
          <div>
            <label className="mb-1 block text-xs font-medium text-[#64748B]">
              Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Robot Arm Delta"
              className="text-sm"
            />
          </div>

          {/* Position */}
          <div>
            <label className="mb-1 block text-xs font-medium text-[#64748B]">
              Position (X, Y, Z)
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={posX}
                onChange={(e) => setPosX(e.target.value)}
                className="text-sm font-mono"
                placeholder="X"
              />
              <Input
                type="number"
                value={posY}
                onChange={(e) => setPosY(e.target.value)}
                className="text-sm font-mono"
                placeholder="Y"
              />
              <Input
                type="number"
                value={posZ}
                onChange={(e) => setPosZ(e.target.value)}
                className="text-sm font-mono"
                placeholder="Z"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center !justify-between">
          {isEdit && onDelete ? (
            <button
              onClick={() => {
                onDelete(robot!.id);
                onClose();
              }}
              className="flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium text-[#EF4444] transition-colors hover:bg-[#EF4444]/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-md border border-[#E2E8F0] px-4 py-2 text-xs font-medium text-[#64748B] transition-colors hover:bg-[#F1F5F9]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="rounded-md bg-[#FD3E06] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#FD3E06]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEdit ? "Save Changes" : "Add Robot"}
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
