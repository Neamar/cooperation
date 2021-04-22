import Router from '@koa/router';
import Koa from 'koa';
import nunjucks from 'koa-nunjucks-async';
import websockify from 'koa-websocket';
import { create, index as gameIndex, join, multi, wsIndex as wsGameIndex } from './routes/game.js';
import { index } from './routes/index.js';
const app = websockify(new Koa());
const router = new Router();

const nunjucksOptions = {
  opts: {
    noCache: true,
    throwOnUndefined: false,
  },
  filters: {},
  globals: { title: 'Cooperation' },
  ext: '.html',
};

app.use(nunjucks('views', nunjucksOptions));
// Router
router.get('/', index);
router.get('/game/', create);
router.get('/game/:gameId/join', join);
router.get('/game/:gameId/multi', multi);
router.get('/game/:gameId/player/:playerId', gameIndex);

app.use(router.routes()).use(router.allowedMethods());

app.ws.use((ctx) => {
  try {
    wsGameIndex(ctx);
  } catch (e) {
    console.error('WS ERROR', e);
  }
});

const port = process.env.PORT || 3000;
app.listen(port);
console.log(`listening on *:${port}`);
