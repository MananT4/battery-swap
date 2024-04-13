import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './App.css';
import './css/bulma2.css';
import {CONTRACT_ABI, CONTRACT_ADDRESS} from './environment.js';  // Import the contract ABI and address
import {TOKEN_ABI, TOKEN_ADDRESS} from './environment.js';  // Import the token ABI and address


function App() {
    //const [web3, setWeb3] = useState(null);
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState(null);
    const [tokenContract, setTokenContract] = useState(null);
    const [ethBalance, setEthBalance] = useState('0');
    const [tokenBalance, setTokenBalance] = useState('0');
    const [tokenAmount, setTokenAmount] = useState('');
    const [userBatteryId, setUserBatteryId] = useState('');
    const [stationBatteries, setStationBatteries] = useState([]);
    const [userBattery, setUserBattery] = useState({id: 0, percent: 0});
    const [isOwner, setIsOwner] = useState(false);
    const [owner, setOwner] = useState('');
    const [stationBatteryId, setStationBatteryId] = useState('');
    const [contractBalance, setContractBalance] = useState('0');
    const [blockNumber, setBlockNumber] = useState(0);
    const [blockData, setBlockData] = useState([]);
    const ganacheURL = "http://localhost:7545"
    const [web3, setWeb3] =useState( new Web3(Web3.givenProvider || ganacheURL) )
    
    

    useEffect(() => {
        window.ethereum.on('accountsChanged', function (accounts) {
            setIsOwner(false);
            setAccount(accounts[0]);
            loadInitialData(accounts[0], contract, web3);
        });
        //const web3 = new Web3(window.ethereum);
        const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
        const tokenContract = new web3.eth.Contract(TOKEN_ABI, TOKEN_ADDRESS);
        setWeb3(web3);
        setContract(contract);
        setTokenContract(tokenContract);
        window.ethereum.enable().then((accounts) => {
            //setIsOwner(false);
            setAccount(accounts[0]);
            loadInitialData(accounts[0], contract, web3);
            });
    }, []);

    const loadInitialData = async (userAccount, contract, web3) => {
        const ethBalance = await web3.eth.getBalance(userAccount);
        const tokenBalance = await contract.methods.getBalance(userAccount).call();
        const userBattery = await contract.methods.userBattery(userAccount).call();
        const batteryCount = await contract.methods.nextBatteryId().call();
        const owner = await contract.methods.swapOwner().call();
        const contractBalance = await web3.eth.getBalance(CONTRACT_ADDRESS);
        const blockNumber = await web3.eth.getBlockNumber();
        const blockData = await web3.eth.getBlock(blockNumber);
        let stationBatteries = [];
        for (let i = 1; i < batteryCount; i++) {
            let battery = await contract.methods.batteryMap(i).call();
            if (battery.location === "1") { // Check if the battery's location is at the station
                stationBatteries.push(battery);
            }
        }
        setEthBalance(web3.utils.fromWei(ethBalance, 'ether'));
        setTokenBalance(tokenBalance);
        setUserBattery(userBattery);
        setStationBatteries(stationBatteries);
        setUserBatteryId(userBattery.id);
        setOwner(owner);
        setContractBalance(contractBalance);
        setBlockNumber(blockNumber);
        setBlockData(blockData);
        setIsOwner(userAccount.toLowerCase() === owner.toLowerCase());
    };

    const handleBuyTokens = async () => {
        if (!web3) {
            console.log('Web3 not initialized');
            return;
        }
    
        const amountInWei = web3.utils.toWei(tokenAmount, 'wei');
    
        try {
            // Transaction to buy tokens
            await contract.methods.buyTokens().send({ from: account, value: amountInWei });
            
            // Refresh balances to reflect the tokens bought
            await loadInitialData(account, contract, web3);
    
            // Approve the contract to spend tokens on behalf of the user
            await tokenContract.methods.approve(CONTRACT_ADDRESS, tokenBalance).send({ from: account});
    
            console.log('Tokens purchased and approved successfully');
        } catch (error) {
            console.error('Error during token purchase or approval:', error);
        }
    };

    const loadTokenBalance = async (userAccount, contract) => {
        const balance = await contract.methods.getBalance(userAccount).call();
        setTokenBalance(balance);
        await loadInitialData(userAccount, contract, web3);
    };

    const handleDepositTokens = async () => {
        await contract.methods.depositTokens(account).send({ from: account });
        // Assume reload of necessary data
        loadTokenBalance(account, contract);
    };

    const handleDepositBattery = async () => {
        await contract.methods.depositBattery(userBatteryId, account).send({ from: account });
        // Update state or UI
        await loadInitialData(account, contract, web3);

    };

    const handleCollectBattery = async () => {
        await contract.methods.collectBattery(stationBatteryId, account).send({ from: account });
        // Update state or UI
        await loadInitialData(account, contract, web3);
    };
    return (
        <div className="App">
            <section className="hero is-info">
                <div className="hero-body">
                    <header className="header">
                        <p className="title">Battery Swap DApp</p>
                        <p className="subtitle">Eco-friendly battery exchange solution</p>
                        <p className="subtitle">Account: {account}</p>
                        {isOwner && 
                            <><p className="subtitle">You are the owner of the contract</p>
                            <p className="subtitle">Contract Balance: {contractBalance}</p>
                            <p className="subtitle">Current Block Number: {blockNumber}</p>
                            </>
                        } 
                    </header>
                </div> 
            </section>
            {isOwner &&
            <section className="section">
                <div className="container">
                    <h2 className="title is-4">Owner Actions</h2>
                    <div className="field">
                        <label className="label">Withdraw Contract Balance</label>
                        <div className="control">
                            <button className="button is-primary" onClick={async () => {
                                await contract.methods.withdraw().send({ from: account });
                                await loadInitialData(account, contract, web3);
                            }}>Withdraw</button>
                            <button className="button is-link" onClick={() => alert("Block Number: " + blockNumber + "\nBlock Data: " + JSON.stringify(blockData, null, 2))}>Block Data for {blockNumber}</button>
                        </div>
                    </div>
                </div>
            </section>
            }
            {!isOwner &&
            <section className="section">
                <div className="container">
                    <h2 className="title is-4">Buy Tokens</h2>
                    <div className="field">
                        <label className="label">400 Wei for 1 PWT</label>
                        <div className="control">
                            <input className="input" type="text" value={tokenAmount} onChange={e => setTokenAmount(e.target.value)} placeholder="Wei" />
                        </div>
                    </div>
                    <div className="field">
                        <button className="button is-primary" onClick={handleBuyTokens}>Buy Tokens</button>
                    </div>
                </div>
            </section>
            }
            <section className="section">
                <div className="container">
                    <div className="columns">
                        <div className="column">
                            <h2 className="title is-4">Your Balances</h2>
                            <p>ETH: {ethBalance}</p>
                            <p>PWT: {tokenBalance}</p>
                        </div>
                        {!isOwner &&
                        <div className="column">
                            <h2 className="title is-4">Your Battery</h2>
                            <p>ID: {userBattery.id}</p>
                            <p>Charge: {userBattery.percent}%</p>
                        </div>
                        }
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    {!isOwner &&
                    <><h2 className="title is-4">Swap Your Battery by Spending 100 PWT</h2><div className="field">
                            <button className="button is-primary" onClick={handleDepositTokens}>Start Battery Swap</button>
                        </div><div className="field">
                                <label className="label">Your Battery ID</label>
                                <div className="control">
                                    <input className="input" type="text" value={userBatteryId} onChange={e => setUserBatteryId(e.target.value)} placeholder="Enter Your Battery ID" />
                                </div>
                                <button className="button is-link" onClick={handleDepositBattery}>Deposit Battery</button>
                            </div><div className="field">
                                <label className="label">Station Battery ID to Collect</label>
                                <div className="control">
                                    <input className="input" type="text" value={stationBatteryId} onChange={e => setStationBatteryId(e.target.value)} placeholder="Enter Station Battery ID" />
                                </div>
                                <button className="button is-link" onClick={handleCollectBattery}>Collect Battery</button>
                            </div></>
                    }
                    <h2 className="title is-4">Station Batteries</h2>
                    <table className="table mx-auto">
                        <thead>
                            <tr>
                                <th>Battery ID</th>
                                <th>Charge Level</th>
                                <th>Location</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stationBatteries.map((battery, index) => (
                                <tr key={index}>
                                    <td>{battery.id}</td>
                                    <td>{battery.percent}%</td>
                                    <td>{battery.location === "1" ? "Station" : "User"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <footer className="footer">
                <div className="content has-text-centered">
                    <p><strong>Battery Swap DApp</strong> by Your Organization. The source code is licensed MIT.</p>
                </div>
            </footer>
        </div>
    );
}

export default App;