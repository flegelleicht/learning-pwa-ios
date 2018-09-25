const greet = (name) => {
  let d = document.createElement('div');
  d.innerText = `Woohoo, ${name}!`;
  document.body.appendChild(d);
}
