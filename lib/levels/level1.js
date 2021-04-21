export default [
  {
    "id": "intro.title",
    "type": "text",
    "state": "active",
    "visibility": ["__all__"],
    "data": { "content": "<h1>Coming together is a beginning.</h1>" },
  },
  {
    "id": "intro.t1",
    "type": "text",
    "state": "active",
    "data": { "content": "<p>Wait for instructions.</p>" },
    "behaviors": {
      "enable": function (component) {
        const mainPlayer = randomPlayer();
        change(component, "visibility", allPlayersExcept(mainPlayer));
        change("intro.t2", "visibility", [mainPlayer]);
        change("intro.b1", "visibility", [mainPlayer]);
      }
    },
  },
  {
    "id": "intro.t2",
    "type": "text",
    "state": "active",
    "data": {
      "content": `
        <p>Welcome!<br>
This is a game of cooperation.< br > Please make sure that everyone can hear you, and that you can hear everyone, then press the button below.</p> `,
    },
  },
  {
    "id": "intro.b1",
    "type": "button",
    "state": "active",
    "data": { "content": "Let's go!" },
    "behaviors": {
      "click": function () {
        disable("intro.t1")
        disable("intro.t2")
        disable("intro.b1")
        enable("intro.lockbox")
      },
    },
  },
  {
    "id": "intro.lockbox",
    "type": "lockbox",
    "data": {
      "value": 0,
      "type": "number",
    },
    "behaviors": {
      "enable": function (component, playerId) {
        change(component, "internal_data.solution", randomPin(this.players.length - 1));
        const mainPlayer = randomPlayer();
        change(component, "visibility", [mainPlayer]);
        for (i, player in enumerate(allPlayersExcept(ctx, mainPlayer))) {
          const duplicatedComponent = duplicate("intro.lockbox.part", `intro.lockbox.part.${playerId}`)
          change(duplicatedComponent, "visibility", [playerId])
          const n = "X" * (this.players.length - 1)
          // n = n[0: i] + component["internal_data"]["solution"][i] + n[i + 1 :]
          change(duplicatedComponent, "data.value", n)
          enable(duplicatedComponent)
        }

      },
      "input": function (component, playerId) {
        if (component.data.value == component.internal_data.solution) {
          disable("intro.lockbox")
        }
        for (player in allPlayersExcept(component.visibility[0])) {
          disable(`intro.lockbox.part.${playerId}`)
        }
        change("intro.title", "data.content", "<h1>Keeping together is progress</h1>")
        enable("intro.t3")
      },
    },
  },
  {
    "id": "intro.lockbox.part",
    "type": "lockbox",
    "data": {
      "value": "",
      "disabled": true,
    },
  },
  {
    "id": "intro.t3",
    "type": "text",
    "visibility": ["__all__"],
    "data": {
      "content": "Sometimes, you'll need to work together. For instance, here, you need to hover every single button."
    },
    "behaviors": {
      "enable": function (component) {
        for (let i = 0; i < this.players.length; i++) {
          const duplicatedComponent = duplicate(ctx, "intro.simultaneous-buttons", `intro.simultaneous-buttons.${i}`)
          enable(duplicatedComponent)
        }
      }
    },
  },
  {
    "id": "intro.simultaneous-buttons",
    "type": "button",
    "visibility": ["__all__"],
    "data": { "content": "Hover me!", "owner": null },
    "behaviors": {
      "mouseover": function (component, playerId) {
        if (!component.data.owner) {
          change(component, "data.content", `Hovered by ${this.players[playerId].name}`);
          change(component, "data.owner", playerId);
        }
        const hasNoOwner = false;
        for (let i = 0; i < this.players.length) {
          data = get_target(`intro.simultaneous-buttons.${i}`).data;
          if (!data.owner) {
            hasNoOwner = true;
            break
          }
        }
        if (!hasNoOwner) {
          disable("intro.t3")
          for (let i = 0; i < this.players.length; i++) {
            disable(`intro.simultaneous-buttons.${i}`)
          }
        }
      },
      "mouseleave": function (component, player_id) {
        if (component.data.owner === player_id) { }
        change(component, "data.content", "Hover me!")
        change(component, "data.owner", undefined)
      }
    },
  },
]
