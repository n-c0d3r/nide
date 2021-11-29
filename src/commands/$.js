module.exports = (args)=>{
    let command = '';
    for(let i=1;i<args.length;i++){
        command += args[i];
        if(i!=args.length-1){
            command += ' ';
        }
    }
    return `
        nide.code='';
        nide.ReprintCode();
        nide.ExecCMDCommand('${command}');
    `;
}