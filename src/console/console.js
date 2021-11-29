const os = require('os');
var keypress = require('keypress');

var hideCursor = require("hide-terminal-cursor")
var showCursor = require("show-terminal-cursor");

class Console{
    constructor(){

        var consle = this;

        this.keypressEventListeners = new Object();


        var stdin = process.stdin;

        keypress(stdin);

        this.stdin = stdin;

        stdin.setRawMode( true );
        
        stdin.resume();
        
        stdin.setEncoding( 'utf8' );

        stdin.on('keypress', function (ch, key) {
            
            for(let keypressEventListener of Object.keys(consle.keypressEventListeners)){
                consle.keypressEventListeners[keypressEventListener](ch,key);
            }

        });

    }

    SetMousePos(x,y){
        this.robot.moveMouse(x,y);
    }
    
    HideCursor(){
        hideCursor();
    }
    
    ShowCursor(){
        showCursor();
    }

}


module.exports = Console;