class PlayerCard extends Card {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');
        
        this.power = 50;
        this.maxPower = 50;
        this.shield = 10;
        
        this.background.clear();
        
        this.heroSprite = scene.add.image(0, 0, 'atlas_02', 'char_hero.png');
        this.heroSprite.setScale(0.5);
        this.add(this.heroSprite);
        
        this.heartStamp = scene.add.image(-30, -40, 'atlas_02', 'stamp_heart.png');
        this.heartStamp.setScale(0.4);
        this.add(this.heartStamp);
        
        this.shieldStamp = scene.add.image(30, 40, 'atlas_02', 'stamp_shield.png');
        this.shieldStamp.setScale(0.4);
        this.add(this.shieldStamp);
        
        this.powerText = scene.add.text(-30, -42, `${this.power}`, {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2,
        });
        this.powerText.setOrigin(0.5, 0.5);
        this.add(this.powerText);
        
      
        
        this.shieldText = scene.add.text(30, 40, `Shield: ${this.shield}`, {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2,
        });
        this.shieldText.setOrigin(0.5, 0.5);
        this.add(this.shieldText);
        
        this.updateDisplay();
    }
    
    updateDisplay() {
        this.powerText.setText(`${this.power}`);
        this.shieldText.setText(`${this.shield}`);
        this.shieldText.setVisible(this.shield > 0);
        this.shieldStamp.setVisible(this.shield > 0);
        
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