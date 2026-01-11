// Simulation de réaction-diffusion (Gray-Scott) - Optimisée et réutilisable
class DiffusionSimulation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width = window.innerWidth;
        this.height = canvas.height = window.innerHeight;
        
        // Paramètres de la réaction-diffusion
        this.dA = 1.0;
        this.dB = 0.5;
        
        // Paramètres de base et amplitude de variation
        this.baseFeed = 0.029;
        this.baseKill = 0.057;
        this.feedAmplitude = 0.003;
        this.killAmplitude = 0.002;
        this.feedSpeed = 0.0008;
        this.killSpeed = 0.0011;
        this.time = 0;
        
        // Grilles - utiliser une résolution plus basse pour plus de performance
        this.resolution = 4;
        this.gridW = Math.floor(this.width / this.resolution);
        this.gridH = Math.floor(this.height / this.resolution);
        
        // Utiliser des typed arrays pour de meilleures performances
        const size = this.gridW * this.gridH;
        this.A = new Float32Array(size).fill(1);
        this.B = new Float32Array(size).fill(0);
        this.nextA = new Float32Array(size).fill(1);
        this.nextB = new Float32Array(size).fill(0);
        
        this.initializeWithSpots();
        
        this.imageData = this.ctx.createImageData(this.width, this.height);
        this.data = this.imageData.data;
        
        // Pré-calculer la table de couleurs pour éviter les calculs HSL répétés
        this.colorTable = this.generateColorTable();
        
        this.animate = this.animate.bind(this);
        window.addEventListener('resize', () => this.handleResize());
        
        // Interaction souris - capturer au niveau du document pour fonctionner partout
        this.isMouseDown = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.brushSize = 5;
        this.brushIntensity = 1.0;
        
        // Utiliser document pour capturer les événements même quand le canvas est derrière
        document.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mouseup', () => this.onMouseUp());
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        
        // Support tactile
        document.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        document.addEventListener('touchend', () => this.onMouseUp());
        document.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
    }
    
    generateColorTable() {
        // Pré-calculer 256 couleurs pour éviter les calculs en temps réel
        const table = new Uint8Array(256 * 3);
        for (let i = 0; i < 256; i++) {
            const t = i / 255;
            // Gradient bleu-violet simplifié
            const r = Math.round(30 + t * 100);
            const g = Math.round(20 + t * 50);
            const b = Math.round(80 + t * 175);
            table[i * 3] = r;
            table[i * 3 + 1] = g;
            table[i * 3 + 2] = b;
        }
        return table;
    }
    
    onMouseDown(e) {
        // Ne pas interférer avec les clics sur les éléments interactifs
        if (e.target.closest('a, button, input, textarea, .project-card, .content-section, .timeline-content, .contact-form, .nav-menu')) {
            return;
        }
        this.isMouseDown = true;
        this.updateMousePosition(e);
        this.paintAtMouse();
    }

    onMouseUp() {
        this.isMouseDown = false;
    }

    onMouseMove(e) {
        this.updateMousePosition(e);
        if (this.isMouseDown) {
            this.paintAtMouse();
        }
    }

    onTouchStart(e) {
        // Ne pas interférer avec les touches sur les éléments interactifs
        if (e.target.closest('a, button, input, textarea, .project-card, .content-section, .timeline-content, .contact-form, .nav-menu')) {
            return;
        }
        e.preventDefault();
        this.isMouseDown = true;
        const touch = e.touches[0];
        this.updateMousePosition(touch);
        this.paintAtMouse();
    }

    onTouchMove(e) {
        if (!this.isMouseDown) return;
        e.preventDefault();
        const touch = e.touches[0];
        this.updateMousePosition(touch);
        this.paintAtMouse();
    }
    
    updateMousePosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        // Prendre en compte le ratio entre taille CSS et taille du canvas
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const canvasX = (e.clientX - rect.left) * scaleX;
        const canvasY = (e.clientY - rect.top) * scaleY;
        this.mouseX = Math.floor(canvasX / this.resolution);
        this.mouseY = Math.floor(canvasY / this.resolution);
    }
    
    paintAtMouse() {
        const brushSize = this.brushSize;
        const gridW = this.gridW;
        const gridH = this.gridH;
        const mx = this.mouseX;
        const my = this.mouseY;
        const B = this.B;
        
        for (let dy = -brushSize; dy <= brushSize; dy++) {
            for (let dx = -brushSize; dx <= brushSize; dx++) {
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= brushSize) {
                    const x = mx + dx;
                    const y = my + dy;
                    if (x >= 0 && x < gridW && y >= 0 && y < gridH) {
                        const idx = y * gridW + x;
                        const falloff = 1 - (dist / brushSize);
                        B[idx] = Math.min(1, B[idx] + this.brushIntensity * falloff);
                    }
                }
            }
        }
    }
    
    initializeWithSpots() {
        const gridW = this.gridW;
        const gridH = this.gridH;
        const B = this.B;
        for (let i = 0; i < 200; i++) {
            const x = Math.floor(Math.random() * gridW);
            const y = Math.floor(Math.random() * gridH);
            B[y * gridW + x] = 0.8 + Math.random() * 0.2;
        }
    }
    
    update() {
        this.time++;
        const feed = this.baseFeed + Math.sin(this.time * this.feedSpeed) * this.feedAmplitude;
        const kill = this.baseKill + Math.sin(this.time * this.killSpeed + 1.5) * this.killAmplitude;
        const killPlusFeed = kill + feed;
        
        const gridW = this.gridW;
        const gridH = this.gridH;
        const A = this.A;
        const B = this.B;
        const nextA = this.nextA;
        const nextB = this.nextB;
        const dA = this.dA;
        const dB = this.dB;
        
        for (let y = 0; y < gridH; y++) {
            const yUp = ((y - 1 + gridH) % gridH) * gridW;
            const yDown = ((y + 1) % gridH) * gridW;
            const yRow = y * gridW;
            
            for (let x = 0; x < gridW; x++) {
                const xLeft = (x - 1 + gridW) % gridW;
                const xRight = (x + 1) % gridW;
                const idx = yRow + x;
                
                const a = A[idx];
                const b = B[idx];
                
                // Laplacian inliné pour éviter les appels de fonction
                const lapA = A[yRow + xRight] * 0.2 + A[yRow + xLeft] * 0.2 +
                             A[yDown + x] * 0.2 + A[yUp + x] * 0.2 +
                             A[yDown + xRight] * 0.05 + A[yUp + xLeft] * 0.05 +
                             A[yDown + xLeft] * 0.05 + A[yUp + xRight] * 0.05 - a;
                
                const lapB = B[yRow + xRight] * 0.2 + B[yRow + xLeft] * 0.2 +
                             B[yDown + x] * 0.2 + B[yUp + x] * 0.2 +
                             B[yDown + xRight] * 0.05 + B[yUp + xLeft] * 0.05 +
                             B[yDown + xLeft] * 0.05 + B[yUp + xRight] * 0.05 - b;
                
                const abb = a * b * b;
                let na = a + dA * lapA - abb + feed * (1 - a);
                let nb = b + dB * lapB + abb - killPlusFeed * b;
                
                // Clamp sans Math.max/min pour plus de performance
                nextA[idx] = na < 0 ? 0 : (na > 1 ? 1 : na);
                nextB[idx] = nb < 0 ? 0 : (nb > 1 ? 1 : nb);
            }
        }
        
        // Swap grids
        const tempA = this.A;
        const tempB = this.B;
        this.A = this.nextA;
        this.B = this.nextB;
        this.nextA = tempA;
        this.nextB = tempB;
    }
    
    render() {
        const gridW = this.gridW;
        const gridH = this.gridH;
        const resolution = this.resolution;
        const width = this.width;
        const height = this.height;
        const A = this.A;
        const B = this.B;
        const data = this.data;
        const colorTable = this.colorTable;
        
        for (let y = 0; y < gridH; y++) {
            const yRow = y * gridW;
            const pyBase = y * resolution;
            
            for (let x = 0; x < gridW; x++) {
                const idx = yRow + x;
                const b = B[idx];
                
                // Utiliser la table de couleurs pré-calculée
                const colorIdx = Math.floor(b * 255) * 3;
                const r = colorTable[colorIdx];
                const g = colorTable[colorIdx + 1];
                const bl = colorTable[colorIdx + 2];
                
                const pxBase = x * resolution;
                
                // Remplir le carré de résolution
                for (let py = 0; py < resolution; py++) {
                    const rowY = pyBase + py;
                    if (rowY >= height) break;
                    const rowOffset = rowY * width;
                    
                    for (let px = 0; px < resolution; px++) {
                        const colX = pxBase + px;
                        if (colX >= width) break;
                        const pixelIdx = (rowOffset + colX) * 4;
                        data[pixelIdx] = r;
                        data[pixelIdx + 1] = g;
                        data[pixelIdx + 2] = bl;
                        data[pixelIdx + 3] = 255;
                    }
                }
            }
        }
        
        this.ctx.putImageData(this.imageData, 0, 0);
    }
    
    animate() {
        this.update();
        this.render();
        requestAnimationFrame(this.animate);
    }
    
    handleResize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
        this.gridW = Math.floor(this.width / this.resolution);
        this.gridH = Math.floor(this.height / this.resolution);
        
        const size = this.gridW * this.gridH;
        this.A = new Float32Array(size).fill(1);
        this.B = new Float32Array(size).fill(0);
        this.nextA = new Float32Array(size).fill(1);
        this.nextB = new Float32Array(size).fill(0);
        this.initializeWithSpots();
        
        this.imageData = this.ctx.createImageData(this.width, this.height);
        this.data = this.imageData.data;
    }
}

// Démarrer la simulation au chargement - Auto-initialisation
(function() {
    function initDiffusion() {
        // Chercher un canvas existant ou en créer un nouveau
        let canvas = document.getElementById('diffusionCanvas');
        
        if (!canvas) {
            // Créer le canvas automatiquement
            canvas = document.createElement('canvas');
            canvas.id = 'diffusionCanvas';
            document.body.insertBefore(canvas, document.body.firstChild);
        }
        
        // Appliquer les styles via CSS (définis dans styles.css)
        // Mais s'assurer que pointer-events est actif pour l'interaction
        canvas.style.pointerEvents = 'auto';
        
        const sim = new DiffusionSimulation(canvas);
        setTimeout(() => sim.handleResize(), 100);
        sim.animate();
        
        // Exposer globalement si besoin
        window.diffusionSim = sim;
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDiffusion);
    } else {
        initDiffusion();
    }
})();
