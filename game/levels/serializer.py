import inspect
import json
import re


def stringify_functions(obj):
    if callable(obj):
        code = inspect.getsource(obj).strip()
        if code[-1] == ",":
            code = code[0:-1]
        if code.startswith("lambda c:"):
            code = code.replace("lambda c:", "").strip()
        else:
            code = code[code.index("\n") :].strip()
            code = re.sub(r"^    (.+)$", "\\1", code, flags=re.MULTILINE)
        return code

    raise TypeError("Can't serialize object of type %s", type(obj))


def serialize(components):
    # ensure every single component has the bare minimum
    for component in components:
        if "type" not in component:
            component["type"] = "text"
        if "state" not in component:
            component["state"] = {}
        if "visibility" not in component:
            component["visibility"] = []
        if "data" not in component:
            component["data"] = {}
        if "internal_data" not in component:
            component["internal_data"] = {}
        if "behaviors" not in component:
            component["behaviors"] = {}

    return json.loads(json.dumps(components, default=stringify_functions))
