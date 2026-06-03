const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

function newestExisting(...relativePaths) {
    let newestPath = null;
    let newestTime = 0;

    for (const rel of relativePaths) {
        const full = path.join(root, rel);
        if (!fs.existsSync(full)) {
            continue;
        }
        const mtime = fs.statSync(full).mtimeMs;
        if (mtime >= newestTime) {
            newestTime = mtime;
            newestPath = full;
        }
    }

    return newestPath;
}

function copyFile(source, destination) {
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
}

function syncAssets() {
    const cssSource = newestExisting(
        "public/site.generated.css",
        "public/css/site.generated.css"
    );
    const cssMapSource = newestExisting(
        "public/site.generated.css.map",
        "public/css/site.generated.css.map"
    );

    if (cssSource) {
        copyFile(cssSource, path.join(root, "public/css/site.css"));
    }

    if (cssMapSource) {
        copyFile(cssMapSource, path.join(root, "public/css/site.css.map"));
    }

    const jsPairs = [
        ["public/site.js", "public/js/site.js"],
        ["public/site.js.map", "public/js/site.js.map"],
    ];

    for (const [from, to] of jsPairs) {
        const source = path.join(root, from);
        const destination = path.join(root, to);
        if (!fs.existsSync(source)) {
            continue;
        }
        copyFile(source, destination);
    }
}

function watchAssets() {
    syncAssets();

    const watchDirs = [
        path.join(root, "public"),
        path.join(root, "public/css"),
    ];

    for (const watchDir of watchDirs) {
        if (!fs.existsSync(watchDir)) {
            fs.mkdirSync(watchDir, { recursive: true });
        }
        fs.watch(watchDir, { persistent: true }, () => {
            syncAssets();
        });
    }

    console.log("Watching Parcel output and syncing to public/css/site.css and public/js/site.js...");
}

if (process.argv.includes("--watch")) {
    watchAssets();
} else {
    syncAssets();
}
