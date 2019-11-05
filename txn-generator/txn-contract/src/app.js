const core = require('./core.js');
const config = require('./config.js');
const contract = require('./contract.js');
const accounts = config.accounts;

// include functions in a non-namespaced way
require('./helper.js');
var fs = require('fs');

const BATCH_COUNT = 5000;
const ACC_FILE = "accounts.json";

(async () => {  
  console.log("-------------------------------------------");
  console.log("Test Bench");
  console.log("-------------------------------------------");

  let acc_persistent = [];

  fs.readFile(ACC_FILE, {encoding: 'utf-8'}, function(err, data){
    if(err) {
      core.log("accounts file failed to read");
      return core.log(err);
    }

    acc_persistent = JSON.parse(data);
  });

  // ok, so now we have persistent accounts
  // pick a random account
  // unlock it
  // send 5000 txns to randomly selected receipts
  
  while (true) {
    try {
      let acc_from = accounts[getRandomInt(0, accounts.length - 1)];

      const unlocked = await unlockAccount(acc_from);
      if (!unlocked) {
        core.log("failed to unlock account: " + acc_from.addr);
        continue;
      }

      let contracts = await contract.deployContracts(acc_from, 1);

      const retries = 10;
      const success = await waitForFinality(BATCH_COUNT, acc_from.addr, async () => {  
        for (let i=0; i < BATCH_COUNT; i++) {
          // pick from the persistant list 35% of the time
          let toPersistant = Math.random() < 0.35 ? true : false; 

          let addr_to = acc_from.addr;

          if (toPersistant) {
            let idx = getRandomInt(0, acc_persistent.length - 1);
            //core.log("picked persistant["+idx+"]");
            addr_to = acc_persistent[idx]
          } else {
            //core.log("random address");
            addr_to = generateRandomAddress();
          }

          // fromAddr, toAddr, value, gasLimit, gasPrice
          await contract.trigger(contracts[0], acc_from.addr, addr_to, getRandomInt(1, 100000));
        }

        core.log("sent " + BATCH_COUNT + " transactions from: " + acc_from.addr);
      });
      
      if (!success) {
        core.log("failed to complete transactions ...");
        continue;
      }
    } catch (e) {
      core.log("error: ", e);
      continue;
    }
  }

  core.log("exiting ...");
})().catch((err) => {
  core.log("ERR: Top level function chain threw");
  core.log(err);
});