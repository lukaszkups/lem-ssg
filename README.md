# Lem - Static Site Generator

## Introduction

**Lem** is a Static Site Generator utility, that enable you to create your own DIY custom website. It offers you a set of handy methods, that will help you compile contents of your choice into fully functional static website.

## Installation

To add it to your project, simply run following command:

```
npm i -D lem-ssg
```

## Usage

To start using **Lem**, first import it to your project and prepare route configuration

```
import Lem from 'lem-ssg';

const engine = new Lem();
```

## Route types

**Lem** is able to handle following route types:

### Static

Meant to handle a single page without dynamic content, config:

```
{
  id: "your-very-own-id-as-a-string-eg-about",
  type: "static",
  destination: "/your-output-path-eg-about/",
  content: {
    title: "Lem - Static Site Generator",
    tags: "static site generator, lem, JavaScript, js, web development"
    any-prop-you-want-to-use-in-your-template: any-value-of-your-custom-prop
  },
  template: renderFunctionThatTakesSomeFileContentAndReturnsCompiledTemplate,
},
```

Example render function:

```
const renderAboutMe = (contentData) => {
  return `
    <div class="about-hero-wrapper">
      <h1>About me</h1>    
    </div>
    <div class="middle-section middle-section--about">
      <div class="main-container">
        <article class="about-me-content">
          ${contentData.content}
        </article>
      </div>
    </div>
  `;
}
```

### Dynamic

Meant to handle dynamic content (so it will handle multiple various content sources), such as blog articles. 

Every article will be generated in specified folder with following sub-path: `/article-slug-generated-from-its-title/index.html` so that it will be nicely accessible on your server in human readable manner.

Config:

```
{
  id: "your-very-own-id-as-string-eg-blog-entry"
  type: "dynamic",
  source: "/path-to-your-markdown-files-eg-content-slash-blog/",
  destination: "/your-output-path-for-all-of-your-articles-eg-blog/",
  template: renderFunctionThatTakeVariousFileContentAndReturnsCompiledTemplate,
},
```

Example render function:

```
const renderBlogNote = (contentData) => {
  return `
  <div class="note-wrapper">
    <h2>${contentData?.meta?.title}</h2>
    <p>Published at ${contentData?.meta?.date}</p>
  </div>
  <div class="article-content-wrapper">
    <div class="main-container main-container--article">
      <article>
        ${contentData.content}
      </article>
    </div>
  </div>
  `;
}
```

### List

Meant to list all the files from specified folder, e.g. `/content/blog/`, 

Every list page will be generated in specified folder as `index.html` file (e.g. `/blog/index.html`), so that it will be nicely accessible on your server in human readable manner (e.g. as `/blog/` page).

Config:

```
{
  id: "your-very-own-id-as-string-eg-blog-list",
  type: "list",
  source: "/path-to-your-markdown-files-eg-content-slash-blog",
  destination: "/your-output-path-for-all-of-your-articles-eg-blog/",
  template: renderFunctionThatTakesDynamicListOfItemsSuchAsBlogNotesAndReturnsCompiledTemplate,
},
```

Example render function:

```
const renderArticle = (article) => {
  return `
  <a class="cube article-item" href="${article.url}">
    <h2>${article?.meta?.title || JSON.stringify(article)} - ${article?.meta?.date}</h2>
  </a>
  `.replaceAll("\t", "").replaceAll("  ", " ").trim();
}

const renderArticles = (articles) => {
  let htmlString = '';
  if (articles?.length) {
    articles.forEach((article) => {
      if (!article.meta.draft) {
        htmlString += renderArticle(article);
      }
    });
  } else {
    htmlString += '<h1 class="no-articles-yet">No articles yet, working on it!</h1>'
  }
  return htmlString;
}

const renderBlogNotesList = (contentData) => {
  return `
    <div class="notes-index-wrapper">
      <h2>Blog notes</h2>
    </div>
    <div id="notes-list" class="article-list-wrapper">
      ${renderArticles(contentData.items)}
    </div>
  `;
}
```
