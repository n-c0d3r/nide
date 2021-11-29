module.exports = (args)=>{
    return `
        nide.code='';
        nide.CP(${args[1]});
        nide.ReprintCode();
    `;
}