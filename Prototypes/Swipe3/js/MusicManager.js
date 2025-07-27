class MusicManager {
    static currentMusic = null;
    static currentMusicKey = null;
    static isMuted = false;
    static bgMusicEnabled = true;

    static playBackgroundMusic(scene, musicKey) {
        console.log(`[MusicManager] playBackgroundMusic called with key: ${musicKey}, bgMusicEnabled: ${MusicManager.bgMusicEnabled}`);
        
        if (!MusicManager.bgMusicEnabled) {
            console.log('[MusicManager] Music disabled, returning');
            return;
        }

        // Check if we need to change music
        if (this.currentMusicKey === musicKey && this.currentMusic) {
            console.log('[MusicManager] Same music already playing, skipping');
            return;
        }

        // Stop current music if playing
        this.stopBackgroundMusic();

        // Play new music
        try {
            console.log(`[MusicManager] Attempting to play: ${musicKey}`);
            
            const soundConfig = {
                loop: true,
                volume: this.isMuted ? 0 : ((musicKey === 'bg_menu')? 0.5 : 1.0)
            };
            
            // Get the sound object from the sound manager
            const sound = scene.sound.addAudioSprite('soundbank');
            if (sound) {
                // Play the specific sprite
                sound.play(musicKey, soundConfig);
                this.currentMusic = sound;
                this.currentMusicKey = musicKey;
                console.log('[MusicManager] Music started successfully');
                console.log('[MusicManager] Sound object:', sound);
            } else {
                console.error('[MusicManager] Failed to create sound object');
            }
        } catch (e) {
            console.error('[MusicManager] Error playing background music:', e);
            this.currentMusic = null;
            this.currentMusicKey = null;
        }
    }

    static stopBackgroundMusic() {
        if (this.currentMusic) {
            console.log(`[MusicManager] Stopping music: ${this.currentMusicKey}`);
            try {
                // Phaser audio sprites have isPlaying property and stop() method
                if (this.currentMusic.isPlaying) {
                    this.currentMusic.stop();
                }
                // Remove reference
                this.currentMusic = null;
                this.currentMusicKey = null;
                console.log('[MusicManager] Music stopped');
            } catch (e) {
                console.error('[MusicManager] Error stopping music:', e);
                // Force cleanup even if error
                this.currentMusic = null;
                this.currentMusicKey = null;
            }
        }
    }

    static pauseBackgroundMusic() {
        if (this.currentMusic && this.currentMusic.isPlaying) {
            try {
                this.currentMusic.pause();
            } catch (e) {
                console.error('[MusicManager] Error pausing music:', e);
            }
        }
    }

    static resumeBackgroundMusic() {
        if (this.currentMusic && this.currentMusic.isPaused) {
            try {
                this.currentMusic.resume();
            } catch (e) {
                console.error('[MusicManager] Error resuming music:', e);
            }
        }
    }

    static updateMusicState() {
        if (!MusicManager.bgMusicEnabled) {
            this.stopBackgroundMusic();
        } else if (this.currentMusic && this.currentMusic.isPaused) {
            this.resumeBackgroundMusic();
        }
    }

    static muteBackgroundMusic() {
        if (this.currentMusic && !this.isMuted) {
            try {
                this.currentMusic.setVolume(0);
            } catch (e) {
                console.error('[MusicManager] Error muting music:', e);
            }
            this.isMuted = true;
        }
    }

    static unmuteBackgroundMusic() {
        if (this.currentMusic && this.isMuted) {
            try {
                if (this.currentMusicKey == 'bg_menu') {
                    this.currentMusic.setVolume(0.5);
                }
                else {
                    this.currentMusic.setVolume(1.0);
                }
            } catch (e) {
                console.error('[MusicManager] Error unmuting music:', e);
            }
        }
        this.isMuted = false;
    }
}

// Global function to toggle background music
function toggleBackgroundMusic(enabled) {
    MusicManager.bgMusicEnabled = enabled;
    MusicManager.updateMusicState();
}

// Global functions to temporarily mute/unmute
function muteBackgroundMusic() {
    MusicManager.muteBackgroundMusic();
}

function unmuteBackgroundMusic() {
    MusicManager.unmuteBackgroundMusic();
}