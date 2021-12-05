const Parser = require('tree-sitter');
const JavaScript = require('tree-sitter-javascript');

const parser = new Parser();

var plugin = new (class {
    constructor(){

    }

    Highlight(code,mode){

        if(mode == 'js'){

            parser.setLanguage(JavaScript);

            const tree = parser.parse(code);

            console.log(tree.rootNode.toString());

            process.exit();

        }

    }

})();

module.exports = (nide)=>{

    plugin.nide = nide;

    nide.Highlight = (function(code,mode){

        return plugin.Highlight(code,mode);

    }).bind(nide);

}