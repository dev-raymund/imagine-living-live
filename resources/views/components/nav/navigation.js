const mobileNav = document.querySelector(".js-mobile-nav");
const hamburgerMenu = document.querySelectorAll(".js-hamburger-menu");
// const navbarLinks = document.querySelectorAll(".js-anchor");

let mobileMenuOpen = false;

hamburgerMenu.forEach((menu) => {
    menu.addEventListener("click", () => {
        mobileMenuOpen = !mobileMenuOpen;
        if (mobileMenuOpen) {
            mobileNav.classList.remove("mobile-nav-closed");
            mobileNav.classList.add("mobile-nav-open");
        } else {
            mobileNav.classList.add("mobile-nav-closed");
            mobileNav.classList.remove("mobile-nav-open");
        }
    });
});

// navbarLinks.forEach((elem) => elem.addEventListener("click", navbarLinkClick));

// function navbarLinkClick(event) {
//     if (window.location.pathname === "/") {
//         smoothScroll(event);
//     } else document.location.href = "/";
// }

// function smoothScroll(event) {
//     event.preventDefault();
//     const targetId = event.currentTarget.getAttribute("href");
//     const targetPosition = document.querySelector(targetId).offsetTop;
//     const startPosition = window.pageYOffset;
//     const distance = targetPosition - startPosition;
//     const duration = 1000;
//     let start = null;

//     window.requestAnimationFrame(step);

//     function step(timestamp) {
//         if (!start) start = timestamp;
//         const progress = timestamp - start;
//         window.scrollTo(
//             0,
//             easeInOutCubic(progress, startPosition, distance, duration)
//         );
//         if (progress < duration) window.requestAnimationFrame(step);
//     }
// }

// // Easing Functions
// function easeInOutCubic(t, b, c, d) {
//     t /= d / 2;
//     if (t < 1) return (c / 2) * t * t * t + b;
//     t -= 2;
//     return (c / 2) * (t * t * t + 2) + b;
// }
