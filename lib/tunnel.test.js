const t = require('chai').assert;
const tunnel = require('..');
describe('tunnel', () => {

  describe('with a non existing ssh server', () => {
    it('handle invalid ssh server settings');

    it('handle not existing ssh server', () => {
      tunnel();
    });
  });

  describe('with existing ssh server', () => {
    describe('with nothing behind', () => {
      it('yield a connect error');
    });
    
    describe('with something behind', () => {
      it('yield the ready stream');
    });

  });
});
