#!/usr/bin/env node

let mode = process.argv[2];

if(mode==null){
    mode = 'default';
}

let maxHeight = process.argv[3];

if(maxHeight==null){
    maxHeight = 20;
}

const Nide = require('./nide');

let option = {
    'mode':mode,
    'cwd':process.cwd(),
    'maxHeight':maxHeight
};


var app = new Nide(option);

app.Start();