class MonsterCard extends Card {
    constructor(scene, x, y, power = 5) {
        super(scene, x, y, 'monster');
        
        this.power = power;
        
        const monsterNumber = Phaser.Math.Between(1, 4);
        this.monsterSprite = scene.add.image(0, 0, 'atlas_02', `char_monster_${monsterNumber}.png`);
        this.monsterSprite.setScale(this.scaleVisual);
        this.add(this.monsterSprite);
        
        this.heartStamp = scene.add.image(-30, -45, 'atlas_02', 'stamp_heart.png');
        this.heartStamp.setScale(0.4);
        this.add(this.heartStamp);
        
        this.powerText = scene.add.text(-30, -47, `${this.power}`, {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2,
        });
        this.powerText.setOrigin(0.5, 0.5);
        this.add(this.powerText);
    }
    
    updateDisplay() {
        this.powerText.setText(`${this.power}`);
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