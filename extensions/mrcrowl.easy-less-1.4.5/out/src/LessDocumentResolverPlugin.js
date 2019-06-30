"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode = require("vscode");
class LessDocumentResolverPlugin {
    install(less, pluginManager) {
        pluginManager.addPreProcessor(new LessDocumentResolver());
    }
}
exports.LessDocumentResolverPlugin = LessDocumentResolverPlugin;
class LessDocumentResolver {
    process(src, extra) {
        const file = path.normalize(path.resolve(extra.fileInfo.entryPath, extra.fileInfo.filename));
        const document = vscode.workspace.textDocuments.find(document => document.fileName == file);
        if (document !== undefined)
            return document.getText();
        return src;
    }
}
//# sourceMappingURL=LessDocumentResolverPlugin.js.map