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
      let templateContent = TEMPLATES.reduce((acc, t) => { return acc + `<li class="template" id="${t.id}">${t.title}</li>`; }, "");
      document.getElementById('template-list').innerHTML = templateContent;
    
      /* Show Lists */
      let listContent = lists.reduce((acc, l) => { return acc + `<li class="list" id="${l.id}">${l.title}</li>`}, "");
      document.getElementById('list-list').innerHTML = listContent;
    
      /* Show current list */
      if (currentListId) {
        let l = lists.find((l) => { return l.id === currentListId; });
        let currentListHeader = `${l.title}`;
        document.getElementById('list-header').innerHTML = currentListHeader;
        let currentListItems = l.items.reduce((acc, item) => { return acc + `<li class="listitem" id="${item.id}">${item.title}</li>`; }, "");
        document.getElementById('list-items').innerHTML = currentListItems;
      }
      
      /* Make list from template by clicking on it */
      Array.from(document.getElementsByClassName('template')).map((el) => {
        el.addEventListener('click', (event) => {
          let template = TEMPLATES.find((t) => { return t.id === event.target.id; } );
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
      
    };
    
    render();
  };
  
  init();
});
