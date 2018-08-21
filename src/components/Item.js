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

class Item extends Component {
  constructor(props) {
    super(props);
  }

  componentWillUnmount() {
    console.debug('item unmounting');
  }
  render() {
    const item = this.props.item;
    let dollars;
    let cents;
    if (item.price == 0) {
      dollars = 'Click for price';
    } else {
      dollars = item.price.toString().slice(0, -2) || '0';
      cents = item.price.toString().slice(-2);
    }
    return (
      <ReactPlaceholder
        ready={this.props.ready}
        customPlaceholder={ItemPlaceholder}
        showLoadinganimation={true}


      >
        <a
          href={`https://www.amazon.com/-/dp/${item.product_id}`}
          target="_blank"
          style={{ textDecoration: 'none' }}
        >
          <ItemContainer>
            <ItemImageContainer>
              <ItemImage src={item.image} />
            </ItemImageContainer>
            <ItemDetails>
              <ASIN>{item.product_id}</ASIN>
              <Title>
                <Truncate line={1}>{item.title}</Truncate>
              </Title>
              <Brand>by {item.brand}</Brand>
              <Price>
                <DollarSign>$</DollarSign>
                <Dollars>{dollars}</Dollars>
                <Cents>.{cents}</Cents>
              </Price>
            </ItemDetails>
          </ItemContainer>
        </a>
      </ReactPlaceholder>
    );
  }
}

export default Item;
