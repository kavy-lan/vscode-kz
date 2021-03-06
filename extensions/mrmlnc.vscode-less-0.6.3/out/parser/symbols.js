'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const less_symbols_parser_1 = require("less-symbols-parser");
const nodes_1 = require("../types/nodes");
const variable_1 = require("./variable");
const mixin_1 = require("./mixin");
const ast_1 = require("../utils/ast");
/**
 * Get all suggestions in file.
 */
function findSymbols(text) {
    return less_symbols_parser_1.parseSymbols(text);
}
exports.findSymbols = findSymbols;
/**
 * Get Symbols by offset position.
 */
function findSymbolsAtOffset(parsedDocument, offset) {
    let variables = [];
    let mixins = [];
    const imports = [];
    let node = ast_1.getNodeAtOffset(parsedDocument, offset);
    if (!node) {
        return {
            variables,
            mixins,
            imports
        };
    }
    while (node && node.type !== nodes_1.NodeType.Stylesheet) {
        if (node.type === nodes_1.NodeType.MixinDeclaration) {
            variables = variables.concat(mixin_1.makeMixin(node).parameters);
        }
        else if (node.type === nodes_1.NodeType.Ruleset || node.type === nodes_1.NodeType.Declarations) {
            variables = variables.concat(variable_1.makeVariableCollection(node));
            mixins = mixins.concat(mixin_1.makeMixinCollection(node));
        }
        node = node.getParent();
    }
    return {
        variables,
        mixins,
        imports
    };
}
exports.findSymbolsAtOffset = findSymbolsAtOffset;
