// Side Menu listeners for index
const indexes = document.querySelectorAll('a.index');
indexes.forEach( (index) => {
 index.addEventListener('click', (event) => { 
  event.preventDefault();
  document.getElementById('mobile-index').style.display = "none"; // fix me!
  let option = document.getElementById(index.name);
  option.scrollIntoView(true);
  window.scrollBy(0, -60); 
 })
}
)