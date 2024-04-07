import './css/bulma.min.css';
import './App.css';
import Web3 from 'web3';
import { useEffect, useState } from 'react';

function App() {
  return (
    <div className="App">
      <section className="hero is-primary">
        <div className="hero-body">
          <p className="title">
            Battery Swap DApp
          </p>
          <p className="subtitle">
            Swap your batteries efficiently and eco-friendly
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="title is-4">Available Stations</h2>
          <div className="columns">
            {/* Placeholder for battery stations */}
            <div className="column">
              <div className="box">Station 1</div>
            </div>
            <div className="column">
              <div className="box">Station 2</div>
            </div>
            <div className="column">
              <div className="box">Station 3</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="title is-4">Swap Your Battery</h2>
          <div className="field">
            <label className="label">Station ID</label>
            <div className="control">
              <input className="input" type="text" placeholder="Enter Station ID" />
            </div>
          </div>
          <div className="field">
            <label className="label">Battery ID to Deposit</label>
            <div className="control">
              <input className="input" type="text" placeholder="Enter Battery ID" />
            </div>
          </div>
          <div className="field">
            <div className="control">
              <button className="button is-link">Swap Battery</button>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="content has-text-centered">
          <p>
            <strong>Battery Swap DApp</strong> by <a href="https://example.com">Your Organization</a>. The source code is licensed
            <a href="http://opensource.org/licenses/mit-license.php"> MIT</a>.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
