window.addEventListener('load', () => {
  const init = () => {
    let storage = window.localStorage;
    let TEMPLATES;
    let LISTS;
    let CURRENTLISTID;
    let FOCUSSEDINPUTFIELDID;
    let TOKEN;
    let UPDATEOPTIONS = () => {return {method: 'POST', headers: {'Authorization': `Bearer ${TOKEN}`}}};
    
    /* Load / setup storage */
    if (!storage.getItem('state')) {
      storage.setItem('state', JSON.stringify({
        templates: [...DEFAULT_TEMPLATES],
        lists: [],
        currentListId: null,
        focussedInputFieldId: null,
        authToken : '',
        latestSeenUpdate: 0
      }));
    }    
    
    const save = () => {
      storage.setItem('state', JSON.stringify(state));
    }
    
    const emit = (update) => {
      
      if (update.sync) {
        // ... and if online
        fetch(
          'api/v1/update',
          Object.assign(
            { body: JSON.stringify(update) },
            UPDATEOPTIONS()
          )
        ).then(r => console.log(r)).catch(e => console.error(e));
      } else {
        if (handleUpdate({upd: update})) {
          save();
          render();
        }
      }
    };
    
    const UPDATES = {
      makeNewTemplate: (params = {}) => {
        return { 
          sync: true,
          action: 'make-new-template', 
          params: {
            id: params.id || `t_${Math.random().toString(36).substr(2)}`,
            title: params.title || 'Neue Vorlage',
          }};
      },
      editTemplateTitle: (params = {}) => {
        return {
          sync: false,
          action: 'edit-template-title',
          params: {
            id: params.id
          }
        }
      },
      commitTemplateTitle: (params = {}) => {
        
      },
      cancelTemplateTitle: (params = {}) => {
        
      },
      
      makeNewTemplateItem: (params = {}) => {
        
      },
      editTemplateItemTitle: (params = {}) => {
        
      },
      commitTemplateItemTitle: (params = {}) => {
        
      },
      cancelTemplateItemTitle: (params = {}) => {
        
      },
      
      makeNewListFromTemplate: (params = {}) => {
        
      },
      makeNewList: (params = {}) => {
        
      },
      editListTitle: (params = {}) => {
        
      },
      commitListTitle: (params = {}) => {
        
      },
      cancelListTitle: (params = {}) => {
        
      },
      selectList: (params = {}) => {
        
      },
      
      makeNewListItem: (params = {}) => {
        
      },
      editListItemTitle: (params = {}) => {
        
      },
      commitListItemTitle: (params = {}) => {
        
      },
      cancelListItemTitle: (params = {}) => {
        
      },
      toggleListItemCompletion: (params = {}) => {
        
      }
    }
    
    state = JSON.parse(storage.getItem('state'));
    if (state) {
      TEMPLATES = state.templates;
      LISTS = state.lists;
      CURRENTLISTID = state.currentListId;
      FOCUSSEDINPUTFIELDID = state.focussedInputFieldId;
      state.latestSeenUpdate = state.latestSeenUpdate || 0;
      state.status = state.status || 'logged-out';

    }
    
    const handleUpdate = (update) => {
      let cmd = update.upd;
      switch(cmd.action) {
      case 'make-new-template': 
        {
          if (TEMPLATES.find((t) => { return t.id == cmd.params.id; })) {
            console.log(`Template ${cmd.params.id}`)
          } else {
            let t = { 
              id: cmd.params.id, title: cmd.params.title, items: [] };
            TEMPLATES.push(t);
            storage.setItem('state', JSON.stringify(state));
          }
        }
        return true;
      case 'edit-template-title': 
        {
          let t = TEMPLATES.find((t) => { return t.id == cmd.params.id });
          t.editing = true;
          state.focussedInputFieldId = FOCUSSEDINPUTFIELDID = `input-template-title-${t.id}`;
        }
        return true;
      case 'commit-template-title':
        {
          let t = TEMPLATES.find((t) => { return t.id === cmd.params.id; } );
          t.title = cmd.params.title;
          storage.setItem('state', JSON.stringify(state));
        }
        return true;
      default:
        return false;
      }
    }
    
    let updates;
    const startUpdates = () => {
      updates = new EventSource(`api/v1/updatestream?since=${state.latestSeenUpdate}&token=${TOKEN}`);
      updates.onmessage = (e) => {
        update = JSON.parse(e.data);
        if (handleUpdate(update)) {
          state.latestSeenUpdate = update.id;
          storage.setItem('state', JSON.stringify(state));
          render();
        }
      }
    }
    
    let ELEMENT = document.getElementById('mehrmalist');
    const render = () => {
      ELEMENT.innerHTML = '';
      
      if (state.status === 'logged-out') {
        // Show only the login elements
        let html = `
          <form id="login-form">
            <input type="text" id="login-user" value="" placeholder="Nutzer">
            <input type="password" id="login-pass" value="" placeholder="Passwort">
            <input type="submit" value="Senden">
          </form>`;
        ELEMENT.innerHTML = html;
        
        // Set up listeners
        
        let loginForm = document.getElementById('login-form');
        loginForm.addEventListener('submit', (event) => {
          event.preventDefault();
          let user = document.getElementById('login-user').value;
          let pass = document.getElementById('login-pass').value;
          
          fetch('api/v1/login', {
            method: 'POST',
            body: JSON.stringify({user: user, pass: pass})
          })
          .then(response => {
            if (response.ok) {
              response.json().then(json => {
                state.authToken = TOKEN = json.token;
                state.status = 'logged-in';
                storage.setItem('state', JSON.stringify(state));
                startUpdates();
                render();
              });
            }
          })
          .catch(error => console.error(error));
        });
        return; /* EARLY RETURN !
        ^^^^^^   **********************/
        
      }

      const LogoutButton = `
        <button id="logout-button">Ausloggen</button>
      `;
      
      /* Show templates header */
      const TemplateHeaderContent = `
      <div id="template-header"><h1>Vorlagen 
        <a href="#" id="make-new-template">⊕</a>
      </h1></div>`;
            
      const formatItemForTemplate = (item, template) => {
        return `
        <li class="${item.editing ? 'editing' : ''}" 
            id="${item.id}">
          ${item.editing ? 
            `<input type="text" value="${item.title}" class="input-template-item-title" id="input-template-item-title-${template.id}-${item.id}" data-templateid=${template.id} data-itemid="${item.id}" ${FOCUSSEDINPUTFIELDID === `input-template-item-title-${template.id}-${item.id}` ? 'autofocus' : ''}>
              <a href='#' class="commit-template-item-title" data-templateid="${template.id}" data-itemid="${item.id}">✓</a>
              <a href='#' class="cancel-template-item-title" data-templateid="${template.id}" data-itemid="${item.id}">𐄂</a>` 
            :
            `<span class="templateitem" id="${item.id}">${item.title}</span> <a href='#' class="edit-template-item-title" data-templateid=${template.id} data-itemid="${item.id}">✍︎</a>`
          }
        </li>`;
      };
      
      /* Show Templates */
      let templateContent = TEMPLATES.reduce((acc, t) => { 
        let html = `<li>
                        ${t.editing ? 
                          `<input 
                            type="text" 
                            value="${t.title}" 
                            class="input-template-title" 
                            id="input-template-title-${t.id}" 
                            data-templateid="${t.id}"
                            ${FOCUSSEDINPUTFIELDID === `input-template-title-${t.id}` ? 'autofocus': ''}>
                            <a href='#' class="commit-template-title" data-templateid="${t.id}">✓</a> <a href='#' class="cancel-template-title" data-templateid="${t.id}">𐄂</a>
                          ` 
                          :
                          `<span class="template" id="${t.id}">${t.title}</span>
                          <a href='#' class="edit-template-title" data-templateid="${t.id}">✍︎</a>`}

                        <a href='#' class="make-new-list-from-this" data-templateid="${t.id}">❏</a>

                        ${t.expanded ? `<ul>
                          ${t.items.reduce((acc, item) => {return acc + `<li>${item.title}</li>`}, '')}
                          <li><a href='#' class="add-item-to-template" data-templateid="${t.id}">⊕</a></li>
                          </ul>` : ''} 
                    </li>`;
                    return acc + html; 
      }, "");
      const TemplateList = `
        <ul id="template-list">
        ${templateContent}
        </ul>
      `;
    
      const ListsHeaderContent = `
        <div id="lists-header">
          <h1>Listen
            <a href="#" id="make-new-list">⊕</a>
          </h1>
        </div>
      `;      
      
      /* Show Lists */
      let listContent = LISTS.reduce((acc, l) => { 
        let html = `<li>
                      ${l.editing ? 
                        `<input 
                          type="text" 
                          value="${l.title}" 
                          class="input-list-title" 
                          id="input-list-title-${l.id}" 
                          data-listid="${l.id}" 
                          ${FOCUSSEDINPUTFIELDID === `input-list-title-${l.id}` ? 'autofocus': ''}
                          >
                        <a href='#' class="commit-list-title" data-listid="${l.id}">✓</a> <a href='#' class="cancel-list-title" data-listid="${l.id}">𐄂</a>`
                        : 
                        `<span 
                            class="list ${CURRENTLISTID === l.id ? `currentList` : ''}" 
                            id="${l.id}"
                          >${l.title}</span>
                        <a href='#' class="edit-list-title" data-listid="${l.id}">✍︎</a>`
                      }
                    </li>`;
        return acc + html
      }, "");
      const ListsList = `
        <ul id="list-list">
          ${listContent}
        </ul>
      `;
    
      const formatItemForList = (item, list) => {
        return `
        <li class="listitem bordered ${item.done ? 'done' : ''} ${item.editing ? 'editing' : ''}" 
            id="${item.id}">
          ${item.editing ? 
            `<input type="text" value="${item.title}" class="input-item-title" id="input-item-title-${list.id}-${item.id}" data-listid="${list.id}" data-itemid="${item.id}" ${FOCUSSEDINPUTFIELDID === `input-item-title-${list.id}-${item.id}` ? 'autofocus' : ''}>
              <a href='#' class="commit-item-title" data-listid="${list.id}" data-itemid="${item.id}">✓</a>
              <a href='#' class="cancel-item-title" data-listid="${list.id}" data-itemid="${item.id}">𐄂</a>` 
            :
            `<span class="listitem-title" id="listitem-title-${item.id}">${item.title}
             ${item.done ? '' : `<a href='#' class="edit-item-title" data-itemid=${item.id} data-listid="${list.id}">✍︎</a>`}</span>`
          }
          
        </li>`;
      };
      
      /* Show current list */
      let CurrentList = '';
      if (CURRENTLISTID) {
        let l = LISTS.find((l) => { return l.id === CURRENTLISTID; });
        CurrentList += `
          <h1 id="list-header">Liste: ${l.title}</h1>
        `;
        
        let todoListItems = l.items.filter(item => !item.done);
        let completedListItems = l.items.filter(item => item.done);
        
        html = '';
        html = todoListItems.reduce((acc, item) => { return acc + formatItemForList(item, l); }, html);
        html = html + `<li class="quickentry"><input type="text" class="quickentry-add-item-to-list" data-listid="${l.id}" placeholder="+ Eintrag" value=""></li>`;
        html = completedListItems.reduce((acc, item) => { return acc + formatItemForList(item, l); }, html);
        
        CurrentList += `
          <ul id="list-items">
            ${html}
          </ul>
        `;
      }
      
      const Content = `
        ${LogoutButton}
        ${TemplateHeaderContent}
        ${TemplateList}
        ${ListsHeaderContent}
        ${ListsList}
        ${CurrentList}
      `;
      
      ELEMENT.innerHTML = Content;
      
      /* Log out */
      let logoutButton = document.getElementById('logout-button');
      if (logoutButton) {
        logoutButton.addEventListener('click', (event) => {
          state.authToken = '';
          state.status = 'logged-out';
          if (updates) updates.close();
          storage.setItem('state', JSON.stringify(state));
          render();
        });
      }
            
      /* Toggle template list expansion by clicking on it */
      Array.from(document.getElementsByClassName('template')).map((el) => {
        el.addEventListener('click', (event) => {
          let template = TEMPLATES.find((t) => { return t.id === event.target.id; });
          if (template.expanded === true) {
            template.expanded = false;
          } else {
            template.expanded = true;
          }
          storage.setItem('state', JSON.stringify(state));
          render();
        });
      });  
      
      /* Add a new template to templates */
      let makeNewTemplate = document.getElementById('make-new-template');
      if (makeNewTemplate) {
        makeNewTemplate.addEventListener('click', (event) => {
          event.preventDefault(); event.stopPropagation();
          emit(UPDATES.makeNewTemplate());
        });
      }
      
      /* Enable template title editing */
      Array.from(document.getElementsByClassName('edit-template-title')).map((el) => {
        el.addEventListener('click', (event) => {
          event.preventDefault(); event.stopPropagation();
          emit(UPDATES.editTemplateTitle({id: event.target.dataset.templateid}));
        });
      });

      /* Commit template title*/
      Array.from(document.getElementsByClassName('commit-template-title')).map((el) => {
        el.addEventListener('click', (event) => {
          event.preventDefault(); event.stopPropagation();
          let template = TEMPLATES.find((t) => { return t.id === event.target.dataset.templateid; } );
          template.title = document.getElementById(`input-template-title-${template.id}`).value;
          template.editing = false;
          storage.setItem('state', JSON.stringify(state));
          
          fetch('api/v1/update', Object.assign({body: JSON.stringify({action: 'commit-template-title', params: {id: template.id, title: template.title}})}, UPDATEOPTIONS())).then(r => console.log(r)).catch(e => console.error(e));
          
          render();
        });
      });
      
      /* Commit/cancel template title with enter/escape */
      Array.from(document.getElementsByClassName('input-template-title')).map((el) => {
        el.addEventListener('keyup', (event) => {
          switch (event.keyCode) {
            case 13 /* Enter */: 
              event.preventDefault(); event.stopPropagation();
              { 
                let template = TEMPLATES.find((t) => { return t.id === event.target.dataset.templateid; } );
                template.title = document.getElementById(`input-template-title-${template.id}`).value;
                template.editing = false;
                storage.setItem('state', JSON.stringify(state));

                fetch('api/v1/update', Object.assign({body: JSON.stringify({action: 'commit-template-title', params: {id: template.id, title: template.title}})}, UPDATEOPTIONS())).then(r => console.log(r)).catch(e => console.error(e));
              }
              render();
              break;
            case 27 /* Escape */: 
              event.preventDefault(); event.stopPropagation();
              {
                let template = TEMPLATES.find((t) => { return t.id === event.target.dataset.templateid; } );
                template.editing = false;
              }
              render();
              break;
            default: break;
          }
        });
      });

      /* Cancel editing template title*/
      Array.from(document.getElementsByClassName('cancel-template-title')).map((el) => {
        el.addEventListener('click', (event) => {
          event.preventDefault(); event.stopPropagation();
          let template = TEMPLATES.find((t) => { return t.id === event.target.dataset.templateid; } );
          template.editing = false;
          render();
        });
      });
      
      /* Add an item to a template */
      Array.from(document.getElementsByClassName('add-item-to-template')).map((el) => {
        el.addEventListener('click', (event) => {
          event.preventDefault(); event.stopPropagation();
          
          let template = TEMPLATES.find((t) => { return t.id === event.target.dataset.templateid; } );
          
          let item = { id: `ti_${template.items.length + 1}`, title: 'Neuer Template-Eintrag', editing: true };
          FOCUSSEDINPUTFIELDID = `input-template-item-title-${template.id}-${item.id}`;
          template.items.push(item);
          
          render();
        });
      });
      
      /* Edit item title */
      Array.from(document.getElementsByClassName('edit-template-item-title')).map((el) => {
        el.addEventListener('click', (event) => {
          event.preventDefault(); event.stopPropagation();
          let template = TEMPLATES.find((t) => { return t.id === event.target.dataset.templateid });
          let item = template.items.find((i) => { return i.id === event.target.dataset.itemid });
          item.editing = true;
          FOCUSSEDINPUTFIELDID = `input-template-item-title-${template.id}-${item.id}`;
          render();
        });
      });

      /* Commit item title*/
      Array.from(document.getElementsByClassName('commit-template-item-title')).map((el) => {
        el.addEventListener('click', (event) => {
          event.preventDefault(); event.stopPropagation();
          let template = TEMPLATES.find((t) => { return t.id === event.target.dataset.templateid });
          let item = template.items.find((i) => { return i.id === event.target.dataset.itemid });
          item.title = document.getElementById(`input-template-item-title-${template.id}-${item.id}`).value;
          item.editing = false;
          storage.setItem('state', JSON.stringify(state));
          render();          
        });
      });

      /* Cancel editing item title*/
      Array.from(document.getElementsByClassName('cancel-template-item-title')).map((el) => {
        el.addEventListener('click', (event) => {
          event.preventDefault(); event.stopPropagation();
          let template = TEMPLATES.find((t) => { return t.id === event.target.dataset.templateid });
          let item = template.items.find((i) => { return i.id === event.target.dataset.itemid });
          item.editing = false;
          render();
        });
      });
      
      /* Commit/cancel template item title with enter/escape */
      Array.from(document.getElementsByClassName('input-template-item-title')).map((el) => {
        el.addEventListener('keyup', (event) => {
          switch (event.keyCode) {
            case 13 /* Enter */: 
              event.preventDefault(); event.stopPropagation();
              { 
                let template = TEMPLATES.find((t) => { return t.id === event.target.dataset.templateid });
                let item = template.items.find((i) => { return i.id === event.target.dataset.itemid });
                item.title = document.getElementById(`input-template-item-title-${template.id}-${item.id}`).value;
                item.editing = false;
                storage.setItem('state', JSON.stringify(state));
              }
              if (event.shiftKey) {
                console.log("SHIFT!");
                document.getElementsByClassName('add-item-to-template')[0].click();
              } else {
                render();                
              }
              break;
            case 27 /* Escape */: 
              event.preventDefault(); event.stopPropagation();
              {
                let template = TEMPLATES.find((t) => { return t.id === event.target.dataset.templateid });
                let item = template.items.find((i) => { return i.id === event.target.dataset.itemid });
                item.editing = false;
              }
              render();
              break;
            default: break;
          }
        });
      });
      
            
      /* Make list from template by clicking on it */
      Array.from(document.getElementsByClassName('make-new-list-from-this')).map((el) => {
        el.addEventListener('click', (event) => {
          event.preventDefault(); event.stopPropagation();
          let template = TEMPLATES.find((t) => { return t.id === event.target.dataset.templateid; } );
          let newList = {};
          newList.id = `l_${LISTS.length + 1}`;
          newList.title = template.title;
          newList.items = [...template.items];
          
          LISTS.push(newList);
          state.currentListId = CURRENTLISTID = newList.id;
          storage.setItem('state', JSON.stringify(state));
          render();
        });
      });
      
      /* Make a new list without a template */
      let makeNewList = document.getElementById('make-new-list');
      if (makeNewList) {
        makeNewList.addEventListener('click', (event) => {
          event.preventDefault(); event.stopPropagation();
          let l = { id: `l_${LISTS.length + 1}`, title: 'Neue Liste', items: [], editing: true };
          // FOCUSSEDINPUTFIELDID =
          LISTS.push(l);
          state.currentListId = CURRENTLISTID = l.id;
          storage.setItem('state', JSON.stringify(state));
          render();
        });
      }
      
      /* Enable item title editing */
      Array.from(document.getElementsByClassName('edit-list-title')).map((el) => {
        el.addEventListener('click', (event) => {
          event.preventDefault(); event.stopPropagation();
          let list = LISTS.find((l) => { return l.id === event.target.dataset.listid; });
          list.editing = true;
          FOCUSSEDINPUTFIELDID = `input-list-title-${list.id}`;
          render();
        });
      });
      
      
      /* Commit list title*/
      Array.from(document.getElementsByClassName('commit-list-title')).map((el) => {
        el.addEventListener('click', (event) => {
          event.preventDefault(); event.stopPropagation();
          let list = LISTS.find((l) => { return l.id === event.target.dataset.listid; } );
          list.title = document.getElementById(`input-list-title-${list.id}`).value;
          list.editing = false;
          storage.setItem('state', JSON.stringify(state));
          render();
        });
      });
      
      /* Commit/cancel template title with enter/escape */
      Array.from(document.getElementsByClassName('input-list-title')).map((el) => {
        el.addEventListener('keyup', (event) => {
          switch (event.keyCode) {
            case 13 /* Enter */: 
              event.preventDefault(); event.stopPropagation();
              { 
                let list = LISTS.find((l) => { return l.id === event.target.dataset.listid; } );
                list.title = document.getElementById(`input-list-title-${list.id}`).value;
                list.editing = false;
                storage.setItem('state', JSON.stringify(state));
              }
              render();
              break;
            case 27 /* Escape */: 
              event.preventDefault(); event.stopPropagation();
              {
                let list = LISTS.find((l) => { return l.id === event.target.dataset.listid; } );
                list.editing = false;
                storage.setItem('state', JSON.stringify(state));
              }
              render();
              break;
            default: break;
          }
        });
      });

      /* Cancel editing template title*/
      Array.from(document.getElementsByClassName('cancel-list-title')).map((el) => {
        el.addEventListener('click', (event) => {
          event.preventDefault(); event.stopPropagation();
          let list = LISTS.find((l) => { return l.id === event.target.dataset.listid; } );
          list.editing = false;
          render();
        });
      });
            
      /* Make list current list by clicking on it */
      Array.from(document.getElementsByClassName('list')).map((el) => {
        el.addEventListener('click', (event) => {
          let list = LISTS.find((l) => { return l.id === event.target.id });
          state.currentListId = CURRENTLISTID = list.id;
          storage.setItem('state', JSON.stringify(state));
          render();
        });
      });
      
      /* Add an item to a list */
      Array.from(document.getElementsByClassName('add-item-to-list')).map((el) => {
        el.addEventListener('click', (event) => {
          event.preventDefault(); event.stopPropagation();
          let list = LISTS.find((l) => { return l.id === event.target.dataset.listid });          
          let item = { id: `li_${list.items.length + 1}`, title: "Neuer Eintrag", editing: true };
          list.items.push(item);
          
          storage.setItem('state', JSON.stringify(state));
          render();
        });
      });
      
      /* Add an item to a list directly via textbox */
      Array.from(document.getElementsByClassName('quickentry-add-item-to-list')).map((el) => {
        el.addEventListener('keyup', (event) => {
          switch (event.keyCode) {
            case 13 /* Enter */: 
              event.preventDefault(); event.stopPropagation();
              { 
                let list = LISTS.find((l) => { return l.id === event.target.dataset.listid });
                let text = event.target.value;
                let item = { id: `li_${list.items.length + 1}`, title: text, editing: false };
                list.items.push(item);
                storage.setItem('state', JSON.stringify(state));
              }
              render();
              break;
            case 27 /* Escape */: 
              event.preventDefault(); event.stopPropagation();
              {
                event.target.value = '';
              }
              render();
              break;
            default: break;
          }
        });
      });
      
      /* Toggle item's “done” status by clicking on it */
      Array.from(document.getElementsByClassName('listitem')).map((el) => {
        el.addEventListener('click', (event) => {
          let list = LISTS.find((l) => { return l.id === currentListId });
          let item = list.items.find((item) => { return item.id === event.target.id });
          item.done = !item.done;
          storage.setItem('state', JSON.stringify(state));
          render();          
        })
      });
      
      /* Edit item title */
      Array.from(document.getElementsByClassName('edit-item-title')).map((el) => {
        el.addEventListener('click', (event) => {
          event.preventDefault(); event.stopPropagation();
          let list = LISTS.find((l) => { return l.id === event.target.dataset.listid });
          let item = list.items.find((i) => { return i.id === event.target.dataset.itemid });
          item.editing = true;
          FOCUSSEDINPUTFIELDID = `input-item-title-${list.id}-${item.id}`;
          render();
        });
      });

      /* Commit item title*/
      Array.from(document.getElementsByClassName('commit-item-title')).map((el) => {
        el.addEventListener('click', (event) => {
          event.preventDefault(); event.stopPropagation();
          let list = LISTS.find((l) => { return l.id === event.target.dataset.listid });
          let item = list.items.find((i) => { return i.id === event.target.dataset.itemid });
          item.title = document.getElementById(`input-item-title-${list.id}-${item.id}`).value;
          item.editing = false;
          storage.setItem('state', JSON.stringify(state));
          render();          
        });
      });

      /* Cancel editing item title*/
      Array.from(document.getElementsByClassName('cancel-item-title')).map((el) => {
        el.addEventListener('click', (event) => {
          event.preventDefault(); event.stopPropagation();
          let list = LISTS.find((l) => { return l.id === event.target.dataset.listid });
          let item = list.items.find((i) => { return i.id === event.target.dataset.itemid });
          item.editing = false;
          render();
        });
      });
      
      
    };
    
    render();
    
  };
  
  init();
});
