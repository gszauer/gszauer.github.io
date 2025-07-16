class PlayerCard extends Card {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');
        
        this.power = 50;
        this.maxPower = 50;
        this.shield = 10;
        
        this.background.clear();
        this.background.fillStyle(0x3498db, 1);
        this.background.fillRoundedRect(-40, -40, 80, 80, 8);
        
        this.powerText = scene.add.text(0, -20, `HP: ${this.power}/${this.maxPower}`, {
            fontSize: '14px',
            color: '#ffffff'
        });
        this.powerText.setOrigin(0.5, 0.5);
        this.add(this.powerText);
        
        this.labelText = scene.add.text(0, 0, 'Player', {
            fontSize: '20px',
            color: '#ffffff'
        });
        this.labelText.setOrigin(0.5, 0.5);
        this.add(this.labelText);
        
        this.shieldText = scene.add.text(0, 20, `Shield: ${this.shield}`, {
            fontSize: '14px',
            color: '#ffffff'
        });
        this.shieldText.setOrigin(0.5, 0.5);
        this.add(this.shieldText);
        
        this.updateDisplay();
    }
    
    updateDisplay() {
        this.powerText.setText(`HP: ${this.power}/${this.maxPower}`);
        this.shieldText.setText(`Shield: ${this.shield}`);
        this.shieldText.setVisible(this.shield > 0);
    }
    
    takeDamage(damage) {
        if (this.shield > 0) {
            if (damage > this.shield) {
                damage -= this.shield;
                this.shield = 0;
            } else {
                this.shield -= damage;
                damage = 0;
            }
        }
        
        this.power -= damage;
        if (this.power < 0) {
            this.power = 0;
        }
        
        this.updateDisplay();
    }
    
    heal(amount) {
        this.power = Math.min(this.power + amount, this.maxPower);
        this.updateDisplay();
    }
    
    addShield(amount) {
        this.shield += amount;
        this.updateDisplay();
    }
    
    isDead() {
        return this.power <= 0;
    }
}