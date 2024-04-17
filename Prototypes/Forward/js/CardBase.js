export default class CardBase extends Phaser.GameObjects.Container {
    
    constructor(data) {
        const { scene, x, y, name, sprite, depth} = data;

        let set = 'set1';
        if (!scene.set1.includes(sprite)) {
            set = 'set2';
        }

        const faceSprite = scene.add.sprite(0, 0, set, sprite);
        faceSprite.setOrigin(0, 0);

        const footerSprite = scene.add.sprite(0, faceSprite.height, scene.GetSet("BottomFrame.png"), "BottomFrame.png");
        footerSprite.setOrigin(0, 0);

        const nameText = new Phaser.GameObjects.BitmapText(scene, 0,0, scene.cardNameFont, name, scene.cardNameFontSize, Phaser.GameObjects.BitmapText.ALIGN_CENTER);
        
        super(scene, x, y, [faceSprite, footerSprite, nameText]);

        this.depth = depth;
        this.scene = scene;
        this.sprite = sprite;

        this.footerSprite = footerSprite;
        this.faceSprite = faceSprite;
        this.nameText = nameText;

        this.Name = name;

        this.setSize( footerSprite.width,  footerSprite.height + faceSprite.height); // TODO: footersprite.width, footerSprite.height + facesprite.height
        this.setScale(0.95, 0.95); // To give wiggle room for rotation

        if (Math.random() < 0.5) {
            this.angle = -(Math.random() * 4);
        }
        else {
            this.angle = Math.random() * 4;
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