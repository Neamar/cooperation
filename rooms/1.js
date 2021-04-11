const level = {
  "players": ["p1", "p2", "p3"],
  "components": [
    {
      "id": "intro.setup",
      "type": "hidden",
      "behaviors": {
        "add": [
          () => add('intro.title'),
          () => add('intro.t1'),
          () => add('intro.t2'),
          () => add('intro.b1'),
          () => remove('intro.setup')
        ]
      }
    },
    {
      "id": "intro.title",
      "type": "text",
      "visibility": ["p1", "p2", "p3"],
      "data": {"content": "<h1>Coming together is a beginning.</h1>"}
    },
    {
      "id": "intro.t1",
      "type": "text",
      "visibility": ["p1", "p2"],
      "data": {"content": "<p>Wait for instructions.</p>"}
    },
    {
      "id": "intro.t2",
      "type": "text",
      "visibility": ["p3"],
      "data": {
        "content": "<p>Welcome!<br>This is a game of cooperation.<br>Please make sure that everyone can hear you, and that you can hear everyone, then press the button below.</p>"
      }
    },
    {
      "id": "intro.b1",
      "type": "button",
      "visibility": ["p3"],
      "data": {"content": "Let's go!"},
      "behaviors": {
        "click": [
          () => remove('intro.t1'),
          () => remove('intro.t2'),
          () => remove('intro.b1'),
          () => add('intro.lockbox')
        ]
      }
    },
    {
      "id": "intro.lockbox",
      "type": "lockbox",
      "data": {
        "value": 0,
        "solution": 0
      },
      "behaviors": {
        "add": [
          () => set(this, 'data.solution', randomNumber(players.length - 1)),
          () => set(this, 'visibility', [randomPlayer()]),
          () => {
            allPlayersExcept(this.visibility).forEach((p, i) => {
              let c = duplicate('intro.lockbox.part');
              set(c, 'id', `intro.lockbox.part.${p}`);
              set(c, 'visibility', [p]);
              let n = 'X'.repeat(players.length - 1);
              n[i] = this.data.result[i];
              set(c, 'data.value', n)
              add(c);
            });
          }
        ],
        "input": [
          () => {
            if(this.data.value === this.data.solution) {
              remove('intro.lockbox*');
              set('intro.title', 'data.content', 'Keeping together is progress');
            }
          }
        ]
      }
    },
    {
      "id": "intro.lockbox.part",
      "type": "lockbox",
      "data": {
        "value": "",
        "disabled": true
      }
    },
  ]
}
