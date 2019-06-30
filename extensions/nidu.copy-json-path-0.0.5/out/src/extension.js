'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const jsPathTo_1 = require("./jsPathTo");
const ncp = require("copy-paste");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "copy-json-path" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.copyJsonPath', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        try {
            const text = editor.document.getText();
            // JSON.parse(text)
            const path = jsPathTo_1.jsPathTo(text, editor.document.offsetAt(editor.selection.active));
            ncp.copy(path, () => {
                // vscode.window.showInformationMessage(`Path "${path}" copied to clipboard.`)
            });
        }
        catch (ex) {
            if (ex instanceof SyntaxError) {
                vscode.window.showErrorMessage(`Invalid JSON.`);
                console.error('Error in copy-json-path', ex);
            }
            else {
                vscode.window.showErrorMessage(`Couldn't copy path.`);
                console.error('Error in copy-json-path', ex);
            }
        }
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map