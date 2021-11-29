"use strict";

var csi = require("control-sequence-introducer")

function hideCursorString() {
  return csi + "?25l"
}

function hideCursor() {
  process.stdout.write(hideCursorString())
}

module.exports = hideCursor;
