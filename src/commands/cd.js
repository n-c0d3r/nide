module.exports = (args,args2)=>{
    return `
        nide.code='';
        nide.CD(${args2[1]});
        nide.ReprintCode();
    `;
}