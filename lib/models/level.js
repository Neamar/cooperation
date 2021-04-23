import { Player } from './player.js';

export default class Level {
  static GATHERING_PLAYERS = 'GATHERING_PLAYERS';
  static PLAYING = 'PLAYING';
  static FINISHED = 'FINISHED';

  /**
   * @type {Object.<string, Player>}
   */
  players = {};
  components = [];

  status = Level.GATHERING_PLAYERS;

  exec(component, action, playerId) {
    if (!component.behaviors[action]) {
      return;
    }
    component.behaviors[action].bind(this)(component, playerId);
  }

  getTarget(component) {
    if (typeof component == 'object') {
      return component;
    }
    const target = this.components.find((c) => c.id === component);
    if (target) {
      return target;
    }
    throw new Error(`Component can't be found: ${component}`);
  }

  markDirty(component) {
    // do nothing
  }

  get playerIds() {
    return Object.keys(this.players);
  }

  enable(component) {
    const c = this.getTarget(component);
    if (c.state !== 'active') {
      c.state = 'active';
      this.markDirty(c);
      this.exec(c, 'enable');
    }
  }

  disable(component) {
    const c = this.getTarget(component);
    if (c.state !== 'inactive') {
      c.state = 'inactive';
      this.markDirty(c);
      this.exec(c, 'disable');
    }
  }

  duplicate(component, duplicate_id) {
    const target = this.getTarget(component);
    const c = JSON.parse(JSON.stringify(target));
    c.id = duplicate_id;
    // behaviors are not copied through JSON (they're functions)
    c.behaviors = target.behaviors;
    this.markDirty(c);
    console.log('adding', c);
    this.components.push(c);
    return c;
  }

  change(target, path, value) {
    const subpaths = path.split('.');

    if (subpaths[0] == 'state') {
      throw new Error("Don't change state with change(), use enable() or disable()");
    }
    const c = this.getTarget(target);
    this.markDirty(c);
    let t = c;

    const lastItem = subpaths.pop();
    for (let subpath of subpaths) {
      t = t[subpath];
    }
    t[lastItem] = value;

    if (subpaths[0] == 'visibility') {
      this.markDirty(c); // needs to be marked dirty again, in case we changed visibility for some players
    }
  }

  randomPin(numberLength) {
    let r = '';
    for (let i = 0; i < numberLength; i++) {
      r += Math.floor(Math.random() * 10).toString();
    }
    return r;
  }

  randomPlayer() {
    return this.playerIds[Math.floor(Math.random() * this.playerIds.length)];
  }

  allPlayersExcept(playerId) {
    return this.playerIds.filter((p) => p !== playerId);
  }
}
