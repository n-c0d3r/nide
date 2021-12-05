
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

var ncp = require("copy-paste");

const withLineIndicesCode = function(coloredCode,maxSpaces,cursorLineLevel,nide){


    let newCode = '';

    let lineLevel = 0;

    if(cursorLineLevel != lineLevel){
        coloredCode = '\x1b[30m\x1b[1m'+spaces(maxSpaces)+'0 '+'|\x1b[0m'+
        (()=>{
            if(0>=nide.startSelectAfterColored && 0<=(nide.beforeEndSelectLine+1) && nide.selectMode!=0){
                return '\x1b[47m\x1b[30m';
            }
            return '';
        })()
        +coloredCode;
    }
    else{
        coloredCode = '\x1b[35m'+spaces(maxSpaces)+'0 '+'\x1b[0m|\x1b[0m\x1b[45m\x1b[30m'+
        (()=>{
            if(0>=nide.afterStartSelectLine && 0<=(nide.beforeEndSelectLine+1) && nide.selectMode!=0){
                return '\x1b[47m\x1b[30m';
            }
            return '';
        })()
        +coloredCode;
    }

    for(let i = 0;i<coloredCode.length;i++){
        let c = coloredCode[i];
        newCode += c;

        if(c == '\n'){
            lineLevel++;
            if(cursorLineLevel != lineLevel){
                newCode += '\x1b[0m\x1b[30m\x1b[1m' + spaces(maxSpaces - lineLevel.toString().length + 1) + lineLevel + ' |\x1b[0m' + (()=>{
                    if(lineLevel>=nide.afterStartSelectLine && lineLevel<=(nide.beforeEndSelectLine+1) && nide.selectMode!=0){
                        return '\x1b[47m\x1b[30m';
                    }
                    return '';
                })();
            }
            else{
                newCode += '\x1b[0m\x1b[35m' + spaces(maxSpaces - lineLevel.toString().length + 1) + lineLevel + ' \x1b[0m|' + (()=>{
                    if(lineLevel>=nide.afterStartSelectLine && lineLevel<=(nide.beforeEndSelectLine+1) && nide.selectMode!=0){
                        return '\x1b[47m\x1b[30m';
                    }
                    return '\x1b[0m\x1b[45m\x1b[30m';
                })();
            }
        }

    }

    return newCode;
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

        this.selectMode = 0;

        this.cursorLineLevel = 0;

        this.modes = [
            'default',
            'js',
            'py',
            'fexp',
        ];

        this.startSelect = -1;
        this.endSelect = -1;

        this.FEXP_hideChecks = [];

        this.mode = option.mode;

        this.code = '';

        this.cwd = option.cwd;

        this.lastFileOpenedCode = '';

        this.defaultFileName = option.defaultFileName;

        this.maxTabsShowed = option.maxTabsShowed;

        this.fileName = this.defaultFileName;

        this.FEXP_openedItems = new Object();
        this.FEXP_itemsTypes = new Object();

        this.fileStatus = '*';

        this.cursor = 0;

        this.selectedBIndex=-1;
        this.selectedEIndex=-1;

        this.tabs = [];

        this.currentTabIndex = 0;

        this.tabs[0] = {
            'cursor': this.cursor,
            'code': this.code,
            'fileName': this.fileName,
            'mode': this.mode,
            'cwd': this.cwd,
            'codeHis':[{
                'code':'',
                'cursor':0
            }],
            'hisCIndex':0
        };

        this.codeHis = this.tabs[0].codeHis;
        this.hisCIndex = this.tabs[0].hisCIndex;

        this.tabGroups = [];

        this.tabGroups[0] = {
            'tabs':app.tabs,
            'currentTabIndex':0
        };

        this.tabGroupIndex = 0;

        this.maxHeight = this.GetMaxHeight();

        this.console = new Console();

        if(this.mode == 'fexp')
            this.LoadFilesTree();

        this.keypressEventListeners=[];

        this.teCommandCode = '';
        this.teCommandCursor = 0;

        app.startSelect = -1;
        app.endSelect = -1;

        this.console.keypressEventListeners['Nide'] = function(ch,key){

            app.enableTextEditor = true;
            

            for(let keypressEventListener of app.keypressEventListeners){
                keypressEventListener(ch,key);
            }

            if(key != null){

                if(key.name == 'escape'){
                    app.Exit();
                    return;
                }
                
                if(app.enableTextEditor){
                    if(key && key.meta && key.name == "o"){
                        app.RunCode();
                        return;
                    }
                    if(key && key.ctrl && key.name == "z"){
                        app.Undo();
                        return;
                    }

                    if(key && key.meta && key.name == "x"){
                        if(app.selectMode == 0){
                            app.DeleteCurrentLine();
                        }
                        else{
                            let startSelect = app.startSelect;
                            let endSelect = app.endSelect;
                            app.Copy();

                            app.startSelect = startSelect;
                            app.endSelect = endSelect;

                            app.selectMode = 2;

                            app.Delete();
                        }
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

                    if(key && key.meta && key.name == "j"){
                        app.Left();
                        return;
                    }

                    if(key && key.name == "right"){
                        app.Right();
                        return;
                    }

                    if(key && key.meta && key.name == "l"){
                        app.Right();
                        return;
                    }

                    if(key && key.name == "up"){
                        app.Up();
                        return;
                    }

                    if(key && key.meta && key.name == "i"){
                        app.Up();
                        return;
                    }


                    if(key && key.name == "down"){
                        app.Down();
                        return;
                    }

                    if(key && key.meta && key.name == "k"){
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
                    if(key && key.meta && key.name == "p"){
                        app.Clear();
                        return;
                    }
                    if(key && key.ctrl && key.name == "c"){
                        app.Copy();
                        return;
                    }
                }
                if(key && key.meta && key.name == "k"){
                    //app.Exit();
                    return;
                }

                if(key && key.meta && key.name == "q"){
                    app.ChangeMode('default');
                    app.code='';
                    app.ReprintCode();
                    return;
                }
                if(key && key.ctrl && key.name == "s"){
                    app.SaveFile();
                    return;
                }
                if(key && key.ctrl && key.name == "a"){
                    app.selectMode = 2;
                    app.startSelect = 0;//clamp(app.cursor,0,app.code.length-1);
                    app.endSelect = app.code.length-1;
                    app.ReprintCode();
                    return;
                }
                if(key && key.meta && key.name == "m"){
                    app.selectMode++;
                    if(app.selectMode==3){
                        app.selectMode = 0;
                    }
                    if(app.selectMode==0){
                        app.startSelect = -1;
                        app.endSelect = -1;
                    }
                    if(app.selectMode==1){
                        app.startSelect = clamp(app.cursor,0,app.code.length-1);
                        app.endSelect = app.startSelect;
                    }
                    if(app.selectMode==2){
                        app.endSelect = clamp(app.cursor,0,app.code.length-1);
                        if(app.endSelect<app.startSelect){
                            const tg = app.startSelect;
                            app.startSelect = app.endSelect;
                            app.endSelect = tg;
                        }
                    }
                    app.ReprintCode();
                    return;
                }
                if(key && key.meta && key.name == "a"){
                    app.OpenTab(app.currentTabIndex+1);
                    return;
                }
                if(key && key.meta && key.name == "g"){
                    app.NextMode();
                    return;
                }
                if(key && key.meta && key.name == "w"){
                    app.OpenFile(app.fileName);
                    app.ReprintCode();
                    return;
                }
                if(key && key.meta && key.name == "d"){
                    app.NewTab({
                        'cursor': 0,
                        'code': '',
                        'fileName': app.defaultFileName,
                        'mode': app.mode,
                        'cwd': app.cwd,
                        'codeHis':[{
                            'code':'',
                            'cursor':0
                        }],
                        'hisCIndex':0
                    });
                    return;
                }
                if(key && key.meta && key.name == "n"){
                    app.RemoveTab(app.currentTabIndex);
                    return;
                }


                if(key && key.meta && key.name == "s"){
                    app.OpenTabGroup(app.tabGroupIndex+1);
                    return;
                }


                if(key && key.meta && key.name == "f"){
                    app.ReloadConfig();
                    return;
                }

                if(!key.ctrl && !key.meta && app.mode!='fexp' && app.enableTextEditor){
                    if(key.shift){
                        app.AddCode(key.name.toUpperCase());
                    }
                    else{
                        app.AddCode(key.name);
                    }
                }
            }
            else{
                if(app.mode!='fexp' && app.enableTextEditor){
                    app.AddCode(ch);
                }
            }

        }

        this.ReloadConfig();

        this.LoadPlugins();

        this.TryLoadStartFile();
    }

    Search(data){

    }

    Copy(){
        if(this.selectMode!=0)
            ncp.copy(this.code.substring(this.startSelect,this.endSelect+1),function(){

            });
        this.selectMode = 0;
        this.startSelect = -1;
        this.endSelect = -1;
        this.ReprintCode();
    }

    AddTextEditorCommandBar(code){
        let result = '';


        let barName = '\x1b[44m Command \x1b[47m\x1b[46m te \x1b[42m \x1b[47m';

        let barNameLength = 14;

        for(let i=0;i<process.stdout.rows-this.textEditorLineCount-this.GetHeaderLineCount()-this.GetTextEditorCommandLineCount();i++){
            //code+='\n';
        }

        let teCommandCode = this.teCommandCode;

        let teCommandCodeLength = teCommandCode.length;

        if(this.enableTeCommandBar){
            let teCommandCursorChr = teCommandCode[this.teCommandCursor];

            if(teCommandCursorChr == null){
                teCommandCursorChr=' ';
                teCommandCodeLength++;
            }
            
            teCommandCode = teCommandCode.substring(0,this.teCommandCursor)+'\x1b[40m\x1b[37m'+teCommandCursorChr+'\x1b[0m\x1b[30m\x1b[47m'+teCommandCode.substring(this.teCommandCursor+1,this.teCommandCode.length);
    
        }
        else{
            teCommandCode = '';
            teCommandCodeLength = 0;
        }
        
        code+='\n\x1b[0m'+spaces(8)+'|\x1b[47m\x1b[30m'+barName+teCommandCode+spaces(-teCommandCodeLength+process.stdout.columns-9-barNameLength-1-8)+'\x1b[0m|\n';

        // return result;
        return code;
    }

    AddKeypressEventListener(callback){
        this.keypressEventListeners.push(callback);
    }

    TryLoadStartFile(){

        let startFilePath = path.join(this.cwd,'.nide','start.nide');

        if(fs.existsSync(startFilePath)){
            this.RunCode('default',this.ConvertToSimpleEOL(fs.readFileSync(startFilePath).toString()));
        }

        let startJSFilePath = path.join(this.cwd,'.nide','start.js');

        if(fs.existsSync(startJSFilePath)){
            let code = this.ConvertToSimpleEOL(fs.readFileSync(startJSFilePath).toString());
            this.RunCode('js',code);
        }
    }

    GetTabsFiles(){
        let result = [];
        for(let tab of this.tabs){
            result.push(path.normalize(path.join(tab.cwd,tab.fileName)));
        }
        return result;
    }

    LoadPlugins(){
        let globalPlugins = require('./plugins/plugins.json');

        for(let plugin of globalPlugins){
            (require('./plugins/'+plugin))(this);
        }

        let localPluginPath = path.join(this.cwd,'.nide','plugins','plugins.json');
        if(fs.existsSync(localPluginPath)){
            let localPlugins = require(localPluginPath);

            for(let plugin of localPlugins){
                (require(path.join(this.cwd,'.nide','plugins',plugin)))(this);
            }
        }

    }

    ReloadConfig(){
        let configPath = path.join(this.cwd,'.nide','config.json');
        if(fs.existsSync(configPath)){

            let config = JSON.parse(fs.readFileSync(configPath).toString());

            this.defaultFileName = config.defaultFileName;
            this.maxTabsShowed = config.maxTabsShowed;

        }
    }

    ConvertToWindowsEOL(code){
        let result = '';

        for(let c of code){
            if(c=='\n'){
                result+='\r\n';
            }
            else{
                result+=c;
            }
        }

        return result;
    }

    ConvertToSimpleEOL(code){
        let result = '';

        for(let c of code){
            if(c=='\r'){
                result+='';
            }
            else{
                result+=c;
            }
        }

        return result;
    }

    SaveFile(){
        fs.writeFileSync(path.join(this.cwd,this.fileName),this.ConvertToWindowsEOL(this.code));
        this.lastFileOpenedCode = this.code;
        this.fileStatus = '';
        this.ReprintCode();
    }

    ChangeMode(mode){
        this.mode = mode;

        if(mode == 'fexp'){
            this.cursor=0;
            this.cursorLineLevel = 0;
            this.LoadFilesTree();
        }
    }

    Start(){

        this.ReprintCode();

    }

    NextMode(){

        if (this.mode!='fexp'){
            let i = 0;

            for(;i<this.modes.length;i++){
                if(this.modes[i]==this.mode){
                    break;
                }
            }

            let j=i;

            j++;

            if(this.modes.length == j){
                j = 0;
            }

            while(this.modes[j]=='fexp' || this.mode[j]==this.modes[i]){
                j++;
                if(this.modes.length == j){
                    j = 0;
                }
            }

            this.ChangeMode(this.modes[j]);

            this.ReprintCode();
        }
    }

    Exit(){
        this.console.ShowCursor();
        process.exit();
    }

    CompileCode(code,mode){

        if(mode==null){
            mode = this.mode;
        }

        let compiledCode = '';

        if(mode == 'js'){
            compiledCode = `
                return ((nide)=>{

                    ${code}

                });
            `;
        }
        else if(mode == 'py'){
            compiledCode = `${code}`;
        }
        else if(mode == 'default'){

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
                        command = require(__dirname+'/commands/'+args[0]);
                        compiledLine = command(args);
                    }
                    catch(err){
                        compiledCode += err;
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

    ExecCMDCommand_InAnotherWindow(command){
        console.log(`\n`);
        child_process.exec(
            'start cmd.exe /k '+command,
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

        if(this.mode == 'fexp')
            this.LoadFilesTree();
    }

    Log(...args){
        process.stdout.write(spaces(8)+'\x1b[0m\x1b[30m\x1b[1m|\x1b[0m');
        console.log(...args);
    }

    OpenFile(name){
        let fullPath = path.join(this.cwd,name);
        this.fileName = name;
        if(fs.existsSync(fullPath)){

            this.code = this.ConvertToSimpleEOL(fs.readFileSync(fullPath).toString());

            this.lastFileOpenedCode = this.code;

            this.tabs[this.currentTabIndex].code = this.code;

            this.tabGroups[this.tabGroupIndex].tabs = this.tabs;
        }
        else{
            this.code = name+' Not Found!!!';
        }
        this.AddToCodeHis(this.code);

    }

    OpenFile_FULLPATH(fullPath){
        this.cwd = path.dirname(fullPath);
        this.fileName = path.basename(fullPath);



        if(fs.existsSync(fullPath)){

            this.code = this.ConvertToSimpleEOL(fs.readFileSync(fullPath).toString());

            this.lastFileOpenedCode = this.code;

        }
        else{
            this.code = name+' Not Found!!!';
        }
    }

    NewTabGroup(){
        let app = this;
        this.tabGroups.push({
            'tabs':[{
                'cursor': 0,
                'code': '',
                'fileName': app.defaultFileName,
                'mode': app.mode,
                'cwd': app.cwd,
                'codeHis':[{
                    'code':'',
                    'cursor':0
                }],
                'hisCIndex':0
            }],
            'currentTabIndex':0
        });
        this.OpenTabGroup(this.tabGroups.length-1);
    }

    DeleteTabGroup(index){
        if(this.tabGroups.length>1){
            if(index==null){
                index=this.tabGroupIndex;
            }
            this.tabGroups.splice(index,1);
            this.tabGroupIndex = clamp(this.tabGroupIndex,0,this.tabGroups.length-1);
            this.OpenTabGroup(this.tabGroupIndex);
        }
        this.ReprintCode();
    }

    OpenTabGroup(index){
        if(index==this.tabGroups.length){
            index=0;
        }

        this.tabGroupIndex = index;

        this.tabs = this.tabGroups[this.tabGroupIndex].tabs;
        this.currentTabIndex = this.tabGroups[this.tabGroupIndex].currentTabIndex;

        this.OpenTab(this.tabGroups[this.tabGroupIndex].currentTabIndex);

        this.ReprintCode();
    }

    RunCode(mode,code){
        this.AddToCodeHis(this.code);

        if(code==null){
            code = this.code;
        }

        let app = this;

        if(mode==null){
            mode = this.mode;
        }

        if(mode == 'fexp'){
            this.RecalculateCursorLevel();

            if(this.FEXP_itemsTypes[this.FEXP_lines[this.cursorLineLevel]] == 'folder'){
                if(this.FEXP_openedItems[this.FEXP_lines[this.cursorLineLevel]] == null)
                    this.FEXP_openedItems[this.FEXP_lines[this.cursorLineLevel]] = true;
                else
                if(this.FEXP_openedItems[this.FEXP_lines[this.cursorLineLevel]] == false)
                    this.FEXP_openedItems[this.FEXP_lines[this.cursorLineLevel]] = true;
                else
                if(this.FEXP_openedItems[this.FEXP_lines[this.cursorLineLevel]] == true)
                    this.FEXP_openedItems[this.FEXP_lines[this.cursorLineLevel]] = false;

                this.Clear();
            }
            else if(this.FEXP_itemsTypes[this.FEXP_lines[this.cursorLineLevel]] == 'file'){

                let filePath = this.FEXP_lines[this.cursorLineLevel];

                let tabFiles = this.GetTabsFiles();

                let isOpened = false;

                let i=0;

                for(;i<tabFiles.length;i++){
                    let tabFile = tabFiles[i];
                    if(tabFile == path.normalize(filePath)){
                        isOpened = true;
                        break;
                    }
                }

                if(isOpened){
                    this.OpenTab(i);
                }
                else{
                    this.NewTab({
                        'cursor': 0,
                        'code': '',
                        'fileName': path.basename(filePath),
                        'mode': this.mode,
                        'cwd': path.dirname(filePath),
                        'codeHis':[{
                            'code':'',
                            'cursor':0
                        }],
                        'hisCIndex':0
                    });

                    this.ChangeMode('default');

                    this.OpenFile_FULLPATH(filePath);

                    this.ReprintCode();
                }

            }

            return;

        }


        let compiledCode = this.CompileCode(code,mode);

        if(mode == 'js'){
            try{
                let func = Function(compiledCode)();

                this.lastFileOpenedCode = this.code;

                console.clear();

                process.stdout.write(this.AddCoderHeader(''));

                return (func(this));
            }
            catch(err){
                console.error(err);
            }
        }
        else if(mode == 'py'){

            let cacheFilePath = this.cwd + '/' + this.fileName;//'/nide_code.py';

            //fs.writeFileSync(cacheFilePath,compiledCode);

            this.lastFileOpenedCode = this.code;

            console.clear();

            process.stdout.write(this.AddCoderHeader(''));

            child_process.exec('start cmd.exe /k py "'+cacheFilePath+'"',{cwd:this.cwd}, (err, stdout, stderr) => {
                if (err) {
                    console.log(`${err}`);
                    return;
                }

                console.log(`${stdout}`);
            });

        }
        else if(mode == 'default'){
            try{

                this.lastFileOpenedCode = this.code;

                console.clear();
                process.stdout.write(this.AddCoderHeader(''));

                let func = Function(compiledCode)();

                let r = (func(this));

                return r;
            }
            catch(err){
                console.error(err);
            }

        }

    }

    LogWithLineIndex(data,lineLevel){
        for(let obj of data){
            this.LogObjectWithLineIndex(obj,lineLevel);
        }
    }

    LogObjectWithLineIndex(obj,lineLevel){
        process.stdout.write('\x1b[30m\x1b[1m' + spaces(6 - lineLevel.toString().length+1) + lineLevel + ' |\x1b[0m');

        let GetObjStr = function(){



        }

        process.stdout.write(GetObjStr(obj));


        process.stdout.write('\n');
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

        this.codeHis = this.tabs[this.currentTabIndex].codeHis;
        this.hisCIndex = this.tabs[this.currentTabIndex].hisCIndex;

        this.tabGroups[this.tabGroupIndex].tabs = this.tabs;
        this.tabGroups[this.tabGroupIndex].currentTabIndex = this.currentTabIndex;

        this.ReprintCode();
    }

    RemoveTab(index){
        if(this.tabs.length>1){
            this.tabs.splice(index,1);
            this.currentTabIndex = clamp(this.currentTabIndex,0,this.tabs.length-1);
            this.OpenTab(this.currentTabIndex);
        }

        this.tabGroups[this.tabGroupIndex].tabs = this.tabs;
        this.tabGroups[this.tabGroupIndex].currentTabIndex = this.currentTabIndex;
    }

    NewTab(newTab){

        this.tabs.push(newTab);

        this.OpenTab(this.tabs.length-1);

        this.tabGroups[this.tabGroupIndex].tabs = this.tabs;
        this.tabGroups[this.tabGroupIndex].currentTabIndex = this.currentTabIndex;
    }

    Left(){

        let newCursor = this.cursor;

        if(this.mode!='fexp'){
            this.cursor = clamp(newCursor-1,0,this.code.length);

            this.ReprintCode();
        }
        else{
            newCursor--;
            this.cursor = clamp(newCursor,0,this.code.length);
            this.ReprintCode();
        }
    }

    Right(){

        let newCursor = this.cursor;

        if(this.mode!='fexp'){
            this.cursor = clamp(newCursor+1,0,this.code.length);

            this.ReprintCode();
        }
        else{
            newCursor++;
            this.cursor = clamp(newCursor,0,this.code.length);
            this.ReprintCode();
        }
    }

    Up(){

        let startLine = this.cursor-1;

        for(; startLine>=0; startLine--){
            if(this.code[startLine]=='\n'){
                break;
            }
        }

        let x = this.cursor - startLine;

        let newCursor = startLine-1;

        for(let i = newCursor; i>=0; i--){
            if(this.code[i]=='\n'){
                newCursor = i;
                break;
            }
        }

        x = Math.min(startLine - newCursor, x);

        this.cursor=clamp(newCursor + x,0,this.code.length);

        this.ReprintCode();
    }

    Down(){

        let startLine = this.cursor-1;

        for(; startLine>=0; startLine--){
            if(this.code[startLine]=='\n'){
                break;
            }
        }

        let x = this.cursor - startLine;

        let newCursor = this.cursor;

        for(let i = newCursor; i<this.code.length; i++){
            if(this.code[i]=='\n'){
                newCursor = i;
                break;
            }
        }

        let newCursor2 = newCursor+1;

        for(let i = newCursor2; i<this.code.length; i++){
            if(this.code[i]=='\n'){
                newCursor2 = i;
                break;
            }
        }


        x = Math.min(newCursor2 - newCursor, x);
        

        this.cursor=clamp(newCursor + x,0,this.code.length);

        this.ReprintCode();
    }

    DeleteCurrentLine(){

        let newCursor = this.cursor-1;

        for(let i = newCursor; i>=0; i--){
            if(this.code[i]=='\n' || i==0){
                newCursor=i;
                break;
            }
        }

        let newCursor2 = this.cursor;

        for(let i = newCursor2; i<this.code.length; i++){
            if(this.code[i]=='\n' || i==this.code.length-1){
                newCursor2=i;
                break;
            }
        }

        newCursor  = clamp(newCursor,0,this.code.length);
        newCursor2 = clamp(newCursor2,0,this.code.length);

        this.AddToCodeHis(this.code);

        let copyData = this.code.substring(newCursor+2,newCursor2);

        ncp.copy(copyData,function(){

        });
        
        this.selectMode = 0;
        this.startSelect = -1;
        this.endSelect = -1;

        this.code = this.code.substring(0,newCursor+1) + this.code.substring(newCursor2+1,this.code.length);

        this.cursor=newCursor+1;

        this.ReprintCode();

    }

    ReplaceAll(word1,word2){
        this.code = this.code.replaceAll(word1,word2);
        this.cursor = clamp(this.cursor,0,this.code.length);

        this.AddToCodeHis(this.code);

        this.ReprintCode();
    }

    AddCode(key){

        if(this.selectMode == 0){

            let cursor_offset = 0;
    
            if(this.mode=='js' || this.mode=='py' || this.mode == 'default'){
                if(key=='[' && this.code[this.cursor]!=']'){
                    key+=']';
                    cursor_offset = -1;
                }
                if(key=='"' && this.code[this.cursor]!='"'){
                    key+='"';
                    cursor_offset = -1;
                }
    
                if(this.mode=='js')
                    if(key=='`' && this.code[this.cursor]!='`'){
                        key+='`';
                        cursor_offset = -1;
                    }
    
                if(key=="'" && this.code[this.cursor]!="'"){
                    key+="'";
                    cursor_offset = -1;
                }
                if(key=='{' && this.code[this.cursor]!='}'){
                    key+='}';
                    cursor_offset = -1;
                }
                if(key=='(' && this.code[this.cursor]!=')'){
                    key+=')';
                    cursor_offset = -1;
                }
    
                if(key==')' && this.code[this.cursor]==')'){
                    key='';
                    cursor_offset = 1;
                }
                if(key==']' && this.code[this.cursor]==']'){
                    key='';
                    cursor_offset = 1;
                }
                if(key=='}' && this.code[this.cursor]=='}'){
                    key='';
                    cursor_offset = 1;
                }
                
                if(key=='"' && this.code[this.cursor]=='"'){
                    key='';
                    cursor_offset = 1;
                }
                
                if(key=="'" && this.code[this.cursor]=="'"){
                    key='';
                    cursor_offset = 1;
                }
                
                if(key=='`' && this.code[this.cursor]=='`'){
                    key='';
                    cursor_offset = 1;
                }
            }
    
            this.code = this.code.substring(0,this.cursor) + key + this.code.substring(this.cursor,this.code.length);
            this.cursor = clamp(this.cursor+key.length+cursor_offset,0,this.code.length);
        }
        else{
            this.Delete();
            this.AddCode(key);
        }

        this.selectMode = 0;
        this.startSelect = -1;
        this.endSelect = -1;

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
                this.codeHis.splice(this.hisCIndex+1,this.codeHis.length-this.hisCIndex);
                this.codeHis.push({
                    'code':code,
                    'cursor':this.cursor
                });
                this.hisCIndex++;
            }
        }
        

        this.tabs[this.currentTabIndex].codeHis = this.codeHis;
        this.tabs[this.currentTabIndex].hisCIndex = this.hisCIndex;
        

        this.tabGroups[this.tabGroupIndex].tabs = this.tabs;
        this.tabGroups[this.tabGroupIndex].currentTabIndex = this.currentTabIndex;

    }

    Undo(){

        this.hisCIndex = clamp(this.hisCIndex-1,0,this.codeHis.length-1);


        this.selectMode = 0;
        this.startSelect = -1;
        this.endSelect = -1;

        this.code = this.codeHis[this.hisCIndex].code;
        this.cursor = this.codeHis[this.hisCIndex].cursor;
        

        this.tabs[this.currentTabIndex].codeHis = this.codeHis;
        this.tabs[this.currentTabIndex].hisCIndex = this.hisCIndex;
        

        this.tabGroups[this.tabGroupIndex].tabs = this.tabs;
        this.tabGroups[this.tabGroupIndex].currentTabIndex = this.currentTabIndex;

        this.ReprintCode();
    }

    Redo(){
        this.hisCIndex = clamp(this.hisCIndex+1,0,this.codeHis.length-1);


        this.selectMode = 0;
        this.startSelect = -1;
        this.endSelect = -1;

        this.code = this.codeHis[this.hisCIndex].code;
        this.cursor = this.codeHis[this.hisCIndex].cursor;
        

        this.tabs[this.currentTabIndex].codeHis = this.codeHis;
        this.tabs[this.currentTabIndex].hisCIndex = this.hisCIndex;
        

        this.tabGroups[this.tabGroupIndex].tabs = this.tabs;
        this.tabGroups[this.tabGroupIndex].currentTabIndex = this.currentTabIndex;

        this.ReprintCode();
    }

    Backspace(){
        if(this.selectMode == 0){
            this.code = this.code.substring(0,this.cursor-1) + this.code.substring(this.cursor,this.code.length);
            this.cursor = clamp(this.cursor-1,0,this.code.length);

        }
        else{
            this.code = this.code.substring(0,this.startSelect) + this.code.substring(this.endSelect+1,this.code.length);
        }

        this.selectMode = 0;
        this.startSelect = -1;
        this.endSelect = -1;

        this.AddToCodeHis(this.code);

        this.ReprintCode();
    }

    Delete(){
        if(this.selectMode == 0){
            this.code = this.code.substring(0,this.cursor) + this.code.substring(this.cursor+1,this.code.length);

        }
        else{
            this.code = this.code.substring(0,this.startSelect) + this.code.substring(this.endSelect+1,this.code.length);
        }

        this.selectMode = 0;
        this.startSelect = -1;
        this.endSelect = -1;


        this.AddToCodeHis(this.code);

        this.ReprintCode();
    }

    Clear(){
        this.code = '';

        this.LoadFilesTree();

        this.AddToCodeHis(this.code);

        this.ReprintCode();
    }

    LoadFilesTree(){

        let app = this;

        function loadFilesTree(itemPath){
            let name = path.basename(path.normalize(itemPath));

            if(name==''){
                name = itemPath
            }

            let result = {
                'path':path.normalize(itemPath),
                'name':name,
                'childs':[]
            }

            let stat = fs.statSync(itemPath);

            if(stat.isDirectory()){
                let items = fs.readdirSync(itemPath);

                if(app.FEXP_openedItems[result.path])
                    for(let item of items){

                        try{
                            let newChild = loadFilesTree(path.join(itemPath,item));

                            result.childs.push(newChild);
                        }
                        catch{

                        }

                    }

                result.type='folder';
            }
            else{
                result.type='file';
            }

            app.FEXP_itemsTypes[path.normalize(itemPath)] = result.type;

            return result;
        }

        this.filesTree=loadFilesTree(this.cwd);

    }

    LoadFilesToCode(){

        //this.LoadFilesTree();

        let app = this;

        this.currentFileLevel = 1;

        let maxLevel = this.currentFileLevel;

        let FEXP_lines = [];

        let GetStrFromItem = function(item,level){

            let childsStr = '';

            FEXP_lines.push(item.path);

            if(level<maxLevel || (app.FEXP_openedItems[path.normalize(item.path)] == true))
                for(let child of item.childs){
                    if((()=>{
                        for(let checker of app.FEXP_hideChecks){
                            if(checker(child.name)){
                                return true;
                            }
                        }
                        return false;
                    })()){

                    }
                    else
                    childsStr+=spaces((level+1)*2)+GetStrFromItem(child,level+1);
                }

            let name = item.name;

            if(item.type == 'folder'){
                name = ''+name;
                if((app.FEXP_openedItems[path.normalize(item.path)] == true)){
                    name = ' ▾ '+name;
                    name += '';
                }
                else{
                    name = ' ▸ '+name;
                    name += '';
                }
            }
            else{
                name = '   '+name;
            }


            return `${name}\n${childsStr}`;
        }

        let level = 0;

        this.code = (GetStrFromItem(this.filesTree,level));

        app.FEXP_lines = FEXP_lines;

    }

    RecalculateCursorLevel(){
        let cursorLineLevel = 0;

        for(let i = 0;i<this.code.length;i++){
            if(i>=this.cursor){
                break;
            }

            if(this.code[i] == '\n'){
                cursorLineLevel++;

                if(i>=this.cursor){
                    break;
                }

            }

        }

        this.cursorLineLevel = cursorLineLevel;
    }

    CompileColorSyntax(code){
        let r='';
        for(let i=0;i<code.length;i++){

            if(code[i]=='<'){
                let start = i;
                for(;i<code.length;i++){
                    if(code[i]=='>'){
                        break;
                    }
                }
                let end = i;
                let colorCode = code.substring(start+1,end);
                r+=`\x1b[${colorCode}m`;
                continue;
            }

            r += code[i];

        }
        return r;
    }

    GetHeaderLineCount(){
        return this.tabGroups.length+4;
    }

    GetTextEditorCommandLineCount(){
        return 2;
    }

    GetMaxHeight(){
        return process.stdout.rows - this.GetHeaderLineCount() - 1 - this.GetTextEditorCommandLineCount();
    }

    FEXPHideFile(str){
        let newStr = `return ((nide)=>{
            var EndWith = function(str){
                const s = str;
                var r = function(name){

                    return (name.substring(name.length - s.length,name.length) == s);

                }
                return r;
            };
            return [${str}];
        })`;
        var result = [];
        try{
            result = ((Function(newStr)())(this));
        }
        catch{

        }
        this.FEXP_hideChecks = result;
    }

    ReprintCode(option){
        console.clear();

        this.maxHeight = this.GetMaxHeight();

        this.console.HideCursor();

        var app = this;

        if(this.mode == 'fexp'){
            this.LoadFilesToCode();
        }

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


        this.RecalculateCursorLevel();

        let haveSpaceAfterNewLine = false;

        if(!(option.printColoredCode == true)){
            if(this.cursor<this.code.length){
                if(this.code[this.cursor] == '\n'){
                    haveSpaceAfterNewLine = true;
                    coloredCode = this.code.substring(0,this.cursor) + '\x1b[46m' + ' \x1b[45m\x1b[30m' + this.code[this.cursor] + '' + this.code.substring(this.cursor+1,this.code.length);

                }
                else{
                    coloredCode = this.code.substring(0,this.cursor) + '\x1b[46m' + this.code[this.cursor] + (()=>{
                        if(app.cursor >= app.startSelect && app.cursor < app.endSelect && app.selectMode!=0){
                            return '\x1b[30m\x1b[47m';
                        }
                        return '\x1b[45m\x1b[30m';
                    })() + this.code.substring(this.cursor+1,this.code.length);

                }
            }
            else{
                coloredCode = this.code.substring(0,this.code.length) + '\x1b[46m' + ' ' + '\x1b[45m\x1b[30m';
            }
        }


        this.startSelectAfterColored = this.startSelect;
        this.endSelectAfterColored = this.endSelect;
        this.cursorAfterColored = this.endSelect;
        
        this.afterStartSelectLine = 0;
        this.beforeEndSelectLine = 0;

        let j = 0;
        let lineLevel = 0;
        let lineLevel2 = 0;
        let endSelectAfterColoredLineLevel = 0;
        for(let i=0;i<coloredCode.length;i++){
            if(coloredCode[i] == '\x1b' && coloredCode[i+1] == '['){
                i+=1;
                for(;i<coloredCode.length;i++){
                    if(coloredCode[i]=='m'){
                        break;
                    }
                }
                continue;
            }

            if(coloredCode[i]=='\n'){
                lineLevel++;
            }

            if(j == this.startSelect){
                this.startSelectAfterColored = i;
                this.afterStartSelectLine = lineLevel+1;
                if(coloredCode[i]=='\n'){
                    this.afterStartSelectLine = lineLevel;
                }
            }

            if(j == this.endSelect){
                this.endSelectAfterColored = i;
                endSelectAfterColoredLineLevel = lineLevel;
                lineLevel2 = lineLevel;
                this.beforeEndSelectLine = lineLevel-1;
            }

            if(j == this.cursor){
                this.cursorAfterColored = i;
            }

            if(coloredCode[i]=='\n'){
                if(haveSpaceAfterNewLine){
                    if(lineLevel-1 == this.cursorLineLevel){
                        continue;
                    }
                }
            }

            j++;
        }



        if(this.startSelect>=0 && this.endSelect>=0){

           let offset = 0;

            if(this.startSelectAfterColored != this.cursorAfterColored){
               offset += 10;
               coloredCode = coloredCode.substring(0,this.startSelectAfterColored) + '\x1b[47m\x1b[30m' + coloredCode[this.startSelectAfterColored] + '' + coloredCode.substring(this.startSelectAfterColored+1,coloredCode.length); 
            }

            if(this.endSelectAfterColored != this.cursorAfterColored){
                coloredCode = coloredCode.substring(0,this.endSelectAfterColored+offset) + coloredCode[this.endSelectAfterColored+offset] + (()=>{
                    if(lineLevel2 == app.cursorLineLevel){
                        return '\x1b[30m\x1b[45m';
                    }
                    return '\x1b[0m';
                })() + coloredCode.substring(this.endSelectAfterColored+offset+1,coloredCode.length); 
            }
        }

        if(this.mode == 'fexp'){
            //coloredCode = this.CompileColorSyntax(coloredCode);
        }

        let newCode = withLineIndicesCode(coloredCode,6,this.cursorLineLevel,this);

        newCode = this.AddFileExplorer(newCode);

        newCode = this.OptimizeCode(newCode);

        newCode = this.AddCoderHeader(newCode);

        newCode = this.AddTextEditorCommandBar(newCode);

        this.WriteLines(newCode);

        this.console.HideCursor();
    }

    TabsString(groupIndex){

        let tabFileNames = '';

        let startI = this.tabGroups[groupIndex].currentTabIndex;

        let endI = this.tabGroups[groupIndex].tabs.length-1;

        if(this.tabGroups[groupIndex].tabs.length - this.tabGroups[groupIndex].currentTabIndex < this.maxTabsShowed){
            startI = clamp(this.tabGroups[groupIndex].tabs.length-this.maxTabsShowed,0,this.tabGroups[groupIndex].tabs.length-1);
        }

        if(endI - startI + 1 > this.maxTabsShowed){
            endI = clamp(startI+this.maxTabsShowed-1,0,this.tabGroups[groupIndex].tabs.length-1);
        }

        for(let i=startI;(i<=endI);i++){
            let tab = this.tabGroups[groupIndex].tabs[i];

            if(this.tabGroups[groupIndex].currentTabIndex == i){
                if(this.tabGroupIndex != groupIndex)
                    tabFileNames+='\x1b[0m\x1b[37m '+(tab.fileName)+' \x1b[0m';
                else
                    tabFileNames+='\x1b[42m\x1b[30m '+(tab.fileName)+' \x1b[0m';
            }
            else{
                if(this.tabGroupIndex != groupIndex)
                    tabFileNames+=`\x1b[30m\x1b[1m ${tab.fileName} `;
                else
                    tabFileNames+=`\x1b[47m\x1b[30m ${tab.fileName} `;
            }

            if(!(i == endI)){
                if(this.tabGroupIndex != groupIndex)
                    tabFileNames+='\x1b[30m\x1b[1m|\x1b[0m';
                else
                    tabFileNames+='\x1b[0m|\x1b[0m';
            }

        }


        tabFileNames = `${tabFileNames}`;

        if(startI==0 || this.tabGroups[groupIndex].tabs.length<=this.maxTabsShowed){
           tabFileNames = '\x1b[0m'+tabFileNames;
        }
        else{
           tabFileNames = '\x1b[30m\x1b[1m...\x1b[0m'+tabFileNames;
        }

        if(endI==this.tabGroups[groupIndex].tabs.length-1 || this.tabGroups[groupIndex].tabs.length<=this.maxTabsShowed){
           tabFileNames += '\x1b[0m';
        }
        else{
           tabFileNames += '\x1b[30m\x1b[1m...\x1b[0m';
        }

        if(groupIndex != groupIndex)
            return `        \x1b[0m\x1b[30m\x1b[1m|${tabFileNames}\x1b[0m\x1b[30m\x1b[1m|`;
        else
            return `        \x1b[0m|${tabFileNames}\x1b[0m|`;
    }

    TabGroupsString(){
        let result = '';

        for(let i=0;i<this.tabGroups.length;i++){
            result+=this.TabsString(i);
            if(i!=this.tabGroups.length-1){
                result+='\n';
            }
        }

        return result;
    }

    AddCoderHeader(code){
        let newCode = code;
        // newCode = '>  \x1b[36mFILE NAME \x1b[0m :  \x1b[33m'+this.fileName+'\x1b[37m'+this.fileStatus+'\n\n' + newCode;
        // newCode = '>  \x1b[36mCWD       \x1b[0m :  \x1b[33m'+this.cwd+'\x1b[37m\n' + newCode;
        // newCode = '>  \x1b[36mMODE      \x1b[0m :  \x1b[33m'+this.mode+'\x1b[37m\n' + newCode;

        let modeName = this.mode;

        if(modeName.length>7){
            modeName = modeName.substring(0,8);
        }

        newCode = '\n'+newCode;

        let cwd = this.cwd;

        if(cwd[cwd.length-1]=='\\'){
            cwd=cwd.substring(0,cwd.length-1);
        }

        newCode = `${spaces(8)}| ${spaces(7-modeName.length)}${modeName} |\x1b[0m\x1b[46m\x1b[30m ${cwd} \x1b[42m\\\x1b[43m\x1b[30m ${this.fileName}${this.fileStatus} \x1b[0m\n` + newCode;

        newCode = '\n' + this.TabGroupsString() + '\n\n' + newCode;

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

        this.textEditorLineCount = eI+1-bI;

        for(let i=bI;i<=eI;i++){

            newCode+=(lines[i]);

            if(i!=eI){
                newCode+=('\n');
            }

        }

        for(let i=0;i<process.stdout.rows-this.textEditorLineCount-this.GetHeaderLineCount()-this.GetTextEditorCommandLineCount();i++){
            if(i!=(process.stdout.rows-this.textEditorLineCount-this.GetHeaderLineCount()-this.GetTextEditorCommandLineCount()-1))
                newCode+='\n\x1b[0m'+spaces(6)+'\x1b[0m\x1b[30m\x1b[1m~ |';
            else
                newCode+='\n';
        }

        return newCode;
    }

    GetFileExplorerLine=function(lineLevel){
        return '';
    }

    AddFileExplorer(code){
        let newCode = '';

        let lineLevel = 0;

        newCode+=this.GetFileExplorerLine(lineLevel);

        for(let i = 0; i<code.length; i++){

            let c = code[i];

            if(code[i]=='\n'){
                lineLevel++;

                newCode += '\n'+this.GetFileExplorerLine(lineLevel);

                continue;
            }

            newCode+=c;

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
            else{
                process.stdout.write('\x1b[0m');
            }

            // if(i==this.maxHeight){
            //     process.stdout.write('\x1b[0m');
            //     break;
            // }

        }

    }

}

module.exports = Nide;