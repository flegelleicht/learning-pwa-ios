window.addEventListener('load', () => {
  const init = () => {
    let storage = window.localStorage;
    let lists;
    let currentListId;
    
    /* Load / setup storage */
    if (!storage.getItem('lists')) {
      storage.setItem('lists', JSON.stringify([]));
    } 
    lists = JSON.parse(storage.getItem('lists'));
    if (storage.getItem('currentListId')) {
      currentListId = storage.getItem('currentListId');
    }
        
    const render = () => {
      /* Show Templates */
      let templateContent = TEMPLATES.reduce((acc, t) => { 
        let html = `<li class="template" id="${t.id}">
                        ${t.title} 

                        <a href='#' class="new-list-from-this" data-templateid="${t.id}">❏</a>

                        ${t.expanded ? `<ul>${t.items.reduce((acc, item) => {return acc + `<li>${item.title}</li>`}, '')}</ul>` : ''} 
                    </li>`;
                    return acc + html; 
      }, "");
      document.getElementById('template-list').innerHTML = templateContent;
    
      /* Show Lists */
      let listContent = lists.reduce((acc, l) => { return acc + `<li class="list" id="${l.id}">${l.title}</li>`}, "");
      document.getElementById('list-list').innerHTML = listContent;
    
      /* Show current list */
      if (currentListId) {
        let l = lists.find((l) => { return l.id === currentListId; });
        let currentListHeader = `${l.title}`;
        document.getElementById('list-header').innerHTML = currentListHeader;
        let currentListItems = l.items.reduce((acc, item) => { return acc + `<li class="listitem ${item.done ? 'done' : ''}" id="${item.id}">${item.title}</li>`; }, "");
        document.getElementById('list-items').innerHTML = currentListItems;
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
          render();
        });
      });  
      
      /* Make list from template by clicking on it */
      Array.from(document.getElementsByClassName('new-list-from-this')).map((el) => {
        el.addEventListener('click', (event) => {
          event.preventDefault(); event.stopPropagation();
          let template = TEMPLATES.find((t) => { return t.id === event.target.dataset.templateid; } );
          let newList = {};
          newList.id = `l_${lists.length + 1}`;
          newList.title = template.title;
          newList.items = [...template.items];
          
          lists.push(newList);
          currentListId = newList.id;
          storage.setItem('lists', JSON.stringify(lists));
          storage.setItem('currentListId', currentListId);
          render();
        });
      });
      
      /* Make list current list by clicking on it */
      Array.from(document.getElementsByClassName('list')).map((el) => {
        el.addEventListener('click', (event) => {
          let list = lists.find((l) => { return l.id === event.target.id });
          currentListId = list.id;
          storage.setItem('currentListId', currentListId);
          render();
        });
      });
      
      /* Mark item as done by clicking on it */
      Array.from(document.getElementsByClassName('listitem')).map((el) => {
        el.addEventListener('click', (event) => {
          let list = lists.find((l) => { return l.id === currentListId });
          let item = list.items.find((item) => { return item.id === event.target.id });
          item.done = true;
          
          storage.setItem('lists', JSON.stringify(lists));
          render();          
        })
      });
    };
    
    render();
  };
  
  init();
});
