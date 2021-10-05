import levels from '../lib/levels/index.js';
import { Game, getGameOr404 } from '../lib/models/game.js';
import { getPlayerOr404, Player } from '../lib/models/player.js';

export const create = async (ctx) => {
  const game = new Game(levels[0]);
  if ('multi' in ctx.query) {
    ctx.redirect(`/game/${game.id}/multi`);
  } else {
    ctx.redirect(`/game/${game.id}/join`);
  }
};

export const join = async (ctx) => {
  const game = getGameOr404(ctx.params.gameId);
  const player = new Player(game);
  game.addPlayer(player);
  ctx.redirect(`/game/${game.id}/player/${player.id}`);
};

export const index = async (ctx) => {
  const game = getGameOr404(ctx.params.gameId);
  const player = getPlayerOr404(game, ctx.params.playerId);
  return ctx.render('game/index', { game: game, player: player });
};

export const multi = async (ctx) => {
  const game = getGameOr404(ctx.params.gameId);
  while (game.playerIds.length < 3) {
    const player = new Player(game);
    game.addPlayer(player);
  }
  return ctx.render('game/multi', { game: game });
};

const routeRegexp = /^\/ws\/game\/([0-9]+)\/player\/(p[0-9]+)$/;
export const wsIndex = async (ctx) => {
  try {
    const params = routeRegexp.exec(ctx.req.url);
    const gameId = params[1];
    const playerId = params[2];

    const game = getGameOr404(gameId);
    const player = getPlayerOr404(game, playerId);

    player.addWs(ctx.websocket);

    player.send();
    game.broadcast(['players']);

    ctx.websocket.send();
    ctx.websocket.on('message', function (stringMessage) {
      const message = JSON.parse(stringMessage);
      // do something with the message from client
      console.log(`Received ${message._type}`);

      // Check if game can handle this message type
      if (game[`ws${message._type}`]) {
        // Apply changes, retrieve list of what got updated
        const updated = game[`ws${message._type}`](message, playerId);
        game.broadcast(updated);
      } else {
        console.log('Unknown message:', message);
      }
    });
  } catch (e) {
    console.error(e);
  }
};
