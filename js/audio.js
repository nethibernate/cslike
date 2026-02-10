// FrostBite Arena - 音效系统
class AudioManager {
    constructor() {
        this.context = null;
        this.masterGain = null;
        this.sounds = {};
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.context.createGain();
            this.masterGain.connect(this.context.destination);
            this.masterGain.gain.value = CONFIG.settings.volume;

            // 生成合成音效
            this.generateSounds();
            this.initialized = true;
        } catch (e) {
            console.warn('Audio initialization failed:', e);
        }
    }

    generateSounds() {
        // 射击音效
        this.sounds.shoot_rifle = this.createShootSound(200, 0.1, 'sawtooth');
        this.sounds.shoot_smg = this.createShootSound(300, 0.08, 'square');
        this.sounds.shoot_shotgun = this.createShootSound(100, 0.2, 'sawtooth');
        this.sounds.shoot_sniper = this.createShootSound(80, 0.3, 'sawtooth');
        this.sounds.shoot_pistol = this.createShootSound(250, 0.1, 'square');

        // 其他音效
        this.sounds.reload = this.createClickSound(400, 0.15);
        this.sounds.empty = this.createClickSound(200, 0.05);
        this.sounds.hit = this.createHitSound();
        this.sounds.headshot = this.createHeadshotSound();
        this.sounds.pickup = this.createPickupSound();
        this.sounds.hurt = this.createHurtSound();
        this.sounds.death = this.createDeathSound();
        this.sounds.roundStart = this.createBeepSound(800, 0.3);
        this.sounds.roundEnd = this.createBeepSound(400, 0.5);
    }

    createShootSound(freq, duration, type) {
        return () => {
            if (!this.context) return;

            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            const filter = this.context.createBiquadFilter();

            osc.type = type;
            osc.frequency.value = freq;

            filter.type = 'lowpass';
            filter.frequency.value = 2000;

            gain.gain.setValueAtTime(0.3, this.context.currentTime);
            gain.gain.exponentialDecayTo = function (target, time) {
                this.exponentialRampToValueAtTime(target, time);
            };
            gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);

            osc.start();
            osc.stop(this.context.currentTime + duration);
        };
    }

    createClickSound(freq, duration) {
        return () => {
            if (!this.context) return;

            const osc = this.context.createOscillator();
            const gain = this.context.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;

            gain.gain.setValueAtTime(0.2, this.context.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start();
            osc.stop(this.context.currentTime + duration);
        };
    }

    createHitSound() {
        return () => {
            if (!this.context) return;

            const osc = this.context.createOscillator();
            const gain = this.context.createGain();

            osc.type = 'sine';
            osc.frequency.value = 600;

            gain.gain.setValueAtTime(0.15, this.context.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.1);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start();
            osc.stop(this.context.currentTime + 0.1);
        };
    }

    createHeadshotSound() {
        return () => {
            if (!this.context) return;

            // 双音调表示爆头
            [800, 1200].forEach((freq, i) => {
                const osc = this.context.createOscillator();
                const gain = this.context.createGain();

                osc.type = 'sine';
                osc.frequency.value = freq;

                const startTime = this.context.currentTime + i * 0.05;
                gain.gain.setValueAtTime(0.2, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);

                osc.connect(gain);
                gain.connect(this.masterGain);

                osc.start(startTime);
                osc.stop(startTime + 0.1);
            });
        };
    }

    createPickupSound() {
        return () => {
            if (!this.context) return;

            [400, 600, 800].forEach((freq, i) => {
                const osc = this.context.createOscillator();
                const gain = this.context.createGain();

                osc.type = 'sine';
                osc.frequency.value = freq;

                const startTime = this.context.currentTime + i * 0.05;
                gain.gain.setValueAtTime(0.1, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);

                osc.connect(gain);
                gain.connect(this.masterGain);

                osc.start(startTime);
                osc.stop(startTime + 0.1);
            });
        };
    }

    createHurtSound() {
        return () => {
            if (!this.context) return;

            const osc = this.context.createOscillator();
            const gain = this.context.createGain();

            osc.type = 'sawtooth';
            osc.frequency.value = 150;

            gain.gain.setValueAtTime(0.2, this.context.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.2);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start();
            osc.stop(this.context.currentTime + 0.2);
        };
    }

    createDeathSound() {
        return () => {
            if (!this.context) return;

            const osc = this.context.createOscillator();
            const gain = this.context.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(300, this.context.currentTime);
            osc.frequency.exponentialRampToValueAtTime(50, this.context.currentTime + 0.5);

            gain.gain.setValueAtTime(0.3, this.context.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.5);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start();
            osc.stop(this.context.currentTime + 0.5);
        };
    }

    createBeepSound(freq, duration) {
        return () => {
            if (!this.context) return;

            const osc = this.context.createOscillator();
            const gain = this.context.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;

            gain.gain.setValueAtTime(0.2, this.context.currentTime);
            gain.gain.setValueAtTime(0.2, this.context.currentTime + duration - 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start();
            osc.stop(this.context.currentTime + duration);
        };
    }

    play(soundName) {
        if (!this.initialized) return;
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }

    setVolume(value) {
        CONFIG.settings.volume = value;
        if (this.masterGain) {
            this.masterGain.gain.value = value;
        }
    }

    resume() {
        if (this.context && this.context.state === 'suspended') {
            this.context.resume();
        }
    }
}

// 全局音频管理器
const audioManager = new AudioManager();
