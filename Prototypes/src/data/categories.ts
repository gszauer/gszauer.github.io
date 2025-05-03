import { Category } from '../types/windows98';

const categories: Category[] = [
  {
    id: 'games',
    title: 'Games',
    icon: 'folder',
    type: 'folder',
    items: [
      {
        id: 'snake',
        title: 'Snake Game',
        description: 'Classic snake game with modern controls.',
        link: '/prototypes/snake',
        thumbnail: 'https://images.pexels.com/photos/2103127/pexels-photo-2103127.jpeg?auto=compress&cs=tinysrgb&w=300'
      },
      {
        id: 'puzzle',
        title: 'Puzzle Game',
        description: 'Brain teasing puzzle challenges.',
        link: '/prototypes/puzzle',
        thumbnail: 'https://images.pexels.com/photos/957312/pexels-photo-957312.jpeg?auto=compress&cs=tinysrgb&w=300'
      }
    ]
  },
  {
    id: 'apps',
    title: 'Apps',
    icon: 'folder',
    type: 'folder',
    items: [
      {
        id: 'todo-app',
        title: 'Todo App',
        description: 'A simple todo application with task management.',
        link: '/prototypes/todo-app',
        thumbnail: 'https://images.pexels.com/photos/3243/pen-calendar-to-do-checklist.jpg?auto=compress&cs=tinysrgb&w=300'
      },
      {
        id: 'weather-app',
        title: 'Weather App',
        description: 'Real-time weather information dashboard.',
        link: '/prototypes/weather-app',
        thumbnail: 'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=300'
      }
    ]
  },
  {
    id: 'readme',
    title: 'README.md',
    icon: 'file-text',
    type: 'file',
    content: `
      # Gabor's Prototypes

      Welcome to my prototype collection! This is a showcase of various web applications and games I've created.

      ## Categories

      ### Games
      A collection of browser-based games built with modern web technologies.

      ### Apps
      Various web applications demonstrating different functionalities and use cases.

      ## Links
      - [Portfolio](https://gabormakesgames.com)
      - [GitHub](https://github.com/gszauer/)
      - [Bluesky](https://bsky.app/profile/gszauer.bsky.social)
    `
  }
];

export default categories;