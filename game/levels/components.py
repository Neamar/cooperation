import json


def enable(ctx, component):
    c = ctx.get_target(component)
    if c["state"] != "active":
        c["state"] = "active"
        ctx.mark_dirty(c)
        ctx.exec(c, "enable")


def disable(ctx, component):
    c = ctx.get_target(component)
    if c["state"] != "inactive":
        c["state"] = "inactive"
        ctx.mark_dirty(c)
        ctx.exec(c, "disable")


def duplicate(ctx, component, duplicate_id):
    c = json.loads(json.dumps(ctx.get_target(component)))
    c["id"] = duplicate_id
    ctx.mark_dirty(c)
    ctx.components.append(c)
    return c


def change(ctx, target, path, value):
    subpaths = path.split(".")

    if subpaths[0] == "state":
        raise Exception("Don't change state with change(), use enable() or disable()")

    c = ctx.get_target(target)
    ctx.mark_dirty(c)
    t = c
    for subpath in subpaths[:-1]:
        t = t[subpath]
    t[subpaths[-1]] = value

    if subpaths[0] == "visibility":
        ctx.mark_dirty(c)  # needs to be marked dirty again, in case we changed visibility for some players
