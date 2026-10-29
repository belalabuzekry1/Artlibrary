
/* =========================================================
   ARTLIBRARY — INTERACTIONS
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* MOBILE MENU */
    const menuButton = document.querySelector(".menu-button");
    const nav = document.querySelector(".desktop-nav");

    if (menuButton && nav) {
        menuButton.addEventListener("click", () => {
            nav.classList.toggle("mobile-open");
            const isOpen = nav.classList.contains("mobile-open");

            menuButton.setAttribute("aria-expanded", isOpen);
            menuButton.setAttribute(
                "aria-label",
                isOpen ? "Close menu" : "Open menu"
            );
        });
    }

    /* SEARCH */
    const searchInput = document.querySelector(".search-box input");
    const headerSearchButton = document.querySelector(
        ".header-actions .icon-button"
    );

    if (headerSearchButton && searchInput) {
        headerSearchButton.addEventListener("click", () => {
            searchInput.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            setTimeout(() => searchInput.focus(), 400);
        });
    }

    if (searchInput) {
        searchInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                document.querySelector("#explore")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    }

    /* ADVANCED FILTERS TOGGLE */
    const filterButton = document.querySelector(".filter-button");

    if (filterButton) {
        filterButton.setAttribute("aria-label", "Toggle advanced filters");
        filterButton.setAttribute("aria-expanded", "false");
        filterButton.addEventListener("click", () => {
            const panel = document.querySelector(".advanced-filter-panel");
            if (!panel) return;
            const isOpening = panel.hidden;
            panel.hidden = !isOpening;
            filterButton.setAttribute("aria-expanded", String(isOpening));
        });
    }

    /* NEWSLETTER */
    const newsletterForm = document.querySelector(".newsletter-form");

    if (newsletterForm) {
        newsletterForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const emailInput = newsletterForm.querySelector("input");
            if (!emailInput) return;

            const email = emailInput.value.trim();

            if (!email) {
                alert("Please enter your email address.");
                return;
            }

            if (!email.includes("@")) {
                alert("Please enter a valid email address.");
                return;
            }

            alert("Thanks! You're on the ArtLibrary list.");
            emailInput.value = "";
        });
    }

    /* SMOOTH SCROLL */
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (event) => {
            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") return;

            const target = document.querySelector(targetId);
            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

            if (nav && nav.classList.contains("mobile-open")) {
                nav.classList.remove("mobile-open");
            }
        });
    });

    /* SCROLL REVEAL */
    const revealElements = document.querySelectorAll(
        ".category-card, .art-card, .latest-image, .model-pill"
    );

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
            (entries, observerInstance) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    entry.target.classList.add("reveal-visible");
                    observerInstance.unobserve(entry.target);
                });
            },
            { threshold: 0.08 }
        );

        revealElements.forEach((element) => {
            element.classList.add("reveal-element");
            observer.observe(element);
        });
    }

    /* CURRENT YEAR */
    const yearElements = document.querySelectorAll("[data-current-year]");

    yearElements.forEach((element) => {
        element.textContent = new Date().getFullYear();
    });

    /* ESCAPE KEY */
    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;

        if (nav && nav.classList.contains("mobile-open")) {
            nav.classList.remove("mobile-open");
        }
    });

    /* ARTWORK DATA */
    const artworks = {
        "neon-city": {
            title: "Neon City Night",
            image: "images/trending/Neon Cyberpunk City.jfif",
            alt: "Neon City Night",
            category: "Sci-Fi",
            model: "✦ Gemini",
            likes: "♡ 2.4K",
            prompt: "A futuristic cyberpunk city at night after heavy rain, a lone person standing beside a sleek futuristic sports car on a wet reflective street, enormous skyscrapers covered with glowing neon signs, holographic advertisements, flying vehicles in the distance, cinematic blue and magenta lighting, atmospheric fog, dramatic perspective, volumetric light rays, ultra-detailed environment, realistic reflections, cinematic photography, deep depth of field, premium sci-fi concept art, highly detailed, 8k",
            tags: ["Cyberpunk", "City", "Neon", "Sci-Fi", "Cinematic"]
        },

        "cozy-cat": {
            title: "Cozy Cat at Home",
            image: "images/trending/Cozy Cat at Home.png",
            alt: "Cozy Cat at Home",
            category: "Animals",
            model: "✦ ChatGPT",
            likes: "♡ 856",
            prompt: "A beautiful orange tabby cat peacefully sleeping on a soft knitted blanket beside a large sunlit window, warm morning sunlight entering a cozy modern living room, indoor plants, wooden furniture, a small coffee table with a ceramic cup and a few books, soft natural shadows, warm neutral colors, peaceful atmosphere, realistic fur detail, shallow depth of field, professional lifestyle photography, cozy and inviting composition, photorealistic",
            tags: ["Cat", "Animals", "Cozy", "Home", "Photorealistic"]
        },

        "elven-warrior": {
            title: "Elven Warrior",
            image: "images/trending/Elven Warrior.jfif",
            alt: "Elven Warrior",
            category: "Fantasy",
            model: "✦ Gemini",
            likes: "♡ 642",
            prompt: "A powerful female elven warrior standing on a mountain overlooking an ancient fantasy kingdom, long silver hair moving gently in the wind, intricate silver and dark blue armor decorated with elegant elven patterns, subtle magical blue light surrounding her, enormous mountains and a medieval fantasy castle in the distance, cinematic sunrise, dramatic clouds, highly detailed face, realistic skin texture, epic composition, cinematic lighting, fantasy concept art, ultra detailed, masterpiece",
            tags: ["Fantasy", "Elf", "Warrior", "Magic", "Concept Art"]
        },

        "luxury-watch": {
            title: "Luxury Watch",
            image: "images/trending/Luxury Watch.png",
            alt: "Luxury Watch",
            category: "Product",
            model: "✦ ChatGPT",
            likes: "♡ 521",
            prompt: "A premium luxury mechanical wristwatch with a black dial and polished gold details, placed on a dark black marble surface with subtle water droplets, dramatic studio lighting from the side, warm golden highlights reflecting across the metal, extremely detailed watch mechanism and dial, elegant luxury advertising aesthetic, shallow depth of field, realistic reflections, sophisticated dark background, professional commercial product photography, photorealistic, ultra sharp, premium high-end campaign",
            tags: ["Watch", "Luxury", "Product", "Advertising", "Photography"]
        },

        "sunset-memories": {
            title: "Sunset Memories",
            image: "images/trending/Anime Sunset Portrait.jfif",
            alt: "Sunset Memories",
            category: "Anime",
            model: "✦ Gemini",
            likes: "♡ 927",
            prompt: "A beautiful young anime woman with short dark brown hair standing on a rooftop overlooking a modern city at sunset, warm orange and pink sky, soft wind moving her hair, gentle emotional expression, detailed expressive eyes, casual modern clothing, glowing city lights beginning to appear in the background, cinematic composition, beautiful rim lighting, atmospheric depth, highly detailed anime illustration, polished digital art, vibrant but elegant colors, professional anime key visual",
            tags: ["Anime", "Portrait", "Sunset", "City", "Illustration"]
        },

        "modern-dream-house": {
            title: "Modern Dream House",
            image: "images/trending/Modern Dream House.png",
            alt: "Modern Dream House",
            category: "Architecture",
            model: "✦ ChatGPT",
            likes: "♡ 459",
            prompt: "A stunning modern luxury villa with floor-to-ceiling glass walls, clean minimalist architecture, surrounded by tropical palm trees and lush landscaping, large infinity pool reflecting the house and evening sky, warm interior lights glowing through the glass, elegant outdoor lounge area, dramatic sunset clouds, cinematic architectural photography, realistic materials and reflections, sophisticated composition, ultra realistic, high-end architectural visualization, detailed lighting, premium real estate photography",
            tags: ["Architecture", "Villa", "Modern", "Luxury", "Real Estate"]
        }
    };

    /* ARTWORK DETAILS PAGE */
    const artworkImage = document.querySelector(".artwork-main-image img");
    const artworkTitle = document.querySelector(".artwork-heading h1");
    const artworkCategory = document.querySelector(".artwork-category");
    const artworkMeta = document.querySelectorAll(".artwork-meta span");
    const artworkPrompt = document.querySelector(".artwork-prompt");
    const copyPromptButton = document.querySelector(".copy-prompt");
    const artworkTags = document.querySelector(".artwork-tags");

    const params = new URLSearchParams(window.location.search);
    const artworkId = params.get("art");

    if (
        artworkId &&
        artworks[artworkId] &&
        artworkImage &&
        artworkTitle
    ) {
        const artwork = artworks[artworkId];

        artworkImage.src = artwork.image;
        artworkImage.alt = artwork.alt;
        artworkTitle.textContent = artwork.title;

        if (artworkCategory) {
            artworkCategory.textContent = artwork.category;
        }

        if (artworkMeta[0]) artworkMeta[0].textContent = artwork.model;
        if (artworkMeta[1]) artworkMeta[1].textContent = artwork.likes;

        if (artworkPrompt) artworkPrompt.textContent = artwork.prompt;

        if (copyPromptButton) {
            copyPromptButton.setAttribute("data-prompt", artwork.prompt);
        }

        if (artworkTags) {
            artworkTags.innerHTML = artwork.tags
                .map((tag) => `<span>${tag}</span>`)
                .join("");
        }

        document.title = `${artwork.title} | ArtLibrary`;
    }

    /* TRENDING ARTWORK LINKS */
    const trendingCards = document.querySelectorAll(".art-card");

    const trendingArtworkIds = [
        "neon-city",
        "cozy-cat",
        "elven-warrior",
        "luxury-watch",
        "sunset-memories",
        "modern-dream-house"
    ];

    trendingCards.forEach((card, index) => {
        const artworkId = trendingArtworkIds[index];
        if (!artworkId) return;

        card.setAttribute("role", "link");
        card.setAttribute("tabindex", "0");

        card.addEventListener("click", (event) => {
            if (event.target.closest(".copy-prompt")) return;
            if (event.target.closest("a, button")) return;

            window.location.href = `artwork.html?art=${artworkId}`;
        });

        card.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") return;

            event.preventDefault();
            window.location.href = `artwork.html?art=${artworkId}`;
        });
    });

    /* LATEST ADDITIONS */
    const latestGrid = document.querySelector(".latest-grid");

    const latestArtworkIds = [
        "neon-city",
        "cozy-cat",
        "elven-warrior",
        "luxury-watch",
        "sunset-memories",
        "modern-dream-house"
    ];

    if (latestGrid) {
        latestGrid.innerHTML = "";

        latestArtworkIds.forEach((artworkId) => {
            const artwork = artworks[artworkId];
            if (!artwork) return;

            const card = document.createElement("a");
            card.className = "latest-image";
            card.href = `artwork.html?art=${artworkId}`;
            card.setAttribute("aria-label", `View ${artwork.title}`);

            const image = document.createElement("img");
            image.src = artwork.image;
            image.alt = artwork.alt;
            image.loading = "lazy";

            card.appendChild(image);
            latestGrid.appendChild(card);
        });
    }

    /* COPY PROMPT */
    const copyPromptButtons = document.querySelectorAll(".copy-prompt");

    copyPromptButtons.forEach((button) => {
        button.addEventListener("click", async () => {
            const prompt = button.getAttribute("data-prompt");
            if (!prompt) return;

            try {
                await navigator.clipboard.writeText(prompt);

                const originalText = button.innerHTML;
                button.innerHTML = "✓ Prompt Copied!";
                button.classList.add("copied");

                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.classList.remove("copied");
                }, 1800);
            } catch (error) {
                console.error("Could not copy prompt:", error);
            }
        });
    });

    /* CONSOLE MESSAGE */
    console.log("%cArtLibrary", "font-size:24px;font-weight:bold;");
    console.log("AI Images • Prompts • Community");

});

/* ArtLibrary search + category filtering */
document.addEventListener("DOMContentLoaded", function () {
    const categoryCards = Array.from(
        document.querySelectorAll("#categories .category-card")
    );
    const searchInput = document.querySelector(".search-box input");
    const trendingSection = document.querySelector("#explore");
    const trendingGrid = document.querySelector("#explore .art-grid");
    const trendingHeading = document.querySelector("#explore .section-heading");
    const headingTitle = document.querySelector("#explore .section-heading h2");

    if (!trendingGrid || !trendingHeading || !headingTitle) return;

    const artworks = Array.from(trendingGrid.querySelectorAll(".art-card"));
    if (!artworks.length) return;

    const categoryTerms = {
        "cinematic": ["sci-fi", "cinematic", "cyberpunk", "movie"],
        "anime": ["anime"],
        "realistic": ["realistic", "photorealistic", "photoreal", "realism"],
        "3d & render": ["3d", "render", "cgi", "three-dimensional"],
        "product": ["product", "commercial", "watch", "advertising"],
        "architecture": ["architecture", "architectural", "villa", "building"],
        "fantasy": ["fantasy", "elf", "elven", "magic", "warrior"],
        "logo & design": ["logo", "design", "branding", "graphic"],
        "illustration": ["illustration", "illustrated", "digital art", "concept art"],
        "nature": ["nature", "landscape", "forest", "mountain", "plant", "flower"]
    };

    let activeCategory = "all";
    let activeCard = null;
    let activeModel = "all";

    /* ADVANCED FILTER PANEL */
    const searchBox = document.querySelector(".search-box");
    let filterPanel = document.querySelector(".advanced-filter-panel");

    if (searchBox && !filterPanel) {
        filterPanel = document.createElement("div");
        filterPanel.className = "advanced-filter-panel";
        filterPanel.hidden = true;
        filterPanel.innerHTML = `
            <div class="advanced-filter-field">
                <label for="artlibrary-filter-category">Category</label>
                <select id="artlibrary-filter-category">
                    <option value="all">All categories</option>
                    ${Object.keys(categoryTerms).map(category =>
                        `<option value="${category}">${category.replace(/&/g, "&amp;").replace(/\b\w/g, char => char.toUpperCase())}</option>`
                    ).join("")}
                </select>
            </div>
            <div class="advanced-filter-field">
                <label for="artlibrary-filter-model">AI Model</label>
                <select id="artlibrary-filter-model">
                    <option value="all">All models</option>
                    <option value="gemini">Gemini</option>
                    <option value="chatgpt">ChatGPT</option>
                </select>
            </div>
            <button type="button" class="advanced-filter-reset">Reset filters</button>
        `;
        searchBox.insertAdjacentElement("afterend", filterPanel);

        const style = document.createElement("style");
        style.textContent = `
            .advanced-filter-panel {
                display: flex; flex-wrap: wrap; align-items: end; gap: 12px;
                margin-top: 12px; padding: 16px; border-radius: 14px;
                border: 1px solid rgba(145,155,220,.22);
                background: linear-gradient(145deg, rgba(24,31,58,.98), rgba(15,21,41,.99));
                box-shadow: 0 12px 32px rgba(0,0,0,.16);
            }
            .advanced-filter-panel[hidden] { display: none !important; }
            .advanced-filter-field { display: flex; flex: 1 1 180px; flex-direction: column; gap: 7px; }
            .advanced-filter-field label { color: #cdd3f4; font-size: 12px; font-weight: 600; }
            .advanced-filter-field select {
                width: 100%; min-height: 42px; padding: 9px 12px; border-radius: 9px;
                color: #edf0ff; background: #171f3d; border: 1px solid rgba(145,155,220,.28);
                font: inherit;
            }
            .advanced-filter-reset {
                min-height: 42px; padding: 9px 14px; border-radius: 9px; cursor: pointer;
                color: #edf0ff; background: rgba(112,94,255,.16);
                border: 1px solid rgba(145,125,255,.4); font: inherit;
            }
            .advanced-filter-reset:hover { background: rgba(112,94,255,.27); }
            @media(max-width:560px) { .advanced-filter-panel { padding: 12px; gap: 10px; } }
        `;
        document.head.appendChild(style);
    }

    const filterCategorySelect = document.querySelector("#artlibrary-filter-category");
    const filterModelSelect = document.querySelector("#artlibrary-filter-model");
    const resetFiltersButton = document.querySelector(".advanced-filter-reset");

    const allButton = document.createElement("button");
    allButton.type = "button";
    allButton.textContent = "All";
    allButton.className = "category-filter-all";
    allButton.setAttribute("aria-pressed", "true");
    trendingHeading.appendChild(allButton);

    const emptyMessage = document.createElement("p");
    emptyMessage.className = "category-empty-message";
    emptyMessage.textContent =
        "No matching artworks found. Try another search or category.";
    emptyMessage.hidden = true;
    trendingGrid.insertAdjacentElement("afterend", emptyMessage);

    function normalize(value) {
        return (value || "").toLowerCase().replace(/\s+/g, " ").trim();
    }

    function artworkText(card) {
        return normalize([
            card.querySelector("h3")?.textContent,
            card.querySelector(".category")?.textContent,
            card.querySelector(".model")?.textContent,
            card.querySelector(".prompt-text")?.textContent,
            card.querySelector(".copy-prompt")?.getAttribute("data-prompt")
        ].filter(Boolean).join(" "));
    }

    function matchesCategory(card, category) {
        if (category === "all") return true;

        const terms = categoryTerms[category] || [category];
        const label = normalize(card.querySelector(".category")?.textContent);
        const content = artworkText(card);

        return terms.some(
            term => label.includes(term) || content.includes(term)
        );
    }

    function renderResults(shouldScroll = false) {
        const query = normalize(searchInput?.value);
        const words = query.split(" ").filter(Boolean);
        let visibleCount = 0;

        artworks.forEach(card => {
            const text = artworkText(card);
            const matchesSearch = words.every(word => text.includes(word));
            const matchesCurrentCategory = matchesCategory(card, activeCategory);
            const modelText = normalize(card.querySelector(".model")?.textContent);
            const matchesModel = activeModel === "all" || modelText.includes(activeModel);
            const visible = matchesSearch && matchesCurrentCategory && matchesModel;

            card.hidden = !visible;
            if (visible) visibleCount++;
        });

        emptyMessage.hidden = visibleCount > 0;

        allButton.setAttribute(
            "aria-pressed",
            activeCategory === "all" ? "true" : "false"
        );

        categoryCards.forEach(card => {
            card.classList.toggle("is-active", card === activeCard);
        });

        if (query) {
            headingTitle.textContent =
                `Search results: ${searchInput.value.trim()}`;
        } else if (activeCategory !== "all") {
            const label =
                activeCard?.querySelector("strong")?.textContent ||
                activeCategory;

            headingTitle.textContent = `Explore: ${label}`;
        } else {
            headingTitle.textContent = "🔥 Trending This Week";
        }

        if (shouldScroll && trendingSection) {
            trendingSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    }

    categoryCards.forEach(card => {
        card.addEventListener("click", event => {
            event.preventDefault();

            activeCard = card;
            activeCategory = normalize(
                card.querySelector("strong")?.textContent
            );

            if (searchInput) searchInput.value = "";

            renderResults(true);
        });
    });

    allButton.addEventListener("click", () => {
        activeCategory = "all";
        activeCard = null;
        if (filterCategorySelect) filterCategorySelect.value = "all";

        if (searchInput) searchInput.value = "";

        renderResults(true);
    });

    if (filterCategorySelect) {
        filterCategorySelect.addEventListener("change", () => {
            activeCategory = normalize(filterCategorySelect.value);
            activeCard = categoryCards.find(card =>
                normalize(card.querySelector("strong")?.textContent) === activeCategory
            ) || null;
            renderResults(true);
        });
    }

    if (filterModelSelect) {
        filterModelSelect.addEventListener("change", () => {
            activeModel = normalize(filterModelSelect.value);
            renderResults(true);
        });
    }

    if (resetFiltersButton) {
        resetFiltersButton.addEventListener("click", () => {
            activeCategory = "all";
            activeCard = null;
            activeModel = "all";
            if (searchInput) searchInput.value = "";
            if (filterCategorySelect) filterCategorySelect.value = "all";
            if (filterModelSelect) filterModelSelect.value = "all";
            renderResults(true);
        });
    }

   if (searchInput) {
    searchInput.addEventListener("input", () => {
        activeCategory = "all";
        activeCard = null;
        if (filterCategorySelect) filterCategorySelect.value = "all";
        renderResults(false);
    });
}

/* POPULAR SEARCHES */
document.querySelectorAll(".popular-searches a").forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();

        if (!searchInput) return;

        searchInput.value = link.textContent.trim();
        activeCategory = "all";
        activeCard = null;

        renderResults(true);
    });
});

renderResults(false);
});

/* ArtLibrary — Permanent Popular Searches Fix */
document.querySelectorAll(".popular-searches a").forEach(function (link) {
    link.addEventListener("click", function (event) {
        event.preventDefault();

        const searchInput = document.querySelector(".search-box input");
        if (!searchInput) return;

        searchInput.value = this.textContent.trim();

        searchInput.dispatchEvent(
            new Event("input", { bubbles: true })
        );

        document.querySelector("#explore")?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
});

/* Permanent Popular Searches Fix */
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".popular-searches a").forEach(function (link) {
        link.addEventListener("click", function (event) {
            event.preventDefault();

            const input = document.querySelector(".search-box input");
            if (!input) return;

            input.value = this.textContent.trim();
            input.dispatchEvent(new Event("input", { bubbles: true }));

            document.querySelector("#explore")?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    });
});
// ArtLibrary deployment refresh


/* ArtLibrary — Light/Dark Theme Toggle */

document.addEventListener("DOMContentLoaded", function () {
    const themeButton = document.querySelector(".theme-button");

    if (!themeButton) return;

    const logos = document.querySelectorAll(".site-logo");

    function applyTheme(theme) {
        if (theme === "light") {
            document.body.setAttribute("data-theme", "light");

            themeButton.textContent = "☾";
            themeButton.setAttribute("aria-label", "Switch to dark theme");
            themeButton.setAttribute("title", "Switch to dark theme");

           logos.forEach(function (logo) {
    if (logo.dataset.lightLogo) {
        logo.src = logo.dataset.lightLogo;
    }
});
        } else {
            document.body.removeAttribute("data-theme");

            themeButton.textContent = "☼";
            themeButton.setAttribute("aria-label", "Switch to light theme");
            themeButton.setAttribute("title", "Switch to light theme");

            logos.forEach(function (logo) {
    if (logo.dataset.darkLogo) {
        logo.src = logo.dataset.darkLogo;
    }
});
        }
    }

    let savedTheme = "dark";

    try {
        savedTheme = localStorage.getItem("artlibrary-theme") || "dark";
    } catch (error) {}

    applyTheme(savedTheme);

    themeButton.addEventListener("click", function () {
        const nextTheme =
            document.body.getAttribute("data-theme") === "light"
                ? "dark"
                : "light";

        applyTheme(nextTheme);

        try {
            localStorage.setItem("artlibrary-theme", nextTheme);
        } catch (error) {}
    });
});
