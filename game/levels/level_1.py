from game.levels.components import add, remove, set, duplicate
from game.levels.utils import random_number
from game.levels.players import all_players_except, random_player


def init(c):
    main_player = random_player()
    set(c, "visibility", all_players_except(main_player))
    set("intro.t2", "visibility", [main_player])
    set("intro.b1", "visibility", [main_player])


def initialize_lockbox(c):
    for i, player in enumerate(all_players_except(c.visibility)):
        duplicate_component = duplicate("intro.lockbox.part")
        set(duplicate_component, "id", "intro.lockbox.part.%s" % player)
        set(duplicate_component, "visibility", [player])
        n = "X" * len(c.game.players)
        n[i] = c.data.solution[i]
        set(duplicate_component, "data.value", n)
        add(duplicate_component)


def validate_lockbox(c):
    if c.data.value == c.data.solution:
        remove("intro.lockbox*")
        set("intro.title", "data.content", "Keeping together is progress")


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
                "add": [init],
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
                "click": [
                    lambda c: remove("intro.t1"),
                    lambda c: remove("intro.t2"),
                    lambda c: remove("intro.b1"),
                    lambda c: add("intro.lockbox"),
                ],
            },
        },
        {
            "id": "intro.lockbox",
            "type": "lockbox",
            "data": {
                "value": 0,
                "solution": 0,
            },
            "behaviors": {
                "add": [
                    lambda c: set(c, "data.solution", random_number(c.game.players.length - 1)),
                    lambda c: set(c, "visibility", [random_player()]),
                    initialize_lockbox,
                ],
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
