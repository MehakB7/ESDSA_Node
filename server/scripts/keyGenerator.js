const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

const privateKey = secp.utils.randomPrivateKey();
const publicKey = secp.getPublicKey(privateKey);
const walletAddress = keccak256(publicKey.slice(1)).slice(-20);

console.log({
  publicKey: publicKey,
  privateKey: privateKey,
  WalletAddress: toHex(walletAddress),
});
