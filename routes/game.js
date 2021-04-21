import { Game, getGameOr404, Player } from '../lib/game.js';
export const create = async (ctx) => {
  const game = new Game();

  ctx.redirect(`/game/${game.id}/join`);
};

export const join = async (ctx) => {
  const game = getGameOr404(ctx.params.gameId);
  const player = new Player();
  game.players.push(player);
  ctx.redirect(`/game/${game.id}/player/${player.id}`);
};

export const index = async (ctx) => {
  const game = getGameOr404(ctx.params.gameId);

  console.log(JSON.stringify(game, null, 2));
  return ctx.render('game/index', { game: game });
};
