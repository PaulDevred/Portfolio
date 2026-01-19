// Timeline specific interactions

// Fonction d'initialisation de la timeline (réutilisable)
function initTimeline() {
    // Au clic sur h4 du niveau 2 UNIQUEMENT, toggle la visibilité de tout sauf le h4
    document.querySelectorAll('.experience-level:nth-child(3) h4').forEach(h4 => {
        // Éviter de rattacher les événements plusieurs fois
        if (h4.dataset.initialized) return;
        h4.dataset.initialized = 'true';
        
        h4.style.cursor = 'pointer';
        const parent = h4.closest('.experience-level');
        
        h4.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Masque/affiche tout sauf le h4
            const list = parent.querySelector('.experience-list');
            if (list) {
                if (list.style.display === 'none') {
                    list.style.display = '';
                    parent.classList.remove('collapsed');
                } else {
                    list.style.display = 'none';
                    parent.classList.add('collapsed');
                }
            }
        });
    });
    
    // Animation de révélation
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.animation = `slideIn 0.6s ease forwards`;
        item.style.animationDelay = `${index * 0.15}s`;
    });
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', initTimeline);

// CSS animation for the reveal (ajouté une seule fois)
if (!document.getElementById('timeline-animations')) {
    const style = document.createElement('style');
    style.id = 'timeline-animations';
    style.textContent = `
        @keyframes slideIn {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}
