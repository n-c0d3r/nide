module.exports = (args)=>{
    return `
        nide.code='';
        nide.CF(${args[1]});
        nide.ReprintCode();
    `;
}