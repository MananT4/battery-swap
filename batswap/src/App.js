import './css/bulma2.css';
import './App.css';
import Web3 from 'web3';
import { useEffect, useState } from 'react';

function App() {
  return (
    <div className="App">
      <section className="hero is-info">
        <div className="hero-body">
          <p className="title">
            Battery Swap DApp
          </p>
          <p className="subtitle">
            Eco-friendly battery exchange solution
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="title is-4">Buy Tokens</h2>
          <form>
            <div className="field">
              <label className="label">Amount in ETH</label>
              <div className="control">
                <input className="input" type="text" placeholder="ETH" />
              </div>
            </div>
            <div className="field">
              <div className="control">
                <button className="button is-primary">Buy Tokens</button>
              </div>
            </div>
          </form>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="title is-4">Closest Available Stations and Batteries</h2>
          <div className="columns is-multiline">
            {/* Column for Station 1 */}
            <div className="column is-one-third">
              <div className="box">
                <p className="title is-5">Station 1</p>
                <table className="table is-fullwidth is-striped">
                  <thead>
                    <tr>
                      <th>Battery ID</th>
                      <th>Charge Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Placeholder for dynamic content */}
                    <tr>
                      <td>1</td>
                      <td>95%</td>
                    </tr>
                    <tr>
                      <td>2</td>
                      <td>80%</td>
                    </tr>
                    <tr>
                      <td>3</td>
                      <td>78%</td>
                    </tr>
                    {/* Add more batteries as needed */}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Column for Station 2 */}
            <div className="column is-one-third">
              <div className="box">
                <p className="title is-5">Station 2</p>
                <table className="table is-fullwidth is-striped">
                  <thead>
                    <tr>
                      <th>Battery ID</th>
                      <th>Charge Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Placeholder for dynamic content */}
                    <tr>
                      <td>1</td>
                      <td>95%</td>
                    </tr>
                    <tr>
                      <td>2</td>
                      <td>80%</td>
                    </tr>
                    <tr>
                      <td>3</td>
                      <td>76%</td>
                    </tr>
                    {/* Add more batteries as needed */}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Column for Station 3 */}
            <div className="column is-one-third">
              <div className="box">
                <p className="title is-5">Station 3</p>
                <table className="table is-fullwidth is-striped">
                  <thead>
                    <tr>
                      <th>Battery ID</th>
                      <th>Charge Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Placeholder for dynamic content */}
                    <tr>
                      <td>1</td>
                      <td>95%</td>
                    </tr>
                    <tr>
                      <td>2</td>
                      <td>80%</td>
                    </tr>
                    <tr>
                      <td>3</td>
                      <td>70%</td>
                    </tr>
                    {/* Add more batteries as needed */}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="title is-4">Swap Your Battery</h2>
          <form>
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
          </form>
        </div>
      </section>

      <footer className="footer">
        <div className="content has-text-centered">
          <p>
            <strong>Battery Swap DApp</strong> by <a href="#!">Your Organization</a>. The source code is licensed MIT.
          </p>
        </div>
      </footer>
    </div>
  );
}


export default App;
