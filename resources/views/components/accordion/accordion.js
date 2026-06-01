const accordionItems = document.querySelectorAll(".accordion__item");

if (accordionItems.length) {
    accordionItems.forEach((item) => {
        const accordionHeader = item.querySelector(".accordion__header");

        accordionHeader.addEventListener("click", () => {
            const openItem = document.querySelector(".accordion-open");

            toggleItem(item);

            // comment to disable one item open at a time
            if (openItem && openItem !== item) {
                toggleItem(openItem);
            }
        });
    });

    const toggleItem = (item) => {
        const accordionContent = item.querySelector(".accordion__content");

        if (item.classList.contains("accordion-open")) {
            accordionContent.removeAttribute("style");
            item.classList.remove("accordion-open");
        } else {
            accordionContent.style.height =
                accordionContent.scrollHeight + "px";
            item.classList.add("accordion-open");
        }
    };
}
