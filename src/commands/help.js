module.exports = (args)=>{
    return `
        nide.code = '';
        nide.code+=`+'`KEYS:\n     Alt + L: Run Code\n     Alt + P: Clear Code\n     Alt + K: Exit Nide Tool\n     Alt + O: Set Mode To Default\n\nCOMMANDS:\n     mode {modeName}: Set Mode\n     cls: Clear Code`'+`;
        nide.ReprintCode();
    `;
}