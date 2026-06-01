/* product left start */
const showcaseCards = document.querySelectorAll(".showcase-card");

if (showcaseCards.length) {
    showcaseCards.forEach((showcaseCard) => {
        const galleryNodes = showcaseCard.querySelectorAll(
            `.js-grid-gallery__content`
        );
        console.log(galleryNodes)
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

        const anchor = document.querySelector(
            `.js-showcase-card__expand[data-id="${showcaseCard.dataset.id}"]`
        );
        const descriptions = document.querySelector(
            `.js-showcase-card__description[data-id="${showcaseCard.dataset.id}"]`
        );

        anchor.addEventListener("click", () => {
            const expanded = descriptions[i].classList.contains(
                "showcase-card__description"
            );
            if (expanded) {
                descriptions.classList.remove("showcase-card__description");
                descriptions.classList.add(
                    "showcase-card__description--expand"
                );
                el.innerHTML = "Read less";
            } else {
                descriptions.classList.add("showcase-card__description");
                descriptions.classList.remove(
                    "showcase-card__description--expand"
                );
                el.innerHTML = "Read more";
            }
        });
    });
}
