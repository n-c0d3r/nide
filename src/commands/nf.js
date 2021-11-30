module.exports = (args)=>{
    return `
        nide.code='';
        nide.NF(${args[1]});
        nide.ReprintCode();
    `;
}