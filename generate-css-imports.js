const fs = require("fs");
const path = require("path");

const root = __dirname;
const cssDir = path.join(root, "resources/css");
const viewsDir = path.join(root, "resources/views");
const outputFile = path.join(cssDir, "site.generated.css");

function walkCssFiles(dir) {
    const files = [];

    if (!fs.existsSync(dir)) {
        return files;
    }

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            files.push(...walkCssFiles(fullPath));
            continue;
        }

        if (!entry.name.endsWith(".css") || entry.name === "site.generated.css") {
            continue;
        }

        files.push(path.relative(cssDir, fullPath).replace(/\\/g, "/"));
    }

    return files;
}

function importPriority(file) {
    if (file.startsWith("defaults/")) {
        return 0;
    }

    if (file === "luminous-basic.css") {
        return 1;
    }

    if (file === "site.css") {
        return 2;
    }

    if (file === "tailwind.css") {
        return 3;
    }

    if (file === "typography.css") {
        return 4;
    }

    if (file.startsWith("views/")) {
        return 5;
    }

    if (file.startsWith("../views/")) {
        return 6;
    }

    return 7;
}

const imports = [
    ...new Set([...walkCssFiles(cssDir), ...walkCssFiles(viewsDir)]),
]
    .filter((file) => file !== "site.generated.css")
    .sort((a, b) => {
        const priorityDiff = importPriority(a) - importPriority(b);

        if (priorityDiff !== 0) {
            return priorityDiff;
        }

        return a.localeCompare(b);
    });

const content = `${imports.map((file) => `@import "${file}";`).join("\n")}\n`;

fs.writeFileSync(outputFile, content);
console.log(`Wrote ${imports.length} CSS imports to resources/css/site.generated.css`);
