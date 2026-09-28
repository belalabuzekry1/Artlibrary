/* =========================================================
   ARTLIBRARY — INTERACTIONS
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       MOBILE MENU
       ===================================================== */

    const menuButton =
        document.querySelector(".menu-button");

    const nav =
        document.querySelector(".desktop-nav");

    if (menuButton && nav) {

        menuButton.addEventListener("click", () => {

            nav.classList.toggle("mobile-open");

            const isOpen =
                nav.classList.contains("mobile-open");

            menuButton.setAttribute(
                "aria-expanded",
                isOpen
            );

            menuButton.setAttribute(
                "aria-label",
                isOpen
                    ? "Close menu"
                    : "Open menu"
            );

        });

    }


    /* =====================================================
       SEARCH
       ===================================================== */

    const searchInput =
        document.querySelector(".search-box input");

    const headerSearchButton =
        document.querySelector(
            ".header-actions .icon-button"
        );

    if (headerSearchButton && searchInput) {

        headerSearchButton.addEventListener("click", () => {

            searchInput.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            setTimeout(() => {
                searchInput.focus();
            }, 400);

        });

    }

    if (searchInput) {

        searchInput.addEventListener(
            "keydown",
            (event) => {

                if (event.key === "Enter") {

                    const query =
                        searchInput.value.trim();

                    if (query) {

                        console.log(
                            "ArtLibrary search:",
                            query
                        );

                        alert(
                            `Searching ArtLibrary for: "${query}"`
                        );

                    }

                }

            }
        );

    }


    /* =====================================================
       SEARCH BUTTON
       ===================================================== */

    const filterButton =
        document.querySelector(".filter-button");

    if (filterButton) {

        filterButton.addEventListener("click", () => {

            alert(
                "Advanced filters will be available soon."
            );

        });

    }


    /* =====================================================
       NEWSLETTER
       ===================================================== */

    const newsletterForm =
        document.querySelector(".newsletter-form");

    if (newsletterForm) {

        newsletterForm.addEventListener(
            "submit",
            (event) => {

                event.preventDefault();

                const emailInput =
                    newsletterForm.querySelector("input");

                if (!emailInput) return;

                const email =
                    emailInput.value.trim();

                if (!email) {

                    alert(
                        "Please enter your email address."
                    );

                    return;

                }

                if (!email.includes("@")) {

                    alert(
                        "Please enter a valid email address."
                    );

                    return;

                }

                alert(
                    "Thanks! You're on the ArtLibrary list."
                );

                emailInput.value = "";

            }
        );

    }


    /* =====================================================
       SMOOTH SCROLL
       ===================================================== */

    document
        .querySelectorAll('a[href^="#"]')
        .forEach((link) => {

            link.addEventListener(
                "click",
                (event) => {

                    const targetId =
                        link.getAttribute("href");

                    if (
                        !targetId ||
                        targetId === "#"
                    ) {
                        return;
                    }

                    const target =
                        document.querySelector(targetId);

                    if (!target) return;

                    event.preventDefault();

                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                    if (
                        nav &&
                        nav.classList.contains(
                            "mobile-open"
                        )
                    ) {

                        nav.classList.remove(
                            "mobile-open"
                        );

                    }

                }
            );

        });


    /* =====================================================
       SCROLL REVEAL
       ===================================================== */

    const revealElements =
        document.querySelectorAll(
            ".category-card, .art-card, .latest-image, .model-pill"
        );

    if ("IntersectionObserver" in window) {

        const observer =
            new IntersectionObserver(
                (entries, observerInstance) => {

                    entries.forEach((entry) => {

                        if (!entry.isIntersecting) {
                            return;
                        }

                        entry.target.classList.add(
                            "reveal-visible"
                        );

                        observerInstance.unobserve(
                            entry.target
                        );

                    });

                },
                {
                    threshold: 0.08
                }
            );

        revealElements.forEach((element) => {

            element.classList.add(
                "reveal-element"
            );

            observer.observe(element);

        });

    }


    /* =====================================================
       CURRENT YEAR
       ===================================================== */

    const yearElements =
        document.querySelectorAll(
            "[data-current-year]"
        );

    yearElements.forEach((element) => {

        element.textContent =
            new Date().getFullYear();

    });


    /* =====================================================
       ESCAPE KEY
       ===================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            if (event.key !== "Escape") {
                return;
            }

            if (
                nav &&
                nav.classList.contains("mobile-open")
            ) {

                nav.classList.remove(
                    "mobile-open"
                );

            }

        }
    );


    /* =====================================================
       ARTWORK DATA
       ===================================================== */

    const artworks = {

        "neon-city": {

            title: "Neon City Night",

            image:
                "images/trending/Neon Cyberpunk City.jfif",

            alt:
                "Neon City Night",

            category:
                "Sci-Fi",

            model:
                "✦ Gemini",

            likes:
                "♡ 2.4K",

            prompt:
                "A futuristic cyberpunk city at night after heavy rain, a lone person standing beside a sleek futuristic sports car on a wet reflective street, enormous skyscrapers covered with glowing neon signs, holographic advertisements, flying vehicles in the distance, cinematic blue and magenta lighting, atmospheric fog, dramatic perspective, volumetric light rays, ultra-detailed environment, realistic reflections, cinematic photography, deep depth of field, premium sci-fi concept art, highly detailed, 8k",

            tags: [
                "Cyberpunk",
                "City",
                "Neon",
                "Sci-Fi",
                "Cinematic"
            ]

        },


        "cozy-cat": {

            title: "Cozy Cat at Home",

            image:
                "images/trending/Cozy Cat at Home.png",

            alt:
                "Cozy Cat at Home",

            category:
                "Animals",

            model:
                "✦ ChatGPT",

            likes:
                "♡ 856",

            prompt:
                "A beautiful orange tabby cat peacefully sleeping on a soft knitted blanket beside a large sunlit window, warm morning sunlight entering a cozy modern living room, indoor plants, wooden furniture, a small coffee table with a ceramic cup and a few books, soft natural shadows, warm neutral colors, peaceful atmosphere, realistic fur detail, shallow depth of field, professional lifestyle photography, cozy and inviting composition, photorealistic",

            tags: [
                "Cat",
                "Animals",
                "Cozy",
                "Home",
                "Photorealistic"
            ]

        },


        "elven-warrior": {

            title: "Elven Warrior",

            image:
                "images/trending/Elven Warrior.jfif",

            alt:
                "Elven Warrior",

            category:
                "Fantasy",

            model:
                "✦ Gemini",

            likes:
                "♡ 642",

            prompt:
                "A powerful female elven warrior standing on a mountain overlooking an ancient fantasy kingdom, long silver hair moving gently in the wind, intricate silver and dark blue armor decorated with elegant elven patterns, subtle magical blue light surrounding her, enormous mountains and a medieval fantasy castle in the distance, cinematic sunrise, dramatic clouds, highly detailed face, realistic skin texture, epic composition, cinematic lighting, fantasy concept art, ultra detailed, masterpiece",

            tags: [
                "Fantasy",
                "Elf",
                "Warrior",
                "Magic",
                "Concept Art"
            ]

        },


        "luxury-watch": {

            title: "Luxury Watch",

            image:
                "images/trending/Luxury Watch.png",

            alt:
                "Luxury Watch",

            category:
                "Product",

            model:
                "✦ ChatGPT",

            likes:
                "♡ 521",

            prompt:
                "A premium luxury mechanical wristwatch with a black dial and polished gold details, placed on a dark black marble surface with subtle water droplets, dramatic studio lighting from the side, warm golden highlights reflecting across the metal, extremely detailed watch mechanism and dial, elegant luxury advertising aesthetic, shallow depth of field, realistic reflections, sophisticated dark background, professional commercial product photography, photorealistic, ultra sharp, premium high-end campaign",

            tags: [
                "Watch",
                "Luxury",
                "Product",
                "Advertising",
                "Photography"
            ]

        },


        "sunset-memories": {

            title: "Sunset Memories",

            image:
                "images/trending/Anime Sunset Portrait.jfif",

            alt:
                "Sunset Memories",

            category:
                "Anime",

            model:
                "✦ Gemini",

            likes:
                "♡ 927",

            prompt:
                "A beautiful young anime woman with short dark brown hair standing on a rooftop overlooking a modern city at sunset, warm orange and pink sky, soft wind moving her hair, gentle emotional expression, detailed expressive eyes, casual modern clothing, glowing city lights beginning to appear in the background, cinematic composition, beautiful rim lighting, atmospheric depth, highly detailed anime illustration, polished digital art, vibrant but elegant colors, professional anime key visual",

            tags: [
                "Anime",
                "Portrait",
                "Sunset",
                "City",
                "Illustration"
            ]

        },


        "modern-dream-house": {

            title: "Modern Dream House",

            image:
                "images/trending/Modern Dream House.png",

            alt:
                "Modern Dream House",

            category:
                "Architecture",

            model:
                "✦ ChatGPT",

            likes:
                "♡ 459",

            prompt:
                "A stunning modern luxury villa with floor-to-ceiling glass walls, clean minimalist architecture, surrounded by tropical palm trees and lush landscaping, large infinity pool reflecting the house and evening sky, warm interior lights glowing through the glass, elegant outdoor lounge area, dramatic sunset clouds, cinematic architectural photography, realistic materials and reflections, sophisticated composition, ultra realistic, high-end architectural visualization, detailed lighting, premium real estate photography",

            tags: [
                "Architecture",
                "Villa",
                "Modern",
                "Luxury",
                "Real Estate"
            ]

        }

    };


    /* =====================================================
       ARTWORK DETAILS PAGE
       ===================================================== */

    const artworkImage =
        document.querySelector(
            ".artwork-main-image img"
        );

    const artworkTitle =
        document.querySelector(
            ".artwork-heading h1"
        );

    const artworkCategory =
        document.querySelector(
            ".artwork-category"
        );

    const artworkMeta =
        document.querySelectorAll(
            ".artwork-meta span"
        );

    const artworkPrompt =
        document.querySelector(
            ".artwork-prompt"
        );

    const copyPromptButton =
        document.querySelector(
            ".copy-prompt"
        );

    const artworkTags =
        document.querySelector(
            ".artwork-tags"
        );


    const params =
        new URLSearchParams(
            window.location.search
        );

    const artworkId =
        params.get("art");


    if (
        artworkId &&
        artworks[artworkId] &&
        artworkImage &&
        artworkTitle
    ) {

        const artwork =
            artworks[artworkId];


        artworkImage.src =
            artwork.image;

        artworkImage.alt =
            artwork.alt;


        artworkTitle.textContent =
            artwork.title;


        artworkCategory.textContent =
            artwork.category;


        if (artworkMeta[0]) {

            artworkMeta[0].textContent =
                artwork.model;

        }

        if (artworkMeta[1]) {

            artworkMeta[1].textContent =
                artwork.likes;

        }


        if (artworkPrompt) {

            artworkPrompt.textContent =
                artwork.prompt;

        }


        if (copyPromptButton) {

            copyPromptButton.setAttribute(
                "data-prompt",
                artwork.prompt
            );

        }


        if (artworkTags) {

            artworkTags.innerHTML =
                artwork.tags
                    .map(
                        (tag) =>
                            `<span>${tag}</span>`
                    )
                    .join("");

        }


        document.title =
            `${artwork.title} | ArtLibrary`;

    }


    /* =====================================================
       TRENDING ARTWORK LINKS
       ===================================================== */

    const trendingCards =
        document.querySelectorAll(
            ".art-card"
        );


    const trendingArtworkIds = [
        "neon-city",
        "cozy-cat",
        "elven-warrior",
        "luxury-watch",
        "sunset-memories",
        "modern-dream-house"
    ];


    trendingCards.forEach(
        (card, index) => {

            const artworkId =
                trendingArtworkIds[index];

            if (!artworkId) return;


            card.setAttribute(
                "role",
                "link"
            );

            card.setAttribute(
                "tabindex",
                "0"
            );


            card.addEventListener(
                "click",
                (event) => {

                    if (
                        event.target.closest(
                            ".copy-prompt"
                        )
                    ) {
                        return;
                    }

                    if (
                        event.target.closest(
                            "a, button"
                        )
                    ) {
                        return;
                    }


                    window.location.href =
                        `artwork.html?art=${artworkId}`;

                }
            );


            card.addEventListener(
                "keydown",
                (event) => {

                    if (
                        event.key !== "Enter" &&
                        event.key !== " "
                    ) {
                        return;
                    }


                    event.preventDefault();


                    window.location.href =
                        `artwork.html?art=${artworkId}`;

                }
            );

        }
    );


    /* =====================================================
       COPY PROMPT
       ===================================================== */

    const copyPromptButtons =
        document.querySelectorAll(
            ".copy-prompt"
        );


    copyPromptButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                async () => {

                    const prompt =
                        button.getAttribute(
                            "data-prompt"
                        );

                    if (!prompt) return;


                    try {

                        await navigator.clipboard.writeText(
                            prompt
                        );


                        const originalText =
                            button.innerHTML;


                        button.innerHTML =
                            "✓ Prompt Copied!";


                        button.classList.add(
                            "copied"
                        );


                        setTimeout(
                            () => {

                                button.innerHTML =
                                    originalText;

                                button.classList.remove(
                                    "copied"
                                );

                            },
                            1800
                        );


                    } catch (error) {

                        console.error(
                            "Could not copy prompt:",
                            error
                        );

                    }

                }
            );

        }
    );


    /* =====================================================
       CONSOLE MESSAGE
       ===================================================== */

    console.log(
        "%cArtLibrary",
        "font-size:24px;font-weight:bold;"
    );

    console.log(
        "AI Images • Prompts • Community"
    );

});
