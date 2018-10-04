import React, { Component } from 'react';
import './App.css';

import Login  from './components/Login.js';
import Logout from './components/Logout.js';
import Templates from './components/Templates.js';
import Lists from './components/Lists.js';
import CurrentList from './components/CurrentList.js';

class App extends Component {
  constructor(props) {
    super(props);
    
    this.state = JSON.parse(window.localStorage.getItem('state'));
    if (!this.state) {
      this.state = {
        token: null,
        loggedIn: false,
        templates: [
          {
            id: "t_iwzGDrRw",
            title: "Wocheneinkauf",
            items: [
              { id: "ti_xtgKGhLW",   title: "Brot" },
              { id: "ti_Xiedbcu5",   title: "Frischkäse" },
              { id: "ti_rf8KJAce",   title: "Käse" },
              { id: "ti_3c6kQszZ",   title: "Eier" },
              { id: "ti_U0Skqkcy",   title: "Kaffee" },
              { id: "ti_qCzGdC3q",   title: "Schwarzer Tee" },
              { id: "ti_Be1PXZgf",   title: "Milch" },
              { id: "ti_qt4oiiie",   title: "Avocado" },
            ],
          },
        ],
        lists : [
          {
            id: "l_hNA71C5c",
            title: "Wochenzweikauf",
            items: [
              { id: "li_jGP5s_QO", title: "Brot" },
            ]
          },
        ],
        currentList: null,
      };
      this.save();
    }
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.onNewTemplate = this.onNewTemplate.bind(this);
    this.onToggleExpandTemplate = this.onToggleExpandTemplate.bind(this);
    this.onEditTemplateTitle = this.onEditTemplateTitle.bind(this);
    this.onCancelEditTemplateTitle = this.onCancelEditTemplateTitle.bind(this);
    this.onCommitEditTemplateTitle = this.onCommitEditTemplateTitle.bind(this);
    
    this.onNewListFromTemplate = this.onNewListFromTemplate.bind(this);
    this.onSelectList = this.onSelectList.bind(this);
    this.onNewItemInList = this.onNewItemInList.bind(this);
    this.onChangeItemTitleInList = this.onChangeItemTitleInList.bind(this);
  }
  
  save() {
    window.localStorage.setItem('state', JSON.stringify(this.state));
  }
  
  login(token) {
    this.setState({
      token: token,
      loggedIn: true
    });
    this.save();
  }
  
  logout() {
    this.setState({
      token: null,
      loggedIn: false
    });
    this.save();
  }
  
  onNewTemplate() {
    console.log(`onNewTemplate`);
  }
  
  onToggleExpandTemplate(template){
    console.log(`onToggleExpandTemplate for: ${template.id}`);
    //let t = this.state.templates.findIndex((el) => el.id === templateId);
    template.expanded = !template.expanded;
    this.setState({templates: this.state.templates});
    this.save();
  }
  
  onEditTemplateTitle(template) {
    console.log(`onEditTemplateTitle for: ${template.id}`);
    template.editing = true;
    this.setState({templates: this.state.templates});
    this.save();
  }
  
  onCancelEditTemplateTitle(template) {
    template.editing = false;
    this.setState({templates: this.state.templates});
    this.save();
  }
  
  onCommitEditTemplateTitle(template, title) {
    template.editing = false;
    template.title = title;
    this.setState({templates: this.state.templates});
    this.save();
  }
  
  onNewListFromTemplate(list, template) {
    let items = template.items.map((i) => {
      return {...i, id: i.id.replace(/^ti/, 'li')}});
    list.items = items;
    this.state.lists.push(list);
    this.setState({
      lists: this.state.lists
    });
    this.save();
  }
  
  onSelectList(list) {
    let prev = this.state.lists.find((l) => l.isCurrentList === true);
    if (prev) prev.isCurrentList = false;
    list.isCurrentList = true;
    this.setState({
      lists: this.state.lists,
      currentList: list
    });
    this.save();
  }
  
  onNewItemInList(item, list) {
    let l = this.state.lists.find((l) => l.id === list.id);
    l.items.push(item);
    this.setState({
      lists: this.state.lists,
    });
    this.save();
  }
  
  onChangeItemTitleInList(item, list) {
    console.log(`onChangeItemTitleInList: ${item.id} ${list.id}`);
    
    let l = this.state.lists.find((l) => l.id === list.id);
    let i = l.items.find((i) => i.id === item.id);
    i.title = item.title;
    this.setState({
      lists: this.state.lists,
    });
    this.save();
  }
  
  render() {
    return (
      <React.Fragment>
        { 
          !this.state.loggedIn ? 
          <Login onLogin={this.login} /> 
          :
          <React.Fragment>
            <Logout onLogout={this.logout}/>
            <Templates 
              templates={this.state.templates}
              onNewTemplate={this.onNewTemplate}
              onToggleExpandTemplate={this.onToggleExpandTemplate}
              onEditTemplateTitle={this.onEditTemplateTitle}
              onCancelEditTemplateTitle={this.onCancelEditTemplateTitle}
              onCommitEditTemplateTitle={this.onCommitEditTemplateTitle}
              onNewListFromTemplate={this.onNewListFromTemplate}
            />
            <Lists
              lists={this.state.lists}
              onSelectList={this.onSelectList}
            />
            { this.state.currentList ? 
              <CurrentList
                currentList={this.state.currentList}
                onNewItemInList={this.onNewItemInList}
                onChangeItemTitleInList={this.onChangeItemTitleInList}
              />
            :
              <React.Fragment></React.Fragment>
            }
          </React.Fragment>
        }
      </React.Fragment>
    );
  }
}

export default App;
