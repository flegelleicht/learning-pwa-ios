# Mehrmalist

> “Everything worth doing is worth doing again”. 

And that’s especially true for anything that requires a to-do list 😄


## Usage

1. See available list templates **Templates**
	* Use ❏ next to a template to make a new list from that template
	* Use ⊕ at the top to create a new template 
2. Select a list from the lists under **Lists** to see its items
3. Click on an item from the list to mark it as _done_. It will disappear from the list.

Uses `localStorage` to save your lists and items.

## Plan

### Appearance

- [x] Basic styling
- [x] All on one page
- [x] Add CSS styles
- [ ] Subsections

### Functionality

- [x] Display available templates
- [x] Show template details
- [x] Add a new template
- [x] Change a template
- [x] Add an item to a template
- [x] Change an item in a template
- [x] Save templates to `localStorage`
- [x] Create a list from a template
- [x] Add a list without template
- [x] Change a list
- [ ] Create a template from a list
- [x] Select a list
- [x] Add an item to a list
- [x] Change an item in a list
- [x] Mark an item as done
- [ ] Commit editing on enter (⏎)
- [ ] Cancel editing on esc (⎋)
- [ ] Continue entering items on shift+enter (⇧+⏎)
- [ ] Add result to an item after completing (ah, and don't hide what you have done)
- [ ] Sync state with a backend

### Implementation

- [ ] Collect all update actions in a single place
- [ ] Replace dumb “render everything” method with React or Vue
