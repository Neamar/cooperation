import { getId } from './utils.js';

/**
 * @returns {Player}
 */
export const getPlayerOr404 = (game, playerId) => {
  if (!game.players[playerId]) {
    const err = new Error('missing player');
    // @ts-ignore
    err.status = 404;
    // @ts-ignore
    err.expose = true;
    throw err;
  }

  return game.players[playerId];
};

export class Player {
  static ADJECTIVES = [
    'abnormal',
    'bureaucratic',
    'chosen',
    'defensive',
    'elderly',
    'foolish',
    'giant',
    'hostile',
    'intense',
    'judicial',
    'kind',
    'lazy',
    'magical',
    'ninja',
  ];
  static NOUNS = [
    'artist',
    'biscuit',
    'brocoli',
    'cab',
    'coffee',
    'customer',
    'detector',
    'deputy',
    'emperor',
    'evil',
    'factory',
    'failure',
    'gentleman',
    'goalkeeper',
    'grandmother',
    'headmaster',
    'immigrant',
    'infant',
    'judge',
    'joke',
    'journalist',
    'kidney',
    'kilometer',
  ];
  constructor(game, id = null) {
    this.game = game;
    this.id = id ? id : getId('p');
    const adjective = Player.ADJECTIVES[Math.floor(Math.random() * Player.ADJECTIVES.length)];
    const noun = Player.NOUNS[Math.floor(Math.random() * Player.NOUNS.length)];
    this.name = `${adjective} ${noun}`;
    this.ws = [];
  }

  addWs(websocket) {
    this.ws.push(websocket);

    websocket.on('close', () => {
      this.ws = this.ws.filter((ws) => ws !== websocket);
      if (this.ws.length === 0) {
        this.game.broadcast('players');
      }
    });
  }

  send(fields = ['status', 'players', 'components']) {
    const out = {};
    if (fields.includes('components')) {
      out.components = this.game.components
        .filter((c) => c.state === 'active' && c.visibility.includes(this.id))
        .map((component) => {
          const c = JSON.parse(JSON.stringify(component));
          delete c.visibility;
          delete c.state;
          delete c.internalData;
          c.behaviors = Object.keys(component.behaviors);
          return c;
        });
    }
    if (fields.includes('players')) {
      out.players = this.game.players;
    }
    if (fields.includes('status')) {
      out.status = this.game.status;
    }

    if (Object.keys(out).length > 0) {
      const json = JSON.stringify(out);
      this.ws.forEach((ws) => ws.send(json));
    }
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      connected: this.ws.length,
    };
  }
}
