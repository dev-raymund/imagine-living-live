const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const MIN_BYTES = 1024;
const DEBOUNCE_MS = 300;

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

function isReady(filePath) {
    if (!filePath || !fs.existsSync(filePath)) {
        return false;
    }

    return fs.statSync(filePath).size >= MIN_BYTES;
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

    if (isReady(cssSource)) {
        copyFile(cssSource, path.join(root, "public/css/site.css"));
    }

    if (cssMapSource && isReady(cssMapSource)) {
        copyFile(cssMapSource, path.join(root, "public/css/site.css.map"));
    }

    const jsPairs = [
        ["public/site.js", "public/js/site.js"],
        ["public/site.js.map", "public/js/site.js.map"],
    ];

    for (const [from, to] of jsPairs) {
        const source = path.join(root, from);
        const destination = path.join(root, to);
        if (!isReady(source)) {
            continue;
        }
        copyFile(source, destination);
    }
}

let debounceTimer = null;

function scheduleSync() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(syncAssets, DEBOUNCE_MS);
}

function watchAssets() {
    syncAssets();

    const filesToWatch = [
        path.join(root, "public/site.generated.css"),
        path.join(root, "public/site.js"),
    ];

    for (const file of filesToWatch) {
        const watchTarget = () => {
            fs.watchFile(file, { interval: 500 }, (curr, prev) => {
                if (curr.mtimeMs !== prev.mtimeMs) {
                    scheduleSync();
                }
            });
        };

        if (fs.existsSync(file)) {
            watchTarget();
            continue;
        }

        const dir = path.dirname(file);
        fs.watch(dir, { persistent: true }, (_event, filename) => {
            if (filename === path.basename(file) && fs.existsSync(file)) {
                watchTarget();
                scheduleSync();
            }
        });
    }

    console.log(
        "Watching Parcel output and syncing to public/css/site.css and public/js/site.js..."
    );
}

if (process.argv.includes("--watch")) {
    watchAssets();
} else {
    syncAssets();
}
