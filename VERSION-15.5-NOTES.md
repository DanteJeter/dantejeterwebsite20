# Version 15.5 — Lead Experience Completion

Version 15.5 preserves the approved Version 15.4 design and working Formspree integration.

## Changes

- Rebuilt `thank-you.html` as a fully branded confirmation page.
- Added a visible five-second countdown and automatic return to `index.html`.
- Added safe manual links to the homepage and current listings.
- Added dynamic confirmation language based on the submitted form type and property.
- Standardized all visible email actions as active `mailto:` links with a prefilled subject and message opening.
- Preserved all four working Formspree forms and the endpoint `https://formspree.io/f/xnjevznr`.
- Updated both submission scripts to use the explicit relative redirect path `./thank-you.html`.

## Deployment reminder

Upload every file in this package, including `thank-you.html`, `styles.css`, `script.js`, `property-showcase.js`, and all asset folders. Vercel must receive the complete repository contents for the confirmation page and styling to load correctly.
