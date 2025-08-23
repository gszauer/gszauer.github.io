// Desktop Icons Configuration
const desktop_icons = [
  {
    type: 'folder',
    name: 'Games (Finished)',
    icon: '🎮',
    id: 'games',
    items: [
      {
        type: 'shortcut',
        name: 'Slide Swiped',
        link: 'Swipe3/index.html',
        icon: '🦔'
      },
      {
        type: 'shortcut',
        name: 'Cards of War',
        link: 'war/index.html',
        icon: '⚔️'
      },
      {
        type: 'shortcut',
        name: 'Tapdown Dungeon',
        link: 'Boxelot5/index.html',
        icon: '⛓️'
      },
      {
        type: 'shortcut',
        name: 'Calcul8or',
        link: 'Calc1/index.html',
        icon: '🖩'
      }
    ]
  },
  {
    type: 'folder',
    name: 'Games (Abandoned)',
    icon: '🎲',
    id: 'moregames',
    items: [
      {
        type: 'shortcut',
        name: 'Wompus',
        link: 'Wompus/index.html',
        icon: '🐺'
      },
      {
        type: 'shortcut',
        name: 'Really Real Wrestling',
        link: 'Wrestling/index.html',
        icon: '🤼'
      },
      {
        type: 'shortcut',
        name: 'Paladinged',
        link: 'Paladinged/index.html',
        icon: '🔨'
      }
    ]
  },
  {
    type: 'folder',
    name: 'Apps',
    icon: '📱',
    id: 'apps',
    items: [
      {
        type: 'shortcut',
        name: 'Carrot.Code',
        link: 'Carrot/index.html',
        icon: '🥕'
      },
      {
        type: 'shortcut',
        name: 'Emoji Finder',
        link: 'Emojis/index.html',
        icon: '😀'
      },
      {
        type: 'shortcut',
        name: 'Key Frame Studio V1',
        link: 'Anim/v1/index.html',
        icon: '🎬'
      },
      {
        type: 'shortcut',
        name: 'Key Frame Studio V2',
        link: 'https://keyframestudio.app',
        icon: '🎥'
      }
    ]
  },
  {
    type: 'shortcut',
    name: 'Blog',
    icon: '📝',
    link: 'https://gabormakesgames.com',
    id: 'blog-shortcut'
  },
  {
    type: 'embedded',
    name: 'README.md',
    icon: '📄',
    id: 'readme',
    content: `<h1>Gabor Szauer</h1>
    <p>This is a collection of prototype projects i made. Most of them are usable.</p>
<ul style="margin-left: 20px">
<li><a href="https://gabormakesgames.com">Blog</a></li>
<li><a href="https://github.com/gszauer/">GitHub</a></li>
<li><a href="https://bsky.app/profile/gszauer.bsky.social">Bluesky</a></li>
</ul>
<p>Landing page generated with <a href="https://bolt.new/">bolt.new</a></p>`
  }
];

// Start Menu Configuration
const startmenu_items = [
  {
    type: 'shortcut',
    name: 'GitHub',
    icon: '🐙',
    link: 'https://github.com/gszauer/'
  },
  {
    type: 'shortcut',
    name: 'Bluesky',
    icon: '💬',
    link: 'https://bsky.app/profile/gszauer.bsky.social'
  },
  {
    type: 'folder',
    name: 'Games',
    icon: '🎮',
    id: 'games'
  },
  {
    type: 'folder',
    name: 'Apps',
    icon: '📱',
    id: 'apps'
  }
];

// Run submenu items
const startmenu_run_items = [
  {
    type: 'iframe',
    name: 'Slide Swiped',
    icon: '🦔',
    link: 'Swipe3/index.html',
    width: 800,
    height: 600,
  },
  {
    type: 'iframe',
    name: 'Cards of War',
    icon: '⚔️',
    link: 'war/index.html',
    width: 512,
    height: 768,
  },
  {
    type: 'iframe',
    name: 'Tapdown Dungeon',
    icon: '⛓️',
    link: 'Boxelot5/index.html',
    width: 512,
    height: 768,
  }
];

// Shutdown link
const startmenu_shutdown = {
  type: 'shortcut',
  name: 'Shut Down...',
  icon: '🚪',
  link: 'https://gabormakesgames.com'
};