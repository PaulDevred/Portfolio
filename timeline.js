// Timeline specific interactions

// Popup effect for level 2 details
document.querySelectorAll('.experience-level:nth-child(2)').forEach(level => {
    level.addEventListener('click', function() {
        this.classList.toggle('expanded');
        this.classList.toggle('collapsed');
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
