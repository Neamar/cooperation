import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import fs from 'fs';

import index from './routes/index.js';
import newGame from './routes/new-game.js';
import gameIndex from './routes/game/index.js';
import gameJoin from './routes/game/join.js';
import gameStart from './routes/game/start.js';
import gameLobby from './routes/game/lobby.js';
import nunjuckEnvironment from './lib/nunjucks.js';

const app = express();
const httpServer = http.createServer(app);
var io = new Server(httpServer);

const rooms = {};

// Set config
nunjuckEnvironment(app);

// Router
app.get('/', index);
app.get('/new-game/:id', newGame);
app.get('/game/:gameId/lobby', gameLobby);
app.get('/game/:gameId/join', gameJoin);
app.get('/game/:gameId/start', gameStart);
app.get('/game/:gameId/player/:playerId', gameIndex);

app.get('/player', (req, res) => {
  res.sendFile(`${__dirname}/player.html`);
});

app.get('/host', (req, res) => {
  const content = fs
    .readFileSync(`${__dirname}/host.html`)
    .toString()
    .replace(/\$\{PLAYER_URL\}/g, `/player?game_id=${req.query.game_id}`);
  res.send(content);
});

app.use(express.static('public'));

io.on('connection', (socket) => {
  const gameId = socket.handshake.query.game_id;
  const isHost = socket.handshake.query.host;
  console.log(`a ${isHost ? 'host' : 'player'} connected on game #${gameId}`);

  if (!rooms[gameId]) {
    console.log('Creating a new game', gameId);
    rooms[gameId] = {
      host: null,
      players: [],
      startedAt: Date.now(),
      lastKnownState: '{}',
    };
  }

  if (isHost && !rooms[gameId].host) {
    rooms[gameId].host = socket;

    socket.on('update_state', function (newState) {
      console.log('Received a new state, broadcasting');
      rooms[gameId].lastKnownState = newState;
      rooms[gameId].players.forEach((p) => p.emit('state_change', newState));
    });

    socket.emit('user_count', rooms[gameId].players.length);
  } else {
    rooms[gameId].players.push(socket);

    if (rooms[gameId].host) {
      rooms[gameId].host.emit('user_count', rooms[gameId].players.length);
    }

    socket.emit('state_change', rooms[gameId].lastKnownState);
  }

  socket.on('disconnect', () => {
    console.log('user disconnected from game', gameId);
    const index = rooms[gameId].players.indexOf(socket);
    if (index > -1) {
      rooms[gameId].players.splice(index, 1);
    }
    if (rooms[gameId].host === socket) {
      rooms[gameId].host = null;
    }

    if (rooms[gameId].players.length === 0 && !rooms[gameId].host) {
      console.log('Terminating gameId', gameId);
      delete rooms[gameId];
    }

    if (rooms[gameId] && rooms[gameId].host) {
      rooms[gameId].host.emit('user_count', rooms[gameId].players.length);
    }
  });
});

const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
  console.log(`listening on *:${port}`);
});