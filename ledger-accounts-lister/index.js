var crypto = require('crypto');
var bip39 = require('bip39');
var nacl = require( 'tweetnacl');
var blake2b =require('blake2b');
const ED25519_CURVE = 'ed25519 seed';
const HARDENED_KEY_MULTIPLIER = 0x80000000;
const A0_IDENTIFIER = [0xA0];

function appendHexStart(str){
    let str1 = str.startsWith('0x')? str.substring(2): str;
    let str2 = str1.length % 2 ? '0' + str1: str1;
    return '0x' + str2;
}


function stripZeroXHexString(str) {
    if(isHex(str)){
        str = str.toLowerCase();
        str = str.startsWith('0x')? str.slice(2): str;
        return str;
    }else{
        throw Error('input must be a hex string')
    }
}

function isHex(val) {
    return typeof val === 'string' && /^(-0x|0x)?[0-9a-f]+$/i.test(val) === true;
}

function toHex(value) {
    if (!value) {
        return '0x00';
    } else if (typeof value === 'string') {
        return appendHexStart(value);
    } else if (value instanceof Buffer) {
        return appendHexStart(value.toString('hex'));
    } else if (typeof value === 'number') {
        return appendHexStart(value.toString(16));
    } else if (value instanceof Uint8Array) {
        return appendHexStart(Buffer.from(value).toString('hex'));
    } else if (BigNumber.isBigNumber(value)) {
        return appendHexStart(value.toString(16));
    } else {
        throw value;
    }
}


function hmacSha512(key, str) {
    const hmac = crypto.createHmac('sha512',  Buffer.from(key, 'utf-8'));
    return hmac.update(Buffer.from(str,'utf-8')).digest();
}

const getHardenedNumber = (nr) => {
    return Buffer.from(((HARDENED_KEY_MULTIPLIER | nr) >>> 0).toString(16), 'hex');
};

const derivePath = (path, seed) => {
    if (!isValidPath(path)) {
        throw new Error('Invalid derivation path');
    }
    let key = getMasterKeyFromSeed(seed);
    const segments = path
        .split('/')
        .slice(1)
        .map(replaceDerive)
        .map(el => parseInt(el, 10));
    let ret = segments.reduce((parentKey,el)=>CKDPriv(parentKey,el),key);
    return keyPair(ret.slice(0,32));

};

const validatePrivateKey = (priKey)=>{
    if(typeof priKey === 'string'){
        priKey = Buffer.from(stripZeroXHexString(priKey), 'hex');
    }else if(!Buffer.isBuffer(priKey)){
        throw Error('Seed must be a buffer or a hex string');
    }
    if(priKey.length === nacl.sign.seedLength){
        return true;
    }else if(priKey.length !== nacl.sign.secretKeyLength){
        return false;
    }
    const keyPair = nacl.sign.keyPair.fromSecretKey(priKey);
    const msg = Buffer.from('test');
    const sig = nacl.sign.detached(msg, keyPair.secretKey);
    return nacl.sign.detached.verify(msg,sig,keyPair.publicKey);
};


const keyPair = function(priKey) {

    if(typeof priKey === 'string'){
        priKey = Buffer.from( stripZeroXHexString(priKey), 'hex');
    }else if(!Buffer.isBuffer(priKey)){
        throw Error('Seed must be a buffer or a hex string');
    }
    if(!validatePrivateKey(priKey)){
        throw Error('inValid privateKey')
    }
    const keyPair = priKey.length === 64?nacl.sign.keyPair.fromSecretKey(priKey):nacl.sign.keyPair.fromSeed(priKey);

    const privateKey = Buffer.from(keyPair.secretKey);
    const publicKey = Buffer.from(keyPair.publicKey);
    const address = computeA0Address(publicKey);

    function sign(digest){
        if (typeof digest === 'string') {
            digest = Buffer.from( stripZeroXHexString(digest), 'hex');
        }
        try{
            let res = nacl.sign.detached(digest, Buffer.from(privateKey));
            return Buffer.from(res);
        }catch (e) {
            throw `Message failed to sign, ${e}`;
        }
    }

    function computeA0Address(publicKey){
        let addressHash = blake2b(32).update(publicKey).digest();
        addressHash.set(A0_IDENTIFIER, 0);
        return addressHash;
    }

    return {privateKey:privateKey.toString('hex'), publicKey:publicKey.toString('hex'), address: toHex(address), sign}
};



const getMasterKeyFromSeed = (seed) => {
    return hmacSha512(ED25519_CURVE,seed);
};

const CKDPriv = (key, index) => {
    let parentPrivateKey = key.slice(0, 32);
    let parentChainCode = key.slice(32, 64);
    let offset = getHardenedNumber(index);

    let parentPaddedKey = new Uint8Array(1 + parentPrivateKey.length + 4);
    parentPaddedKey.set(parentPrivateKey, 1);
    parentPaddedKey.set(offset, parentPrivateKey.length + 1);
    return hmacSha512(parentChainCode, parentPaddedKey);
};

const replaceDerive = (val) => val.replace("'", '');
const pathRegex = new RegExp("^m(/\\d+'?){3}/[0,1]/\\d+'?$");
const isValidPath = (path) => {
    if (!pathRegex.test(path)) {
        return false;
    }
    return !path
        .split('/')
        .slice(1)
        .map(replaceDerive)
        .some(isNaN);
};


async function getKeyFromMnemonic(mnemonic, index, options){
    try {
        const path = `m/44'/425'/0'/0/${index}`;
        const seed = await bip39.mnemonicToSeed(mnemonic);
        const keyPair = derivePath(path ,seed);
        console.log("private key: " + keyPair.privateKey);
        console.log("public key: " + keyPair.publicKey);
        console.log("address: " + keyPair.address);

        return {private_key: keyPair.privateKey, public_key: keyPair.publicKey, address:keyPair.address, index: index};
    }catch (e) {
        throw Error(`get Key AION failed: ${e}`)
    }
}

var  randomBytes = crypto.randomBytes(16);
var mnemonic = bip39.entropyToMnemonic(randomBytes.toString('hex'));
console.log(mnemonic);
getKeyFromMnemonic(mnemonic,2);