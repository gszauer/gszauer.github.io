export const GameConfig = {
  canvas: {
    width: 720,
    height: 1280,
    backgroundColor: '#1a1a1a'
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    knockbackForce: 1500,
    knockbackBias: 150
  },
  ui: {
    fontSize: {
      small: '24px',
      medium: '32px',
      large: '48px'
    },
    colors: {
      health: '#ff0000',
      gold: '#ffff00',
      text: '#ffffff'
    }
  },
  entities: {
    player: {
      radius: 100,
      padding: 10,
      startHp: 3,
      invulnerabilityTime: 1000
    },
    monster: {
      radius: 60,
      bounceSpeed: 1500
    },
    obstacle: {
      radius: 40,
      goldValue: 5
    },
    exitDoor: {
      size: 50
    }
  },
  hammer: {
    length: 200,
    headWidth: 70,
    headHeight: 140,
    minAngle: -90,
    maxAngle: 90,
    swingDuration: 300
  },
  rewards: {
    obstacleDestroy: 5,
    monsterObstacleCombo: 10
  }
};