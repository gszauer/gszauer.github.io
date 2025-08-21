// M - Monster
// O - Obstacle
// W - Walking Monster

export const LevelData = {
  levels: [
    {
      id: 1,
      name: "First Steps",
      data: [
        '*******',
        '*M*****',
        '*******',
        '**M****',
        '****O**',
        '*******',
        '****O**',
        'M**M**M',
        '*M*M*M*',
        '***M***',
        '*M***M*',
        '**M*M**',
        '*M*M*M*',
        '***M***',
        '**O****',
        '*******',
        '*M*****',
        '*******',
        '*******',
        'O******',
        '*******',
        '*MMM***',
        '*******',
        '*******'
      ],
      config: {
        scrollSpeed: 300,
        playerHp: 3,
        defaultWalkSpeed: 50
      }
    },
    {
      id: 2,
      name: "Narrow Passage",
      data: [
        '*******',
        'MW***WM',
        '*O***O*',
        '**M*M**',
        '***W***',
        'M*****M',
        '*O***O*',
        '**M*M**',
        '*******',
        'MW*M*WM',
        '*O*O*O*',
        '***M***',
        '*M*W*M*',
        '**O*O**',
        '*******',
        'M**M**M',
        '***W***',
        '**MMM**',
        '*O***O*',
        '*******',
        'M*W*W*M',
        '*******',
        '**O*O**',
        '*******'
      ],
      config: {
        scrollSpeed: 350,
        playerHp: 3,
        monster: {
          radius: 65,
          bounceSpeed: 1600
        },
        defaultWalkSpeed: 50
      },
      monsterSpeeds: {
        "0,0": 50,
        "23,1": 50,
        "22,3": 50,
        "19,3": 50,
        "16,3": 50,
        "12,3": 50,
        "9,1":  50,
        "9,5":  50,
        "4,3":  50,
        "20,2": 50,
        "20,4": 50
      }
    },
    {
      id: 3,
      name: "Obstacle Course",
      data: [
        'O*O*O*O',
        '*******',
        'O*O*O*O',
        '*M***M*',
        'O*O*O*O',
        '*******',
        '**M*M**',
        'O*O*O*O',
        '*******',
        '*M*M*M*',
        'O*O*O*O',
        '*******',
        '***M***',
        'O*O*O*O',
        '*******',
        'M*M*M*M',
        'O*O*O*O',
        '*******',
        '**M*M**',
        'O*O*O*O',
        '*******',
        '*M***M*',
        'O*O*O*O',
        '*******'
      ],
      config: {
        scrollSpeed: 400,
        playerHp: 4,
        rewards: {
          obstacleDestroy: 10
        },
        defaultWalkSpeed: 50
      }
    }
  ],
  
  getLevel(id) {
    return this.levels.find(level => level.id === id);
  },
  
  getLevelCount() {
    return this.levels.length;
  },
  
  getGridDimensions(levelId) {
    const level = this.getLevel(levelId);
    if (!level) return null;
    
    return {
      lanes: level.data[0].length,
      rows: level.data.length
    };
  }
};