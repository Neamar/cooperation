def get_target(game, target):
    if type(target) == dict:
        return target
    else:
        for component in game["components"]:
            if component["id"] == target:
                return component
        else:
            raise Exception("Invalid target: %s" % target)


def add(component):
    pass


def remove(component):
    pass


def duplicate(component):
    pass


def set(game, target, path, value):
    subpaths = path.split(".")
    t = get_target(game, target)
    for subpath in subpaths[:-1]:
        t = t[subpath]
    t[subpaths[-1]] = value
