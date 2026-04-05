document.addEventListener('DOMContentLoaded', () => {
    // Set Footer Year
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    /* 
     * --- GOOGLE SHEETS INTEGRATION (A.N.T Layer 3 Example) ---
     * In Phase 5, the operator will publish a Google Sheet as CSV.
     * We will drop the URL here.
     * 
    const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-xxxxxx/pub?output=csv";
    
    fetch(sheetURL)
        .then(res => res.text())
        .then(csvText => {
            // Parser logic here to convert CSV into event objects
            // then dynamically generate HTML for #events-grid
        })
        .catch(err => console.error("Could not load events", err));
    */

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
