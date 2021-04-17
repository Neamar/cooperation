from game.levels.components import change, disable, duplicate, enable
from game.levels.players import all_players_except, random_player
from game.levels.utils import random_pin


def init(ctx, component):
    main_player = random_player(ctx)
    change(ctx, component, "visibility", all_players_except(ctx, main_player))
    change(ctx, "intro.t2", "visibility", [main_player])
    change(ctx, "intro.b1", "visibility", [main_player])


def initialize_lockbox(ctx, component):
    change(ctx, component, "data.solution", random_pin(len(ctx.players) - 1))
    main_player = random_player(ctx)
    change(ctx, component, "visibility", [main_player])

    for i, player in enumerate(all_players_except(ctx, main_player)):
        duplicated_component = duplicate(ctx, "intro.lockbox.part", "intro.lockbox.part.%s" % player)
        change(ctx, duplicated_component, "visibility", [player])
        n = "X" * (len(ctx.players) - 1)
        n = n[0:i] + component["data"]["solution"][i] + n[i + 1 :]
        change(ctx, duplicated_component, "data.value", n)
        enable(ctx, duplicated_component)


def validate_lockbox(ctx, component):
    if component["data"]["value"] == component["data"]["solution"]:
        disable(ctx, "intro.lockbox")
        for player in all_players_except(ctx, component["visibility"][0]):
            disable(ctx, "intro.lockbox.part.%s" % player)
        change(ctx, "intro.title", "data.content", "<h1>Keeping together is progress</h1>")


def start(ctx):
    disable(ctx, "intro.t1")
    disable(ctx, "intro.t2")
    disable(ctx, "intro.b1")
    enable(ctx, "intro.lockbox")


LEVEL = {
    "components": [
        {
            "id": "intro.title",
            "type": "text",
            "state": "active",
            "visibility": ["__all__"],
            "data": {"content": "<h1>Coming together is a beginning.</h1>"},
        },
        {
            "id": "intro.t1",
            "type": "text",
            "state": "active",
            "data": {"content": "<p>Wait for instructions.</p>"},
            "behaviors": {
                "enable": [init],
            },
        },
        {
            "id": "intro.t2",
            "type": "text",
            "state": "active",
            "data": {
                "content": """
<p>Welcome!<br>
This is a game of cooperation.<br>Please make sure that everyone can hear you, and that you can hear everyone, then press the button below.</p>""",
            },
        },
        {
            "id": "intro.b1",
            "type": "button",
            "state": "active",
            "data": {"content": "Let's go!"},
            "behaviors": {
                "click": [start],
            },
        },
        {
            "id": "intro.lockbox",
            "type": "lockbox",
            "data": {
                "value": 0,
                "type": "number",
                "solution": 0,
            },
            "behaviors": {
                "enable": [initialize_lockbox],
                "input": [validate_lockbox],
            },
        },
        {
            "id": "intro.lockbox.part",
            "type": "lockbox",
            "data": {
                "value": "",
                "disabled": True,
            },
        },
    ],
}
