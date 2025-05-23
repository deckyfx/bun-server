import frontend from "./frontend/index.html";

const PORT = process.env.PORT || 3000;

Bun.serve({
  port: Number(PORT),
  // development can also be an object.

  development: {
    // Enable Hot Module Reloading
    hmr: true,

    // Echo console logs from the browser to the terminal
    console: true,
  },

  // `routes` requires Bun v1.2.3+
  routes: {
    "/": frontend,
  },

  // (optional) fallback for unmatched routes:
  // Required if Bun's version < 1.2.3
  fetch(req) {
    return new Response("Not Found", { status: 404 });
  },
});
console.log("Server running at 3000");
