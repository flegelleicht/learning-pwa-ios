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
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.onNewTemplate = this.onNewTemplate.bind(this);
    this.onToggleExpandTemplate = this.onToggleExpandTemplate.bind(this);
    this.onEditTemplateTitle = this.onEditTemplateTitle.bind(this);
    this.onCancelEditTemplateTitle = this.onCancelEditTemplateTitle.bind(this);
    this.onCommitEditTemplateTitle = this.onCommitEditTemplateTitle.bind(this);
    
    this.onSelectList = this.onSelectList.bind(this);
  }
  
  login(token) {
    this.setState({
      token: token,
      loggedIn: true
    })
  }
  
  logout() {
    this.setState({
      token: null,
      loggedIn: false
    });
  }
  
  onNewTemplate() {
    console.log(`onNewTemplate`);
  }
  
  onToggleExpandTemplate(template){
    console.log(`onToggleExpandTemplate for: ${template.id}`);
    //let t = this.state.templates.findIndex((el) => el.id === templateId);
    template.expanded = !template.expanded;
    this.setState({templates: this.state.templates});
  }
  
  onEditTemplateTitle(template) {
    console.log(`onEditTemplateTitle for: ${template.id}`);
    template.editing = true;
    this.setState({templates: this.state.templates});
  }
  
  onCancelEditTemplateTitle(template) {
    template.editing = false;
    this.setState({templates: this.state.templates});
  }
  
  onCommitEditTemplateTitle(template, title) {
    template.editing = false;
    template.title = title;
    this.setState({templates: this.state.templates});
  }
  
  onSelectList(list) {
    let prev = this.state.lists.find((l) => l.isCurrentList === true);
    if (prev) prev.isCurrentList = false;
    list.isCurrentList = true;
    this.setState({
      lists: this.state.lists,
      currentList: list
    });
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
            />
            <Lists
              lists={this.state.lists}
              onSelectList={this.onSelectList}
            />
            { this.state.currentList ? 
              <CurrentList
                currentList={this.state.currentList}
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
