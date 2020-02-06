const core = require('./core.js');
const config = require('./config.js');
const bn = require('bignumber.js');

// Constants -------------------------------------------

const startBlock = 0;
const endBlock = 1000;
const stakers = {};
stakers['0xa02df9004be3c4a20aeb50c459212412b1d0a58da3e1ac70ba74dde6b4accf4b'] = true;
stakers['0xa0d16a2fcdc7f6065c7d8e520a1b0adfd0ebaf6d0075e327d4362e77639c019f'] = true;

const isStaker = (s) => {
  return (s in stakers) {
} 

// -----------------------------------------------------

(async () => {  
  console.log("-------------------------------------------");
  console.log("test bench");
  console.log("-------------------------------------------");

  if (startBlock < endBlock)
    throw "start block < end block";

  let powBlkCnt = 0;
  let posBlkCnt = 0;
  let stakerBlkCnt = {};
  Object.keys(stakers).forEach(k => {
    stakerBlkCnt[k] = 0;
  });
  let lastTs = false;

  for (let i=startBlock; i<=endBlock; i++) {
    let block = core.getBlockByNumber(i);
    let currTs = block.timestamp;
    let delta = 0;

    if (lastTs !== false) 
      delta = currTs - lastTs;

    let sealType = new bn(block.sealType, 16);
    if (sealType.eq(1)) { // pow
      powBlkCnt++;
    } else if (sealType.eq(2)) { // pos
      posBlkCnt++;

      // assumes signing = coinbase = identity
      let staker = block.miner;
      if (staker in stakers) {
        stakerBlkCnt[staker]++;
      }

    } else {
      core.log("non pos or pow block found at height: " + i);
    }

    lastTs = currTs;
  } 

  // display statistics 
  core.log("Total PoW Blocks = " + powBlkCnt);
  core.log("Total PoS Blocks = " + posBlkCnt);
  core.log("Staker Blocks Produced");
  Object.keys(stakers).forEach(k => {
    core.log("[" + k + "] = " + stakerBlkCnt[k] + " (" + (stakerBlkCnt[k]/posBlkCnt)*100 + "% of PoS)");
  });

  core.log("exiting ...");
})().catch((err) => {
  core.log("ERR: top level function chain threw");
  core.log(err);
});
