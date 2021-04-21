import { change, disable, duplicate, enable } from '../levels-functions/components.js';
import { allPlayersExcept, randomPlayer } from '../levels-functions/players.js';
import { randomPin } from '../levels-functions/utils.js';

export default [
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
      enable: function (component) {
        const mainPlayer = randomPlayer();
        change(component, 'visibility', allPlayersExcept(mainPlayer));
        change('intro.t2', 'visibility', [mainPlayer]);
        change('intro.b1', 'visibility', [mainPlayer]);
      },
    },
  },
  {
    id: 'intro.t2',
    type: 'text',
    state: 'active',
    data: {
      content: `
        <p>Welcome!<br>
This is a game of cooperation.< br > Please make sure that everyone can hear you, and that you can hear everyone, then press the button below.</p> `,
    },
  },
  {
    id: 'intro.b1',
    type: 'button',
    state: 'active',
    data: { content: "Let's go!" },
    behaviors: {
      click: function () {
        disable('intro.t1');
        disable('intro.t2');
        disable('intro.b1');
        enable('intro.lockbox');
      },
    },
  },
  {
    id: 'intro.lockbox',
    type: 'lockbox',
    data: {
      value: 0,
      type: 'number',
    },
    behaviors: {
      enable: function (component) {
        change(component, 'internalData.solution', randomPin(this.players.length - 1));
        const mainPlayer = randomPlayer();
        change(component, 'visibility', [mainPlayer]);
        const nonMainPlayers = allPlayersExcept(mainPlayer);
        for (let i = 0; i < nonMainPlayers.length; i++) {
          const pId = nonMainPlayers[i].id;
          const duplicatedComponent = duplicate('intro.lockbox.part', `intro.lockbox.part.${pId}`);
          change(duplicatedComponent, 'visibility', [pId]);
          const n = 'X'.repeat(i) + component.internalData.solution[i] + 'X'.repeat(nonMainPlayers.length - i - 1);
          change(duplicatedComponent, 'data.value', n);
          enable(duplicatedComponent);
        }
      },
      input: function (component) {
        if (component.data.value == component.internal_data.solution) {
          disable('intro.lockbox');
        }
        for (let player of allPlayersExcept(component.visibility[0])) {
          disable(`intro.lockbox.part.${player.id}`);
        }
        change('intro.title', 'data.content', '<h1>Keeping together is progress</h1>');
        enable('intro.t3');
      },
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
  {
    id: 'intro.t3',
    type: 'text',
    visibility: ['__all__'],
    data: {
      content: "Sometimes, you'll need to work together. For instance, here, you need to hover every single button.",
    },
    behaviors: {
      enable: function () {
        for (let i = 0; i < this.players.length; i++) {
          const duplicatedComponent = duplicate('intro.simultaneous-buttons', `intro.simultaneous-buttons.${i}`);
          enable(duplicatedComponent);
        }
      },
    },
  },
  {
    id: 'intro.simultaneous-buttons',
    type: 'button',
    visibility: ['__all__'],
    data: { content: 'Hover me!', owner: null },
    behaviors: {
      mouseover: function (component, playerId) {
        if (!component.data.owner) {
          change(component, 'data.content', `Hovered by ${this.players[playerId].name}`);
          change(component, 'data.owner', playerId);
        }
        let hasNoOwner = false;
        for (let i = 0; i < this.players.length; i++) {
          const data = this.get_target(`intro.simultaneous-buttons.${i}`).data;
          if (!data.owner) {
            hasNoOwner = true;
            break;
          }
        }
        if (!hasNoOwner) {
          disable('intro.t3');
          for (let i = 0; i < this.players.length; i++) {
            disable(`intro.simultaneous-buttons.${i}`);
          }
        }
      },
      mouseleave: function (component, player_id) {
        if (component.data.owner === player_id) {
          change(component, 'data.content', 'Hover me!');
          change(component, 'data.owner', undefined);
        }
      },
    },
  },
];
