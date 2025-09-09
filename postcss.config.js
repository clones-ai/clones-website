export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

// Note: PurgeCSS configuration disabled for now as Tailwind CSS v3+ 
// already includes built-in CSS tree-shaking via the 'content' configuration
// in tailwind.config.js. This covers most optimization needs.
// For additional custom CSS purging, consider using a build-specific solution.
