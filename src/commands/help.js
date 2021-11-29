module.exports = (args)=>{
    return `
        nide.code=`+'`KEYS:\n     Alt + L: Run Code\n     Alt + P: Clear Code\n     Alt + K: Exit Nide Tool\n     Alt + O: Set Lang To Nide\n\nCOMMANDS:\n     lang {langName}: Set Lang\n     cls: Clear Code`'+`;
        nide.ReprintCode();
    `;
}