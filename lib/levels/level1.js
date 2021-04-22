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
        const mainPlayer = this.randomPlayer();
        this.change(component, 'visibility', this.allPlayersExcept(mainPlayer));
        this.change('intro.t2', 'visibility', [mainPlayer]);
        this.change('intro.b1', 'visibility', [mainPlayer]);
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
This is a game of cooperation.<br> Please make sure that everyone can hear you, and that you can hear everyone, then press the button below.</p> `,
    },
  },
  {
    id: 'intro.b1',
    type: 'button',
    state: 'active',
    data: { content: "Let's go!" },
    behaviors: {
      click: function () {
        this.disable('intro.t1');
        this.disable('intro.t2');
        this.disable('intro.b1');
        this.enable('intro.lockbox');
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
        this.change(component, 'internalData.solution', this.randomPin(this.playerIds.length - 1));
        const mainPlayer = this.randomPlayer();
        this.change(component, 'visibility', [mainPlayer]);
        const nonMainPlayers = this.allPlayersExcept(mainPlayer);
        for (let i = 0; i < nonMainPlayers.length; i++) {
          const pId = nonMainPlayers[i];
          const duplicatedComponent = this.duplicate('intro.lockbox.part', `intro.lockbox.part.${pId}`);
          this.change(duplicatedComponent, 'visibility', [pId]);
          const n = 'X'.repeat(i) + component.internalData.solution[i] + 'X'.repeat(nonMainPlayers.length - i - 1);
          this.change(duplicatedComponent, 'data.value', n);
          this.enable(duplicatedComponent);
        }
      },
      input: function (component) {
        if (component.data.value === component.internalData.solution) {
          this.disable('intro.lockbox');
          for (let playerId of this.allPlayersExcept(component.visibility[0])) {
            this.disable(`intro.lockbox.part.${playerId}`);
          }
          this.change('intro.title', 'data.content', '<h1>Keeping together is progress</h1>');
          this.enable('intro.t3');
        }
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
        for (let i = 0; i < this.playerIds.length; i++) {
          const duplicatedComponent = this.duplicate('intro.simultaneous-buttons', `intro.simultaneous-buttons.${i}`);
          this.enable(duplicatedComponent);
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
          this.change(component, 'data.content', `Hovered by ${this.players[playerId].name}`);
          this.change(component, 'data.owner', playerId);
        }
        let hasNoOwner = false;
        for (let i = 0; i < this.playerIds.length; i++) {
          const data = this.getTarget(`intro.simultaneous-buttons.${i}`).data;
          if (!data.owner) {
            hasNoOwner = true;
            break;
          }
        }
        if (!hasNoOwner) {
          this.disable('intro.t3');
          for (let i = 0; i < this.playerIds.length; i++) {
            this.disable(`intro.simultaneous-buttons.${i}`);
          }
        }
      },
      mouseleave: function (component, playerId) {
        if (component.data.owner === playerId) {
          this.change(component, 'data.content', 'Hover me!');
          this.change(component, 'data.owner', undefined);
        }
      },
    },
  },
];
