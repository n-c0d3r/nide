#!/usr/bin/env node

let lang = process.argv[2];

if(lang==null){
    lang = 'nide';
}

let maxHeight = process.argv[3];

if(maxHeight==null){
    maxHeight = 20;
}

const Nide = require('./nide');

let option = {
    'lang':lang,
    'cwd':process.cwd(),
    'maxHeight':maxHeight
};


var app = new Nide(option);

app.Start();