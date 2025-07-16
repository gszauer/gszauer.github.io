class MonsterCard extends Card {
    constructor(scene, x, y, power = 5, maxPower = 5) {
        super(scene, x, y, 'monster');
        
        this.power = power;
        this.maxPower = maxPower;
        
        this.background.clear();
        this.background.fillStyle(0xe74c3c, 1);
        this.background.fillRoundedRect(-40, -40, 80, 80, 8);
        
        this.powerText = scene.add.text(0, 0, `Monster\n${this.power}/${this.maxPower}`, {
            fontSize: '20px',
            color: '#ffffff',
            align: 'center' 
        });
        this.powerText.setOrigin(0.5, 0.5);
        this.add(this.powerText);
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