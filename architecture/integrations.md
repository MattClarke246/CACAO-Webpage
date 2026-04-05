# 🔗 CACAO Integrations (Layer 1 Architecture)
> How external pieces plug into the static site.

## 📝 Google Forms Rules
- All forms (Contact, Scholarships, Donation interest) are embedded using standard `<iframe>`.
- Width must be `100%`, and a minimum height (e.g. `800px`) established to prevent double-scrolling if possible.
- When an operator needs to change a form, they simply replace the `src` attribute in the `index.html` file.

## 📅 Google Sheets for Events
- Events are loaded dynamically to avoid constant code changes.
- Operator workflow:
  1. Have a specific Google Sheet formatted: `Date | Title | Description | ImageURL`
  2. Publish Google Sheet to the web as CSV.
  3. The `main.js` script fetches the CSV URL, parses the rows, and renders the Event cards on the page load.
- *For Phase 1, we will hardcode example events or use a placeholder CSV until the operator provides the actual sheet!*

## 🧑‍💻 Operator SOP for Updates
The operators are not engineers.
1. Adding a photo to the gallery: Add it to `/assets/images/` and add an `<img>` tag in `index.html`.
2. Changing the Background: Overwrite `hero-bg.png`.
3. Updating an event: Edit the Google Sheet cell, it updates automatically.
