/**
 * 增强版音频管理系统 - 支持真实音频文件
 */

export class AudioManagerEnhanced {
    constructor() {
        this.musicPlaying = false;
        this.audioContext = null;
        this.backgroundMusic = null;
        this.sounds = {};
        this.schoolSongAudio = null; // 真实校歌音频
        this.useRealAudio = false; // 是否使用真实音频
    }

    async init() {
        // 创建音频上下文
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // 尝试加载真实校歌
        await this.loadSchoolSong();
        
        // 如果没有真实音频，使用合成音频
        if (!this.useRealAudio) {
            this.createBackgroundMusic();
        }
        
        // 创建音效
        this.createSoundEffects();
    }

    async loadSchoolSong() {
        try {
            // 尝试加载校歌音频
            const response = await fetch('/audio/school-song.mp3');
            
            if (response.ok) {
                this.schoolSongAudio = new Audio('/audio/school-song.mp3');
                this.schoolSongAudio.loop = true;
                this.schoolSongAudio.volume = 0.3; // 设置音量为30%
                this.useRealAudio = true;
                console.log('✅ 真实校歌音频加载成功');
            } else {
                console.log('⚠️ 校歌音频文件不存在，使用合成音频');
                this.useRealAudio = false;
            }
        } catch (error) {
            console.log('⚠️ 加载校歌音频失败，使用合成音频:', error);
            this.useRealAudio = false;
        }
    }

    createBackgroundMusic() {
        // 使用 Web Audio API 创建简单的背景音乐（备用）
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
        if (this.useRealAudio && this.schoolSongAudio) {
            // 使用真实校歌音频
            if (this.musicPlaying) {
                this.schoolSongAudio.pause();
                this.musicPlaying = false;
            } else {
                this.schoolSongAudio.play().catch(e => {
                    console.log('播放失败，可能需要用户交互:', e);
                });
                this.musicPlaying = true;
            }
        } else if (this.backgroundMusic) {
            // 使用合成音频（备用）
            if (this.musicPlaying) {
                this.backgroundMusic.gainNode.gain.exponentialRampToValueAtTime(
                    0.01, 
                    this.audioContext.currentTime + 0.5
                );
                this.musicPlaying = false;
            } else {
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

    getAudioType() {
        return this.useRealAudio ? '校歌' : '合成音乐';
    }

    /**
     * 自动播放校歌（页面加载时调用）
     */
    async autoPlaySchoolSong() {
        if (this.useRealAudio && this.schoolSongAudio && !this.musicPlaying) {
            try {
                await this.schoolSongAudio.play();
                this.musicPlaying = true;
                console.log('🎵 校歌自动播放成功');
                return true;
            } catch (error) {
                console.log('⚠️ 自动播放失败（浏览器限制），等待用户交互');
                // 添加点击事件监听，首次点击时播放
                document.addEventListener('click', () => {
                    if (!this.musicPlaying) {
                        this.schoolSongAudio.play().then(() => {
                            this.musicPlaying = true;
                            console.log('🎵 校歌开始播放（用户交互后）');
                        });
                    }
                }, { once: true });
                return false;
            }
        }
        return false;
    }

    /**
     * 停止校歌（切换到视频时调用）
     */
    stopSchoolSong() {
        if (this.useRealAudio && this.schoolSongAudio && this.musicPlaying) {
            this.schoolSongAudio.pause();
            this.musicPlaying = false;
            console.log('🔇 校歌已停止');
        }
    }

    /**
     * 恢复播放校歌（从视频切换回来时调用）
     */
    resumeSchoolSong() {
        if (this.useRealAudio && this.schoolSongAudio && !this.musicPlaying) {
            this.schoolSongAudio.play().catch(e => {
                console.log('恢复播放失败:', e);
            });
            this.musicPlaying = true;
            console.log('🎵 校歌恢复播放');
        }
    }
}

