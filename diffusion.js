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
        
        // Interaction souris
        this.isMouseDown = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.brushSize = 5; // Taille du pinceau en cellules
        this.brushIntensity = 1.0; // Intensité du pinceau
        
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mouseup', () => this.onMouseUp());
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseleave', () => this.onMouseUp());
        
        // Support tactile
        this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e));
        this.canvas.addEventListener('touchend', () => this.onMouseUp());
        this.canvas.addEventListener('touchmove', (e) => this.onTouchMove(e));
    }
    
    onMouseDown(e) {
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
        e.preventDefault();
        this.isMouseDown = true;
        const touch = e.touches[0];
        this.updateMousePosition(touch);
        this.paintAtMouse();
    }
    
    onTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.updateMousePosition(touch);
        if (this.isMouseDown) {
            this.paintAtMouse();
        }
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
        // Dessiner un cercle de B à la position de la souris
        for (let dy = -this.brushSize; dy <= this.brushSize; dy++) {
            for (let dx = -this.brushSize; dx <= this.brushSize; dx++) {
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= this.brushSize) {
                    const x = this.mouseX + dx;
                    const y = this.mouseY + dy;
                    if (x >= 0 && x < this.gridW && y >= 0 && y < this.gridH) {
                        const idx = y * this.gridW + x;
                        // Intensité décroissante vers les bords
                        const falloff = 1 - (dist / this.brushSize);
                        this.B[idx] = Math.min(1, this.B[idx] + this.brushIntensity * falloff);
                    }
                }
            }
        }
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
        
    //     // Ajouter quelques structures initiales
    //     this.spawnStructures(5);
    // }
    
    // // Dessiner un pixel sur la grille B
    // setB(x, y, value) {
    //     x = (x + this.gridW) % this.gridW;
    //     y = (y + this.gridH) % this.gridH;
    //     const idx = y * this.gridW + x;
    //     this.B[idx] = Math.max(this.B[idx], value);
    // }
    
    // // Créer un "soliton" - structure mobile dans Gray-Scott
    // createSoliton(cx, cy, direction) {
    //     // Un soliton est une structure asymétrique qui se déplace
    //     const size = 3;
    //     const intensity = 1.0;
        
    //     // Créer une forme asymétrique qui génère du mouvement
    //     for (let dy = -size; dy <= size; dy++) {
    //         for (let dx = -size; dx <= size; dx++) {
    //             const dist = Math.sqrt(dx * dx + dy * dy);
    //             if (dist <= size) {
    //                 // Asymétrie selon la direction pour créer le mouvement
    //                 let bias = 0;
    //                 switch(direction) {
    //                     case 0: bias = dx * 0.15; break; // droite
    //                     case 1: bias = -dx * 0.15; break; // gauche
    //                     case 2: bias = dy * 0.15; break; // bas
    //                     case 3: bias = -dy * 0.15; break; // haut
    //                 }
    //                 const value = intensity * (1 - dist / size) + bias;
    //                 if (value > 0) this.setB(cx + dx, cy + dy, value);
    //             }
    //         }
    //     }
    // }
    
    // // Créer un anneau oscillant
    // createRing(cx, cy, radius) {
    //     for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
    //         const x = Math.round(cx + Math.cos(angle) * radius);
    //         const y = Math.round(cy + Math.sin(angle) * radius);
    //         this.setB(x, y, 0.9);
    //         this.setB(x + 1, y, 0.7);
    //         this.setB(x, y + 1, 0.7);
    //     }
    // }
    
    // // Créer une spirale
    // createSpiral(cx, cy, turns) {
    //     for (let t = 0; t < turns * Math.PI * 2; t += 0.15) {
    //         const radius = t * 0.8;
    //         const x = Math.round(cx + Math.cos(t) * radius);
    //         const y = Math.round(cy + Math.sin(t) * radius);
    //         this.setB(x, y, 0.95);
    //     }
    // }
    
    // // Créer une ligne de "gliders"
    // createGliderWave(startX, startY, count, direction) {
    //     for (let i = 0; i < count; i++) {
    //         const spacing = 8;
    //         let x = startX, y = startY;
    //         switch(direction) {
    //             case 0: x += i * spacing; break;
    //             case 1: x -= i * spacing; break;
    //             case 2: y += i * spacing; break;
    //             case 3: y -= i * spacing; break;
    //         }
    //         this.createSoliton(x, y, direction);
    //     }
    // }
    
    // // Créer un pulsar (oscillateur)
    // createPulsar(cx, cy) {
    //     const pattern = [
    //         [0, 1], [0, -1], [1, 0], [-1, 0],
    //         [2, 2], [2, -2], [-2, 2], [-2, -2],
    //         [3, 0], [-3, 0], [0, 3], [0, -3]
    //     ];
    //     for (const [dx, dy] of pattern) {
    //         this.setB(cx + dx, cy + dy, 1.0);
    //     }
    // }
    
    // // Créer un "vaisseau" plus complexe
    // createShip(cx, cy, direction) {
    //     // Forme de vaisseau asymétrique
    //     const pattern = [
    //         [0, 0, 1.0], [1, 0, 0.9], [2, 0, 0.8], [-1, 0, 0.7],
    //         [0, 1, 0.9], [1, 1, 0.8], [0, -1, 0.9], [1, -1, 0.8],
    //         [3, 0, 0.6], [3, 1, 0.5], [3, -1, 0.5]
    //     ];
        
    //     for (const [dx, dy, val] of pattern) {
    //         let rx = dx, ry = dy;
    //         // Rotation selon direction
    //         switch(direction) {
    //             case 1: rx = -dx; break;
    //             case 2: rx = dy; ry = dx; break;
    //             case 3: rx = -dy; ry = -dx; break;
    //         }
    //         this.setB(cx + rx, cy + ry, val);
    //     }
    // }
    
    // // Générer des structures aléatoires
    // spawnStructures(count) {
    //     for (let i = 0; i < count; i++) {
    //         const x = Math.floor(Math.random() * this.gridW);
    //         const y = Math.floor(Math.random() * this.gridH);
    //         const type = Math.floor(Math.random() * 6);
    //         const dir = Math.floor(Math.random() * 4);
            
    //         switch(type) {
    //             case 0:
    //                 this.createSoliton(x, y, dir);
    //                 break;
    //             case 1:
    //                 this.createRing(x, y, 5 + Math.random() * 5);
    //                 break;
    //             case 2:
    //                 this.createSpiral(x, y, 2 + Math.random() * 2);
    //                 break;
    //             case 3:
    //                 this.createGliderWave(x, y, 3 + Math.floor(Math.random() * 3), dir);
    //                 break;
    //             case 4:
    //                 this.createPulsar(x, y);
    //                 break;
    //             case 5:
    //                 this.createShip(x, y, dir);
    //                 break;
    //         }
    //     }
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
        
        // // Spawn périodique de nouvelles structures (toutes les ~500 frames)
        // if (Math.floor(this.time) % 500 === 0 && Math.floor(this.time - this.speed) % 500 !== 0) {
        //     this.spawnStructures(1 + Math.floor(Math.random() * 2));
        // }
        
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
