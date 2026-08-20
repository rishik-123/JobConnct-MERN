// config.js
// Update this URL with your Render backend URL once deployed
const BACKEND_URL = "https://jobconnct-mern.onrender.com";

// Automatically update all form actions and fetch URLs on the page
document.addEventListener("DOMContentLoaded", () => {
    // Update forms
    document.querySelectorAll("form").forEach(form => {
        let action = form.getAttribute("action");
        if (action && action.startsWith("/")) {
            form.action = BACKEND_URL + action;
        }
    });
});

// Override fetch to automatically prepend backend URL if path starts with '/'
const originalFetch = window.fetch;
window.fetch = function () {
    let [resource, config] = arguments;
    if (typeof resource === "string" && resource.startsWith("/")) {
        resource = BACKEND_URL + resource;
    }
    return originalFetch(resource, config);
};
