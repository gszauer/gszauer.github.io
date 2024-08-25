
async function CreateMainMenu(targetWidth, targetHeight) {
    const container = new PIXI.Container();

    const spriteSheetTexture = await PIXI.Assets.load('img/atlas1.png');
    PIXI.Assets.add({
        alias: 'atlas1',
        src: 'img/atlas1.json',
        data: {texture: spriteSheetTexture}
    });
    const spriteSheet = await PIXI.Assets.load('atlas1');

    const logoSprite = new PIXI.Sprite(spriteSheet.textures['logo.png']);
    const ringTopSprite = new PIXI.Sprite(spriteSheet.textures['ring_top.png']);
    const ringBottomSprite = new PIXI.Sprite(spriteSheet.textures['ring_bottom.png']);
    const ladderSprite = new PIXI.Sprite(spriteSheet.textures['ladder.png']);
    const wrestlerFront = new PIXI.Sprite(spriteSheet.textures['wrestler_front.png']);
    const wrestlerSide = new PIXI.Sprite(spriteSheet.textures['wrestler_side.png']);
    const wrestlerBack = new PIXI.Sprite(spriteSheet.textures['wrestler_back.png']);

    const playBtnSprite = new PIXI.Sprite(spriteSheet.textures['play_btn.png']);
    const settingsBtnSprite = new PIXI.Sprite(spriteSheet.textures['settings_btn.png']);
    const tutorialBtnSprite = new PIXI.Sprite(spriteSheet.textures['tutorial_btn.png']);

    logoSprite.x = 29;
    logoSprite.y = 24;
    ringTopSprite.y = 1604;
    ringBottomSprite.y = 2010;
    ladderSprite.x = 430;
    ladderSprite.y = 1475;
    wrestlerSide.x = 124;
    wrestlerSide.y = 1656;
    wrestlerBack.x = 760;
    wrestlerBack.y = 1537;
    wrestlerFront.x = 656;
    wrestlerFront.y = 1920;
    playBtnSprite.x = 184;
    playBtnSprite.y = 869;
    settingsBtnSprite.x = 734;
    settingsBtnSprite.y = 864;
    tutorialBtnSprite.x = 184;
    tutorialBtnSprite.y = 1103;

    const background = new PIXI.Graphics()
        .rect(0, 0, targetWidth, targetHeight)
        .fill(0x252525);
    container.addChild(background);

    container.addChild(ringTopSprite);
    container.addChild(ringBottomSprite);
    container.addChild(logoSprite);
    container.addChild(ladderSprite);
    container.addChild(wrestlerFront);
    container.addChild(wrestlerSide);
    container.addChild(wrestlerBack);
   
    container.onPlay = null;
    container.onSettings = null;
    container.onTutorial = null;

    container.addChild(playBtnSprite);
    container.addChild(settingsBtnSprite);
    container.addChild(tutorialBtnSprite);

    const playBtn = new PIXI.ui.Button(playBtnSprite);
    const settingsBtn = new PIXI.ui.Button(settingsBtnSprite);
    const tutorialBtn = new PIXI.ui.Button(tutorialBtnSprite);

    playBtn.onPress.connect(() => {
        if (container.onPlay !== null && container.onPlay !== undefined) {
            container.onPlay();
        }
    });
    settingsBtn.onPress.connect(() => {
        if (container.onSettings !== null && container.onSettings !== undefined) {
            container.onSettings();
        }
    });
    tutorialBtn.onPress.connect(() => {
        if (container.onTutorial !== null && container.onTutorial !== undefined) {
            container.onTutorial();
        }
    });
    
    playBtn.onHover.connect(() => {
        playBtnSprite.tint = 0xb925b9;
    });
    playBtn.onOut.connect(() => {
        playBtnSprite.tint = 0xffffff;
    });
    settingsBtn.onHover.connect(() => {
        settingsBtnSprite.tint = 0x826502;
    });
    settingsBtn.onOut.connect(() => {
        settingsBtnSprite.tint = 0xffffff;
    });
    tutorialBtn.onHover.connect(() => {
        tutorialBtnSprite.tint = 0xb14d01;
    });
    tutorialBtn.onOut.connect(() => {
        tutorialBtnSprite.tint = 0xffffff;
    });

    return container;
}