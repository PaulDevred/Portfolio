// Simulation de réaction-diffusion (Gray-Scott) - Optimisée et réutilisable
class DiffusionSimulation {
    constructor(canvas) {
        this.canvas = canvas;
        // Activer le lissage pour un upscaling doux
        this.ctx = canvas.getContext('2d', { alpha: false });
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        
        // Dimensions écran
        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;
        
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
        
        // Grilles - résolution adaptative (peut être plus fine maintenant)
        this.resolution = this.calculateAdaptiveResolution();
        this.gridW = Math.floor(this.screenWidth / this.resolution);
        this.gridH = Math.floor(this.screenHeight / this.resolution);
        
        // Canvas à la taille de la grille, CSS à la taille écran (upscaling navigateur)
        this.canvas.width = this.gridW;
        this.canvas.height = this.gridH;
        this.canvas.style.width = this.screenWidth + 'px';
        this.canvas.style.height = this.screenHeight + 'px';
        
        // Utiliser des typed arrays pour de meilleures performances
        const size = this.gridW * this.gridH;
        this.A = new Float32Array(size).fill(1);
        this.B = new Float32Array(size).fill(0);
        this.nextA = new Float32Array(size).fill(1);
        this.nextB = new Float32Array(size).fill(0);
        
        this.initializeWithSpots();
        
        // ImageData à la taille de la grille (petit = rapide)
        this.imageData = this.ctx.createImageData(this.gridW, this.gridH);
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
        // ===== VARIANTES DE MIDNIGHT DREAM =====
        // Décommentez la variante que vous voulez tester
        
        // VARIANTE 1 : Midnight Dream Classique
        // return this.createPalette_MidnightDream_Classic();
        
        // VARIANTE 2 : Midnight Dream - Blanc Très Prononcé (noir → bleu → blanc intense)
        // return this.createPalette_MidnightDream_WhitePronounced();
        
        // VARIANTE 3 : Midnight Dream - Violet
        // return this.createPalette_MidnightDream_Violet();
        
        // VARIANTE 4 : Midnight Dream - Cyan
        // return this.createPalette_MidnightDream_Cyan();
        
        // VARIANTE 5 : Midnight Dream - Rosé
        return this.createPalette_MidnightDream_Rose();// !!!!!!!!!!!!!!!!!!!!!!!!
        
        // VARIANTE 6 : Midnight Dream - Plus Sombre
        // return this.createPalette_MidnightDream_Darker();
        
        // VARIANTE 7 : Midnight Dream - Plus Clair
        // return this.createPalette_MidnightDream_Lighter();
        
        // VARIANTE 8 : Midnight Dream - Turquoise
        // return this.createPalette_MidnightDream_Turquoise();
        
        // VARIANTE 9 : Midnight Dream - Magenta
        // return this.createPalette_MidnightDream_Magenta();
        
        // VARIANTE 10 : Midnight Dream - Glacier (bleu glacier → blanc glacé)
        // return this.createPalette_MidnightDream_Glacier();
    }
    
    // ===== PALETTES DE COULEURS =====
    
    createPalette_IndigoVioletRose() {
        const table = new Uint8Array(256 * 3);
        for (let i = 0; i < 256; i++) {
            const t = Math.pow(i / 255, 0.55);
            let r, g, b;
            
            if (t < 0.15) {
                const lt = t / 0.15;
                r = Math.round(25 + lt * 15);
                g = Math.round(20 + lt * 25);
                b = Math.round(70 + lt * 50);
            } else if (t < 0.35) {
                const lt = (t - 0.15) / 0.2;
                r = Math.round(40 + lt * 30);
                g = Math.round(45 + lt * 20);
                b = Math.round(120 + lt * 60);
            } else if (t < 0.55) {
                const lt = (t - 0.35) / 0.2;
                r = Math.round(70 + lt * 70);
                g = Math.round(65 - lt * 20);
                b = Math.round(180 + lt * 40);
            } else if (t < 0.75) {
                const lt = (t - 0.55) / 0.2;
                r = Math.round(140 + lt * 80);
                g = Math.round(45 + lt * 30);
                b = Math.round(220 - lt * 20);
            } else {
                const lt = (t - 0.75) / 0.25;
                r = Math.round(220 + lt * 35);
                g = Math.round(75 + lt * 100);
                b = Math.round(200 - lt * 30);
            }
            
            table[i * 3] = r;
            table[i * 3 + 1] = g;
            table[i * 3 + 2] = b;
        }
        return table;
    }
    
    createPalette_OceanProfond() {
        const table = new Uint8Array(256 * 3);
        for (let i = 0; i < 256; i++) {
            const t = Math.pow(i / 255, 0.55);
            let r, g, b;
            
            if (t < 0.2) {
                const lt = t / 0.2;
                r = Math.round(5 + lt * 10);
                g = Math.round(15 + lt * 25);
                b = Math.round(40 + lt * 60);
            } else if (t < 0.4) {
                const lt = (t - 0.2) / 0.2;
                r = Math.round(15 + lt * 35);
                g = Math.round(40 + lt * 100);
                b = Math.round(100 + lt * 100);
            } else if (t < 0.6) {
                const lt = (t - 0.4) / 0.2;
                r = Math.round(50 + lt * 100);
                g = Math.round(140 + lt * 100);
                b = Math.round(200 + lt * 55);
            } else if (t < 0.8) {
                const lt = (t - 0.6) / 0.2;
                r = Math.round(150 + lt * 50);
                g = Math.round(240 - lt * 80);
                b = Math.round(255);
            } else {
                const lt = (t - 0.8) / 0.2;
                r = Math.round(200 + lt * 55);
                g = Math.round(160 + lt * 95);
                b = Math.round(255);
            }
            
            table[i * 3] = r;
            table[i * 3 + 1] = g;
            table[i * 3 + 2] = b;
        }
        return table;
    }
    
    createPalette_SunsetVibrant() {
        const table = new Uint8Array(256 * 3);
        for (let i = 0; i < 256; i++) {
            const t = Math.pow(i / 255, 0.55);
            let r, g, b;
            
            if (t < 0.2) {
                const lt = t / 0.2;
                r = Math.round(50 + lt * 100);
                g = Math.round(30 + lt * 50);
                b = Math.round(20 + lt * 30);
            } else if (t < 0.4) {
                const lt = (t - 0.2) / 0.2;
                r = Math.round(150 + lt * 100);
                g = Math.round(80 + lt * 50);
                b = Math.round(50 - lt * 30);
            } else if (t < 0.6) {
                const lt = (t - 0.4) / 0.2;
                r = Math.round(250);
                g = Math.round(130 - lt * 80);
                b = Math.round(20 + lt * 80);
            } else if (t < 0.8) {
                const lt = (t - 0.6) / 0.2;
                r = Math.round(255 - lt * 55);
                g = Math.round(50 - lt * 30);
                b = Math.round(100 + lt * 155);
            } else {
                const lt = (t - 0.8) / 0.2;
                r = Math.round(200 + lt * 55);
                g = Math.round(20 + lt * 100);
                b = Math.round(255);
            }
            
            table[i * 3] = r;
            table[i * 3 + 1] = g;
            table[i * 3 + 2] = b;
        }
        return table;
    }
    
    createPalette_ForestNeon() {
        const table = new Uint8Array(256 * 3);
        for (let i = 0; i < 256; i++) {
            const t = Math.pow(i / 255, 0.55);
            let r, g, b;
            
            if (t < 0.2) {
                const lt = t / 0.2;
                r = Math.round(10 + lt * 20);
                g = Math.round(40 + lt * 60);
                b = Math.round(20 + lt * 30);
            } else if (t < 0.4) {
                const lt = (t - 0.2) / 0.2;
                r = Math.round(30 + lt * 30);
                g = Math.round(100 + lt * 100);
                b = Math.round(50 + lt * 100);
            } else if (t < 0.6) {
                const lt = (t - 0.4) / 0.2;
                r = Math.round(60 - lt * 40);
                g = Math.round(200 + lt * 55);
                b = Math.round(150 + lt * 105);
            } else if (t < 0.8) {
                const lt = (t - 0.6) / 0.2;
                r = Math.round(20 + lt * 100);
                g = Math.round(255 - lt * 100);
                b = Math.round(255 - lt * 100);
            } else {
                const lt = (t - 0.8) / 0.2;
                r = Math.round(120 + lt * 135);
                g = Math.round(155 + lt * 100);
                b = Math.round(155 + lt * 100);
            }
            
            table[i * 3] = r;
            table[i * 3 + 1] = g;
            table[i * 3 + 2] = b;
        }
        return table;
    }
    
    createPalette_FireAndIce() {
        const table = new Uint8Array(256 * 3);
        for (let i = 0; i < 256; i++) {
            const t = Math.pow(i / 255, 0.55);
            let r, g, b;
            
            if (t < 0.2) {
                const lt = t / 0.2;
                r = Math.round(10 + lt * 20);
                g = Math.round(20 + lt * 60);
                b = Math.round(80 + lt * 100);
            } else if (t < 0.4) {
                const lt = (t - 0.2) / 0.2;
                r = Math.round(30 + lt * 30);
                g = Math.round(80 + lt * 100);
                b = Math.round(180 + lt * 75);
            } else if (t < 0.6) {
                const lt = (t - 0.4) / 0.2;
                r = Math.round(60 + lt * 150);
                g = Math.round(180 - lt * 100);
                b = Math.round(255 - lt * 180);
            } else if (t < 0.8) {
                const lt = (t - 0.6) / 0.2;
                r = Math.round(210 + lt * 45);
                g = Math.round(80 - lt * 50);
                b = Math.round(75 - lt * 75);
            } else {
                const lt = (t - 0.8) / 0.2;
                r = Math.round(255);
                g = Math.round(30 + lt * 50);
                b = Math.round(0 + lt * 20);
            }
            
            table[i * 3] = r;
            table[i * 3 + 1] = g;
            table[i * 3 + 2] = b;
        }
        return table;
    }
    
    createPalette_AuroraBorealis() {
        const table = new Uint8Array(256 * 3);
        for (let i = 0; i < 256; i++) {
            const t = Math.pow(i / 255, 0.55);
            let r, g, b;
            
            if (t < 0.2) {
                const lt = t / 0.2;
                r = Math.round(10 + lt * 30);
                g = Math.round(60 + lt * 80);
                b = Math.round(40 + lt * 60);
            } else if (t < 0.4) {
                const lt = (t - 0.2) / 0.2;
                r = Math.round(40 + lt * 60);
                g = Math.round(140 + lt * 115);
                b = Math.round(100 + lt * 80);
            } else if (t < 0.6) {
                const lt = (t - 0.4) / 0.2;
                r = Math.round(100 + lt * 100);
                g = Math.round(255 - lt * 80);
                b = Math.round(180 + lt * 50);
            } else if (t < 0.8) {
                const lt = (t - 0.6) / 0.2;
                r = Math.round(200 + lt * 55);
                g = Math.round(175 - lt * 100);
                b = Math.round(230 + lt * 25);
            } else {
                const lt = (t - 0.8) / 0.2;
                r = Math.round(255 - lt * 55);
                g = Math.round(75 + lt * 180);
                b = Math.round(255);
            }
            
            table[i * 3] = r;
            table[i * 3 + 1] = g;
            table[i * 3 + 2] = b;
        }
        return table;
    }
    
    createPalette_CandyAcid() {
        const table = new Uint8Array(256 * 3);
        for (let i = 0; i < 256; i++) {
            const t = Math.pow(i / 255, 0.55);
            let r, g, b;
            
            if (t < 0.2) {
                const lt = t / 0.2;
                r = Math.round(100 + lt * 100);
                g = Math.round(40 + lt * 60);
                b = Math.round(80 + lt * 80);
            } else if (t < 0.4) {
                const lt = (t - 0.2) / 0.2;
                r = Math.round(200 + lt * 55);
                g = Math.round(100 + lt * 100);
                b = Math.round(160 - lt * 80);
            } else if (t < 0.6) {
                const lt = (t - 0.4) / 0.2;
                r = Math.round(255 - lt * 155);
                g = Math.round(200 + lt * 55);
                b = Math.round(80);
            } else if (t < 0.8) {
                const lt = (t - 0.6) / 0.2;
                r = Math.round(100 - lt * 100);
                g = Math.round(255 - lt * 50);
                b = Math.round(80 - lt * 80);
            } else {
                const lt = (t - 0.8) / 0.2;
                r = Math.round(0 + lt * 50);
                g = Math.round(205 + lt * 50);
                b = Math.round(0 + lt * 100);
            }
            
            table[i * 3] = r;
            table[i * 3 + 1] = g;
            table[i * 3 + 2] = b;
        }
        return table;
    }
    
    createPalette_MidnightDream_Classic() {
        const table = new Uint8Array(256 * 3);
        for (let i = 0; i < 256; i++) {
            const t = Math.pow(i / 255, 0.55);
            let r, g, b;
            
            if (t < 0.25) {
                const lt = t / 0.25;
                r = Math.round(5 + lt * 15);
                g = Math.round(5 + lt * 20);
                b = Math.round(15 + lt * 40);
            } else if (t < 0.5) {
                const lt = (t - 0.25) / 0.25;
                r = Math.round(20 + lt * 30);
                g = Math.round(25 + lt * 80);
                b = Math.round(55 + lt * 120);
            } else if (t < 0.75) {
                const lt = (t - 0.5) / 0.25;
                r = Math.round(50 + lt * 100);
                g = Math.round(105 + lt * 100);
                b = Math.round(175 + lt * 80);
            } else {
                const lt = (t - 0.75) / 0.25;
                r = Math.round(150 + lt * 105);
                g = Math.round(205 + lt * 50);
                b = Math.round(255);
            }
            
            table[i * 3] = r;
            table[i * 3 + 1] = g;
            table[i * 3 + 2] = b;
        }
        return table;
    }
    
    createPalette_MidnightDream_WhitePronounced() {
        // Noir → Bleu → BLANC TRÈS INTENSE
        const table = new Uint8Array(256 * 3);
        for (let i = 0; i < 256; i++) {
            const t = Math.pow(i / 255, 0.55);
            let r, g, b;
            
            if (t < 0.25) {
                const lt = t / 0.25;
                r = Math.round(2 + lt * 10);
                g = Math.round(2 + lt * 15);
                b = Math.round(10 + lt * 35);
            } else if (t < 0.5) {
                const lt = (t - 0.25) / 0.25;
                r = Math.round(12 + lt * 30);
                g = Math.round(17 + lt * 80);
                b = Math.round(45 + lt * 130);
            } else if (t < 0.75) {
                const lt = (t - 0.5) / 0.25;
                r = Math.round(42 + lt * 120);
                g = Math.round(97 + lt * 130);
                b = Math.round(175 + lt * 80);
            } else {
                const lt = (t - 0.75) / 0.25;
                r = Math.round(162 + lt * 93);
                g = Math.round(227 + lt * 28);
                b = Math.round(255);
            }
            
            table[i * 3] = r;
            table[i * 3 + 1] = g;
            table[i * 3 + 2] = b;
        }
        return table;
    }
    
    createPalette_MidnightDream_Violet() {
        // Noir → Bleu → Violet → Blanc
        const table = new Uint8Array(256 * 3);
        for (let i = 0; i < 256; i++) {
            const t = Math.pow(i / 255, 0.55);
            let r, g, b;
            
            if (t < 0.25) {
                const lt = t / 0.25;
                r = Math.round(5 + lt * 15);
                g = Math.round(2 + lt * 10);
                b = Math.round(20 + lt * 40);
            } else if (t < 0.5) {
                const lt = (t - 0.25) / 0.25;
                r = Math.round(20 + lt * 50);
                g = Math.round(12 + lt * 40);
                b = Math.round(60 + lt * 130);
            } else if (t < 0.75) {
                const lt = (t - 0.5) / 0.25;
                r = Math.round(70 + lt * 120);
                g = Math.round(52 - lt * 30);
                b = Math.round(190 + lt * 65);
            } else {
                const lt = (t - 0.75) / 0.25;
                r = Math.round(190 + lt * 65);
                g = Math.round(22 + lt * 130);
                b = Math.round(255);
            }
            
            table[i * 3] = r;
            table[i * 3 + 1] = g;
            table[i * 3 + 2] = b;
        }
        return table;
    }
    
    createPalette_MidnightDream_Cyan() {
        // Noir → Bleu → Cyan → Blanc
        const table = new Uint8Array(256 * 3);
        for (let i = 0; i < 256; i++) {
            const t = Math.pow(i / 255, 0.55);
            let r, g, b;
            
            if (t < 0.25) {
                const lt = t / 0.25;
                r = Math.round(3 + lt * 12);
                g = Math.round(8 + lt * 25);
                b = Math.round(20 + lt * 40);
            } else if (t < 0.5) {
                const lt = (t - 0.25) / 0.25;
                r = Math.round(15 + lt * 25);
                g = Math.round(33 + lt * 90);
                b = Math.round(60 + lt * 130);
            } else if (t < 0.75) {
                const lt = (t - 0.5) / 0.25;
                r = Math.round(40 + lt * 80);
                g = Math.round(123 + lt * 130);
                b = Math.round(190 + lt * 65);
            } else {
                const lt = (t - 0.75) / 0.25;
                r = Math.round(120 + lt * 135);
                g = Math.round(253);
                b = Math.round(255);
            }
            
            table[i * 3] = r;
            table[i * 3 + 1] = g;
            table[i * 3 + 2] = b;
        }
        return table;
    }
    
    createPalette_MidnightDream_Rose() {
        // Noir → Bleu → Rose → Blanc
        const table = new Uint8Array(256 * 3);
        for (let i = 0; i < 256; i++) {
            const t = Math.pow(i / 255, 0.55);
            let r, g, b;
            
            if (t < 0.25) {
                const lt = t / 0.25;
                r = Math.round(8 + lt * 15);
                g = Math.round(5 + lt * 15);
                b = Math.round(15 + lt * 45);
            } else if (t < 0.5) {
                const lt = (t - 0.25) / 0.25;
                r = Math.round(23 + lt * 40);
                g = Math.round(20 + lt * 60);
                b = Math.round(60 + lt * 110);
            } else if (t < 0.75) {
                const lt = (t - 0.5) / 0.25;
                r = Math.round(63 + lt * 110);
                g = Math.round(80 + lt * 80);
                b = Math.round(170 + lt * 50);
            } else {
                const lt = (t - 0.75) / 0.25;
                r = Math.round(173 + lt * 82);
                g = Math.round(160 + lt * 95);
                b = Math.round(220 + lt * 35);
            }
            
            table[i * 3] = r;
            table[i * 3 + 1] = g;
            table[i * 3 + 2] = b;
        }
        return table;
    }
    
    createPalette_MidnightDream_Darker() {
        // Très sombre au début (plus noir), puis bleu → blanc
        const table = new Uint8Array(256 * 3);
        for (let i = 0; i < 256; i++) {
            const t = Math.pow(i / 255, 0.55);
            let r, g, b;
            
            if (t < 0.3) {
                const lt = t / 0.3;
                r = Math.round(1 + lt * 8);
                g = Math.round(1 + lt * 10);
                b = Math.round(5 + lt * 25);
            } else if (t < 0.55) {
                const lt = (t - 0.3) / 0.25;
                r = Math.round(9 + lt * 25);
                g = Math.round(11 + lt * 75);
                b = Math.round(30 + lt * 130);
            } else if (t < 0.8) {
                const lt = (t - 0.55) / 0.25;
                r = Math.round(34 + lt * 110);
                g = Math.round(86 + lt * 110);
                b = Math.round(160 + lt * 80);
            } else {
                const lt = (t - 0.8) / 0.2;
                r = Math.round(144 + lt * 111);
                g = Math.round(196 + lt * 59);
                b = Math.round(240 + lt * 15);
            }
            
            table[i * 3] = r;
            table[i * 3 + 1] = g;
            table[i * 3 + 2] = b;
        }
        return table;
    }
    
    createPalette_MidnightDream_Lighter() {
        // Plus clair partout, blanc plus précoce
        const table = new Uint8Array(256 * 3);
        for (let i = 0; i < 256; i++) {
            const t = Math.pow(i / 255, 0.55);
            let r, g, b;
            
            if (t < 0.2) {
                const lt = t / 0.2;
                r = Math.round(10 + lt * 20);
                g = Math.round(15 + lt * 35);
                b = Math.round(30 + lt * 50);
            } else if (t < 0.45) {
                const lt = (t - 0.2) / 0.25;
                r = Math.round(30 + lt * 40);
                g = Math.round(50 + lt * 90);
                b = Math.round(80 + lt * 120);
            } else if (t < 0.7) {
                const lt = (t - 0.45) / 0.25;
                r = Math.round(70 + lt * 110);
                g = Math.round(140 + lt * 85);
                b = Math.round(200 + lt * 40);
            } else {
                const lt = (t - 0.7) / 0.3;
                r = Math.round(180 + lt * 75);
                g = Math.round(225 + lt * 30);
                b = Math.round(240 + lt * 15);
            }
            
            table[i * 3] = r;
            table[i * 3 + 1] = g;
            table[i * 3 + 2] = b;
        }
        return table;
    }
    
    createPalette_MidnightDream_Turquoise() {
        // Noir → Bleu → Turquoise → Blanc
        const table = new Uint8Array(256 * 3);
        for (let i = 0; i < 256; i++) {
            const t = Math.pow(i / 255, 0.55);
            let r, g, b;
            
            if (t < 0.25) {
                const lt = t / 0.25;
                r = Math.round(5 + lt * 10);
                g = Math.round(15 + lt * 35);
                b = Math.round(25 + lt * 45);
            } else if (t < 0.5) {
                const lt = (t - 0.25) / 0.25;
                r = Math.round(15 + lt * 20);
                g = Math.round(50 + lt * 100);
                b = Math.round(70 + lt * 120);
            } else if (t < 0.75) {
                const lt = (t - 0.5) / 0.25;
                r = Math.round(35 + lt * 90);
                g = Math.round(150 + lt * 105);
                b = Math.round(190 + lt * 65);
            } else {
                const lt = (t - 0.75) / 0.25;
                r = Math.round(125 + lt * 130);
                g = Math.round(255);
                b = Math.round(255);
            }
            
            table[i * 3] = r;
            table[i * 3 + 1] = g;
            table[i * 3 + 2] = b;
        }
        return table;
    }
    
    createPalette_MidnightDream_Magenta() {
        // Noir → Bleu → Magenta → Blanc
        const table = new Uint8Array(256 * 3);
        for (let i = 0; i < 256; i++) {
            const t = Math.pow(i / 255, 0.55);
            let r, g, b;
            
            if (t < 0.25) {
                const lt = t / 0.25;
                r = Math.round(10 + lt * 15);
                g = Math.round(5 + lt * 10);
                b = Math.round(20 + lt * 45);
            } else if (t < 0.5) {
                const lt = (t - 0.25) / 0.25;
                r = Math.round(25 + lt * 50);
                g = Math.round(15 + lt * 30);
                b = Math.round(65 + lt * 130);
            } else if (t < 0.75) {
                const lt = (t - 0.5) / 0.25;
                r = Math.round(75 + lt * 130);
                g = Math.round(45 - lt * 20);
                b = Math.round(195 + lt * 60);
            } else {
                const lt = (t - 0.75) / 0.25;
                r = Math.round(205 + lt * 50);
                g = Math.round(25 + lt * 130);
                b = Math.round(255);
            }
            
            table[i * 3] = r;
            table[i * 3 + 1] = g;
            table[i * 3 + 2] = b;
        }
        return table;
    }
    
    createPalette_MidnightDream_Glacier() {
        // Bleu glacier profond → Bleu glacier → Blanc glacé
        const table = new Uint8Array(256 * 3);
        for (let i = 0; i < 256; i++) {
            const t = Math.pow(i / 255, 0.55);
            let r, g, b;
            
            if (t < 0.25) {
                const lt = t / 0.25;
                r = Math.round(8 + lt * 12);
                g = Math.round(20 + lt * 30);
                b = Math.round(35 + lt * 35);
            } else if (t < 0.5) {
                const lt = (t - 0.25) / 0.25;
                r = Math.round(20 + lt * 35);
                g = Math.round(50 + lt * 85);
                b = Math.round(70 + lt * 115);
            } else if (t < 0.75) {
                const lt = (t - 0.5) / 0.25;
                r = Math.round(55 + lt * 105);
                g = Math.round(135 + lt * 110);
                b = Math.round(185 + lt * 60);
            } else {
                const lt = (t - 0.75) / 0.25;
                r = Math.round(160 + lt * 95);
                g = Math.round(245 + lt * 10);
                b = Math.round(245 + lt * 10);
            }
            
            table[i * 3] = r;
            table[i * 3 + 1] = g;
            table[i * 3 + 2] = b;
        }
        return table;
    }
    
    createPalette_MonochromeBleu() {
        const table = new Uint8Array(256 * 3);
        for (let i = 0; i < 256; i++) {
            const t = Math.pow(i / 255, 0.55);
            let r, g, b;
            
            // Tous les tons du bleu, du foncé au clair
            r = Math.round(10 + t * 190);
            g = Math.round(40 + t * 180);
            b = Math.round(100 + t * 155);
            
            table[i * 3] = r;
            table[i * 3 + 1] = g;
            table[i * 3 + 2] = b;
        }
        return table;
    }
    
    createPalette_LavaSmoke() {
        const table = new Uint8Array(256 * 3);
        for (let i = 0; i < 256; i++) {
            const t = Math.pow(i / 255, 0.55);
            let r, g, b;
            
            if (t < 0.25) {
                const lt = t / 0.25;
                r = Math.round(50 + lt * 40);
                g = Math.round(50 + lt * 40);
                b = Math.round(50 + lt * 40);
            } else if (t < 0.5) {
                const lt = (t - 0.25) / 0.25;
                r = Math.round(90 + lt * 100);
                g = Math.round(90 - lt * 50);
                b = Math.round(90 - lt * 80);
            } else if (t < 0.75) {
                const lt = (t - 0.5) / 0.25;
                r = Math.round(190 + lt * 65);
                g = Math.round(40 + lt * 80);
                b = Math.round(10 + lt * 50);
            } else {
                const lt = (t - 0.75) / 0.25;
                r = Math.round(255);
                g = Math.round(120 + lt * 60);
                b = Math.round(60 + lt * 100);
            }
            
            table[i * 3] = r;
            table[i * 3 + 1] = g;
            table[i * 3 + 2] = b;
        }
        return table;
    }
    
    createPalette_Cyberpunk() {
        const table = new Uint8Array(256 * 3);
        for (let i = 0; i < 256; i++) {
            const t = Math.pow(i / 255, 0.55);
            let r, g, b;
            
            if (t < 0.25) {
                const lt = t / 0.25;
                r = Math.round(80 + lt * 100);
                g = Math.round(10 + lt * 40);
                b = Math.round(100 + lt * 100);
            } else if (t < 0.5) {
                const lt = (t - 0.25) / 0.25;
                r = Math.round(180 + lt * 75);
                g = Math.round(50 + lt * 100);
                b = Math.round(200 - lt * 100);
            } else if (t < 0.75) {
                const lt = (t - 0.5) / 0.25;
                r = Math.round(255 - lt * 180);
                g = Math.round(150 + lt * 105);
                b = Math.round(100 + lt * 155);
            } else {
                const lt = (t - 0.75) / 0.25;
                r = Math.round(75 + lt * 180);
                g = Math.round(255);
                b = Math.round(255);
            }
            
            table[i * 3] = r;
            table[i * 3 + 1] = g;
            table[i * 3 + 2] = b;
        }
        return table;
    }
    
    createPalette_Tropical() {
        const table = new Uint8Array(256 * 3);
        for (let i = 0; i < 256; i++) {
            const t = Math.pow(i / 255, 0.55);
            let r, g, b;
            
            if (t < 0.2) {
                const lt = t / 0.2;
                r = Math.round(10 + lt * 30);
                g = Math.round(80 + lt * 80);
                b = Math.round(30 + lt * 50);
            } else if (t < 0.4) {
                const lt = (t - 0.2) / 0.2;
                r = Math.round(40 + lt * 50);
                g = Math.round(160 + lt * 95);
                b = Math.round(80 + lt * 175);
            } else if (t < 0.6) {
                const lt = (t - 0.4) / 0.2;
                r = Math.round(90 + lt * 100);
                g = Math.round(255 - lt * 50);
                b = Math.round(255 - lt * 80);
            } else if (t < 0.8) {
                const lt = (t - 0.6) / 0.2;
                r = Math.round(190 + lt * 50);
                g = Math.round(205 - lt * 100);
                b = Math.round(175 - lt * 75);
            } else {
                const lt = (t - 0.8) / 0.2;
                r = Math.round(240 + lt * 15);
                g = Math.round(105 + lt * 100);
                b = Math.round(100 + lt * 80);
            }
            
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
        // Convertir position écran en position grille
        const scaleX = this.gridW / rect.width;
        const scaleY = this.gridH / rect.height;
        this.mouseX = Math.floor((e.clientX - rect.left) * scaleX);
        this.mouseY = Math.floor((e.clientY - rect.top) * scaleY);
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
        
        // Centre de la grille
        const centerX = gridW / 2;
        const centerY = gridH / 2;
        
        // Rayon de dispersion autour du centre (en pixels de grille)
        const spreadRadius = Math.min(gridW, gridH) * 0.15;
        
        for (let i = 0; i < 200; i++) {
            // Générer des points autour du centre avec une distribution gaussienne
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * spreadRadius;
            
            const x = Math.floor(centerX + Math.cos(angle) * distance);
            const y = Math.floor(centerY + Math.sin(angle) * distance);
            
            // S'assurer que les coordonnées sont dans les limites
            const clampedX = Math.max(0, Math.min(gridW - 1, x));
            const clampedY = Math.max(0, Math.min(gridH - 1, y));
            
            B[clampedY * gridW + clampedX] = 0.8 + Math.random() * 0.2;
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
        const B = this.B;
        const data = this.data;
        const colorTable = this.colorTable;
        
        // Rendu direct 1:1 sur le petit canvas (beaucoup plus rapide)
        for (let y = 0; y < gridH; y++) {
            const yRow = y * gridW;
            const rowOffset = y * gridW * 4;
            
            for (let x = 0; x < gridW; x++) {
                const b = B[yRow + x];
                const colorIdx = (b * 255 | 0) * 3;
                const pixelIdx = rowOffset + x * 4;
                
                data[pixelIdx] = colorTable[colorIdx];
                data[pixelIdx + 1] = colorTable[colorIdx + 1];
                data[pixelIdx + 2] = colorTable[colorIdx + 2];
                data[pixelIdx + 3] = 255;
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
        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;
        
        // Recalculer la résolution adaptative pour le nouvel écran
        this.resolution = this.calculateAdaptiveResolution();
        
        this.gridW = Math.floor(this.screenWidth / this.resolution);
        this.gridH = Math.floor(this.screenHeight / this.resolution);
        
        // Canvas à la taille de la grille, CSS à la taille écran
        this.canvas.width = this.gridW;
        this.canvas.height = this.gridH;
        this.canvas.style.width = this.screenWidth + 'px';
        this.canvas.style.height = this.screenHeight + 'px';
        
        const size = this.gridW * this.gridH;
        this.A = new Float32Array(size).fill(1);
        this.B = new Float32Array(size).fill(0);
        this.nextA = new Float32Array(size).fill(1);
        this.nextB = new Float32Array(size).fill(0);
        this.initializeWithSpots();
        
        this.imageData = this.ctx.createImageData(this.gridW, this.gridH);
        this.data = this.imageData.data;
    }
    
    // Calcule une résolution adaptative basée sur la taille de l'écran
    // Grâce à l'optimisation du rendu, on peut utiliser des résolutions plus fines
    calculateAdaptiveResolution() {
        const totalPixels = window.innerWidth * window.innerHeight;
        const devicePixelRatio = window.devicePixelRatio || 1;
        const effectivePixels = totalPixels * devicePixelRatio;
        
        // Seuils ajustés - résolutions plus fines grâce à l'optimisation
        if (effectivePixels > 12000000) {
            // Très grand écran (4K+ avec high DPI)
            return 6;
        } else if (effectivePixels > 6000000) {
            // Grand écran (4K ou 1440p avec high DPI)
            return 5;
        } else if (effectivePixels > 3000000) {
            // Écran moyen-grand (1440p ou Full HD avec high DPI)
            return 4;
        } else {
            // Écran standard (Full HD ou moins)
            return 3;
        }
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
