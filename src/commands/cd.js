module.exports = (args)=>{
    return `
        nide.code='';
        nide.CD(${args[1]});
        nide.ReprintCode();
    `;
}