import { keccak256 } from "ethereum-cryptography/keccak";
import { useState } from "react";
import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { utf8ToBytes } from "ethereum-cryptography/utils";
import { toHex } from "ethereum-cryptography/utils";

function Transfer({ address, setBalance, privateKey, nonce, updateIndexer }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  const getSignature = async () => {
    let hashInfo = {
      sender: address,
      recipient: recipient,
      amount: parseInt(sendAmount),
      nonce: nonce,
    };

    return secp.sign(
      keccak256(utf8ToBytes(JSON.stringify(hashInfo))),
      privateKey,
      {
        recovered: true,
      }
    );
  };

  async function transfer(evt) {
    evt.preventDefault();

    try {
      const [signature, recoveryBit] = await getSignature();

      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: parseInt(sendAmount),
        signature: toHex(signature),
        recipient,
        recoveryBit,
        nonce,
      });
      setBalance(balance);
      updateIndexer((prev) => ({ ...prev, [address]: nonce + 1 }));
    } catch (ex) {
      console.log("inside this", ex);
      // alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
