var expect = require("chai").expect
var escapeChar = require("./index")

describe("escapeChar", function(){
  it("is correct", function(){
    expect(escapeChar).to.equal("\u001b")
  })
})
