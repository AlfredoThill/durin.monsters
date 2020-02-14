// Adjust flexbox "list" for last entries wierd sizes
adjust(); // Initial fix
window.addEventListener('resize', adjust) //Listening for further changes

// Filter & Order
function filter(filter_id) {
  let input, value, criteria, items, i, txtValue;
  input = document.getElementById(filter_id);
  value = input.value;
  document.querySelectorAll('.filter').forEach( (filter) => {
    filter.value = value; 
  })
  criteria = value.toUpperCase();
  items = document.querySelectorAll('.flex-list > .item');
  for (i = 0; i < items.length; i++) {
      txtValue = items[i].getAttribute('name');
      if (txtValue.toUpperCase().indexOf(criteria) > -1) {
        items[i].style.display = "";
      } else {
        items[i].style.display = "none";
      }
  }
}
// Adjust Function
function adjust() {
  let flexlist = document.querySelector('.flex-list');
  if (flexlist == null) { return }
  let cols = flexlist.offsetWidth / 210; // flex-basis plus margins
  let iterator = document.querySelectorAll('.flex-list > .item');
  for (item of iterator) { item.style.maxWidth = null }
  let items = iterator.length;
  let rows = (items/Math.floor(cols));
  let ratio = rows % 1;
  if (ratio < 0.8 && ratio > 0) {
    const placed = Math.floor(cols)*Math.floor(rows);
    for (let i = items - 1; i >= placed; i--) {
      iterator[i].style.maxWidth = iterator[0].offsetWidth + "px";
    }
  }
}

