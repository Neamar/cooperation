import { getState, writeState } from '../../lib/room.js';

export default async (req, res) => {
  // @todo deal with concurrency issues
  const game = await getState(req.params.gameId);
  const playerId = `p${Math.random().toString().replace('0.', '')}`;
  game.players.push(playerId);
  await writeState(req.params.gameId, game);
  res.redirect(`/game/${req.params.gameId}/player/${playerId}`);
};
