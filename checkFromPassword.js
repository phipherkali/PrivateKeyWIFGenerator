const sha256 = require('js-sha256');
const ripemd160 = require('ripemd160');
const base58 = require('bs58');
const request = require('request-promise');
const fs = require('fs');
const args = process.argv;
const fileToParse = args[2];

const ec = require("elliptic").ec;
const ecdsa = new ec('secp256k1');
var publicKeyArray = [];
var pairKeyArray = [];
let rawdata = fs.readFile(fileToParse,'utf8',(err, data) => {

 if (err) throw err;
  var parsedPassWord = data.split('\n');
  parsedPassWord.map(password =>{
    password = password.trim();
    endString = sha256(password);
    privateKey = Buffer.from(endString, 'hex'); 
    WIFKey = createPrivateKeyWIF(privateKey);
    publicHash = createPublicHash(privateKey);
    publicKey = createPublicAddress(publicHash);
    console.log(`${password} - ${WIFKey} - ${publicKey}`);
    fs.appendFileSync('sample3.txt',`${password} - ${WIFKey} - ${publicKey}\n`, 'utf8');
  })
  //console.log(pairKeyArray);
});
    

function createPublicHash(privateKey){

  let keys = ecdsa.keyFromPrivate(privateKey);  
  let publicKey = keys.getPublic('hex');  

  let hash = sha256(Buffer.from(publicKey, 'hex'));
  let publicKeyHash = new ripemd160().update(Buffer.from(hash, 'hex')).digest();
  //console.log('> Public hash created: ', publicKeyHash.toString("hex"));

return publicKeyHash.toString("hex");

}
function createPublicAddress(publicKeyHash) {
  const step1 = Buffer.from("00" + publicKeyHash, 'hex');
    const step2 = sha256(step1);
    const step3 = sha256(Buffer.from(step2, 'hex'));
    const checksum = step3.substring(0, 8);
    const step4 = step1.toString('hex') + checksum;
    const address = base58.encode(Buffer.from(step4, 'hex'));

    //console.log('> Public key created: ',address)
    return address;
}

function createPrivateKeyWIF(privateKey) {
    
    const step1 = Buffer.from("80" + privateKey.toString('hex'), 'hex');
    const step2 = sha256(step1);
    const step3 = sha256(Buffer.from(step2, 'hex'));
    const checksum = step3.substring(0, 8);
    const step4 = step1.toString('hex') + checksum;
    const privateKeyWIF = base58.encode(Buffer.from(step4,"hex"));

  
    //console.log('> Private key: '+ privateKey.toString('hex'));
    //console.log('> privateKeyWIF: '+ privateKeyWIF);
    
    return privateKeyWIF;
} 