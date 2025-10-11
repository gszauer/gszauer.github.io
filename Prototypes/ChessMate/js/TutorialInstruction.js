class TutorialInstruction extends Phaser.GameObjects.Container {
    constructor(scene, stepsOrCharacter, textOrCallback, onDismiss) {
        super(scene, 0, 0);
        this.scene = scene;
        this.currentStepIndex = 0;
        this.isShowing = false;
        this.setDepth(2000);
        scene.add.existing(this);

        if (Array.isArray(stepsOrCharacter)) {
            this.steps = stepsOrCharacter.map(step => this.normalizeStep(step));
            this.onComplete = textOrCallback || null;
        } else {
            this.steps = [this.normalizeStep([stepsOrCharacter, textOrCallback])];
            this.onComplete = onDismiss || null;
        }

        this.createModal();
        this.showStep(0);
        this.isShowing = true;
    }

    normalizeStep(step) {
        if (!Array.isArray(step) || step.length < 2) {
            throw new Error('TutorialInstruction step must be an array [characterIndex, text].');
        }
        const [characterIndex, text] = step;
        const index = Phaser.Math.Clamp(parseInt(characterIndex, 10) || 1, 1, 3);
        return { characterIndex: index, text: text || '' };
    }

    createModal() {
        const { width, height } = this.scene.cameras.main;

        this.blocker = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0);
        this.blocker.setOrigin(0, 0);
        this.blocker.setInteractive();
        this.blocker.on('pointerdown', this.handleAdvance, this);
        this.add(this.blocker);

        const containerY = height;
        this.content = this.scene.add.container(0, containerY);
        this.add(this.content);

        this.characterImage = this.scene.add.image(0, 0, 'characters', 'tutorial_1.png');
        this.characterImage.setOrigin(0, 1);
        this.characterImage.setScale(1.5);
        this.content.add(this.characterImage);

        this.bubbleImage = this.scene.add.image(0, 0, 'characters', 'bubble.png');
        this.bubbleImage.setOrigin(0, 0.5);
        this.bubbleImage.setScale(2);
        this.content.add(this.bubbleImage);

        this.textObject = this.scene.add.text(0, 0, '', {
            fontSize: '50px',
            fontFamily: 'Arial, sans-serif',
            color: '#3A2615',
            wordWrap: { width: 640 }
        });
        this.textObject.setOrigin(0, 0);
        this.content.add(this.textObject);

        this.updateLayout();
    }

    handleAdvance(pointer) {
        if (pointer && pointer.event && pointer.event.stopPropagation) {
            pointer.event.stopPropagation();
        }
        this.advanceStep();
    }

    showStep(index) {
        if (!this.steps[index]) {
            return;
        }
        const { characterIndex, text } = this.steps[index];
        const frameName = `tutorial_${characterIndex}.png`;
        if (this.scene.textures.exists('characters') && this.scene.textures.get('characters').has(frameName)) {
            this.characterImage.setTexture('characters', frameName);
        }
        this.characterImage.setScale(1.5);
        this.updateLayout();
        this.textObject.setText(text);
        this.currentStepIndex = index;
    }

    advanceStep() {
        const nextIndex = this.currentStepIndex + 1;
        if (nextIndex < this.steps.length) {
            this.showStep(nextIndex);
        } else {
            this.complete();
        }
    }

    complete() {
        if (!this.isShowing) {
            return;
        }
        this.isShowing = false;
        this.blocker.off('pointerdown', this.handleAdvance, this);
        this.blocker.disableInteractive();
        const callback = this.onComplete;
        this.onComplete = null;
        this.destroy(true);
        if (typeof callback === 'function') {
            callback();
        }
    }

    isActive() {
        return this.isShowing;
    }

    updateLayout() {
        if (!this.characterImage || !this.bubbleImage || !this.textObject) {
            return;
        }

        const bubbleOffsetX = this.characterImage.displayWidth * 0.75;
        const bubbleOffsetY = -this.characterImage.displayHeight;
        this.bubbleImage.setPosition(bubbleOffsetX, bubbleOffsetY);

        const textPaddingX = this.bubbleImage.displayWidth * 0.1;
        const textPaddingY = this.bubbleImage.displayHeight * 0.2;
        const textX = this.bubbleImage.x + textPaddingX;
        const textY = (this.bubbleImage.y - this.bubbleImage.displayHeight * 0.5) + textPaddingY;
        const wrapWidth = this.bubbleImage.displayWidth * 0.78;

        this.textObject.setPosition(textX, textY - 30);
        this.textObject.setStyle({
            fontSize: '50px',
            fontFamily: 'Arial, sans-serif',
            color: '#3A2615',
            wordWrap: { width: wrapWidth }
        });
    }

    destroy(fromScene) {
        if (this.blocker) {
            this.blocker.off('pointerdown', this.handleAdvance, this);
            this.blocker.destroy();
            this.blocker = null;
        }
        if (this.content) {
            this.content.removeAll(true);
            this.content.destroy();
            this.content = null;
        }
        this.textObject = null;
        this.characterImage = null;
        this.bubbleImage = null;
        super.destroy(fromScene);
    }
}
