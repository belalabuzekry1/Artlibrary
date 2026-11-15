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

    function wireForm(formId, errorId, path, fields) {
        var form = document.getElementById(formId);
        if (!form) return;
        var errorEl = document.getElementById(errorId);
        var button = form.querySelector("button[type=submit]");
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            errorEl.hidden = true;
            var payload = {};
            fields.forEach(function (f) {
                payload[f] = (form.elements[f].value || "").trim();
            });
            if (payload.password !== undefined && payload.password.length < 8) {
                showError(errorEl, "Password must be at least 8 characters.");
                return;
            }
            button.disabled = true;
            var original = button.textContent;
            button.textContent = "Please wait...";
            postJson(path, payload).then(function (res) {
                if (res.status >= 200 && res.status < 300) {
                    window.location.href = "account.html";
                    return;
                }
                showError(errorEl, res.data.error || "Something went wrong. Please try again.");
                button.disabled = false;
                button.textContent = original;
            }).catch(function () {
                showError(errorEl, "Could not reach the server. Check your connection and try again.");
                button.disabled = false;
                button.textContent = original;
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

    wireForm("register-form", "register-error", "api/register", ["name", "username", "email", "password"]);
    wireForm("login-form", "login-error", "api/login", ["email", "password"]);

    /* ---------- account page ---------- */
    var card = document.getElementById("account-card");
    if (card) {
        var loading = document.getElementById("account-loading");
        fetch("api/me", { credentials: "same-origin" }).then(function (r) {
            if (!r.ok) {
                window.location.href = "login.html";
                return null;
            }
            return r.json();
        }).then(function (data) {
            if (!data || !data.user) return;
            var u = data.user;
            document.getElementById("account-name").textContent = "Hi, " + u.name;
            document.getElementById("account-email").textContent = u.email;
            document.getElementById("account-handle").textContent = "artlibrary.ai/" + u.handle + " (coming soon)";
            var since = (u.created_at || "").slice(0, 10);
            document.getElementById("account-since").textContent = since || "-";
            loading.hidden = true;
            card.hidden = false;
        }).catch(function () {
            loading.textContent = "Could not load your account. Please refresh the page.";
        });

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
    }
})();
