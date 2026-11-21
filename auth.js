/* =========================================================
   ARTLIBRARY - account pages (register / login / account).
   Talks to the /api/ endpoints on the same origin.
   ========================================================= */

(function () {
    "use strict";

    function showError(el, message) {
        if (!el) return;
        el.textContent = message;
        el.hidden = false;
    }

    function showStatus(el, message, isError) {
        if (!el) return;
        el.textContent = message;
        el.hidden = false;
        el.classList.toggle("is-error", !!isError);
    }

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

    function busyButton(button, busy, label) {
        if (!button) return;
        if (busy) {
            button.dataset.label = button.textContent;
            button.disabled = true;
            button.textContent = label || "Please wait...";
        } else {
            button.disabled = false;
            if (button.dataset.label) button.textContent = button.dataset.label;
        }
    }

    function wireRegister() {
        var form = document.getElementById("register-form");
        if (!form) return;
        var errorEl = document.getElementById("register-error");
        var button = form.querySelector("button[type=submit]");
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            errorEl.hidden = true;
            var payload = {};
            ["name", "username", "email", "password"].forEach(function (f) {
                payload[f] = (form.elements[f].value || "").trim();
            });
            if (payload.password.length < 8) {
                showError(errorEl, "Password must be at least 8 characters.");
                return;
            }
            busyButton(button, true);
            postJson("api/register", payload).then(function (res) {
                if (res.status >= 200 && res.status < 300) {
                    window.location.href = "account.html";
                    return;
                }
                showError(errorEl, res.data.error || "Something went wrong. Please try again.");
                busyButton(button, false);
            }).catch(function () {
                showError(errorEl, "Could not reach the server. Check your connection and try again.");
                busyButton(button, false);
            });
        });
    }

    function wireLogin() {
        var form = document.getElementById("login-form");
        if (!form) return;
        var errorEl = document.getElementById("login-error");
        var button = form.querySelector("button[type=submit]");
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            errorEl.hidden = true;
            var payload = {
                email: (form.elements.email.value || "").trim(),
                password: form.elements.password.value || "",
                remember: !!(form.elements.remember && form.elements.remember.checked),
            };
            busyButton(button, true);
            postJson("api/login", payload).then(function (res) {
                if (res.status >= 200 && res.status < 300) {
                    window.location.href = "index.html#explore";
                    return;
                }
                showError(errorEl, res.data.error || "Something went wrong. Please try again.");
                busyButton(button, false);
            }).catch(function () {
                showError(errorEl, "Could not reach the server. Check your connection and try again.");
                busyButton(button, false);
            });
        });
    }

    /* A failed Google redirect lands back here with ?error=google. */
    function showQueryError(errorId) {
        var errorEl = document.getElementById(errorId);
        if (!errorEl) return;
        var params = new URLSearchParams(window.location.search);
        if (params.get("error") === "google") {
            showError(errorEl, "Google sign-in did not work this time. Please try again or use your email and password.");
        }
    }
    showQueryError("register-error");
    showQueryError("login-error");

    wireRegister();
    wireLogin();

    /* ---------- forgot / reset password page ---------- */
    (function () {
        var forgotForm = document.getElementById("forgot-form");
        if (!forgotForm) return;
        var forgotStep = document.getElementById("forgot-step");
        var resetStep = document.getElementById("reset-step");
        var resetDone = document.getElementById("reset-done");
        var resetForm = document.getElementById("reset-form");
        var email = "";
        forgotForm.addEventListener("submit", function (e) {
            e.preventDefault();
            var errorEl = document.getElementById("forgot-error");
            errorEl.hidden = true;
            email = (forgotForm.elements.email.value || "").trim();
            var button = forgotForm.querySelector("button[type=submit]");
            busyButton(button, true, "Sending...");
            postJson("api/auth/forgot-password", { email: email }).then(function (res) {
                busyButton(button, false);
                if (res.status >= 200 && res.status < 300) {
                    document.getElementById("reset-email").textContent = email;
                    forgotStep.hidden = true;
                    resetStep.hidden = false;
                    return;
                }
                showError(errorEl, res.data.error || "Something went wrong. Please try again.");
            }).catch(function () {
                busyButton(button, false);
                showError(errorEl, "Could not reach the server. Check your connection and try again.");
            });
        });
        resetForm.addEventListener("submit", function (e) {
            e.preventDefault();
            var errorEl = document.getElementById("reset-error");
            errorEl.hidden = true;
            var password = resetForm.elements.password.value || "";
            if (password.length < 8) {
                showError(errorEl, "Password must be at least 8 characters.");
                return;
            }
            var button = resetForm.querySelector("button[type=submit]");
            busyButton(button, true);
            postJson("api/auth/reset-password", {
                email: email,
                code: (resetForm.elements.code.value || "").trim(),
                password: password,
            }).then(function (res) {
                busyButton(button, false);
                if (res.status >= 200 && res.status < 300) {
                    resetStep.hidden = true;
                    resetDone.hidden = false;
                    return;
                }
                showError(errorEl, res.data.error || "Something went wrong. Please try again.");
            }).catch(function () {
                busyButton(button, false);
                showError(errorEl, "Could not reach the server. Check your connection and try again.");
            });
        });
        document.getElementById("forgot-restart").addEventListener("click", function () {
            resetStep.hidden = true;
            forgotStep.hidden = false;
        });
    })();

    /* ---------- confirm email page ---------- */
    var verifyTitle = document.getElementById("verify-title");
    if (verifyTitle) {
        var msg = document.getElementById("verify-message");
        var cont = document.getElementById("verify-continue");
        var token = new URLSearchParams(window.location.search).get("token") || "";
        postJson("api/verify-email", { token: token }).then(function (res) {
            if (res.status === 200) {
                verifyTitle.textContent = "Email confirmed";
                msg.textContent = "Thanks. Your account is ready.";
            } else {
                verifyTitle.textContent = "Link not valid";
                msg.textContent = res.data.error || "This confirmation link is not valid.";
            }
            cont.hidden = false;
        }).catch(function () {
            verifyTitle.textContent = "Something went wrong";
            msg.textContent = "Could not reach the server. Please reload this page.";
        });
    }
})();

/* =========================================================
   Account page: profile, email, password, deactivate/delete.
   ========================================================= */
(function () {
    "use strict";

    var card = document.getElementById("account-card");
    if (!card) return;

    function showError(el, message) {
        if (!el) return;
        el.textContent = message;
        el.hidden = false;
    }

    function showStatus(el, message, isError) {
        if (!el) return;
        el.textContent = message;
        el.hidden = false;
        el.classList.toggle("is-error", !!isError);
    }

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

    function busyButton(button, busy, label) {
        if (!button) return;
        if (busy) {
            button.dataset.label = button.textContent;
            button.disabled = true;
            button.textContent = label || "Please wait...";
        } else {
            button.disabled = false;
            if (button.dataset.label) button.textContent = button.dataset.label;
        }
    }

    var currentUser = null;
    var loading = document.getElementById("account-loading");

    function renderAvatar(avatar, name) {
        var img = document.getElementById("avatar-img");
        var fallback = document.getElementById("avatar-placeholder");
        var remove = document.getElementById("avatar-remove");
        if (avatar) {
            img.src = avatar;
            img.hidden = false;
            fallback.hidden = true;
            remove.hidden = false;
        } else {
            img.hidden = true;
            img.removeAttribute("src");
            fallback.hidden = false;
            fallback.textContent = ((name || "?").trim().charAt(0) || "?").toUpperCase();
            remove.hidden = true;
        }
    }

    /* ---------- resend verification ---------- */
    function wireResend() {
        var btn = document.getElementById("resend-button");
        var status = document.getElementById("resend-status");
        var timer = null;
        function cooldown(seconds) {
            btn.disabled = true;
            var left = seconds;
            btn.textContent = "Resend email (" + left + "s)";
            clearInterval(timer);
            timer = setInterval(function () {
                left -= 1;
                if (left <= 0) {
                    clearInterval(timer);
                    btn.disabled = false;
                    btn.textContent = "Resend email";
                } else {
                    btn.textContent = "Resend email (" + left + "s)";
                }
            }, 1000);
        }
        btn.addEventListener("click", function () {
            btn.disabled = true;
            status.hidden = true;
            postJson("api/resend-verification", {}).then(function (res) {
                status.hidden = false;
                if (res.status >= 200 && res.status < 300) {
                    if (res.data.alreadyVerified) { window.location.reload(); return; }
                    status.textContent = "Sent. Check your inbox (and spam folder).";
                    cooldown(res.data.retryAfter || 60);
                } else {
                    status.textContent = res.data.error || "Could not send the email. Please try again.";
                    if (res.data.retryAfter) cooldown(res.data.retryAfter); else btn.disabled = false;
                }
            }).catch(function () {
                status.hidden = false;
                status.textContent = "Could not reach the server. Check your connection and try again.";
                btn.disabled = false;
            });
        });
    }

    /* ---------- load ---------- */
    fetch("api/me", { credentials: "same-origin" }).then(function (r) {
        if (!r.ok) {
            window.location.href = "login.html";
            return null;
        }
        return r.json();
    }).then(function (data) {
        if (!data || !data.user) return;
        var u = data.user;
        currentUser = u;
        document.getElementById("account-name").textContent = "Hi, " + u.name;
        document.getElementById("account-email").textContent = u.email;
        document.getElementById("account-handle").textContent = "artlibrary.ai/" + u.handle;
        var handleInline = document.getElementById("account-handle-inline");
        if (handleInline) handleInline.textContent = u.handle;
        var portfolioLink = document.getElementById("account-portfolio-link");
        if (portfolioLink) portfolioLink.href = "/" + u.handle;
        var since = (u.created_at || "").slice(0, 10);
        document.getElementById("account-since").textContent = since || "-";
        document.getElementById("account-verified").textContent = u.email_verified ? "Confirmed" : "Not confirmed yet";
        document.getElementById("password-email-addr").textContent = u.email;
        document.getElementById("delete-username").textContent = u.handle;
        document.getElementById("profile-form").elements.name.value = u.name || "";
        document.getElementById("profile-form").elements.bio.value = u.bio || "";
        renderAvatar(u.avatar, u.name);
        if (!u.has_password) {
            document.getElementById("password-heading").textContent = "Add a password";
            document.getElementById("password-intro").textContent = "Your account uses Google sign-in. You can also set a password using a 6-digit code we email to you.";
            document.getElementById("password-open").textContent = "Set a password";
        }
        if (!u.email_verified) {
            document.getElementById("verify-email-addr").textContent = u.email;
            document.getElementById("verify-banner").hidden = false;
            wireResend();
        }
        loading.hidden = true;
        card.hidden = false;
    }).catch(function () {
        loading.textContent = "Could not load your account. Please refresh the page.";
    });

    /* ---------- profile save ---------- */
    var profileForm = document.getElementById("profile-form");
    var pendingAvatar = undefined; // undefined = unchanged, null = remove, string = new data URL
    profileForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var status = document.getElementById("profile-status");
        status.hidden = true;
        var button = profileForm.querySelector("button[type=submit]");
        busyButton(button, true, "Saving...");
        var payload = {
            name: (profileForm.elements.name.value || "").trim(),
            bio: profileForm.elements.bio.value || "",
        };
        if (pendingAvatar !== undefined) payload.avatar = pendingAvatar;
        postJson("api/account/profile", payload).then(function (res) {
            busyButton(button, false);
            if (res.status >= 200 && res.status < 300) {
                pendingAvatar = undefined;
                currentUser.name = res.data.user.name;
                document.getElementById("account-name").textContent = "Hi, " + res.data.user.name;
                renderAvatar(res.data.user.avatar, res.data.user.name);
                showStatus(status, "Saved.", false);
                return;
            }
            showStatus(status, res.data.error || "Could not save. Please try again.", true);
        }).catch(function () {
            busyButton(button, false);
            showStatus(status, "Could not reach the server. Check your connection and try again.", true);
        });
    });

    /* ---------- avatar pick / remove ---------- */
    document.getElementById("avatar-change").addEventListener("click", function () {
        document.getElementById("avatar-input").click();
    });
    document.getElementById("avatar-remove").addEventListener("click", function () {
        pendingAvatar = null;
        renderAvatar(null, currentUser ? currentUser.name : "?");
        showStatus(document.getElementById("profile-status"), "Photo will be removed when you save the profile.", false);
    });
    document.getElementById("avatar-input").addEventListener("change", function (e) {
        var file = e.target.files && e.target.files[0];
        var status = document.getElementById("profile-status");
        if (!file) return;
        if (!/^image\//.test(file.type)) {
            showStatus(status, "Please choose an image file.", true);
            return;
        }
        var reader = new FileReader();
        reader.onload = function () {
            var img = new Image();
            img.onload = function () {
                var size = 256;
                var canvas = document.createElement("canvas");
                canvas.width = size;
                canvas.height = size;
                var ctx = canvas.getContext("2d");
                var side = Math.min(img.width, img.height);
                var sx = (img.width - side) / 2;
                var sy = (img.height - side) / 2;
                ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
                pendingAvatar = canvas.toDataURL("image/jpeg", 0.85);
                renderAvatar(pendingAvatar, currentUser ? currentUser.name : "?");
                showStatus(status, "New photo ready. Press Save profile to keep it.", false);
            };
            img.onerror = function () {
                showStatus(status, "That image could not be read. Try another one.", true);
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    });

    /* ---------- change email ---------- */
    var emailBox = document.getElementById("email-change-box");
    document.getElementById("email-change-open").addEventListener("click", function () {
        emailBox.hidden = !emailBox.hidden;
    });
    document.getElementById("email-request-form").addEventListener("submit", function (e) {
        e.preventDefault();
        var status = document.getElementById("email-status");
        status.hidden = true;
        var form = e.target;
        var button = form.querySelector("button[type=submit]");
        busyButton(button, true, "Sending...");
        postJson("api/account/email/request", { newEmail: (form.elements.newEmail.value || "").trim() }).then(function (res) {
            busyButton(button, false);
            if (res.status >= 200 && res.status < 300) {
                document.getElementById("email-old-addr").textContent = currentUser.email;
                document.getElementById("email-step-1").hidden = true;
                document.getElementById("email-step-2").hidden = false;
                showStatus(status, "Code sent to your current email.", false);
                return;
            }
            showStatus(status, res.data.error || "Could not send the code. Please try again.", true);
        }).catch(function () {
            busyButton(button, false);
            showStatus(status, "Could not reach the server. Check your connection and try again.", true);
        });
    });
    document.getElementById("email-confirm-form").addEventListener("submit", function (e) {
        e.preventDefault();
        var status = document.getElementById("email-status");
        status.hidden = true;
        var form = e.target;
        var button = form.querySelector("button[type=submit]");
        busyButton(button, true);
        postJson("api/account/email/confirm", { code: (form.elements.code.value || "").trim() }).then(function (res) {
            busyButton(button, false);
            if (res.status >= 200 && res.status < 300) {
                showStatus(status, "Email changed to " + res.data.email + ". Reloading...", false);
                setTimeout(function () { window.location.reload(); }, 1200);
                return;
            }
            showStatus(status, res.data.error || "Could not confirm the code. Please try again.", true);
        }).catch(function () {
            busyButton(button, false);
            showStatus(status, "Could not reach the server. Check your connection and try again.", true);
        });
    });

    /* ---------- change / set password ---------- */
    var passwordBox = document.getElementById("password-box");
    document.getElementById("password-open").addEventListener("click", function () {
        passwordBox.hidden = !passwordBox.hidden;
    });
    document.getElementById("password-send").addEventListener("click", function () {
        var status = document.getElementById("password-status");
        status.hidden = true;
        var button = this;
        busyButton(button, true, "Sending...");
        postJson("api/account/password/request", {}).then(function (res) {
            busyButton(button, false);
            if (res.status >= 200 && res.status < 300) {
                document.getElementById("password-step-1").hidden = true;
                document.getElementById("password-step-2").hidden = false;
                showStatus(status, "Code sent. It expires in 15 minutes.", false);
                return;
            }
            showStatus(status, res.data.error || "Could not send the code. Please try again.", true);
        }).catch(function () {
            busyButton(button, false);
            showStatus(status, "Could not reach the server. Check your connection and try again.", true);
        });
    });
    document.getElementById("password-confirm-form").addEventListener("submit", function (e) {
        e.preventDefault();
        var status = document.getElementById("password-status");
        status.hidden = true;
        var form = e.target;
        var password = form.elements.password.value || "";
        if (password.length < 8) {
            showStatus(status, "Password must be at least 8 characters.", true);
            return;
        }
        var button = form.querySelector("button[type=submit]");
        busyButton(button, true);
        postJson("api/account/password/confirm", {
            code: (form.elements.code.value || "").trim(),
            password: password,
        }).then(function (res) {
            busyButton(button, false);
            if (res.status >= 200 && res.status < 300) {
                passwordBox.hidden = true;
                document.getElementById("password-step-1").hidden = false;
                document.getElementById("password-step-2").hidden = true;
                form.reset();
                showStatus(status, "Password updated.", false);
                return;
            }
            showStatus(status, res.data.error || "Could not change the password. Please try again.", true);
        }).catch(function () {
            busyButton(button, false);
            showStatus(status, "Could not reach the server. Check your connection and try again.", true);
        });
    });

    /* ---------- deactivate / delete ---------- */
    var deactivateBox = document.getElementById("deactivate-box");
    var deleteBox = document.getElementById("delete-box");
    document.getElementById("deactivate-open").addEventListener("click", function () {
        deactivateBox.hidden = !deactivateBox.hidden;
        deleteBox.hidden = true;
    });
    document.getElementById("delete-open").addEventListener("click", function () {
        deleteBox.hidden = !deleteBox.hidden;
        deactivateBox.hidden = true;
    });
    document.getElementById("deactivate-form").addEventListener("submit", function (e) {
        e.preventDefault();
        var status = document.getElementById("danger-status");
        status.hidden = true;
        var form = e.target;
        var button = form.querySelector("button[type=submit]");
        busyButton(button, true, "Deactivating...");
        postJson("api/account/deactivate", { period: form.elements.period.value }).then(function (res) {
            if (res.status >= 200 && res.status < 300) {
                window.location.href = "index.html";
                return;
            }
            busyButton(button, false);
            showStatus(status, res.data.error || "Could not deactivate. Please try again.", true);
        }).catch(function () {
            busyButton(button, false);
            showStatus(status, "Could not reach the server. Check your connection and try again.", true);
        });
    });
    document.getElementById("delete-form").addEventListener("submit", function (e) {
        e.preventDefault();
        var status = document.getElementById("danger-status");
        status.hidden = true;
        var form = e.target;
        var handle = currentUser ? currentUser.handle : "";
        if ((form.elements.confirm.value || "").trim().toLowerCase() !== handle.toLowerCase()) {
            showStatus(status, "Type your username exactly to confirm deletion.", true);
            return;
        }
        var button = form.querySelector("button[type=submit]");
        busyButton(button, true, "Deleting...");
        postJson("api/account/delete", { reason: form.elements.reason.value || "" }).then(function (res) {
            if (res.status >= 200 && res.status < 300) {
                window.location.href = "index.html";
                return;
            }
            busyButton(button, false);
            showStatus(status, res.data.error || "Could not delete the account. Please try again.", true);
        }).catch(function () {
            busyButton(button, false);
            showStatus(status, "Could not reach the server. Check your connection and try again.", true);
        });
    });

    /* ---------- saved art ---------- */
    (function () {
        var section = document.getElementById("saved-section");
        var grid = document.getElementById("saved-grid");
        if (!section || !grid) return;
        var items = (window.ARTLIBRARY && window.ARTLIBRARY.items) || [];
        var byId = {};
        items.forEach(function (it) { byId[it.id] = it; });
        fetch("api/my/saves", { credentials: "same-origin" }).then(function (r) {
            return r.ok ? r.json() : null;
        }).then(function (d) {
            if (!d || !d.saves || !d.saves.length) return;
            d.saves.forEach(function (sv) {
                var card = document.createElement("a");
                card.className = "saved-card";
                var img = document.createElement("img");
                img.loading = "lazy";
                var label = document.createElement("span");
                if (sv.id) {
                    card.href = "creation.html?id=" + encodeURIComponent(sv.id);
                    img.src = sv.image; img.alt = sv.title;
                    label.textContent = sv.title;
                } else {
                    var it = byId[sv.static_id];
                    card.href = "art/" + sv.static_id + ".html";
                    img.src = it ? it.image : "";
                    img.alt = it ? it.title : sv.static_id;
                    label.textContent = it ? it.title : sv.static_id;
                }
                card.appendChild(img);
                card.appendChild(label);
                grid.appendChild(card);
            });
            section.hidden = false;
        }).catch(function () { /* signed out or offline: section stays hidden */ });
    })();

    /* ---------- projects: create / rename / delete ---------- */
    (function () {
        var list = document.getElementById("projects-list");
        var createForm = document.getElementById("project-create-form");
        if (!list || !createForm) return;
        var status = document.getElementById("projects-status");

        function renderRow(p) {
            var row = document.createElement("div");
            row.className = "project-row";

            var img = document.createElement("img");
            img.loading = "lazy";
            img.alt = "";
            img.src = p.cover || "logo.png";
            row.appendChild(img);

            var meta = document.createElement("div");
            meta.className = "project-meta";
            var name = document.createElement("strong");
            name.textContent = p.title;
            var count = document.createElement("span");
            count.textContent = p.count === 1 ? "1 work" : (p.count || 0) + " works";
            meta.appendChild(name);
            meta.appendChild(count);
            row.appendChild(meta);

            var actions = document.createElement("div");
            actions.className = "project-actions";

            var renameBtn = document.createElement("button");
            renameBtn.type = "button";
            renameBtn.className = "secondary-button";
            renameBtn.textContent = "Rename";
            renameBtn.addEventListener("click", function () {
                var input = document.createElement("input");
                input.type = "text";
                input.maxLength = 100;
                input.value = p.title;
                input.className = "project-rename";
                var saveBtn = document.createElement("button");
                saveBtn.type = "button";
                saveBtn.className = "primary-button";
                saveBtn.textContent = "Save";
                row.replaceChild(input, meta);
                row.replaceChild(saveBtn, renameBtn);
                input.focus();
                function finish(ok) {
                    row.replaceChild(meta, input);
                    row.replaceChild(renameBtn, saveBtn);
                    if (ok) name.textContent = input.value.trim() || p.title;
                }
                function save() {
                    var title = input.value.trim();
                    if (!title || title === p.title) { finish(false); return; }
                    saveBtn.disabled = true;
                    postJson("api/projects/" + p.id + "/update", { title: title }).then(function (res) {
                        saveBtn.disabled = false;
                        if (res.status >= 200 && res.status < 300) { p.title = title; finish(true); return; }
                        showStatus(status, res.data.error || "Could not rename the project.", true);
                        finish(false);
                    }).catch(function () {
                        saveBtn.disabled = false;
                        showStatus(status, "Could not reach the server. Please try again.", true);
                        finish(false);
                    });
                }
                saveBtn.addEventListener("click", save);
                input.addEventListener("keydown", function (e) {
                    if (e.key === "Enter") { e.preventDefault(); save(); }
                    if (e.key === "Escape") finish(false);
                });
            });

            var delBtn = document.createElement("button");
            delBtn.type = "button";
            delBtn.className = "secondary-button";
            delBtn.textContent = "Delete";
            delBtn.addEventListener("click", function () {
                if (!window.confirm('Delete project "' + p.title + '"? The artworks stay on your portfolio, only the collection is removed.')) return;
                delBtn.disabled = true;
                postJson("api/projects/" + p.id + "/delete", {}).then(function (res) {
                    if (res.status >= 200 && res.status < 300) { row.remove(); checkEmpty(); return; }
                    delBtn.disabled = false;
                    showStatus(status, res.data.error || "Could not delete the project.", true);
                }).catch(function () {
                    delBtn.disabled = false;
                    showStatus(status, "Could not reach the server. Please try again.", true);
                });
            });

            actions.appendChild(renameBtn);
            actions.appendChild(delBtn);
            row.appendChild(actions);
            return row;
        }

        var emptyNote = document.createElement("p");
        emptyNote.className = "projects-empty";
        emptyNote.textContent = "No projects yet. Create one above, then add works to it when you upload.";
        function checkEmpty() {
            if (!list.querySelector(".project-row")) list.appendChild(emptyNote);
            else if (emptyNote.parentNode) emptyNote.remove();
        }

        fetch("api/my/projects", { credentials: "same-origin" }).then(function (r) {
            return r.ok ? r.json() : null;
        }).then(function (d) {
            (d && d.projects ? d.projects : []).forEach(function (p) { list.appendChild(renderRow(p)); });
            checkEmpty();
        }).catch(function () { checkEmpty(); });

        createForm.addEventListener("submit", function (e) {
            e.preventDefault();
            status.hidden = true;
            var title = (createForm.elements.title.value || "").trim();
            if (!title) return;
            var btn = createForm.querySelector("button[type=submit]");
            btn.disabled = true;
            postJson("api/projects", { title: title }).then(function (res) {
                btn.disabled = false;
                if (res.status >= 200 && res.status < 300 && res.data.project) {
                    list.insertBefore(renderRow(res.data.project), list.firstChild);
                    checkEmpty();
                    createForm.reset();
                    return;
                }
                showStatus(status, res.data.error || "Could not create the project.", true);
            }).catch(function () {
                btn.disabled = false;
                showStatus(status, "Could not reach the server. Please try again.", true);
            });
        });
    })();

    /* ---------- sign out ---------- */
    var out = document.getElementById("signout-button");
    out.addEventListener("click", function () {
        out.disabled = true;
        postJson("api/logout", {}).then(function () {
            window.location.href = "index.html";
        }).catch(function () {
            showError(document.getElementById("account-error"), "Could not sign out. Please try again.");
            out.disabled = false;
        });
    });
})();
