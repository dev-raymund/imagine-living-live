const swiper = new Swiper(".swiper", {
    slidesPerView: 1,
    loop: true,
    autoplay: {
        delay: 2500,
        disableOnInteraction: false,
    },
    breakpoints: {
        // when window width is <= 540px
        540: {
            slidesPerView: 2,
        },
        // when window width is <= 1024px
        1024: {
            slidesPerView: 3,
        },
    },
});
