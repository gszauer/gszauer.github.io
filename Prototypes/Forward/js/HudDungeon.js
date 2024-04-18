import CardBase from './CardBase.js'

export default class HudDungeon extends Phaser.GameObjects.Container {
    constructor(data) {
        const { scene, x, y, cardPadding } = data;

        const dividerSprite = scene.add.sprite(-15, 0, scene.GetSet("Divider.png"), "Divider.png");
        dividerSprite.setOrigin(0, 0);
        dividerSprite.setScale(8.5, 1);

        let layoutX = 40;
        let layoutY = dividerSprite.height + 20;

        const shieldSprite = scene.add.sprite(layoutX, layoutY, scene.GetSet("Shield.png"), "Shield.png");
        shieldSprite.x += shieldSprite.width / 2;
        shieldSprite.y += shieldSprite.height / 2;
        layoutX += shieldSprite.width + 100;

        const shieldText = scene.add.bitmapText(0, 0, scene.cardValueFont, "-", scene.cardValueFontSize, Phaser.GameObjects.BitmapText.ALIGN_CENTER);
        shieldText.x = (shieldSprite.x) - (shieldText.width / 2);
        shieldText.y = (shieldSprite.y) - (shieldText.height / 2) + 5;
        shieldText.setTint(0);

        const heartSprite = scene.add.sprite(layoutX, layoutY, scene.GetSet("Heart.png"), "Heart.png");
        heartSprite.x += heartSprite.width / 2;
        heartSprite.y += heartSprite.height / 2;
        heartSprite.setScale(0.97, 0.97);
        layoutX += heartSprite.width + 100;

        const currentHeartText = scene.add.bitmapText(0, 0, scene.cardValueFont, "-", scene.cardValueFontSize, Phaser.GameObjects.BitmapText.ALIGN_CENTER);
        currentHeartText.x = (heartSprite.x) - (currentHeartText.width / 2);
        currentHeartText.y = (heartSprite.y) - (currentHeartText.height / 2);
        currentHeartText.setTint(0);

        const maxHeartText = scene.add.bitmapText(0, 0, scene.cardValueFont, "-", scene.cardValueFontSize * 0.6, Phaser.GameObjects.BitmapText.ALIGN_CENTER);
        maxHeartText.x = (heartSprite.x) - (maxHeartText.width / 2) + 87;
        maxHeartText.y = (heartSprite.y) + (maxHeartText.height / 2);
        maxHeartText.setTint(0xe1b95b);

        const healthDivider = scene.add.sprite(heartSprite.x + heartSprite.width / 2 - 20, 
                              0, scene.GetSet("Divider.png"), "Divider.png");
        healthDivider.y = heartSprite.y + heartSprite.height / 2  - 35;
        healthDivider.angle = -50;
        healthDivider.setScale(0.5, 1);

        const coinSprite = scene.add.sprite(layoutX,layoutY, scene.GetSet("Coin.png"), "Coin.png");
        coinSprite.x += coinSprite.width / 2;
        coinSprite.y += coinSprite.height / 2;
        layoutX += coinSprite.width + 100;
        coinSprite.setScale(0.98, 0.98);

        const coinText = scene.add.bitmapText(0, 0, scene.cardValueFont, "-", scene.cardValueFontSize, Phaser.GameObjects.BitmapText.ALIGN_CENTER);
        coinText.x = (coinSprite.x) - (coinText.width / 2) - 20;
        coinText.y = (coinSprite.y) - (coinText.height / 2) + 5;
        coinText.setTint(0);

        const cogSprite = scene.add.sprite(layoutX, layoutY, scene.GetSet("Cog.png"), "Cog.png");
        cogSprite.x += cogSprite.width / 2;
        cogSprite.y += cogSprite.height / 2;
        cogSprite.setScale(0.95, 0.95);

        super(scene, x, y, [dividerSprite, shieldSprite, heartSprite, healthDivider, coinSprite, cogSprite, coinText, shieldText, currentHeartText, maxHeartText]);

        this.maxHealth = 0;
        this.currentHealth = 0;
        this.heartSprite = heartSprite;
        this.currentHeartText = currentHeartText;
        this.maxHeartText = maxHeartText;
        this.healthDivider = healthDivider;

        this.shield = 0;
        this.shieldSprite = shieldSprite;
        this.shieldText = shieldText;

        this.coins = 0;
        this.coinSprite = coinSprite;
        this.coinText = coinText;

        scene.add.existing(this);
    }

    set Health(newValue) {
        if (newValue < 0) { newValue = 0; }
        if (newValue > this.maxHealth) { newValue = this.maxHealth; }
        this.currentHealth = newValue;
        this.currentHeartText.text = newValue;
        this.currentHeartText.x = (this.heartSprite.x) - (this.currentHeartText.width / 2);
        this.currentHeartText.y = (this.heartSprite.y) - (this.currentHeartText.height / 2);
    }

    set MaxHealth(newValue) {
        if (newValue < 0) { newValue = 0; }
        this.maxHealth = newValue;
        this.maxHeartText.text = newValue;
        this.maxHeartText.x = this.healthDivider.x + 13;// (this.heartSprite.x) - (this.maxHeartText.width / 2) + 87;
        this.maxHeartText.y = (this.heartSprite.y) + (this.maxHeartText.height / 2);
    }

    set Shield(newValue) {
        if (newValue < 0) { newValue = 0; }
        this.shield = newValue;
        this.shieldText.text = newValue;
        this.shieldText.x = (this.shieldSprite.x) - (this.shieldText.width / 2);
        this.shieldText.y = (this.shieldSprite.y) - (this.shieldText.height / 2) + 5;
    }

    set Coins(newValue) {
        if (newValue < 0) { newValue = 0; }
        this.coins = newValue;
        this.coinText.text = newValue;
        this.coinText.x = (this.coinSprite.x) - (this.coinText.width / 2) - 20;
        this.coinText.y = (this.coinSprite.y) - (this.coinText.height / 2) + 5;
    }
}