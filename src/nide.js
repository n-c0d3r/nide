
const Console = require('./console/console');

const os = require('os');

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

class Nide{
    constructor(){

        var app = this;

        this.cursor = 0;


        this.selectedBIndex=-1;
        this.selectedEIndex=-1;


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
                    app.Left();
                    return;
                }

                if(key && key.name == "right"){
                    app.Right();
                    return;
                }

                if(key && key.name == "up"){
                    
                    return;
                }

                if(key && key.name == "down"){
                    
                    return;
                }

                if(key && key.name == "tab"){
                    app.AddCode('    ');
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

                if(!key.ctrl && !key.meta){
                    if(key.shift){
                        app.AddCode(key.name.toUpperCase());
                    }
                    else{
                        app.AddCode(key.name);
                    }
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

        try{
            let func = Function(compiledCode)();
            
            this.code = '';
    
            console.clear();
            
            process.stdout.write('\x1b[36mRun:\x1b[37m\n');
    
            return (func(this));
        }
        catch(err){
            console.error(err);
        }

    }

    Left(){
        this.cursor = clamp(this.cursor-1,0,this.code.length);

        this.ReprintCode();
    }

    Right(){
        this.cursor = clamp(this.cursor+1,0,this.code.length);

        this.ReprintCode();
    }

    AddCode(key){
        this.code = this.code.substring(0,this.cursor) + key + this.code.substring(this.cursor,this.code.length);
        this.cursor = clamp(this.cursor+key.length,0,this.code.length);

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

    ReprintCode(option){
        console.clear();
        this.console.HideCursor();

        let coloredCode = this.code;

        if(option==null)
            option=new Object();

        if(!(option.printColoredCode == true)){
            if(this.cursor<this.code.length){
                if(this.code[this.cursor] == '\n'){
                    coloredCode = this.code.substring(0,this.cursor) + '\x1b[46m' + ' ' + this.code[this.cursor] + '\x1b[40m' + this.code.substring(this.cursor+1,this.code.length);
                }
                else{
                    coloredCode = this.code.substring(0,this.cursor) + '\x1b[46m' + this.code[this.cursor] + '\x1b[40m' + this.code.substring(this.cursor+1,this.code.length);
                }
            }
            else{
                coloredCode = this.code.substring(0,this.code.length) + '\x1b[46m' + ' ' + '\x1b[40m';
            }
        }

        process.stdout.write(coloredCode);

        this.console.HideCursor();
    }

}

module.exports = Nide;