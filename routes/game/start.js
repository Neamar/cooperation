import { getState, writeState } from '../../lib/room.js';

export default async (req, res) => {
  res.render('game/lobby', { title: 'Hey', message: 'Hello there!' });
};
