const express = require("express");
const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const app = express();
const cors = require("cors");
const port = 3042;
const {
  utf8ToBytes,
  hexToBytes,
  toHex,
} = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());

const balances = {
  fe97775dc7694ceb9d754b7896dbc8325ef1650d: 100,
  "31d4ba2620a29389b32cfa8b5b45cf4b67a63283": 50,
  c822299caa4699ce3a5bdb84e28758787ad32752: 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", async (req, res) => {
  const { sender, recipient, amount, signature, recoveryBit, nonce } = req.body;

  let hashInfo = {
    sender: sender,
    recipient: recipient,
    amount: amount,
    nonce: nonce,
  };

  let hashMessage = keccak256(utf8ToBytes(JSON.stringify(hashInfo)));

  let byteSignature = hexToBytes(signature);
  const publicKey = await secp.recoverPublicKey(
    hashMessage,
    byteSignature,
    recoveryBit
  );

  if (!secp.verify(byteSignature, hashMessage, publicKey)) {
    res.status(400).send({ message: "Invalid Transaction" });
    return;
  }

  // get the account address from public key to verify the sender

  const walletAddress = toHex(keccak256(publicKey.slice(1)).slice(-20));
  console.log("inside address", walletAddress, sender);
  if (walletAddress !== sender) {
    res.status(400).send({ message: "Invalid Transaction" });
    return;
  }

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
