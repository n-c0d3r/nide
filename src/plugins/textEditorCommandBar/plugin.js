const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

var enableTeCommandBar = false;

let plugin =  new (class {
    constructor(){
        this.code = '';
        this.cursor = 0;
        this.foundedCursor = [];
        this.isFinding = false;
        this.foundedCursorIndex = 0;
        this.lastFindCommand = '';
    }

    Backspace(){
        this.code = this.code.substring(0,this.cursor-1) + this.code.substring(this.cursor,this.code.length);
        this.cursor = clamp(this.cursor-1,0,this.code.length);

        this.needReprint = true;

        this.nide.teCommandCode = plugin.code;
        this.nide.teCommandCursor = plugin.cursor;
    }

    Delete(){
        this.code = this.code.substring(0,this.cursor) + this.code.substring(this.cursor+1,this.code.length);

        this.needReprint = true;

        this.nide.teCommandCode = plugin.code;
        this.nide.teCommandCursor = plugin.cursor;
    }

    Clear(){
        this.code = '';

        this.needReprint = true;

        this.nide.teCommandCode = plugin.code;
        this.nide.teCommandCursor = plugin.cursor;
    }

    AddCode(key){
        this.code = this.code.substring(0,this.cursor) + key + this.code.substring(this.cursor,this.code.length);
        this.cursor = clamp(this.cursor+key.length,0,this.code.length);

        this.needReprint = true;

        this.nide.teCommandCode = plugin.code;
        this.nide.teCommandCursor = plugin.cursor;
    }


    Left(){

        this.cursor = clamp(this.cursor-1,0,this.code.length);

        this.needReprint = true;

        this.nide.teCommandCode = plugin.code;
        this.nide.teCommandCursor = plugin.cursor;
    }

    Right(){

        this.cursor = clamp(this.cursor+1,0,this.code.length);

        this.needReprint = true;

        this.nide.teCommandCode = plugin.code;
        this.nide.teCommandCursor = plugin.cursor;
    }

    RunCode(){
        let code = 'te '+this.code;
        
        let compiledCode = this.nide.CompileCode(code,'default');

        try{
            let func = Function(compiledCode)();
    
            (func(this.nide));
        }
        catch{

        }

        this.needReprint = true;
    }

    Replace(word1,word2){

        this.nide.ReplaceAll(word1,word2);

        this.code = '';
        this.cursor = 0;

        this.nide.teCommandCode = plugin.code;
        this.nide.teCommandCursor = plugin.cursor;
    }

    FindUp(){
        if(this.foundedCursorIndex-1 == -1){
            this.foundedCursorIndex = this.foundedCursor.length-1;
        }
        else
            this.foundedCursorIndex = clamp(this.foundedCursorIndex-1,0,this.foundedCursor.length-1);

        this.nide.cursor = this.foundedCursor[this.foundedCursorIndex];
    
        this.needReprint = true;
    }

    FindDown(){
        if(this.foundedCursorIndex+1 == this.foundedCursor.length){
            this.foundedCursorIndex = 0;
        }
        else
            this.foundedCursorIndex = clamp(this.foundedCursorIndex+1,0,this.foundedCursor.length-1);

        this.nide.cursor = this.foundedCursor[this.foundedCursorIndex];
    
        this.needReprint = true;
    }

    Find(keyword){

        if(!this.isFinding){

            this.foundedCursor = [];

            

            let code = this.nide.code;
    
            let keywordIndex = code.indexOf(keyword);
    
            let lastKeywordIndex = 0;
    
            while(keywordIndex!=-1){
    
                this.foundedCursor.push(keywordIndex);
    
                keywordIndex = code.indexOf(keyword,keywordIndex+keyword.length);
            }
            

            if(this.foundedCursor.length==0){
                this.isFinding = false;
            }
            else{
                this.foundedCursorIndex = 0;
    
                this.nide.cursor = this.foundedCursor[this.foundedCursorIndex];
        
                // this.code = '';
                // this.cursor = 0;
        
                // this.nide.teCommandCode = plugin.code;
                // this.nide.teCommandCursor = plugin.cursor;
        
                this.isFinding = true;
        
            }

            this.needReprint = true;
    
        }
        else{
            this.foundedCursor = [];
            this.code = '';
            this.cursor = 0;
    
            this.nide.teCommandCode = plugin.code;
            this.nide.teCommandCursor = plugin.cursor;
            this.isFinding = false;
    
            this.needReprint = true;
        }
    }

})();



module.exports = (nide)=>{
    plugin.nide = nide;
    nide.TextEditorCommandBarPlugin = plugin;
    nide.AddKeypressEventListener((ch,key)=>{
        if(key!=null){

            if(key && key.ctrl && key.name == 'l'){
                
                enableTeCommandBar = !enableTeCommandBar;

                if(enableTeCommandBar){
                    plugin.code = '';
                    plugin.cursor = 0;
                    plugin.foundedCursor = [];
                    plugin.isFinding = false;
                    plugin.foundedCursorIndex = 0;

                    nide.teCommandCode = '';
                    nide.teCommandCursor = 0;
                    plugin.code = '';
                    plugin.cursor = 0;
                }

                nide.enableTeCommandBar = enableTeCommandBar;

                nide.ReprintCode();

            }

        }
        
        plugin.needReprint = false;

        (()=>{

            if(enableTeCommandBar){
            
                nide.enableTextEditor = false;
    
                
                if(key!=null){
                    if(key && key.name == "return"){
                        return;
                    }
                    if(key && key.name == "backspace"){
                        plugin.Backspace();
                        return;
                    }
                    if(key && key.name == "delete"){
                        plugin.Delete();
                        return;
                    }
        
                    if(key && key.name == "left"){
                        plugin.Left();
                        return;
                    }
        
                    if(key && key.name == "right"){
                        plugin.Right();
                        return;
                    }
        
                    if(key && key.name == "space"){
                        plugin.AddCode(' ');
                        return;
                    }
        
                    if(key && key.meta && key.name == "p"){
                        plugin.Clear();
                        return;
                    }

                    if(key && key.name == "up"){
                        if(plugin.isFinding){
                            plugin.FindUp();
                        }
                        return;
                    }
    
                    if(key && key.name == "down"){
                        if(plugin.isFinding){
                            plugin.FindDown();
                        }
                        return;
                    }
    
                    if(key && key.meta && key.name == "l"){
                        plugin.RunCode();
                        return;
                    }
        
                    if(!key.ctrl && !key.meta){
                        if(key.shift){
                            plugin.AddCode(key.name.toUpperCase());
                        }
                        else{
                            plugin.AddCode(key.name);
                        }
                    }
                }
                else{
                    plugin.AddCode(ch);
                }
    
            }
            else{
    
                nide.enableTextEditor = true;
                
            }
        })();

        nide.enableTeCommandBar = enableTeCommandBar;

        if(plugin.needReprint){
            nide.ReprintCode();
        }
    });
}