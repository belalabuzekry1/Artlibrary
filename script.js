/* =========================================================
   ARTLIBRARY — INTERACTIONS
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       MOBILE MENU
       ===================================================== */

    const menuButton = document.querySelector(".menu-button");
    const nav = document.querySelector(".desktop-nav");

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
    document.querySelector(".header-actions .icon-button");

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

        searchInput.addEventListener("keydown", (event) => {

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

        });

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

        newsletterForm.addEventListener("submit", (event) => {

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

        });

    }


    /* =====================================================
       SMOOTH SCROLL
       ===================================================== */

    document
        .querySelectorAll('a[href^="#"]')
        .forEach((link) => {

            link.addEventListener("click", (event) => {

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

                /* Close mobile menu */

                if (
                    nav &&
                    nav.classList.contains("mobile-open")
                ) {

                    nav.classList.remove(
                        "mobile-open"
                    );

                }

            });

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
       CONSOLE MESSAGE
       ===================================================== */

    console.log(
        "%cArtLibrary",
        "font-size:24px;font-weight:bold;"
    );

    console.log(
        "AI Images • Prompts • Community"
    );
/* =========================================================
   COPY PROMPT
   ========================================================= */

const copyPromptButtons =
    document.querySelectorAll(".copy-prompt");

copyPromptButtons.forEach((button) => {

    button.addEventListener("click", async () => {

        const prompt =
            button.getAttribute("data-prompt");

        if (!prompt) return;

        try {

            await navigator.clipboard.writeText(prompt);

            const originalText =
                button.innerHTML;

            button.innerHTML =
                "✓ Prompt Copied!";

            button.classList.add("copied");

            setTimeout(() => {

                button.innerHTML =
                    originalText;

                button.classList.remove("copied");

            }, 1800);

        } catch (error) {

            console.error(
                "Could not copy prompt:",
                error
            );

        }

    });

});
});
