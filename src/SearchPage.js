import React, { Component } from 'react';
import styled from 'styled-components';
import InfiniteScroll from 'react-infinite-scroller';

import ItemList from './containers/ItemList.js';

const Container = styled.div`
  margin: 0;
  padding: 0;
  padding-top: 80px;
  @media screen and (max-width: 550px) {
    padding-top: 200px;
  }
`;

const ResultsContainer = styled.div`
  margin: 0 auto;
  padding: 24px;
  @media screen and (max-width: 550px) {
    padding: 8px;
  }
`;

const Topbar = styled.div`
  height: 88px;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  border-bottom: 1px solid #b2bec3;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background-color: white;
  padding: 8px 0;
  * {
    box-sizing: border-box;
  }
  form {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: flex-end;
    @media screen and (max-width: 550px) {
      flex-direction: column;
      align-items: center;
      margin: 8px;
      ${InputGroup} {
        margin: 4px 0;
      }
      input[type='text'],
      input[type='password'] {
        margin: 0 0 4px;
      }
    }
  }
  input[type='text'],
  input[type='password'] {
    height: 38px;
    width: 240px;
    margin: 0 16px 0 0;
    font-size: 1.1em;
    padding: 0.2em;
  }

  @media screen and (max-width: 550px) {
    height: initial;
  }
`;

const SubmitButton = styled.button`
  height: 38px;
  background: none;
  font-size: 0.8em;
  color: #636e72;
  text-transform: uppercase;
  border: 1px solid #b2bec3;
  padding: 0.2em 1em;
  margin: 4px 0;
`;

const InputGroup = styled.div`
  display: inline-block;
  margin: 4px 0;
  label {
    display: block;
    text-align: left;
    text-transform: uppercase;
    font-size: 0.8em;
    color: #636e72;
  }
  input {
    border: 1px solid #b2bec3;
  }
`;

class SearchPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lastPageReceived: 0, // index # of last page retrieved
      results: [], // should be, list of lists, indexed by page #
      ready: [false], // indexed by page ready
      nextPageUrl: null, // url to receive lastPageReceived + 1, or undefined if no more pages
    };
    this._processItems = this._processItems.bind(this);
    this._getNewResults = this._getNewResults.bind(this);
    this.clientTokenInput = React.createRef();
    this.searchQuery = React.createRef();
    this.handleSubmit = this.handleSubmit.bind(this);
    this._getNextResultPage = this._getNextResultPage.bind(this);
  }

  _processItems(items) {
    items.forEach(item => {
      item.detailsUrl = `https://api.zinc.io/v1/realtime/details/${
        item.product_id
      }?retailer=amazon`;
    });
    return items;
  }

  _getNewResults(token, searchQuery) {
    // reset state for new Results
    window.scrollTo(0, 0);
    this.timeZero = performance.now();
    this.setState({
      lastPageReceived: 0,
      results: [[]],
      ready: [false],
      nextPageUrl: null,
      error: null,
      clientToken: null,
    });
    try {
      fetch(
        `https://api.zinc.io/v1/realtime/search?query=${searchQuery}&retailer=amazon`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Basic ' + btoa(`${token}:`),
          },
        }
      )
        .then(res => {
          if (res.status === 200) {
            return res.json();
          }
          if (res.status === 403) {
            throw Error('403 Forbidden - Check client token');
          }
          if (res.status === 503) {
            throw Error('503 Service Unavailable - Rate Limit Exceeded');
          }
        })
        .then(res => {
          let results = this.state.results;
          results[0] = this._processItems(res.results);
          this.timeOne = performance.now();
          this.setState({
            results: results,
            nextPageUrl: res.nextPage,
            ready: [true],
            timeElapsed: this.timeOne - this.timeZero,
            clientToken: token,
          });
          console.log(
            `Received first page of results. Query took: ${this.timeOne -
              this.timeZero}ms.`
          );
        })
        .catch(error => {
          console.error('Error:', error);
          this.setState({
            lastPageReceived: 0,
            results: [],
            ready: [false],
            nextPageUrl: null,
            error: error,
            clientToken: null,
          });
        });
    } catch (e) {
      console.error('Error getResults:' + e);
    }
  }

  // duplicated code but lazy to refactor
  _getNextResultPage(token) {
    if (!this.state.nextPageUrl) {
      return false;
    }

    const nextPageIndex = this.state.lastPageReceived + 1;
    let currentResults = this.state.results;
    currentResults[nextPageIndex] = [];
    let currentReady = this.state.ready;
    currentReady[nextPageIndex] = false;
    let nextPageUrl = this.state.nextPageUrl.replace(
      /io\/realtime/,
      'io/v1/realtime'
    );

    this.setState({
      results: currentResults,
      ready: currentReady,
      nextPageUrl: null,
    });

    console.log(`Getting page ${nextPageIndex}...`);
    const timeZero = performance.now();
    try {
      fetch(nextPageUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Basic ' + btoa(`${this.state.clientToken || token}:`),
        },
      })
        .then(res => {
          if (res.status === 200) {
            return res.json();
          }
        })
        .then(res => {
          currentResults[nextPageIndex] = this._processItems(res.results);
          currentReady[nextPageIndex] = true;
          const timeOne = performance.now();
          this.setState({
            results: currentResults,
            lastPageReceived: nextPageIndex,
            nextPageUrl: res.nextPage,
            ready: currentReady,
          });
          console.log(
            `Received page ${nextPageIndex}. Time elapsed: ${timeOne -
              timeZero}ms.`
          );
        }); // we should reset nextPageUrls here in case it fails so we can retry later
    } catch (e) {
      console.error('Error getNextResultPage:' + e);
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    let clientToken = this.clientTokenInput.current.value;
    let searchQuery = this.searchQuery.current.value;

    if (!clientToken || !searchQuery) {
      return;
    }

    this._getNewResults(clientToken, searchQuery);
  }

  render() {
    let clientToken =
      this.clientTokenInput.current && this.clientTokenInput.current.value;
    let results = this.state.results;
    let resultsRendered = this.state.results.map((oneResultsPage, index) => (
      <ItemList
        clientToken={clientToken}
        ready={this.state.ready[index]}
        items={results[index]}
        key={index}
      />
    ));
    return (
      <Container>
        <Topbar>
          <form onSubmit={this.handleSubmit}>
            <InputGroup>
              <label>Client Token</label>
              <input
                type="password"
                style={{ fontFamily: 'monospace' }}
                ref={this.clientTokenInput}
              />
            </InputGroup>
            <InputGroup>
              <label>Search</label>
              <input type="text" ref={this.searchQuery} />
            </InputGroup>
            <SubmitButton type="submit">Submit</SubmitButton>
          </form>
        </Topbar>
        <SearchErrorBoundary>
          <ResultsContainer>
            {this.state.error && (
              <div style={{ color: 'red', margin: '40px auto' }}>
                {this.state.error.toString()}
              </div>
            )}
            <InfiniteScroll
              pageStart={0}
              loadMore={() => {
                this._getNextResultPage(this.clientTokenInput.current.value);
              }}
              hasMore={this.state.nextPageUrl ? true : false}
              loader={
                <div className="loader" key={0}>
                  Loading ...
                </div>
              }
            >
              {resultsRendered}
            </InfiniteScroll>
          </ResultsContainer>
        </SearchErrorBoundary>
      </Container>
    );
  }
}

class SearchErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <h3 style={{ margin: '200px auto' }}>
          Something went wrong. Please try again.
        </h3>
      );
    }
    return this.props.children;
  }
}

export default SearchPage;
