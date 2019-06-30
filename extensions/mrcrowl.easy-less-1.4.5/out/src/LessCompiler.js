"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const less = require("less");
const mkpath = require("mkpath");
const path = require("path");
const extend = require("extend");
const fs = require("fs");
const vscode = require("vscode");
const Configuration = require("./Configuration");
const FileOptionsParser = require("./FileOptionsParser");
const LessDocumentResolverPlugin_1 = require("./LessDocumentResolverPlugin");
const DEFAULT_EXT = ".css";
// compile the given less file
function compile(lessFile, content, defaults) {
    return __awaiter(this, void 0, void 0, function* () {
        const options = FileOptionsParser.parse(content, defaults);
        const lessPath = path.dirname(lessFile);
        // main is set: compile the referenced file instead
        if (options.main) {
            const mainFilePaths = resolveMainFilePaths(options.main, lessPath, lessFile);
            if (mainFilePaths && mainFilePaths.length > 0) {
                for (const filePath of mainFilePaths) {
                    const mainPath = path.parse(filePath);
                    const mainRootFileInfo = Configuration.getRootFileInfo(mainPath);
                    const mainDefaults = extend({}, defaults, { rootFileInfo: mainRootFileInfo });
                    const mainContent = yield readFilePromise(filePath, "utf-8");
                    yield compile(filePath, mainContent, mainDefaults);
                }
                return;
            }
        }
        // out
        if (options.out === null || options.out === false) {
            // is null or false: do not compile
            return;
        }
        const out = options.out;
        const extension = chooseExtension(options);
        const baseFilename = path.parse(lessFile).name;
        let cssRelativeFilename;
        if (typeof out === "string") {
            // out is set: output to the given file name
            // check whether is a folder first
            const interpolatedOut = intepolatePath(out);
            cssRelativeFilename = interpolatedOut;
            const lastCharacter = cssRelativeFilename.slice(-1);
            if (lastCharacter === '/' || lastCharacter === '\\') {
                cssRelativeFilename += baseFilename + extension;
            }
            else if (path.extname(cssRelativeFilename) === '') {
                cssRelativeFilename += extension;
            }
        }
        else {
            // out is not set: output to the same basename as the less file
            cssRelativeFilename = baseFilename + extension;
        }
        const cssFile = path.resolve(lessPath, cssRelativeFilename);
        delete options.out;
        // sourceMap
        let sourceMapFile;
        if (options.sourceMap) {
            // currently just has support for writing .map file to same directory
            const lessPath = path.parse(lessFile).dir;
            const cssPath = path.parse(cssFile).dir;
            const lessRelativeToCss = path.relative(cssPath, lessPath);
            const sourceMapOptions = {
                outputSourceFiles: false,
                sourceMapBasepath: lessPath,
                sourceMapFileInline: options.sourceMapFileInline,
                sourceMapRootpath: lessRelativeToCss,
            };
            if (!sourceMapOptions.sourceMapFileInline) {
                sourceMapFile = cssFile + '.map';
                sourceMapOptions.sourceMapURL = "./" + baseFilename + extension + ".map";
            }
            options.sourceMap = sourceMapOptions;
        }
        // plugins
        options.plugins = [];
        if (options.autoprefixer) {
            const LessPluginAutoPrefix = require('less-plugin-autoprefix');
            const browsers = cleanBrowsersList(options.autoprefixer);
            const autoprefixPlugin = new LessPluginAutoPrefix({ browsers });
            options.plugins.push(autoprefixPlugin);
        }
        options.plugins.push(new LessDocumentResolverPlugin_1.LessDocumentResolverPlugin());
        // set up the parser
        const output = yield less.render(content, options);
        yield writeFileContents(cssFile, output.css);
        if (output.map && sourceMapFile) {
            yield writeFileContents(sourceMapFile, output.map);
        }
    });
}
exports.compile = compile;
function cleanBrowsersList(autoprefixOption) {
    const browsers = Array.isArray(autoprefixOption) ?
        autoprefixOption :
        ("" + autoprefixOption).split(/,|;/);
    return browsers.map(browser => browser.trim());
}
function intepolatePath(path) {
    return path.replace(/\$\{workspaceRoot\}/g, vscode.workspace.rootPath);
}
function resolveMainFilePaths(main, lessPath, currentLessFile) {
    let mainFiles;
    if (typeof main === "string") {
        mainFiles = [main];
    }
    else if (Array.isArray(main)) {
        mainFiles = main;
    }
    else {
        mainFiles = [];
    }
    const interpolatedMainFilePaths = mainFiles.map(mainFile => intepolatePath(mainFile));
    const resolvedMainFilePaths = interpolatedMainFilePaths.map(mainFile => path.resolve(lessPath, mainFile));
    if (resolvedMainFilePaths.indexOf(currentLessFile) >= 0) {
        return []; // avoid infinite loops
    }
    return resolvedMainFilePaths;
}
// writes a file's contents in a path where directories may or may not yet exist
function writeFileContents(filepath, content) {
    return new Promise((resolve, reject) => {
        mkpath(path.dirname(filepath), err => {
            if (err) {
                return reject(err);
            }
            fs.writeFile(filepath, content, err => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    });
}
function readFilePromise(filename, encoding) {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, encoding, (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });
    });
}
function chooseExtension(options) {
    if (options && options.outExt) {
        if (options.outExt === "") {
            // special case for no extension (no idea if anyone would really want this?)
            return "";
        }
        return ensureDotPrefixed(options.outExt) || DEFAULT_EXT;
    }
    return DEFAULT_EXT;
}
function ensureDotPrefixed(extension) {
    if (extension.startsWith(".")) {
        return extension;
    }
    return extension ? `.${extension}` : "";
}
//# sourceMappingURL=LessCompiler.js.map