import React, { Component } from 'react';

class Templates extends Component {

  render() {
    
    const mapped = this.props.templates.map((el, idx) => {
      return (
        <Template 
          key={el.id} 
          template={el}
          onToggleExpandTemplate={this.props.onToggleExpandTemplate}
          onEditTemplateTitle={this.props.onEditTemplateTitle}
          onCancelEditTemplateTitle={this.props.onCancelEditTemplateTitle}
          onCommitEditTemplateTitle={this.props.onCommitEditTemplateTitle}
          onNewListFromTemplate={this.props.onNewListFromTemplate}
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

class Template extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newTitle: props.template.title,
    }
    this.onChangeTitle = this.onChangeTitle.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onNewListFromTemplate = this.onNewListFromTemplate.bind(this);
  }
  
  onChangeTitle(event) {
    this.setState({newTitle: event.target.value});
  } 
  
  onKeyUp(event) {
    switch (event.key) {
    case 'Enter':
      this.props.onCommitEditTemplateTitle(this.props.template, this.state.newTitle);
      break;
    case 'Escape':
      this.props.onCancelEditTemplateTitle(this.props.template);
      break;
    default: break;
    }
  }
  
  onNewListFromTemplate(template) {
    let list = {
      id: `li_${Math.random().toString(36).substr(2)}`,
      title: template.title,
      items: []
    }
    this.props.onNewListFromTemplate(list, template);
  }

  render() {
    const t = this.props.template;
    return (
      <li>
      { t.editing ? 
        <React.Fragment>
        <input 
          type="text" 
          value={this.state.newTitle}
          onChange={this.onChangeTitle}
          onKeyUp={this.onKeyUp}
          className="input-template-title" 
          id={`input-template-title-${t.id}`} 
          data-templateid={t.id} />
        <button 
          className="commit-template-title" 
          data-templateid="{t.id}"
          onClick={() => this.props.onCommitEditTemplateTitle(t, this.state.newTitle)}>
          <span role="img" aria-label="save new title">✓</span>
        </button>
        <button 
          className="cancel-template-title" 
          data-templateid="{t.id}"
          onClick={() => this.props.onCancelEditTemplateTitle(t)}>
          <span role="img" aria-label="discard changes">𐄂</span>
        </button>
        </React.Fragment>
      :
        <React.Fragment>
        <span 
          className="template" 
          id={t.id}
          onClick={() => { this.props.onToggleExpandTemplate(t); }}
          >
          {t.title}
        </span>
        <button 
          className="edit-template-title" 
          data-templateid={t.id}
          onClick={() => this.props.onEditTemplateTitle(t)}>
          <span role="img" aria-label="edit template">✍︎</span>
        </button>
        </React.Fragment>
      }
        <button 
          className="make-new-list-from-this" 
          data-templateid={t.id}
          onClick={() => this.onNewListFromTemplate(t)}>
          <span role="img" aria-label="create list from template">❏</span>
        </button>
      { t.expanded ? 
        <ul>
        { t.items.map((el) => { 
          return <TemplateItem key={el.id} item={el} template={t}/> })}
        </ul>
      :
        ''
      }
      </li>
    );
  }
}

const TemplateItem = (props) => {
  const item = props.item;
  const template = props.template;
  return (
    <li 
      className="{item.editing ? 'editing' : ''}" 
      id="{item.id}">
      
      {
        item.editing ?
        <React.Fragment>
        <input 
          type="text" 
          value="{item.title}" 
          className="input-template-item-title" id="input-template-item-title-{template.id}-{item.id}" data-templateid={template.id} 
          data-itemid={item.id}
        />
        <button 
          className="commit-template-item-title" 
          data-templateid={template.id}
          data-itemid={item.id}>
          <span role="img" aria-label="save new title">✓</span>
        </button>
        <button 
          className="cancel-template-item-title" 
          data-templateid={template.id}
          data-itemid={item.id}>
          <span role="img" aria-label="discard changes">𐄂</span>
        </button>          
        </React.Fragment>
      :
        <React.Fragment>
        <span className="templateitem" id={item.id}>{item.title}</span>
        <button 
          className="edit-template-item-title" 
          data-templateid={template.id} 
          data-itemid={item.id}>
          <span role="img" aria-label="edit template item title">✍︎</span>
        </button>
        </React.Fragment>
      }
    </li>
  );
}

export default Templates;
