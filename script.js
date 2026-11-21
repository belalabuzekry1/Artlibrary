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
        // Keep the four main destinations within reach on every mobile page.
        var primaryNav = el("nav", "mobile-primary-nav");
        primaryNav.setAttribute("aria-label", "Main destinations");
        [["Explore", "#explore"], ["Categories", "#categories"], ["Models", "#models"], ["Portfolio", "/portfolio"]].forEach(function (item) {
            var label = item[0];
            var target = item[1];
            var link = el("a", "", label);
            var homePage = !IS_ART_PAGE && /(?:\/|\/index\.html)$/.test(window.location.pathname);
            link.href = target.charAt(0) === "#" ? (homePage ? target : BASE + "index.html" + target) : target;
            primaryNav.appendChild(link);
            nav.querySelectorAll("a").forEach(function (existing) {
                if (target.charAt(0) === "#" && existing.getAttribute("href").split("#")[1] === target.slice(1)) {
                    existing.classList.add("primary-menu-link");
                }
            });
        });
        nav.parentNode.appendChild(primaryNav);
        nav.setAttribute("aria-label", "More destinations");
        if (!nav.id) nav.id = "site-menu";
        menuButton.setAttribute("aria-controls", nav.id);
        function setMenuOpen(open) {
            nav.classList.toggle("mobile-open", open);
            menuButton.setAttribute("aria-expanded", String(open));
            menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        }
        setMenuOpen(false);
        menuButton.addEventListener("click", function () {
            setMenuOpen(!nav.classList.contains("mobile-open"));
        });
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") setMenuOpen(false);
        });
        nav.addEventListener("click", function (e) {
            if (e.target.closest("a")) setMenuOpen(false);
        });
        primaryNav.addEventListener("click", function () { setMenuOpen(false); });
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
                if (src) logo.src = src.replace(/logo-light-bg\.png$/, "logo-light.svg").replace(/logo\.png$/, "logo.svg");
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
        var slug = document.body.getAttribute("data-art");
        try {
            if (slug && !sessionStorage.getItem("viewed:" + slug)) {
                sessionStorage.setItem("viewed:" + slug, "1");
                fetch(BASE + "api/track-view", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ page: slug }), keepalive: true }).catch(function () { /* tracking only */ });
            }
        } catch (e) { /* private mode: skip tracking */ }
        var promptBoxEl = document.querySelector(".prompt-box");
        if (promptBoxEl && slug) promptBoxEl.parentNode.insertBefore(buildReactionBar("static:" + slug), promptBoxEl.nextSibling);
        var it = BY_ID[slug];
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
            a._artId = id;
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

        /* Member uploads show up first in Latest Additions, fresh on every load */
        fetch("api/artworks/recent?limit=12").then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
            if (!d || !d.artworks || !d.artworks.length) return;
            var memberLinks = d.artworks.map(function (a) {
                var link = el("a", "latest-image");
                link.href = "creation.html?id=" + encodeURIComponent(a.id);
                link.setAttribute("aria-label", "View " + a.title);
                var img = document.createElement("img");
                img.src = a.image; img.alt = a.title; img.loading = "lazy"; img.decoding = "async";
                link.appendChild(img);
                link.appendChild(thumbStats(a.likes, a.views));
                return link;
            });
            memberLinks.slice().reverse().forEach(function (l) { latestGrid.insertBefore(l, latestGrid.firstChild); });
            latestCards = memberLinks.concat(latestCards);
            renderLatest();
        }).catch(function () { /* static latest stays */ });

        /* Featured = most viewed. Member artworks join the grid; once view data
           arrives, cards with views sort ahead (ties keep the original order). */
        function buildMemberCard(a) {
            var card = el("article", "art-card");
            card.setAttribute("role", "link");
            card.setAttribute("tabindex", "0");
            var imgWrap = el("div", "art-image");
            var img = document.createElement("img");
            img.src = a.image; img.alt = a.title; img.loading = "lazy"; img.decoding = "async";
            imgWrap.appendChild(img);
            var info = el("div", "art-info");
            var row = el("div", "art-title-row");
            row.appendChild(el("h3", null, a.title));
            row.appendChild(el("span", "category", "@" + a.handle));
            info.appendChild(row);
            if (a.model) info.appendChild(el("span", "model", "\u2726 " + a.model));
            info.appendChild(el("p", "prompt-text", a.prompt));
            info.appendChild(cardStats(a.likes, a.saves, a.views));
            var actions = el("div", "card-actions");
            var copy = el("button", "copy-prompt", "\uD83D\uDCCB Copy Prompt");
            copy.type = "button";
            copy.addEventListener("click", function (e) { e.stopPropagation(); copyText(a.prompt, copy); });
            var open = el("a", "customize-link", "View \u2192");
            open.href = "creation.html?id=" + encodeURIComponent(a.id);
            actions.appendChild(copy);
            actions.appendChild(open);
            info.appendChild(actions);
            card.appendChild(imgWrap);
            card.appendChild(info);
            var dest = "creation.html?id=" + encodeURIComponent(a.id);
            card.addEventListener("click", function (e) {
                if (e.target.closest("a, button")) return;
                location.href = dest;
            });
            card.addEventListener("keydown", function (e) {
                if (e.target !== card) return;
                if (e.key === "Enter" || e.key === " ") { e.preventDefault(); location.href = dest; }
            });
            card._it = { id: a.id, title: a.title, category: "@" + a.handle, model: a.model || "", prompt: a.prompt };
            card._text = norm([a.title, a.handle, a.model || "", a.prompt].join(" "));
            card._memberViews = a.views || 0;
            card._memberLikes = a.likes || 0;
            return card;
        }

        fetch("api/featured").then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
            if (!d) return;
            var pageStats = {};
            (d.pages || []).forEach(function (p) { pageStats[p.page] = p; });
            var memberCards = (d.artworks || []).map(buildMemberCard);
            memberCards.slice().reverse().forEach(function (c) { grid.insertBefore(c, grid.firstChild); });
            cards = memberCards.concat(cards);
            cards.forEach(function (c) {
                if (c._memberViews != null) { c._views = c._memberViews; c._likes = c._memberLikes || 0; return; }
                var st = pageStats[c._it.id] || { views: 0, likes: 0, saves: 0 };
                c._views = st.views || 0; c._likes = st.likes || 0;
                var info = c.querySelector(".art-info");
                var acts = c.querySelector(".card-actions");
                if (info && acts) info.insertBefore(cardStats(st.likes, st.saves, st.views), acts);
            });
            latestCards.forEach(function (l) {
                if (l._artId && pageStats[l._artId]) l.appendChild(thumbStats(pageStats[l._artId].likes, pageStats[l._artId].views));
            });
            if (cards.some(function (c) { return c._views > 0 || c._likes > 0; })) {
                cards.slice().sort(function (a, b) { return (b._views - a._views) || (b._likes - a._likes); }).forEach(function (c) { grid.appendChild(c); });
            }
            render();
        }).catch(function () { /* static featured stays */ });

        /* Works the member hid stay out of their explore grid */
        fetch("api/my/hides", { credentials: "same-origin" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
            if (!d || !d.hides) return;
            var hidden = {};
            d.hides.forEach(function (id) { hidden[id] = true; });
            cards.forEach(function (c) { if (hidden[c._it.id] || hidden["static:" + c._it.id]) c._hiddenByMe = true; });
            render();
        }).catch(function () { /* signed out */ });

        function render() {
            var words = norm(searchInput && searchInput.value).split(" ").filter(Boolean);
            var filtersOn = words.length > 0 || state.cat !== "all" || state.model !== "all";
            var catNames = state.cat === "all" ? null : (CATS[state.cat] || []);
            var shown = 0, matched = 0;
            cards.forEach(function (c) {
                var it = c._it;
                var ok = !c._hiddenByMe && words.every(function (w) { return c._text.indexOf(w) > -1; }) &&
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

    /* ---------- shared reaction bar (like / save / hide / report) ---------- */
    var REPORT_REASONS = [
        ["nudity", "Nudity"],
        ["sexual", "Sexual activity"],
        ["racism", "Racism or hate"],
        ["bullying", "Bullying or harassment"],
        ["other", "Something else"],
    ];

    function buildReactionBar(artworkId) {
        var bar = el("div", "reaction-bar");
        var likeBtn = el("button", "reaction-btn");
        var saveBtn = el("button", "reaction-btn");
        var hideBtn = el("button", "reaction-btn");
        var reportBtn = el("button", "reaction-btn reaction-report", "Report");
        [likeBtn, saveBtn, hideBtn, reportBtn].forEach(function (b) { b.type = "button"; bar.appendChild(b); });
        var state = { likes: 0, saves: 0, liked: false, saved: false, hidden: false };
        function paint() {
            likeBtn.textContent = (state.liked ? "\u2665 " : "\u2661 ") + (state.likes > 0 ? state.likes : "Like");
            likeBtn.classList.toggle("is-active", state.liked);
            saveBtn.textContent = state.saved ? "Saved \u2713" : "Save";
            saveBtn.classList.toggle("is-active", state.saved);
            hideBtn.textContent = state.hidden ? "Hidden" : "Hide";
            hideBtn.classList.toggle("is-active", state.hidden);
        }
        paint();
        function post(action, body) {
            return fetch(BASE + "api/artworks/" + artworkId + "/" + action, {
                method: "POST",
                credentials: "same-origin",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body || {}),
            }).then(function (r) {
                if (r.status === 401) { window.location.href = BASE + "login.html"; return null; }
                if (!r.ok) return r.json().then(function (d) { throw new Error((d && d.error) || "Failed"); });
                return r.json();
            });
        }
        likeBtn.addEventListener("click", function () {
            post("like").then(function (d) {
                if (!d) return;
                state.likes += d.active ? 1 : -1;
                state.liked = !!d.active;
                paint();
            }).catch(function () {});
        });
        saveBtn.addEventListener("click", function () {
            post("save").then(function (d) {
                if (!d) return;
                state.saved = !!d.active;
                paint();
            }).catch(function () {});
        });
        hideBtn.addEventListener("click", function () {
            post("hide").then(function (d) {
                if (!d) return;
                state.hidden = !!d.active;
                paint();
            }).catch(function () {});
        });
        reportBtn.addEventListener("click", function () { openReportDialog(); });

        function openReportDialog() {
            var overlay = el("div", "report-overlay");
            var dlg = el("div", "report-dialog");
            dlg.setAttribute("role", "dialog");
            dlg.setAttribute("aria-label", "Report this work");
            dlg.appendChild(el("h3", null, "Report this work"));
            var selected = null;
            var radios = [];
            REPORT_REASONS.forEach(function (r) {
                var lab = el("label", "report-reason");
                var radio = document.createElement("input");
                radio.type = "radio";
                radio.name = "report-reason";
                radio.value = r[0];
                radio.addEventListener("change", function () { selected = r[0]; detailsWrap.hidden = false; });
                radios.push(radio);
                lab.appendChild(radio);
                lab.appendChild(document.createTextNode(" " + r[1]));
                dlg.appendChild(lab);
            });
            var detailsWrap = el("div", null);
            detailsWrap.hidden = true;
            var details = document.createElement("textarea");
            details.rows = 3;
            details.maxLength = 1000;
            details.placeholder = "Tell us more (required for Something else)";
            detailsWrap.appendChild(details);
            dlg.appendChild(detailsWrap);
            var err = el("p", "auth-note report-error");
            err.hidden = true;
            dlg.appendChild(err);
            var actions = el("div", "report-actions");
            var cancel = el("button", "secondary-button", "Cancel");
            cancel.type = "button";
            var send = el("button", "primary-button", "Send report");
            send.type = "button";
            actions.appendChild(cancel);
            actions.appendChild(send);
            dlg.appendChild(actions);
            overlay.appendChild(dlg);
            cancel.addEventListener("click", function () { overlay.remove(); });
            overlay.addEventListener("click", function (e) { if (e.target === overlay) overlay.remove(); });
            send.addEventListener("click", function () {
                if (!selected) { err.textContent = "Choose a reason first."; err.hidden = false; return; }
                if (selected === "other" && !details.value.trim()) { err.textContent = "Please describe the problem."; err.hidden = false; return; }
                send.disabled = true;
                post("report", { reason: selected, details: details.value.trim() }).then(function (d) {
                    if (!d) return;
                    dlg.textContent = "";
                    dlg.appendChild(el("p", "report-thanks", "Thanks - the report was sent and the work stays up while it is reviewed."));
                    setTimeout(function () { overlay.remove(); }, 1600);
                }).catch(function (e2) {
                    err.textContent = e2.message || "Could not send the report.";
                    err.hidden = false;
                    send.disabled = false;
                });
            });
            document.body.appendChild(overlay);
        }

        fetch(BASE + "api/react-state?id=" + encodeURIComponent(artworkId), { credentials: "same-origin" })
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (d) {
                if (!d) return;
                state.likes = d.likes || 0;
                state.saves = d.saves || 0;
                if (d.my) { state.liked = !!d.my.liked; state.saved = !!d.my.saved; state.hidden = !!d.my.hidden; }
                paint();
            }).catch(function () {});
        return bar;
    }

    var EYE_ICON = '<svg class="stat-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12 C6 8, 9 6, 12 6 C15 6, 18 8, 21 12 C18 16, 15 18, 12 18 C9 18, 6 16, 3 12 Z"/><circle cx="12" cy="12" r="2.6" class="stat-ico-dot"/></svg>';
    var SAVE_ICON = '<svg class="stat-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4 h10 v15.5 L12 16 L7 19.5 Z"/></svg>';
    function cardStats(likes, saves, views) {
        var row = el("div", "card-stats");
        row.appendChild(el("span", "stat stat-likes", "\u2665 " + (likes || 0)));
        var sv = el("span", "stat stat-saves");
        sv.innerHTML = SAVE_ICON + " " + (saves || 0);
        var vw = el("span", "stat stat-views");
        vw.innerHTML = EYE_ICON + " " + (views || 0);
        row.appendChild(sv);
        row.appendChild(vw);
        return row;
    }
    function thumbStats(likes, views) {
        var t = el("span", "latest-stats");
        t.innerHTML = "\u2665 " + (likes || 0) + " \u00B7 " + EYE_ICON + " " + (views || 0);
        return t;
    }
    window.ArtReactions = { build: buildReactionBar };
    window.ArtStats = { row: cardStats, thumb: thumbStats, EYE_ICON: EYE_ICON, SAVE_ICON: SAVE_ICON };

    if (IS_ART_PAGE) initArtworkPage(); else initGallery();
})();

/* =========================================================
   AUTH ENTRY IN NAV
   Adds "Sign in" to the shared nav and swaps it to the
   member's account link when a session exists.
   ========================================================= */
(function () {
    "use strict";
    try {
        var nav = document.querySelector(".desktop-nav");
        if (!nav || !window.fetch) return;
        if (!document.getElementById("auth-nav-styles")) {
            var navStyles = document.createElement("style");
            navStyles.id = "auth-nav-styles";
            navStyles.textContent = [
                ".desktop-nav a.auth-nav-link { display: inline-flex; align-items: center; justify-content: center; min-height: 40px; padding: 10px 18px; border-radius: 999px; color: #fff; background: var(--gradient); box-shadow: 0 7px 22px rgba(192, 83, 43, 0.30); font-weight: 650; text-decoration: none; white-space: nowrap; transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease; }",
                ".desktop-nav a.auth-nav-link:hover { color: #fff; transform: translateY(-2px); filter: brightness(1.06); box-shadow: 0 10px 28px rgba(192, 83, 43, 0.38); }",
                ".desktop-nav a.auth-nav-link:focus-visible { outline: 3px solid rgba(192, 83, 43, 0.55); outline-offset: 3px; }",
                "body[data-theme=light] .desktop-nav a.auth-nav-link, body[data-theme=light] .desktop-nav a.auth-nav-link:hover { color: #fff; }",
                "@media (max-width: 760px) {",
                "  .desktop-nav.mobile-open a.auth-nav-link { display: flex; justify-content: center; min-height: 46px; margin-top: 6px; padding: 13px 16px; color: #fff; }",
                "  .desktop-nav.mobile-open a.auth-nav-link:hover { color: #fff; background: var(--gradient); filter: brightness(1.06); }",
                "  body[data-theme=light] .desktop-nav.mobile-open a.auth-nav-link, body[data-theme=light] .desktop-nav.mobile-open a.auth-nav-link:hover { color: #fff; }",
                "}"
            ].join("\n");
            document.head.appendChild(navStyles);
        }
        var base = document.body.getAttribute("data-art") ? "../" : "";
        var link = document.createElement("a");
        link.href = base + "login.html";
        link.textContent = "Sign in";
        link.className = "auth-nav-link";
        nav.appendChild(link);
        var adminLink = document.createElement("a");
        adminLink.href = base + "admin.html";
        adminLink.textContent = "Admin";
        adminLink.className = "admin-nav-link";
        adminLink.hidden = true;
        nav.appendChild(adminLink);
        adminLink.addEventListener("click", function () { nav.classList.remove("mobile-open"); });
        fetch(base + "api/me", { credentials: "same-origin" }).then(function (r) {
            return r.ok ? r.json() : null;
        }).then(function (data) {
            if (!data || !data.user) return;
            link.href = base + "account.html";
            link.classList.remove("auth-nav-link");
            link.classList.add("account-nav-link");
            var first = (data.user.name || "").split(" ")[0];
            link.textContent = first || "Account";
            if (data.user.is_admin === true) adminLink.hidden = false;

            /* notifications bell with unread badge */
            var bell = document.createElement("button");
            bell.type = "button";
            bell.className = "notif-bell";
            bell.setAttribute("aria-label", "Notifications");
            bell.innerHTML = '<svg class="notif-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9 a6 6 0 0 1 12 0 c0 5 2 6.5 2 6.5 H4 c0 0 2 -1.5 2 -6.5 Z"/><path d="M10 19 a2 2 0 0 0 4 0"/></svg>';
            var badge = document.createElement("span");
            badge.className = "notif-badge";
            badge.hidden = true;
            bell.appendChild(badge);
            nav.insertBefore(bell, link);
            var panel = null;
            function timeAgo(iso) {
                var secs = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
                if (secs < 60) return "just now";
                var mins = Math.floor(secs / 60);
                if (mins < 60) return mins + "m ago";
                var hrs = Math.floor(mins / 60);
                if (hrs < 24) return hrs + "h ago";
                return Math.floor(hrs / 24) + "d ago";
            }
            function refreshBadge() {
                fetch(base + "api/notifications", { credentials: "same-origin" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
                    if (!d) return;
                    if (d.unread > 0) { badge.textContent = d.unread > 9 ? "9+" : String(d.unread); badge.hidden = false; }
                    else badge.hidden = true;
                }).catch(function () { /* offline */ });
            }
            function closePanel() { if (panel) { panel.remove(); panel = null; } }
            function openPanel() {
                panel = document.createElement("div");
                panel.className = "notif-panel";
                panel.setAttribute("role", "dialog");
                panel.setAttribute("aria-label", "Notifications");
                var head = document.createElement("div");
                head.className = "notif-head";
                head.textContent = "Notifications";
                panel.appendChild(head);
                var list = document.createElement("div");
                list.className = "notif-list";
                list.textContent = "Loading\u2026";
                panel.appendChild(list);
                document.body.appendChild(panel);
                fetch(base + "api/notifications", { credentials: "same-origin" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
                    list.textContent = "";
                    if (!d || !d.notifications || !d.notifications.length) {
                        var empty = document.createElement("p");
                        empty.className = "notif-empty";
                        empty.textContent = "No activity yet. When someone likes or saves your art, it shows up here.";
                        list.appendChild(empty);
                        return;
                    }
                    d.notifications.forEach(function (n) {
                        var item = document.createElement("a");
                        item.className = "notif-item" + (n.read_at ? "" : " is-unread");
                        item.href = base + "creation.html?id=" + encodeURIComponent(n.artwork_id);
                        var who = n.actor_name || ("@" + (n.actor_handle || "someone"));
                        var what = n.kind === "like" ? "liked" : "saved";
                        var txt = document.createElement("span");
                        txt.className = "notif-text";
                        txt.textContent = who + " " + what + " \u201C" + (n.title || "your art") + "\u201D";
                        var tm = document.createElement("span");
                        tm.className = "notif-time";
                        tm.textContent = timeAgo(n.created_at);
                        item.appendChild(txt);
                        item.appendChild(tm);
                        list.appendChild(item);
                    });
                    if (d.unread > 0) {
                        fetch(base + "api/notifications/read", { method: "POST", credentials: "same-origin" }).then(function () { badge.hidden = true; }).catch(function () { /* keep badge */ });
                    }
                }).catch(function () { list.textContent = "Could not load notifications."; });
            }
            bell.addEventListener("click", function (e) {
                e.stopPropagation();
                if (panel) closePanel(); else openPanel();
            });
            document.addEventListener("click", function (e) {
                if (panel && !panel.contains(e.target) && e.target !== bell) closePanel();
            });
            document.addEventListener("keydown", function (e) { if (e.key === "Escape") closePanel(); });
            refreshBadge();
            setInterval(refreshBadge, 60000);
        }).catch(function () { /* no backend: keep the plain link */ });
    } catch (e) { /* nav auth entry is optional */ }
})();
