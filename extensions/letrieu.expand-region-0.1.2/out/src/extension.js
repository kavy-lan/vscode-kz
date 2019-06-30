"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const expandermanager_1 = require("./expandermanager");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    var exp = new expandermanager_1.ExpanderManager();
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "expand-region" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var expandSub = vscode.commands.registerCommand('expand_region', () => {
        // The code you place here will be executed every time your command is executed
        if (!exp) {
            exp = new expandermanager_1.ExpanderManager();
        }
        exp.expand();
    });
    var undoExpandSub = vscode.commands.registerCommand('undo_expand_region', () => {
        if (exp) {
            exp.undoExpand();
        }
    });
    context.subscriptions.push(expandSub);
    context.subscriptions.push(undoExpandSub);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map