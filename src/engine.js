import fs from 'fs';
import path from 'path';
import watch from 'node-watch';
import showdown from 'showdown';
import fm from 'front-matter';
import UglifyJS from 'uglify-js';
import uglifycss from 'uglifycss';

export default class Engine {
  constructor(args) {
    this.routes = args?.routes || [];
    this.markdown = new showdown.Converter({ metadata: true });
    this.markdown.setFlavor('github');
    // get current project path
    this.path = process.cwd();
  }

  addRoute(route) {
    this.routes.push(route);
  }

  addRoutes(routeArr) {
    routeArr.forEach(route => {
      this.routes.push(route);
    });
  }

  removeRoute(routeId) {
    const index = this.routes.findIndex((route) => route.id === routeId);
    if (index > -1) {
      // @ts-ignore-next-line
      this.routes.split(index, 1);
    }
  }

  compileRoutes() {
    this.clearFolder(path.join(this.path, 'output/*'));
    this.routes.forEach((route) => {
      if (route) {
        if (route.type === 'dynamic') {
          this.compileDynamicRoute(route);
        } else if (route.type === 'list') {
          this.compileListRoute(route);
        } else if (route.type === 'static') {
          this.compileStaticRoute(route);
        }
      }
    });
    this.copyPublicDir();
    this.copyContentStaticDir();
  }

  compileDynamicRoute(route) {
    const routePath = path.join(this.path, route.source)
    // collect markdown files within directory
    const sourceFilePaths = this.getAllFilesWithinDirectory(routePath);
    // create destination list directory (will contain folders 1 per list item with index.html file inside)
    this.ensureDirExists(path.join(this.path, route.destination));
    // loop over source files and save them in destination directory
    sourceFilePaths.forEach((sourceFilePath) => {
      // read single file
      const txtContent = fs.readFileSync(path.join(routePath, sourceFilePath), 'utf8');
      // extract markdown and parse it into HTML
      const htmlContent = this.markdown.makeHtml(txtContent);
      // extract metadata from the current file
      const meta = this.markdown.getMetadata();
      // Remove extra quotation characters from title
      if (meta?.title) {
        meta.title = this.stripFromQuotes(meta.title);
      }
      // create reusable object that we send to render functions
      const contentObj = {
        meta: meta,
        slug: meta?.slug || this.slugify(meta.title || String(Date.now())),
        content: htmlContent
      }
      // Add route-based content to the object
      if (route.content) {
        contentObj.routeContent = route.content;
      }
      // create destination file url
      const outputFilePath = path.join(this.path, route.destination, contentObj.slug);
      // create destination route item folder
      this.ensureDirExists(outputFilePath);
      // compile content object with template
      const content = route.template(contentObj);
      // save file in the final path as index.html (for seamless routing)
      fs.writeFileSync(path.join(outputFilePath, 'index.html'), content);
    });
  }

  compileListRoute(route) {
    const contentObj = {
      items: [],
    }
    const routePath = path.join(this.path, route.source);
    // collect markdown files within directory
    const sourceFilePaths = this.getAllFilesWithinDirectory(routePath);
    // create destination list directory (will contain folders 1 per list item with index.html file inside)
    this.ensureDirExists(route.destination);
    // loop over source files
    sourceFilePaths.forEach((sourceFilePath) => {
      // read single file
      const txtContent = fs.readFileSync(path.join(routePath, sourceFilePath), 'utf8');
      // extract metadata from the current file
      const meta = fm(txtContent)?.attributes;
      // Remove extra quotation characters from title
      if (meta?.title) {
        meta.title = this.stripFromQuotes(meta.title);
      }
      const slug = meta?.slug || this.slugify(meta?.title || String(Date.now()));
      // create reusable object that we send to render functions
      const contentItemObj = {
        meta: meta || { title: Date.now() },
        slug: slug,
        url: `${route.listItemUrl}${slug}/`
      }
      
      // add list item to collection
      contentObj.items.push(contentItemObj);
    });
    // Reverse the order so the posts will come from newest at the top
    contentObj.items.reverse();
    // create destination file url
    const outputFilePath = path.join(this.path, route.destination);
    // create destination route folder
    this.ensureDirExists(outputFilePath);
    // save json file for search purposes
    if (route.createSearchIndex) {
      fs.writeFileSync(path.join(outputFilePath, 'search.json'), JSON.stringify(contentObj));
    }
    // Add route-based content to the object
    if (route.content) {
      contentObj.routeContent = route.content;
    }
    // compile content object with template
    const content = route.template(contentObj);
    // save file in the final path as index.html (for seamless routing)
    fs.writeFileSync(path.join(outputFilePath, 'index.html'), content);
  }

  compileStaticRoute(route) {
    // create destination file url
    const outputFilePath = path.join(this.path, route.destination);
    // create destination directory (will contain index.html inside)
    this.ensureDirExists(outputFilePath);
    // if source prop is passed (to direct .md file) then fetch its contents
    if (route.source) {
      const txtContent = fs.readFileSync(path.join(this.path, route.source), 'utf8');
      // extract metadata from the current file
      const htmlContent = this.markdown.makeHtml(txtContent);
      // extract metadata from the current file
      const meta = this.markdown.getMetadata();
      // create reusable object that we send to render functions
      const contentObj = {
        meta: meta,
        content: htmlContent
      }
      route.content = { ...contentObj, ...route.content };
    }
    // compile content object with template
    const content = route.template(route.content || { title: Date.now() });
    // save file in the final path as index.html (for seamless routing)
    fs.writeFileSync(path.join(outputFilePath, 'index.html'), content);
  }

  copyPublicDir() {
    const outputAssetsPath = path.join(this.path, 'output/assets');
    this.ensureDirExists(outputAssetsPath);
    fs.cpSync(path.join(this.path, 'theme/assets'), outputAssetsPath, { recursive: true });
  }

  copyContentStaticDir() {
    const outputStaticPath = path.join(this.path, 'output/static');
    this.ensureDirExists(outputStaticPath);
    fs.cpSync(path.join(this.path, 'content/static'), outputStaticPath, { recursive: true });
  }

  mergeAllSearchResults(urlArr, outputUrl) {
    const jsonArr = { data: [] };
    urlArr.forEach((url) => {
      const txtContent = fs.readFileSync(path.join(this.path, url), 'utf8') || '{}';
      if (txtContent !== '{}') {
        const jsonContent = JSON.parse(txtContent);
        if (jsonContent && jsonContent.items) {
          jsonArr.data.push(...jsonContent.items.filter((note) => !note.meta.draft));
        }
      }
    });
    const outputSearchPath = path.join(this.path, outputUrl);
    this.ensureDirExists(outputSearchPath);
    fs.writeFileSync(path.join(outputSearchPath, 'search.json'), JSON.stringify(jsonArr));
  }

  minify(urlArr) {
    urlArr.forEach((url) => {
      const outputStaticPath = path.join(this.path, url);
      if (fs.existsSync(outputStaticPath)) {
        const txtContent = fs.readFileSync(outputStaticPath, 'utf8') || '';
        if (txtContent) {
          // handle js minification
          if (url.includes('.js')) {
            const result = UglifyJS.minify(txtContent);
            fs.writeFileSync(outputStaticPath, result?.code || txtContent);
            // handle css minification
          } else if (url.includes('.css')) {
            const result = uglifycss.processString(txtContent);
            fs.writeFileSync(outputStaticPath, result || txtContent);
          }
        }
      }
    });
  }

  // Commands

  build(buildArgs) {
    this.addRoutes(buildArgs.routes || []);
    this.compileRoutes();
    if (buildArgs.afterCompileCallback && typeof buildArgs.afterCompileCallback === 'Function') {
      buildArgs.afterCompileCallback(buildArgs)
    }

    // TODO
    // const yearSearchUrlArr = notesYearList.map((year) => `/output/notes/${year}/search.json`);
    // Engine.mergeAllSearchResults(yearSearchUrlArr, '/output/notes/');

    this.minify(buildArgs.assetsToMinify || []);
  }

  watch(watchArgs) {
    watch(watchArgs.foldersToWatch || [], {
      recursive: true,
    }, () => {
      this.build(watchArgs);
    });
  }
  
  // Helper methods

  getAllFilesWithinDirectory(path) {
    return fs.readdirSync(path, { withFileTypes: true }).filter(item => !item.isDirectory()).map(item => item.name);
  }
  
  ensureDirExists(path) {
    if (!fs.existsSync(path)){
      fs.mkdirSync(path, { recursive: true });
    }
  }
  
  slugify(txt) {
    const a = 'àáäâãåèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;'
    const b = 'aaaaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------'
    const p = new RegExp(a.split('').join('|'), 'g')
    return txt.toString().toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with
      .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
      .replace(/&/g, '-and-') // Replace & with ‘and’
      .replace(/[^\w\-]+/g, '') // Remove all non-word characters
      .replace(/\-\-+/g, '-') // Replace multiple — with single -
      .replace(/^-+/, '') // Trim — from start of text .replace(/-+$/, '') // Trim — from end of text
  }
  
  async clearFolder(path) {
    await fs.rm(path, { recursive: true }, () => ({}));
  }
  
  stripFromQuotes (title) {
    if (
      title && 
      title[0] === '"' && 
      title[title.length - 1] === '"'
    ) {
      return title.slice(1, -1);
    } else if (
      title &&
      title.includes('&quot;') 
    ) {
      return title.replace(/&quot;/g, '');
    }
    return title;
  }  
}
