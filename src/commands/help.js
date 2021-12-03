module.exports = (args)=>{
    return `
        nide.code = '';

        nide.code+=`+'`MODES:\n     js\n     py\n     fexp`;'+`
        nide.code+=`+'`\n\nKEYS:\n     Alt + O: Run Code, Open Item (FEXP Mode), Run Or Close Command In Text Editor Command Bar\n     Ctrl + O: Enable Or Disable Text Editor Command Bar\n     Alt + P: Clear Code Or Reload Items In FEXP Mode\n     Esc: Exit Nide Tool\n     Alt + Q: Set Mode To Default\n     Alt + M: Get Last Code Saved Or Before Running Code\n     Ctrl + S: Save Code\n     Alt + A: Go To Next Tab\n     Alt + D: Open New Tab\n     Alt + N: Remove Current Tab\n     Alt + W: Reload File\n     Alt + G: Change Mode (Except FEXP Mode)\n     Alt + X: Delete Current Line\n     Alt + S: Change Tab Group\n     Alt + J: The Same As Left Arrow\n     Alt + L: The Same As Right Arrow\n     Alt + K: The Same As Down Arrow\n     Alt + I: The Same As Up Arrow`;'+`                                                       
        nide.code+=`+'`\n\nCOMMANDS:\n     help: Help\n     mode {modeName}: Set Mode\n     cls: Clear Code\n     exit: Exit Nide Tool\n     cd "{path}": Change Directory\n     cp "{partition}": Change Partition\n     cf "{file name}": Change File Name\n     jsopen "{filePath}": Open JS File In JS Mode\n     pyopen "{filePath}": Open PY File In PY Mode\n     open: Open File In Current Mode\n     $ {command}: Run Default Windows Terminal Commands\n     $$ {command}: Run Default Windows Terminal Commands In Another Window\n     newgroup: Create New Tab Group\n     deletegroup {index}: Delete Group By Index\n     deletegroup: Delete Current Group\n     newtab: Create New Tab\n     nexttab: Go To Next Tab\n     reloadfile: Reload Current File\n     te {command}:Run Text Editor Command Bar Command\n     te find {keyword}: Find Keyword\n     te replace {word1} {word2}: Relace Word`;'+`                                                                                                     
        
        nide.ReprintCode();
    `;
}