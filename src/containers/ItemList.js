import React, { Component } from 'react';
import styled from 'styled-components';
import Item from '../components/Item.js';

const ItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

/*
 * Each ItemList represents 10 items.
 * Until props.ready is true, it will display placeholders.
 * ItemLists should never
 */

class ItemList extends Component {
  constructor(props) {
    super(props);
  }

  componentWillUnmount() {
    console.debug('itemlist unmounting');
  }

  render() {
    let items = [];
    if (this.props.ready == false) {
      for (let i = 0; i < 10; i++) {
        items.push(
          <Item
            ready={this.props.ready}
            item={new Proxy({}, itemDetailsHandler)}
            key={i}
          />
        );
      }
    } else {
      items = this.props.items.map(item => (
        <Item
          clientToken={this.props.clientToken}
          ready={this.props.ready}
          item={new Proxy(item, itemDetailsHandler)}
          key={item.product_id}
        />
      ));
    }

    return <div>{items}</div>;
  }
}

export default ItemList;

const defaultItemDetails = {
  product_id: 'B00000000',
  title: 'Unknown Item',
  price: 0,
  image: 'https://via.placeholder.com/64?text=No+image!',
  brand: 'Unknown',
  product_details: [],
};

const itemDetailsHandler = {
  get: function(target, key) {
    if (target[key] === null || target[key] == undefined) {
      return defaultItemDetails[key];
    }
    return target[key];
  },
};
