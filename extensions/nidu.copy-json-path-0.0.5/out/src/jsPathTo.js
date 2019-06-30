"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const acorn_1 = require("acorn");
var walk = require("acorn/dist/walk");
var ColType;
(function (ColType) {
    ColType[ColType["Object"] = 0] = "Object";
    ColType[ColType["Array"] = 1] = "Array";
})(ColType || (ColType = {}));
function looksLikeJson(text) {
    return text.match(/^\s*[{\[](.|[\r\n])*[}\]]\s*$/);
}
function jsPathTo(text, offset) {
    if (looksLikeJson(text)) {
        const prefix = "a=";
        text = prefix + text;
        offset += prefix.length;
    }
    let path = [];
    function addProperty(p) {
        path.unshift({
            colType: ColType.Object,
            key: p.key.name || p.key.value
        });
    }
    function findChildIndexAtOffset(node) {
        let children = node.elements || node.properties;
        let i = 0;
        while (i < children.length && children[i].start <= offset)
            i++;
        return Math.max(0, i - 1);
    }
    const catchKeys = ["ObjectExpression", "Property", "ArrayExpression"];
    try {
        walk.fullAncestor(acorn_1.parse(text, {
            allowReserved: true,
            sourceType: "module",
            allowImportExportEverywhere: true,
            allowAwaitOutsideFunction: true
        }), (node, parents) => {
            if (node.start <= offset && node.end >= offset) {
                // console.log(`step for ${text}`, node)
                // Go down the stack until object or array is met. E.g. if object property has a function value
                let i = parents.length - 1;
                while (i >= 0 && catchKeys.indexOf(parents[i].type) == -1) {
                    i--;
                }
                while (i >= 0) {
                    let p = parents[i];
                    switch (p.type) {
                        case "ObjectExpression":
                            if (path.length == 0) {
                                const index = findChildIndexAtOffset(p);
                                addProperty(p.properties[index]);
                            }
                            break;
                        case "Property":
                            addProperty(p);
                            break;
                        case "ArrayExpression":
                            let index = findChildIndexAtOffset(p);
                            path.unshift({
                                colType: ColType.Array,
                                index: index
                            });
                            break;
                        case "Identifier":
                        case "Literal":
                        case "ObjectExpression":
                            break;
                        default:
                            throw "Ok";
                    }
                    i--;
                }
                throw "Ok";
            }
        });
    }
    catch (e) {
        if (e == "Ok")
            return pathToString(path);
        throw e;
    }
    return "";
}
exports.jsPathTo = jsPathTo;
function pathToString(path) {
    let s = '';
    for (const frame of path) {
        if (frame.colType == ColType.Object) {
            if (!frame.key.match(/^[a-zA-Z$_][a-zA-Z\d$_]*$/)) {
                const key = frame.key.replace('"', '\\"');
                s += `["${frame.key}"]`;
            }
            else {
                if (s.length) {
                    s += '.';
                }
                s += frame.key;
            }
        }
        else {
            s += `[${frame.index}]`;
        }
    }
    return s;
}
//# sourceMappingURL=jsPathTo.js.map