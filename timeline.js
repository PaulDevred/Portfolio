// Timeline specific interactions

// Fonction d'initialisation de la timeline (réutilisable)
function initTimeline() {
    // Au clic sur la carte collapsed ENTIÈRE, toggle la visibilité
    document.querySelectorAll('.experience-level.collapsed').forEach(levelDiv => {
        // Éviter de rattacher les événements plusieurs fois
        if (levelDiv.dataset.initialized) return;
        levelDiv.dataset.initialized = 'true';
        
        levelDiv.style.cursor = 'pointer';
        
        levelDiv.addEventListener('click', function(e) {
            // Ignorer les clics sur les liens
            if (e.target.tagName === 'A') return;
            
            e.stopPropagation();
            
            // Masque/affiche tout sauf le h4
            const list = levelDiv.querySelector('.experience-list');
            if (list) {
                if (list.style.display === 'none') {
                    list.style.display = '';
                    levelDiv.classList.remove('collapsed');
                } else {
                    list.style.display = 'none';
                    levelDiv.classList.add('collapsed');
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
