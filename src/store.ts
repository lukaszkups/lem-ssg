import { LemRoute } from "./types"

export default class LemStore {
  routes: LemRoute[];

  constructor() {
    this.routes = [];
  }

  addRoute(route: LemRoute) {
    const index = this.routes.findIndex((r: LemRoute) => r.name === route.name);
    if (index > -1) {
      throw new Error('Route with such name exists!');
    } else {
      this.routes.push(route);
    }
  }
  
  removeRoute(routeName: string) {
    const index = this.routes.findIndex((r: LemRoute) => r.name === routeName);
    if (index > -1) {
      this.routes.splice(index, 1);
    }
  }
}
