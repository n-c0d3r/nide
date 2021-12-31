module.exports = (args,args2)=>{
    return `
        nide.code='';
        nide.CF(${args2[1]});
        nide.ReprintCode();
    `;
}