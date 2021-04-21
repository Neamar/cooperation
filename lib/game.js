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
  console.log(game);
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
  constructor() {
    this.id = getId('p');
    const adjective = Player.ADJECTIVES[Math.floor(Math.random() * Player.ADJECTIVES.length)];
    const noun = Player.NOUNS[Math.floor(Math.random() * Player.NOUNS.length)];
    this.playerName = `${adjective} ${noun}`;
  }
}

export class Game {
  /**
   * @type {Player[]}
   */
  players = [];

  state = 'GATHERING_PLAYERS';

  constructor(components) {
    this.id = getId();
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
