import React, { useRef, useState } from 'react';
import logo from './logo.svg';
import axios from 'axios';
import './App.css';
import { apiURL } from './Api';

console.log(apiURL);

function App() {

  const nameRef = useRef(null);
  const priceRef = useRef(null);

  const [items, setItems] = useState([]);
  const [searchedItems, setSearchedItems] = useState([]);
  const [query, setQuery] = useState([]);

  function loadItemsFromRDS() {
    axios.get(apiURL + "/items")
          .then(res => {
            setItems(res.data.items);
          })
  };

  function search(query) {
    axios.get(apiURL + "/search?query=" + query)
          .then(res => {
            setSearchedItems(res.data.items);
          })
  };

  function createitem(name, price) {

    axios.put(apiURL + "/item?name=" + encodeURIComponent(name) + "&price=" + encodeURIComponent(price))
      .then(res => {
        loadItemsFromRDS();
      });

  }

  return (
    <div className="App">
      <header className="App-header">
        API Test Webapp 5678
      </header>
      <h2>
        Items in RDS database
      </h2>
      <p>
        <button onClick={() => loadItemsFromRDS()}>Load Items from RDS database</button>
      </p>
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {
            items
              .map(item =>
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.price}</td>
                </tr>
            )
          }
        </tbody>
      </table>
      <h3>
        Create item in RDS database
      </h3>
      <div>
        <div>
          <input placeholder="Name" ref={nameRef}></input>
        </div>
        <div>
          <input placeholder="Price" type="number" ref={priceRef}></input>
        </div>
        <button onClick={ () => createitem(nameRef.current.value, priceRef.current.value)}>Create Item</button>
      </div>
      <h2>
        Items in Opensearch
      </h2>
      <div>
        <button>Generate random items in Opensearch</button>
      </div>
      <div>
        <input placeholder="Search (for a number for eg.)"
          value={query} onInput={e => setQuery(e.target.value)}></input>
          <button onClick={() => search(query)}>Search</button>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {
            searchedItems
              .map(item =>
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                </tr>
            )
          }
        </tbody>
      </table>
    </div>
  );
}

export default App;
