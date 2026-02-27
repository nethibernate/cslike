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

            // 音量压低滤波器（闪光弹失聪效果）
            this.muffleFilter = this.context.createBiquadFilter();
            this.muffleFilter.type = 'lowpass';
            this.muffleFilter.frequency.value = 20000; // 正常时不过滤

            this.masterGain.connect(this.muffleFilter);
            this.muffleFilter.connect(this.context.destination);
            this.masterGain.gain.value = CONFIG.settings.volume;

            // 耳鸣状态
            this.tinnitusOsc = null;
            this.tinnitusGain = null;

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

    // 闪光弹爆炸声
    playFlashbangBang() {
        if (!this.context) return;

        // 短促的白噪声爆炸
        const bufferSize = this.context.sampleRate * 0.15;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
        }

        const source = this.context.createBufferSource();
        source.buffer = buffer;

        const gain = this.context.createGain();
        gain.gain.setValueAtTime(0.5, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.15);

        source.connect(gain);
        gain.connect(this.masterGain);
        source.start();
    }

    // 耳鸣效果
    playTinnitus(duration) {
        if (!this.context) return;

        this.stopTinnitus();

        this.tinnitusOsc = this.context.createOscillator();
        this.tinnitusGain = this.context.createGain();

        this.tinnitusOsc.type = 'sine';
        this.tinnitusOsc.frequency.value = 3500;

        // 耳鸣音量：先快速升高，然后缓慢淡出
        this.tinnitusGain.gain.setValueAtTime(0, this.context.currentTime);
        this.tinnitusGain.gain.linearRampToValueAtTime(0.25, this.context.currentTime + 0.1);
        this.tinnitusGain.gain.setValueAtTime(0.25, this.context.currentTime + duration * 0.3);
        this.tinnitusGain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);

        // 耳鸣直连输出（不经过 muffleFilter，因为它不应该被消音）
        this.tinnitusOsc.connect(this.tinnitusGain);
        this.tinnitusGain.connect(this.context.destination);

        this.tinnitusOsc.start();
        this.tinnitusOsc.stop(this.context.currentTime + duration);

        // 自动清理
        this.tinnitusOsc.onended = () => {
            this.tinnitusOsc = null;
            this.tinnitusGain = null;
        };
    }

    // 停止耳鸣
    stopTinnitus() {
        if (this.tinnitusOsc) {
            try { this.tinnitusOsc.stop(); } catch (e) { }
            this.tinnitusOsc = null;
            this.tinnitusGain = null;
        }
    }

    // 设置失聪效果（音频压低）
    setMuffled(enabled, duration = 3) {
        if (!this.muffleFilter) return;

        if (enabled) {
            // 压低所有游戏音效到闷声
            this.muffleFilter.frequency.cancelScheduledValues(this.context.currentTime);
            this.muffleFilter.frequency.setValueAtTime(300, this.context.currentTime);
            this.muffleFilter.frequency.exponentialRampToValueAtTime(20000, this.context.currentTime + duration);
        } else {
            this.muffleFilter.frequency.cancelScheduledValues(this.context.currentTime);
            this.muffleFilter.frequency.setValueAtTime(20000, this.context.currentTime);
        }
    }
}

// 全局音频管理器
const audioManager = new AudioManager();
