"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const vscode = require("vscode");
const Configuration = require("./Configuration");
const LessCompiler = require("./LessCompiler");
const StatusBarMessage = require("./StatusBarMessage");
class CompileLessCommand {
    constructor(document, lessDiagnosticCollection) {
        this.document = document;
        this.lessDiagnosticCollection = lessDiagnosticCollection;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            StatusBarMessage.hideError();
            const globalOptions = Configuration.getGlobalOptions(this.document.fileName);
            const compilingMessage = StatusBarMessage.show("$(zap) Compiling less --> css", 1 /* INDEFINITE */);
            const startTime = Date.now();
            try {
                yield LessCompiler.compile(this.document.fileName, this.document.getText(), globalOptions);
                const elapsedTime = (Date.now() - startTime);
                compilingMessage.dispose();
                this.lessDiagnosticCollection.set(this.document.uri, []);
                StatusBarMessage.show(`$(check) Less compiled in ${elapsedTime}ms`, 0 /* SUCCESS */);
            }
            catch (error) {
                let message = error.message;
                let range = new vscode.Range(0, 0, 0, 0);
                if (error.code) {
                    // fs errors
                    const fileSystemError = error;
                    switch (fileSystemError.code) {
                        case 'EACCES':
                        case 'ENOENT':
                            message = `Cannot open file '${fileSystemError.path}'`;
                            const firstLine = this.document.lineAt(0);
                            range = new vscode.Range(0, 0, 0, firstLine.range.end.character);
                    }
                }
                else if (error.line !== undefined && error.column !== undefined) {
                    // less errors, try to highlight the affected range
                    const lineIndex = error.line - 1;
                    const affectedLine = this.document.lineAt(lineIndex);
                    range = new vscode.Range(lineIndex, error.column, lineIndex, affectedLine.range.end.character);
                }
                compilingMessage.dispose();
                const diagnosis = new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Error);
                this.lessDiagnosticCollection.set(this.document.uri, [diagnosis]);
                StatusBarMessage.show("$(alert) Error compiling less (more detail in Errors and Warnings)", 2 /* ERROR */);
            }
        });
    }
}
module.exports = CompileLessCommand;
//# sourceMappingURL=CompileLessCommand.js.map