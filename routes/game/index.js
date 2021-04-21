export default async (req, res) => {
  const gameId = req.params.gameId;
  const playerId = req.params.playerId;

  return res.view('views/game/index.html', { gameId: gameId, playerId: playerId });
};
