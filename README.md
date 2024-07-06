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

### Dynamic

Meant to handle dynamic content, such as blog articles. 

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

### List

Meant to list all the files from specified folder, e.g. `/content/blog/`, 

Every list page will be generated in specified folder as `index.html` file, so that it will be nicely accessible on your server in human readable manner (e.g. as `/blog/` page).

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
