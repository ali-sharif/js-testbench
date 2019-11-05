var core = require('./core.js');
const fs = require('fs');
var BigNumber = require('bignumber.js');

const UNLOCK_TIME = 86400;
const MAX_RETRIES = 80;

// hack to get 'non-namespaced' includes
(() => {

isHexString = (str) => {
  if((typeof str != "undefined") &&
     (typeof str.valueOf() == "string") && // is string
     (str.length > 0) && // non-empty
     (!isNaN(str)) &&  // can be converted to a number
     str.match(/^0x/)
    ) {
   return true;
  } else {
    return false;
  }
}

unlockAccount = async (_account, _unlockTime=UNLOCK_TIME) => {
  let didUnlock = false;
  let balance = 0;
  try {
    didUnlock = await core.unlockAccount(_account.addr, _account.pass, _unlockTime);
    balance = await core.getBalance(_account.addr);
  } catch (err) {
    core.log("ERR: could not unlock account: " + _account.addr);
    core.log(err);
  }

  core.log("account: " + _account.addr + ", unlocked: " + didUnlock + ", balance: " + BigNumber(balance).shiftedBy(-18).toString(10));
  return didUnlock;
}

unlockAccountList = async (_accounts) => {
  let didUnlockAllAccounts = true;

  // if any of the unlocks returns false, this var becomes false since (X & 0 = 0)
  for (let account of _accounts) {
    const didUnlock = await unlockAccount(account);
    didUnlockAllAccounts = didUnlock && didUnlockAllAccounts;
  }

  return didUnlockAllAccounts;
}

getRandomInt = (_start, _end) => {
  return (Math.floor(Math.random() * _end) + _start);
}

waitForFinality = async (_nonceCount, _address, _callback, _maxRetries=MAX_RETRIES, _timeoutSeconds=2) => {
  const n0 = await core.getTransactionCount(_address);
  core.log("nonce: " + n0.toString(10));

  await _callback();

  // now wait for the last transaction to be included in a block
  let retries = 0;
  while(true) {
    const n1 = await core.getTransactionCount(_address);
    core.log("nonce: " + n1.toString(10));

    const diff = n1.minus(n0);
    if(diff.eq(_nonceCount)) 
      break;
    
    if(diff.gt(_nonceCount) || retries >= _maxRetries) {
      core.log("waitForNonceIncrementBy failed somehow ... returning.");
      return false;
    }

    retries++;
    await core.timeout(_timeoutSeconds);
  }

  return true;
}

randHex = function(len) {
  var maxlen = 8,
      min = Math.pow(16,Math.min(len,maxlen)-1) 
      max = Math.pow(16,Math.min(len,maxlen)) - 1,
      n   = Math.floor( Math.random() * (max-min+1) ) + min,
      r   = n.toString(16);
  while ( r.length < len ) {
     r = r + randHex( len - maxlen );
  }
  return r;
};

generateRandomAddress = function() {
  return "0x"+randHex(64);
}

})(); // hack



