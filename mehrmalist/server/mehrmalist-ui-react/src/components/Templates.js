import React, { Component } from 'react';

class Template extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newTitle: '',
    }
    this.onChangeTitle = this.onChangeTitle.bind(this);
  }
  
  onChangeTitle(event) {
    this.setState({newTitle: event.target.value});
  } 

  render() {
    const t = this.props.template;
    return (
      <li>
      { t.editing ? 
        <React.Fragment>
        <input 
          type="text" 
          value={t.title}
          onChange={this.onChangeTitle}
          className="input-template-title" 
          id="input-template-title-{t.id}" 
          data-templateid={t.id} />
        <button 
          className="commit-template-title" 
          data-templateid="{t.id}">
          <span role="img" aria-label="save new title">✓</span>
        </button>
        <button 
          className="cancel-template-title" 
          data-templateid="{t.id}">
          <span role="img" aria-label="discard changes">𐄂</span>
        </button>
        </React.Fragment>
      :
        <span 
          className="template" 
          id={t.id}
          onClick={() => { this.props.onToggleExpandTemplate(t); }}
          >
          {t.title}
        </span>
      }
        <button 
          className="edit-template-title" 
          data-templateid={t.id}>
          <span role="img" aria-label="edit template">✍︎</span>
        </button>
        <button 
          className="make-new-list-from-this" 
          data-templateid={t.id}>
          <span role="img" aria-label="create list from template">❏</span>
        </button>
      { t.expanded ? 
        <ul>
        { t.items.map((el) => { 
          return <TemplateItem key={el.id} title={el.title}/> })}
        </ul>
      :
        ''
      }
      </li>
    );
  }
}

const TemplateItem = (props) => {
  return (
    <li>{props.title}</li>
  );
}

class Templates extends Component {

  render() {
    
    const mapped = this.props.templates.map((el, idx) => {
      return (
        <Template 
          key={el.id} 
          template={el}
          onToggleExpandTemplate={this.props.onToggleExpandTemplate}
          onEditTemplateTitle={this.props.onEditTemplateTitle}
        />
      );
    });
    
    return (
      <React.Fragment>
        <div id="template-header">
          <h1>Vorlagen 
            <button 
              value=""
              id="make-new-template"
              onClick={this.props.onNewTemplate}>
              ⊕
            </button>
          </h1>
        </div>
        <ul id="template-list">
          {mapped}
        </ul>
      </React.Fragment>
    );
  }
}

export default Templates;
