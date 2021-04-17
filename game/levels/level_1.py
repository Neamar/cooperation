from game.levels.components import change, disable, duplicate, enable
from game.levels.players import all_players_except, random_player
from game.levels.utils import random_pin


def init(game, component):
    main_player = random_player(game)
    change(game, component, "visibility", all_players_except(game, main_player))
    change(game, "intro.t2", "visibility", [main_player])
    change(game, "intro.b1", "visibility", [main_player])


def initialize_lockbox(game, component, run_component_code):
    change(game, component, "data.solution", random_pin(len(game["players"]) - 1))
    main_player = random_player(game)
    change(game, component, "visibility", [main_player])

    for i, player in enumerate(all_players_except(game, main_player)):
        duplicated_component = duplicate(game, "intro.lockbox.part", "intro.lockbox.part.%s" % player)
        change(game, duplicated_component, "visibility", [player])
        n = "X" * (len(game["players"]) - 1)
        n = n[0:i] + component["data"]["solution"][i] + n[i + 1 :]
        change(game, duplicated_component, "data.value", n)
        enable(game, duplicated_component, run_component_code)


def validate_lockbox(game, component, run_component_code):
    if component["data"]["value"] == component["data"]["solution"]:
        disable(game, "intro.lockbox", run_component_code)
        for player in all_players_except(game, component["visibility"][0]):
            disable(game, "intro.lockbox.part.%s" % player, run_component_code)
        change(game, "intro.title", "data.content", "<h1>Keeping together is progress</h1>")


def start(game, component, run_component_code):
    disable(game, "intro.t1", run_component_code)
    disable(game, "intro.t2", run_component_code)
    disable(game, "intro.b1", run_component_code)
    enable(game, "intro.lockbox", run_component_code)


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
