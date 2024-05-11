export default class CardBase extends Phaser.GameObjects.Container {
    static rotationCounter = 0;
    static monsterCardsPool = [
        "CardBarbarian.png", "CardBeholder.png", "CardGhost.png",
        "CardMage.png", "CardMantis.png", "CardOrc.png",
        "CardScorpion.png", "CardSkeleton.png", "CardSnake.png",
        "CardTree.png", "CardTroll.png", "CardWizard.png"
    ];

    constructor(data) {
        const { scene, x, y, name, sprite, depth, value, type} = data;

        const faceSprite = scene.add.sprite(0, 0, "Solid", sprite);
        //faceSprite.y -= faceSprite.height / 2;

        const valueSprite = scene.add.sprite(0, 0, "Clear", "RedBanner.png");
        valueSprite.y = faceSprite.y - faceSprite.height / 2 + valueSprite.height / 2 + 2;
        valueSprite.x = -faceSprite.width / 2 + valueSprite.width / 2 + 205;

        const valueText = new Phaser.GameObjects.BitmapText(scene, 0,0, 
            scene.cardValueFont, value, scene.cardValueFontSize, 
            Phaser.GameObjects.BitmapText.ALIGN_CENTER);
        valueText.y = valueSprite.y - valueText.height / 2 - 10;

        super(scene, x, y, [faceSprite, valueSprite, valueText]);

        this.depth = depth;
        this.scene = scene;
        this.sprite = sprite;
        this.valueText = valueText;
        this.faceSprite = faceSprite;
        this.valueSprite = valueSprite;
        this.cardType = type;

        { //this.Value = value;
            this.value = value;
            this.valueText.text = this.value;
            this.valueText.setTint(0);
            this.valueText.x = this.valueSprite.x - this.valueText.width / 2;
        }

        this.setSize(faceSprite.width,  faceSprite.height); 
        this.ApplyRandomRotation();

        this.scene.add.existing(this);
    }

    ApplyRandomRotation() {
        const maxRotationDegrees = 3;
        if (CardBase.rotationCounter++ % 2 == 0) {
            this.angle = -(Math.random() * maxRotationDegrees);
        }
        else {
            this.angle = Math.random() * maxRotationDegrees;
        }
        if (CardBase.rotationCounter > 100) {
            CardBase.rotationCounter -= 100;
        }
    }

    static GetRandomRotation() {
        const maxRotationDegrees = 3;
        let result = Math.random() * maxRotationDegrees;
        if (CardBase.rotationCounter++ % 2 == 0) {
            result = -(Math.random() * maxRotationDegrees);
        }
       
        if (CardBase.rotationCounter > 100) {
            CardBase.rotationCounter -= 100;
        }

        return result;
    }

    ReplaceWithRandom(set) {
        const scene = this.scene;
        
        let randomCardIndex =  Math.floor(Math.random() * CardBase.monsterCardsPool.length);
        let randomCardName =  CardBase.monsterCardsPool[randomCardIndex];
        while(true) {
            let contains = false;
            for (let i = 0, size = set.length; i < size; ++i) {
                if (set[i].Name == randomCardName) {
                    contains = true;
                    break;
                }
            }

            if (!contains) {
                break;
            }

            randomCardIndex = Math.floor(Math.random() * CardBase.monsterCardsPool.length);
            randomCardName =  CardBase.monsterCardsPool[randomCardIndex];
        }

        this.cardType = "monster";
        this.faceSprite.setFrame(randomCardName);
        this.Value = this.scene.GenerateNextCardValue();
        this.ApplyRandomRotation();
        this.valueSprite.setFrame("RedBanner.png");

        this.faceSprite.visible = true;
    }

    ReplaceWithCoin() {
        this.cardType = "coin";
        this.Value = this.scene.GenerateNextCardValue();
        this.faceSprite.setFrame("CardCoins.png");
        this.valueSprite.setFrame("BlueBanner.png");

        this.faceSprite.visible = true;
    }

    ReplaceWithSword() {
        this.cardType = "sword";
        this.Value = this.scene.GenerateNextCardValue();
        this.faceSprite.setFrame("CardSword.png");
        this.valueSprite.setFrame("BlueBanner.png");

        this.faceSprite.visible = true;
    }

    ReplaceWithPortal() {
        this.cardType = "portal";
        this.Value = 0;
        this.faceSprite.setFrame("CardPortal.png");

        this.faceSprite.visible = true;
    }

    ReplaceWithChest() {
        this.cardType = "chest";
        this.Value = 0;
        this.faceSprite.setFrame("CardChest.png");

        this.faceSprite.visible = true;
    }

    ReplaceWithEmpty() {
        this.cardType = "empty";
        this.Value = 0;

        this.faceSprite.visible = false;
    }

    ReplaceDead() {
        this.cardType = "monster";
        this.Value = 0;
        this.faceSprite.setFrame("CardDead.png");
        this.faceSprite.visible = true;
    }

    ReplaceWith(other) {
        this.Value = other.Value;
        this.angle = other.angle;
        this.cardType = other.cardType;
        this.faceSprite.setFrame(other.faceSprite.frame.name);
        this.valueSprite.setFrame(other.valueSprite.frame.name);


        this.faceSprite.visible = other.cardType !== "empty";
    }

    ReplaceOnDeath() {
        if (this._OneInFive()) { // Make coin
            this.ReplaceWithCoin();
            this.Value = Math.floor(Math.random() * 3) + 1;
        }
        else if (this._OneInFive()) { // Make Sword
            this.ReplaceWithSword();
            this.Value = Math.floor(Math.random() * 4) + 1;
        }
        else if (this._OneInTen()) { // Make monster
            this.ReplaceWithRandom(this.scene.grid.monsters);
            this.Value = 1;
        }
        else {
            this.cardType = "monster";
            this.Value = 0;
            this.faceSprite.setFrame("CardDead.png");
        }
    }

    _OneInFive() {
        return Math.floor(Math.random() * 5) == 3;
    }

    _OneInTen() {
        return Math.floor(Math.random() * 10) == 7;
    }

    _OneInTwenty() {
        return Math.floor(Math.random() * 20) == 13;
    }
    
    TintCard(color) {
        this.faceSprite.tint = color;
        this.valueSprite.tint = color;
    }

    set Value(newValue) {
        this.value = newValue;
        this.valueText.text = this.value;
        this.valueText.setTint(0);
        this.valueText.x = this.valueSprite.x - this.valueText.width / 2;

        if (newValue <= 0) {
            this.valueSprite.setActive(false).setVisible(false);
            this.valueText.setActive(false).setVisible(false);
        }
        else {
            this.valueSprite.setActive(true).setVisible(true);
            this.valueText.setActive(true).setVisible(true);
        }
    }

    get Value() {
        return this.value;
    }

    SetVisibility(newValue) {
        this.faceSprite.setActive(newValue).setVisible(newValue);
        this.valueSprite.setActive(newValue).setVisible(newValue);
        this.valueText.setActive(newValue).setVisible(newValue);
    }
}