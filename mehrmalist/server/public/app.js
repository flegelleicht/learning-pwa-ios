window.addEventListener('load', () => {
  const LOCAL_STORAGE_KEY = 'state.mehrmalist';
  const init = () => {
    let storage = window.localStorage;
    let TEMPLATES;
    let LISTS;
    let CURRENTLISTID;
    let FOCUSSEDINPUTFIELDID;
    let TOKEN;
    let UPDATEOPTIONS = () => {return {method: 'POST', headers: {'Authorization': `Bearer ${TOKEN}`}}};
    
    /* Load / setup storage */
    if (!storage.getItem(LOCAL_STORAGE_KEY)) {
      storage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
        templates: [...DEFAULT_TEMPLATES],
        lists: [],
        currentListId: null,
        focussedInputFieldId: null,
        authToken : '',
        latestSeenUpdate: 0
      }));
    }    
    
    const save = () => {
      storage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    }
    
    let online = false;
    
    const emit = (update) => {
      
      if (update.sync) {
        if (online) {
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
            id: params.id,
            title: params.title,
          }};
      },
      deleteTemplate: (params = {}) => {
        return {
          sync: true,
          action: 'delete-template',
          params: {
            tid: params.id
          }
        }
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
        return {
          sync: true,
          action: 'commit-template-title',
          params: {
            id: params.id,
            title: params.title
          }
        };
      },
      cancelTemplateTitle: (params = {}) => {
        return {
          sync: false,
          action: 'cancel-template-title',
          params: {
            id: params.id
          }
        }
      },
      
      makeNewTemplateItem: (params = {}) => {
        return {
          sync: true,
          action: 'add-new-item-to-template',
          params: {
            tid: params.tid,
            iid: params.iid,
            title: params.title
          }
        }
        
      },
      editTemplateItemTitle: (params = {}) => {
        return {
          sync: false,
          action: 'edit-template-item-title',
          params: {
            tid: params.tid, 
            iid: params.iid
          }
        }
      },
      commitTemplateItemTitle: (params = {}) => {
        return {
          sync: true,
          action: 'commit-template-item-title',
          params: {
            tid: params.tid,
            iid: params.iid,
            title: params.title
          }
        }
      },
      cancelTemplateItemTitle: (params = {}) => {
        return {
          sync: false,
          action: 'cancel-template-item-title',
          params: {
            tid: params.tid,
            iid: params.iid
          }
        }
      },
      makeNewTemplateFromList: (params = {}) => {
        return {
          sync: false,
          action: 'make-new-template-from-list',
          params: {
            lid: params.lid,
            tid: params.tid
          }
        }
      },
      
      makeNewListFromTemplate: (params = {}) => {
        return {
          sync: true,
          action: 'make-new-list-from-template',
          params: {
            tid: params.tid,
            lid: params.lid
          }
        }
      },

      mixTemplateInList: (params = {}) => {
        return {
          sync: true,
          action: 'mix-template-in-list',
          params: {
            tid: params.tid,
            lid: params.lid,
            pre: params.idprefix
          }
        };
      },

      makeNewList: (params = {}) => {
        return {
          sync: true,
          action: 'make-new-list',
          params: {
            lid: params.lid
          }
        };
      },
      deleteList: (params = {}) => {
        return {
          sync: true,
          action: 'delete-list',
          params: {
            lid: params.lid
          }
        }
      },
      editListTitle: (params = {}) => {
        return {
          sync: false,
          action: 'edit-list-title',
          params: {
            lid: params.lid
          }
        };
      },
      commitListTitle: (params = {}) => {
        return {
          sync: true,
          action: 'commit-list-title',
          params: {
            lid: params.lid,
            title: params.title
          }
        };
      },
      cancelListTitle: (params = {}) => {
        return {
          sync: false,
          action: 'cancel-list-title',
          params: {
            lid: params.lid
          }
        };
      },
      selectList: (params = {}) => {
        return {
          sync: false,
          action: 'select-list',
          params: {
            lid: params.lid
          }
        };
      },
      
      makeNewListItem: (params = {}) => {
        return {
          sync: true,
          action: 'add-new-item-to-list',
          params: {
            lid: params.lid,
            iid: params.iid,
            title: params.title,
            editing: params.editing
          }
        };
      },
      editListItemTitle: (params = {}) => {
        return {
          sync: false,
          action: 'edit-list-item-title',
          params: {
            lid: params.lid,
            iid: params.iid
          }
        };
      },
      commitListItemTitle: (params = {}) => {
        return {
          sync: true,
          action: 'commit-list-item-title',
          params: {
            lid: params.lid,
            iid: params.iid,
            title: params.title
          }
        };
      },
      cancelListItemTitle: (params = {}) => {
        return {
          sync: false,
          action: 'cancel-list-item-title',
          params: {
            lid: params.lid,
            iid: params.iid
          }
        };
      },
      toggleListItemCompletion: (params = {}) => {
        return {
          sync: true,
          action: 'toggle-list-item-completion',
          params: {
            lid: params.lid,
            iid: params.iid
          }
        };
      }
    }
    
    state = JSON.parse(storage.getItem(LOCAL_STORAGE_KEY));
    if (state) {
      TEMPLATES = state.templates;
      LISTS = state.lists;
      CURRENTLISTID = state.currentListId;
      FOCUSSEDINPUTFIELDID = state.focussedInputFieldId;
      TOKEN = state.authToken;
      state.latestSeenUpdate = state.latestSeenUpdate || 0;
      state.status = state.status || 'logged-out';
    }
    
    const handleUpdate = (update) => {
      let cmd = update.upd;
      if (update.fromRemote) cmd = JSON.parse(update.upd);
      switch(cmd.action) {
      case 'make-new-template': 
        {
          if (TEMPLATES.find((t) => { return t.id == cmd.params.id; })) {
            console.log(`Template ${cmd.params.id}`)
          } else {
            let t = { 
              id: cmd.params.id, title: cmd.params.title, items: [] };
            TEMPLATES.push(t);
          }
        }
        return true;
      case 'delete-template':
        {
          state.templates = TEMPLATES = TEMPLATES.filter((t) => t.id !== cmd.params.tid);
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
          t.editing = false;
        }
        return true;
      case 'cancel-template-title':
        {
          let t = TEMPLATES.find((t) => { return t.id === cmd.params.id; } );
          t.editing = false;
        }
        return true;
      case 'add-new-item-to-template':
        {
          let t = TEMPLATES.find((t) => { return t.id === cmd.params.tid; } );
          let item = { 
            id: cmd.params.iid, //`ti_${Math.random().toString(36).substr(2)}`, 
            title: cmd.params.title, //'Neuer Eintrag', 
            editing: true 
          };
          t.items.push(item);
          state.focussedInputFieldId = FOCUSSEDINPUTFIELDID = `input-template-item-title-${t.id}-${item.id}`;
        }
        return true;
      case 'edit-template-item-title':
        {
          let t = TEMPLATES.find((t) => { return t.id === cmd.params.tid; } );
          let i = t.items.find((i) => { return i.id === cmd.params.iid; } );
          i.editing = true;
          state.focussedInputFieldId = FOCUSSEDINPUTFIELDID = `input-template-item-title-${t.id}-${i.id}`;
        }
        return true;
      case 'commit-template-item-title':
        {
          let t = TEMPLATES.find((t) => { return t.id === cmd.params.tid; } );
          let i = t.items.find((i) => { return i.id === cmd.params.iid; } );
          i.title = cmd.params.title;
          i.editing = false;
        }
        return true;
      case 'cancel-template-item-title':
        {
          let t = TEMPLATES.find((t) => { return t.id === cmd.params.tid; } );
          let i = t.items.find((i) => { return i.id === cmd.params.iid; } );
          i.editing = false;
        }
        return true;
      case 'make-new-template-from-list':
        {
          let l = LISTS.find((l) => { return l.id == cmd.params.lid;  });
          let t = {
            id: cmd.params.tid,
            title: l.title,
            items: l.items.map((i) => {
              let r = {};
              r.title = i.title;
              r.id = i.id.replace('li_', 'ti_');
              return r;
            })
          }
          TEMPLATES.push(t);
        }
        return true;
      case 'mix-template-in-list':
        {
          let l = LISTS.find((l) => { return l.id == cmd.params.lid; });
          let t = TEMPLATES.find((t) => { return t.id == cmd.params.tid; })
          let items = t.items.map((i) => {
            let r = {};
            r.title = i.title;
            id = i.id.replace('ti_', '');
            r.id = `li_${cmd.params.pre}_${id}`;
            return r;
          });
          l.items = l.items.concat(items);
        }
        return true;
      case 'make-new-list-from-template':
        {
          let t = TEMPLATES.find((t) => { return t.id === cmd.params.tid; } );
          let l = {
            id: cmd.params.lid,
            title: t.title,
            items: t.items.map((i) => { 
              let r = {...i};
              r.id = r.id.replace('ti_', 'li_');
              return r;
            })
          };
          LISTS.push(l);
          state.currentListId = CURRENTLISTID = l.id;
        }
        return true;
      case 'make-new-list':
        {
          let l = {
            id: cmd.params.lid,
            title: 'Neue Liste',
            items: [],
            editing: true
          };
          LISTS.push(l);
          state.currentListId = CURRENTLISTID = l.id;
        }
        return true;
      case 'delete-list':
        {
          let lid = cmd.params.lid;
          let idx = LISTS.findIndex((l) => l.id === lid);
          state.lists = LISTS = LISTS.filter((l) => l.id !== cmd.params.lid);

          if (lid === CURRENTLISTID) {
            idx = Math.max(0, idx-1);
            let l = LISTS[idx];
            let id = (l ? l.id : null);
            state.currentListId = CURRENTLISTID = id;
          }
        }
        return true;
      case 'edit-list-title':
        {
          let l = LISTS.find((l) => { return l.id === cmd.params.lid; })
          l.editing = true;
          state.focussedInputFieldId = FOCUSSEDINPUTFIELDID = l.id;
        }
        return true;
      case 'commit-list-title':
        {
          let l = LISTS.find((l) => { return l.id === cmd.params.lid; })
          l.title = cmd.params.title;
          l.editing = false;
        }
        return true;
      case 'cancel-list-title':
        {
          let l = LISTS.find((l) => { return l.id === cmd.params.lid; })
          l.editing = false;
        }
        return true;
      case 'select-list':
        {
          state.currentListId = CURRENTLISTID = cmd.params.lid;
        }
        return true;
      case 'add-new-item-to-list':
        {
          let l = LISTS.find((l) => { return l.id === cmd.params.lid });
          let i = {
            id: cmd.params.iid,
            title: cmd.params.title,
            editing: cmd.params.editing
          }
          l.items.push(i);
        }
        return true;
      case 'edit-list-item-title':
        {
          let l = LISTS.find((l) => { return l.id === cmd.params.lid });
          let i = l.items.find((i) => { return i.id === cmd.params.iid });
          i.editing = true;
          state.focussedInputFieldId = FOCUSSEDINPUTFIELDID = `input-item-title-${l.id}-${i.id}`;
        }
        return true;
      case 'commit-list-item-title':
        {
          let l = LISTS.find((l) => { return l.id === cmd.params.lid });
          let i = l.items.find((i) => { return i.id === cmd.params.iid });
          i.title = cmd.params.title;
          i.editing = false;
        }
        return true;
      case 'cancel-list-item-title':
        {
          let l = LISTS.find((l) => { return l.id === cmd.params.lid });
          let i = l.items.find((i) => { return i.id === cmd.params.iid });
          i.editing = false;
        }
        return true;
      case 'toggle-list-item-completion':
        {
          let l = LISTS.find((l) => { return l.id === cmd.params.lid });
          let i = l.items.find((i) => { return i.id === cmd.params.iid });
          i.done = !i.done;
        }
        return true;
      default:
        return false;
      }
    }
    
    let updates;
    const startUpdates = () => {
      //if (updates && updates.readyState === 1) { return; } FIXME!
      updates = new EventSource(`api/v1/updatestream?since=${state.latestSeenUpdate}&token=${TOKEN}`);
      updates.onmessage = (e) => {
        update = JSON.parse(e.data);
        update.fromRemote = true; // Tag update as remote
        if (update.id > state.latestSeenUpdate) { // FIXME!
          if (handleUpdate(update)) {
            state.latestSeenUpdate = update.id;
            save();
            render();
          }
        }
      };
      updates.onerror = (e) => {
        updates.close();
        setTimeout(startUpdates, 1000);
      }
      
      // updates.onClose() => set up with current latestSeenUpdate FIXME!
      
    }
    if (state.status === 'logged-in') {
      startUpdates();
    }
    
    
    let ELEMENT = document.getElementById('mehrmalist');
    const render = () => {
      ELEMENT.innerHTML = '';
      
      if (state.status === 'logged-out') {
        // Show only the login elements
        let html = `
          <div id="login-form-container">
          <h1 id="login-form-title">Mehrmalist</h1>
          <form id="login-form">
            <input type="text" id="login-user" value="" placeholder="Nutzer">
            <input type="password" id="login-pass" value="" placeholder="Passwort">
            <input type="submit" value="Anmelden">
          </form>
          </div>`;
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
                storage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
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
                          <a href='#' class="edit-template-title" data-templateid="${t.id}">✍︎</a>
                          <a href='#' class="delete-template" data-templateid="${t.id}">☒</a>`
                        }

                        <a href='#' class="make-new-list-from-this" data-templateid="${t.id}">❏</a>
                        <a href='#' class="mix-template-in-list" data-templateid="${t.id}">⇣</a>

                        ${t.expanded ? `<ul>
                          ${t.items.reduce((acc, item) => {return acc + 
                            formatItemForTemplate(item, t)}, '')}
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
                        <a href='#' class="edit-list-title" data-listid="${l.id}">✍︎</a>
                        <a href='#' class="delete-list" data-listid="${l.id}">☒</a>`
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
            id="${item.id}" data-itemid="${item.id}">
          ${item.editing ? 
            `<input type="text" value="${item.title}" class="input-item-title" id="input-item-title-${list.id}-${item.id}" data-listid="${list.id}" data-itemid="${item.id}" ${FOCUSSEDINPUTFIELDID === `input-item-title-${list.id}-${item.id}` ? 'autofocus' : ''}  onclick="event.stopPropagation();">
              <a href='#' class="commit-item-title" data-listid="${list.id}" data-itemid="${item.id}">✓</a>
              <a href='#' class="cancel-item-title" data-listid="${list.id}" data-itemid="${item.id}">𐄂</a>` 
            :
            `<span class="listitem-title" id="listitem-title-${item.id}" data-itemid="${item.id}">${item.title}
             ${item.done ? '' : `<a href='#' class="edit-item-title" data-itemid=${item.id} data-listid="${list.id}">✍︎</a>`}</span>`
          }
          
        </li>`;
      };
      
      /* Show current list */
      let CurrentList = '';
      if (CURRENTLISTID) {
        let l = LISTS.find((l) => { return l.id === CURRENTLISTID; });
        CurrentList += `
          <h1 id="list-header">Liste: ${l.title}
            <a href='#' class="make-new-template-from-list" title="Template aus dieser Liste erstellen" data-listid="${l.id}">⇧</a>
          </h1>
        `;
        
        let todoListItems = l.items.filter(item => !item.done);
        let completedListItems = l.items.filter(item => item.done);
        
        html = '';
        html = todoListItems.reduce((acc, item) => { return acc + formatItemForList(item, l); }, html);
        html = html + `<li class="quickentry"><input type="text" class="quickentry-add-item-to-list" data-listid="${l.id}" placeholder="+ Eintrag" value="""></li>`;
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
          storage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
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
          storage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
          render();
        });
      });  
      
      /* Add a new template to templates */
      let makeNewTemplate = document.getElementById('make-new-template');
      if (makeNewTemplate) {
        makeNewTemplate.addEventListener('click', (event) => {
          event.preventDefault(); event.stopPropagation();
          emit(UPDATES.makeNewTemplate({
            id: `t_${Math.random().toString(36).substr(2)}`,
            title: 'Neue Vorlage'
          }));
        });
      }
      
      /* Delete a template */
      Array.from(document.getElementsByClassName('delete-template')).map((el) => {
        el.addEventListener('click', (event) => {
          event.preventDefault(); event.stopPropagation();
          emit(UPDATES.deleteTemplate({id: event.target.dataset.templateid}));
        });
      });

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
          let id = event.target.dataset.templateid;
          emit(
            UPDATES.commitTemplateTitle({
              id: id,
              title: document.getElementById(`input-template-title-${id}`).value
            }));
        });
      });
      
      /* Commit/cancel template title with enter/escape */
      Array.from(document.getElementsByClassName('input-template-title')).map((el) => {
        el.addEventListener('keyup', (event) => {
          let id = event.target.dataset.templateid;
          
          switch (event.keyCode) {
            case 13 /* Enter */: 
              event.preventDefault(); event.stopPropagation();
              emit(
                UPDATES.commitTemplateTitle({
                  id: id,
                  title: document.getElementById(`input-template-title-${id}`).value
                }));
              break;
            case 27 /* Escape */: 
              event.preventDefault(); event.stopPropagation();
              emit(
                UPDATES.cancelTemplateTitle({
                  id: id,
                  title: document.getElementById(`input-template-title-${id}`).value
                }));
              break;
            default: break;
          }
        });
      });

      /* Cancel editing template title*/
      Array.from(document.getElementsByClassName('cancel-template-title')).map((el) => {
        el.addEventListener('click', (event) => {
          event.preventDefault(); event.stopPropagation();
          emit(
            UPDATES.cancelTemplateTitle({id: event.target.dataset.templateid })
          );
        });
      });
      
      /* Add an item to a template */
      Array.from(document.getElementsByClassName('add-item-to-template')).map((el) => {
        el.addEventListener('click', (event) => {
          event.preventDefault(); event.stopPropagation();
          emit(
            UPDATES.makeNewTemplateItem({
              tid: event.target.dataset.templateid,
              iid: `ti_${Math.random().toString(36).substr(2)}`,
              title: 'Neuer Eintrag'
            })
          );
        });
      });
      
      /* Edit item title */
      Array.from(document.getElementsByClassName('edit-template-item-title')).map((el) => {
        el.addEventListener('click', (event) => {
          event.preventDefault(); event.stopPropagation();
          emit(
            UPDATES.editTemplateItemTitle({
              tid: event.target.dataset.templateid,
              iid: event.target.dataset.itemid
            })
          );
        });
      });

      /* Commit item title*/
      Array.from(document.getElementsByClassName('commit-template-item-title')).map((el) => {
        el.addEventListener('click', (event) => {
          event.preventDefault(); event.stopPropagation();
          let tid = event.target.dataset.templateid;
          let iid = event.target.dataset.itemid;
          emit(
            UPDATES.commitTemplateItemTitle({
              tid: tid,
              iid: iid,
              title: document.getElementById(`input-template-item-title-${tid}-${iid}`).value
            })
          );
        });
      });

      /* Cancel editing item title*/
      Array.from(document.getElementsByClassName('cancel-template-item-title')).map((el) => {
        el.addEventListener('click', (event) => {
          event.preventDefault(); event.stopPropagation();
          emit(
            UPDATES.cancelTemplateItemTitle({
              tid: event.target.dataset.templateid,
              iid: event.target.dataset.itemid
            })
          );
        });
      });
      
      /* Commit/cancel template item title with enter/escape */
      Array.from(document.getElementsByClassName('input-template-item-title')).map((el) => {
        el.addEventListener('keyup', (event) => {
          switch (event.keyCode) {
            case 13 /* Enter */: 
              event.preventDefault(); event.stopPropagation();
              { 
                let tid = event.target.dataset.templateid;
                let iid = event.target.dataset.itemid;
                emit(
                  UPDATES.commitTemplateItemTitle({
                    tid: tid,
                    iid: iid,
                    title: document.getElementById(`input-template-item-title-${tid}-${iid}`).value
                  })
                );
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
                emit(
                  UPDATES.cancelTemplateItemTitle({
                    tid: event.target.dataset.templateid,
                    iid: event.target.dataset.itemid
                  })
                );
              }
              render();
              break;
            default: break;
          }
        });
      });
      
      Array.from(document.getElementsByClassName('make-new-template-from-list')).map((el) => {
        el.addEventListener('click', (event) => {
          event.preventDefault(); event.stopPropagation();
          emit(
            UPDATES.makeNewTemplateFromList({
              tid: `t_${Math.random().toString(36).substr(2)}`,
              lid: event.target.dataset.listid
            })
          );
        })
      });
            
      /* Make list from template by clicking on it */
      Array.from(document.getElementsByClassName('make-new-list-from-this')).map((el) => {
        el.addEventListener('click', (event) => {
          event.preventDefault(); event.stopPropagation();
          emit(
            UPDATES.makeNewListFromTemplate({
              tid: event.target.dataset.templateid,
              lid: `l_${Math.random().toString(36).substr(2)}`
            })
          );
        });
      });
      
      /* Mix-in the template with the currently active list */
      Array.from(document.getElementsByClassName('mix-template-in-list')).map((el) => {
        el.addEventListener('click', (event) => {
          event.preventDefault(); event.stopPropagation();
          emit(
            UPDATES.mixTemplateInList({
              tid: event.target.dataset.templateid,
              lid: CURRENTLISTID,
              idprefix: `${Math.random().toString(36).substr(2,4)}`,
            })
          );
        });
      });
      /* Make a new list without a template */
      let makeNewList = document.getElementById('make-new-list');
      if (makeNewList) {
        makeNewList.addEventListener('click', (event) => {
          event.preventDefault(); event.stopPropagation();
          emit(
            UPDATES.makeNewList({lid: `l_${Math.random().toString(36).substr(2)}`})
          );
        });
      }
      
      /* Delete a list */
      Array.from(document.getElementsByClassName('delete-list')).map((el) => {
        el.addEventListener('click', (event) => {
          event.preventDefault(); event.stopPropagation();
          emit(
            UPDATES.deleteList({lid: event.target.dataset.listid})
          );
        });
      });

      /* Enable item title editing */
      Array.from(document.getElementsByClassName('edit-list-title')).map((el) => {
        el.addEventListener('click', (event) => {
          event.preventDefault(); event.stopPropagation();
          emit(
            UPDATES.editListTitle({lid: event.target.dataset.listid})
          );
        });
      });
      
      /* Commit list title*/
      Array.from(document.getElementsByClassName('commit-list-title')).map((el) => {
        el.addEventListener('click', (event) => {
          event.preventDefault(); event.stopPropagation();
          let id = event.target.dataset.listid;
          emit(
            UPDATES.commitListTitle({
              lid: id,
              title: document.getElementById(`input-list-title-${id}`).value
            })
          );
        });
      });
      
      /* Commit/cancel template title with enter/escape */
      Array.from(document.getElementsByClassName('input-list-title')).map((el) => {
        el.addEventListener('keyup', (event) => {
          switch (event.keyCode) {
            case 13 /* Enter */: 
              event.preventDefault(); event.stopPropagation();
              { 
                let id = event.target.dataset.listid;
                emit(
                  UPDATES.commitListTitle({
                    lid: id,
                    title: document.getElementById(`input-list-title-${id}`).value
                  })
                );
              }
              break;
            case 27 /* Escape */: 
              event.preventDefault(); event.stopPropagation();
              {
                emit(
                  UPDATES.cancelListTitle({lid: event.target.dataset.listid})
                );
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
          emit(
            UPDATES.cancelListTitle({lid: event.target.dataset.listid})
          );
        });
      });
            
      /* Make list current list by clicking on it */
      Array.from(document.getElementsByClassName('list')).map((el) => {
        el.addEventListener('click', (event) => {
          emit(
            UPDATES.selectList({lid: event.target.id})
          );
        });
      });
      
      /* Add an item to a list */
      Array.from(document.getElementsByClassName('add-item-to-list')).map((el) => {
        el.addEventListener('click', (event) => {
          event.preventDefault(); event.stopPropagation();
          emit(
            UPDATES.makeNewListItem({
              lid: event.target.dataset.listid,
              iid: `li_${Math.random().toString(36).substr(2)}`,
              title: 'Neuer Eintrag',
              editing: true
            })
          );
        });
      });
      
      /* Add an item to a list directly via textbox */
      Array.from(document.getElementsByClassName('quickentry-add-item-to-list')).map((el) => {
        el.addEventListener('keyup', (event) => {
          switch (event.keyCode) {
            case 13 /* Enter */: 
              event.preventDefault(); event.stopPropagation();
              { 
                emit(
                  UPDATES.makeNewListItem({
                    lid: event.target.dataset.listid,
                    iid: `li_${Math.random().toString(36).substr(2)}`,
                    title: event.target.value,
                    editing: false
                  })
                );
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
          emit(
            UPDATES.toggleListItemCompletion({
              lid: CURRENTLISTID,
              iid: event.target.dataset.itemid
            })
          );
        })
      });
      
      /* Edit item title */
      Array.from(document.getElementsByClassName('edit-item-title')).map((el) => {
        el.addEventListener('click', (event) => {
          event.preventDefault(); event.stopPropagation();
          emit(
            UPDATES.editListItemTitle({
              lid: event.target.dataset.listid,
              iid: event.target.dataset.itemid
            })
          );
        });
      });

      /* Commit item title*/
      Array.from(document.getElementsByClassName('commit-item-title')).map((el) => {
        el.addEventListener('click', (event) => {
          event.preventDefault(); event.stopPropagation();
          let lid = event.target.dataset.listid;
          let iid = event.target.dataset.itemid
          emit(
            UPDATES.commitListItemTitle({
              lid: lid,
              iid: iid,
              title: document.getElementById(`input-item-title-${lid}-${iid}`).value
            })
          );
        });
      });

      /* Cancel editing item title*/
      Array.from(document.getElementsByClassName('cancel-item-title')).map((el) => {
        el.addEventListener('click', (event) => {
          event.preventDefault(); event.stopPropagation();
          emit(
            UPDATES.cancelListItemTitle({
              lid: event.target.dataset.listid,
              iid: event.target.dataset.itemid
            })
          );
        });
      });
      
      
    };
    
    render();
    
  };
  
  init();
});
