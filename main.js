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

    // ----- Cultural Memories slideshow (rotates every 3 seconds) -----
    (function initGallerySlideshow() {
        const root = document.querySelector('[data-gallery-slideshow]');
        if (!root) return;

        const slides = Array.from(root.querySelectorAll('.gallery-slide'));
        if (slides.length <= 1) return;

        let idx = slides.findIndex((s) => s.classList.contains('is-active'));
        if (idx < 0) idx = 0;

        function show(nextIndex) {
            slides.forEach((slide, i) => {
                slide.classList.toggle('is-active', i === nextIndex);
            });
        }

        setInterval(() => {
            idx = (idx + 1) % slides.length;
            show(idx);
        }, 3000);
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

        contactForm.addEventListener('submit', async function (e) {
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

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.textContent : 'Send Message';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending...';
            }

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, email, subject, message })
                });

                const payload = await response.json().catch(() => ({}));

                if (!response.ok) {
                    throw new Error(payload.error || 'Unable to send your message right now.');
                }

                const successView = document.getElementById('contact-success');
                if (successView) {
                    contactForm.style.display = 'none';
                    successView.style.display = 'block';
                } else {
                    alert('Thank you for your message! We will get back to you soon.');
                }
                contactForm.reset();
            } catch (err) {
                const msg = err && err.message ? err.message : 'Unable to send your message right now.';
                alert(msg + ' Please try again in a moment.');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }
            }
        });
    }

    // =========================================
    // PARADE REGISTRATION MODAL
    // =========================================
    const paradeModal = document.getElementById('parade-modal');
    const openParadeBtn = document.getElementById('open-parade-modal');
    const closeParadeBtn = document.getElementById('close-parade-modal');
    const paradeForm = document.getElementById('parade-registration-form');
    const groupFields = document.getElementById('group-fields');

    function openParadeModal() {
        if (!paradeModal) return;
        paradeModal.classList.add('is-open');
        paradeModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeParadeModal() {
        if (!paradeModal) return;
        paradeModal.classList.remove('is-open');
        paradeModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        
        // Reset form and UI state after closing animation
        setTimeout(() => {
            if (paradeForm) {
                paradeForm.reset();
                paradeForm.style.display = 'block';
            }
            const successView = document.getElementById('parade-success');
            if (successView) successView.style.display = 'none';
            if (groupFields) groupFields.style.display = 'none';
        }, 300);
    }

    if (openParadeBtn) {
        openParadeBtn.addEventListener('click', openParadeModal);
    }

    if (closeParadeBtn) {
        closeParadeBtn.addEventListener('click', closeParadeModal);
    }

    const closeSuccessBtn = document.getElementById('close-success-btn');
    if (closeSuccessBtn) {
        closeSuccessBtn.addEventListener('click', closeParadeModal);
    }

    // Close on overlay click (not modal body)
    if (paradeModal) {
        paradeModal.addEventListener('click', function (e) {
            if (e.target === paradeModal) closeParadeModal();
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && paradeModal && paradeModal.classList.contains('is-open')) {
            closeParadeModal();
        }
    });

    // Toggle group fields based on radio selection
    if (paradeForm && groupFields) {
        const radios = paradeForm.querySelectorAll('input[name="registrationType"]');
        radios.forEach(function (radio) {
            radio.addEventListener('change', function () {
                if (this.value === 'group') {
                    groupFields.style.display = 'block';
                    document.getElementById('parade-org-name').required = true;
                } else {
                    groupFields.style.display = 'none';
                    document.getElementById('parade-org-name').required = false;
                }
            });
        });
    }

    // Auto-open modal if coming from membership page with #open-parade
    if (window.location.hash === '#open-parade' && paradeModal) {
        setTimeout(openParadeModal, 400);
    }

    // Parade form submission
    let paradeLastSubmitTime = 0;
    if (paradeForm) {
        paradeForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const now = Date.now();
            if (now - paradeLastSubmitTime < RATE_LIMIT_MS) {
                const wait = Math.ceil((RATE_LIMIT_MS - (now - paradeLastSubmitTime)) / 1000);
                alert('Please wait ' + wait + ' seconds before submitting again.');
                return;
            }

            const firstName = sanitizeInput(document.getElementById('parade-first-name').value.trim());
            const lastName = sanitizeInput(document.getElementById('parade-last-name').value.trim());
            const email = sanitizeInput(document.getElementById('parade-email').value.trim());
            const phone = sanitizeInput(document.getElementById('parade-phone').value.trim());
            const registrationType = paradeForm.querySelector('input[name="registrationType"]:checked').value;
            const orgName = sanitizeInput((document.getElementById('parade-org-name').value || '').trim());
            const groupSize = sanitizeInput((document.getElementById('parade-group-size').value || '').trim());

            if (!firstName || !lastName || !email || !phone) {
                alert('Please fill in all required fields.');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address.');
                return;
            }

            if (registrationType === 'group' && !orgName) {
                alert('Please enter your organization or band name.');
                return;
            }

            paradeLastSubmitTime = now;

            const submitBtn = document.getElementById('parade-submit-btn');
            const originalText = submitBtn ? submitBtn.textContent : 'Submit Registration';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Submitting...';
            }

            try {
                const response = await fetch('/api/parade-registration', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ firstName, lastName, email, phone, registrationType, orgName, groupSize })
                });

                const payload = await response.json().catch(() => ({}));

                if (!response.ok) {
                    throw new Error(payload.error || 'Unable to submit registration right now.');
                }

                // Show success state
                paradeForm.style.display = 'none';
                document.getElementById('parade-success').style.display = 'block';
            } catch (err) {
                const msg = err && err.message ? err.message : 'Unable to submit registration right now.';
                alert(msg + ' Please try again in a moment.');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            }
        });
    }

    // =========================================
    // MEMBERSHIP MODAL
    // =========================================
    const membershipModal = document.getElementById('membership-modal');
    const openMembershipBtn = document.getElementById('open-membership-modal');
    const closeMembershipBtns = [
        document.getElementById('close-membership-modal'),
        document.getElementById('close-member-success-btn')
    ];
    const membershipForm = document.getElementById('membership-registration-form');
    const membershipFormView = document.getElementById('membership-form-view');
    const membershipSuccessView = document.getElementById('membership-success');

    function openMembershipModal() {
        if (!membershipModal) return;
        membershipModal.classList.add('is-open');
        membershipModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeMembershipModal() {
        if (!membershipModal) return;
        membershipModal.classList.remove('is-open');
        membershipModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        
        setTimeout(() => {
            if (membershipForm) membershipForm.reset();
            if (membershipFormView) membershipFormView.style.display = 'block';
            if (membershipSuccessView) membershipSuccessView.style.display = 'none';
        }, 300);
    }

    if (openMembershipBtn) {
        openMembershipBtn.addEventListener('click', openMembershipModal);
    }

    closeMembershipBtns.forEach(btn => {
        if (btn) btn.addEventListener('click', closeMembershipModal);
    });

    if (membershipModal) {
        membershipModal.addEventListener('click', function (e) {
            if (e.target === membershipModal) closeMembershipModal();
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && membershipModal && membershipModal.classList.contains('is-open')) {
            closeMembershipModal();
        }
    });

    let membershipLastSubmitTime = 0;
    if (membershipForm) {
        membershipForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const now = Date.now();
            if (now - membershipLastSubmitTime < RATE_LIMIT_MS) {
                const wait = Math.ceil((RATE_LIMIT_MS - (now - membershipLastSubmitTime)) / 1000);
                alert('Please wait ' + wait + ' seconds before submitting again.');
                return;
            }

            const firstName = sanitizeInput(document.getElementById('member-first-name').value.trim());
            const lastName = sanitizeInput(document.getElementById('member-last-name').value.trim());
            const email = sanitizeInput(document.getElementById('member-email').value.trim());
            const phone = sanitizeInput(document.getElementById('member-phone').value.trim());
            const planEl = document.getElementById('member-plan');
            const membershipPlan = sanitizeInput(planEl.options[planEl.selectedIndex].value);

            if (!firstName || !lastName || !email || !phone || !membershipPlan) {
                alert('Please fill in all required fields.');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address.');
                return;
            }

            membershipLastSubmitTime = now;

            const submitBtn = document.getElementById('member-submit-btn');
            const originalText = submitBtn ? submitBtn.textContent : 'Submit Application';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Submitting...';
            }

            try {
                const response = await fetch('/api/membership-registration', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ firstName, lastName, email, phone, membershipPlan })
                });

                const payload = await response.json().catch(() => ({}));

                if (!response.ok) {
                    throw new Error(payload.error || 'Unable to submit application right now.');
                }

                // Show success state
                if (membershipFormView) membershipFormView.style.display = 'none';
                if (membershipSuccessView) membershipSuccessView.style.display = 'block';
            } catch (err) {
                const msg = err && err.message ? err.message : 'Unable to submit application right now.';
                alert(msg + ' Please try again in a moment.');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            }
        });
    }

    // =========================================
    // Back to Top Button
    // =========================================
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // =========================================
    // Animated Stat Counters
    // =========================================
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    if (statNumbers.length > 0) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.getAttribute('data-target'), 10);
                    const duration = 2000;
                    const stepTime = Math.max(Math.floor(duration / target), 10);
                    let current = 0;
                    
                    const isPercentage = el.getAttribute('data-target') === '100'; // Specific to the 100%
                    
                    const timer = setInterval(() => {
                        current += Math.ceil(target / (duration / stepTime));
                        if (current >= target) {
                            current = target;
                            clearInterval(timer);
                        }
                        el.textContent = current + (isPercentage ? '%' : '');
                    }, stepTime);
                    obs.unobserve(el);
                }
            });
        }, { threshold: 0.5 });
        
        statNumbers.forEach(num => observer.observe(num));
    }
});
