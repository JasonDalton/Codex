class RandomLetterApp {
    constructor() {
        this.alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        this.excludedLetters = new Set();
        this.withReplacement = false;
        this.usedLetters = new Set();
        this.fadeTimeout = null;
        
        this.init();
    }

    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.renderLettersGrid();
        this.updateUI();
    }

    setupEventListeners() {
        document.getElementById('generateBtn').addEventListener('click', () => this.generateLetter());
        document.getElementById('settingsBtn').addEventListener('click', () => this.showSettings());
        document.getElementById('backBtn').addEventListener('click', () => this.showMain());
        document.getElementById('withReplacementBtn').addEventListener('click', () => this.setReplacementMode(true));
        document.getElementById('withoutReplacementBtn').addEventListener('click', () => this.setReplacementMode(false));
    }

    renderLettersGrid() {
        const grid = document.getElementById('lettersGrid');
        grid.innerHTML = '';
        
        this.alphabet.forEach(letter => {
            const btn = document.createElement('button');
            btn.className = 'letter-btn';
            btn.textContent = letter;
            btn.dataset.letter = letter;
            
            if (this.excludedLetters.has(letter)) {
                btn.classList.add('excluded');
            } else {
                btn.classList.add('included');
            }
            
            btn.addEventListener('click', () => this.toggleLetter(letter));
            grid.appendChild(btn);
        });
    }

    toggleLetter(letter) {
        if (this.excludedLetters.has(letter)) {
            this.excludedLetters.delete(letter);
        } else {
            this.excludedLetters.add(letter);
        }
        
        this.saveSettings();
        this.renderLettersGrid();
        this.updateUI();
    }

    setReplacementMode(withReplacement) {
        this.withReplacement = withReplacement;
        
        if (withReplacement) {
            document.getElementById('withReplacementBtn').classList.add('active');
            document.getElementById('withoutReplacementBtn').classList.remove('active');
        } else {
            document.getElementById('withReplacementBtn').classList.remove('active');
            document.getElementById('withoutReplacementBtn').classList.add('active');
        }
        
        // Reset used letters when switching modes
        this.usedLetters.clear();
        this.saveSettings();
    }

    getAvailableLetters() {
        return this.alphabet.filter(letter => !this.excludedLetters.has(letter));
    }

    generateLetter() {
        const available = this.getAvailableLetters();
        
        if (available.length === 0) {
            alert('No letters available. Please unexclude some letters in settings.');
            return;
        }

        let letter;
        
        if (this.withReplacement) {
            // Simple random selection with replacement
            letter = available[Math.floor(Math.random() * available.length)];
        } else {
            // Without replacement: track used letters
            const unused = available.filter(l => !this.usedLetters.has(l));
            
            if (unused.length === 0) {
                // All letters used, reset
                this.usedLetters.clear();
                letter = available[Math.floor(Math.random() * available.length)];
            } else {
                letter = unused[Math.floor(Math.random() * unused.length)];
            }
            
            this.usedLetters.add(letter);
        }

        this.displayLetter(letter);
    }

    displayLetter(letter) {
        const output = document.getElementById('letterOutput');
        
        // Clear any existing fade timeout
        if (this.fadeTimeout) {
            clearTimeout(this.fadeTimeout);
            this.fadeTimeout = null;
        }
        
        // Remove any fading-out class if present
        output.classList.remove('fading-out');
        
        // Animate in the new letter (directly from current state)
        output.classList.add('animating');
        
        setTimeout(() => {
            output.textContent = letter;
            output.classList.remove('animating');
            
            // Fade back to question mark after 3 seconds
            this.fadeTimeout = setTimeout(() => {
                output.classList.add('fading-out');
                setTimeout(() => {
                    output.textContent = '?';
                    output.classList.remove('fading-out');
                }, 500);
            }, 3000);
        }, 150);
    }

    updateUI() {
        const available = this.getAvailableLetters();
        const generateBtn = document.getElementById('generateBtn');
        
        if (available.length === 0) {
            generateBtn.disabled = true;
            generateBtn.textContent = 'No Letters Available';
        } else {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Letter';
        }
    }

    showSettings() {
        document.getElementById('mainView').classList.remove('active');
        document.getElementById('settingsView').classList.add('active');
    }

    showMain() {
        document.getElementById('settingsView').classList.remove('active');
        document.getElementById('mainView').classList.add('active');
    }

    saveSettings() {
        const settings = {
            excludedLetters: Array.from(this.excludedLetters),
            withReplacement: this.withReplacement,
            usedLetters: Array.from(this.usedLetters)
        };
        localStorage.setItem('randomLetterSettings', JSON.stringify(settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('randomLetterSettings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.excludedLetters = new Set(settings.excludedLetters || []);
                this.withReplacement = settings.withReplacement !== undefined ? settings.withReplacement : false;
                this.usedLetters = new Set(settings.usedLetters || []);
            } catch (e) {
                console.error('Error loading settings:', e);
            }
        }
        
        // Update UI to reflect loaded settings
        if (this.withReplacement) {
            document.getElementById('withReplacementBtn').classList.add('active');
            document.getElementById('withoutReplacementBtn').classList.remove('active');
        } else {
            document.getElementById('withReplacementBtn').classList.remove('active');
            document.getElementById('withoutReplacementBtn').classList.add('active');
        }
    }
}

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/Codex/service-worker.js')
            .then((registration) => {
                console.log('Service Worker registered:', registration);
            })
            .catch((err) => {
                console.log('Service worker registration failed:', err);
            });
    });
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new RandomLetterApp());
} else {
    new RandomLetterApp();
}

