// Simulation de réaction-diffusion (Gray-Scott)
class DiffusionSimulation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width = window.innerWidth;
        this.height = canvas.height = window.innerHeight;
        
        // Paramètres de la réaction-diffusion
        this.dA = 1.0; // Diffusion rate for A
        this.dB = 0.5; // Diffusion rate for B
        
        // Vitesse globale de la simulation (1 = normal, 2 = 2x plus rapide, 0.5 = 2x plus lent)
        this.speed = 1;
        
        // Paramètres de base et amplitude de variation
        this.baseFeed = 0.029;
        this.baseKill = 0.057;
        this.feedAmplitude = 0.003; // Variation légère pour ne pas casser les motifs
        this.killAmplitude = 0.002;
        
        // Vitesses de variation différentes pour créer des motifs organiques
        this.feedSpeed = 0.0008;
        this.killSpeed = 0.0011;
        
        this.time = 0;
        
        // Grilles
        this.resolution = 4;
        this.gridW = Math.floor(this.width / this.resolution);
        this.gridH = Math.floor(this.height / this.resolution);
        
        this.A = this.createGrid(1);
        this.B = this.createGrid(0);
        this.nextA = this.createGrid(1);
        this.nextB = this.createGrid(0);
        
        // Initialisation avec quelques spots
        this.initializeWithSpots();
        
        // Variables de couleur
        this.imageData = this.ctx.createImageData(this.width, this.height);
        this.data = this.imageData.data;
        
        this.animate = this.animate.bind(this);
        window.addEventListener('resize', () => this.handleResize());
    }
    
    createGrid(value) {
        return Array(this.gridW * this.gridH).fill(value);
    }
    
    initializeWithSpots() {
        // Ajouter des spots plus nombreux et plus intenses de B
        for (let i = 0; i < 200; i++) {
            const x = Math.floor(Math.random() * this.gridW);
            const y = Math.floor(Math.random() * this.gridH);
            const idx = y * this.gridW + x;
            this.B[idx] = 0.8 + Math.random() * 0.2;
        }
    }
    
    index(x, y) {
        x = (x + this.gridW) % this.gridW;
        y = (y + this.gridH) % this.gridH;
        return y * this.gridW + x;
    }
    
    laplacian(grid, x, y) {
        let sum = 0;
        sum += grid[this.index(x, y)] * -1;
        sum += grid[this.index(x + 1, y)] * 0.2;
        sum += grid[this.index(x - 1, y)] * 0.2;
        sum += grid[this.index(x, y + 1)] * 0.2;
        sum += grid[this.index(x, y - 1)] * 0.2;
        sum += grid[this.index(x + 1, y + 1)] * 0.05;
        sum += grid[this.index(x - 1, y - 1)] * 0.05;
        sum += grid[this.index(x + 1, y - 1)] * 0.05;
        sum += grid[this.index(x - 1, y + 1)] * 0.05;
        return sum;
    }
    
    update() {
        // Variation continue des paramètres avec des oscillations déphasées
        this.time += this.speed;
        const feed = this.baseFeed + Math.sin(this.time * this.feedSpeed) * this.feedAmplitude;
        const kill = this.baseKill + Math.sin(this.time * this.killSpeed + 1.5) * this.killAmplitude;
        
        // Nombre d'itérations par frame basé sur la vitesse
        const iterations = Math.max(1, Math.round(this.speed));
        
        for (let iter = 0; iter < iterations; iter++) {
            for (let y = 0; y < this.gridH; y++) {
                for (let x = 0; x < this.gridW; x++) {
                    const idx = y * this.gridW + x;
                    const a = this.A[idx];
                    const b = this.B[idx];
                    
                    const lapA = this.laplacian(this.A, x, y);
                    const lapB = this.laplacian(this.B, x, y);
                    
                    // Gray-Scott reaction-diffusion equations avec paramètres variables
                    let nextA = a + (this.dA * lapA) - a * b * b + feed * (1 - a);
                    let nextB = b + (this.dB * lapB) + a * b * b - (kill + feed) * b;
                    
                    nextA = Math.max(0, Math.min(1, nextA));
                    nextB = Math.max(0, Math.min(1, nextB));
                    
                    this.nextA[idx] = nextA;
                    this.nextB[idx] = nextB;
                }
            }
            
            // Swap grids
            [this.A, this.nextA] = [this.nextA, this.A];
            [this.B, this.nextB] = [this.nextB, this.B];
        }
    }
    
    render() {
        for (let y = 0; y < this.gridH; y++) {
            for (let x = 0; x < this.gridW; x++) {
                const idx = y * this.gridW + x;
                const a = this.A[idx];
                const b = this.B[idx];
                
                // Créer une couleur basée sur A et B
                const hue = (b * 360) % 160;
                const sat = 2000;
                const light = 1 + (a - b) * 20;
                
                // Convertir HSL en RGB
                const c = this.hslToRgb(hue, sat, light);
                
                // Remplir le carré de résolution
                for (let py = 0; py < this.resolution && y * this.resolution + py < this.height; py++) {
                    for (let px = 0; px < this.resolution && x * this.resolution + px < this.width; px++) {
                        const pixelIdx = ((y * this.resolution + py) * this.width + (x * this.resolution + px)) * 4;
                        this.data[pixelIdx] = c.r;
                        this.data[pixelIdx + 1] = c.g;
                        this.data[pixelIdx + 2] = c.b;
                        this.data[pixelIdx + 3] = 255;
                    }
                }
            }
        }
        
        this.ctx.putImageData(this.imageData, 0, 0);
    }
    
    hslToRgb(h, s, l) {
        s /= 100;
        l /= 100;
        const k = n => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        
        return {
            r: Math.round(255 * f(0)),
            g: Math.round(255 * f(8)),
            b: Math.round(255 * f(4))
        };
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
        
        this.A = this.createGrid(1);
        this.B = this.createGrid(0);
        this.nextA = this.createGrid(1);
        this.nextB = this.createGrid(0);
        this.initializeWithSpots();
        
        this.imageData = this.ctx.createImageData(this.width, this.height);
        this.data = this.imageData.data;
    }
}

// Démarrer la simulation au chargement
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('diffusionCanvas');
    if (canvas) {
        const sim = new DiffusionSimulation(canvas);
        // S'assurer que le canvas est redimensionné correctement
        setTimeout(() => {
            sim.handleResize();
        }, 100);
        sim.animate();
    }
});
