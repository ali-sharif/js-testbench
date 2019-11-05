const request = require('request');
const config = require('./config.js');
const moment = require('moment');
const Web3 = require('aion-web3');

var BigNumber = require('bignumber.js');
const util = require('util')

const web3 = new Web3(new Web3.providers.HttpProvider(config.provider));
module.exports.web3 = web3;

let rpcNonce = 0;

module.exports.timeout = async (seconds) => {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

module.exports.inspect = (obj) => {
  console.log(util.inspect(obj, {showHidden: false, depth: null}))
}

const log = (s) => {
  const now = moment();
  console.log("[" + now.format() + "] " + s);
}
module.exports.log = log;

const req = (callForm) => {
  // append the id here
  callForm.jsonrpc = "2.0";
  callForm.id = rpcNonce.toString();
  rpcNonce++;

  const options = {
    url: config.provider,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    json: callForm
  }

  return new Promise((resolve, reject) => {
    request(options, (err, resp, body) => {
      //console.log(body);

      if (err)
        reject(err);

      if (!resp || !resp.statusCode || resp.statusCode != 200)
        reject("Request failed with non-200 status code.");

      if(body.error)
        log("Req Err: " + body.error.code + " - " + body.error.message);

      if (body != undefined)
        resolve(body.result);
      else
        resolve(undefined);
    });
  });
}
module.exports.req = req;

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++

module.exports.blockNumber = async () => {
  const resp = await req({
    method: "eth_blockNumber",
    params: []
  });
  return resp;
}

module.exports.getAccounts = async () => {
  const resp = await req({
    method: "eth_accounts",
    params: []
  });
  return resp;
}

module.exports.sendTransaction = async (_from, _to, _value=1, _gas=null, _gasPrice=null, _data=undefined, _nonce=undefined) => {
  const resp = await req({
    method: "eth_sendTransaction",
    params: [{
      from: _from,
      to: _to, 
      value: _value,
      gas: _gas,
      gasPrice: _gasPrice,
      data: _data,
      nonce: _nonce
    }]
  });
  return resp;
}

module.exports.eth_getBalance = async (address) => {
  const resp = await req({
    method: "eth_getBalance",
    params: [address]
  });
  return resp;
}

module.exports.getBalance = async (address, blkNum) => {
  const resp = await req({
    method: "eth_getBalance",
    params: [address, blkNum]
  });
  return resp;
}

module.exports.unlockAccount = async (userAddress, password, duration=undefined) => {
  const resp = await req({
    method: "personal_unlockAccount",
    params: [userAddress, password, duration]
  });
  return resp;
}

module.exports.eth_getCompilers = async () => {
  const resp = await req({
    method: "eth_getCompilers",
    params: []
  });
  return resp;
}

module.exports.getTransaction = async (hash) => {
  const resp = await req({
    method: "eth_getTransactionByHash",
    params: [hash]
  });
  return resp;
}

module.exports.getBlockByNumber = async (blkNum, fullTransactions=false) => {
  const resp = await req({
    method: "eth_getBlockByNumber",
    params: [blkNum, fullTransactions]
  });
  return resp;
}

module.exports.getTransactionReceipt = async (txHash) => {
  const resp = await req({
    method: "eth_getTransactionReceipt",
    params: [txHash]
  });
  return resp;
}

module.exports.getTransactionCount = async (address, blkNum=null) => {
  let blk = blkNum ? blkNum : "latest";
  const resp = await req({
    method: "eth_getTransactionCount",
    params: [address, blk]
  });
  try {
    const count = new BigNumber(resp);
    if (count.isFinite() && count.gte(0)) 
      return count;
  }
  catch (e) {
    log(e);
  }

  return null;
}

// -----------------------------------------------------------------
// Filters
// -----------------------------------------------------------------

module.exports.eth_newFilter = async (filter) => {
  const resp = await req({
    method: "eth_newFilter",
    params: [filter]
  });
  return resp;
}

module.exports.eth_newBlockFilter = async () => {
  const resp = await req({
    method: "eth_newBlockFilter",
    params: []
  });
  return resp;
}

module.exports.eth_newPendingTransactionFilter = async () => {
  const resp = await req({
    method: "eth_newPendingTransactionFilter",
    params: []
  });
  return resp;
}

module.exports.eth_uninstallFilter = async (filterId) => {
  const resp = await req({
    method: "eth_uninstallFilter",
    params: [filterId]
  });
  return resp;
}

module.exports.eth_getFilterChanges = async (filterId) => {
  const resp = await req({
    method: "eth_getFilterChanges",
    params: [filterId]
  });
  return resp;
}

module.exports.eth_getFilterLogs = async (filterId) => {
  const resp = await req({
    method: "eth_getFilterLogs",
    params: [filterId]
  });
  return resp;
}

module.exports.eth_getLogs = async (filter) => {
  const resp = await req({
    method: "eth_getLogs",
    params: [filter]
  });
  return resp;
}

module.exports.eth_hashrate = async () => {
  const resp = await req({
    method: "eth_hashrate",
    params: []
  });
  return resp;
}

module.exports.eth_gasPrice = async () => {
  const resp = await req({
    method: "eth_gasPrice",
    params: []
  });
  return resp;
}

module.exports.eth_protocolVersion = async () => {
  const resp = await req({
    method: "eth_protocolVersion",
    params: []
  });
  return resp;
}

module.exports.eth_getBlockTransactionCountByNumber = async (blkNum) => {
  const resp = await req({
    method: "eth_getBlockTransactionCountByNumber",
    params: [blkNum]
  });
  return resp;
}

module.exports.ops_getAccountState = async (address) => {
  const resp = await req({
    method: "ops_getAccountState",
    params: [address]
  });
  return resp;
}

module.exports.ops_getChainHeadView = async () => {
  const resp = await req({
    method: "ops_getChainHeadView",
    params: []
  });
  return resp;
}

module.exports.ops_getTransaction = async (hash) => {
  const resp = await req({
    method: "ops_getTransaction",
    params: [hash]
  });
  return resp;
}

module.exports.ops_getBlock = async (bnOrId, full=false) => {
  const resp = await req({
    method: "ops_getBlock",
    params: [bnOrId, full]
  });
  return resp;
}

module.exports.ping = async () => {
  const resp = await req({
    method: "ping",
    params: []
  });
  return resp;
}

// -----------------------------------------------------------------
// Contracts
// -----------------------------------------------------------------

module.exports.compile = async function(source){
  return new Promise((resolve, reject) => {
    web3.eth.compile.solidity(source, (err, res) => {
      if(err) {
        reject(err)
      }
      
      if(res) {
        let name = Object.keys(res)[0]
        let compiled = res[name]
        let abi = compiled.info.abiDefinition
        let code = compiled.code
        resolve({
          name: name, 
          abi: abi, 
          binary: code
        });
      }
    })
  })
}

module.exports.deploy = async ({name, abi, binary}, address, gas=null, gasPrice=null) => {
  //console.log("gas: "+gas);
  //console.log("gasPrice: "+gasPrice);

  const options = {
    from: address,
    gas: gas,
    gasPrice: gasPrice,
    data: binary,
  };

  return new Promise((resolve, reject) => {
    web3.eth.contract(abi).new(options, (err, contract) => {
      if (err) {
        log("contract deploy rejected");
        log(err);
        reject(err);
      }

      if (contract && contract.address)
        resolve(contract);
    });
  });
}

module.exports.contract = ({name, abi, binary}, contractAddress) => {
  return web3.eth.contract(abi).at(contractAddress);
}
