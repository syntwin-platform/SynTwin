import {
    existsSync,
    readFileSync,
    readdirSync,
    statSync,
} from "node:fs";
import { join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(import.meta.dirname, "../..");
const demoRoots = [
    resolve(projectRoot, "lib/demo"),
    resolve(projectRoot, "components/demo"),
    resolve(projectRoot, "app/dashboard/demo"),
];

describe("demo source isolation", () => {
    it("does not import live product APIs or company context", () => {
        const violations: string[] = [];
        const forbiddenImports = [
            /from\s+["']@\/lib\/api(?:\/|["'])/,
            /from\s+["']@\/lib\/company-context["']/,
            /from\s+["']@\/hooks\/useFleetSnapshot["']/,
            /from\s+["']@\/lib\/operations(?:\/|["'])/,
        ];

        for (const file of collectSourceFiles(demoRoots)) {
            if (file.endsWith(".test.ts") || file.endsWith(".test.tsx")) {
                continue;
            }

            const source = readFileSync(file, "utf8");
            if (forbiddenImports.some((pattern) => pattern.test(source))) {
                violations.push(relative(projectRoot, file));
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

            if (stats.isDirectory()) {
                files.push(...collectSourceFiles([path]));
            } else if (/\.(?:ts|tsx)$/.test(entry)) {
                files.push(path);
            }
        }
    }

    return files;
}
