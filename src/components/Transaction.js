import React, { useState, useRef } from 'react';
import { ethers } from 'ethers';
import ErrorMessage from './ErrorMessage';
import TxList from './TxList';
import WalletBalance from './WalletBalance';

const startPayment = async ({ setError, setTxs, ether, addr, fetchBalance }) => {
  try {
    if (!window.ethereum) throw new Error('No crypto wallet found. Please install it.');
    await window.ethereum.send('eth_requestAccounts');
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    ethers.utils.getAddress(addr);

    const tx = await signer.sendTransaction({
      to: addr,
      value: ethers.utils.parseEther(ether)
    });
    console.log({ ether, addr });
    console.log('tx', tx);
    provider.once(tx.hash, (transaction) => {
      console.log('Giao dịch thành công:', transaction);
      // Gọi fetchBalance để cập nhật số dư
      if (fetchBalance) fetchBalance();
    });
    setTxs([tx]);

    // Gọi lại fetchBalance sau khi giao dịch thành công
  } catch (err) {
    setError(err.message);
  }
};

export default function Transaction() {
  const [error, setError] = useState();
  const [txs, setTxs] = useState([]);
  const walletBalanceRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    setError();
    await startPayment({
      setError,
      setTxs,
      ether: data.get('ether'),
      addr: data.get('addr'),
      fetchBalance: walletBalanceRef.current?.fetchBalance
    });
  };

  return (
    <form className="m-4" onSubmit={handleSubmit}>
      <div className="credit-card w-full lg:w-1/2 sm:w-auto shadow-lg mx-auto rounded-xl bg-white">
        <main className="mt-4 p-4">
          <h1 className="text-xl font-semibold text-gray-700 text-center">Send ETH payment</h1>
          <div className="">
            <div className="my-3 border border-solid border-gray-300">
              <input
                type="text"
                name="addr"
                className="block w-full border border-gray-300 rounded-md focus:ring focus:outline-none p-2"
                placeholder="Recipient Address"
              />
            </div>
            <div className="my-3 border border-solid border-gray-300">
              <input
                name="ether"
                type="text"
                className="block w-full border border-gray-300 rounded-md focus:ring focus:outline-none p-2"
                placeholder="Amount in ETH"
              />
            </div>
          </div>
        </main>
        <footer className="p-4">
          <button
            type="submit"
            className="bg-[rgb(68,6,203)] text-white font-bold py-2 px-4 rounded focus:ring focus:outline-none w-full"
          >
            Pay now
          </button>
          <ErrorMessage message={error} />
          <TxList txs={txs} />
        </footer>
        <h1>Thông tin ví Ethereum</h1>
        <WalletBalance ref={walletBalanceRef} />
      </div>
    </form>
  );
}
