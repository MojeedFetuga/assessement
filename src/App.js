import React, { useState } from "react";
import { ethers } from "ethers";
import AssessmentABI from "./AssessmentABI.json"; // Import the contract ABI



const App = () => {
  const contractAddress = "0x3246f1bB8107963E91D8f4D12028236698e0cEeE"; // Your deployed contract address

  // State variables
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [contract, setContract] = useState(null); // State for the contract instance

  // Connect Wallet Function
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });

        // Initialize provider and signer
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);

        // Initialize contract
        const contractInstance = new ethers.Contract(contractAddress, AssessmentABI, signer);
        setContract(contractInstance);

        // Fetch contract balance
        const currentBalance = await contractInstance.getBalance();
        setBalance(currentBalance.toString());
      } catch (error) {
        console.error("Error connecting wallet:", error);
        alert("Failed to connect wallet. Check console for details.");
      }
    } else {
      alert("MetaMask is not installed. Please install MetaMask to interact with the application.");
    }
  };

  // Deposit Function
  const deposit = async () => {
    if (amount <= 0) {
      alert("Please enter a valid amount greater than 0.");
      return;
    }
    if (!contract) {
      alert("Contract is not connected. Please connect your wallet first.");
      return;
    }

    try {
      const transaction = await contract.deposit(amount, {
        value: ethers.utils.parseEther(amount),
      });
      await transaction.wait(); // Wait for the transaction to be mined
      const updatedBalance = await contract.getBalance();
      setBalance(updatedBalance.toString());
      setAmount(""); // Clear the input field
    } catch (error) {
      console.error("Error during deposit:", error);
      alert("Deposit failed. Check console for details.");
    }
  };

  // Withdraw Function
  const withdraw = async () => {
    if (amount <= 0) {
      alert("Please enter a valid amount greater than 0.");
      return;
    }
    if (!contract) {
      alert("Contract is not connected. Please connect your wallet first.");
      return;
    }

    try {
      const transaction = await contract.withdraw(amount);
      await transaction.wait(); // Wait for the transaction to be mined
      const updatedBalance = await contract.getBalance();
      setBalance(updatedBalance.toString());
      setAmount(""); // Clear the input field
    } catch (error) {
      console.error("Error during withdrawal:", error);
      alert("Withdrawal failed. Check console for details.");
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Assessment Contract</h1>

        {/* Connect Wallet */}
        {!walletAddress ? (
          <button onClick={connectWallet}>Connect Wallet</button>
        ) : (
          <p>Connected: {walletAddress}</p>
        )}

        {/* Display Contract Balance */}
        <h2>Contract Balance: {ethers.utils.formatEther(balance)} ETH</h2>

        {/* Input for Amount */}
        <input
          type="number"
          placeholder="Enter amount (ETH)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        {/* Deposit and Withdraw Buttons */}
        <button onClick={deposit}>Deposit</button>
        <button onClick={withdraw}>Withdraw</button>
      </header>
    </div>
  );
};

export default App;
