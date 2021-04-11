import { add, remove, set, duplicate } from './components.js';
import { randomNumber } from './utils.js';
import { allPlayersExcept, randomPlayer } from './players.js';

export default {
  components: [
    {
      id: 'intro.title',
      type: 'text',
      state: 'active',
      visibility: ['__all__'],
      data: { content: '<h1>Coming together is a beginning.</h1>' },
    },
    {
      id: 'intro.t1',
      type: 'text',
      state: 'active',
      data: { content: '<p>Wait for instructions.</p>' },
      behaviors: {
        add: [
          () => {
            const mainPlayer = randomPlayer();
            set(this, 'visibility', allPlayersExcept(mainPlayer));
            set('intro.t2', 'visibility', [mainPlayer]);
            set('intro.b1', 'visibility', [mainPlayer]);
          },
        ],
      },
    },
    {
      id: 'intro.t2',
      type: 'text',
      state: 'active',
      data: {
        content:
          '<p>Welcome!<br>This is a game of cooperation.<br>Please make sure that everyone can hear you, and that you can hear everyone, then press the button below.</p>',
      },
    },
    {
      id: 'intro.b1',
      type: 'button',
      state: 'active',
      data: { content: "Let's go!" },
      behaviors: {
        click: [() => remove('intro.t1'), () => remove('intro.t2'), () => remove('intro.b1'), () => add('intro.lockbox')],
      },
    },
    {
      id: 'intro.lockbox',
      type: 'lockbox',
      data: {
        value: 0,
        solution: 0,
      },
      behaviors: {
        add: [
          () => set(this, 'data.solution', randomNumber(this.game.players.length - 1)),
          () => set(this, 'visibility', [randomPlayer()]),
          () => {
            allPlayersExcept(this.visibility).forEach((p, i) => {
              let c = duplicate('intro.lockbox.part');
              set(c, 'id', `intro.lockbox.part.${p}`);
              set(c, 'visibility', [p]);
              const n = 'X'.repeat(i) + this.data.result[i] + 'X'.repeat(this.game.players.length - 1 - i);
              set(c, 'data.value', n);
              add(c);
            });
          },
        ],
        input: [
          () => {
            if (this.data.value === this.data.solution) {
              remove('intro.lockbox*');
              set('intro.title', 'data.content', 'Keeping together is progress');
            }
          },
        ],
      },
    },
    {
      id: 'intro.lockbox.part',
      type: 'lockbox',
      data: {
        value: '',
        disabled: true,
      },
    },
  ],
};
