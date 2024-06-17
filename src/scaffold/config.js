// import notesRenderer from './theme/templates/note.js';
// import notesListRenderer from './theme/templates/notes-list.js';
// import notesIndexRenderer from './../theme/templates/notes-index.js';
// import projectsListRenderer from './../theme/templates/projects-list.js';
// import homeRenderer from './../theme/templates/home.js';
// import aboutRenderer from './../theme/templates/about.js';
// import experienceRenderer from './../theme/templates/experience.js';
// import { notesYearList } from './../theme/templates/enums.js';

const liteRoutes = () => {
  const routes = [
    {
      id: 'blog-2023',
      type: 'dynamic',
      source: '/content/pages/blog/2023/',
      destination: '/output/blog/',
      template: blogEntryRenderer,
    },
    {
      id: 'blog-2024',
      type: 'dynamic',
      source: '/content/pages/blog/2024/',
      destination: '/output/blog/',
      template: blogEntryRenderer,
    },
    {
      id: 'blog-index',
      type: 'static',
      destination: '/output/blog/',
      content: {
        title: '89bitstudio - Blog notes',
        tags: 'Front-end developer, FE dev, JavaScript, TypeScript, Blog, Blogger, Blogging, lifestyle, technology'
      },
      template: blogIndexRenderer,
    },
    {
      id: 'projects-list',
      type: 'list',
      source: '/content/pages/projects/',
      destination: '/output/projects/',
      template: projectsListRenderer,
    },
    {
      id: 'home',
      type: 'static',
      destination: '/output/',
      content: {
        title: '89bitstudio',
        tags: 'Front-end developer, FE dev, gamedev, JavaScript, TypeScript, portfolio, web developer, webdev, programming, programmer, technology, tech writing, Vue.js, Vue, Vue.js 2, Vue.js 3, Vue 2, Vue 3, Construct 3'
      },
      template: homeRenderer,
    },
    {
      id: 'about',
      type: 'static',
      destination: '/output/about/',
      source: '/content/pages/about.md',
      template: aboutRenderer,
    },
  ];

  const blogYearsList = [2023, 2024];

  blogYearsList.forEach((year) => {
    routes.push({
      id: `blog-list-${year}`,
      type: 'list',
      source: `/content/pages/blog/${year}/`,
      destination: `/output/blog/${year}/`,
      listItemUrl: '/blog/',
      createSearchIndex: true,
      content: {
        title: '89bitstudio blog',
        year: year,
        tags: 'Front-end developer, FE dev, gamedev, JavaScript, TypeScript, Blog, Blogger, Blogging, lifestyle, technology, tech writing, Vue.js, Vue, Vue.js 2, Vue.js 3, Vue 2, Vue 3, Construct 3'
      },
      template: blogIndexRenderer,
    })
  })
  return routes
}

export const routes = liteRoutes();