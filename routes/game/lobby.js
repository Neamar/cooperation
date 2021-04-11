import { getGameState } from '../../lib/room.js';

export default async (req, res) => {
  const gameId = req.params.gameId;
  const gameState = await getGameState(gameId);

  if (gameState.state !== 'GATHERING_PLAYERS') {
    throw new Error('This game does not accept new players.');
  }

  res.render('game/lobby.html', { gameId: gameId });
};
