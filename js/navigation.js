 
/* Toggle mobile menu */
function toggleMenu() {
    let toggle = document.querySelector(".toggle");
    let menu = document.querySelector(".menu");
    if (menu.classList.contains("navicon")) {
        menu.classList.remove("navicon");
         
        // adds the menu (hamburger) icon
        toggle.querySelector("a").innerHTML = "Open Menu";
    } else {
        menu.classList.add("navicon");
         
        // adds the close (x) icon
        toggle.querySelector("a").innerHTML = "Close Menu";
    }
}

function MainNavOnLoad() {
    let toggle = document.querySelector(".toggle");
	/* Event Listener */
	toggle.addEventListener("click", toggleMenu, false);
}