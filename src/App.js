import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import SearchPage from './SearchPage';

class App extends Component {
  render() {
    return (
      <div className="App">
        <link
          href="https://fonts.googleapis.com/css?family=IBM+Plex+Sans:300,400,500"
          rel="stylesheet"
        />
        <SearchPage />
      </div>
    );
  }
}

export default App;
