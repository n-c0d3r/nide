module.exports = (args)=>{
    let command = '';
    for(let i=0;i<args.length;i++){
        command += args[i];
        if(i!=args.length-1){
            command += ' ';
        }
    }
    return `
        nide.ExecCMDCommand('${command}');
        nide.code='';
        nide.ReprintCode();
    `;
}