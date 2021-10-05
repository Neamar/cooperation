import Redis from 'ioredis';
import { toJSON } from '../levels/index.js';
import Level from './level.js';
import { Player } from './player.js';
import { getId } from './utils.js';

// Keep the linter happy
const redis = new Redis();

const games = {};

/**
 * @returns {Game}
 */
export const getGameOr404 = (gameId) => {
  if (!games[gameId]) {
    const err = new Error(`missing game ${gameId}`);
    // @ts-ignore
    err.status = 404;
    // @ts-ignore
    err.expose = true;
    throw err;
  }

  return games[gameId];
};

export class Game extends Level {
  constructor(components, id = null) {
    super();
    this.id = id ? id : getId();
    this.components = JSON.parse(components, function reviver(key, value) {
      if (typeof value == 'string' && value.startsWith('function (')) {
        value = Function(`"use strict";return (${value})`)();
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

  wsStartGame(event, playerId) {
    if (this.status == Game.GATHERING_PLAYERS) {
      this.status = Game.PLAYING;
    }
    // mark components as visible for players
    this.components.forEach((component) => {
      if (component.visibility[0] === '__all__') {
        component.visibility = Object.keys(this.players);
      }
    });

    // apply "add" effect for active components
    this.components.forEach((component) => {
      if (component.state == 'active') {
        this.exec(component, 'enable', playerId);
      }
    });

    return ['status', 'components'];
  }

  wsComponentClick(event, playerId) {
    const component = this.getTarget(event.component);
    this.exec(component, 'click', playerId);
    return ['components'];
  }
  wsComponentMouseover(event, playerId) {
    const component = this.getTarget(event.component);
    this.exec(component, 'mouseover', playerId);
    return ['components'];
  }
  wsComponentMouseleave(event, playerId) {
    const component = this.getTarget(event.component);
    this.exec(component, 'mouseleave', playerId);
    return ['components'];
  }
  wsComponentInput(event, playerId) {
    const component = this.getTarget(event.component);
    const value = event.value;
    if (value != component.data.value) {
      this.change(component, 'data.value', value);
      this.exec(component, 'input', playerId);
    }
    return ['components'];
  }
}

let hasCleanedUp = false;
const onShutdown = () => {
  if (hasCleanedUp) {
    return;
  }
  hasCleanedUp = true;
  const pipeline = redis.pipeline();
  pipeline.set('games', Object.keys(games).join(' '));
  for (const gameId in games) {
    pipeline.set(`game.${gameId}`, toJSON(games[gameId]));
  }
  pipeline.exec(() => {
    console.log(`Saved ${Object.keys(games).length} games to Redis`);
    process.exit();
  });
};

process.once('SIGUSR2', onShutdown);
process.once('SIGTERM', onShutdown);
process.once('SIGINT', onShutdown);

// load games from redis on startup
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
