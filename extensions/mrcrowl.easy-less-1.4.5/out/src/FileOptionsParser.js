"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const extend = require("extend");
const SUPPORTED_PER_FILE_OPTS = {
    "main": true,
    "out": true,
    "outExt": true,
    "sourceMap": true,
    "sourceMapFileInline": true,
    "compress": true,
    "relativeUrls": true,
    "ieCompat": true,
    "autoprefixer": true,
};
const ARRAY_OPTS = {
    "main": true,
};
function parse(line, defaults) {
    // does line start with a comment?: //
    const commentMatch = /^\s*\/\/\s*(.+)/.exec(line);
    if (!commentMatch) {
        return defaults;
    }
    const options = extend({}, defaults);
    const optionLine = commentMatch[1];
    const seenKeys = {};
    for (const item of optionLine.split(',')) {
        const i = item.indexOf(':');
        if (i < 0) {
            continue;
        }
        const key = item.substr(0, i).trim();
        if (!SUPPORTED_PER_FILE_OPTS.hasOwnProperty(key)) {
            continue;
        }
        let value = item.substr(i + 1).trim();
        if (value.match(/^(true|false|undefined|null|[0-9]+)$/)) {
            value = eval(value);
        }
        if (seenKeys[key] === true && ARRAY_OPTS[key]) {
            let existingValue = options[key];
            if (!Array.isArray(existingValue)) {
                existingValue = options[key] = [existingValue];
            }
            existingValue.push(value);
        }
        else {
            options[key] = value;
            seenKeys[key] = true;
        }
    }
    return options;
}
exports.parse = parse;
//# sourceMappingURL=FileOptionsParser.js.map