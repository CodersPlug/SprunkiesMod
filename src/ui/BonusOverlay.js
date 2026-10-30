/**
 * BonusOverlay - Visual feedback for bonus triggers
 * Phase 5: Animated overlay when combos are detected
 *
 * Learning goals:
 * - DOM manipulation for overlays
 * - CSS animation triggering
 * - Timed visual sequences
 */

class BonusOverlay {
    constructor() {
        this.overlay = null;
        this.isShowing = false;
    }

    /**
     * Initialize the overlay element
     */
    init() {
        // Create overlay container
        this.overlay = document.createElement('div');
        this.overlay.className = 'bonus-overlay';
        this.overlay.innerHTML = `
            <div class="bonus-video-container">
                <video class="bonus-video" muted playsinline loop></video>
            </div>
            <div class="bonus-content">
                <div class="bonus-icon"></div>
                <h2 class="bonus-title"></h2>
                <p class="bonus-description"></p>
            </div>
            <div class="bonus-particles"></div>
        `;
        document.body.appendChild(this.overlay);

        console.log('[BonusOverlay] Initialized');
    }

    /**
     * Show bonus animation
     * @param {Object} bonus - Bonus definition
     */
    show(bonus) {
        if (this.isShowing) return;
        this.isShowing = true;

        const content = this.overlay.querySelector('.bonus-content');
        const icon = this.overlay.querySelector('.bonus-icon');
        const title = this.overlay.querySelector('.bonus-title');
        const description = this.overlay.querySelector('.bonus-description');
        const particles = this.overlay.querySelector('.bonus-particles');
        const videoContainer = this.overlay.querySelector('.bonus-video-container');
        const video = this.overlay.querySelector('.bonus-video');

        // Set content
        icon.textContent = bonus.icon;
        title.textContent = bonus.title;
        description.textContent = bonus.description;

        // Set animation type
        this.overlay.dataset.animation = bonus.animation;

        // Handle video if provided
        if (bonus.videoPath) {
            video.src = bonus.videoPath;
            videoContainer.classList.add('has-video');
            video.play().catch(err => {
                console.warn('[BonusOverlay] Video play failed:', err);
                videoContainer.classList.remove('has-video');
            });
        } else {
            videoContainer.classList.remove('has-video');
            video.src = '';
        }

        // Generate particles for fireworks animation
        if (bonus.animation === 'fireworks') {
            this.generateParticles(particles, 30);
        }

        // Show overlay
        this.overlay.classList.add('active');

        // Trigger entrance animation
        requestAnimationFrame(() => {
            content.classList.add('animate-in');
        });

        console.log('[BonusOverlay] Showing:', bonus.title);
    }

    /**
     * Hide the overlay
     */
    hide() {
        if (!this.isShowing) return;

        const content = this.overlay.querySelector('.bonus-content');
        const videoContainer = this.overlay.querySelector('.bonus-video-container');
        const video = this.overlay.querySelector('.bonus-video');

        content.classList.remove('animate-in');
        content.classList.add('animate-out');

        // Stop video
        video.pause();
        video.currentTime = 0;

        // Remove after animation
        setTimeout(() => {
            this.overlay.classList.remove('active');
            content.classList.remove('animate-out');
            videoContainer.classList.remove('has-video');
            video.src = '';
            this.overlay.querySelector('.bonus-particles').innerHTML = '';
            this.isShowing = false;
        }, 500);

        console.log('[BonusOverlay] Hidden');
    }

    /**
     * Generate particle elements for fireworks effect
     */
    generateParticles(container, count) {
        container.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.setProperty('--x', `${Math.random() * 200 - 100}vw`);
            particle.style.setProperty('--y', `${Math.random() * 200 - 100}vh`);
            particle.style.setProperty('--delay', `${Math.random() * 0.5}s`);
            particle.style.setProperty('--hue', `${Math.random() * 360}`);
            container.appendChild(particle);
        }
    }
}

// Global instance
const bonusOverlay = new BonusOverlay();
