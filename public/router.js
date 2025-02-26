document.addEventListener("DOMContentLoaded", handleRoute);
window.addEventListener("popstate", handleRoute); // Handle browser back/forward

function handleRoute() {
    const app = document.getElementById("app");
    const path = window.location.pathname;

    if (path === "/" || path === "") {
        // Show home/index content
        window.location.href = "ar-dining-landing/index.html";
    } else {
        import("./main.js")
            .then((module) => {
                console.log("main.js loaded successfully.");
            })
            .catch((err) => console.error("Error loading main.js:", err));
    
    }
}

