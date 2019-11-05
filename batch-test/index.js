const axios = require('axios');
const BigNumber = require('bignumber.js');
const timeProfile = require('time-profile');
const util = require('util')

const BASE_URL = "http://127.0.0.1:8545";

const inspect = (obj) => {
  console.log(util.inspect(obj, {showHidden: false, depth: null}))
}

const batchRequest = (payload) => {
  const options = {
    timeout: 0, // infinite
    baseURL: BASE_URL,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: payload
  };

  payload.forEach((v, i) => {
    v.jsonrpc = "2.0";
    v.id = i;
  });

  console.log("Sending RPC Payload");
  console.log("===================");
  inspect(payload);

  return new Promise((resolve, reject) => {
    axios(options)
    .then(response => {

      if (response == null) {
        reject("Received empty response object");
        return;
      }

      if (response.status != 200) {
        reject("Received non-200 status code");
        return;
      }

      if (response.data == null) {
        reject("Rpc endpoint returned bad response");
        return;
      }

      if (!Array.isArray(response.data)) {
        console.log(response.data);
        reject("Received non-array body response for batch call");
        return;
      }

      console.log("Received RPC Response");
      console.log("=====================");
      inspect(response.data);

      const rpcResponse = [];

      // all or nothing. either all calls are successful or failure
      response.data.forEach((v, i) => {
        if (v.error != null) {
          console.log(response.data.error);
          reject("Rpc endpoint responded with error");
          return;
        }

        if (v.id == null) {
          reject("Rpc endpoint returned bad id");
          return;
        }

        if (v.result === undefined) {
          reject("Rpc endpoint returned non-error undefined result");
          return;
        }

        rpcResponse[v.id] = v.result;
      });

      resolve(rpcResponse);
    })
    .catch(err => {
      reject("Caught top-level error in json rpc call.");
      console.log("Top-Level Error");
      console.log("===============")
      console.log(err);
    });
  });
};

const test1 = async (txHash) => {
  const batch = [];
  batch.push({
    method: "eth_blockNumber",
    params: []
  });
  batch.push({
    method: "eth_getBlockByNumber",
    params: ["2529", true]
  });
  batch.push({
    method: "eth_getBalance",
    params: ['0xa0a95b372efe55c77a75364407f0403dfefd3131519ca980b2d92b1d2d7297a7', null]
  });

  const r = await batchRequest(batch);
  console.log("Test1 Success");
};

(async () => {  
  console.log("-------------------------------------------");
  console.log("Test Bench");
  console.log("-------------------------------------------");
  
  await test1();

  console.log("Test Bench Exiting ...");
})().catch((err) => {
  console.log("ERR: top level function chain threw");
  console.log(err);
});
