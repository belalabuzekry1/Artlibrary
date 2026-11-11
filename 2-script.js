
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
        "anime-neon-samurai": {
            title: "Neon Samurai",
            image: "images/trending/1-artlib-01-anime-neon-samurai.jpg",
            alt: "Neon Samurai",
            category: "Anime",
            model: "✦ instinct",
            likes: "♡ 0",
            prompt: "Detailed anime key visual of a lone samurai girl holding a katana, standing in a neon-lit Tokyo alley at night, light rain with reflective puddles, dramatic pink and cyan neon glow, cel-shaded with rich cinematic color grading, sharp line art, highly detailed background, studio-quality anime film still, 4:3 composition",
            tags: ["Anime", "Samurai", "Neon", "Katana", "Key Visual"]
        },

        "anime-cozy-cafe": {
            title: "Cozy Cat Cafe",
            image: "images/trending/2-artlib-02-anime-cozy-cafe.jpg",
            alt: "Cozy Cat Cafe",
            category: "Anime",
            model: "✦ instinct",
            likes: "♡ 0",
            prompt: "A heartwarming slice-of-life anime scene of an orange tabby cat sleeping curled up on a cushion in a cozy wooden cafe corner full of plants, soft golden afternoon light through the window, warm pastel palette, gentle film grain, Ghibli-inspired hand-painted background, 4:3 composition",
            tags: ["Anime", "Cat", "Cafe", "Cozy", "Ghibli"]
        },

        "architecture-modern-villa": {
            title: "Modern Villa",
            image: "images/trending/3-artlib-03-architecture-modern-villa.jpg",
            alt: "Modern Villa",
            category: "Architecture",
            model: "✦ instinct",
            likes: "♡ 0",
            prompt: "Photorealistic architectural visualization of a minimalist modern two-story villa with concrete and warm wood facade, surrounded by a landscaped desert garden with palm trees, golden hour light, ultra-detailed, professional architecture photography, wide-angle lens, 4:3 composition",
            tags: ["Architecture", "Villa", "Modern", "Minimalist", "Golden Hour"]
        },

        "architecture-egypt-temple": {
            title: "Futuristic Egyptian Temple",
            image: "images/trending/4-artlib-04-architecture-egypt-temple.jpg",
            alt: "Futuristic Egyptian Temple",
            category: "Architecture",
            model: "✦ instinct",
            likes: "♡ 0",
            prompt: "Epic architectural concept art of a futuristic Egyptian temple complex, massive sandstone pylons with glowing blue energy lines, dramatic sunset sky, a reflective Nile-like canal in front, warm rim light with volumetric rays, cinematic scale, intricate hieroglyphic patterns blended with sleek sci-fi elements, ultra-detailed digital matte painting, 4:3 composition",
            tags: ["Architecture", "Egyptian", "Temple", "Sci-Fi", "Concept Art"]
        },

        "cinematic-desert-wanderer": {
            title: "Desert Wanderer",
            image: "images/trending/5-artlib-05-cinematic-desert-wanderer.jpg",
            alt: "Desert Wanderer",
            category: "Cinematic",
            model: "✦ instinct",
            likes: "♡ 0",
            prompt: "Cinematic film still of a lone traveler in a hooded cloak in vast desert dunes, low sun casting long shadows, shot on 35mm anamorphic lens, shallow depth of field, teal and orange color grade, film grain, dramatic wide composition, movie frame, 4:3 aspect",
            tags: ["Cinematic", "Desert", "Traveler", "Film Still", "Teal and Orange"]
        },

        "cinematic-football-poster": {
            title: "Football Star Poster",
            image: "images/trending/6-artlib-06-cinematic-football-poster.jpg",
            alt: "Football Star Poster",
            category: "Cinematic",
            model: "✦ instinct",
            likes: "♡ 0",
            prompt: "Cinematic sports poster of a professional footballer wearing a red jersey, the name \"SALAH\" written in bold gold typography above him, a packed stadium with smoke and floodlights, dramatic stadium bright floodlights with lens flare, hyper-detailed, dynamic action pose, sports photography style, 4:3 composition",
            tags: ["Cinematic", "Football", "Poster", "Stadium", "Sports"]
        },

        "fantasy-dragon-castle": {
            title: "Dragon Over Castle",
            image: "images/trending/7-artlib-07-fantasy-dragon-castle.jpg",
            alt: "Dragon Over Castle",
            category: "Fantasy",
            model: "✦ instinct",
            likes: "♡ 0",
            prompt: "Epic fantasy digital painting of a giant emerald dragon flying over a medieval mountain castle, stormy clouds with lightning, magical green glow from the dragon, intricate details, vibrant magical color palette, concept art masterpiece, 4:3 composition",
            tags: ["Fantasy", "Dragon", "Castle", "Epic", "Concept Art"]
        },

        "fantasy-floating-islands": {
            title: "Floating Islands",
            image: "images/trending/8-artlib-08-fantasy-floating-islands.jpg",
            alt: "Floating Islands",
            category: "Fantasy",
            model: "✦ instinct",
            likes: "♡ 0",
            prompt: "Dreamlike fantasy landscape of floating islands with ancient temples and glowing trees, connected by rope bridges and heavy chains, pastel dawn sky, soft volumetric god rays, lush impossible vegetation, waterfalls pouring into the clouds below, highly detailed fantasy concept art, 4:3 composition",
            tags: ["Fantasy", "Floating Islands", "Temples", "Waterfalls", "Dreamlike"]
        },

        "illustration-flat-travel": {
            title: "Flat Vector Travel",
            image: "images/trending/9-artlib-09-illustration-flat-travel.jpg",
            alt: "Flat Vector Travel",
            category: "Illustration",
            model: "✦ instinct",
            likes: "♡ 0",
            prompt: "Modern flat vector illustration of a camper van parked by a mountain lake, warm sunset orange and teal color palette, clean geometric shapes, minimal gradients, bold composition, editorial illustration style, 4:3 format",
            tags: ["Illustration", "Flat Vector", "Travel", "Camper Van", "Minimal"]
        },

        "illustration-storybook-fox": {
            title: "Storybook Fox",
            image: "images/trending/10-artlib-10-illustration-storybook-fox.jpg",
            alt: "Storybook Fox",
            category: "Illustration",
            model: "✦ instinct",
            likes: "♡ 0",
            prompt: "Charming children's book watercolor illustration of a curious fox wearing a tiny scarf in an autumn forest path, soft amber, rust and cream washes, hand-drawn ink outlines, whimsical details, storybook page, 4:3 composition",
            tags: ["Illustration", "Watercolor", "Fox", "Storybook", "Autumn"]
        },

        "logo-falcon": {
            title: "Falcon Mark",
            image: "images/trending/11-artlib-11-logo-falcon.jpg",
            alt: "Falcon Mark",
            category: "Logo Design",
            model: "✦ instinct",
            likes: "♡ 0",
            prompt: "Minimalist logo design of a falcon head, constructed from clean geometric shapes, gold and navy blue flat vector style, professional brand identity, centered composition, high contrast, displayed on a solid dark charcoal background that fills the entire frame edge to edge, no white borders, 4:3 format",
            tags: ["Logo", "Falcon", "Minimalist", "Branding", "Geometric"]
        },

        "logo-monogram": {
            title: "Luxury Monogram",
            image: "images/trending/12-artlib-12-logo-monogram.jpg",
            alt: "Luxury Monogram",
            category: "Logo Design",
            model: "✦ instinct",
            likes: "♡ 0",
            prompt: "Elegant monogram logo combining the letters A and L with a subtle laurel branch, thin refined line work, cream and deep purple palette, luxury brand aesthetic, flat vector style, centered on a solid midnight blue background that fills the entire frame, no glow effect, no vignette, clean sharp edges, 4:3 format",
            tags: ["Logo", "Monogram", "Luxury", "Elegant", "Laurel"]
        },

        "nature-macro-frog": {
            title: "Macro Frog",
            image: "images/trending/13-artlib-13-nature-macro-frog.jpg",
            alt: "Macro Frog",
            category: "Nature",
            model: "✦ instinct",
            likes: "♡ 0",
            prompt: "Extreme macro photograph of a vibrant green tree frog on a leaf, covered in morning dew drops, soft emerald bokeh background, backlit golden morning sun, razor-sharp focus, professional nature photography, 4:3 composition",
            tags: ["Nature", "Macro", "Frog", "Dew", "Photography"]
        },

        "nature-northern-lights": {
            title: "Northern Lights",
            image: "images/trending/14-artlib-14-nature-northern-lights.jpg",
            alt: "Northern Lights",
            category: "Nature",
            model: "✦ instinct",
            likes: "♡ 0",
            prompt: "Breathtaking landscape photograph of snowy Norwegian fjord mountains under vivid green and purple northern lights, a still mirror-like lake, long exposure, rich natural colors, award-winning nature photography, 4:3 composition",
            tags: ["Nature", "Northern Lights", "Fjord", "Mountains", "Long Exposure"]
        },

        "product-luxury-watch": {
            title: "Luxury Watch",
            image: "images/trending/15-artlib-15-product-luxury-watch.jpg",
            alt: "Luxury Watch",
            category: "Product",
            model: "✦ instinct",
            likes: "♡ 0",
            prompt: "Luxury product photography of a chronograph watch with rose gold details, resting on black marble, deep charcoal background, dramatic single soft spotlight with elegant reflections, ultra-sharp studio shot, commercial advertising quality, 4:3 composition",
            tags: ["Product", "Watch", "Luxury", "Chronograph", "Studio"]
        },

        "product-perfume": {
            title: "Perfume Bottle",
            image: "images/trending/16-artlib-16-product-perfume.jpg",
            alt: "Perfume Bottle",
            category: "Product",
            model: "✦ instinct",
            likes: "♡ 0",
            prompt: "High-end product photography of an elegant perfume bottle with amber glass and a gold cap, surrounded by silk fabric and orchid petals, warm beige gradient backdrop, soft diffused golden light, luxury cosmetic advertising style, ultra-detailed studio shot, 4:3 composition",
            tags: ["Product", "Perfume", "Luxury", "Cosmetic", "Advertising"]
        },

        "realistic-portrait-fisherman": {
            title: "Fisherman Portrait",
            image: "images/trending/17-artlib-17-realistic-portrait-fisherman.jpg",
            alt: "Fisherman Portrait",
            category: "Realistic",
            model: "✦ instinct",
            likes: "♡ 0",
            prompt: "Hyper-realistic portrait photograph of an elderly fisherman with a weathered face, a gentle knowing smile, wearing a navy wool sweater, soft grey background, natural window light, 85mm lens, shallow depth of field, detailed skin texture, professional studio portrait, 4:3 composition",
            tags: ["Realistic", "Portrait", "Fisherman", "Photorealistic", "Studio"]
        },

        "realistic-cairo-market": {
            title: "Cairo Spice Market",
            image: "images/trending/18-artlib-18-realistic-cairo-market.jpg",
            alt: "Cairo Spice Market",
            category: "Realistic",
            model: "✦ instinct",
            likes: "♡ 0",
            prompt: "Documentary street photograph of a bustling Cairo spice market with colorful open sacks, early morning, soft haze in the air, candid moment, 35mm lens, natural colors with slight film grain, photojournalistic style, 4:3 composition",
            tags: ["Realistic", "Street", "Cairo", "Market", "Documentary"]
        },

        "3d-isometric-room": {
            title: "Isometric Room",
            image: "images/trending/19-artlib-19-3d-isometric-room.jpg",
            alt: "Isometric Room",
            category: "3D Render",
            model: "✦ instinct",
            likes: "♡ 0",
            prompt: "Cute isometric 3D render of a cozy gamer bedroom with a PC setup, pastel purple and mint color palette, warm lamp glow with neon accents, soft rounded shapes, miniature diorama style, octane render, high detail, clean composition, 4:3 format",
            tags: ["3D", "Isometric", "Room", "Gamer", "Diorama"]
        },

        "3d-robot-chef": {
            title: "Robot Chef",
            image: "images/trending/20-artlib-20-3d-robot-chef.jpg",
            alt: "Robot Chef",
            category: "3D Render",
            model: "✦ instinct",
            likes: "♡ 0",
            prompt: "Adorable 3D character render of a tiny round robot chef with a chef hat, flipping pancakes, in a bright retro diner kitchen, Pixar-style, soft studio cheerful morning light, subsurface scattering, expressive eyes, high-quality animation still, 4:3 composition",
            tags: ["3D", "Robot", "Chef", "Character", "Pixar Style"]
        },


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
        "anime-neon-samurai",
        "anime-cozy-cafe",
        "architecture-modern-villa",
        "architecture-egypt-temple",
        "cinematic-desert-wanderer",
        "cinematic-football-poster",
        "fantasy-dragon-castle",
        "fantasy-floating-islands",
        "illustration-flat-travel",
        "illustration-storybook-fox",
        "logo-falcon",
        "logo-monogram",
        "nature-macro-frog",
        "nature-northern-lights",
        "product-luxury-watch",
        "product-perfume",
        "realistic-portrait-fisherman",
        "realistic-cairo-market",
        "3d-isometric-room",
        "3d-robot-chef",

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
        "anime-neon-samurai",
        "anime-cozy-cafe",
        "architecture-modern-villa",
        "architecture-egypt-temple",
        "cinematic-desert-wanderer",
        "cinematic-football-poster",
        "fantasy-dragon-castle",
        "fantasy-floating-islands",
        "illustration-flat-travel",
        "illustration-storybook-fox",
        "logo-falcon",
        "logo-monogram",
        "nature-macro-frog",
        "nature-northern-lights",
        "product-luxury-watch",
        "product-perfume",
        "realistic-portrait-fisherman",
        "realistic-cairo-market",
        "3d-isometric-room",
        "3d-robot-chef",

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
                    <option value="instinct">Instinct</option>
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

    /* TRENDING PREVIEW: first 6 cards, the rest on View all */
    const trendingViewAll = trendingHeading.querySelector(".view-all");
    const TRENDING_PREVIEW_COUNT = 6;
    let trendingExpanded = false;

    if (trendingViewAll) {
        trendingViewAll.addEventListener("click", (event) => {
            event.preventDefault();
            trendingExpanded = !trendingExpanded;
            renderResults(false);

            if (!trendingExpanded && trendingSection) {
                trendingSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    }

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
        const filtersActive =
            words.length > 0 ||
            activeCategory !== "all" ||
            activeModel !== "all";
        let visibleCount = 0;

        artworks.forEach((card, index) => {
            const text = artworkText(card);
            const matchesSearch = words.every(word => text.includes(word));
            const matchesCurrentCategory = matchesCategory(card, activeCategory);
            const modelText = normalize(card.querySelector(".model")?.textContent);
            const matchesModel = activeModel === "all" || modelText.includes(activeModel);
            const visible =
                matchesSearch &&
                matchesCurrentCategory &&
                matchesModel &&
                (filtersActive ||
                    trendingExpanded ||
                    index < TRENDING_PREVIEW_COUNT);

            card.hidden = !visible;
            if (visible) visibleCount++;
        });

        if (trendingViewAll) {
            trendingViewAll.textContent = trendingExpanded
                ? "Show less ↑"
                : "View all →";
        }

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


/* ArtLibrary — Latest Additions preview: first 6, the rest on View all */
document.addEventListener("DOMContentLoaded", function () {
    const latestSection = document.querySelector(".latest-section");
    if (!latestSection) return;

    const grid = latestSection.querySelector(".latest-grid");
    const viewAll = latestSection.querySelector(".view-all");
    if (!grid || !viewAll) return;

    const LATEST_PREVIEW_COUNT = 6;
    let latestExpanded = false;

    function applyLatestPreview() {
        const cards = Array.from(grid.querySelectorAll(".latest-image"));
        cards.forEach((card, index) => {
            card.hidden = !latestExpanded && index >= LATEST_PREVIEW_COUNT;
        });
        viewAll.textContent = latestExpanded ? "Show less ↑" : "View all →";
    }

    viewAll.addEventListener("click", function (event) {
        event.preventDefault();
        latestExpanded = !latestExpanded;
        applyLatestPreview();

        if (!latestExpanded) {
            latestSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });

    applyLatestPreview();
});

/* ArtLibrary — enforce the hidden attribute over grid/flex display rules */
document.addEventListener("DOMContentLoaded", function () {
    const hiddenStyle = document.createElement("style");
    hiddenStyle.textContent = "[hidden] { display: none !important; }";
    document.head.appendChild(hiddenStyle);
});
