window.addEventListener('load', () => {
  const init = () => {
    let storage = window.localStorage;
    let TEMPLATES;
    let LISTS;
    let CURRENTLISTID;
    let FOCUSSEDINPUTFIELDID;

    let TOKEN = AUTH_TOKEN;
    let UPDATEOPTIONS = {method: 'POST', headers: {'Authorization': `Bearer ${TOKEN}`}};
    
    /* Load / setup storage */
    if (!storage.getItem('state')) {
      storage.setItem('state', JSON.stringify({
        templates: [...DEFAULT_TEMPLATES],
        lists: [],
        currentListId: null,
        focussedInputFieldId: null,
        latestSeenUpdate: 0
      }));
    }    
    
    state = JSON.parse(storage.getItem('state'));
    if (state) {
      TEMPLATES = state.templates;
      LISTS = state.lists;
      CURRENTLISTID = state.currentListId;
      FOCUSSEDINPUTFIELDID = state.focussedInputFieldId;
      state.latestSeenUpdate = state.latestSeenUpdate || 0;
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
              id: cmd.params.id, title: cmd.params.title };
            TEMPLATES.push(t);
            storage.setItem('state', JSON.stringify(state));
          }
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
    
    const backgroundUpdate = () => {
      fetch(`/api/v1/updates?since=${state.latestSeenUpdate}`,
       {method: 'GET', headers: {'Authorization': `Bearer ${TOKEN}`}})
      .then(response => {
        if(response.ok) {
          response.json().then(updates => {
            updates.forEach(update => {
              if (handleUpdate(update)) {
                state.latestSeenUpdate = update.id;
                storage.setItem('state', JSON.stringify(state));
              }
            });
            if (updates.length > 0) render();
          });
        }
      })
      .catch(e => console.error(e));
      setTimeout(backgroundUpdate, 5000);
    }
    backgroundUpdate();
        
    const render = () => {
      /* Show templates header */
      const templateHeaderContent = `
      <h1>Vorlagen 
        <a href="#" id="make-new-template">⊕</a>
      </h1>`;
      document.getElementById('template-header').innerHTML = templateHeaderContent;
      
      
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
                          ${t.items.reduce((acc, item) => {return acc + formatItemForTemplate(item, t); }, '')}
                          <li><a href='#' class="add-item-to-template" data-templateid="${t.id}">⊕</a></li>
                          </ul>` : ''} 
                    </li>`;
                    return acc + html; 
      }, "");
      document.getElementById('template-list').innerHTML = templateContent;
    
      const listHeaderContent = `
        <h1>Listen
          <a href="#" id="make-new-list">⊕</a>
        </h1>
      `;
      document.getElementById('lists-header').innerHTML = listHeaderContent;
      
      
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
      document.getElementById('list-list').innerHTML = listContent;
    
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
      if (CURRENTLISTID) {
        let l = LISTS.find((l) => { return l.id === CURRENTLISTID; });
        let currentListHeader = `Liste: ${l.title}`;
        document.getElementById('list-header').innerHTML = currentListHeader;
        
        let todoListItems = l.items.filter(item => !item.done);
        let completedListItems = l.items.filter(item => item.done);
        
        html = '';
        html = todoListItems.reduce((acc, item) => { return acc + formatItemForList(item, l); }, html);
        html = html + `<li class="quickentry"><input type="text" class="quickentry-add-item-to-list" data-listid="${l.id}" placeholder="+ Eintrag" value=""></li>`;
        html = completedListItems.reduce((acc, item) => { return acc + formatItemForList(item, l); }, html);
        
        document.getElementById('list-items').innerHTML = html;
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
          let t = { id: `t_${Math.random().toString(36).substr(2)}`, title: "Neue Vorlage", items: [], expanded: false };
          TEMPLATES.push(t);
          
          fetch('/api/v1/update', Object.assign({body: JSON.stringify({action: 'make-new-template', params: {id: t.id, title: t.title}})}, UPDATEOPTIONS)).then(r => console.log(r)).catch(e => console.error(e));
          
          render();
        });
      }
      
      /* Enable template title editing */
      Array.from(document.getElementsByClassName('edit-template-title')).map((el) => {
        el.addEventListener('click', (event) => {
          event.preventDefault(); event.stopPropagation();
          let template = TEMPLATES.find((t) => { return t.id === event.target.dataset.templateid; } );
          template.editing = true;
          FOCUSSEDINPUTFIELDID = `input-template-title-${template.id}`;
          render();
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
          
          fetch('/api/v1/update', Object.assign({body: JSON.stringify({action: 'commit-template-title', params: {id: template.id, title: template.title}})}, UPDATEOPTIONS)).then(r => console.log(r)).catch(e => console.error(e));
          
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

                fetch('/api/v1/update', Object.assign({body: JSON.stringify({action: 'commit-template-title', params: {id: template.id, title: template.title}})}, UPDATEOPTIONS)).then(r => console.log(r)).catch(e => console.error(e));
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
          let list = LISTS.find((l) => { return l.id === CURRENTLISTID });
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
      
      /* Commit/cancel item title with enter/escape */
      Array.from(document.getElementsByClassName('input-item-title')).map((el) => {
        el.addEventListener('keyup', (event) => {
          switch (event.keyCode) {
            case 13 /* Enter */: 
              event.preventDefault(); event.stopPropagation();
              { 
                let list = LISTS.find((l) => { return l.id === event.target.dataset.listid });
                let item = list.items.find((i) => { return i.id === event.target.dataset.itemid });
                item.title = document.getElementById(`input-item-title-${list.id}-${item.id}`).value;
                item.editing = false;
                storage.setItem('state', JSON.stringify(state));
              }
              render();
              break;
            case 27 /* Escape */: 
              event.preventDefault(); event.stopPropagation();
              {
                let list = LISTS.find((l) => { return l.id === event.target.dataset.listid });
                let item = list.items.find((i) => { return i.id === event.target.dataset.itemid });
                item.editing = false;
              }
              render();
              break;
            default: break;
          }
        });
      });
      
    };
    
    render();
    
  };
  
  init();
});
