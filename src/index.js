#!/usr/bin/env node

let lang = process.argv[2];

if(lang==null){
    lang = 'nide';
}

const Nide = require('./nide');

let option = {
    'lang':lang,
    'cwd':process.cwd()
};

var app = new Nide(option);

app.Start();