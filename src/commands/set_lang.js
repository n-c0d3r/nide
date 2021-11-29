module.exports = (args)=>{
    return `
        nide.ChangeLang('${args[1]}');
        nide.code='';
        nide.ReprintCode();
    `;
}