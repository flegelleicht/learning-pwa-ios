import React, { Component } from 'react';



class Lists extends Component {
  
  render() {
    
    const mapped = this.props.lists.map((el) => {
      return <ListsList key={el.id} list={el} />
    });
    
    return (
      <React.Fragment>
        <div id="lists-header">
          <h1>Listen
            <button id="make-new-list">⊕</button>
          </h1>
        </div>
        <ul id="list-list">
          {mapped}
        </ul>
      </React.Fragment>
    );
  }
}

class ListsList extends Component {
  render () {
    const l = this.props.list;
    return (
      <li>
        { l.editing ? 
          <React.Fragment>
          <input 
            type="text" 
            value={l.title}
            className="input-list-title" 
            id="input-list-title-{l.id}" 
            data-listid={l.id} />
          <button 
            className="commit-list-title" 
            data-listid={l.id}>
            <span role="img" aria-label="save new title">✓</span>
          </button> 
          <button 
            className="cancel-list-title" 
            data-listid={l.id}>
            <span role="img" aria-label="discard changes">𐄂</span>
          </button>
          </React.Fragment>
        : 
          <React.Fragment>
          <span 
            className="list { l.isCurrentList ? `currentList` : ''}" 
            id={l.id}
          >{l.title}</span>
          <button 
            className="edit-list-title" 
            data-listid={l.id}>
            <span role="img" aria-label="edit list title">✍︎</span>
          </button>
          </React.Fragment>
        }
      </li>
    );
  }
}

export default Lists;