var expect = require("chai").expect
var escapeCharacter = require("terminal-escape-char");
var controlSequenceIntroducer = require("./index")

describe("controlSequenceIntroducer", function(){
  it("is correct", function(){
    expect(controlSequenceIntroducer).to.equal(escapeCharacter + "[")
  })
})
