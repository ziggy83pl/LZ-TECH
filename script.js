document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Obsługa sticky menu przy przewijaniu ---
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('backToTop');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
            backToTop.classList.add('active');
        } else {
            navbar.classList.remove('scrolled');
            backToTop.classList.remove('active');
        }
    });

    // --- 2. Obsługa menu mobilnego ---
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const isExpanded = navLinks.classList.contains('active');
            menuToggle.querySelector('i').className = isExpanded ? 'fas fa-times' : 'fas fa-bars';
        });

        // Zamknij menu mobilne po kliknięciu w link
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuToggle.querySelector('i').className = 'fas fa-bars';
            });
        });
    }

    // --- 3. Animacje wejścia (Scroll Reveal) ---
    const reveals = document.querySelectorAll('.reveal');
    const revealOnScroll = () => {
        for (let i = 0; i < reveals.length; i++) {
            const windowHeight = window.innerHeight;
            const elementTop = reveals[i].getBoundingClientRect().top;
            const elementVisible = 100;
            
            if (elementTop < windowHeight - elementVisible) {
                reveals[i].classList.add('visible');
            }
        }
    };
    
    // Wywołaj na start i na każdy scroll
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check

    // --- 4. Obsługa Lightboxu (Natywny <dialog>) ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (lightbox && lightboxImg && lightboxCaption) {
        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const fullSrc = item.getAttribute('data-full');
                const caption = item.getAttribute('data-caption');
                
                lightboxImg.src = fullSrc;
                lightboxCaption.textContent = caption;
                
                lightbox.showModal();
            });
        });

        // Zamknięcie przyciskiem X
        if (lightboxClose) {
            lightboxClose.addEventListener('click', () => {
                lightbox.close();
            });
        }

        // Zamknięcie po kliknięciu w tło (backdrop) dla kompatybilności z Safari/Firefox
        lightbox.addEventListener('click', (e) => {
            const dialogDimensions = lightbox.getBoundingClientRect();
            if (
                e.clientX < dialogDimensions.left ||
                e.clientX > dialogDimensions.right ||
                e.clientY < dialogDimensions.top ||
                e.clientY > dialogDimensions.bottom
            ) {
                lightbox.close();
            }
        });
    }

    // --- 5. Obsługa Formularza Kontaktowego ---
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');
    const btnShowForm = document.getElementById('btnShowForm');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Walidacja pól formularza
            const name = document.getElementById('formName');
            const phone = document.getElementById('formPhone');
            const email = document.getElementById('formEmail');
            const service = document.getElementById('formService');
            const location = document.getElementById('formLocation');
            const message = document.getElementById('formMessage');
            const privacy = document.getElementById('formPrivacy');
            
            let isValid = true;
            
            // Prosta wizualna walidacja (dodanie czerwonej ramki)
            [name, phone, email, service, location, message, privacy].forEach(el => {
                if (el) {
                    if (!el.checkValidity()) {
                        el.style.borderColor = '#e74c3c';
                        isValid = false;
                    } else {
                        el.style.borderColor = 'var(--color-border)';
                    }
                }
            });

            // Dodatkowy nasłuch na zmianę wartości w celu resetu koloru obramowania
            [name, phone, email, service, location, message, privacy].forEach(el => {
                if (el) {
                    el.addEventListener('input', () => {
                        if (el.checkValidity()) {
                            el.style.borderColor = 'var(--color-border)';
                        }
                    });
                }
            });

            if (!isValid) {
                return;
            }

            // Wysyłanie wiadomości przez Formspree
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wysyłanie...';
            
            if (contactForm.action.includes('YOUR_FORM_ID_HERE')) {
                alert('Formularz nie jest jeszcze w pełni skonfigurowany. Musisz najpierw założyć darmowe konto na Formspree.io, utworzyć formularz przypisany do adresu ulukaszek81@yahoo.pl i wstawić otrzymany identyfikator Form ID w miejsce "YOUR_FORM_ID_HERE" w pliku index.html.');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                return;
            }

            const formData = new FormData(contactForm);
            
            fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    contactForm.reset();
                    // Ukrycie formularza i pokazanie podziękowania
                    contactForm.style.display = 'none';
                    formSuccess.style.display = 'block';
                    
                    // Przewiń płynnie na początek sekcji formularza
                    document.getElementById('kontakt-form').scrollIntoView({ behavior: 'smooth' });
                } else {
                    return response.json().then(data => {
                        if (data && data.errors) {
                            throw new Error(data.errors.map(err => err.message).join(', '));
                        } else {
                            throw new Error('Wystąpił błąd podczas wysyłania wiadomości.');
                        }
                    });
                }
            })
            .catch(error => {
                console.error('Błąd Formspree:', error);
                alert('Nie udało się wysłać wiadomości: ' + error.message);
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            });
        });
    }

    // Przycisk powrotu do formularza
    if (btnShowForm) {
        btnShowForm.addEventListener('click', () => {
            if (formSuccess && contactForm) {
                formSuccess.style.display = 'none';
                contactForm.style.display = 'flex';
            }
        });
    }

    // --- 6. Obfuskacja i zabezpieczenie e-maila ---
    const emailLink = document.getElementById('emailLink');
    if (emailLink) {
        emailLink.addEventListener('click', (e) => {
            e.preventDefault();
            const user = 'ulukaszek81';
            const domain = 'yahoo.pl';
            window.location.href = `mailto:${user}@${domain}`;
        });
    }
});
