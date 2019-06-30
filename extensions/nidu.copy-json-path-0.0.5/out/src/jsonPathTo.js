"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ColType;
(function (ColType) {
    ColType[ColType["Object"] = 0] = "Object";
    ColType[ColType["Array"] = 1] = "Array";
})(ColType || (ColType = {}));
var PosType;
(function (PosType) {
    PosType[PosType["Unknown"] = 0] = "Unknown";
    PosType[PosType["ObjectKey"] = 1] = "ObjectKey";
    PosType[PosType["AfterObjectKey"] = 2] = "AfterObjectKey";
    PosType[PosType["ObjectValue"] = 3] = "ObjectValue";
    PosType[PosType["ArrayValue"] = 4] = "ArrayValue";
})(PosType || (PosType = {}));
const objectKeyStopCharRegex = /[\[\]{}\s=:,]/;
function jsonPathTo(text, offset) {
    let pos = 0;
    let stack = [];
    let posType = PosType.Unknown;
    // console.log('jsonPathTo:start', offset)
    function popStack() {
        stack.pop();
        const frame = currentFrame();
        if (frame) {
            posType = frame.posType;
        }
    }
    function currentFrame() {
        return stack.length > 0 ? stack[stack.length - 1] : null;
    }
    // console.log('jsonPathTo:start', text, offset)
    while (pos < text.length && (pos < offset || (stack.length > 0 && stack[stack.length - 1].key === undefined && stack[stack.length - 1].index === undefined))) {
        const char = text[pos];
        // console.log('jsonPathTo:step', pos, char, stack, isInKey)
        const startPos = pos;
        if (posType == PosType.AfterObjectKey && !char.match(/[\s:,}]/)) {
            popStack();
        }
        switch (char) {
            case '{':
                posType = PosType.ObjectKey;
                stack.push({ colType: ColType.Object, posType });
                break;
            case '[':
                posType = PosType.ArrayValue;
                stack.push({ colType: ColType.Array, index: 0, posType });
                break;
            case '}':
            case ']':
                stack.pop();
                break;
            case ',':
                const frame = currentFrame();
                if (frame) {
                    if (frame.colType == ColType.Object) {
                        posType = PosType.ObjectKey;
                        frame.key = undefined;
                    }
                    else {
                        frame.index++;
                    }
                }
                break;
            case '"':
            case "'":
                const { text: s, pos: newPos } = readString(text, pos, text[pos]);
                // console.log('jsonPathTo:readString', {s, pos, newPos, isInKey, frame: stack[stack.length - 1]})
                if (stack.length) {
                    const frame = stack[stack.length - 1];
                    if (frame.colType == ColType.Object && posType == PosType.ObjectKey) {
                        frame.key = s;
                        posType = PosType.AfterObjectKey;
                    }
                }
                pos = newPos;
                break;
            case ' ':
            case '\n':
            case '\r':
            case '\t':
                break;
            case ':':
                if (posType == PosType.AfterObjectKey) {
                    posType = PosType.ObjectValue;
                }
                break;
            default:
                if (posType == PosType.ObjectKey) {
                    const { text: s, pos: newPos } = readObjectKey(text, pos);
                    // console.log('jsonPathTo:readKey', {s, pos, newPos, isInKey, frame: stack[stack.length - 1]})
                    if (stack.length) {
                        const frame = stack[stack.length - 1];
                        if (frame.colType == ColType.Object && posType == PosType.ObjectKey) {
                            frame.key = s;
                            posType = PosType.AfterObjectKey;
                        }
                    }
                    pos = newPos;
                }
                break;
        }
        if (pos == startPos) {
            pos++;
        }
    }
    // console.log('jsonPathTo:end', {stack})
    return pathToString(stack);
}
exports.jsonPathTo = jsonPathTo;
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
function readObjectKey(text, pos) {
    let i = pos + 1;
    while (i < text.length && !text[i].match(objectKeyStopCharRegex))
        i++;
    return {
        text: text.substring(pos, i),
        pos: i
    };
}
function readString(text, pos, quoteChar) {
    let i = pos + 1;
    while (!(text[i] == quoteChar && text[i - 1] != '\\'))
        i++;
    return {
        text: text.substring(pos + 1, i),
        pos: i + 1
    };
}
//# sourceMappingURL=jsonPathTo.js.map