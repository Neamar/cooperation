import Redis from 'ioredis';
import { toJSON } from './levels/index.js';

const redis = new Redis();

const games = {};

const getId = (prefix = '') => {
  const id = Math.random().toString().replace('0.', '');
  return prefix + id;
};

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
  constructor(id = null) {
    this.id = id ? id : getId('p');
    const adjective = Player.ADJECTIVES[Math.floor(Math.random() * Player.ADJECTIVES.length)];
    const noun = Player.NOUNS[Math.floor(Math.random() * Player.NOUNS.length)];
    this.name = `${adjective} ${noun}`;
  }
}

export class Game {
  players = {};

  state = 'GATHERING_PLAYERS';

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
}

process.once('SIGUSR2', () => {
  const pipeline = redis.pipeline();
  pipeline.set('games', Object.keys(games).join(' '));
  for (const gameId in games) {
    pipeline.set(`game.${gameId}`, toJSON(games[gameId]));
    console.log(toJSON(games[gameId]));
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
    game.state = json.state;

    for (let playerId in json.players) {
      const player = json.players[playerId];
      const p = new Player();
      p.id = player.id;
      p.name = player.name;
      game.addPlayer(p);
    }
  }
});
