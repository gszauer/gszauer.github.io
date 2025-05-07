const categories = [
  {
    id: 'games',
    title: 'Games',
    icon: '🎮',
    items: [
      {
        name: 'Treasure',
        link: 'Treasure/index.html',
        icon: '💎',
      },
      {
        name: 'Wompus',
        link: 'Wompus/index.html',
        icon: '🐺',
      },
      {
        name: 'War',
        link: 'war/index.html',
        icon: '⚔️',
      },
      {
        name: 'Wrestling',
        link: 'Wrestling/index.html',
        icon: '🤼',
      },
      {
        name: 'Screw It',
        link: 'ScrewIt/index.html',
        icon: '🔧',
      },
      {
        name: 'Screw It (AI gen)',
        link: 'ScrewIt/AI/index.html',
        icon: '🤖',
      },
      {
        name: 'Boxelot (AI gen)',
        link: 'Boxelot/index.html',
        icon: '📦',
      },
    ],
  },
  {
    id: 'apps',
    title: 'Apps',
    icon: '📱',
    items: [
      {
        name: 'Texture Packer',
        link: 'TexturePacker/index.html',
        icon: '🎨',
      },
      {
        name: 'Emoji Finder',
        link: 'Emojis/index.html',
        icon: '😀',
      },
      {
        name: 'Key Frame Studio V1',
        link: 'Anim/v1/index.html',
        icon: '🎬',
      },
      {
        name: 'Key Frame Studio V2',
        link: 'https://keyframestudio.app',
        icon: '🎥',
      },
    ],
  },
  {
    id: 'readme',
    title: 'README.md',
    icon: '📄',
    type: 'file',
    content: `<h1>Gabor Szauer</h1>
    <p>This is a collection of prototype projects i made. Most of them are usable.</p>
<ul style="margin-left: 20px">
<li><a href="https://gabormakesgames.com">Blog</a></li>
<li><a href="https://github.com/gszauer/">GitHub</a></li>
<li><a href="https://bsky.app/profile/gszauer.bsky.social">Bluesky</a></li>
</ul>
<p>Landing page generated with <a href="https://bolt.new/">bolt.new</a></p>`,
  },
  {
    id: 'blog-shortcut',
    title: 'Blog',
    icon: '📝',
    type: 'shortcut',
    link: 'https://gabormakesgames.com',
  },
  {
    id: 'boxelot',
    title: 'Boxelot',
    icon: '🎮',
    type: 'iframe',
    link: 'https://gabormakesgames.com/Prototypes/Boxelot/index.html',
    width: 512,
    height: 768
  },
  {
    id: 'keyframe-studio',
    title: 'Key Frame Studio',
    icon: '🎥',
    type: 'iframe',
    link: 'https://keyframestudio.app',
    width: 800,
    height: 600
  }
];