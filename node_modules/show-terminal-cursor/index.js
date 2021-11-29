"use strict";

var csi = require("control-sequence-introducer");

function showCursorString() {
  return csi + "?25h";
}

function showCursor() {
  process.stdout.write(showCursorString())
}

module.exports = showCursor;
