var Accounts = require("aion-web3-eth-accounts");
var Web3 = require('aion-web3')
var web3 = new Web3();
var chai = require('chai');
var assert = chai.assert;
var utils = require('aion-web3-utils');

var aionLib = require('aion-lib');
var toBuffer = aionLib.formats.toBuffer;
var nacl = aionLib.crypto.nacl;

let accounts = [{
    address: '0xa0202797a7aff86fec1a5d8b7cacea276de5bcfc2e8b14878c9ba48d7d5330a0',
    privateKey: '0x6df86a106f599c78ab9b2ad593b2983038edf706a52b24bfa895b49066a7f2a03ddfb8596435b9530b5e635736c801c1403578b85e582d98dd7a322ddfb1e4c1',
    message: 'account 0: aion-pub-sig --- vvv',
    signature: '0x3ddfb8596435b9530b5e635736c801c1403578b85e582d98dd7a322ddfb1e4c1f72fe8ee91489d32d0552a10fa33b3f9f56466f3c9565e1a32abee4197da18631f5311fc47adf698aeb6e1ea8e3798d358519dda5442196b05964f6dbd97d10a',
}, {
    address: '0xa0202797a7aff86fec1a5d8b7cacea276de5bcfc2e8b14878c9ba48d7d5330a0',
    privateKey: '0x6df86a106f599c78ab9b2ad593b2983038edf706a52b24bfa895b49066a7f2a03ddfb8596435b9530b5e635736c801c1403578b85e582d98dd7a322ddfb1e4c1',
    message: 'account 0: aion-pub-sig --- vvv',
    signature: '0x3ddfb8596435b9530b5e635736c801c1403578b85e582d98dd7a322ddfb1e4c1f72fe8ee91489d32d0552a10fa33b3f9f56466f3c9565e1a32abee4197da18631f5311fc47adf698aeb6e1ea8e3798d358519dda5442196b05964f6dbd97d10a',
}];

describe("eth", function () {
  describe("accounts", function () {
    it("test nacl sign", function() {

      let acc = accounts[0];
      let sk = toBuffer(acc.privateKey);
      let pk = toBuffer(nacl.sign.keyPair.fromSecretKey(sk).publicKey);
      let msg = toBuffer(acc.message);
      
      // sign the message 
      let sigNacl = toBuffer(nacl.sign.detached(msg, sk));

      // verify the message was signed correctly
      assert(nacl.sign.detached.verify(msg, sigNacl, pk) === true);
      console.log("nacl signature:\n0x"+sigNacl.toString('hex'));

      // create an aion address from the pk
      let address = aionLib.accounts.createA0Address(pk);
      console.log("aion address:\n"+address.toString('hex'));        
    });

    // test recover function
    it("aion public signature", function() {
      let acc = accounts[0];
      let sk = toBuffer(acc.privateKey);
      let pk = toBuffer(nacl.sign.keyPair.fromSecretKey(sk).publicKey);
      let msg = toBuffer(acc.message);

      // generate the "aion public signature"
      let aionAccounts = new Accounts();

      let accSign = aionAccounts.sign(msg, sk);
      let aionSig = toBuffer(accSign.signature);
      let aionMsgHash = toBuffer(accSign.messageHash);

      // re-construct the "aion public signature" manually

      // 1. prepend the preample to the message
      let preamble = "\u0015Aion Signed Message:\n" + msg.length;
      let preambleBuffer = Buffer.from(preamble);
      let aionMsg = Buffer.concat([preambleBuffer, msg]);
      
      // 2. hash the message
      let msgHashRecreated = toBuffer(utils.blake2b256(aionMsg));

      // 3. sign the message 
      let sigNacl = toBuffer(nacl.sign.detached(msgHashRecreated, sk));

      // 4. construct the "aion public signature, and print it"
      let aionSigRecreated = toBuffer(Buffer.concat([pk, sigNacl], nacl.sign.publicKeyLength + nacl.sign.signatureLength));
      console.log("aion public signature:\n0x"+aionSigRecreated.toString('hex'));

      assert(aionSig.equals(aionSigRecreated));
      assert(aionMsgHash.equals(msgHashRecreated));
    });
  });
});