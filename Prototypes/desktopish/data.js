const categories = [
  {
    id: 'games',
    title: 'Games',
    icon: '🎮',
    items: [
      {
        name: "Treasure",
        link: "Treasure/index.html",
        icon: "💎"
      },
      {
        name: "Wompus",
        link: "Wompus/index.html",
        icon: "🐺"
      },
      {
        name: "War",
        link: "war/index.html",
        icon: "⚔️"
      },
      {
        name: "Wrestling",
        link: "Wrestling/index.html",
        icon: "🤼"
      },
      {
        name: "Screw It",
        link: "ScrewIt/index.html",
        icon: "🔧"
      },
      {
        name: "Screw It (AI gen)",
        link: "ScrewIt/AI/index.html",
        icon: "🤖"
      },
      {
        name: "Boxelot (AI gen)",
        link: "Boxelot/index.html",
        icon: "📦"
      }
    ]
  },
  {
    id: 'apps',
    title: 'Apps',
    icon: '📱',
    items: [
      {
        name: "Texture Packer",
        link: "TexturePacker/index.html",
        icon: "🎨"
      },
      {
        name: "Emoji Finder",
        link: "Emojis/index.html",
        icon: "😀"
      },
      {
        name: "Key Frame Studio V1",
        link: "Anim/v1/index.html",
        icon: "🎬"
      },
      {
        name: "Key Frame Studio V2",
        link: "Anim/v2/index.html",
        icon: "🎥"
      }
    ]
  },
  {
    id: 'readme',
    title: 'README.md',
    icon: '📄',
    type: 'file',
    content: `<h1>Gabor Szauer</h1>
<ul style="margin-left: 20px">
<li><a href="https://gabormakesgames.com">Blog</a></li>
<li><a href="https://github.com/gszauer/">GitHub</a></li>
<li><a href="https://bsky.app/profile/gszauer.bsky.social">Bluesky</a></li>
</ul>`
  },
  {
    id: 'blog-shortcut',
    title: 'Blog',
    icon: '📝',
    type: 'shortcut',
    link: 'https://gabormakesgames.com'
  }
];