/* =========================================================
   ARTLIBRARY - one script for the gallery and artwork pages.
   All artwork content lives in data.js (window.ARTLIBRARY).
   ========================================================= */

(function () {
    "use strict";

    var DATA = window.ARTLIBRARY || { items: [], latest: [] };
    var ITEMS = DATA.items;
    var BY_ID = {};
    ITEMS.forEach(function (it) { BY_ID[it.id] = it; });
    var PREVIEW = 6;
    var IS_ART_PAGE = !!document.body.getAttribute("data-art");
    var BASE = IS_ART_PAGE ? "../" : "";

    function el(tag, cls, text) {
        var node = document.createElement(tag);
        if (cls) node.className = cls;
        if (text != null) node.textContent = text;
        return node;
    }
    function norm(v) { return (v || "").toLowerCase().replace(/\s+/g, " ").trim(); }
    function artUrl(id) { return (IS_ART_PAGE ? "" : "art/") + id + ".html"; }

    /* ---------- shared: hidden attribute, menu, theme, copy ---------- */
    var hs = document.createElement("style");
    hs.textContent = "[hidden]{display:none !important;}";
    document.head.appendChild(hs);

    var menuButton = document.querySelector(".menu-button");
    var nav = document.querySelector(".desktop-nav");
    if (menuButton && nav) {
        menuButton.addEventListener("click", function () {
            nav.classList.toggle("mobile-open");
            var open = nav.classList.contains("mobile-open");
            menuButton.setAttribute("aria-expanded", String(open));
            menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        });
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") nav.classList.remove("mobile-open");
        });
        nav.querySelectorAll("a").forEach(function (a) {
            a.addEventListener("click", function () { nav.classList.remove("mobile-open"); });
        });
    }

    var themeButton = document.querySelector(".theme-button");
    if (themeButton) {
        var logos = document.querySelectorAll(".site-logo");
        var applyTheme = function (theme) {
            var light = theme === "light";
            if (light) document.body.setAttribute("data-theme", "light");
            else document.body.removeAttribute("data-theme");
            themeButton.textContent = light ? "\u263E" : "\u263C";
            var label = light ? "Switch to dark theme" : "Switch to light theme";
            themeButton.setAttribute("aria-label", label);
            themeButton.setAttribute("title", label);
            logos.forEach(function (logo) {
                var src = light ? logo.dataset.lightLogo : logo.dataset.darkLogo;
                if (src) logo.src = src;
            });
        };
        var saved = "dark";
        try { saved = localStorage.getItem("artlibrary-theme") || "dark"; } catch (e) {}
        applyTheme(saved);
        themeButton.addEventListener("click", function () {
            var next = document.body.getAttribute("data-theme") === "light" ? "dark" : "light";
            applyTheme(next);
            try { localStorage.setItem("artlibrary-theme", next); } catch (e) {}
        });
    }

    function copyText(text, button) {
        var done = function () {
            var original = button.innerHTML;
            button.innerHTML = "\u2713 Prompt Copied!";
            button.classList.add("copied");
            setTimeout(function () {
                button.innerHTML = original;
                button.classList.remove("copied");
            }, 1800);
        };
        var fallback = function () {
            var ta = document.createElement("textarea");
            ta.value = text;
            ta.setAttribute("readonly", "");
            ta.style.position = "fixed";
            ta.style.opacity = "0";
            document.body.appendChild(ta);
            ta.select();
            try { if (document.execCommand("copy")) done(); } catch (e) {}
            document.body.removeChild(ta);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done, fallback);
        } else {
            fallback();
        }
    }

    /* =====================================================
       ARTWORK PAGE: editable prompt variables
       ===================================================== */
    function initArtworkPage() {
        var it = BY_ID[document.body.getAttribute("data-art")];
        if (!it) return;
        var editor = document.getElementById("prompt-editor");
        var promptEl = document.querySelector(".artwork-prompt");
        var copyBtn = document.querySelector(".prompt-box .copy-prompt");
        if (!editor || !promptEl || !copyBtn) return;

        /* split the original prompt into text and variable parts */
        var parts = [{ text: it.prompt }];
        it.vars.forEach(function (v) {
            for (var i = 0; i < parts.length; i++) {
                var p = parts[i];
                if (p.v || p.text.indexOf(v.default) < 0) continue;
                var at = p.text.indexOf(v.default);
                var before = p.text.slice(0, at);
                var after = p.text.slice(at + v.default.length);
                var repl = [];
                if (before) repl.push({ text: before });
                repl.push({ v: v.key });
                if (after) repl.push({ text: after });
                parts.splice.apply(parts, [i, 1].concat(repl));
                break;
            }
        });
        var values = {};
        it.vars.forEach(function (v) { values[v.key] = v.default; });

        var marks = {};
        function build() {
            var out = "";
            promptEl.textContent = "";
            parts.forEach(function (p) {
                if (p.v) {
                    var m = el("mark", "prompt-var", values[p.v] || "...");
                    m.dataset.key = p.v;
                    if (values[p.v] !== defaultOf(p.v)) m.classList.add("changed");
                    (marks[p.v] = marks[p.v] || []).push(m);
                    promptEl.appendChild(m);
                    out += values[p.v];
                } else {
                    promptEl.appendChild(document.createTextNode(p.text));
                    out += p.text;
                }
            });
            return out;
        }
        function defaultOf(key) {
            for (var i = 0; i < it.vars.length; i++) if (it.vars[i].key === key) return it.vars[i].default;
            return "";
        }
        function current() {
            return parts.map(function (p) { return p.v ? values[p.v] : p.text; }).join("");
        }
        function refresh() {
            marks = {};
            build();
            var changed = it.vars.some(function (v) { return values[v.key] !== v.default; });
            resetBtn.hidden = !changed;
            status.textContent = changed
                ? "Customized version. The image above was made only with the original prompt."
                : "Original prompt, exactly as used for the image above.";
        }

        editor.hidden = false;
        var head = el("h3", "editor-title", "Make it yours");
        var hint = el("p", "editor-hint", "Change the highlighted parts of the prompt, then copy it. Results depend on the AI model you use, and we have not generated images from customized versions.");
        var fields = el("div", "editor-fields");
        it.vars.forEach(function (v) {
            var wrap = el("label", "editor-field");
            wrap.appendChild(el("span", null, v.label));
            var input = document.createElement("input");
            input.type = "text";
            input.value = v.default;
            input.setAttribute("maxlength", "80");
            input.setAttribute("autocomplete", "off");
            input.addEventListener("input", function () {
                values[v.key] = input.value;
                refresh();
            });
            v.input = input;
            wrap.appendChild(input);
            fields.appendChild(wrap);
        });
        var status = el("p", "editor-status", "");
        status.setAttribute("aria-live", "polite");
        var resetBtn = el("button", "editor-reset", "Reset to original");
        resetBtn.type = "button";
        resetBtn.hidden = true;
        resetBtn.addEventListener("click", function () {
            it.vars.forEach(function (v) { values[v.key] = v.default; v.input.value = v.default; });
            refresh();
        });
        editor.appendChild(head);
        editor.appendChild(hint);
        editor.appendChild(fields);
        editor.appendChild(status);
        editor.appendChild(resetBtn);
        copyBtn.addEventListener("click", function () { copyText(current(), copyBtn); });
        refresh();
    }

    /* =====================================================
       GALLERY PAGE
       ===================================================== */
    function initGallery() {
        var grid = document.getElementById("art-grid");
        var latestGrid = document.getElementById("latest-grid");
        if (!grid) return;

        var CATS = {
            "cinematic": ["Cinematic", "Sci-Fi"],
            "anime": ["Anime"],
            "realistic": ["Realistic", "Animals"],
            "3d & render": ["3D Render"],
            "product": ["Product"],
            "architecture": ["Architecture"],
            "fantasy": ["Fantasy"],
            "logo & design": ["Logo Design"],
            "illustration": ["Illustration"],
            "nature": ["Nature"]
        };
        var MODELS = ["Midjourney", "DALL\u00B7E", "Stable Diffusion", "Flux", "Ideogram", "ChatGPT", "Leonardo", "Runway", "Gemini", "Instinct"];

        var searchInput = document.querySelector(".search-box input");
        var heading = document.querySelector("#explore .section-heading h2");
        var featuredToggle = document.getElementById("featured-toggle");
        var latestToggle = document.getElementById("latest-toggle");
        var emptyMsg = document.getElementById("empty-msg");
        var categoryCards = Array.prototype.slice.call(document.querySelectorAll("#categories .category-card"));
        var state = { cat: "all", model: "all", featuredOpen: false, latestOpen: false };
        var activeCard = null;

        /* cards */
        var cards = ITEMS.map(function (it) {
            var card = el("article", "art-card");
            card.setAttribute("role", "link");
            card.setAttribute("tabindex", "0");
            var imgWrap = el("div", "art-image");
            var img = document.createElement("img");
            img.src = it.image; img.alt = it.title; img.width = it.w; img.height = it.h;
            img.loading = "lazy"; img.decoding = "async";
            imgWrap.appendChild(img);
            var info = el("div", "art-info");
            var row = el("div", "art-title-row");
            row.appendChild(el("h3", null, it.title));
            row.appendChild(el("span", "category", it.category));
            info.appendChild(row);
            info.appendChild(el("span", "model", "\u2726 " + it.model));
            info.appendChild(el("p", "prompt-text", it.prompt));
            var actions = el("div", "card-actions");
            var copy = el("button", "copy-prompt", "\uD83D\uDCCB Copy Prompt");
            copy.type = "button";
            copy.addEventListener("click", function (e) { e.stopPropagation(); copyText(it.prompt, copy); });
            var custom = el("a", "customize-link", "Customize \u2192");
            custom.href = artUrl(it.id);
            actions.appendChild(copy);
            actions.appendChild(custom);
            info.appendChild(actions);
            card.appendChild(imgWrap);
            card.appendChild(info);
            card.addEventListener("click", function (e) {
                if (e.target.closest("a, button")) return;
                location.href = artUrl(it.id);
            });
            card.addEventListener("keydown", function (e) {
                if (e.target !== card) return;
                if (e.key === "Enter" || e.key === " ") { e.preventDefault(); location.href = artUrl(it.id); }
            });
            card._it = it;
            card._text = norm([it.title, it.category, it.model, it.prompt, it.tags.join(" ")].join(" "));
            grid.appendChild(card);
            return card;
        });

        /* latest */
        var latestCards = (DATA.latest || []).map(function (id) {
            var it = BY_ID[id];
            if (!it) return null;
            var a = el("a", "latest-image");
            a.href = artUrl(id);
            a.setAttribute("aria-label", "View " + it.title);
            var img = document.createElement("img");
            img.src = it.image; img.alt = it.title; img.loading = "lazy"; img.decoding = "async";
            a.appendChild(img);
            latestGrid.appendChild(a);
            return a;
        }).filter(Boolean);

        function renderLatest() {
            latestCards.forEach(function (c, i) { c.hidden = !state.latestOpen && i >= PREVIEW; });
            latestToggle.textContent = state.latestOpen ? "Show less \u2191" : "View all \u2192";
            latestToggle.hidden = latestCards.length <= PREVIEW;
        }

        function render() {
            var words = norm(searchInput && searchInput.value).split(" ").filter(Boolean);
            var filtersOn = words.length > 0 || state.cat !== "all" || state.model !== "all";
            var catNames = state.cat === "all" ? null : (CATS[state.cat] || []);
            var shown = 0, matched = 0;
            cards.forEach(function (c) {
                var it = c._it;
                var ok = words.every(function (w) { return c._text.indexOf(w) > -1; }) &&
                    (!catNames || catNames.indexOf(it.category) > -1) &&
                    (state.model === "all" || norm(it.model) === state.model);
                if (ok) matched++;
                var visible = ok && (filtersOn || state.featuredOpen || shown < PREVIEW);
                if (visible) shown++;
                c.hidden = !visible;
            });
            emptyMsg.hidden = matched > 0;
            featuredToggle.hidden = filtersOn || cards.length <= PREVIEW;
            featuredToggle.textContent = state.featuredOpen ? "Show less \u2191" : "View all \u2192";
            categoryCards.forEach(function (c) { c.classList.toggle("is-active", c === activeCard); });
            if (modelsList) {
                Array.prototype.forEach.call(modelsList.children, function (b) {
                    b.classList.toggle("is-active", b.dataset.model === state.model);
                    b.setAttribute("aria-pressed", b.dataset.model === state.model ? "true" : "false");
                });
            }
            if (words.length) heading.textContent = "Search results: " + searchInput.value.trim();
            else if (state.cat !== "all" && activeCard) heading.textContent = "Explore: " + activeCard.querySelector("strong").textContent;
            else if (state.model !== "all") heading.textContent = "Model: " + modelLabel(state.model);
            else heading.textContent = "\u2726 Featured Prompts";
            if (catSelect) catSelect.value = state.cat;
            if (modelSelect) modelSelect.value = state.model;
        }
        function modelLabel(key) {
            for (var i = 0; i < MODELS.length; i++) if (norm(MODELS[i]) === key) return MODELS[i];
            return key;
        }
        function toExplore() {
            var s = document.getElementById("explore");
            if (s) s.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        /* models */
        var modelsList = document.getElementById("models-list");
        MODELS.forEach(function (name) {
            var key = norm(name);
            var count = ITEMS.filter(function (it) { return norm(it.model) === key; }).length;
            var b = el("button", "model-pill", name + " \u00B7 " + count);
            b.type = "button";
            b.dataset.model = key;
            if (!count) b.classList.add("is-empty");
            b.addEventListener("click", function () {
                state.model = state.model === key ? "all" : key;
                state.cat = "all"; activeCard = null;
                if (searchInput) searchInput.value = "";
                render(); toExplore();
            });
            modelsList.appendChild(b);
        });

        /* advanced filters */
        var searchBox = document.querySelector(".search-box");
        var filterButton = document.querySelector(".filter-button");
        var panel = el("div", "advanced-filter-panel");
        panel.hidden = true;
        var catSelect, modelSelect;
        (function () {
            var f1 = el("div", "advanced-filter-field");
            var l1 = el("label", null, "Category"); l1.htmlFor = "flt-cat";
            catSelect = document.createElement("select"); catSelect.id = "flt-cat";
            var o = document.createElement("option"); o.value = "all"; o.textContent = "All categories"; catSelect.appendChild(o);
            categoryCards.forEach(function (c) {
                var name = c.querySelector("strong").textContent;
                var op = document.createElement("option"); op.value = norm(name); op.textContent = name; catSelect.appendChild(op);
            });
            f1.appendChild(l1); f1.appendChild(catSelect);
            var f2 = el("div", "advanced-filter-field");
            var l2 = el("label", null, "AI Model"); l2.htmlFor = "flt-model";
            modelSelect = document.createElement("select"); modelSelect.id = "flt-model";
            var o2 = document.createElement("option"); o2.value = "all"; o2.textContent = "All models"; modelSelect.appendChild(o2);
            MODELS.forEach(function (m) {
                var op = document.createElement("option"); op.value = norm(m); op.textContent = m; modelSelect.appendChild(op);
            });
            f2.appendChild(l2); f2.appendChild(modelSelect);
            var reset = el("button", "advanced-filter-reset", "Reset filters");
            reset.type = "button";
            reset.addEventListener("click", function () {
                state.cat = "all"; state.model = "all"; activeCard = null;
                if (searchInput) searchInput.value = "";
                render(); toExplore();
            });
            panel.appendChild(f1); panel.appendChild(f2); panel.appendChild(reset);
            if (searchBox) searchBox.insertAdjacentElement("afterend", panel);
            catSelect.addEventListener("change", function () {
                state.cat = catSelect.value;
                activeCard = categoryCards.filter(function (c) { return norm(c.querySelector("strong").textContent) === state.cat; })[0] || null;
                render(); toExplore();
            });
            modelSelect.addEventListener("change", function () { state.model = modelSelect.value; render(); toExplore(); });
        })();
        if (filterButton) {
            filterButton.setAttribute("aria-label", "Toggle advanced filters");
            filterButton.setAttribute("aria-expanded", "false");
            filterButton.addEventListener("click", function () {
                var opening = panel.hidden;
                panel.hidden = !opening;
                filterButton.setAttribute("aria-expanded", String(opening));
            });
        }

        /* search */
        if (searchInput) {
            searchInput.addEventListener("input", function () { state.cat = "all"; activeCard = null; render(); });
            searchInput.addEventListener("keydown", function (e) {
                if (e.key === "Enter") { e.preventDefault(); toExplore(); }
            });
            var headerSearch = document.querySelector(".header-actions .icon-button");
            if (headerSearch) headerSearch.addEventListener("click", function () {
                searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
                setTimeout(function () { searchInput.focus(); }, 400);
            });
        }
        document.querySelectorAll(".popular-searches a").forEach(function (a) {
            a.addEventListener("click", function (e) {
                e.preventDefault();
                state.cat = "all"; state.model = "all"; activeCard = null;
                searchInput.value = a.textContent.trim();
                render(); toExplore();
            });
        });

        /* categories */
        categoryCards.forEach(function (c) {
            c.addEventListener("click", function (e) {
                e.preventDefault();
                activeCard = c;
                state.cat = norm(c.querySelector("strong").textContent);
                state.model = "all";
                if (searchInput) searchInput.value = "";
                render(); toExplore();
            });
        });

        /* view all / show less */
        featuredToggle.addEventListener("click", function (e) {
            e.preventDefault();
            state.featuredOpen = !state.featuredOpen;
            render();
            if (!state.featuredOpen) toExplore();
        });
        latestToggle.addEventListener("click", function (e) {
            e.preventDefault();
            state.latestOpen = !state.latestOpen;
            renderLatest();
            if (!state.latestOpen) document.getElementById("latest").scrollIntoView({ behavior: "smooth", block: "start" });
        });

        /* in-page anchors */
        document.querySelectorAll('a[href^="#"]').forEach(function (a) {
            a.addEventListener("click", function (e) {
                var id = a.getAttribute("href");
                if (!id || id === "#" || a.id === "featured-toggle" || a.id === "latest-toggle" || a.closest(".popular-searches")) return;
                var target = document.querySelector(id);
                if (!target) return;
                e.preventDefault();
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        });

        /* reveal on scroll */
        if ("IntersectionObserver" in window) {
            var io = new IntersectionObserver(function (entries, obs) {
                entries.forEach(function (en) {
                    if (!en.isIntersecting) return;
                    en.target.classList.add("reveal-visible");
                    obs.unobserve(en.target);
                });
            }, { threshold: 0.08 });
            document.querySelectorAll(".category-card, .art-card, .latest-image, .model-pill").forEach(function (n) {
                n.classList.add("reveal-element");
                io.observe(n);
            });
        }

        render();
        renderLatest();
    }

    if (IS_ART_PAGE) initArtworkPage(); else initGallery();
})();
