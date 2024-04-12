import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './App.css';
import './css/bulma2.css';
import {CONTRACT_ABI, CONTRACT_ADDRESS} from './environment.js';  // Ensure the ABI is correctly imported

function App() {
    //const [web3, setWeb3] = useState(null);
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState(null);
    const [ethBalance, setEthBalance] = useState('0');
    const [tokenBalance, setTokenBalance] = useState('0');
    const [tokenAmount, setTokenAmount] = useState('');
    const [batteryId, setBatteryId] = useState('');
    const [stationBatteries, setStationBatteries] = useState([]);
    const [userBattery, setUserBattery] = useState({id: 0, percent: 0});
    const ganacheURL = "http://localhost:7545"
    const web3 = new Web3(Web3.givenProvider || ganacheURL)

    useEffect(() => {
        window.ethereum.on('accountsChanged', function (accounts) {
            setAccount(accounts[0]);
        });
        const web3 = new Web3(window.ethereum);
        const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
        //setWeb3(web3);
        setContract(contract);
        window.ethereum.enable().then((accounts) => {
            setAccount(accounts[0]);
            loadInitialData(accounts[0], contract, web3);
            });
    }, []);

    const loadInitialData = async (userAccount, contract, web3) => {
        const ethBalance = await web3.eth.getBalance(userAccount);
        const tokenBalance = await contract.methods.getBalance(userAccount).call();
        const userBattery = await contract.methods.userBattery(userAccount).call();
        const batteryCount = await contract.methods.nextBatteryId().call();
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
            // Assuming an unlimited approval, or specify an exact amount as needed
            const tokenContract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);  // Ensure tokenABI and tokenContractAddress are correctly set
            const maxApproval = web3.utils.toWei('1000000', 'ether');  // An arbitrary large number for approval
            await tokenContract.methods.approve(CONTRACT_ADDRESS, maxApproval).send({ from: account });
    
            console.log('Tokens purchased and approved successfully');
        } catch (error) {
            console.error('Error during token purchase or approval:', error);
        }
    };

    const handleSpendTokens = async () => {
        await contract.methods.spendTokens(account).send({ from: account });
        await loadInitialData(account, contract, web3);
    };

    const handleDepositBattery = async () => {
        await contract.methods.depositBattery(batteryId, account).send({ from: account });
        await loadInitialData(account, contract, web3);
    };

    const handleCollectBattery = async () => {
        await contract.methods.collectBattery(batteryId, account).send({ from: account });
        await loadInitialData(account, contract, web3);
    };

    return (
        <div className="App">
            <section className="hero is-info">
                <div className="hero-body">
                    <p className="title">Battery Swap DApp</p>
                    <p className="subtitle">Eco-friendly battery exchange solution</p>
                </div>
            </section>

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

            <section className="section">
                <div className="container">
                    <div className="columns">
                        <div className="column">
                            <h2 className="title is-4">Your Balances</h2>
                            <p>ETH: {ethBalance}</p>
                            <p>PWT: {tokenBalance}</p>
                        </div>
                        <div className="column">
                            <h2 className="title is-4">Your Battery</h2>
                            <p>ID: {userBattery.id}</p>
                            <p>Charge: {userBattery.percent}%</p>
                        </div>
                    </div>
                    <div className="field">
                        <label className="label">Battery ID to Deposit</label>
                        <div className="control">
                            <input className="input" type="text" value={batteryId} onChange={e => setBatteryId(e.target.value)} placeholder="Enter Battery ID" />
                        </div>
                    </div>
                    <div className="field">
                        <button className="button is-link" onClick={handleDepositBattery}>Deposit Battery</button>
                        <button className="button is-link" onClick={handleCollectBattery}>Collect Battery</button>
                    </div>
                    <h2 className="title is-4">Station Batteries</h2>
                    <table className="table is-fullwidth is-striped">
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