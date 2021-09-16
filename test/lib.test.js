"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sonification_1 = require("../src/sonification");
require("mocha");
var chai_1 = require("chai");
describe('hello world test', function () {
    it('should return hello world', function () {
        var r = sonification_1.hello();
        chai_1.expect(r).to.equal('hello world!');
    });
});
