export default class CardBase extends Phaser.GameObjects.Container {
    
    constructor(data) {
        let { scene, x, y, name, sprite, depth} = data;
        
        const footerSprite = scene.add.sprite(0, 537, "tarotcards", "Nameplate.png");
        footerSprite.setOrigin(0, 0);

        const faceSprite = scene.add.sprite(0, 0, "tarotcards", sprite);
        faceSprite.setOrigin(0, 0);

        const nameText = new Phaser.GameObjects.BitmapText(scene, 0,0, scene.cardNameFont, name, scene.cardNameFontSize, Phaser.GameObjects.BitmapText.ALIGN_CENTER);
        
        super(scene, x, y, [footerSprite, faceSprite, nameText]);

        this.depth = depth;
        this.scene = scene;
        this.sprite = sprite;

        this.footerSprite = footerSprite;
        this.faceSprite = faceSprite;
        this.nameText = nameText;

        this.Name = name;
        
        this.scene.add.existing(this);
    }

    set Name(newName) {
        this.name = newName;
        this.nameText.text = this.name;
        this.nameText.maxWidth = this.footerSprite.width;
        this.nameText.setTint(0xe1b95c);
        this.nameText.x = this.footerSprite.width / 2 - this.nameText.width / 2;
        this.nameText.y = this.footerSprite.y + this.footerSprite.height / 2 - this.nameText.height / 2 - 10;
    }
}