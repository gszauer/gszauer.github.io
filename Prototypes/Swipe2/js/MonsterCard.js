class MonsterCard extends Card {
    constructor(scene, x, y, power = 5, maxPower = 5) {
        super(scene, x, y, 'monster');
        
        this.power = power;
        this.maxPower = maxPower;
        
        this.background.clear();
        this.background.fillStyle(0xe74c3c, 1);
        this.background.fillRoundedRect(-40, -40, 80, 80, 8);
        
        this.powerText = scene.add.text(0, -20, `P: ${this.power}/${this.maxPower}`, {
            fontSize: '14px',
            color: '#ffffff'
        });
        this.powerText.setOrigin(0.5, 0.5);
        this.add(this.powerText);
        
        this.labelText = scene.add.text(0, 0, 'monster', {
            fontSize: '16px',
            color: '#ffffff'
        });
        this.labelText.setOrigin(0.5, 0.5);
        this.add(this.labelText);
    }
    
    updateDisplay() {
        this.powerText.setText(`P: ${this.power}/${this.maxPower}`);
    }
    
    takeDamage(damage) {
        this.power -= damage;
        if (this.power <= 0) {
            this.power = 0;
            this.markForDestruction();
        }
        this.updateDisplay();
    }
    
    onPlayerInteraction(player) {
        const playerDamage = this.power;
        const monsterDamage = player.power;
        
        this.takeDamage(monsterDamage);
        player.takeDamage(playerDamage);
    }
}