const levels = [
    // Dialog 1
    {
        dialog: "Hi! I'm Calcul8or. Want to play a game?",
        confirm: "Sure"
    },
    // Dialog 2
    {
        dialog: "This number shows you how many moves you have left.",
        confirm: "Ok",
        moves: 2,
        pointAt: "moves"
    },
    // Dialog 3
    {
        dialog: "And this number is your goal to reach",
        confirm: "How?",
        moves: 2,
        goal: 2,
        pointAt: "goal"
    },
    // Dialog 4
    {
        dialog: "Every level has buttons. Each button takes 1 turn, pressing a button changes the number here.",
        confirm: "Let's go!",
        width: 0.75,
        moves: 2,
        goal: 2,
        value: 0,
        pointAt: "value"
    },
    // Level 1
    {
        level: 1,
        initial: 0,
        goal: 2,
        moves: 2,
        buttons: [
            ['EMP', '+1', 'CLR'],
            ['EMP', 'EMP', 'EMP'],
            ['EMP', 'EMP', 'EMP']
        ],
        hint: '+1'
    },
    // Dialog 5
    {
        dialog: "Nice, ready for level two?",
        confirm: "You bet!"
    },
    // Dialog 6
    {
        dialog: "This is the options button. You can use it to replay previous levels or reset your progress.",
        confirm: "Thanks!",
        preview_btn: "OPT"
    },
    // Level 2
    {
        level: 2,
        initial: 0,
        goal: 8,
        moves: 3,
        buttons: [
            ['EMP', '+2', 'CLR'],
            ['EMP', '+3', 'EMP'],
            ['OPT', 'EMP', 'EMP']
        ],
        hint: '+3, +3, +2'
    },
    // Level 3
    {
        level: 3,
        initial: 0,
        goal: 12,
        moves: 3,
        buttons: [
            ['EMP', 'x4', 'CLR'],
            ['EMP', '+1', 'EMP'],
            ['OPT', '+2', 'EMP']
        ],
        hint: '+1, +2, x4'
    },
    // Dialog 7
    {
        dialog: "This next one might be tricky. But i got your back! Check it out, i found a new button!",
        confirm: "New?"
    },
    // Dialog 8
    {
        dialog: "Yeah, a hint button! It looks like this. Press it on your next turn and i'll tell you how to solve this puzzle.",
        confirm: "Cool!",
        preview_btn: "HNT"
    },
    // Level 4
    {
        level: 4,
        initial: 1,
        goal: 7,
        moves: 3,
        buttons: [
            ['HNT', '+4', 'CLR'],
            ['EMP', '-2', 'EMP'],
            ['OPT', 'EMP', 'EMP']
        ],
        hint: '+4, +4, -2'
    },
    // Level 5
    {
        level: 5,
        initial: 0,
        goal: 20,
        moves: 3,
        buttons: [
            ['HNT', 'x4', 'CLR'],
            ['EMP', '+4', 'EMP'],
            ['OPT', 'EMP', 'EMP']
        ],
        hint: '+4, x4, +4'
    },
    // Level 6
    {
        level: 6,
        initial: 0,
        goal: 40,
        moves: 4,
        buttons: [
            ['HNT', '+2', 'CLR'],
            ['EMP', 'x4', 'EMP'],
            ['OPT', 'EMP', 'EMP']
        ],
        hint: '+2, x4, +2, x4'
    },
    // Level 7
    {
        level: 7,
        initial: 100,
        goal: 10,
        moves: 4,
        buttons: [
            ['HNT', '+3', 'CLR'],
            ['EMP', '/5', 'EMP'],
            ['OPT', 'EMP', 'EMP']
        ],
        hint: '/5, /5, +3, +3'
    },
    // Dialog 9
    {
        dialog: "We are crushing it!",
        confirm: "I agree"
    },
    // Dialog 10
    {
        dialog: "I found another new button. Want to see it?",
        confirm: "Yeah!"
    },
    // Dialog 11
    {
        dialog: "It's a backspace. This removes the last digit from the currently displayed number.",
        confirm: "So cool",
        preview_btn: "<<<"
    },
    // Level 8
    {
        level: 8,
        initial: 4321,
        goal: 4,
        moves: 3,
        buttons: [
            ['HNT', 'EMP', 'CLR'],
            ['EMP', 'EMP', '<<<'],
            ['OPT', 'EMP', 'EMP']
        ],
        hint: '<<<, <<<, <<<'
    },
    // Level 9
    {
        level: 9,
        initial: 0,
        goal: 4,
        moves: 3,
        buttons: [
            ['HNT', '+8', 'CLR'],
            ['EMP', 'x5', '<<<'],
            ['OPT', 'EMP', 'EMP']
        ],
        hint: '+8, x5, <<<'
    },
    // Level 10
    {
        level: 10,
        initial: 50,
        goal: 9,
        moves: 4,
        buttons: [
            ['HNT', '/5', 'CLR'],
            ['EMP', 'x3', '<<<'],
            ['OPT', 'EMP', 'EMP']
        ],
        hint: '/5, x3, x3, <<<'
    },
    // Level 11
    {
        level: 11,
        initial: 99,
        goal: 100,
        moves: 3,
        buttons: [
            ['HNT', '-8', 'CLR'],
            ['EMP', 'x11', '<<<'],
            ['OPT', 'EMP', 'EMP']
        ],
        hint: '-8, x11, <<<'
    },
    // Level 12
    {
        level: 12,
        initial: 0,
        goal: 404,
        moves: 5,
        buttons: [
            ['HNT', '+8', 'CLR'],
            ['EMP', 'x10', 'EMP'],
            ['OPT', '/2', 'EMP']
        ],
        hint: '+8, x10, x10, +8, /2'
    },
    // Level 13
    {
        level: 13,
        initial: 171,
        goal: 23,
        moves: 4,
        buttons: [
            ['HNT', 'x2', 'CLR'],
            ['EMP', '-9', '<<<'],
            ['OPT', 'EMP', 'EMP']
        ],
        hint: '-9, <<<, x2, -9'
    },
    // Level 14
    {
        level: 14,
        initial: 0,
        goal: 21,
        moves: 5,
        buttons: [
            ['HNT', '+5', 'CLR'],
            ['EMP', 'x3', '<<<'],
            ['OPT', 'x5', 'EMP']
        ],
        hint: '+5, x3, x5, <<<, x3'
    },
    // Level 15
    {
        level: 15,
        initial: 10,
        goal: 50,
        moves: 3,
        buttons: [
            ['HNT', 'x3', 'CLR'],
            ['EMP', 'x2', 'EMP'],
            ['OPT', '-5', 'EMP']
        ],
        hint: 'x3, -5, x2'
    },
    // Level 16
    {
        level: 16,
        initial: 0,
        goal: 2,
        moves: 5,
        buttons: [
            ['HNT', '+4', 'CLR'],
            ['EMP', 'x9', '<<<'],
            ['OPT', 'EMP', 'EMP']
        ],
        hint: '+4, x9, <<<, x9, <<<'
    },
    // Dialog 12
    {
        dialog: "WOW! Another new button!",
        confirm: "Really?"
    },
    // Dialog 13
    {
        dialog: "Yeah, it adds the digit displayed to the end of your number without doing any math!",
        confirm: "Neat!",
        preview_btn: "_2"
    },
    // Level 17
    {
        level: 17,
        initial: 0,
        goal: 11,
        moves: 2,
        buttons: [
            ['HNT', '_1', 'CLR'],
            ['EMP', 'EMP', 'EMP'],
            ['OPT', 'EMP', 'EMP']
        ],
        hint: '_1, _1'
    },
    // Level 18
    {
        level: 18,
        initial: 0,
        goal: 101,
        moves: 3,
        buttons: [
            ['HNT', '_1', 'CLR'],
            ['EMP', '_0', 'EMP'],
            ['OPT', 'EMP', 'EMP']
        ],
        hint: '_1, _0, _1'
    },
    // Level 19
    {
        level: 19,
        initial: 0,
        goal: 44,
        moves: 3,
        buttons: [
            ['HNT', '_2', 'CLR'],
            ['EMP', 'x2', 'EMP'],
            ['OPT', 'EMP', 'EMP']
        ],
        hint: '_2, _2, x2'
    },
    // Level 20
    {
        level: 20,
        initial: 0,
        goal: 35,
        moves: 2,
        buttons: [
            ['HNT', '+3', 'CLR'],
            ['EMP', '_5', 'EMP'],
            ['OPT', 'EMP', 'EMP']
        ],
        hint: '+3, _5'
    },
    // Level 21
    {
        level: 21,
        initial: 0,
        goal: 56,
        moves: 3,
        buttons: [
            ['HNT', '_1', 'CLR'],
            ['EMP', '+5', 'EMP'],
            ['OPT', 'EMP', 'EMP']
        ],
        hint: '+5, _1, +5'
    },
    // Level 22
    {
        level: 22,
        initial: 0,
        goal: 9,
        moves: 4,
        buttons: [
            ['HNT', '+2', 'CLR'],
            ['EMP', '/3', 'EMP'],
            ['OPT', '_1', 'EMP']
        ],
        hint: '+2, _1, /3, +2'
    },
    // Level 23
    {
        level: 23,
        initial: 15,
        goal: 10,
        moves: 4,
        buttons: [
            ['HNT', '_0', 'CLR'],
            ['EMP', '+2', 'EMP'],
            ['OPT', '/5', 'EMP']
        ],
        hint: '/5, +2, _0, /5'
    },
    // Level 24
    {
        level: 24,
        initial: 0,
        goal: 210,
        moves: 5,
        buttons: [
            ['HNT', '-5', 'CLR'],
            ['EMP', '+5', '_2'],
            ['OPT', '_5', 'EMP']
        ],
        hint: '_2, _5, -5, _5, +5'
    },
    // Level 25
    {
        level: 25,
        initial: 40,
        goal: 2020,
        moves: 4,
        buttons: [
            ['HNT', '_0', 'CLR'],
            ['EMP', '+4', 'EMP'],
            ['OPT', '/2', 'EMP']
        ],
        hint: '_0, +4, _0, /2'
    },
    // Level 26
    {
        level: 26,
        initial: 0,
        goal: 11,
        moves: 4,
        buttons: [
            ['HNT', '_12', 'CLR'],
            ['EMP', 'EMP', '<<<'],
            ['OPT', 'EMP', 'EMP']
        ],
        hint: '_12, <<<, _12, <<<'
    },
    // Level 27
    {
        level: 27,
        initial: 0,
        goal: 102,
        moves: 4,
        buttons: [
            ['HNT', '_10', 'CLR'],
            ['EMP', '+1', '<<<'],
            ['OPT', 'EMP', 'EMP']
        ],
        hint: '_10, _10, <<<, +1'
    },
    // Dialog 14
    {
        dialog: "I just discovered another new button! This button converts a number in the total to a new number. It looks like this:",
        preview_btn: "2=>1",
        confirm: "Wow!"
    },
    // Level 28
    {
        level: 28,
        initial: 0,
        goal: 222,
        moves: 4,
        buttons: [
            ['HNT', '_1', 'CLR'],
            ['EMP', 'EMP', '1=>2'],
            ['OPT', 'EMP', 'EMP']
        ],
        hint: '_1, _1, _1, 1=>2'
    },
    // Level 29
    {
        level: 29,
        initial: 0,
        goal: 93,
        moves: 4,
        buttons: [
            ['HNT', '+6', 'CLR'],
            ['EMP', 'x7', '6=>9'],
            ['OPT', 'EMP', 'EMP']
        ],
        hint: '+6, 6=>9, x7, 6=>9'
    },
    // Level 30
    {
        level: 30,
        initial: 0,
        goal: 2321,
        moves: 6,
        buttons: [
            ['HNT', '_1', 'CLR'],
            ['EMP', '_2', '1=>2'],
            ['OPT', 'EMP', '2=>3']
        ],
        hint: '_1, _2, _1, 2=>3, 1=>2, _1'
    },
    // Dialog 15
    {
        dialog: "Bad news!",
        confirm: "What?!"
    },
    // Dialog 16
    {
        dialog: "That was the last level. Check back soon for more levels. For now clicking ok will restart the game.",
        confirm: "OK"
    }
]; 
