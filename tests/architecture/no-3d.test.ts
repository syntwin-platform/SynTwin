import {
    existsSync,
    readFileSync,
    readdirSync,
    statSync,
} from "node:fs";
import { join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(import.meta.dirname, "../..");

describe("complete 3D runtime removal", () => {
    it("removes Three.js dependencies and runtime assets", () => {
        const packageJson = JSON.parse(
            readFileSync(resolve(projectRoot, "package.json"), "utf8")
        ) as {
            dependencies?: Record<string, string>;
            devDependencies?: Record<string, string>;
        };
        const installed = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies,
        };

        expect(installed).not.toHaveProperty("three");
        expect(installed).not.toHaveProperty("@types/three");
        expect(installed).not.toHaveProperty("@react-three/fiber");
        expect(installed).not.toHaveProperty("@react-three/drei");
        expect(
            existsSync(resolve(projectRoot, "public/robot.glb"))
        ).toBe(false);
        expect(
            existsSync(
                resolve(projectRoot, "components/FactoryScene.tsx")
            )
        ).toBe(false);
    });

    it("has no runtime imports, presentation gates, or user-facing 3D claims", () => {
        const violations: string[] = [];
        const forbidden = [
            /FactoryScene/,
            /@react-three\//,
            /from\s+["']three["']/,
            /\b3D Factory View\b/i,
            /\b3D Digital Twin\b/i,
            /\b3D visualization\b/i,
            /\bDigital Twin 3D\b/i,
        ];

        for (const file of collectSourceFiles([
            resolve(projectRoot, "app"),
            resolve(projectRoot, "components"),
            resolve(projectRoot, "hooks"),
            resolve(projectRoot, "lib"),
        ])) {
            if (
                file.endsWith(".test.ts") ||
                file.endsWith(".test.tsx")
            ) {
                continue;
            }

            const source = readFileSync(file, "utf8");
            if (forbidden.some((pattern) => pattern.test(source))) {
                violations.push(relative(projectRoot, file));
            }

            if (
                /[\\/]app[\\/]|[\\/]components[\\/]/.test(file) &&
                /\bcanView3D\b/.test(source)
            ) {
                violations.push(
                    `${relative(projectRoot, file)} (canView3D presentation gate)`
                );
            }
        }

        expect(violations).toEqual([]);
    });
});

function collectSourceFiles(roots: string[]): string[] {
    const files: string[] = [];

    for (const root of roots) {
        if (!existsSync(root)) continue;

        for (const entry of readdirSync(root)) {
            const path = join(root, entry);
            const stats = statSync(path);

            if (
                stats.isDirectory() &&
                !["node_modules", ".next"].includes(entry)
            ) {
                files.push(...collectSourceFiles([path]));
            } else if (stats.isFile() && /\.(?:ts|tsx)$/.test(entry)) {
                files.push(path);
            }
        }
    }

    return files;
}
