
const Console = require('./console/console');

const os = require('os');

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

const fs = require('fs');

const child_process = require('child_process');

const path = require('path');

const spaces = function(count){
    let r = '';
    for(let i=0;i<count;i++){
        r+=' ';
    }
    return r;
}

const withLineIndicesCode = function(coloredCode,maxSpaces){

    coloredCode = spaces(maxSpaces)+'0 '+'|'+coloredCode;

    let newCode = '';

    let cursorLineLevel = 0;

    let lineLevel = 0;

    for(let i = 0;i<coloredCode.length;i++){
        let c = coloredCode[i];
        newCode += c;

        if(c == '\n'){
            lineLevel++;
            newCode += '\x1b[40m' + spaces(maxSpaces - lineLevel.toString().length + 1) + lineLevel + ' |\x1b[40m';
        }

    }

    return newCode;
}

class Nide{
    constructor(option){

        var app = this;

        this.lang = option.lang;

        this.cwd = option.cwd;

        this.fileName = 'document.txt';

        this.fileStatus = '*';

        this.cursor = 0;

        this.codeHis = [];
        this.hisCIndex = 0;

        this.selectedBIndex=-1;
        this.selectedEIndex=-1;


        this.console = new Console();

        this.console.keypressEventListeners['Nide'] = function(ch,key){
            if(key != null){
                if(key && key.meta && key.name == "l"){
                    app.RunCode();
                    return;
                }
                if(key && key.meta && key.name == "k"){
                    app.Exit();
                    return;
                }
                if(key && key.meta && key.name == "p"){
                    app.Clear();
                    return;
                }
                if(key && key.meta && key.name == "o"){
                    app.ChangeLang('nide');
                    app.code='';
                    app.ReprintCode();
                    return;
                }
                if(key && key.meta && key.name == "q"){
                    app.SaveFile();
                    return;
                }

                if(key && key.ctrl && key.name == "z"){
                    app.Undo();
                    return;
                }

                if(key && key.ctrl && key.name == "y"){
                    app.Redo();
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

        this.LoadPlugins();

    }

    LoadPlugins(){
        let plugins = require('./plugins/plugins.json');

        for(let plugin of plugins){
            (require('./plugins/'+plugin))(this);
        }

    }

    SaveFile(){
        fs.writeFileSync(path.join(this.cwd,this.fileName),this.code);
        this.fileStatus = '';
        this.ReprintCode();
    }

    ChangeLang(lang){
        this.lang = lang;
    }

    Start(){
        
        this.Clear();

    }

    Exit(){
        this.console.ShowCursor();
        process.exit();
    }

    CompileCode(code){
        let compiledCode = '';

        if(this.lang == 'js'){
            compiledCode = `
                return ((nide)=>{  

                    ${code}

                });
            `;
        }
        else if(this.lang == 'py'){
            compiledCode = `${code}`;
        }
        else if(this.lang == 'nide'){

            let endCode = code.length-1;

            for(let i=0;i<code.length;i++){
                if(code[i]=='\n'){
                    endCode=i-1;
                    break;
                }
            }

            code = code.substring(0,endCode+1);


            let args = code.split(' ');

            let newArgs = [];

            for(let a of args){
                if(a!=''){
                    newArgs.push(a);
                }
            }

            args = newArgs;

            var command;
            
            try{
                command = require('./commands/'+args[0]);
                code = command(args);
            }
            catch(err){
                console.error(err);
            }


            compiledCode = `
                return ((nide)=>{  

                    ${code}

                });
            `;
        }

        return compiledCode;
    }

    ExecCMDCommand(command){
        console.log(`\n`);
        child_process.exec(
            command, 
            {
                cwd: this.cwd
            },
            (err, stdout, stderr) => {
                if (err) {
                    console.log(`${err}`);
                    return;
                }

                console.log(`${stdout}`);
            }
        );
    }

    CD(target){
        let p = path.join(this.cwd,target);
        if(fs.existsSync(p)){
            this.cwd = p;
        }
        else{
            this.code = 'Cant Change Directory!!!';
        }
    }
    CP(target){
        let p = target+":\\";
        if(fs.existsSync(p)){
            this.cwd = p;
        }
        else{
            this.code = 'Cant Change Partition!!!';
        }
    }

    CF(target){
        this.fileName = target;
        this.fileStatus = '*';
    }

    RunCode(){
        
        let compiledCode = this.CompileCode(this.code);

        if(this.lang == 'js'){
            try{
                let func = Function(compiledCode)();
                
                this.code = '';
        
                console.clear();
        
                process.stdout.write('\x1b[33mLANG: \x1b[32m'+this.lang+'\x1b[37m\n\n');
                
                process.stdout.write('\x1b[36mRun:\x1b[37m\n');
        
                return (func(this));
            }
            catch(err){
                console.error(err);
            }
        }
        else if(this.lang == 'py'){

            let cacheFilePath = this.cwd + '/nide_code.py';

            fs.writeFileSync(cacheFilePath,compiledCode);
            
            this.code = '';
        
            console.clear();
        
            process.stdout.write('\x1b[33mLANG: \x1b[32m'+this.lang+'\x1b[37m\n\n');
                
            process.stdout.write('\x1b[36mRun:\x1b[37m\n');

            child_process.exec('py '+cacheFilePath, (err, stdout, stderr) => {
                if (err) {
                    console.log(`${err}`);
                    return;
                }

                console.log(`${stdout}`);
            });

        }
        else if(this.lang == 'nide'){
            try{
                let func = Function(compiledCode)();
                
                this.code = '';
                
                console.log('');
        
                return (func(this));
            }
            catch(err){
                console.error(err);
            }
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

        this.AddToCodeHis(this.code);

        this.ReprintCode();
    }

    AddToCodeHis(code){
        this.fileStatus = '*';

        if(this.codeHis.length==0){
            this.codeHis.push({
                'code':code,
                'cursor':this.cursor
            });
        }
        else{
        
            if(this.hisCIndex==this.codeHis.length-1){
                this.codeHis.push({
                    'code':code,
                    'cursor':this.cursor
                });
                this.hisCIndex++;
            }
            else{
                this.codeHis.splice(this.hisCIndex,this.codeHis.length-this.hisCIndex);
                this.codeHis.push({
                    'code':code,
                    'cursor':this.cursor
                });
                this.hisCIndex++;
            }
        }

    }

    Undo(){
        this.hisCIndex = clamp(this.hisCIndex-1,-1,this.codeHis.length-1);

        if(this.hisCIndex==-1){
            this.code='';
            this.cursor=0;
            this.ReprintCode();
            return;
        }

        this.code = this.codeHis[this.hisCIndex].code;
        this.cursor = this.codeHis[this.hisCIndex].cursor;
        this.ReprintCode();
    }

    Redo(){
        this.hisCIndex = clamp(this.hisCIndex+1,-1,this.codeHis.length-1);

        if(this.hisCIndex==-1){
            this.code='';
            this.cursor=0;
            this.ReprintCode();
            return;
        }

        this.code = this.codeHis[this.hisCIndex].code;
        this.cursor = this.codeHis[this.hisCIndex].cursor;
        this.ReprintCode();
    }

    Backspace(){
        this.code = this.code.substring(0,this.cursor-1) + this.code.substring(this.cursor,this.code.length);
        this.cursor = clamp(this.cursor-1,0,this.code.length);

        this.AddToCodeHis(this.code);

        this.ReprintCode();
    }

    Delete(){
        this.code = this.code.substring(0,this.cursor) + this.code.substring(this.cursor+1,this.code.length);

        this.AddToCodeHis(this.code);

        this.ReprintCode();
    }

    Clear(){
        this.code = '';

        this.AddToCodeHis(this.code);

        this.ReprintCode();
    }

    ReprintCode(option){
        console.clear();
        this.console.HideCursor();

        let coloredCode = this.code;

        if(option==null)
            option=new Object();

        let newCursor = 0;

        if(!(option.printColoredCode == true)){
            if(this.cursor<this.code.length){
                if(this.code[this.cursor] == '\n'){
                    newCursor = (this.code.substring(0,this.cursor) + '\x1b[46m' + ' \x1b[40m').length;
                    coloredCode = this.code.substring(0,this.cursor) + '\x1b[46m' + ' \x1b[40m' + this.code[this.cursor] + '\x1b[40m' + this.code.substring(this.cursor+1,this.code.length);
                    
                }
                else{
                    newCursor = (this.code.substring(0,this.cursor) + '\x1b[46m').length;
                    coloredCode = this.code.substring(0,this.cursor) + '\x1b[46m' + this.code[this.cursor] + '\x1b[40m' + this.code.substring(this.cursor+1,this.code.length);
                    
                }
            }
            else{
                newCursor = (this.code.substring(0,this.code.length) + '\x1b[46m').length;
                coloredCode = this.code.substring(0,this.code.length) + '\x1b[46m' + ' ' + '\x1b[40m';
            }
        }




        // let maxSpaces = 6;

        // coloredCode = spaces(maxSpaces)+'0 '+'|'+coloredCode;

        let newCode = withLineIndicesCode(coloredCode,6);

        // let cursorLineLevel = 0;

        // let lineLevel = 0;

        // for(let i = 0;i<coloredCode.length;i++){
        //     let c = coloredCode[i];
        //     newCode += c;

        //     if(c == '\n'){
        //         lineLevel++;
        //         newCode += '\x1b[40m' + spaces(maxSpaces - lineLevel.toString().length + 1) + lineLevel + ' |\x1b[40m';
        //     }

        // }
        

        
        process.stdout.write('\x1b[33mLANG      : \x1b[32m'+this.lang+'\x1b[37m\n\n');
        process.stdout.write('\x1b[33mCWD       : \x1b[32m'+this.cwd+'\x1b[37m\n\n');
        process.stdout.write('\x1b[33mFILE NAME : \x1b[32m'+this.fileName+'\x1b[37m'+this.fileStatus+'\n\n');

        process.stdout.write(newCode);

        this.console.HideCursor();
    }

}

module.exports = Nide;