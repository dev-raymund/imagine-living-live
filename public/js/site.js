// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

(function (
  modules,
  entry,
  mainEntry,
  parcelRequireName,
  externals,
  distDir,
  publicUrl,
  devServer
) {
  /* eslint-disable no-undef */
  var globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : {};
  /* eslint-enable no-undef */

  // Save the require from previous bundle to this closure if any
  var previousRequire =
    typeof globalObject[parcelRequireName] === 'function' &&
    globalObject[parcelRequireName];

  var importMap = previousRequire.i || {};
  var cache = previousRequire.cache || {};
  // Do not use `require` to prevent Webpack from trying to bundle this call
  var nodeRequire =
    typeof module !== 'undefined' &&
    typeof module.require === 'function' &&
    module.require.bind(module);

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        if (externals[name]) {
          return externals[name];
        }
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire =
          typeof globalObject[parcelRequireName] === 'function' &&
          globalObject[parcelRequireName];
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error("Cannot find module '" + name + "'");
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = (cache[name] = new newRequire.Module(name));

      modules[name][0].call(
        module.exports,
        localRequire,
        module,
        module.exports,
        globalObject
      );
    }

    return cache[name].exports;

    function localRequire(x) {
      var res = localRequire.resolve(x);
      if (res === false) {
        return {};
      }
      // Synthesize a module to follow re-exports.
      if (Array.isArray(res)) {
        var m = {__esModule: true};
        res.forEach(function (v) {
          var key = v[0];
          var id = v[1];
          var exp = v[2] || v[0];
          var x = newRequire(id);
          if (key === '*') {
            Object.keys(x).forEach(function (key) {
              if (
                key === 'default' ||
                key === '__esModule' ||
                Object.prototype.hasOwnProperty.call(m, key)
              ) {
                return;
              }

              Object.defineProperty(m, key, {
                enumerable: true,
                get: function () {
                  return x[key];
                },
              });
            });
          } else if (exp === '*') {
            Object.defineProperty(m, key, {
              enumerable: true,
              value: x,
            });
          } else {
            Object.defineProperty(m, key, {
              enumerable: true,
              get: function () {
                if (exp === 'default') {
                  return x.__esModule ? x.default : x;
                }
                return x[exp];
              },
            });
          }
        });
        return m;
      }
      return newRequire(res);
    }

    function resolve(x) {
      var id = modules[name][1][x];
      return id != null ? id : x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.require = nodeRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.distDir = distDir;
  newRequire.publicUrl = publicUrl;
  newRequire.devServer = devServer;
  newRequire.i = importMap;
  newRequire.register = function (id, exports) {
    modules[id] = [
      function (require, module) {
        module.exports = exports;
      },
      {},
    ];
  };

  // Only insert newRequire.load when it is actually used.
  // The code in this file is linted against ES5, so dynamic import is not allowed.
  // INSERT_LOAD_HERE

  Object.defineProperty(newRequire, 'root', {
    get: function () {
      return globalObject[parcelRequireName];
    },
  });

  globalObject[parcelRequireName] = newRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (mainEntry) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(mainEntry);

    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
      module.exports = mainExports;

      // RequireJS
    } else if (typeof define === 'function' && define.amd) {
      define(function () {
        return mainExports;
      });
    }
  }
})({"bFOLx":[function(require,module,exports,__globalThis) {
var HMR_HOST = null;
var HMR_PORT = 1234;
var HMR_SERVER_PORT = 1234;
var HMR_SECURE = false;
var HMR_ENV_HASH = "781937b91c33557d";
var HMR_USE_SSE = false;
module.bundle.HMR_BUNDLE_ID = "54f6fc32e3bbba16";
"use strict";
/* global HMR_HOST, HMR_PORT, HMR_SERVER_PORT, HMR_ENV_HASH, HMR_SECURE, HMR_USE_SSE, chrome, browser, __parcel__import__, __parcel__importScripts__, ServiceWorkerGlobalScope */ /*::
import type {
  HMRAsset,
  HMRMessage,
} from '@parcel/reporter-dev-server/src/HMRServer.js';
interface ParcelRequire {
  (string): mixed;
  cache: {|[string]: ParcelModule|};
  hotData: {|[string]: mixed|};
  Module: any;
  parent: ?ParcelRequire;
  isParcelRequire: true;
  modules: {|[string]: [Function, {|[string]: string|}]|};
  HMR_BUNDLE_ID: string;
  root: ParcelRequire;
}
interface ParcelModule {
  hot: {|
    data: mixed,
    accept(cb: (Function) => void): void,
    dispose(cb: (mixed) => void): void,
    // accept(deps: Array<string> | string, cb: (Function) => void): void,
    // decline(): void,
    _acceptCallbacks: Array<(Function) => void>,
    _disposeCallbacks: Array<(mixed) => void>,
  |};
}
interface ExtensionContext {
  runtime: {|
    reload(): void,
    getURL(url: string): string;
    getManifest(): {manifest_version: number, ...};
  |};
}
declare var module: {bundle: ParcelRequire, ...};
declare var HMR_HOST: string;
declare var HMR_PORT: string;
declare var HMR_SERVER_PORT: string;
declare var HMR_ENV_HASH: string;
declare var HMR_SECURE: boolean;
declare var HMR_USE_SSE: boolean;
declare var chrome: ExtensionContext;
declare var browser: ExtensionContext;
declare var __parcel__import__: (string) => Promise<void>;
declare var __parcel__importScripts__: (string) => Promise<void>;
declare var globalThis: typeof self;
declare var ServiceWorkerGlobalScope: Object;
*/ var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;
function Module(moduleName) {
    OldModule.call(this, moduleName);
    this.hot = {
        data: module.bundle.hotData[moduleName],
        _acceptCallbacks: [],
        _disposeCallbacks: [],
        accept: function(fn) {
            this._acceptCallbacks.push(fn || function() {});
        },
        dispose: function(fn) {
            this._disposeCallbacks.push(fn);
        }
    };
    module.bundle.hotData[moduleName] = undefined;
}
module.bundle.Module = Module;
module.bundle.hotData = {};
var checkedAssets /*: {|[string]: boolean|} */ , disposedAssets /*: {|[string]: boolean|} */ , assetsToDispose /*: Array<[ParcelRequire, string]> */ , assetsToAccept /*: Array<[ParcelRequire, string]> */ , bundleNotFound = false;
function getHostname() {
    return HMR_HOST || (typeof location !== 'undefined' && location.protocol.indexOf('http') === 0 ? location.hostname : 'localhost');
}
function getPort() {
    return HMR_PORT || (typeof location !== 'undefined' ? location.port : HMR_SERVER_PORT);
}
// eslint-disable-next-line no-redeclare
let WebSocket = globalThis.WebSocket;
if (!WebSocket && typeof module.bundle.root === 'function') try {
    // eslint-disable-next-line no-global-assign
    WebSocket = module.bundle.root('ws');
} catch  {
// ignore.
}
var hostname = getHostname();
var port = getPort();
var protocol = HMR_SECURE || typeof location !== 'undefined' && location.protocol === 'https:' && ![
    'localhost',
    '127.0.0.1',
    '0.0.0.0'
].includes(hostname) ? 'wss' : 'ws';
// eslint-disable-next-line no-redeclare
var parent = module.bundle.parent;
if (!parent || !parent.isParcelRequire) {
    // Web extension context
    var extCtx = typeof browser === 'undefined' ? typeof chrome === 'undefined' ? null : chrome : browser;
    // Safari doesn't support sourceURL in error stacks.
    // eval may also be disabled via CSP, so do a quick check.
    var supportsSourceURL = false;
    try {
        (0, eval)('throw new Error("test"); //# sourceURL=test.js');
    } catch (err) {
        supportsSourceURL = err.stack.includes('test.js');
    }
    var ws;
    if (HMR_USE_SSE) ws = new EventSource('/__parcel_hmr');
    else try {
        // If we're running in the dev server's node runner, listen for messages on the parent port.
        let { workerData, parentPort } = module.bundle.root('node:worker_threads') /*: any*/ ;
        if (workerData !== null && workerData !== void 0 && workerData.__parcel) {
            parentPort.on('message', async (message)=>{
                try {
                    await handleMessage(message);
                    parentPort.postMessage('updated');
                } catch  {
                    parentPort.postMessage('restart');
                }
            });
            // After the bundle has finished running, notify the dev server that the HMR update is complete.
            queueMicrotask(()=>parentPort.postMessage('ready'));
        }
    } catch  {
        if (typeof WebSocket !== 'undefined') try {
            ws = new WebSocket(protocol + '://' + hostname + (port ? ':' + port : '') + '/');
        } catch (err) {
            // Ignore cloudflare workers error.
            if (err.message && !err.message.includes('Disallowed operation called within global scope')) console.error(err.message);
        }
    }
    if (ws) {
        // $FlowFixMe
        ws.onmessage = async function(event /*: {data: string, ...} */ ) {
            var data /*: HMRMessage */  = JSON.parse(event.data);
            await handleMessage(data);
        };
        if (ws instanceof WebSocket) {
            ws.onerror = function(e) {
                if (e.message) console.error(e.message);
            };
            ws.onclose = function() {
                console.warn("[parcel] \uD83D\uDEA8 Connection to the HMR server was lost");
            };
        }
    }
}
async function handleMessage(data /*: HMRMessage */ ) {
    checkedAssets = {} /*: {|[string]: boolean|} */ ;
    disposedAssets = {} /*: {|[string]: boolean|} */ ;
    assetsToAccept = [];
    assetsToDispose = [];
    bundleNotFound = false;
    if (data.type === 'reload') fullReload();
    else if (data.type === 'update') {
        // Remove error overlay if there is one
        if (typeof document !== 'undefined') removeErrorOverlay();
        let assets = data.assets;
        // Handle HMR Update
        let handled = assets.every((asset)=>{
            return asset.type === 'css' || asset.type === 'js' && hmrAcceptCheck(module.bundle.root, asset.id, asset.depsByBundle);
        });
        // Dispatch a custom event in case a bundle was not found. This might mean
        // an asset on the server changed and we should reload the page. This event
        // gives the client an opportunity to refresh without losing state
        // (e.g. via React Server Components). If e.preventDefault() is not called,
        // we will trigger a full page reload.
        if (handled && bundleNotFound && assets.some((a)=>a.envHash !== HMR_ENV_HASH) && typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') handled = !window.dispatchEvent(new CustomEvent('parcelhmrreload', {
            cancelable: true
        }));
        if (handled) {
            console.clear();
            // Dispatch custom event so other runtimes (e.g React Refresh) are aware.
            if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') window.dispatchEvent(new CustomEvent('parcelhmraccept'));
            await hmrApplyUpdates(assets);
            hmrDisposeQueue();
            // Run accept callbacks. This will also re-execute other disposed assets in topological order.
            let processedAssets = {};
            for(let i = 0; i < assetsToAccept.length; i++){
                let id = assetsToAccept[i][1];
                if (!processedAssets[id]) {
                    hmrAccept(assetsToAccept[i][0], id);
                    processedAssets[id] = true;
                }
            }
        } else fullReload();
    }
    if (data.type === 'error') {
        // Log parcel errors to console
        for (let ansiDiagnostic of data.diagnostics.ansi){
            let stack = ansiDiagnostic.codeframe ? ansiDiagnostic.codeframe : ansiDiagnostic.stack;
            console.error("\uD83D\uDEA8 [parcel]: " + ansiDiagnostic.message + '\n' + stack + '\n\n' + ansiDiagnostic.hints.join('\n'));
        }
        if (typeof document !== 'undefined') {
            // Render the fancy html overlay
            removeErrorOverlay();
            var overlay = createErrorOverlay(data.diagnostics.html);
            // $FlowFixMe
            document.body.appendChild(overlay);
        }
    }
}
function removeErrorOverlay() {
    var overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {
        overlay.remove();
        console.log("[parcel] \u2728 Error resolved");
    }
}
function createErrorOverlay(diagnostics) {
    var overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    let errorHTML = '<div style="background: black; opacity: 0.85; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; font-family: Menlo, Consolas, monospace; z-index: 9999;">';
    for (let diagnostic of diagnostics){
        let stack = diagnostic.frames.length ? diagnostic.frames.reduce((p, frame)=>{
            return `${p}
<a href="${protocol === 'wss' ? 'https' : 'http'}://${hostname}:${port}/__parcel_launch_editor?file=${encodeURIComponent(frame.location)}" style="text-decoration: underline; color: #888" onclick="fetch(this.href); return false">${frame.location}</a>
${frame.code}`;
        }, '') : diagnostic.stack;
        errorHTML += `
      <div>
        <div style="font-size: 18px; font-weight: bold; margin-top: 20px;">
          \u{1F6A8} ${diagnostic.message}
        </div>
        <pre>${stack}</pre>
        <div>
          ${diagnostic.hints.map((hint)=>"<div>\uD83D\uDCA1 " + hint + '</div>').join('')}
        </div>
        ${diagnostic.documentation ? `<div>\u{1F4DD} <a style="color: violet" href="${diagnostic.documentation}" target="_blank">Learn more</a></div>` : ''}
      </div>
    `;
    }
    errorHTML += '</div>';
    overlay.innerHTML = errorHTML;
    return overlay;
}
function fullReload() {
    if (typeof location !== 'undefined' && 'reload' in location) location.reload();
    else if (typeof extCtx !== 'undefined' && extCtx && extCtx.runtime && extCtx.runtime.reload) extCtx.runtime.reload();
    else try {
        let { workerData, parentPort } = module.bundle.root('node:worker_threads') /*: any*/ ;
        if (workerData !== null && workerData !== void 0 && workerData.__parcel) parentPort.postMessage('restart');
    } catch (err) {
        console.error("[parcel] \u26A0\uFE0F An HMR update was not accepted. Please restart the process.");
    }
}
function getParents(bundle, id) /*: Array<[ParcelRequire, string]> */ {
    var modules = bundle.modules;
    if (!modules) return [];
    var parents = [];
    var k, d, dep;
    for(k in modules)for(d in modules[k][1]){
        dep = modules[k][1][d];
        if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) parents.push([
            bundle,
            k
        ]);
    }
    if (bundle.parent) parents = parents.concat(getParents(bundle.parent, id));
    return parents;
}
function updateLink(link) {
    var href = link.getAttribute('href');
    if (!href) return;
    var newLink = link.cloneNode();
    newLink.onload = function() {
        if (link.parentNode !== null) // $FlowFixMe
        link.parentNode.removeChild(link);
    };
    newLink.setAttribute('href', // $FlowFixMe
    href.split('?')[0] + '?' + Date.now());
    // $FlowFixMe
    link.parentNode.insertBefore(newLink, link.nextSibling);
}
var cssTimeout = null;
function reloadCSS() {
    if (cssTimeout || typeof document === 'undefined') return;
    cssTimeout = setTimeout(function() {
        var links = document.querySelectorAll('link[rel="stylesheet"]');
        for(var i = 0; i < links.length; i++){
            // $FlowFixMe[incompatible-type]
            var href /*: string */  = links[i].getAttribute('href');
            var hostname = getHostname();
            var servedFromHMRServer = hostname === 'localhost' ? new RegExp('^(https?:\\/\\/(0.0.0.0|127.0.0.1)|localhost):' + getPort()).test(href) : href.indexOf(hostname + ':' + getPort());
            var absolute = /^https?:\/\//i.test(href) && href.indexOf(location.origin) !== 0 && !servedFromHMRServer;
            if (!absolute) updateLink(links[i]);
        }
        cssTimeout = null;
    }, 50);
}
function hmrDownload(asset) {
    if (asset.type === 'js') {
        if (typeof document !== 'undefined') {
            let script = document.createElement('script');
            script.src = asset.url + '?t=' + Date.now();
            if (asset.outputFormat === 'esmodule') script.type = 'module';
            return new Promise((resolve, reject)=>{
                var _document$head;
                script.onload = ()=>resolve(script);
                script.onerror = reject;
                (_document$head = document.head) === null || _document$head === void 0 || _document$head.appendChild(script);
            });
        } else if (typeof importScripts === 'function') {
            // Worker scripts
            if (asset.outputFormat === 'esmodule') return import(asset.url + '?t=' + Date.now());
            else return new Promise((resolve, reject)=>{
                try {
                    importScripts(asset.url + '?t=' + Date.now());
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        }
    }
}
async function hmrApplyUpdates(assets) {
    global.parcelHotUpdate = Object.create(null);
    let scriptsToRemove;
    try {
        // If sourceURL comments aren't supported in eval, we need to load
        // the update from the dev server over HTTP so that stack traces
        // are correct in errors/logs. This is much slower than eval, so
        // we only do it if needed (currently just Safari).
        // https://bugs.webkit.org/show_bug.cgi?id=137297
        // This path is also taken if a CSP disallows eval.
        if (!supportsSourceURL) {
            let promises = assets.map((asset)=>{
                var _hmrDownload;
                return (_hmrDownload = hmrDownload(asset)) === null || _hmrDownload === void 0 ? void 0 : _hmrDownload.catch((err)=>{
                    // Web extension fix
                    if (extCtx && extCtx.runtime && extCtx.runtime.getManifest().manifest_version == 3 && typeof ServiceWorkerGlobalScope != 'undefined' && global instanceof ServiceWorkerGlobalScope) {
                        extCtx.runtime.reload();
                        return;
                    }
                    throw err;
                });
            });
            scriptsToRemove = await Promise.all(promises);
        }
        assets.forEach(function(asset) {
            hmrApply(module.bundle.root, asset);
        });
    } finally{
        delete global.parcelHotUpdate;
        if (scriptsToRemove) scriptsToRemove.forEach((script)=>{
            if (script) {
                var _document$head2;
                (_document$head2 = document.head) === null || _document$head2 === void 0 || _document$head2.removeChild(script);
            }
        });
    }
}
function hmrApply(bundle /*: ParcelRequire */ , asset /*:  HMRAsset */ ) {
    var modules = bundle.modules;
    if (!modules) return;
    if (asset.type === 'css') reloadCSS();
    else if (asset.type === 'js') {
        let deps = asset.depsByBundle[bundle.HMR_BUNDLE_ID];
        if (deps) {
            if (modules[asset.id]) {
                // Remove dependencies that are removed and will become orphaned.
                // This is necessary so that if the asset is added back again, the cache is gone, and we prevent a full page reload.
                let oldDeps = modules[asset.id][1];
                for(let dep in oldDeps)if (!deps[dep] || deps[dep] !== oldDeps[dep]) {
                    let id = oldDeps[dep];
                    let parents = getParents(module.bundle.root, id);
                    if (parents.length === 1) hmrDelete(module.bundle.root, id);
                }
            }
            if (supportsSourceURL) // Global eval. We would use `new Function` here but browser
            // support for source maps is better with eval.
            (0, eval)(asset.output);
            // $FlowFixMe
            let fn = global.parcelHotUpdate[asset.id];
            modules[asset.id] = [
                fn,
                deps
            ];
        }
        // Always traverse to the parent bundle, even if we already replaced the asset in this bundle.
        // This is required in case modules are duplicated. We need to ensure all instances have the updated code.
        if (bundle.parent) hmrApply(bundle.parent, asset);
    }
}
function hmrDelete(bundle, id) {
    let modules = bundle.modules;
    if (!modules) return;
    if (modules[id]) {
        // Collect dependencies that will become orphaned when this module is deleted.
        let deps = modules[id][1];
        let orphans = [];
        for(let dep in deps){
            let parents = getParents(module.bundle.root, deps[dep]);
            if (parents.length === 1) orphans.push(deps[dep]);
        }
        // Delete the module. This must be done before deleting dependencies in case of circular dependencies.
        delete modules[id];
        delete bundle.cache[id];
        // Now delete the orphans.
        orphans.forEach((id)=>{
            hmrDelete(module.bundle.root, id);
        });
    } else if (bundle.parent) hmrDelete(bundle.parent, id);
}
function hmrAcceptCheck(bundle /*: ParcelRequire */ , id /*: string */ , depsByBundle /*: ?{ [string]: { [string]: string } }*/ ) {
    checkedAssets = {};
    if (hmrAcceptCheckOne(bundle, id, depsByBundle)) return true;
    // Traverse parents breadth first. All possible ancestries must accept the HMR update, or we'll reload.
    let parents = getParents(module.bundle.root, id);
    let accepted = false;
    while(parents.length > 0){
        let v = parents.shift();
        let a = hmrAcceptCheckOne(v[0], v[1], null);
        if (a) // If this parent accepts, stop traversing upward, but still consider siblings.
        accepted = true;
        else if (a !== null) {
            // Otherwise, queue the parents in the next level upward.
            let p = getParents(module.bundle.root, v[1]);
            if (p.length === 0) {
                // If there are no parents, then we've reached an entry without accepting. Reload.
                accepted = false;
                break;
            }
            parents.push(...p);
        }
    }
    return accepted;
}
function hmrAcceptCheckOne(bundle /*: ParcelRequire */ , id /*: string */ , depsByBundle /*: ?{ [string]: { [string]: string } }*/ ) {
    var modules = bundle.modules;
    if (!modules) return;
    if (depsByBundle && !depsByBundle[bundle.HMR_BUNDLE_ID]) {
        // If we reached the root bundle without finding where the asset should go,
        // there's nothing to do. Mark as "accepted" so we don't reload the page.
        if (!bundle.parent) {
            bundleNotFound = true;
            return true;
        }
        return hmrAcceptCheckOne(bundle.parent, id, depsByBundle);
    }
    if (checkedAssets[id]) return null;
    checkedAssets[id] = true;
    var cached = bundle.cache[id];
    if (!cached) return true;
    assetsToDispose.push([
        bundle,
        id
    ]);
    if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
        assetsToAccept.push([
            bundle,
            id
        ]);
        return true;
    }
    return false;
}
function hmrDisposeQueue() {
    // Dispose all old assets.
    for(let i = 0; i < assetsToDispose.length; i++){
        let id = assetsToDispose[i][1];
        if (!disposedAssets[id]) {
            hmrDispose(assetsToDispose[i][0], id);
            disposedAssets[id] = true;
        }
    }
    assetsToDispose = [];
}
function hmrDispose(bundle /*: ParcelRequire */ , id /*: string */ ) {
    var cached = bundle.cache[id];
    bundle.hotData[id] = {};
    if (cached && cached.hot) cached.hot.data = bundle.hotData[id];
    if (cached && cached.hot && cached.hot._disposeCallbacks.length) cached.hot._disposeCallbacks.forEach(function(cb) {
        cb(bundle.hotData[id]);
    });
    delete bundle.cache[id];
}
function hmrAccept(bundle /*: ParcelRequire */ , id /*: string */ ) {
    // Execute the module.
    bundle(id);
    // Run the accept callbacks in the new version of the module.
    var cached = bundle.cache[id];
    if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
        let assetsToAlsoAccept = [];
        cached.hot._acceptCallbacks.forEach(function(cb) {
            let additionalAssets = cb(function() {
                return getParents(module.bundle.root, id);
            });
            if (Array.isArray(additionalAssets) && additionalAssets.length) assetsToAlsoAccept.push(...additionalAssets);
        });
        if (assetsToAlsoAccept.length) {
            let handled = assetsToAlsoAccept.every(function(a) {
                return hmrAcceptCheck(a[0], a[1]);
            });
            if (!handled) return fullReload();
            hmrDisposeQueue();
        }
    }
}

},{}],"4syVt":[function(require,module,exports,__globalThis) {
var _js = require("./**/*.js");
var _js1 = require("../views/**/*.js");

},{"./**/*.js":"kue2I","../views/**/*.js":"lW7RH"}],"kue2I":[function(require,module,exports,__globalThis) {
const _temp0 = require("b49ad3a16b3ec224");
module.exports = {
    "site": _temp0
};

},{"b49ad3a16b3ec224":"4syVt"}],"lW7RH":[function(require,module,exports,__globalThis) {
const _temp0 = require("7e5b022b8402ef00");
const _temp1 = require("185d30e8f56d90d9");
const _temp2 = require("7a8d645b3448183f");
const _temp3 = require("504d3bff24faf8f6");
const _temp4 = require("78c59b7a1f70173c");
module.exports = {
    "components": {
        "accordion": {
            "accordion": _temp0
        },
        "developments": {
            "developmentDetail": _temp1
        },
        "logosbar": {
            "logosBar": _temp2
        },
        "nav": {
            "navigation": _temp3
        },
        "showcasecard": {
            "cards": _temp4
        }
    }
};

},{"7e5b022b8402ef00":"gA3F7","185d30e8f56d90d9":"72PMK","7a8d645b3448183f":"bYZLb","504d3bff24faf8f6":"WcXmF","78c59b7a1f70173c":"3EHp7"}],"gA3F7":[function(require,module,exports,__globalThis) {
const accordionItems = document.querySelectorAll(".accordion__item");
if (accordionItems.length) {
    accordionItems.forEach((item)=>{
        const accordionHeader = item.querySelector(".accordion__header");
        accordionHeader.addEventListener("click", ()=>{
            const openItem = document.querySelector(".accordion-open");
            toggleItem(item);
            // comment to disable one item open at a time
            if (openItem && openItem !== item) toggleItem(openItem);
        });
    });
    const toggleItem = (item)=>{
        const accordionContent = item.querySelector(".accordion__content");
        if (item.classList.contains("accordion-open")) {
            accordionContent.removeAttribute("style");
            item.classList.remove("accordion-open");
        } else {
            accordionContent.style.height = accordionContent.scrollHeight + "px";
            item.classList.add("accordion-open");
        }
    };
}

},{}],"72PMK":[function(require,module,exports,__globalThis) {
const developmentGallery = document.querySelector(".development-detail__gallery");
if (developmentGallery && window.Swiper) {
    const galleryId = developmentGallery.dataset.id;
    const galleryNodes = developmentGallery.querySelectorAll(".js-development-gallery__content");
    if (galleryNodes.length && window.LuminousGallery) new LuminousGallery(galleryNodes, {
        arrowNavigation: true
    }, {
        arrowNavigation: true,
        onOpen () {
            document.body.style.overflow = "hidden";
        },
        onClose () {
            document.body.style.overflow = "visible";
        }
    });
    const gallerySlider = new Swiper(`.development-detail__gallery-slider[data-id="${galleryId}"]`, {
        spaceBetween: 0,
        centeredSlides: false,
        loop: galleryNodes.length > 1,
        direction: "horizontal",
        loopedSlides: 3,
        resizeObserver: true
    });
    const galleryThumbsEl = developmentGallery.querySelector(`.development-detail__gallery-thumbs[data-id="${galleryId}"]`);
    if (galleryThumbsEl) {
        const galleryThumbs = new Swiper(galleryThumbsEl, {
            spaceBetween: 0,
            centeredSlides: true,
            loop: galleryNodes.length > 1,
            slideToClickedSlide: true,
            direction: "horizontal",
            slidesPerView: 3
        });
        gallerySlider.controller.control = galleryThumbs;
        galleryThumbs.controller.control = gallerySlider;
    }
}
const panelTitles = {
    description: "Description",
    "key-features": "Key features",
    "material-information": "Material information"
};
const panel = document.getElementById("development-panel");
const panelBackdrop = document.getElementById("development-panel-backdrop");
const panelBody = document.getElementById("development-panel-body");
const panelTitle = document.getElementById("development-panel-title");
const panelClose = document.querySelector(".development-detail__panel-close");
const openDevelopmentPanel = (panelId)=>{
    const template = document.getElementById(`development-panel-${panelId}`);
    if (!panel || !template || !panelBody || !panelTitle) return;
    panelTitle.textContent = panelTitles[panelId] || "";
    panelBody.innerHTML = template.innerHTML;
    panel.classList.add("development-detail__panel--open");
    panel.setAttribute("aria-hidden", "false");
    if (panelBackdrop) panelBackdrop.hidden = false;
    document.body.style.overflow = "hidden";
};
const closeDevelopmentPanel = ()=>{
    if (!panel) return;
    panel.classList.remove("development-detail__panel--open");
    panel.setAttribute("aria-hidden", "true");
    if (panelBackdrop) panelBackdrop.hidden = true;
    if (panelBody) panelBody.innerHTML = "";
    document.body.style.overflow = "";
};
document.querySelectorAll("[data-development-panel]").forEach((trigger)=>{
    trigger.addEventListener("click", ()=>{
        openDevelopmentPanel(trigger.dataset.developmentPanel);
    });
});
panelClose?.addEventListener("click", closeDevelopmentPanel);
panelBackdrop?.addEventListener("click", closeDevelopmentPanel);
document.addEventListener("keydown", (event)=>{
    if (event.key === "Escape" && panel?.classList.contains("development-detail__panel--open")) closeDevelopmentPanel();
});
const initDevelopmentMap = ()=>{
    const mapElement = document.getElementById("development-map");
    const L = window.L;
    if (!mapElement || !L) return;
    const latitude = parseFloat(mapElement.dataset.lat);
    const longitude = parseFloat(mapElement.dataset.lng);
    const title = mapElement.dataset.title || "Development";
    const markerNodes = mapElement.querySelectorAll("[data-marker-type]");
    const markers = Array.from(markerNodes).map((node)=>({
            type: node.dataset.markerType,
            name: node.dataset.name,
            distance: node.dataset.distance,
            lat: parseFloat(node.dataset.lat),
            lng: parseFloat(node.dataset.lng)
        }));
    const pinIcons = {
        development: L.divIcon({
            className: "development-detail__pin development-detail__pin--development",
            html: '<span aria-hidden="true"></span>',
            iconSize: [
                32,
                32
            ],
            iconAnchor: [
                16,
                32
            ],
            popupAnchor: [
                0,
                -30
            ]
        }),
        station: L.divIcon({
            className: "development-detail__pin development-detail__pin--station",
            html: '<span aria-hidden="true"></span>',
            iconSize: [
                28,
                28
            ],
            iconAnchor: [
                14,
                28
            ],
            popupAnchor: [
                0,
                -26
            ]
        }),
        school: L.divIcon({
            className: "development-detail__pin development-detail__pin--school",
            html: '<span aria-hidden="true"></span>',
            iconSize: [
                28,
                28
            ],
            iconAnchor: [
                14,
                28
            ],
            popupAnchor: [
                0,
                -26
            ]
        })
    };
    const map = L.map(mapElement, {
        scrollWheelZoom: false,
        zoomControl: true
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18
    }).addTo(map);
    const markerRegistry = [];
    const addMarker = (point, type)=>{
        if (Number.isNaN(point.lat) || Number.isNaN(point.lng)) return;
        const marker = L.marker([
            point.lat,
            point.lng
        ], {
            icon: pinIcons[type],
            title: point.name
        });
        const distanceLine = point.distance ? `<br><span>${point.distance}</span>` : "";
        marker.bindPopup(`<strong>${point.name}</strong>${distanceLine}`);
        markerRegistry.push({
            marker,
            type
        });
    };
    if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) addMarker({
        lat: latitude,
        lng: longitude,
        name: title,
        distance: ""
    }, "development");
    markers.forEach((point)=>{
        if (point.type === "station" || point.type === "school") addMarker(point, point.type);
    });
    const views = {
        stations: [
            "development",
            "station"
        ],
        schools: [
            "development",
            "school"
        ]
    };
    let activeView = "stations";
    const fitActiveView = ()=>{
        const visibleMarkers = markerRegistry.filter(({ type })=>views[activeView].includes(type)).map(({ marker })=>marker);
        if (visibleMarkers.length === 0) {
            if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) map.setView([
                latitude,
                longitude
            ], 15);
            return;
        }
        const bounds = L.featureGroup(visibleMarkers).getBounds().pad(0.2);
        map.fitBounds(bounds, {
            maxZoom: 15
        });
    };
    const setView = (view)=>{
        activeView = view;
        markerRegistry.forEach(({ marker, type })=>{
            if (views[view].includes(type)) marker.addTo(map);
            else map.removeLayer(marker);
        });
        fitActiveView();
    };
    setView("stations");
    const tabs = document.querySelectorAll(".development-detail__map-tab");
    tabs.forEach((tab)=>{
        tab.addEventListener("click", ()=>{
            const view = tab.dataset.mapView;
            if (!view || view === activeView) return;
            tabs.forEach((button)=>{
                const isActive = button === tab;
                button.classList.toggle("development-detail__map-tab--active", isActive);
                button.setAttribute("aria-selected", isActive ? "true" : "false");
            });
            setView(view);
        });
    });
    window.addEventListener("resize", ()=>{
        map.invalidateSize();
        fitActiveView();
    });
};
window.initDevelopmentMap = initDevelopmentMap;
if (window.L) initDevelopmentMap();

},{}],"bYZLb":[function(require,module,exports,__globalThis) {
const swiper = new Swiper(".swiper", {
    slidesPerView: 1,
    loop: true,
    autoplay: {
        delay: 2500,
        disableOnInteraction: false
    },
    breakpoints: {
        // when window width is <= 540px
        540: {
            slidesPerView: 2
        },
        // when window width is <= 1024px
        1024: {
            slidesPerView: 3
        }
    }
});

},{}],"WcXmF":[function(require,module,exports,__globalThis) {
const mobileNav = document.querySelector(".js-mobile-nav");
const hamburgerMenu = document.querySelectorAll(".js-hamburger-menu");
// const navbarLinks = document.querySelectorAll(".js-anchor");
let mobileMenuOpen = false;
hamburgerMenu.forEach((menu)=>{
    menu.addEventListener("click", ()=>{
        mobileMenuOpen = !mobileMenuOpen;
        if (mobileMenuOpen) {
            mobileNav.classList.remove("mobile-nav-closed");
            mobileNav.classList.add("mobile-nav-open");
        } else {
            mobileNav.classList.add("mobile-nav-closed");
            mobileNav.classList.remove("mobile-nav-open");
        }
    });
}); // navbarLinks.forEach((elem) => elem.addEventListener("click", navbarLinkClick));
 // function navbarLinkClick(event) {
 //     if (window.location.pathname === "/") {
 //         smoothScroll(event);
 //     } else document.location.href = "/";
 // }
 // function smoothScroll(event) {
 //     event.preventDefault();
 //     const targetId = event.currentTarget.getAttribute("href");
 //     const targetPosition = document.querySelector(targetId).offsetTop;
 //     const startPosition = window.pageYOffset;
 //     const distance = targetPosition - startPosition;
 //     const duration = 1000;
 //     let start = null;
 //     window.requestAnimationFrame(step);
 //     function step(timestamp) {
 //         if (!start) start = timestamp;
 //         const progress = timestamp - start;
 //         window.scrollTo(
 //             0,
 //             easeInOutCubic(progress, startPosition, distance, duration)
 //         );
 //         if (progress < duration) window.requestAnimationFrame(step);
 //     }
 // }
 // // Easing Functions
 // function easeInOutCubic(t, b, c, d) {
 //     t /= d / 2;
 //     if (t < 1) return (c / 2) * t * t * t + b;
 //     t -= 2;
 //     return (c / 2) * (t * t * t + 2) + b;
 // }

},{}],"3EHp7":[function(require,module,exports,__globalThis) {
/* product left start */ const showcaseCards = document.querySelectorAll(".showcase-card");
if (showcaseCards.length) showcaseCards.forEach((showcaseCard)=>{
    const galleryNodes = showcaseCard.querySelectorAll(`.js-grid-gallery__content`);
    console.log(galleryNodes);
    const galleryOpts = {
        arrowNavigation: true
    };
    const options = {
        arrowNavigation: true,
        onOpen: function() {
            document.body.style.overflow = "hidden";
        },
        onClose: function() {
            document.body.style.overflow = "visible";
        }
    };
    if (galleryNodes.length) new LuminousGallery(galleryNodes, galleryOpts, options);
    const cardSlider = new Swiper(`.showcase-card-slider[data-id="${showcaseCard.dataset.id}"]`, {
        spaceBetween: 0,
        centeredSlides: false,
        loop: true,
        direction: "horizontal",
        loopedSlides: 3,
        resizeObserver: true
    });
    const cardThumbs = new Swiper(`.showcase-card-thumbs[data-id="${showcaseCard.dataset.id}"]`, {
        spaceBetween: 0,
        centeredSlides: true,
        loop: true,
        slideToClickedSlide: true,
        direction: "horizontal",
        slidesPerView: 3
    });
    cardSlider.controller.control = cardThumbs;
    cardThumbs.controller.control = cardSlider;
    const anchor = showcaseCard.querySelector(`.js-showcase-card__expand[data-id="${showcaseCard.dataset.id}"]`);
    const descriptions = showcaseCard.querySelector(`.js-showcase-card__description[data-id="${showcaseCard.dataset.id}"]`);
    if (!anchor || !descriptions) return;
    anchor.addEventListener("click", (event)=>{
        event.preventDefault();
        event.stopPropagation();
        const expanded = descriptions.classList.contains("showcase-card__description");
        if (expanded) {
            descriptions.classList.remove("showcase-card__description");
            descriptions.classList.add("showcase-card__description--expand");
            anchor.textContent = "Read less";
        } else {
            descriptions.classList.add("showcase-card__description");
            descriptions.classList.remove("showcase-card__description--expand");
            anchor.textContent = "Read more";
        }
    });
});

},{}]},["bFOLx","4syVt"], "4syVt", "parcelRequire2e80", {})

//# sourceMappingURL=site.js.map
