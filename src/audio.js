/**
 * 音频管理系统
 */

export class AudioManager {
    constructor() {
        this.musicPlaying = false;
        this.audioContext = null;
        this.backgroundMusic = null;
        this.sounds = {};
    }

    async init() {
        // 创建音频上下文
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // 创建背景音乐（使用振荡器模拟）
        this.createBackgroundMusic();
        
        // 创建音效
        this.createSoundEffects();
    }

    createBackgroundMusic() {
        // 使用 Web Audio API 创建简单的背景音乐
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        this.backgroundMusic = { oscillator, gainNode, started: false };
    }

    createSoundEffects() {
        // 点击音效
        this.sounds.click = () => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.1);
        };

        // 切换音效
        this.sounds.switch = () => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.2);
        };
    }

    toggleMusic() {
        if (!this.backgroundMusic) return;

        if (this.musicPlaying) {
            // 停止音乐
            this.backgroundMusic.gainNode.gain.exponentialRampToValueAtTime(
                0.01, 
                this.audioContext.currentTime + 0.5
            );
            this.musicPlaying = false;
        } else {
            // 开始音乐
            if (!this.backgroundMusic.started) {
                this.backgroundMusic.oscillator.start();
                this.backgroundMusic.started = true;
            }
            
            this.backgroundMusic.gainNode.gain.exponentialRampToValueAtTime(
                0.05, 
                this.audioContext.currentTime + 0.5
            );
            this.musicPlaying = true;
        }
    }

    isMusicPlaying() {
        return this.musicPlaying;
    }

    playClick() {
        if (this.sounds.click) {
            this.sounds.click();
        }
    }

    playSwitch() {
        if (this.sounds.switch) {
            this.sounds.switch();
        }
    }
}

