class MonsterCard extends Card {
    constructor(scene, x, y, power = 5) {
        super(scene, x, y, 'monster');
        
        this.power = power;
        
        this.background.clear();
        
        this.monsterSprite = scene.add.image(0, 0, 'atlas_02', 'char_monster_1.png');
        this.monsterSprite.setScale(0.5);
        this.add(this.monsterSprite);
        
        this.powerText = scene.add.text(0, 0, `Monster\n${this.power}`, {
            fontSize: '20px',
            color: '#ffffff',
            align: 'center' 
        });
        this.powerText.setOrigin(0.5, 0.5);
        this.add(this.powerText);
    }
    
    updateDisplay() {
        this.powerText.setText(`Monster\n${this.power}`);
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