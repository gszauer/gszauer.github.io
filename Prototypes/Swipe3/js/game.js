// Domain-based DRM check
const allowedDomains = [
    'localhost', '127.0.0.1', 
    'gabormakesgames.com', 'gszauer.github.io'
];
const currentDomain = window.location.hostname;

function isDomainAllowed() {
    return allowedDomains.includes(currentDomain);
}

if (!isDomainAllowed()) {
    // Show error message instead of creating game
    let container = document.getElementById("game-container");
    container.innerHTML = `
        <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background-color: #2c3e50;
            color: white;
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 20px;
        ">
            <div>
                <h1>Access Denied</h1>
                <p>This game cannot be run from this domain.</p>
            </div>
        </div>
    `;
} else {
    // Domain is allowed, create the game on document load
    document.addEventListener('DOMContentLoaded', function() {
        const config = {
            type: Phaser.AUTO,
            parent: 'game-container',
            backgroundColor: '#2c3e50',
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                width: 720,
                height: 1280
            },
            resolution: window.devicePixelRatio || 1,
            antialias: true,
            pixelArt: false,
            roundPixels: false,
            scene: [PreloaderScene, LevelSelectScene, GameScene]
        };

        const playerData = new PlayerData();
        AdManager.Initialize(() => {
            const game = new Phaser.Game(config);
        });
    });
}