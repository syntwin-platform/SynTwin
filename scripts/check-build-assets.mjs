import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const nextRoot = path.join(projectRoot, ".next");
const baselinePath = path.join(
    projectRoot,
    "scripts",
    "build-assets-baseline.json"
);
const limitBytes = 500000;
const recordBaseline = process.argv.includes("--record-baseline");

const assets = await collectBuildAssets();

if (recordBaseline) {
    const baseline = {
        generatedAt: new Date().toISOString(),
        limitBytes,
        assets,
    };

    await writeFile(
        baselinePath,
        `${JSON.stringify(baseline, null, 2)}\n`,
        "utf8"
    );
    console.log(
        `Recorded ${assets.length} build assets in ${path.relative(
            projectRoot,
            baselinePath
        )}.`
    );
    process.exit(0);
}

const baseline = JSON.parse(await readFile(baselinePath, "utf8"));
const previousAssets = new Map(
    baseline.assets.map((asset) => [asset.path, asset.bytes])
);
const violations = assets.filter((asset) => {
    if (asset.bytes <= limitBytes) {
        return false;
    }

    const previousBytes = previousAssets.get(asset.path);
    return previousBytes === undefined || previousBytes <= limitBytes;
});

if (violations.length > 0) {
    console.error(
        `New blocking assets exceed ${limitBytes} bytes:\n${violations
            .map((asset) => `- ${asset.path}: ${asset.bytes} bytes`)
            .join("\n")}`
    );
    process.exit(1);
}

console.log(
    `Asset budget passed: ${assets.length} manifest/public assets checked; no new asset exceeds ${limitBytes} bytes.`
);

async function collectBuildAssets() {
    const referencedFiles = new Set();

    const rootManifests = [path.join(nextRoot, "build-manifest.json")];
    const appManifest = path.join(nextRoot, "app-build-manifest.json");
    if (await exists(appManifest)) {
        rootManifests.push(appManifest);
    } else {
        const appServerRoot = path.join(nextRoot, "server", "app");
        const routeManifests = (await walkFiles(appServerRoot)).filter(
            (file) => path.basename(file) === "build-manifest.json"
        );
        rootManifests.push(...routeManifests);
    }

    for (const manifestPath of rootManifests) {
        const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
        collectStrings(manifest, referencedFiles);
    }

    for (const staticDirectory of [
        path.join(nextRoot, "static", "chunks"),
        path.join(nextRoot, "static", "media"),
    ]) {
        if (!(await exists(staticDirectory))) {
            continue;
        }

        for (const file of await walkFiles(staticDirectory)) {
            referencedFiles.add(path.relative(nextRoot, file));
        }
    }

    const publicFiles = await walkFiles(path.join(projectRoot, "public"));
    for (const file of publicFiles) {
        if (isBudgetedAsset(file)) {
            referencedFiles.add(path.relative(nextRoot, file));
        }
    }

    const normalizedFiles = [...referencedFiles]
        .filter(isBudgetedAsset)
        .map((file) => resolveAssetPath(file));
    const uniqueFiles = [...new Set(normalizedFiles)];
    const result = [];

    for (const file of uniqueFiles) {
        const details = await stat(file);
        result.push({
            path: path
                .relative(projectRoot, file)
                .replaceAll(path.sep, "/"),
            bytes: details.size,
        });
    }

    return result.sort((left, right) =>
        left.path.localeCompare(right.path)
    );
}

function collectStrings(value, target) {
    if (typeof value === "string") {
        target.add(value);
        return;
    }

    if (Array.isArray(value)) {
        value.forEach((item) => collectStrings(item, target));
        return;
    }

    if (value && typeof value === "object") {
        Object.values(value).forEach((item) =>
            collectStrings(item, target)
        );
    }
}

function resolveAssetPath(file) {
    if (file.startsWith("..")) {
        return path.resolve(nextRoot, file);
    }

    return path.resolve(nextRoot, file);
}

function isBudgetedAsset(file) {
    return /\.(?:js|css|woff2?|ttf|otf|png|jpe?g|webp|avif|gif|svg)$/i.test(
        file
    );
}

async function walkFiles(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const target = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            files.push(...(await walkFiles(target)));
        } else {
            files.push(target);
        }
    }

    return files;
}

async function exists(file) {
    try {
        await stat(file);
        return true;
    } catch {
        return false;
    }
}
