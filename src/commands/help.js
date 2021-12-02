module.exports = (args)=>{
    return `
        nide.code = '';

        nide.code+=`+'`MODES:\n     js\n     py\n     fexp`;'+`
        nide.code+=`+'`\n\nKEYS:\n     Alt + L: Run Code Or Open Item\n     Alt + P: Clear Code Or Reload Items In FEXP Mode\n     Alt + K: Exit Nide Tool\n     Alt + O: Set Mode To Default\n     Alt + M: Get Last Code Saved Or Before Running Code\n     Alt + Q: Save Code\n     Alt + I: Go To Next Tab\n     Alt + J: Open New Tab\n     Alt + N: Remove Current Tab\n     Alt + D: Reload File\n     Alt + G: Change Mode (Except FEXP Mode)\n     Alt + X: Delete Current Line\n     Alt + S: Change Tab Group`;'+`                                                       
        nide.code+=`+'`\n\nCOMMANDS:\n     help: Help\n     mode {modeName}: Set Mode\n     cls: Clear Code\n     exit: Exit Nide Tool\n     cd "{path}": Change Directory\n     cp "{partition}": Change Partition\n     cf "{file name}": Change File Name\n     jsopen "{filePath}": Open JS File In JS Mode\n     pyopen "{filePath}": Open PY File In PY Mode\n     open: Open File In Current Mode\n     $ {command}: Run Default Windows Terminal Commands\n     $$ {command}: Run Default Windows Terminal Commands In Another Window\n     newgroup: Create New Tab Group\n     deletegroup {index}: Delete Group By Index\n     deletegroup: Delete Current Group\n     newtab: Create New Tab\n     nexttab: Go To Next Tab\n     reloadfile: Reload Current File`;'+`                                                                                                     
        
        nide.ReprintCode();
    `;
}