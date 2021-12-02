
const fs = require('fs');

const child_process = require('child_process');

module.exports = (nide)=>{
    nide.AddKeypressEventListener((ch,key)=>{
        if(key!=null){

            if(key && key.ctrl && key.name == 'g'){
                child_process.exec('start chrome', (err, stdout, stderr) => {
                    if (err) {
                        console.log(`${err}`);
                        return;
                    }
        
                    console.log(`${stdout}`);
                });
            }

        }
    });
}