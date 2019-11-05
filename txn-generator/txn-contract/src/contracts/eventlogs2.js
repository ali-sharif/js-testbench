module.exports.compiled = 
{ name: 'EventLogs',
  abi: 
   [ { outputs: [ { name: 'success', type: 'bool' } ],
       constant: false,
       inputs: 
        [ { name: '_to', type: 'address' },
          { name: '_data', type: 'uint128' } ],
       name: 'trigger',
       type: 'function' },
     { outputs: [ { name: '', type: 'uint128' } ],
       constant: true,
       inputs: [],
       name: 'nonce',
       type: 'function' },
     { outputs: [], inputs: [], name: '', type: 'constructor' },
     { outputs: [],
       inputs: 
        [ { indexed: true, name: '_from', type: 'address' },
          { indexed: true, name: '_to', type: 'address' },
          { indexed: true, name: '_nonce', type: 'uint128' },
          { indexed: false, name: 'data', type: 'uint128' } ],
       name: 'Tigger',
       anonymous: false,
       type: 'event' },
     { outputs: [],
       inputs: 
        [ { indexed: true, name: '_from', type: 'address' },
          { indexed: true, name: '_to', type: 'address' },
          { indexed: true, name: '_nonce', type: 'uint128' },
          { indexed: false, name: 'data', type: 'uint128' } ],
       name: 'Eeyore',
       anonymous: false,
       type: 'event' } ],
  binary: '0x605060405234156100105760006000fd5b5b600060006000508190909055505b610024565b610196806100336000396000f30060506040526000356c01000000000000000000000000900463ffffffff16806385d58ff21461003e578063affed0e01461008b57610038565b60006000fd5b341561004a5760006000fd5b610071600480808060100135903590916020019091929080359060100190919050506100b5565b604051808215151515815260100191505060405180910390f35b34156100975760006000fd5b61009f610161565b6040518082815260100191505060405180910390f35b60006000600081815054809291906001019190509090555060006000505460008585337f144e7fcd7fe4a7bdeba9c260fd4a1872d441a8468366e88def78e395a98b1709896040518082815260100191505060405180910390a460006000505460008585337fcd50190971886521f21f47a37e836a94d442f343be7ce62da5a4f9edd60f3e7a896040518082815260100191505060405180910390a46001905061015a565b9392505050565b600060005054815600a165627a7a723058201de50f0ec448e145b224829e5e3faf69d24714fe727fa7ffe91411fbe4fa80ec0029' };

module.exports.address = '0x1e74d8cdead7d616c633dd7f9a2ec019aee6282af76f62bceed1629502cf1569';