module.exports = (args)=>{
    return `
        nide.ChangeLang('js');
        nide.CF(${args[1]});
        nide.OpenFile(${args[1]});
        nide.ReprintCode();
    `;
}