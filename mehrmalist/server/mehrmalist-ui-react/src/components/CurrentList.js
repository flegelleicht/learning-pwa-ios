import React, { Component } from 'react';

class CurrentList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      quickentryValue: '',
    }
    
    this.onChangeQuickentry = this.onChangeQuickentry.bind(this);
  }
  
  onChangeQuickentry(event) {
    this.setState({quickentryValue: event.target.value});
  }
  
  render () {
    const currentList = this.props.currentList;
    const mapped = currentList.items.map((el) => 
    <CurrentListItem key={el.id} item={el}/>
    );
    return (
      <React.Fragment>
        <h1 id="list-header">Liste: {currentList.title}</h1>
        <ul id="list-items">
        {mapped}
          <li className="quickentry">
            <input 
              type="text"
              className="quickentry-add-item-to-list"
              data-listid={currentList.id}
              placeholder="+ Eintrag" 
              value={this.state.quickentryValue}
              onChange={this.onChangeQuickentry} />
          </li>
        </ul>
      </React.Fragment>
    );
  }
}

class CurrentListItem extends Component {
  render () {
    return (
      <li>{this.props.item.title}</li>
    );
  }
}

export default CurrentList;