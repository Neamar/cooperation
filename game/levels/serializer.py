import inspect
import json
from game.models import GameState


def stringify_functions(obj):
    if callable(obj):
        code = inspect.getsource(obj).strip()
        if code[-1] == ",":
            code = code[0:-1]
        if code.startswith("lambda c:"):
            code = code.replace("lambda c:", "")
        else:
            code = code[code.index("\n") + 1 :]
        return code

    raise TypeError("Can't serialize object of type %s", type(obj))


def serialize(level):
    # ensure every single component has the bare minimum
    for component in level["components"]:
        if "type" not in component:
            component["type"] = "text"
        if "state" not in component:
            component["state"] = {}
        if "visibility" not in component:
            component["visibility"] = []
        if "data" not in component:
            component["data"] = {}
        if "behaviors" not in component:
            component["behaviors"] = {}
    level["players"] = []
    level["state"] = GameState.STATE_GATHERING_PLAYERS

    return json.dumps(level, default=stringify_functions)
