// ===========================================
// NAVIGATION SPA - Garder le background intact
// ===========================================
(function() {
    // Fonction pour charger les CSS dynamiquement
    function loadStylesheets(doc) {
        const newStyles = doc.querySelectorAll('link[rel="stylesheet"]');
        const currentStyles = document.querySelectorAll('link[rel="stylesheet"]');
        
        // Récupérer les URLs des styles actuels
        const currentStyleUrls = new Set();
        currentStyles.forEach(style => {
            currentStyleUrls.add(style.href);
        });
        
        // Ajouter les nouveaux styles qui ne sont pas déjà présents
        newStyles.forEach(style => {
            if (!currentStyleUrls.has(style.href)) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = style.href;
                document.head.appendChild(link);
            }
        });
    }
    
    // Fonction pour réexécuter les scripts de la page
    function executeScripts() {
        // Réinitialiser timeline.js si présent
        if (typeof initTimeline === 'function') {
            initTimeline();
        }
        // Réinitialiser les fonctionnalités de page
        initPageFeatures();
    }
    
    // Fonction pour résoudre une URL relative en URL absolue
    function resolveUrl(href) {
        // Créer un élément <a> pour résoudre l'URL
        const a = document.createElement('a');
        a.href = href;
        return a.href;
    }
    
    // Fonction pour charger une page via AJAX sans recharger
    async function navigateTo(url) {
        try {
            // Résoudre l'URL relative en absolue
            const resolvedUrl = resolveUrl(url);
            
            // Extraire le chemin et le hash
            const urlObj = new URL(resolvedUrl);
            const pathname = urlObj.pathname;
            const hash = urlObj.hash;
            const currentPathname = new URL(window.location.href).pathname;
            
            // Normaliser les chemins (enlever index.html à la fin)
            const normalizedPathname = pathname.replace(/\/index\.html$/, '/').replace(/\/$/, '');
            const normalizedCurrentPathname = currentPathname.replace(/\/index\.html$/, '/').replace(/\/$/, '');
            
            // Si on est sur la même page, juste scroller vers l'ancre
            if (normalizedPathname === normalizedCurrentPathname || 
                (pathname.endsWith('index.html') && currentPathname.endsWith('index.html'))) {
                if (hash) {
                    const target = document.querySelector(hash);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                }
                // Mettre à jour l'URL si le hash a changé
                if (hash !== window.location.hash) {
                    history.pushState({ url: resolvedUrl }, document.title, resolvedUrl);
                }
                return;
            }
            
            // Changer de page - utiliser l'URL résolue
            const response = await fetch(resolvedUrl);
            if (!response.ok) throw new Error('Page non trouvée');
            
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Charger les CSS de la nouvelle page
            loadStylesheets(doc);
            
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
            
            // Mettre à jour l'URL avec l'URL résolue
            history.pushState({ url: resolvedUrl }, newTitle, resolvedUrl);
            
            // Scroll en haut IMMÉDIATEMENT avant tout le reste
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
            
            // Réexécuter les scripts et fonctionnalités
            executeScripts();
            
            // Gérer les ancres (#section) après un délai
            if (hash) {
                setTimeout(() => {
                    const target = document.querySelector(hash);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 150);
            } else {
                // Double vérification du scroll en haut après rendu
                setTimeout(() => {
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                }, 50);
            }
            
        } catch (error) {
            console.error('Erreur de navigation:', error);
            // Fallback: navigation classique avec URL résolue
            window.location.href = resolvedUrl;
        }
    }
    
    // Intercepter les clics sur les liens internes
    function setupLinkInterception() {
        document.addEventListener('click', function(e) {
            const link = e.target.closest('a');
            if (!link) return;
            
            const href = link.getAttribute('href');
            if (!href) return;
            
            // Ignorer les liens externes (vérification plus robuste)
            const resolvedHref = resolveUrl(href);
            const currentOrigin = window.location.origin;
            if (!resolvedHref.startsWith(currentOrigin)) return;
            
            // Ignorer les liens de protocole spécial
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
        // Charger la page via SPA sans recharger complètement
        // Récupérer l'URL actuelle du navigateur
        const currentUrl = window.location.pathname + window.location.hash;
        
        // Charger le contenu sans ajouter à l'historique
        try {
            const resolvedUrl = resolveUrl(currentUrl);
            
            // Extraire le chemin et le hash
            const urlObj = new URL(resolvedUrl);
            const pathname = urlObj.pathname;
            const hash = urlObj.hash;
            
            // Charger la page via AJAX
            fetch(resolvedUrl).then(response => {
                if (!response.ok) throw new Error('Page non trouvée');
                return response.text();
            }).then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Charger les CSS de la nouvelle page
                loadStylesheets(doc);
                
                // Remplacer le contenu
                const newBody = doc.body;
                const canvas = document.getElementById('diffusionCanvas');
                const currentBody = document.body;
                
                Array.from(currentBody.children).forEach(child => {
                    if (child.id !== 'diffusionCanvas') {
                        child.remove();
                    }
                });
                
                Array.from(newBody.children).forEach(child => {
                    if (child.id !== 'diffusionCanvas' && child.tagName !== 'SCRIPT') {
                        currentBody.appendChild(child.cloneNode(true));
                    }
                });
                
                document.title = doc.title;
                executeScripts();
                
                // Scroll en haut
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
                
                // Gérer les ancres
                if (hash) {
                    setTimeout(() => {
                        const target = document.querySelector(hash);
                        if (target) {
                            target.scrollIntoView({ behavior: 'smooth' });
                        }
                    }, 150);
                }
            }).catch(error => {
                console.error('Erreur popstate:', error);
                window.location.reload();
            });
        } catch (error) {
            console.error('Erreur popstate:', error);
            window.location.reload();
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

    // Menu hamburger responsive
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        // Déplacer le bouton hamburger et le menu hors du header pour le mobile
        if (window.innerWidth <= 768) {
            document.body.appendChild(menuToggle);
            document.body.appendChild(navMenu);
        }

        // Gérer le redimensionnement
        window.addEventListener('resize', function() {
            if (window.innerWidth <= 768) {
                if (menuToggle.parentElement !== document.body) {
                    document.body.appendChild(menuToggle);
                    document.body.appendChild(navMenu);
                }
            }
        });

        menuToggle.addEventListener('click', function() {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
            menuToggle.setAttribute('aria-expanded', 
                menuToggle.classList.contains('active'));
        });

        // Fermer le menu quand on clique sur un lien
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Fermer le menu avec la touche Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
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
