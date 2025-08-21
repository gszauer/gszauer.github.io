export default class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.heartsDisplay = null;
        this.goldDisplay = null;
        this.levelDisplay = null;
        this.pauseButton = null;
        this.gameOverOverlay = null;
        this.gameOverText = null;
        this.winText = null;
        this.winGoldText = null;
        this.restartText = null;
    }
    
    create(config) {
        this.heartsDisplay = this.scene.add.text(20, 20, '', { 
            fontSize: config.ui.fontSize.medium, 
            fill: config.ui.colors.health 
        });
        
        this.goldDisplay = this.scene.add.text(20, 60, 'Gold: 0', { 
            fontSize: config.ui.fontSize.small, 
            fill: config.ui.colors.gold 
        });
        
        this.levelDisplay = this.scene.add.text(20, 100, '', { 
            fontSize: config.ui.fontSize.small, 
            fill: config.ui.colors.text 
        });
        
        this.gameOverOverlay = this.scene.add.graphics();
        this.gameOverOverlay.fillStyle(0x000000, 0.7);
        this.gameOverOverlay.fillRect(0, 0, this.scene.game.config.width, this.scene.game.config.height);
        this.gameOverOverlay.setVisible(false);
        
        this.gameOverText = this.scene.add.text(
            this.scene.game.config.width / 2, 
            this.scene.game.config.height / 2 - 50,
            'GAME OVER', {
            fontSize: config.ui.fontSize.large,
            fill: config.ui.colors.text
        }).setOrigin(0.5).setVisible(false);
        
        this.restartText = this.scene.add.text(
            this.scene.game.config.width / 2, 
            this.scene.game.config.height / 2 + 50,
            'Press SPACE or click to restart', {
            fontSize: config.ui.fontSize.small,
            fill: config.ui.colors.text
        }).setOrigin(0.5).setVisible(false);
        
        this.winText = this.scene.add.text(
            this.scene.game.config.width / 2, 
            this.scene.game.config.height / 2 - 50,
            'YOU WIN!', {
            fontSize: config.ui.fontSize.large,
            fill: '#00ff00'
        }).setOrigin(0.5).setVisible(false);
        
        this.winGoldText = this.scene.add.text(
            this.scene.game.config.width / 2, 
            this.scene.game.config.height / 2,
            '', {
            fontSize: config.ui.fontSize.medium,
            fill: config.ui.colors.gold
        }).setOrigin(0.5).setVisible(false);
        
        this.returnMenuText = this.scene.add.text(
            this.scene.game.config.width / 2, 
            this.scene.game.config.height / 2 + 100,
            'Press ESC to return to menu', {
            fontSize: config.ui.fontSize.small,
            fill: config.ui.colors.text
        }).setOrigin(0.5).setVisible(false);
    }
    
    updateHealth(current, max, iceShieldBonus = 0) {
        let heartsDisplay = '';
        
        // Calculate base max (without ice shield)
        const baseMax = max - iceShieldBonus;
        
        // Show regular hearts first (red/white)
        const regularHearts = Math.min(current, baseMax);
        for (let i = 0; i < regularHearts; i++) {
            heartsDisplay += '❤️ ';
        }
        
        // Show empty regular hearts for missing HP (up to base max)
        for (let i = regularHearts; i < baseMax; i++) {
            heartsDisplay += '🤍 ';
        }
        
        // Show blue hearts for ice shield (only show filled ones)
        if (iceShieldBonus > 0) {
            const currentIceHearts = Math.max(0, Math.min(iceShieldBonus, current - baseMax));
            
            // Only show filled blue hearts
            for (let i = 0; i < currentIceHearts; i++) {
                heartsDisplay += '💙 ';
            }
        }
        
        this.heartsDisplay.setText(heartsDisplay);
    }
    
    updateGold(amount) {
        this.goldDisplay.setText(`Gold: ${amount}`);
    }
    
    updateLevel(levelName) {
        this.levelDisplay.setText(`Level: ${levelName}`);
    }
    
    showGameOver() {
        this.gameOverOverlay.setVisible(true);
        this.gameOverText.setVisible(true);
        this.restartText.setVisible(true);
        this.returnMenuText.setVisible(true);
    }
    
    showWin(goldCollected) {
        this.gameOverOverlay.setVisible(true);
        this.winText.setVisible(true);
        this.winGoldText.setText(`Gold collected: ${goldCollected}`);
        this.winGoldText.setVisible(true);
        this.restartText.setVisible(true);
        this.returnMenuText.setVisible(true);
    }
    
    hideOverlays() {
        this.gameOverOverlay.setVisible(false);
        this.gameOverText.setVisible(false);
        this.winText.setVisible(false);
        this.winGoldText.setVisible(false);
        this.restartText.setVisible(false);
        this.returnMenuText.setVisible(false);
    }
    
    showMessage(text, duration = 2000) {
        const message = this.scene.add.text(
            this.scene.game.config.width / 2,
            this.scene.game.config.height / 2,
            text, {
            fontSize: '36px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        this.scene.tweens.add({
            targets: message,
            alpha: 0,
            y: message.y - 50,
            duration: duration,
            onComplete: () => {
                message.destroy();
            }
        });
    }
}