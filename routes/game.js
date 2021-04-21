import { Game, getGameOr404, getPlayerOr404, Player } from '../lib/game.js';
import levels from '../lib/levels/index.js';

export const create = async (ctx) => {
  const game = new Game(levels[0]);

  ctx.redirect(`/game/${game.id}/join`);
};

export const join = async (ctx) => {
  const game = getGameOr404(ctx.params.gameId);
  const player = new Player();
  game.addPlayer(player);
  ctx.redirect(`/game/${game.id}/player/${player.id}`);
};

export const index = async (ctx) => {
  const game = getGameOr404(ctx.params.gameId);
  const player = getPlayerOr404(game, ctx.params.playerId);
  return ctx.render('game/index', { game: game, player: player });
};
