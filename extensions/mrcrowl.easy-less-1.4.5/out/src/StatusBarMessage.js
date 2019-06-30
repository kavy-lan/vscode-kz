"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const ERROR_COLOR_CSS = "rgba(255,125,0,1)";
const ERROR_DURATION_MS = 10000;
const SUCCESS_DURATION_MS = 1500;
let errorMessage;
function hideError() {
    if (errorMessage) {
        errorMessage.hide();
        errorMessage = null;
    }
}
exports.hideError = hideError;
function show(message, type) {
    this.hideError();
    switch (type) {
        case 0 /* SUCCESS */:
            return vscode.window.setStatusBarMessage(message, SUCCESS_DURATION_MS);
        case 1 /* INDEFINITE */:
            return vscode.window.setStatusBarMessage(message);
        case 2 /* ERROR */:
            errorMessage = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
            errorMessage.text = message;
            errorMessage.command = "workbench.action.showErrorsWarnings";
            errorMessage.color = ERROR_COLOR_CSS;
            errorMessage.show();
            setTimeout(hideError, ERROR_DURATION_MS);
            return errorMessage;
    }
}
exports.show = show;
//# sourceMappingURL=StatusBarMessage.js.map