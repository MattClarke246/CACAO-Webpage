document.addEventListener('DOMContentLoaded', () => {
    // ----- Festival countdown (June 6, 2026, 11:00 AM – 9:00 PM Central) -----
    (function initFestivalCountdown() {
        const roots = document.querySelectorAll('[data-festival-countdown]');
        if (!roots.length) return;

        // 11:00 AM CDT → 16:00 UTC; 9:00 PM CDT June 6 → 02:00 UTC June 7
        const FESTIVAL_START = new Date('2026-06-06T16:00:00Z');
        const FESTIVAL_END = new Date('2026-06-07T02:00:00Z');

        function pad2(n) {
            return String(Math.max(0, n)).padStart(2, '0');
        }

        function render() {
            const now = new Date();
            roots.forEach((root) => {
                const units = root.querySelector('.countdown-units');
                const sub = root.querySelector('.festival-countdown-sub');
                const liveMsg = root.querySelector('[data-cd-live]');
                const endedMsg = root.querySelector('[data-cd-ended]');

                const heading = root.querySelector('.festival-countdown-heading');

                if (now >= FESTIVAL_END) {
                    if (units) units.hidden = true;
                    if (sub) sub.hidden = true;
                    if (liveMsg) liveMsg.hidden = true;
                    if (endedMsg) endedMsg.hidden = false;
                    if (heading) heading.hidden = true;
                    root.classList.add('countdown--ended');
                    return;
                }

                if (now >= FESTIVAL_START) {
                    if (units) units.hidden = true;
                    if (sub) sub.hidden = true;
                    if (liveMsg) liveMsg.hidden = false;
                    if (endedMsg) endedMsg.hidden = true;
                    if (heading) heading.hidden = true;
                    root.classList.add('countdown--live');
                    return;
                }

                if (units) units.hidden = false;
                if (sub) sub.hidden = false;
                if (liveMsg) liveMsg.hidden = true;
                if (endedMsg) endedMsg.hidden = true;
                if (heading) heading.hidden = false;
                root.classList.remove('countdown--live', 'countdown--ended');

                let ms = FESTIVAL_START - now;
                const sec = Math.floor(ms / 1000) % 60;
                const min = Math.floor(ms / 60000) % 60;
                const hr = Math.floor(ms / 3600000) % 24;
                const day = Math.floor(ms / 86400000);

                const dEl = root.querySelector('[data-cd-days]');
                const hEl = root.querySelector('[data-cd-hours]');
                const mEl = root.querySelector('[data-cd-minutes]');
                const sEl = root.querySelector('[data-cd-seconds]');
                if (dEl) dEl.textContent = String(day);
                if (hEl) hEl.textContent = pad2(hr);
                if (mEl) mEl.textContent = pad2(min);
                if (sEl) sEl.textContent = pad2(sec);
            });
        }

        render();
        setInterval(render, 1000);
    })();

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

            // Persist sanitized values before submit so the email body is clean.
            document.getElementById('name').value = name;
            document.getElementById('email').value = email;
            document.getElementById('subject').value = subject;
            document.getElementById('message').value = message;

            lastSubmitTime = now;

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending...';
            }

            // Submit to FormSubmit endpoint (configured in index.html form action).
            contactForm.submit();
        });
    }
});
