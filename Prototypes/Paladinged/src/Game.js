import { GameConfig } from './GameConfig.js';
import PreloaderScene from './PreloaderScene.js';
import LevelSelectScene from './LevelSelectScene.js';
import GameplayScene from './GameplayScene.js';

document.addEventListener('DOMContentLoaded', function() {
    const config = {
        type: Phaser.AUTO,
        width: GameConfig.canvas.width,
        height: GameConfig.canvas.height,
        parent: 'game-container',
        backgroundColor: GameConfig.canvas.backgroundColor,
        scale: GameConfig.scale,
        scene: [PreloaderScene, LevelSelectScene, GameplayScene]
    };

    const game = new Phaser.Game(config);
});