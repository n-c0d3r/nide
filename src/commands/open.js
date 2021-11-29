module.exports = (args)=>{
    return `
        nide.OpenFile(${args[1]});
        nide.ReprintCode();
    `;
}