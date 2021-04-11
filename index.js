import fastify from 'fastify';
import pointOfView from 'point-of-view';
import nunjucks from 'nunjucks';
import fastifySocketIo from 'fastify-socket.io';
import index from './routes/index.js';
import newGame from './routes/new-game.js';
import gameIndex from './routes/game/index.js';
import gameJoin from './routes/game/join.js';
import gameStart from './routes/game/start.js';
import gameLobby from './routes/game/lobby.js';

const app = fastify({ logger: true });

// Set config
app.register(pointOfView, {
  engine: {
    nunjucks,
  },
});
app.register(fastifySocketIo, {});

// Router
app.get('/', index);
app.get('/new-game/:id', newGame);
app.get('/game/:gameId/lobby', gameLobby);
app.get('/game/:gameId/join', gameJoin);
app.get('/game/:gameId/start', gameStart);
app.get('/game/:gameId/player/:playerId', gameIndex);

const start = async (port) => {
  try {
    console.log(`listening on *:${port}`);
    await app.listen(port);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};
start(process.env.PORT || 3000);
