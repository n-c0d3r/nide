module.exports = (args,args2)=>{
    let command = '';
    for(let i=1;i<args.length;i++){
        command += args[i];
        if(i!=args.length-1){
            command += ' ';
        }
    }
    return `
        nide.ExecCMDCommand_InAnotherWindow('${command}');
    `;
}