import Redis from 'ioredis';
import { toJSON } from './levels/index.js';

const redis = new Redis();

const games = {};

const getId = (prefix = '') => {
  const id = Math.random().toString().replace('0.', '');
  return prefix + id;
};

/**
 * @returns {Game}
 */
export const getGameOr404 = (gameId) => {
  if (!games[gameId]) {
    const err = new Error('missing game');
    // @ts-ignore
    err.status = 404;
    // @ts-ignore
    err.expose = true;
    throw err;
  }

  return games[gameId];
};

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
          delete c.behaviors;
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

export class Game {
  players = {};

  status = 'GATHERING_PLAYERS';

  constructor(components, id = null) {
    this.id = id ? id : getId();
    this.components = JSON.parse(components, function reviver(key, value) {
      if (typeof value == 'string' && value.startsWith('function (')) {
        value = eval(`(${value})`);
      }
      return value;
    });

    games[this.id] = this;
  }

  addPlayer(player) {
    this.players[player.id] = player;
  }

  broadcast(fields = ['state', 'players', 'components']) {
    for (const playerId in this.players) {
      this.players[playerId].send(fields);
    }
  }
}

process.once('SIGUSR2', () => {
  const pipeline = redis.pipeline();
  pipeline.set('games', Object.keys(games).join(' '));
  for (const gameId in games) {
    pipeline.set(`game.${gameId}`, toJSON(games[gameId]));
  }
  pipeline.exec(() => {
    console.log(`Saved ${Object.keys(games).length} games to Redis`);
    process.kill(process.pid, 'SIGUSR2');
  });
});

// load games from redis
redis.get('games', async (err, res) => {
  if (err) {
    throw err;
  }
  if (!res) {
    return;
  }
  const gameIds = res.split(' ');
  for (const gameId of gameIds) {
    const json = JSON.parse(await redis.get(`game.${gameId}`));
    const game = new Game(JSON.stringify(json.components), json.id);
    game.status = json.status;

    for (let playerId in json.players) {
      const player = json.players[playerId];
      const p = new Player(game);
      p.id = player.id;
      p.name = player.name;
      game.addPlayer(p);
    }
  }
});
