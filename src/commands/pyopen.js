module.exports = (args)=>{
    return `
        nide.ChangeMode('py');
        nide.CF(${args[1]});
        nide.OpenFile(${args[1]});
        nide.ReprintCode();
    `;
}