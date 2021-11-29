
const fs = require('fs');

const child_process = require('child_process');

module.exports = (nide)=>{
    nide.OpenChrome = function(){
        child_process.exec('start chrome', (err, stdout, stderr) => {
            if (err) {
                console.log(`${err}`);
                return;
            }

            console.log(`${stdout}`);
        });
    }
}