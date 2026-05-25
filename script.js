/**
 * ARCHITECTURE WEB ADVANCED - INTERACTIVE CONTROL SCRIPT
 * MARRIOTT PORT-AU-PRINCE
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. LOADING SCREEN CONTROLLER
       ========================================================================== */
    const preloader = document.getElementById('loading-screen');
    if (preloader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.style.opacity = '0';
                setTimeout(() => preloader.remove(), 600);
            }, 400); 
        });
    }

    /* ==========================================================================
       2. TYPING EFFECT ENGINE
       ========================================================================== */
    const typeElements = document.querySelectorAll('.typing-effect');
    typeElements.forEach(el => {
        const strings = JSON.parse(el.getAttribute('data-strings'));
        let stringIdx = 0; let charIdx = 0; let isDeleting = false;

        function type() {
            const currentString = strings[stringIdx];
            if (isDeleting) {
                el.textContent = currentString.substring(0, charIdx - 1);
                charIdx--;
            } else {
                el.textContent = currentString.substring(0, charIdx + 1);
                charIdx++;
            }

            let typeSpeed = isDeleting ? 40 : 80;

            if (!isDeleting && charIdx === currentString.length) {
                typeSpeed = 1800; 
                isDeleting = true;
            } else if (isDeleting && charIdx === 0) {
                isDeleting = false;
                stringIdx = (stringIdx + 1) % strings.length;
                typeSpeed = 400; 
            }
            setTimeout(type, typeSpeed);
        }
        type();
    });

    /* ==========================================================================
       3. SCROLL AMBIANCE NAVBAR & RETOUR EN HAUT BUTTON
       ========================================================================== */
    const navbar = document.querySelector('.navbar');
    const backToTopBtn = document.getElementById('backToTopBtn');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        if (window.scrollY > 400) {
            if (backToTopBtn) backToTopBtn.style.display = 'flex';
        } else {
            if (backToTopBtn) backToTopBtn.style.display = 'none';
        }
    });

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ==========================================================================
       4. LIGHT/DARK MODE TOGGLE (Blanc vs Noir)
       ========================================================================== */
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        if (localStorage.getItem('theme') === 'light') {
            document.body.classList.add('light-mode');
            themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
        }

        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            if (document.body.classList.contains('light-mode')) {
                localStorage.setItem('theme', 'light');
                themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
                showToast('Mode Clair activé', 'info');
            } else {
                localStorage.setItem('theme', 'dark');
                themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
                showToast('Mode Sombre activé', 'info');
            }
        });
    }

    /* ==========================================================================
       5. INTERSECTION OBSERVER FOR COUNTERS & SCROLL ANIMATIONS
       ========================================================================== */
    const animElements = document.querySelectorAll('.scroll-animate');
    const animObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });
    animElements.forEach(el => animObserver.observe(el));

    const counters = document.querySelectorAll('.counter');
    const countObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                let current = 0;
                const increment = target / 40; 
                const updateCount = () => {
                    current += increment;
                    if (current < target) {
                        entry.target.textContent = Math.ceil(current);
                        setTimeout(updateCount, 25);
                    } else {
                        entry.target.textContent = target;
                    }
                };
                updateCount();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(c => countObserver.observe(c));

    /* ==========================================================================
       6. CUSTOM TOAST NOTIFICATION ENGINE
       ========================================================================== */
    const toastContainer = document.getElementById('toast-container');
    function showToast(message, type = 'success') {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'danger' ? 'danger' : 'dark'} border-0 show mb-2`;
        toast.role = 'alert';
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body small fw-bold"><i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'} me-2"></i>${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }

    /* ==========================================================================
       7. CORE PERSISTENCE BOOKING ENGINE & DASHBOARD LOGIC
       ========================================================================== */
    let savedReservations = JSON.parse(localStorage.getItem('marriott_bookings')) || [];
    const bookingForm = document.getElementById('advancedBookingForm');
    const checkIn = document.getElementById('checkInDate');
    const checkOut = document.getElementById('checkOutDate');
    const roomType = document.getElementById('roomTypeSelect');
    const livePriceContainer = document.getElementById('livePriceContainer');
    const livePriceValue = document.getElementById('livePriceValue');

    if (checkIn) {
        checkIn.min = new Date().toISOString().split('T')[0];
        checkIn.addEventListener('change', () => {
            checkOut.min = checkIn.value;
            triggerLivePriceCalcul();
        });
        checkOut.addEventListener('change', triggerLivePriceCalcul);
        roomType.addEventListener('change', triggerLivePriceCalcul);
    }

    function triggerLivePriceCalcul() {
        if (checkIn.value && checkOut.value) {
            const days = (new Date(checkOut.value) - new Date(checkIn.value)) / (1000 * 60 * 60 * 24);
            if (days > 0) {
                livePriceValue.textContent = days * parseInt(roomType.value);
                livePriceContainer.style.display = 'block';
                return;
            }
        }
        livePriceContainer.style.display = 'none';
    }

    function updateDashboardUI() {
        const grid = document.getElementById('dashboardGridBody');
        if (!grid) return;

        if (savedReservations.length === 0) {
            grid.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-3 small">Aucune réservation active détectée.</td></tr>`;
        } else {
            grid.innerHTML = savedReservations.map((res, index) => {
                return `
                    <tr>
                        <td class="fw-bold small">${res.name}</td>
                        <td><code class="text-gold bg-transparent">${res.in}</code></td>
                        <td><code class="text-gold bg-transparent">${res.out}</code></td>
                        <td>${res.nights}</td>
                        <td class="text-success fw-bold">${res.totalPrice}$</td>
                        <td><button class="btn btn-sm btn-outline-danger py-0 px-2" onclick="deleteBooking(${index})"><i class="fas fa-trash-alt"></i></button></td>
                    </tr>
                `;
            }).join('');
        }
        calculateMetrics();
    }

    function calculateMetrics() {
        const totalB = document.getElementById('statTotalBookings');
        const totalN = document.getElementById('statTotalNights');
        const totalI = document.getElementById('statTotalInvested');
        if (!totalB) return;

        let nights = 0, cost = 0;
        savedReservations.forEach(r => { nights += r.nights; cost += r.totalPrice; });
        totalB.textContent = savedReservations.length;
        totalN.textContent = nights;
        totalI.textContent = `${cost}$`;
    }

    window.deleteBooking = (index) => {
        savedReservations.splice(index, 1);
        localStorage.setItem('marriott_bookings', JSON.stringify(savedReservations));
        updateDashboardUI();
        showToast('Demande de séjour supprimée.', 'danger');
    };

    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;

            const days = (new Date(checkOut.value) - new Date(checkIn.value)) / (1000 * 60 * 60 * 24);

            if (!checkIn.value) { checkIn.classList.add('is-invalid-custom'); isValid = false; } 
            else { checkIn.classList.remove('is-invalid-custom'); checkIn.classList.add('is-valid-custom'); }

            if (!checkOut.value || days <= 0) { checkOut.classList.add('is-invalid-custom'); isValid = false; } 
            else { checkOut.classList.remove('is-invalid-custom'); checkOut.classList.add('is-valid-custom'); }

            if (!isValid) {
                showToast('Échec de validation. Vérifiez les dates.', 'danger');
                return;
            }

            const selectedOption = roomType.options[roomType.selectedIndex];
            const reservation = {
                name: selectedOption.getAttribute('data-name'),
                in: checkIn.value,
                out: checkOut.value,
                nights: days,
                totalPrice: days * parseInt(roomType.value)
            };

            savedReservations.push(reservation);
            localStorage.setItem('marriott_bookings', JSON.stringify(savedReservations));
            updateDashboardUI();
            bookingForm.reset();
            livePriceContainer.style.display = 'none';
            document.querySelectorAll('.is-valid-custom').forEach(el => el.classList.remove('is-valid-custom'));
            showToast('Hébergement ajouté à votre tableau de bord.');
        });
    }

    updateDashboardUI();

   /* ==========================================================================
       8. CORRECTION : ENVOI DU FORMULAIRE DE CONTACT
       ========================================================================== */
    const contactForm = document.getElementById('intelligentContactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            
            if (contactForm.checkValidity()) {
                contactForm.innerHTML = `
                    <div class="alert text-center py-4 rounded border border-gold" style="background: rgba(197, 160, 89, 0.1);" role="alert">
                        <i class="fas fa-check-circle fa-3x text-gold mb-3"></i>
                        <h4 class="alert-heading text-gold uppercase mb-2">Message Envoyé !</h4>
                        <p class="text-white mb-0" style="font-weight: 500;">Demande envoyée avec succès, nous analysons votre requête.</p>
                    </div>
                `;
            } else {
                contactForm.classList.add('was-validated');
                showToast('Veuillez remplir correctement les champs requis.', 'danger');
            }
        });
    }
});