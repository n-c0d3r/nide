module.exports = (args)=>{
    let command = '';
    for(let i=2;i<args.length;i++){
        command += args[i];
        if(i!=args.length-1){
            command += ' ';
        }
    }

    return `
        ${(()=>{
            if(args[1]=='find'){

                let compiledKeyword = '';
            
                for(let c of command){
                    if(c=='`'){
                        compiledKeyword += '`+"`"+`';
                    }
                    else{
                        compiledKeyword += c;
                    }
                }
            
                compiledKeyword = '`'+compiledKeyword+'`';

                return `nide.TextEditorCommandBarPlugin.Find(${compiledKeyword});`;
            }
            if(args[1]=='replace'){
                return `nide.TextEditorCommandBarPlugin.Replace('${args[2]}','${args[3]}');`;
            }
            if(args[1]=='newdir'){
                return `nide.TextEditorCommandBarPlugin.NewDir(${args[2]});`;
            }
            if(args[1]=='mkdir'){
                return `nide.TextEditorCommandBarPlugin.NewDir(${args[2]});`;
            }
            if(args[1]=='newfile'){
                return `nide.TextEditorCommandBarPlugin.NewFile(${args[2]});`;
            }
            if(args[1]=='rmdir'){
                return `nide.TextEditorCommandBarPlugin.RemoveDir(${args[2]});`;
            }
            if(args[1]=='unlink'){
                return `nide.TextEditorCommandBarPlugin.UnlinkFile(${args[2]});`;
            }
            if(args[1]=='goto'){
                return `nide.TextEditorCommandBarPlugin.Goto(${args[2]});`;
            }
        })()}
    `;
}