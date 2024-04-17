export default class CardBase extends Phaser.GameObjects.Container {
    
    constructor(data) {
        const { scene, x, y, name, sprite, depth} = data;
        
        const footerSprite = scene.add.sprite(0, 370, scene.GetSet("BottomFrame.png"), "BottomFrame.png");
        footerSprite.setOrigin(0, 0);

        let set = 'set1';
        if (!scene.set1.includes(sprite)) {
            set = 'set2';
        }

        const faceSprite = scene.add.sprite(0, 0, set, sprite);
        faceSprite.setOrigin(0, 0);

        const nameText = new Phaser.GameObjects.BitmapText(scene, 0,0, scene.cardNameFont, name, scene.cardNameFontSize, Phaser.GameObjects.BitmapText.ALIGN_CENTER);
        
        super(scene, x, y, [faceSprite, footerSprite, nameText]);

        this.depth = depth;
        this.scene = scene;
        this.sprite = sprite;

        this.footerSprite = footerSprite;
        this.faceSprite = faceSprite;
        this.nameText = nameText;

        this.Name = name;
        if (scene.scaleFactor !== 1.0) {
            this.setScale(scene.scaleFactor, scene.scaleFactor);
        }

        this.scene.add.existing(this);
    }

    set Name(newName) {
        this.name = newName;
        this.nameText.text = this.name;
        this.nameText.setScale(0.48, 0.48);
        this.nameText.maxWidth = this.footerSprite.width;
        this.nameText.setTint(0xe1b95c);
        this.nameText.x = this.footerSprite.width / 2 - this.nameText.width / 2;
        this.nameText.y = this.footerSprite.y + this.footerSprite.height / 2 - this.nameText.height / 2;
    }
}