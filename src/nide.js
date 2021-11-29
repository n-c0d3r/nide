
const Console = require('./console/console');

const os = require('os');

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

class Nide{
    constructor(){

        var app = this;

        this.cursor = 0;

        this.console = new Console();

        this.console.keypressEventListeners['Nide'] = function(ch,key){
            if(key != null){
                if(key && key.shift && key.name == "r"){
                    app.RunCode();
                    return;
                }
                if(key && key.shift && key.name == "e"){
                    app.Exit();
                    return;
                }
                if(key && key.shift && key.name == "c"){
                    app.Clear();
                    return;
                }

                if(key && key.name == "backspace"){
                    app.Backspace();
                    return;
                }
                if(key && key.name == "delete"){
                    app.Delete();
                    return;
                }

                if(key && key.name == "left"){
                    app.cursor = clamp(app.cursor-1,0,app.code.length);

                    app.ReprintCode();
                    return;
                }

                if(key && key.name == "right"){
                    app.cursor = clamp(app.cursor+1,0,app.code.length);

                    app.ReprintCode();
                    return;
                }

                if(key && key.name == "space"){
                    app.AddCode(' ');
                    return;
                }

                if(key && key.name == "return"){
                    app.AddCode('\n');
                    return;
                }
                if(key.shift){
                    app.AddCode(key.name.toUpperCase());
                }
                else{
                    app.AddCode(key.name);
                }
            }
            else{
                app.AddCode(ch);
            }

        }

        this.code = '';

    }

    Start(){
        
        console.clear();


    }

    Exit(){
        this.console.ShowCursor();
        process.exit();
    }

    CompileCode(code){
        let compiledCode = '';

        compiledCode = `
            return ((nide)=>{  

                ${code}

            });
        `;

        return compiledCode;
    }

    RunCode(){
        
        let compiledCode = this.CompileCode(this.code);

        let func = Function(compiledCode)();

        process.stdout.write('\n');

        return (func(this));

    }

    AddCode(key){
        this.code = this.code.substring(0,this.cursor) + key + this.code.substring(this.cursor,this.code.length);
        this.cursor = clamp(this.cursor+1,0,this.code.length);

        this.ReprintCode();
    }

    Backspace(){
        this.code = this.code.substring(0,this.cursor-1) + this.code.substring(this.cursor,this.code.length);
        this.cursor = clamp(this.cursor-1,0,this.code.length);

        this.ReprintCode();
    }

    Delete(){
        this.code = this.code.substring(0,this.cursor) + this.code.substring(this.cursor+1,this.code.length);

        this.ReprintCode();
    }

    Clear(){
        this.code = '';
        this.ReprintCode();
    }

    ReprintCode(){
        console.clear();
        this.console.HideCursor();

        // \x1b[46m
        let coloredCode = this.code;

        if(this.cursor<this.code.length)
            coloredCode = this.code.substring(0,this.cursor) + '\x1b[46m' + this.code[this.cursor] + '\x1b[40m' + this.code.substring(this.cursor+1,this.code.length);
        else{
            coloredCode = this.code.substring(0,this.code.length) + '\x1b[46m' + ' ' + '\x1b[40m';
        }

        process.stdout.write(coloredCode);

        this.console.HideCursor();
    }

}

module.exports = Nide;