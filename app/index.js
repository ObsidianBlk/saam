

const sass = require('sass');

console.log("Hello there")
sass.render({file: 'view/sass/main.scss'}, (err, res) => {
  if (err){
    console.log(err);
    return;
  }
  console.log(res.css.toString());
  let style = document.createElement('style');
  style.innerHTML = res.css.toString();

  let head = document.getElementsByTagName('head');
  if (head.length > 0)
    head = head[0]; // There should really only be one head... we're not a hydra!!!
  head.appendChild(style);
});


