const core = require('./core.js');
var fs = require('fs');
require('./helper.js');

const ACC_FILE = "accounts.json";
const NUM_ACCOUNTS = 2000;

(async () => {  
  console.log("-------------------------------------------");
  console.log("Generate Accounts List");
  console.log("-------------------------------------------");
  
  let list = [];
  for (let i = 0; i < NUM_ACCOUNTS; i++) {
    list.push(generateRandomAddress())
  }

  fs.writeFile(ACC_FILE, JSON.stringify(list), function(err) {
      if(err) {
        core.log("accounts file failed to save");
        return core.log(err);
      }

      core.log("accounts file saved");
  });

  core.log("exiting ...");
})().catch((err) => {
  core.log("ERR: Top level function chain threw");
  core.log(err);
});