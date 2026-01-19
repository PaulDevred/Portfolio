// ===========================================
// NAVIGATION SPA - Garder le background intact
// ===========================================
(function() {
    // Fonction pour charger une page via AJAX sans recharger
    async function navigateTo(url) {
        try {
            // Extraire le chemin et le hash
            const urlObj = new URL(url, window.location.origin);
            const pathname = urlObj.pathname;
            const hash = urlObj.hash;
            const currentPathname = new URL(window.location.href, window.location.origin).pathname;
            
            // Si on est sur la même page, juste scroller vers l'ancre
            if (pathname === currentPathname) {
                if (hash) {
                    const target = document.querySelector(hash);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                }
                // Mettre à jour l'URL si le hash a changé
                if (hash !== window.location.hash) {
                    history.pushState({ url: url }, document.title, url);
                }
                return;
            }
            
            // Changer de page
            const response = await fetch(url);
            if (!response.ok) throw new Error('Page non trouvée');
            
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Extraire le contenu principal (tout sauf le canvas)
            const newBody = doc.body;
            const newTitle = doc.title;
            
            // Sauvegarder le canvas
            const canvas = document.getElementById('diffusionCanvas');
            
            // Remplacer le contenu du body (sauf le canvas)
            const currentBody = document.body;
            
            // Supprimer tout sauf le canvas
            Array.from(currentBody.children).forEach(child => {
                if (child.id !== 'diffusionCanvas') {
                    child.remove();
                }
            });
            
            // Ajouter le nouveau contenu (sauf les scripts et le canvas)
            Array.from(newBody.children).forEach(child => {
                if (child.id !== 'diffusionCanvas' && child.tagName !== 'SCRIPT') {
                    currentBody.appendChild(child.cloneNode(true));
                }
            });
            
            // Mettre à jour le titre
            document.title = newTitle;
            
            // Mettre à jour l'URL
            history.pushState({ url: url }, newTitle, url);
            
            // Réinitialiser les fonctionnalités de la page
            initPageFeatures();
            
            // Gérer les ancres (#section) sans scroll initial
            if (hash) {
                setTimeout(() => {
                    const target = document.querySelector(hash);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 100);
            } else {
                // Scroll en haut seulement s'il n'y a pas d'ancre
                window.scrollTo(0, 0);
            }
            
        } catch (error) {
            console.error('Erreur de navigation:', error);
            // Fallback: navigation classique
            window.location.href = url;
        }
    }
    
    // Intercepter les clics sur les liens internes
    function setupLinkInterception() {
        document.addEventListener('click', function(e) {
            const link = e.target.closest('a');
            if (!link) return;
            
            const href = link.getAttribute('href');
            if (!href) return;
            
            // Ignorer les liens externes, les liens avec target, et les liens de protocole spécial
            if (href.startsWith('http') && !href.startsWith(window.location.origin)) return;
            if (href.startsWith('mailto:') || href.startsWith('tel:')) return;
            if (link.hasAttribute('target')) return;
            if (href.startsWith('#')) {
                // Lien ancre sur la même page
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
                return;
            }
            
            // Naviguer via SPA
            e.preventDefault();
            navigateTo(href);
        });
    }
    
    // Gérer le bouton retour/avant du navigateur
    window.addEventListener('popstate', function(e) {
        if (e.state && e.state.url) {
            navigateTo(e.state.url);
        } else {
            navigateTo(window.location.href);
        }
    });
    
    // Initialiser l'interception des liens
    setupLinkInterception();
    
    // Sauvegarder l'état initial
    history.replaceState({ url: window.location.href }, document.title, window.location.href);
})();

// ===========================================
// FONCTIONNALITÉS DE PAGE
// ===========================================
function initPageFeatures() {
    // Form submission handler
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = this.querySelector('input[placeholder="Votre nom"]').value;
            const email = this.querySelector('input[placeholder="Votre email"]').value;
            const message = this.querySelector('textarea').value;
            
            // Simple validation
            if (name && email && message) {
                alert('Merci pour votre message! Je vous recontacterai bientôt.');
                this.reset();
            } else {
                alert('Veuillez remplir tous les champs.');
            }
        });
    }

    // CTA button scroll
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            document.querySelector('#projets').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Add animation on scroll (optional)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.project-card, .skill-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// Initialiser les fonctionnalités au chargement initial
initPageFeatures();
