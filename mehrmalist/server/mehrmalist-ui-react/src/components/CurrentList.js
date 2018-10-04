import React, { Component } from 'react';

class CurrentList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      quickentryValue: '',
    }
    
    this.onChangeQuickentry = this.onChangeQuickentry.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
  }
  
  onChangeQuickentry(event) {
    this.setState({quickentryValue: event.target.value});
  }
  
  onKeyUp(event) {
    switch (event.key) {
    case 'Enter':
      let item = {
        id: `li_${Math.random().toString(36).substr(2)}`,
        title: this.state.quickentryValue
      }
      this.props.onNewItemInList(item, this.props.currentList);
      this.setState({
        quickentryValue: ''
      });
      break;
    default: break;
    }
  }
  
  render () {
    const currentList = this.props.currentList;
    const mapped = currentList.items.map((el) => 
      <CurrentListItem 
        key={el.id} 
        item={el}
        list={currentList}
        />
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
              onChange={this.onChangeQuickentry} 
              onKeyUp={this.onKeyUp}
              />
          </li>
        </ul>
      </React.Fragment>
    );
  }
}

class CurrentListItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: props.item.title
    }
    this.onChangeTitle = this.onChangeTitle.bind(this);
  }
  
  onChangeTitle(event) {
    this.setState({
      title: event.target.value
    });
  }
  
  render () {
    const list = this.props.list;
    const item = this.props.item;
    return (
    <li 
      className={`listitem bordered ${item.done ? 'done' : ''} ${item.editing ? 'editing' : ''}`} 
      id={item.id}
      data-itemid={item.id}
      >
      {item.editing ? 
        <React.Fragment>
        <input 
          type="text" 
          value={this.state.title}
          onChange={this.onChangeTitle} 
          className="input-item-title" id={`input-item-title-${list.id}-${item.id}`} 
          data-listid={list.id}
          data-itemid={item.id} />
          
        <button 
          className="commit-item-title" 
          data-listid={list.id}>
          <span role="img" aria-label="save new title">✓</span>
        </button>
        <button 
          className="cancel-item-title" 
          data-listid={list.id}>
          <span role="img" aria-label="discard changes">𐄂</span>
        </button>
        </React.Fragment>
      :
        <React.Fragment>
        <span 
          className="listitem-title" 
          id={`listitem-title-${item.id}`} 
          data-itemid={item.id}>
          {item.title}
        </span>
        {item.done ? 
          '' 
        : 
          <button 
            className="edit-item-title" 
            data-itemid={item.id} 
            data-listid={list.id}>
            <span role="img" aria-label="edit item title">✍︎</span>
          </button>
        }
        </React.Fragment>
      }
    </li>
    );
  }
}

export default CurrentList;