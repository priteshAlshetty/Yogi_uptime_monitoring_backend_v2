


// Select the 'Logout' list item
const logoutItem = document.getElementById('logout');
var confirmLogOut = document.getElementsByClassName('confirmLogOut');

// Add event listener for the 'click' event
logoutItem.addEventListener('click', function () {
    // Redirect to 'index.html'
    window.location.href = '/pages/login';
    confirmLogOut.style.display = "none";

});


// Select the 'Uptime/Downtime' list item
const uptimeDowntimeItem = document.getElementById('uptime-downtime');

// Add event listener for the 'click' event
uptimeDowntimeItem.addEventListener('click', function () {
    // Redirect to 'report.html' when clicked
    window.location.href = '/pages/report';
});


// Select the 'Summary' list item
const summaryItem = document.getElementById('summary');
summaryItem.addEventListener('click', function () {
    window.location.href = '/pages/home';
});


// Select the 'Uptime/Downtime' list item
const uptimeDowntimeItem2 = document.querySelector('li.active'); // Since the 'active' class is already applied

// Add event listener for the 'click' event on Uptime/Downtime
uptimeDowntimeItem2.addEventListener('click', function () {
    // Redirect to 'report.html' when clicked
    window.location.href = '/pages/report';
});

// -----------preloader--------------

var loader = document.getElementById("preloader");
window.addEventListener("load", function () {
    loader.style.display = "none"
})



// -------------------confirm logout------------------

let LogOutBtnCancel = document.querySelector('.LogOutBtn-Cancel');


LogOutBtnCancel.addEventListener('click', function () {
    var confirmLogOut = document.querySelector('.confirmLogOut');
    confirmLogOut.style.display = "none";
})

// ------------primary-logout-click--------
const primaryLogout = document.getElementById("primaryLogout");
primaryLogout.addEventListener("click", () => {
    var confirmLogOut = document.querySelector('.confirmLogOut');
    confirmLogOut.style.display = "flex";
})




