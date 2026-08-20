/* product left start */
const showcaseCards = document.querySelectorAll(".showcase-card");

// Each card needs two Swipers and a Luminous gallery. Building them all up front
// meant a listing page of eight cards constructed sixteen Swipers in one go, and
// every constructor reads offsetWidth straight after writing styles - sixteen
// forced reflows in a single task. They are built on demand instead, just before
// the card scrolls into view, so a page load only pays for what is on screen.
const initCardMedia = (showcaseCard) => {
    if (showcaseCard.dataset.mediaReady === "true") {
        return;
    }
    showcaseCard.dataset.mediaReady = "true";

    const galleryNodes = showcaseCard.querySelectorAll(
        `.js-grid-gallery__content`
    );

    const galleryOpts = {
        arrowNavigation: true,
    };

    const options = {
        arrowNavigation: true,
        onOpen: function () {
            document.body.style.overflow = "hidden";
        },
        onClose: function () {
            document.body.style.overflow = "visible";
        },
    };

    if (galleryNodes.length) {
        new LuminousGallery(galleryNodes, galleryOpts, options);
    }

    const cardSlider = new Swiper(
        `.showcase-card-slider[data-id="${showcaseCard.dataset.id}"]`,
        {
            spaceBetween: 0,
            centeredSlides: false,
            loop: true,
            direction: "horizontal",
            loopedSlides: 3,
            resizeObserver: true,
        }
    );
    const cardThumbs = new Swiper(
        `.showcase-card-thumbs[data-id="${showcaseCard.dataset.id}"]`,
        {
            spaceBetween: 0,
            centeredSlides: true,
            loop: true,
            slideToClickedSlide: true,
            direction: "horizontal",
            slidesPerView: 3,
        }
    );

    cardSlider.controller.control = cardThumbs;
    cardThumbs.controller.control = cardSlider;
};

// Read more/less only attaches a listener, so it costs nothing to wire up front
// and stays responsive even if the media has not been built yet.
const initCardText = (showcaseCard) => {
    const anchor = showcaseCard.querySelector(
        `.js-showcase-card__expand[data-id="${showcaseCard.dataset.id}"]`
    );
    const descriptions = showcaseCard.querySelector(
        `.js-showcase-card__description[data-id="${showcaseCard.dataset.id}"]`
    );

    if (!anchor || !descriptions) {
        return;
    }

    anchor.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        const expanded = descriptions.classList.contains(
            "showcase-card__description"
        );
        if (expanded) {
            descriptions.classList.remove("showcase-card__description");
            descriptions.classList.add("showcase-card__description--expand");
            anchor.textContent = "Read less";
        } else {
            descriptions.classList.add("showcase-card__description");
            descriptions.classList.remove("showcase-card__description--expand");
            anchor.textContent = "Read more";
        }
    });
};

if (showcaseCards.length) {
    showcaseCards.forEach(initCardText);

    if ("IntersectionObserver" in window) {
        const cardObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    observer.unobserve(entry.target);
                    initCardMedia(entry.target);
                });
            },
            // Start a little before the card is visible so the slider is ready
            // by the time it is actually scrolled to.
            { rootMargin: "300px 0px" }
        );

        showcaseCards.forEach((showcaseCard) =>
            cardObserver.observe(showcaseCard)
        );
    } else {
        showcaseCards.forEach(initCardMedia);
    }
}
