import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { ethers } from 'ethers';

const WalletBalance = forwardRef((props, ref) => {
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState(null);

  const fetchBalance = async () => {
    try {
      if (!window.ethereum) {
        setError('Không tìm thấy ví tiền điện tử. Vui lòng cài đặt.');
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);
      const balanceInEther = ethers.utils.formatEther(balance);
      setBalance(balanceInEther);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  useImperativeHandle(ref, () => ({
    fetchBalance
  }));

  useEffect(() => {
    fetchBalance();
    window.ethereum.on('accountsChanged', fetchBalance);
    return () => {
      window.ethereum.removeListener('accountsChanged', fetchBalance);
    };
  }, []);

  return (
    <div>
      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <p>Số dư của ví: {balance !== null ? `${balance} ETH` : 'Đang tải...'}</p>
      )}
    </div>
  );
});

export default WalletBalance;
