export default [
  {
    id: 'main.title',
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
        this.change('intro.start', 'visibility', [mainPlayer]);
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
    id: 'intro.start',
    type: 'button',
    state: 'active',
    data: { content: "Let's go!" },
    behaviors: {
      click: function () {
        this.disable('intro.t1');
        this.disable('intro.t2');
        this.disable('intro.start');
        this.enable('lockbox.main');
      },
    },
  },
  {
    id: 'lockbox.main',
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
          const duplicatedComponent = this.duplicate('lockbox.part', `lockbox.part.${pId}`);
          this.change(duplicatedComponent, 'visibility', [pId]);
          const n = 'X'.repeat(i) + component.internalData.solution[i] + 'X'.repeat(nonMainPlayers.length - i - 1);
          this.change(duplicatedComponent, 'data.value', n);
          this.enable(duplicatedComponent);
        }
      },
      input: function (component) {
        if (component.data.value === component.internalData.solution) {
          this.disable('lockbox.main');
          for (let playerId of this.allPlayersExcept(component.visibility[0])) {
            this.disable(`lockbox.part.${playerId}`);
          }
          this.change('main.title', 'data.content', '<h1>Keeping together is progress</h1>');
          this.enable('hover-buttons.main');
        }
      },
    },
  },
  {
    id: 'lockbox.part',
    type: 'lockbox',
    data: {
      value: '',
      disabled: true,
    },
  },
  {
    id: 'hover-buttons.main',
    type: 'text',
    visibility: ['__all__'],
    data: {
      content: "Sometimes, you'll need to work together. For instance, here, you need to hover every single button.",
    },
    behaviors: {
      enable: function () {
        for (let i = 0; i < this.playerIds.length; i++) {
          const duplicatedComponent = this.duplicate('hover-buttons.part', `hover-buttons.part.${i}`);
          this.enable(duplicatedComponent);
        }
      },
    },
  },
  {
    id: 'hover-buttons.part',
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
          const data = this.getTarget(`hover-buttons.part.${i}`).data;
          if (!data.owner) {
            hasNoOwner = true;
            break;
          }
        }
        if (!hasNoOwner) {
          this.disable('hover-buttons.intro');
          for (let i = 0; i < this.playerIds.length; i++) {
            this.disable(`hover-buttons.part.${i}`);
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
