"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const baseexpander_1 = require("./baseexpander");
const ex = require("./child/_expand_all");
class php extends baseexpander_1.BaseExpander {
    expand(text, start, end) {
        let expand_stack = [];
        expand_stack.push("subword");
        let result = ex.expand_to_subword(text, start, end);
        // console.log('step1');
        // console.log(result);
        if (result) {
            result["expand_stack"] = expand_stack;
            return result;
        }
        expand_stack.push("word");
        result = ex.expand_to_word(text, start, end);
        // console.log('step2');
        // console.log(result);
        if (result) {
            result["expand_stack"] = expand_stack;
            return result;
        }
        expand_stack.push("quotes");
        result = ex.expand_to_quotes(text, start, end);
        // console.log('step3');
        // console.log(result);
        if (result) {
            result["expand_stack"] = expand_stack;
            return result;
        }
        expand_stack.push("xml_node");
        result = ex.expand_to_xml_node(text, start, end);
        // console.log('step4');
        // console.log(result);
        if (result) {
            result["expand_stack"] = expand_stack;
            return result;
        }
        return null;
    }
    ;
}
exports.php = php;
//# sourceMappingURL=php.js.map