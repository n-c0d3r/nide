#!/usr/bin/env node

let defaultConfig = require('./config/config.json');

let mode = process.argv[2];

if(mode==null){
    mode = defaultConfig.mode;
}

let maxHeight = process.argv[3];

if(maxHeight==null){
    maxHeight = defaultConfig.maxHeight;
}

const Nide = require('./nide');

const fs = require('fs');

let option = {
    'mode':mode,
    'cwd':process.cwd(),
    'maxHeight':maxHeight
};

fs.writeFileSync(__dirname+'/config/config.json',JSON.stringify(option));

var app = new Nide(option);

app.Start();