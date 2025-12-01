// Timeline specific interactions

document.addEventListener('DOMContentLoaded', function() {
    // Au clic sur h4 du niveau 2 UNIQUEMENT, toggle la visibilité de tout sauf le h4
    document.querySelectorAll('.experience-level:nth-child(3) h4').forEach(h4 => {
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
});

// Add smooth reveal animation on page load
window.addEventListener('load', () => {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    timelineItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.animation = `slideIn 0.6s ease forwards`;
        item.style.animationDelay = `${index * 0.15}s`;
    });
});

// CSS animation for the reveal
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);
