const developmentGallery = document.querySelector(".development-detail__gallery");

if (developmentGallery && window.Swiper) {
    const galleryId = developmentGallery.dataset.id;
    const galleryNodes = developmentGallery.querySelectorAll(".js-development-gallery__content");

    if (galleryNodes.length && window.LuminousGallery) {
        new LuminousGallery(galleryNodes, { arrowNavigation: true }, {
            arrowNavigation: true,
            onOpen() {
                document.body.style.overflow = "hidden";
            },
            onClose() {
                document.body.style.overflow = "visible";
            },
        });
    }

    const gallerySlider = new Swiper(
        `.development-detail__gallery-slider[data-id="${galleryId}"]`,
        {
            spaceBetween: 0,
            centeredSlides: false,
            loop: galleryNodes.length > 1,
            direction: "horizontal",
            loopedSlides: 3,
            resizeObserver: true,
        }
    );

    const galleryThumbsEl = developmentGallery.querySelector(
        `.development-detail__gallery-thumbs[data-id="${galleryId}"]`
    );

    if (galleryThumbsEl) {
        const galleryThumbs = new Swiper(galleryThumbsEl, {
            spaceBetween: 0,
            centeredSlides: true,
            loop: galleryNodes.length > 1,
            slideToClickedSlide: true,
            direction: "horizontal",
            slidesPerView: 3,
        });

        gallerySlider.controller.control = galleryThumbs;
        galleryThumbs.controller.control = gallerySlider;
    }
}

const panelTitles = {
    description: "Description",
    "key-features": "Key features",
    "material-information": "Material information",
    phone: "Call us",
};

const panel = document.getElementById("development-panel");
const panelBackdrop = document.getElementById("development-panel-backdrop");
const panelBody = document.getElementById("development-panel-body");
const panelTitle = document.getElementById("development-panel-title");
const panelClose = document.querySelector(".development-detail__panel-close");

const openDevelopmentPanel = (panelId) => {
    const template = document.getElementById(`development-panel-${panelId}`);
    if (!panel || !template || !panelBody || !panelTitle) {
        return;
    }

    panelTitle.textContent = panelTitles[panelId] || "";
    panelBody.innerHTML = template.innerHTML;
    panel.classList.add("development-detail__panel--open");
    panel.setAttribute("aria-hidden", "false");

    if (panelBackdrop) {
        panelBackdrop.hidden = false;
    }

    document.body.style.overflow = "hidden";
};

const closeDevelopmentPanel = () => {
    if (!panel) {
        return;
    }

    panel.classList.remove("development-detail__panel--open");
    panel.setAttribute("aria-hidden", "true");

    if (panelBackdrop) {
        panelBackdrop.hidden = true;
    }

    if (panelBody) {
        panelBody.innerHTML = "";
    }

    document.body.style.overflow = "";
};

document.querySelectorAll("[data-development-panel]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
        openDevelopmentPanel(trigger.dataset.developmentPanel);
    });
});

panelClose?.addEventListener("click", closeDevelopmentPanel);
panelBackdrop?.addEventListener("click", closeDevelopmentPanel);

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && panel?.classList.contains("development-detail__panel--open")) {
        closeDevelopmentPanel();
    }
});

const initDevelopmentMap = () => {
    const mapElement = document.getElementById("development-map");
    const L = window.L;

    if (!mapElement || !L) {
        return;
    }

    const latitude = parseFloat(mapElement.dataset.lat);
    const longitude = parseFloat(mapElement.dataset.lng);
    const title = mapElement.dataset.title || "Development";

    const markerNodes = mapElement.querySelectorAll("[data-marker-type]");
    const markers = Array.from(markerNodes).map((node) => ({
        type: node.dataset.markerType,
        name: node.dataset.name,
        distance: node.dataset.distance,
        lat: parseFloat(node.dataset.lat),
        lng: parseFloat(node.dataset.lng),
    }));

    const pinIcons = {
        development: L.divIcon({
            className: "development-detail__pin development-detail__pin--development",
            html: '<span aria-hidden="true"></span>',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -30],
        }),
        station: L.divIcon({
            className: "development-detail__pin development-detail__pin--station",
            html: '<span aria-hidden="true"></span>',
            iconSize: [28, 28],
            iconAnchor: [14, 28],
            popupAnchor: [0, -26],
        }),
        school: L.divIcon({
            className: "development-detail__pin development-detail__pin--school",
            html: '<span aria-hidden="true"></span>',
            iconSize: [28, 28],
            iconAnchor: [14, 28],
            popupAnchor: [0, -26],
        }),
    };

    const map = L.map(mapElement, {
        scrollWheelZoom: false,
        zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
    }).addTo(map);

    const markerRegistry = [];

    const addMarker = (point, type) => {
        if (Number.isNaN(point.lat) || Number.isNaN(point.lng)) {
            return;
        }

        const marker = L.marker([point.lat, point.lng], {
            icon: pinIcons[type],
            title: point.name,
        });

        const distanceLine = point.distance ? `<br><span>${point.distance}</span>` : "";
        marker.bindPopup(`<strong>${point.name}</strong>${distanceLine}`);
        markerRegistry.push({ marker, type });
    };

    if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) {
        addMarker({ lat: latitude, lng: longitude, name: title, distance: "" }, "development");
    }

    markers.forEach((point) => {
        if (point.type === "station" || point.type === "school") {
            addMarker(point, point.type);
        }
    });

    const views = {
        stations: ["development", "station"],
        schools: ["development", "school"],
    };

    let activeView = "stations";

    const fitActiveView = () => {
        const visibleMarkers = markerRegistry
            .filter(({ type }) => views[activeView].includes(type))
            .map(({ marker }) => marker);

        if (visibleMarkers.length === 0) {
            if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) {
                map.setView([latitude, longitude], 15);
            }
            return;
        }

        const bounds = L.featureGroup(visibleMarkers).getBounds().pad(0.2);
        map.fitBounds(bounds, { maxZoom: 15 });
    };

    const setView = (view) => {
        activeView = view;

        markerRegistry.forEach(({ marker, type }) => {
            if (views[view].includes(type)) {
                marker.addTo(map);
            } else {
                map.removeLayer(marker);
            }
        });

        fitActiveView();
    };

    setView("stations");

    const tabs = document.querySelectorAll(".development-detail__map-tab");
    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const view = tab.dataset.mapView;
            if (!view || view === activeView) {
                return;
            }

            tabs.forEach((button) => {
                const isActive = button === tab;
                button.classList.toggle("development-detail__map-tab--active", isActive);
                button.setAttribute("aria-selected", isActive ? "true" : "false");
            });

            setView(view);
        });
    });

    window.addEventListener("resize", () => {
        map.invalidateSize();
        fitActiveView();
    });
};

window.initDevelopmentMap = initDevelopmentMap;

if (window.L) {
    initDevelopmentMap();
}

// Properties in this development: the filter dropdowns are populated from the
// cards on the page rather than hardcoded, so they only ever offer values that
// actually match something. Filtering is client-side - a development has a
// handful of units and they are all in the DOM already.
const propertyList = document.querySelector("[data-property-list]");

if (propertyList) {
    const cards = Array.from(
        propertyList.querySelectorAll(".development-property-card")
    );
    const selects = Array.from(document.querySelectorAll("[data-property-filter]"));
    const countEl = document.querySelector("[data-property-count]");
    const emptyEl = document.querySelector("[data-property-empty]");

    const statusLabels = {
        "for-sale": "For sale",
        sold: "Sold",
        "to-rent": "To rent",
    };

    selects.forEach((select) => {
        const key = select.dataset.propertyFilter;

        const values = Array.from(
            new Set(cards.map((card) => (card.dataset[key] || "").trim()))
        )
            .filter(Boolean)
            .sort((a, b) =>
                key === "bedrooms" ? Number(a) - Number(b) : a.localeCompare(b)
            );

        values.forEach((value) => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent =
                key === "status"
                    ? statusLabels[value] || value
                    : key === "bedrooms"
                    ? `${value} bedroom${Number(value) === 1 ? "" : "s"}`
                    : value;
            select.appendChild(option);
        });
    });

    const applyPropertyFilters = () => {
        let visible = 0;

        cards.forEach((card) => {
            const matches = selects.every((select) => {
                if (!select.value) {
                    return true;
                }

                return (card.dataset[select.dataset.propertyFilter] || "") === select.value;
            });

            card.hidden = !matches;

            if (matches) {
                visible++;
            }
        });

        if (countEl) {
            countEl.textContent = visible;
        }

        if (emptyEl) {
            emptyEl.hidden = visible !== 0;
        }
    };

    selects.forEach((select) =>
        select.addEventListener("change", applyPropertyFilters)
    );

    document
        .querySelector("[data-property-search]")
        ?.addEventListener("click", applyPropertyFilters);
}
