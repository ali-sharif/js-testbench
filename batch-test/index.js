const axios = require('axios');
const BigNumber = require('bignumber.js');
const timeProfile = require('time-profile');
const util = require('util')

const BASE_URL = "http://127.0.0.1:8545";
const DEBUG = true;

const inspect = (obj) => {
  console.log(util.inspect(obj, {showHidden: false, depth: null}))
}

const batchRequest = (payload) => {
  if (!Array.isArray(payload)) {
    console.log("Payload must be an array");
    return null;
  }

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

  if (DEBUG) {
    console.log("Sending RPC Payload");
    console.log("===================");
    inspect(payload);
    console.log("=====================");
  }

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

      if (DEBUG) {
        console.log("Received RPC Response");
        console.log("=====================");
        inspect(response.data);
        console.log("=====================");
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
    params: ["2575", true]
  });
  batch.push({
    method: "eth_getBalance",
    params: ['0xa0a95b372efe55c77a75364407f0403dfefd3131519ca980b2d92b1d2d7297a7', null]
  });

  const r = await batchRequest(batch);

  inspect(r[1]);

  console.log("Test1 Success");
};

const test2 = async (txHash) => {
  const BLOCK_NUM = "2575";
  const BLOCK_HASH = "0xfcd9a5ba816488b693b44d5e5ea3f4a42b6924a54e6330499d8d1a0612b6908d";

  let batch = [];
  batch.push({
    method: "eth_getBlockByNumber",
    params: [BLOCK_NUM, true]
  });
  batch.push({
    method: "ops_getTransactionReceiptListByBlockHash",
    params: [BLOCK_HASH]
  });
  batch.push({
    method: "eth_getBlockByNumber",
    params: [BLOCK_NUM, false]
  });

  let r = await batchRequest(batch);

  const block = r[0];
  const receipts = r[1];
  const txns = r[2].transactions;
  const receiptMap = {};

  if (block.transactions.size != receipts.size) {
    console.log("receipts sizes don't match");
  }

  receipts.forEach((v, i) => {
    receiptMap[v.transactionHash] = v;
    const tExpected = block.transactions[BigNumber(v.transactionIndex).toNumber()];
    
    if (tExpected.hash != v.transactionHash) {
      console.log("receipts transactionHashes mismatch");
    } else {
      // console.log(tExpected.hash + " = " + v.transactionHash);
    }

    if (tExpected.transactionIndex != v.transactionIndex) {
      console.log("receipts transactionIndex mismatch");
    }
  });
  
  batch = [];
  txns.forEach((v, i) => {
    batch.push({
      method: "ops_getTransactionReceiptByTransactionAndBlockHash",
      params: [v, block.hash]
    });
  });

  r = await batchRequest(batch);

  r.forEach((v, i) => {
    expected = receiptMap[v.transactionHash];
    if (JSON.stringify(expected) !== JSON.stringify(v)) {
      console.log("transaction not equal to expected");
      console.log("expected:");
      inspect(expected);
      console.log("observed:");
      inspect(v)
    }
  });
  
  console.log("Test2 Success");
};

const test3 = async (txHash) => {
  const batch = [];
  for (let i = 2000; i < 2650; i++) {
    batch.push({
      method: "eth_getBlockByNumber",
      params: [i, false]
    });
  }

  const r = await batchRequest(batch);

  console.log("Test3 Success");
};

const test4 = async (txHash) => {
  let batch = [];
  batch.push({
    method: "eth_getBlockByNumber",
    params: ["2571", false]
  });

  let r = await batchRequest(batch);
  const txns = r[0].transactions;

  batch = [];
  txns.forEach((v, i) => {
    batch.push({
      method: "ops_getTransactionReceiptByTransactionAndBlockHash",
      params: [v, "0x864f6cbe2828b6082bee0c6db7f5a40beed984f166c05e545a269d37e9c797da"]
    });
  });

  r = await batchRequest(batch);

  console.log("Test4 Success");
};

const test5 = async (txHash) => {
  const batch = [];
  batch.push({
    method: "ops_getTransactionReceiptListByBlockHash",
    params: ["0x864f6cbe2828b6082bee0c6db7f5a40beed984f166c05e545a269d37e9c797da"]
  });

  const r = await batchRequest(batch);

  console.log("Test5 Success");
};

const test6 = async (txHash) => {
  const batch = [];
  batch.push({
    method: "eth_blockNumber",
    params: []
  });
  batch.push({
    method: "eth_getBlockByNumber",
    params: ["0"]
  });
  batch.push({
    method: "eth_getBlockByNumber",
    params: ["-500"]
  });
  batch.push({
    method: "eth_blockNumber",
    params: []
  });
  batch.push({
    method: "eth_getBlockByHash",
    params: ['0x864f6cbe2828b6082bee0c6db7f5a40beed984f166c05e545a269d37e9c797d']
  });
  batch.push({
    method: "eth_obviouslyNotAFunction",
    params: ['0x864f6cbe2828b6082bee0c6db7f5a40beed984f166c05e545a269d37e9c797da']
  });
  
  const r = await batchRequest(batch);

  console.log("Test6 Success");
};

(async () => {  
  console.log("-------------------------------------------");
  console.log("Test Bench");
  console.log("-------------------------------------------");
  
  await test1();
  await test2();
  await test3();
  await test4();
  await test5();
  await test6();
  
  console.log("Test Bench Exiting ...");
})().catch((err) => {
  console.log("ERR: top level function chain threw");
  console.log(err);
});
