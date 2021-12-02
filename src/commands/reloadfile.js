module.exports = (args)=>{
    return `
        nide.OpenFile(nide.fileName);
        nide.ReprintCode();
    `;
}