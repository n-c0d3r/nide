#!/usr/bin/env node

let lang = process.argv[2];

if(lang==null){
    lang = 'nide';
}

let height = process.argv[3];

if(height==null){
    height = 20;
}

const Nide = require('./nide');

let option = {
    'lang':lang,
    'cwd':process.cwd(),
    'height':height
};


var app = new Nide(option);

app.Start();