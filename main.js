document.addEventListener('DOMContentLoaded', () => {
    // Set Footer Year
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Hamburger Mobile Menu Toggle
    const hamburger = document.getElementById('hamburger');
    const navLinksList = document.getElementById('nav-links');

    if (hamburger && navLinksList) {
        hamburger.addEventListener('click', () => {
            navLinksList.classList.toggle('nav-active');
            hamburger.classList.toggle('toggle');
        });

        // Close menu when a link is clicked
        const navItems = navLinksList.querySelectorAll('a');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navLinksList.classList.remove('nav-active');
                hamburger.classList.remove('toggle');
            });
        });
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

    // Smooth scroll for same-page anchor links only
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // Only intercept pure hash links (#section), not cross-page links (page.html#section)
            if (href.startsWith('#')) {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // =========================================
    // SECURITY: Contact Form Hardening
    // =========================================

    /**
     * Sanitize text input — strips HTML tags to prevent XSS.
     * This is a client-side layer; server-side sanitization is 
     * still required when a backend is connected in Phase 5.
     */
    function sanitizeInput(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Rate-limiting: prevent form spam (1 submission per 30 seconds)
    let lastSubmitTime = 0;
    const RATE_LIMIT_MS = 30000;

    const contactForm = document.getElementById('custom-contact-form');
    if (contactForm) {
        // Inject honeypot field (hidden from real users, catches bots)
        const honeypot = document.createElement('input');
        honeypot.type = 'text';
        honeypot.name = 'website_url';
        honeypot.id = 'hp-field';
        honeypot.tabIndex = -1;
        honeypot.autocomplete = 'off';
        honeypot.style.cssText = 'position:absolute;left:-9999px;opacity:0;height:0;width:0;';
        honeypot.setAttribute('aria-hidden', 'true');
        contactForm.insertBefore(honeypot, contactForm.firstChild);

        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Check honeypot — bots fill hidden fields
            if (honeypot.value) {
                console.warn('Bot submission blocked.');
                return;
            }

            // Rate limit check
            const now = Date.now();
            if (now - lastSubmitTime < RATE_LIMIT_MS) {
                const wait = Math.ceil((RATE_LIMIT_MS - (now - lastSubmitTime)) / 1000);
                alert('Please wait ' + wait + ' seconds before submitting again.');
                return;
            }

            // Sanitize all inputs
            const name = sanitizeInput(document.getElementById('name').value.trim());
            const email = sanitizeInput(document.getElementById('email').value.trim());
            const subject = sanitizeInput(document.getElementById('subject').value.trim());
            const message = sanitizeInput(document.getElementById('message').value.trim());

            // Basic validation
            if (!name || !email || !message) {
                alert('Please fill in all required fields.');
                return;
            }

            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address.');
                return;
            }

            lastSubmitTime = now;

            /*
             * Phase 5: Replace this block with actual form submission logic.
             * Example: fetch('/api/contact', { method: 'POST', body: JSON.stringify({...}) })
             * For now, show a success message.
             */
            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        });
    }
});
