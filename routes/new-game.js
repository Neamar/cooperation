import { writeState } from '../lib/room.js';
import levels from '../rooms/index.js';

export default async (req, res) => {
  const id = parseInt(req.params.id);
  if (id === 0 || !(id in levels)) {
    res.status(404).send('Invalid level id');
  }

  const startingState = JSON.parse(levels[id]);
  const gameId = Math.random().toString().replace('0.', '');

  await writeState(gameId, startingState);
  res.redirect(`/game/${gameId}/lobby`);
};
