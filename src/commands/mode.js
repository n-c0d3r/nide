module.exports = (args)=>{
    return `
        nide.ChangeMode('${args[1]}');
        nide.code='';
        nide.ReprintCode();
    `;
}