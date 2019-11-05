const core = require('./core.js');
var fs = require('fs');
const eventlogsContract = "./contracts/eventlogs.sol"

const deploy = async (_owner, _contract, _inspect=false, gas=null, gasPrice=null) => {
  try {
    const source = fs.readFileSync(_contract, "utf-8");
    const compiled = await core.compile(source);
    if (_inspect) core.inspect(compiled);
    const contractInstance = await core.deploy(compiled, _owner.addr, gas, gasPrice);
    core.log("contract deployed at: " + contractInstance.address);
    return contractInstance;
  } catch (err) {
    core.log("deploy err: " + err);
  }   
}

const trigger = async (_contract, _fromAddr, _toAddr, _data, gas=400000, gasPrice=10000000001) => {
  let request = new Promise((resolve, reject) => {
    _contract.trigger(
      _toAddr, 
      _data, 
      {
        from: _fromAddr,
        gas: gas,
        gasPrice: gasPrice
      }, 
      (err, res) => {
        if (err)
          reject(err);

        resolve(res);
      }
    );
  }); 

  return await request;
}
module.exports.trigger = trigger;

const deployContracts = async (owner, numInstance=1) => {
  core.log("deploying event logs contract ...");

  let contracts = [];

  const deploySuccess = await waitForFinality(numInstance, owner.addr, async () => {
    for (let i = 0; i < numInstance; i++) {
      contracts.push(await deploy(owner, eventlogsContract, true, 400000, 10000000001));
    }
  });

  if (!deploySuccess) {
    core.log("deploy failed ... returning");
    return false;
  }

  return contracts;
}
module.exports.deployContracts = deployContracts;