// Once all is loaded clear nav bar "active" and populate mobile-nav "GoTo", if apropiate
const navbar_links = document.querySelectorAll('.topnav > a');
for (link of navbar_links) {
  link.setAttribute('class', null);
}
const current_template = document.querySelector('.template').getAttribute('name');
if (current_template == 'home' || current_template == 'monsters-list') {
  document.getElementById(current_template).setAttribute('class','active-nav');
  document.getElementById('GoTo').style.display = 'inline-block';
  if (current_template == 'home') {
   document.querySelectorAll('#side-index > a').forEach( (ref) => {
    let a = document.createElement("a");
    a.href = "#";
    a.className = "index";
    a.setAttribute("name",ref.getAttribute('name'));
    a.innerHTML = ref.innerHTML;
    document.getElementById("mobile-index").appendChild(a);
   }) 
  }
  else if (current_template == 'monsters-list') {
    let input = document.createElement("input");
    input.type = "text";
    input.className = "filter";
    input.id = "mobile-filter";
    input.setAttribute("onkeyup","filter('mobile-filter')");
    input.placeholder = "Search by name.."
    document.getElementById("mobile-index").appendChild(input);
  }
}
else {
  document.getElementById('GoTo').style.display = 'none';
  document.getElementById(current_template).setAttribute('class','active-nav');
}

// Mobile Nav bar Menu
function mobileMenu(id) {
  let submenus = document.querySelectorAll('.submenu');
   for (submenu of submenus) {
     if (submenu.id == id) {
       if (submenu.style.display === "block") {
         submenu.style.display = "none";
       } else {
         submenu.style.display = "block";
       }
     }
     else {
       submenu.style.display = "none";
     }
   }
 }
