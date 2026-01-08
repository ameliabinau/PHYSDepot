//Replaces the navbar placeholder with the actual navbar
fetch("/navbar.html")
    .then(response => response.text())
    .then(html => {
        document.getElementById('navbar-placeholder').innerHTML = html;
    });

//Handles the opening of the menu when the hamburger button is pressed
function toggleMenu() {
    const nav = document.getElementById("navLinks");
    nav.classList.toggle("show");
}

//Opens dropdowns in menu for narrow screens
function toggleDropdown(event) {
    const parent = event.currentTarget.parentElement;
    const dropdowns = document.querySelectorAll(".navbar-dropdown");

    // Close others
    dropdowns.forEach(d => {
        if (d !== parent) d.classList.remove("open");
    });

    // Toggle current
    parent.classList.toggle("open");

    // Prevent default hover behavior on mobile
    event.stopPropagation();
}

//Close dropdowns when clicking outside
document.addEventListener("click", () => {
    document.querySelectorAll(".navbar-dropdown").forEach(d => d.classList.remove("open"));
});