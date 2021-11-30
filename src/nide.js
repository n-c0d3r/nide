
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

const getFileExplorerLine=function(lineLevel){
    return '';
}

const addFileExplorer = function(code){
    let newCode = '';

    let lineLevel = 0;

    newCode+=getFileExplorerLine(lineLevel);

    for(let i = 0; i<code.length; i++){

        let c = code[i];

        if(code[i]=='\n'){
            lineLevel++;

            newCode += '\n'+getFileExplorerLine(lineLevel);

            continue;
        }

        newCode+=c;

    }

    return newCode;
}

class Nide{
    constructor(option){

        var app = this;

        this.cursorLineLevel = 0;

        this.maxHeight = option.maxHeight;

        this.mode = option.mode;

        this.cwd = option.cwd;

        this.lastFileOpenedCode = '';

        this.defaultFileName = option.defaultFileName;

        this.maxTabsShowed = option.maxTabsShowed;

        this.fileName = this.defaultFileName;

        this.fileStatus = '*';

        this.cursor = 0;

        this.codeHis = [];
        this.hisCIndex = 0;

        this.selectedBIndex=-1;
        this.selectedEIndex=-1;

        this.tabs = [];

        this.currentTabIndex = 0;

        this.tabs[0] = {
            'cursor': this.cursor,
            'code': this.code,
            'fileName': this.fileName,
            'mode': this.mode,
            'cwd': this.cwd
        };

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
                    app.ChangeMode('default');
                    app.code='';
                    app.ReprintCode();
                    return;
                }
                if(key && key.meta && key.name == "q"){
                    app.SaveFile();
                    return;
                }
                if(key && key.meta && key.name == "m"){
                    app.code = app.lastFileOpenedCode;
                    app.ReprintCode();
                    return;
                }
                if(key && key.meta && key.name == "i"){
                    app.OpenTab(app.currentTabIndex+1);
                    return;
                }
                if(key && key.meta && key.name == "j"){
                    app.NewTab();
                    return;
                }
                if(key && key.meta && key.name == "n"){
                    app.RemoveTab(app.currentTabIndex);
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
                    app.Up();
                    return;
                }

                if(key && key.name == "down"){
                    app.Down();
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
        this.lastFileOpenedCode = this.code;
        this.fileStatus = '';
        this.ReprintCode();
    }

    ChangeMode(mode){
        this.mode = mode;
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

        if(this.mode == 'js'){
            compiledCode = `
                return ((nide)=>{  

                    ${code}

                });
            `;
        }
        else if(this.mode == 'py'){
            compiledCode = `${code}`;
        }
        else if(this.mode == 'default'){

            let lines = code.split('\n');

            for(let line of lines){
                let args = line.split(' ');

                let compiledLine = '';

                let newArgs = [];
    
                for(let a of args){
                    if(a!=''){
                        newArgs.push(a);
                    }
                }
    
                args = newArgs;

                if(args.length>=1){
                    var command;
                    
                    try{
                        command = require('./commands/'+args[0]);
                        compiledLine = command(args);
                    }
                    catch(err){
                        console.error(err);
                    }
                    finally{
                        compiledCode += compiledLine;
                    }
                    
                }
    
            }

            compiledCode = `
                return ((nide)=>{  

                    ${compiledCode}

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
    NF(target){
        let p = this.cwd+'\\'+target;
        fs.writeFileSync(p,'');
    }

    CF(target){
        this.fileName = target;
        this.fileStatus = '*';
    }

    OpenFile(name){
        let fullPath = path.join(this.cwd,name);
        if(fs.existsSync(fullPath)){
            
            this.code = fs.readFileSync(fullPath).toString();

            this.lastFileOpenedCode = this.code;

        }
        else{
            this.code = name+' Not Found!!!';
        }
    }

    RunCode(){
        this.AddToCodeHis(this.code);
        
        let compiledCode = this.CompileCode(this.code);

        if(this.mode == 'js'){
            try{
                let func = Function(compiledCode)();
                
                this.lastFileOpenedCode = this.code;
        
                console.clear();
        
                process.stdout.write(this.AddCoderHeader(''));
                
                process.stdout.write('\x1b[36mRun:\x1b[37m\n');
        
                return (func(this));
            }
            catch(err){
                console.error(err);
            }
        }
        else if(this.mode == 'py'){

            let cacheFilePath = this.cwd + '/' + this.fileName;//'/nide_code.py';

            //fs.writeFileSync(cacheFilePath,compiledCode);
            
            this.lastFileOpenedCode = this.code;
        
            console.clear();
        
            process.stdout.write('\x1b[33mMODE: \x1b[32m'+this.mode+'\x1b[37m\n\n');
                
            process.stdout.write('\x1b[36mRun:\x1b[37m\n');

            child_process.exec('start cmd.exe /k py "'+cacheFilePath+'"',{cwd:this.cwd}, (err, stdout, stderr) => {
                if (err) {
                    console.log(`${err}`);
                    return;
                }

                console.log(`${stdout}`);
            });

        }
        else if(this.mode == 'default'){
            try{
                let func = Function(compiledCode)();
                
                console.log('');
        
                return (func(this));
            }
            catch(err){
                console.error(err);
            }
        }

    }

    OpenTab(index){

        if(index>this.tabs.length-1){
            this.currentTabIndex = index - this.tabs.length;
        }
        else
            this.currentTabIndex = index;

        this.cwd = this.tabs[this.currentTabIndex].cwd;
        this.code = this.tabs[this.currentTabIndex].code;
        this.mode = this.tabs[this.currentTabIndex].mode;
        this.fileName = this.tabs[this.currentTabIndex].fileName;
        this.cursor = this.tabs[this.currentTabIndex].cursor;

        this.ReprintCode();
    }

    RemoveTab(index){
        if(this.tabs.length>1){
            this.tabs.splice(index,1);
            this.currentTabIndex = clamp(this.currentTabIndex,0,this.tabs.length-1);
            this.OpenTab(this.currentTabIndex);
        }
    }

    NewTab(index){

        let newTab = {
            'cursor': 0,
            'code': '',
            'fileName': this.defaultFileName,
            'mode': this.mode,
            'cwd': this.cwd
        };

        this.tabs.push(newTab);

        this.OpenTab(this.tabs.length-1);

    }

    Left(){
        this.cursor = clamp(this.cursor-1,0,this.code.length);

        this.ReprintCode();
    }

    Right(){
        this.cursor = clamp(this.cursor+1,0,this.code.length);

        this.ReprintCode();
    }

    Up(){

        let newCursor = this.cursor-1;

        for(let i = newCursor; i>=0; i--){
            if(this.code[i]=='\n'){
                newCursor=i;
                break;
            }
        }

        this.cursor=clamp(newCursor,0,this.code.length);

        this.ReprintCode();
    }

    Down(){

        let newCursor = this.cursor+1;

        for(let i = newCursor; i<this.code.length; i++){
            if(this.code[i]=='\n'){
                newCursor=i;
                break;
            }
        }

        this.cursor=clamp(newCursor,0,this.code.length);

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

        /*
            this.tabs[0] = {
            'cursor': this.cursor,
            'code': this.code,
            'fileName': this.fileName,
            'mode': this.mode,
            'cwd': this.cwd
        };
        */

        this.tabs[this.currentTabIndex].cwd = this.cwd;
        this.tabs[this.currentTabIndex].code = this.code;
        this.tabs[this.currentTabIndex].mode = this.mode;
        this.tabs[this.currentTabIndex].fileName = this.fileName;
        this.tabs[this.currentTabIndex].cursor = this.cursor;

        let coloredCode = this.code;

        if(option==null)
            option=new Object();

        this.coloredCursor = 0;

        let cursorLineLevel = 0;

        for(let i = 0;i<this.code.length;i++){
            let c = this.code[i];

            if(c == '\n'){
                cursorLineLevel++;
                
                if(i>=this.cursor){
                    break;
                }

            }

        }

        this.cursorLineLevel = cursorLineLevel;


        if(!(option.printColoredCode == true)){
            if(this.cursor<this.code.length){
                if(this.code[this.cursor] == '\n'){
                    this.coloredCursor = (this.code.substring(0,this.cursor) + '\x1b[46m' + ' \x1b[40m').length;
                    coloredCode = this.code.substring(0,this.cursor) + '\x1b[46m' + ' \x1b[40m' + this.code[this.cursor] + '\x1b[40m' + this.code.substring(this.cursor+1,this.code.length);
                    
                }
                else{
                    this.coloredCursor = (this.code.substring(0,this.cursor) + '\x1b[46m').length;
                    coloredCode = this.code.substring(0,this.cursor) + '\x1b[46m' + this.code[this.cursor] + '\x1b[40m' + this.code.substring(this.cursor+1,this.code.length);
                    
                }
            }
            else{
                this.coloredCursor = (this.code.substring(0,this.code.length) + '\x1b[46m').length;
                coloredCode = this.code.substring(0,this.code.length) + '\x1b[46m' + ' ' + '\x1b[40m';
            }
        }



        let newCode = withLineIndicesCode(coloredCode,6);


        newCode = this.OptimizeCode(newCode);

        newCode = this.AddCoderHeader(newCode);
        

        this.WriteLines(newCode);

        this.console.HideCursor();
    }

    TabsString(){

        let tabFileNames = '';

        let startI = this.currentTabIndex;

        let endI = this.tabs.length-1;

        if(this.tabs.length - this.currentTabIndex < this.maxTabsShowed){
            startI = clamp(this.tabs.length-this.maxTabsShowed,0,this.tabs.length-1);
        }

        if(endI - startI + 1 > this.maxTabsShowed){
            endI = clamp(startI+this.maxTabsShowed-1,0,this.tabs.length-1);
        }

        for(let i=startI;(i<=endI);i++){
            let tab = this.tabs[i];

            if(this.currentTabIndex == i){
                tabFileNames+='\x1b[32m\x1b[1m['+(tab.fileName)+']\x1b[0m';
            }
            else{
                tabFileNames+=`[${tab.fileName}]`;
            }

            if(!(i == endI)){
                tabFileNames+=' ';
            }

        }


        tabFileNames = `${tabFileNames}`;

        if(startI==0){
           tabFileNames = '\x1b[0m'+tabFileNames;
        }
        else{
           tabFileNames = '\x1b[30m\x1b[1m...\x1b[0m'+tabFileNames;
        }

        if(endI==this.tabs.length-1){
           tabFileNames += '\x1b[0m';
        }
        else{
           tabFileNames += '\x1b[30m\x1b[1m...\x1b[0m';
        }

        return `>  ${tabFileNames}`;
    }

    AddCoderHeader(code){
        let newCode = code;
        newCode = '\n' + this.TabsString() + '\n\n' + newCode;
        newCode = '>  \x1b[36mFILE NAME \x1b[0m :  \x1b[33m'+this.fileName+'\x1b[37m'+this.fileStatus+'\n' + newCode;
        newCode = '>  \x1b[36mCWD       \x1b[0m :  \x1b[33m'+this.cwd+'\x1b[37m\n' + newCode;
        newCode = '>  \x1b[36mMODE      \x1b[0m :  \x1b[33m'+this.mode+'\x1b[37m\n' + newCode;
        return newCode;
    }

    OptimizeCode(code){

        let lines = code.split('\n');

        let newCode = '';

        let lastLineIndex = -1;

        let cursorLineLevel = this.cursorLineLevel;

        let bI = 0;
        let eI = lines.length-1;

        let halfHeight1 = parseInt(this.maxHeight/2);
        let halfHeight2 = this.maxHeight-halfHeight1;

        
        eI = cursorLineLevel+halfHeight1;
        bI = cursorLineLevel-halfHeight2+1;


        bI = clamp(bI,0,lines.length-1);
        eI = clamp(eI,0,lines.length-1);


        if(eI - bI + 1 < this.maxHeight){
            eI = (bI + this.maxHeight - 1);
        }


        bI = clamp(bI,0,lines.length-1);
        eI = clamp(eI,0,lines.length-1);


        for(let i=bI;i<=eI;i++){

            newCode+=(lines[i]);

            if(i!=eI){
                newCode+=('\n');
            }

        }

        return newCode;
    }

    WriteLines(code){

        let lines = code.split('\n');

        for(let i=0;i<lines.length;i++){

            process.stdout.write(lines[i]);

            if(i!=lines.length-1){
                process.stdout.write('\n');
            }

            if(i==this.maxHeight){
                break;
            }

        }

    }

}

module.exports = Nide;