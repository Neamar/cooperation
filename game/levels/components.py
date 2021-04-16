import json


def get_target(game, target):
    if type(target) == dict:
        return target
    else:
        for component in game["components"]:
            if component["id"] == target:
                return component
        else:
            raise Exception("Invalid target: %s" % target)


def enable(game, component, run_component_code):
    c = get_target(game, component)
    if c["state"] != "active":
        c["state"] = "active"
        run_component_code(c, game, "enable")


def disable(game, component, run_component_code):
    c = get_target(game, component)
    if c["state"] != "inactive":
        c["state"] = "inactive"
        run_component_code(c, game, "disable")


def duplicate(game, component, duplicate_id):
    c = json.loads(json.dumps(get_target(game, component)))
    c["id"] = duplicate_id
    game["components"].append(c)
    return c


def change(game, target, path, value):
    subpaths = path.split(".")
    t = get_target(game, target)
    for subpath in subpaths[:-1]:
        t = t[subpath]
    t[subpaths[-1]] = value
