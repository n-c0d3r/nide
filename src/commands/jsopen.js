module.exports = (args)=>{
    return `
        nide.ChangeMode('js');
        nide.CF(${args[1]});
        nide.OpenFile(${args[1]});
        nide.ReprintCode();
    `;
}