const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

const copies = [
    ["public/site.generated.css", "public/css/site.css"],
    ["public/site.generated.css.map", "public/css/site.css.map"],
    ["public/site.js", "public/js/site.js"],
    ["public/site.js.map", "public/js/site.js.map"],
];

function syncAssets() {
    for (const [from, to] of copies) {
        const source = path.join(root, from);
        const destination = path.join(root, to);

        if (!fs.existsSync(source)) {
            continue;
        }

        fs.mkdirSync(path.dirname(destination), { recursive: true });
        fs.copyFileSync(source, destination);
    }
}

function watchAssets() {
    syncAssets();

    const watchDir = path.join(root, "public");

    if (!fs.existsSync(watchDir)) {
        fs.mkdirSync(watchDir, { recursive: true });
    }

    fs.watch(watchDir, { persistent: true }, () => {
        syncAssets();
    });

    console.log("Watching Parcel output and syncing to public/css and public/js...");
}

if (process.argv.includes("--watch")) {
    watchAssets();
} else {
    syncAssets();
}
