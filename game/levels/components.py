import json


def enable(ctx, component):
    c = ctx.get_target(component)
    if c["state"] != "active":
        c["state"] = "active"
        ctx.exec(c, "enable")


def disable(ctx, component):
    c = ctx.get_target(component)
    if c["state"] != "inactive":
        c["state"] = "inactive"
        ctx.exec(c, "disable")


def duplicate(ctx, component, duplicate_id):
    c = json.loads(json.dumps(ctx.get_target(component)))
    c["id"] = duplicate_id
    ctx.components.append(c)
    return c


def change(ctx, target, path, value):
    subpaths = path.split(".")

    if subpaths[0] == "state":
        raise Exception("Don't change state with change(), use enable() or disable()")

    t = ctx.get_target(target)
    for subpath in subpaths[:-1]:
        t = t[subpath]
    t[subpaths[-1]] = value
