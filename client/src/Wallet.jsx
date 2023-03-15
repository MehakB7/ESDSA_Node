import server from "./server";
import * as spec from "ethereum-cryptography/secp256k1";
import * as keccak from "ethereum-cryptography/keccak";
import { toHex } from "ethereum-cryptography/utils";
import { useState } from "react";

function Wallet({
  address,
  setAddress,
  balance,
  setBalance,
  privateKey,
  setPrivateKey,
}) {
  const [error, setError] = useState("");

  const getWalletAddress = (privateKey) => {
    if (privateKey.length === 0) {
      return "";
    }

    if (!spec.utils.isValidPrivateKey(privateKey)) {
      setError("Invalid private key");
      return "";
    }
    const pk = spec.getPublicKey(privateKey);
    return toHex(keccak.keccak256(pk.slice(1)).slice(-20));
  };

  async function onChange(evt) {
    error && setError("");

    const privateKey = evt.target.value;

    setPrivateKey(privateKey);
    let address = getWalletAddress(privateKey);
    setAddress(address);

    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Private Key (To create signature)
        <input
          placeholder="Type an address, for example: 0x1"
          value={privateKey}
          onChange={onChange}
        ></input>
      </label>
      {error && <div className="error">{error}</div>}
      <div className="balance">Address :{address}</div>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
