import React, { Component } from 'react';
import styled from 'styled-components';
import Truncate from 'react-truncate';
import ReactPlaceholder from 'react-placeholder';
import 'react-placeholder/lib/reactPlaceholder.css';
import {
  TextBlock,
  MediaBlock,
  TextRow,
  RectShape,
  RoundShape,
} from 'react-placeholder/lib/placeholders';

const ItemContainer = styled.div`
  border: 1px solid #dfe6e9;
  border-radius: 8px;
  margin: 8px 0;
  padding: 16px 16px;
  display: flex;
  flex-wrap: wrap;
  @media screen and (max-width: 550px) {
    font-size: 10pt;
    padding: 8px;
  }
`;

const ItemImageContainer = styled.div`
  width: 120px;
  height: 120px;
  flex: 0 0 120px;
  margin: 0 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  @media screen and (max-width: 550px) {
    width: 80px;
    height: 80px;
    flex: 0 0 80px;
    margin: auto 12px;
  }
`;

const ItemImage = styled.img`
  height: auto;
  max-height: 100%;
  max-width: 100%;
`;

const ItemDetails = styled.div`
  flex: 2 0;
  text-align: left;
`;

const ASIN = styled.div`
  color: #636e72;
  font-size: 1.1em;
  font-family: monospace;
`;

const Brand = ASIN.extend``;

const Title = styled.h4`
  text-align: left;
  font-weight: 400;
  margin: 0.25em 0 0.125em;
  color: #2d3436;
  font-size: 1.25em;
`;
const DollarSign = styled.span`
  margin: 0 0.25em 0 0;
  color: #636e72;
`;
const Price = styled.div`
  margin: 0.5em 0;
  font-size: 1.5em;
  font-weight: 400;
`;
const Dollars = styled.span`
  color: #2d3436;
`;
const Cents = styled.span`
  color: #636e72;
  font-size: 0.55em;
  margin: 0 0 0 0.1em;
`;

const ImagesContainer = styled.div`
  font-family: monospace;
  a {
    position: relative;
    > img {
      visibility: hidden;
      max-width: 400px;
      height: auto;
      position: absolute;
      top: 16px;
      left: 0;
      border: 4px solid black;
    }
    &:hover {
      > img { visibility: visible; }
    }
  }
`;

const ExpandedItemDetails = styled.div`
  border-top: 1px solid #eee;
  padding: 16px;
  margin-top: 16px;
  flex: 1 1 100%;
  text-align: left;
  table {
    font-size: 0.8em;
    vertical-align: baseline;
    border-spacing: 0;
    border-collapse: collapse;
    width: 100%;
    ul {
      margin: 0;
      padding-left: 2em;
    }
    td {
      &:first-of-type {
        min-width: 120px;
      }
      border: 1px solid #ddd;
      padding: 4px;
    }
  }
`;

const ItemPlaceholder = (
  <ItemContainer>
    <ItemImageContainer>
      <RectShape color="#dfe6e9" style={{ width: 120, height: 120 }} />
    </ItemImageContainer>
    <ItemDetails>
      <TextBlock color="#dfe6e9" rows={4} />
    </ItemDetails>
  </ItemContainer>
);

const ExpandedItemDetailsPlaceholder = (
  <table>
    <tbody>
      <tr>
        <td>
          <TextBlock color="#dfe6e9" rows={1} />
        </td>
        <td>
          <TextBlock color="#dfe6e9" rows={2} />
        </td>
      </tr>
      <tr>
        <td>
          <TextBlock color="#dfe6e9" rows={1} />
        </td>
        <td>
          <TextBlock color="#dfe6e9" rows={6} />
        </td>
      </tr>
      <tr>
        <td>
          <TextBlock color="#dfe6e9" rows={1} />
        </td>
        <td>
          <TextBlock color="#dfe6e9" rows={1} />
        </td>
      </tr>
      <tr>
        <td>
          <TextBlock color="#dfe6e9" rows={1} />
        </td>
        <td>
          <RectShape color="#dfe6e9" style={{ width: 400, height: 240 }} />
        </td>
      </tr>
      <tr>
        <td>
          <TextBlock color="#dfe6e9" rows={1} />
        </td>
        <td>
          <TextBlock color="#dfe6e9" rows={2} />
        </td>
      </tr>
    </tbody>
  </table>
);

class Item extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDetails: false,
      loadingDetails: false,
      details: {},
    };
    this._getDetails = this._getDetails.bind(this);
  }

  componentWillUnmount() {
    console.debug('item unmounting');
  }

  _getDetails() {
    if (this.state.showDetails) {
      return;
    }
    this.setState({ showDetails: true, loadingDetails: true });
    try {
      fetch(this.props.item.detailsUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Basic ' + btoa(`${this.props.clientToken}:`),
        },
      })
        .then(res => {
          if (res.status === 200) {
            return res.json();
          } else {
            throw new Error('Error retrieving item details.');
          }
        })
        .then(res => {
          this.setState({ details: res.value, loadingDetails: false });
        });
    } catch (e) {
      console.error(e);
    }
  }

  makeTablesOutOfNestedObjects(obj) {
    // returns <table>s
    // base case 1: nothing
    if (!obj) {
      return 'None provided.';
    }
    // base case 2: if it's not an iterable, just return the json
    if (!Array.isArray(obj) && typeof obj != 'object') {
      return JSON.stringify(obj);
    }
    // base case 3: if it's an array of non-objects, just return it as a list string
    if (Array.isArray(obj) && obj.every(o => typeof obj != 'object')) {
      return obj.join('');
    }

    let rows = [];
    Object.keys(obj).forEach(key => {
      rows.push(
        `<tr><td>${key}</td><td>${this.makeTablesOutOfNestedObjects(
          obj[key]
        )}</td></tr>`
      );
    });

    return `<table><tbody>${rows.join('')}</tbody></table>`;
  }

  wrapArrayInTags(array, tag) {
    if (!array) {
      return 'None provided.';
    }
    // should return a string of jsx elements (to be dangerouslySetInnerHtml)
    let startTag = `<${tag}>`;
    let endTag = `</${tag}>`;
    let elements = [];
    array.forEach(item => {
      elements.push(`${startTag}${item}${endTag}`);
    });
    return elements.join('');
  }

  generateExpandedDetails(details) {
    let detailsHtml = [];

    let primaryDetailsTable = [];
    if (!details) {
      return;
    }
    let images = details.images && details.images.map((url, i) => <a>[ {i} ]<img src={url} /></a>);

    primaryDetailsTable.push(
      <tr>
        <td>Images (hover)</td>
        <td><ImagesContainer>{images}</ImagesContainer></td>
      </tr>
    )
    primaryDetailsTable.push(
      <tr>
        <td>Description</td>
        <td>
          <Truncate line={1}>
            {details.product_description || 'None provided.'}
          </Truncate>
        </td>
      </tr>
    );
    primaryDetailsTable.push(
      <tr>
        <td>Features</td>
        <td>
          <ul
            dangerouslySetInnerHTML={{
              __html: this.wrapArrayInTags(details.feature_bullets, 'li'),
            }}
          />
        </td>
      </tr>
    );
    primaryDetailsTable.push(
      <tr>
        <td>Details</td>
        <td>
          <ul
            dangerouslySetInnerHTML={{
              __html: this.wrapArrayInTags(details.product_details, 'li'),
            }}
          />
        </td>
      </tr>
    );
    primaryDetailsTable.push(
      <tr>
        <td>Rating</td>
        <td>
          {details.stars || 'Unknown'} out of {details.review_count || 0}{' '}
          reviews
        </td>
      </tr>
    );
    primaryDetailsTable.push(
      <tr>
        <td>Package Dimensions</td>
        <td>
          <div
            style={{ fontSize: '0.5em' }}
            dangerouslySetInnerHTML={{
              __html: this.makeTablesOutOfNestedObjects(
                details.package_dimensions
              ),
            }}
          />
        </td>
      </tr>
    );
    primaryDetailsTable.push(
      <tr>
        <td>Categories</td>
        <td>{details.categories && details.categories.join(', ')}</td>
      </tr>
    );
    detailsHtml.push(
      <table>
        <tbody>{primaryDetailsTable}</tbody>
      </table>
    );
    detailsHtml.push(
      <div style={{ marginTop: '16px' }}>
        For the full blob returned by details,{' '}
        <a href="https://docs.zincapi.com/#product-details" target="_blank">
          see API docs.
        </a>
      </div>
    );
    return detailsHtml;
  }

  render() {
    const item = this.props.item;
    let price;
    if (item.price == 0) {
      price = '';
    } else {
      price = (
        <Price hidden={this.state.hidePrice}>
          <DollarSign>$</DollarSign>
          <Dollars>{item.price.toString().slice(0, -2) || '0'}</Dollars>
          <Cents>.{item.price.toString().slice(-2)}</Cents>
        </Price>
      );
    }

    let expandedItemDetails;
    if (this.state.showDetails) {
      expandedItemDetails = (
        <ExpandedItemDetails>
          <ReactPlaceholder
            ready={!this.state.loadingDetails}
            customPlaceholder={ExpandedItemDetailsPlaceholder}
            showLoadingAnimation={true}
          >
            {this.generateExpandedDetails(this.state.details)}
          </ReactPlaceholder>
        </ExpandedItemDetails>
      );
    }

    return (
      <ReactPlaceholder
        ready={this.props.ready}
        customPlaceholder={ItemPlaceholder}
        showLoadinganimation={true}
      >
        <ItemContainer onClick={this._getDetails}>
          <ItemImageContainer>
            <ItemImage src={item.image} />
          </ItemImageContainer>
          <ItemDetails>
            <ASIN>{item.product_id}</ASIN>
            <Title>
              <Truncate line={1}>{item.title}</Truncate>
            </Title>
            <Brand>by {item.brand}</Brand>
            {price}
          </ItemDetails>
          {expandedItemDetails}
        </ItemContainer>
      </ReactPlaceholder>
    );
  }
}

export default Item;
