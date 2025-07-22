class PlayerCard extends Card {
    constructor(scene, x, y, hp = 15, shield = 5) {
        super(scene, x, y, 'player');
        
        this.power = hp;
        this.maxPower = hp;
        this.shield = shield;
        
        this.heroSprite = scene.add.image(0, 0, 'atlas_02', 'char_hero.png');
        this.heroSprite.setScale(this.scaleVisual);
        this.add(this.heroSprite);
        
        // Add semi-transparent black box behind heart stamp
        this.heartBackground = scene.add.rectangle(-10, -50, 50, 20, 0x000000, 0.7);
        this.add(this.heartBackground);
        
        this.heartStamp = scene.add.image(-30, -50, 'atlas_02', 'stamp_heart.png');
        this.heartStamp.setScale(0.37);
        this.add(this.heartStamp);
        
        this.shieldStamp = scene.add.image(30, 50, 'atlas_02', 'stamp_shield.png');
        this.shieldStamp.setScale(0.4);
        this.add(this.shieldStamp);
        
        this.powerText = scene.add.text(-30, -52, `${this.power}`, {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2,
        });
        this.powerText.setOrigin(0.5, 0.5);
        this.add(this.powerText);
        
        // Add max HP label
       this.maxPowerText = scene.add.text(-15, -50, `/${this.maxPower}`, {
        fontSize: '14px',
        color: '#ffffff',
        fontStyle: 'bold',
        align: 'center'
        });
       this.maxPowerText.setOrigin(0, 0.5);
       this.add(this.maxPowerText);

        this.shieldText = scene.add.text(30, 50, `Shield: ${this.shield}`, {
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
        this.maxPowerText.setText(`/${this.maxPower}`);
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