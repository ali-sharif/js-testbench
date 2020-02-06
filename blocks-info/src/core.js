const request = require('request');
const config = require('./config.js');
const moment = require('moment');
const util = require('util')

//const abi = [{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint128"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint128"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint128"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint128"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"recipient","type":"address"},{"name":"value","type":"uint128"}],"name":"mint","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint128"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint128"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint128"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint128"}],"name":"Approval","type":"event"}];
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

module.exports.getBlockByNumber = async (blkNum, fullTransactions=false) => {
  const resp = await req({
    method: "eth_getBlockByNumber",
    params: [blkNum, fullTransactions]
  });
  return resp;
}

// ** new **
module.exports.eth_getSeedAndDifficulty = async () => {
  const resp = await req({
    method: "eth_getSeedAndDifficulty",
    params: []
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

