"use strict";
var escapeCharacter = require("terminal-escape-char");

var controlSequenceIntroducer = escapeCharacter + "[";

module.exports = controlSequenceIntroducer
