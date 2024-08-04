import fs from 'fs';
import LemStore from './store';
import { CoreArgs, LemRoute } from './types';

export default class LemCore {
  store: LemStore;
  constructor(args:  CoreArgs) {
    this.store = args.store;
  }
  
  addRoute(route: LemRoute) {
    this.store.addRoute(route);
  }

  removeRoute(routeName: string) {
    this.store.removeRoute(routeName);
  }

  addRoutes(routes: LemRoute[]) {
    routes.forEach((route: LemRoute) => {
      this.store.addRoute(route);
    });
  }

  // Helper methods

  async clearFolder(path: fs.PathLike) {
    await fs.rm(path, { recursive: true }, () => ({}));
  }

  slugify(txt: string) {
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

  getAllFilesWithinDirectory(path: fs.PathLike) {
    return fs.readdirSync(path, { withFileTypes: true, recursive: true })
      .filter((item: fs.Dirent) => !item.isDirectory())
      .map((item: fs.Dirent) => item.name);
  }
  
  // helper method that checks if directory exists (and if not, creates it)
  ensureDirExists(path: fs.PathLike) {
    if (!fs.existsSync(path)){
      fs.mkdirSync(path, { recursive: true });
    }
  }

  stripFromQuotes (txt: string) {
    if (
      txt && 
      txt[0] === '"' && 
      txt[txt.length - 1] === '"'
    ) {
      return txt.slice(1, -1);
    } else if (
      txt &&
      txt.includes('&quot;') 
    ) {
      return txt.replace(/&quot;/g, '');
    }
    return txt;
  }
}
