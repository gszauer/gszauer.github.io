
async function CreateMainMenu(game, targetWidth, targetHeight) {
    const container = new PIXI.Container();
    const settingsContainer = new PIXI.Container();
    settingsContainer.visible = false;

    const spriteSheet = await PIXI.Assets.load('atlas1');
    const atlas1 = spriteSheet;
    const atlas3 = this._atlas3 = await PIXI.Assets.load("atlas3");

    const logoSprite = new PIXI.Sprite(spriteSheet.textures['logo.png']);
    const ringTopSprite = new PIXI.Sprite(spriteSheet.textures['ring_top.png']);
    const ringBottomSprite = new PIXI.Sprite(spriteSheet.textures['ring_bottom.png']);
    const ladderSprite = new PIXI.Sprite(spriteSheet.textures['ladder.png']);
    const wrestlerFront = new PIXI.Sprite(spriteSheet.textures['wrestler_front.png']);
    const wrestlerSide = new PIXI.Sprite(spriteSheet.textures['wrestler_side.png']);
    const wrestlerBack = new PIXI.Sprite(spriteSheet.textures['wrestler_back.png']);

    const playBtnSprite = new PIXI.Sprite(spriteSheet.textures['play_btn.png']);
    const settingsBtnSprite = new PIXI.Sprite(spriteSheet.textures['settings_btn.png']);
    //const tutorialBtnSprite = new PIXI.Sprite(spriteSheet.textures['tutorial_btn.png']);

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
    settingsBtnSprite.x = 734;
    playBtnSprite.y     = 869 + 200;
    settingsBtnSprite.y = 864 + 200;
    //tutorialBtnSprite.x = 184;
    //tutorialBtnSprite.y = 1103;

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
    //container.onTutorial = null;

    container.addChild(playBtnSprite);
    container.addChild(settingsBtnSprite);
    //container.addChild(tutorialBtnSprite);

    const playBtn = new PIXI.ui.Button(playBtnSprite);
    const settingsBtn = new PIXI.ui.Button(settingsBtnSprite);
    //const tutorialBtn = new PIXI.ui.Button(tutorialBtnSprite);

    playBtn.onPress.connect(() => {
        if (!settingsContainer.visible) {
            if (container.onPlay !== null && container.onPlay !== undefined) {
                container.onPlay();
            }
        }
        playBtnSprite.tint = 0xffffff;
    });
    
    /*tutorialBtn.onPress.connect(() => {
        if (!settingsContainer.visible) {
            if (container.onTutorial !== null && container.onTutorial !== undefined) {
                container.onTutorial();
            }
        }
        tutorialBtnSprite.tint = 0xffffff;
    });*/
    
    playBtn.onHover.connect(() => {
        if (!settingsContainer.visible) {
            playBtnSprite.tint = 0xb925b9;
        }
    });
    playBtn.onOut.connect(() => {
        playBtnSprite.tint = 0xffffff;
    });
    settingsBtn.onHover.connect(() => {
        if (!settingsContainer.visible) {
            settingsBtnSprite.tint = 0x826502;
        }
    });
    settingsBtn.onOut.connect(() => {
        settingsBtnSprite.tint = 0xffffff;
    });
    /*tutorialBtn.onHover.connect(() => {
        if (!settingsContainer.visible) {
            tutorialBtnSprite.tint = 0xb14d01;
        }
    });
    tutorialBtn.onOut.connect(() => {
        tutorialBtnSprite.tint = 0xffffff;
    });*/

    { // Settings
        const blackout = new PIXI.Graphics()
            .rect(0, 0, targetWidth, targetHeight)
            .fill(0x000000);
        blackout.alpha = 0.75;
        settingsContainer.addChild(blackout);

        const pauseBg = new PIXI.Graphics()
                .rect(0, 555, targetWidth, 1700 - 555)
                .fill(0x323232);
        settingsContainer.addChild(pauseBg);

        const pauseHeader = new PIXI.Sprite(atlas3.textures["settings_header.png"]);
        pauseHeader.x = 0; pauseHeader.y = 542;
        settingsContainer.addChild(pauseHeader);
       
        const pausefooter = new PIXI.Sprite(atlas3.textures["settings_footer.png"]);
        pauseHeader.x = 0; pausefooter.y = 1690;
        settingsContainer.addChild(pausefooter);

        const volumeLabel = new PIXI.Sprite(atlas3.textures["volume_label.png"]);
        volumeLabel.x = 63; volumeLabel.y = 882;
        settingsContainer.addChild(volumeLabel);

        const volumeBar = new PIXI.Sprite(atlas3.textures["volume_track.png"]);
        const volumeKnob = new PIXI.Sprite(atlas3.textures["volume_knob.png"]);
        volumeBar.x = 0; volumeBar.y = 1005;
        volumeKnob.x = 342 - 180; 
        volumeKnob.y = Math.floor(1036 - volumeKnob.height * 0.25);

        const volumeSlider = self._volumeSlider =  new PIXI.ui.Slider({
            bg: volumeBar,
            fill: volumeBar,
            slider: volumeKnob,
            min: 0,
            max: 100,
            step: 1,
            value: 80,
            showValue: false,
        });
        volumeSlider.x = 180;
        settingsContainer.addChild(volumeSlider);

        volumeSlider.onChange.connect((value) => {
            if (value < 0) { value = 0; }
            value = value / 100;
            if (value > 1) { value = 1; }
            game.SetGlobalVolume(value);
        });

        const aiLabel = new PIXI.Sprite(atlas3.textures["ai_label.png"]);
        aiLabel.x = 63; aiLabel.y = 1126;
        settingsContainer.addChild(aiLabel);

        const labelnormal = new PIXI.Sprite(atlas3.textures["normal.png"]);
        labelnormal.x = 226; labelnormal.y = 1272;
        settingsContainer.addChild(labelnormal);

        const normalOff = new PIXI.Sprite(atlas3.textures["checkbox_off.png"]);
        const normalOn = new PIXI.Sprite(atlas3.textures["checkbox_on.png"]);
        normalOn.x = 127; normalOn.y = 1253;
        normalOff.x = 127; normalOff.y = 1253;
        
        const checkboxNormal = new PIXI.ui.CheckBox({
            checked: true,
            style: {
                unchecked: normalOff,
                checked: normalOn,
            }
        });
        settingsContainer.addChild(checkboxNormal);

        const labelRandom = new PIXI.Sprite(atlas3.textures["random.png"]);
        labelRandom.x = 717; labelRandom.y = 1278;
        settingsContainer.addChild(labelRandom);

        const randomOff = new PIXI.Sprite(atlas3.textures["checkbox_off.png"]);
        const randomOn = new PIXI.Sprite(atlas3.textures["checkbox_on.png"]);
        randomOn.x = 615; randomOn.y = 1253;
        randomOff.x = 615; randomOff.y = 1253;
        
        const checkboxRandom = new PIXI.ui.CheckBox({
            style: {
                unchecked: randomOff,
                checked: randomOn,
            }
        });
        settingsContainer.addChild(checkboxRandom);

        checkboxRandom.onCheck.connect((checked) => {
            if (checked) {
                checkboxNormal.checked = false;
                game._useRandomAi = true;
            }
        });

        checkboxNormal.onCheck.connect((checked) => {
            if (checked) {
                checkboxRandom.checked = false;
                game._useRandomAi = false;
            }
        });

        const buttonReset = new PIXI.Sprite(atlas3.textures["close_btn.png"]);
        buttonReset.x = 292; buttonReset.y = 1481;
        settingsContainer.addChild(buttonReset);

        new PIXI.ui.Button(buttonReset).onPress.connect(() => {
            settingsContainer.visible = false;
        });

        settingsBtn.onPress.connect(() => {
            if (!settingsContainer.visible) {
                settingsContainer.visible = true;
                
                const volume = game.GetGlobalVolume();
                volumeSlider.value = Math.floor(volume * 100);
                checkboxNormal.checked = !game._useRandomAi;
                checkboxRandom.checked = game._useRandomAi;
            }
            settingsBtnSprite.tint = 0xffffff;
        });
    }

    container.addChild(settingsContainer);

    return container;
}