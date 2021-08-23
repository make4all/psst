import { hello } from "../src/lib";
import 'mocha';
import {expect} from 'chai';

describe('hello world test',() => {
  it('should return hello world', () => {
      const r = hello()
      expect(r).to.equal('hello world!')
  });  
});