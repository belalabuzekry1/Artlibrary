/* =========================================================
   ARTLIBRARY - community pages (upload / portfolio / creation).
   ========================================================= */

(function () {
    "use strict";

    function postJson(path, payload) {
        return fetch(path, {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }).then(function (r) {
            return r.json().catch(function () { return {}; }).then(function (data) {
                return { status: r.status, data: data };
            });
        });
    }

    function showError(el, message) {
        if (!el) return;
        el.textContent = message;
        el.hidden = false;
    }

    /* ---------- upload page ---------- */
    (function () {
        var form = document.getElementById("upload-form");
        if (!form) return;
        var loading = document.getElementById("upload-loading");
        var card = document.getElementById("upload-card");
        var image = null; // {dataUrl, width, height}

        /* AI model: dropdown list + free text */
        var MODEL_OPTIONS = ["Midjourney", "DALL-E / ChatGPT", "Gemini (Nano Banana)", "Stable Diffusion", "Flux", "Ideogram", "Leonardo AI", "Adobe Firefly", "Recraft", "Runway", "Instinct"];
        var combo = document.getElementById("model-combo");
        if (combo) {
            var modelInput = combo.querySelector("input[name=model]");
            var modelToggle = document.getElementById("model-toggle");
            var listbox = document.getElementById("model-listbox");
            var renderModelList = function () {
                var f = (modelInput.value || "").trim().toLowerCase();
                listbox.textContent = "";
                MODEL_OPTIONS.filter(function (m) { return !f || m.toLowerCase().indexOf(f) > -1; }).forEach(function (m) {
                    var b = document.createElement("button");
                    b.type = "button";
                    b.className = "combo-option";
                    b.textContent = m;
                    b.addEventListener("click", function () { modelInput.value = m; listbox.hidden = true; modelInput.focus(); });
                    listbox.appendChild(b);
                });
                if (!listbox.children.length) {
                    var em = document.createElement("div");
                    em.className = "combo-empty";
                    em.textContent = "No match - your custom model name will be used";
                    listbox.appendChild(em);
                }
            };
            modelToggle.addEventListener("click", function (e) { e.preventDefault(); if (listbox.hidden) { renderModelList(); listbox.hidden = false; } else { listbox.hidden = true; } });
            modelInput.addEventListener("focus", function () { renderModelList(); listbox.hidden = false; });
            modelInput.addEventListener("input", function () { renderModelList(); listbox.hidden = false; });
            modelInput.addEventListener("keydown", function (e) {
                if (e.key === "Escape") listbox.hidden = true;
                if (e.key === "Enter") { e.preventDefault(); listbox.hidden = true; }
            });
            document.addEventListener("click", function (e) { if (!combo.contains(e.target)) listbox.hidden = true; });
        }

        /* Tags as chips: Enter or comma adds one */
        var chipsWrap = document.getElementById("tags-chips");
        var tagsField = document.getElementById("tags-field");
        var tagChips = [];
        var renderChips = function () {
            if (!chipsWrap) return;
            Array.prototype.slice.call(chipsWrap.querySelectorAll(".tag-chip")).forEach(function (n) { n.remove(); });
            tagChips.forEach(function (t, i) {
                var chip = document.createElement("span");
                chip.className = "tag-chip";
                chip.appendChild(document.createTextNode(t));
                var x = document.createElement("button");
                x.type = "button";
                x.className = "tag-chip-x";
                x.setAttribute("aria-label", "Remove tag " + t);
                x.textContent = "\u00D7";
                x.addEventListener("click", function () { tagChips.splice(i, 1); renderChips(); });
                chip.appendChild(x);
                chipsWrap.insertBefore(chip, tagsField);
            });
        };
        var addTag = function (raw) {
            var t = (raw || "").trim().replace(/,+$/, "").trim();
            if (t && tagChips.indexOf(t) === -1 && tagChips.length < 10) { tagChips.push(t); renderChips(); }
        };
        if (tagsField) {
            tagsField.addEventListener("keydown", function (e) {
                if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagsField.value); tagsField.value = ""; }
                else if (e.key === "Backspace" && !tagsField.value && tagChips.length) { tagChips.pop(); renderChips(); }
            });
            tagsField.addEventListener("blur", function () { addTag(tagsField.value); tagsField.value = ""; });
        }

        fetch("api/me", { credentials: "same-origin" }).then(function (r) {
            if (!r.ok) { window.location.href = "login.html"; return null; }
            return r.json();
        }).then(function (data) {
            if (!data || !data.user) return;
            if (!data.user.email_verified) {
                loading.textContent = "Confirm your email before uploading. Open your account page to resend the confirmation email.";
                return;
            }
            fetch("api/my/projects", { credentials: "same-origin" }).then(function (r) { return r.ok ? r.json() : {}; }).then(function (p) {
                var select = document.getElementById("upload-project");
                (p.projects || []).forEach(function (proj) {
                    var opt = document.createElement("option");
                    opt.value = proj.id;
                    opt.textContent = proj.title;
                    select.appendChild(opt);
                });
            });
            loading.hidden = true;
            card.hidden = false;
        }).catch(function () {
            loading.textContent = "Could not load. Please refresh the page.";
        });

        document.getElementById("upload-pick").addEventListener("click", function () {
            document.getElementById("upload-input").click();
        });
        document.getElementById("upload-input").addEventListener("change", function (e) {
            var file = e.target.files && e.target.files[0];
            if (!file) return;
            if (!/^image\//.test(file.type)) {
                showError(document.getElementById("upload-error"), "Please choose an image file.");
                return;
            }
            var reader = new FileReader();
            reader.onload = function () {
                var img = new Image();
                img.onload = function () {
                    var maxSide = 2048;
                    var scale = Math.min(1, maxSide / Math.max(img.width, img.height));
                    var w = Math.round(img.width * scale);
                    var h = Math.round(img.height * scale);
                    var canvas = document.createElement("canvas");
                    canvas.width = w;
                    canvas.height = h;
                    canvas.getContext("2d").drawImage(img, 0, 0, w, h);
                    var dataUrl = canvas.toDataURL("image/webp", 0.9);
                    if (!dataUrl || dataUrl.indexOf("data:image/webp") !== 0) {
                        showError(document.getElementById("upload-error"), "Your browser could not convert the image. Try a Chrome-based browser.");
                        return;
                    }
                    image = { dataUrl: dataUrl, width: w, height: h };
                    var preview = document.getElementById("upload-preview");
                    preview.src = dataUrl;
                    preview.hidden = false;
                    document.getElementById("upload-image-note").textContent =
                        "Ready: " + w + "x" + h + ", " + Math.round(dataUrl.length / 1370) + " KB as WebP.";
                };
                img.onerror = function () {
                    showError(document.getElementById("upload-error"), "That image could not be read. Try another one.");
                };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
            e.target.value = "";
        });

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            var errorEl = document.getElementById("upload-error");
            errorEl.hidden = true;
            if (!image) { showError(errorEl, "Choose an image first."); return; }
            if (!form.elements.confirmOwnership.checked) { showError(errorEl, "Please confirm the artwork is yours and made with AI."); return; }
            addTag(tagsField ? tagsField.value : "");
            var tags = tagChips.slice(0, 10);
            var button = form.querySelector("button[type=submit]");
            button.disabled = true;
            button.textContent = "Publishing...";
            postJson("api/artworks", {
                title: (form.elements.title.value || "").trim(),
                prompt: form.elements.prompt.value || "",
                model: (form.elements.model.value || "").trim(),
                tags: tags,
                editableHint: form.elements.editableHint.value || "",
                projectId: form.elements.projectId.value || "",
                confirmOwnership: true,
                image: image.dataUrl,
                width: image.width,
                height: image.height,
            }).then(function (res) {
                if (res.status >= 200 && res.status < 300) {
                    card.hidden = true;
                    document.getElementById("upload-done").hidden = false;
                    document.getElementById("upload-view").href = "creation.html?id=" + res.data.artwork.id;
                    return;
                }
                showError(errorEl, res.data.error || "Could not publish. Please try again.");
                button.disabled = false;
                button.textContent = "Publish artwork";
            }).catch(function () {
                showError(errorEl, "Could not reach the server. Check your connection and try again.");
                button.disabled = false;
                button.textContent = "Publish artwork";
            });
        });

        fetch("api/me", { credentials: "same-origin" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (data) {
            if (data && data.user) {
                var link = document.getElementById("upload-portfolio");
                if (link) link.href = "/" + data.user.handle;
            }
        });
    })();

    /* ---------- portfolio page ---------- */
    (function () {
        var grid = document.getElementById("portfolio-grid");
        if (!grid) return;
        var handle = (window.location.pathname.match(/^\/([a-z0-9_-]{3,24})\/?$/) || [])[1] ||
            new URLSearchParams(window.location.search).get("u") || "";
        fetch("api/u/" + handle, { credentials: "same-origin" }).then(function (r) {
            if (!r.ok) throw new Error("missing");
            return r.json();
        }).then(function (data) {
            var u = data.user;
            // The upload button is only for the owner looking at their own portfolio.
            fetch("api/me", { credentials: "same-origin" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (me) {
                if (me && me.user && me.user.handle.toLowerCase() === u.handle.toLowerCase()) {
                    document.getElementById("portfolio-upload").hidden = false;
                }
            }).catch(function () { /* visitor view */ });
            document.title = u.name + " (" + u.handle + ") | ArtLibrary";
            document.getElementById("portfolio-name").textContent = u.name;
            document.getElementById("portfolio-handle").textContent = "artlibrary.ai/" + u.handle;
            document.getElementById("portfolio-bio").textContent = u.bio || "";
            document.getElementById("portfolio-since").textContent = u.member_since ? "Member since " + u.member_since : "";
            var avatar = document.getElementById("portfolio-avatar");
            var fallback = document.getElementById("portfolio-avatar-fallback");
            if (u.avatar) {
                avatar.src = u.avatar;
                avatar.hidden = false;
                fallback.hidden = true;
            } else {
                fallback.textContent = (u.name.charAt(0) || "?").toUpperCase();
            }
            var projectsWrap = document.getElementById("portfolio-projects");
            (data.projects || []).forEach(function (p) {
                if (!p.artworks.length) return;
                var section = document.createElement("div");
                section.className = "portfolio-project";
                var head = document.createElement("h2");
                head.className = "portfolio-section-title";
                head.textContent = p.title + " (" + p.count + ")";
                section.appendChild(head);
                var pgrid = document.createElement("div");
                pgrid.className = "gallery-grid";
                p.artworks.forEach(function (a) { pgrid.appendChild(artworkCard(a)); });
                section.appendChild(pgrid);
                projectsWrap.appendChild(section);
            });
            (data.artworks || []).forEach(function (a) { grid.appendChild(artworkCard(a)); });
            var hasLoose = (data.artworks || []).length > 0;
            document.getElementById("portfolio-artworks-title").hidden = !hasLoose || !(data.projects || []).some(function (p) { return p.artworks.length; });
            var total = (data.artworks || []).length + (data.projects || []).reduce(function (n, p) { return n + p.artworks.length; }, 0);
            document.getElementById("portfolio-empty").hidden = total > 0;
            document.getElementById("portfolio-loading").hidden = true;
            document.getElementById("portfolio-card").hidden = false;
        }).catch(function () {
            document.getElementById("portfolio-loading").hidden = true;
            document.getElementById("portfolio-missing").hidden = false;
        });

        function artworkCard(a) {
            var link = document.createElement("a");
            link.className = "gallery-card";
            link.href = "creation.html?id=" + a.id;
            var img = document.createElement("img");
            img.src = a.image;
            img.alt = a.title;
            img.loading = "lazy";
            var label = document.createElement("span");
            label.className = "gallery-card-title";
            label.textContent = a.title;
            var stats = document.createElement("span");
            stats.className = "gallery-card-stats";
            var eyeIco = (window.ArtStats && window.ArtStats.EYE_ICON) || "\uD83D\uDC41";
            var saveIco = (window.ArtStats && window.ArtStats.SAVE_ICON) || "\uD83D\uDD16";
            stats.innerHTML = "\u2665 " + (a.likes || 0) + " \u00B7 " + saveIco + " " + (a.saves || 0) + " \u00B7 " + eyeIco + " " + (a.views || 0);
            link.appendChild(img);
            link.appendChild(stats);
            link.appendChild(label);
            return link;
        }
    })();

    /* ---------- creation (artwork detail) page ---------- */
    (function () {
        var card = document.getElementById("creation-card");
        if (!card) return;
        var id = new URLSearchParams(window.location.search).get("id") || "";
        fetch("api/artwork/" + id, { credentials: "same-origin" }).then(function (r) {
            if (!r.ok) throw new Error("missing");
            return r.json();
        }).then(function (data) {
            var a = data.artwork;
            var owner = data.owner;
            document.title = a.title + " | ArtLibrary";
            document.getElementById("creation-image").src = a.image;
            document.getElementById("creation-image").alt = a.title;
            document.getElementById("creation-title").textContent = a.title;
            var ownerLink = document.getElementById("creation-owner");
            ownerLink.textContent = owner.name;
            ownerLink.href = "/" + owner.handle;
            document.getElementById("creation-views").textContent = a.views + (a.views === 1 ? " view" : " views");
            document.getElementById("creation-model").textContent = a.model ? "Made with " + a.model : "";
            var tagsWrap = document.getElementById("creation-tags");
            (a.tags || []).forEach(function (t) {
                var tag = document.createElement("span");
                tag.className = "creation-tag";
                tag.textContent = t;
                tagsWrap.appendChild(tag);
            });
            document.getElementById("creation-prompt").textContent = a.prompt;
            if (window.ArtReactions) {
                var copyBtn = document.getElementById("creation-copy");
                copyBtn.parentNode.insertBefore(window.ArtReactions.build(a.id), copyBtn);
            }
            if (a.editable_hint) {
                document.getElementById("creation-hint").textContent = a.editable_hint;
                document.getElementById("creation-hint-wrap").hidden = false;
            }
            document.getElementById("creation-loading").hidden = true;
            card.hidden = false;
        }).catch(function () {
            document.getElementById("creation-loading").hidden = true;
            document.getElementById("creation-missing").hidden = false;
        });

        document.getElementById("creation-copy").addEventListener("click", function () {
            var text = document.getElementById("creation-prompt").textContent;
            var done = function () { document.getElementById("creation-copied").hidden = false; };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(done, done);
            } else {
                var ta = document.createElement("textarea");
                ta.value = text;
                document.body.appendChild(ta);
                ta.select();
                try { document.execCommand("copy"); } catch (e) { /* noop */ }
                ta.remove();
                done();
            }
        });
    })();
})();
