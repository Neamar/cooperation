import inspect
import json
import dill
from level_1 import LEVEL


def stringify_functions(obj):
    if callable(obj):
        code = inspect.getsource(obj).strip()
        if code[-1] == ",":
            code = code[0:-1]
        if code.startswith("lambda c:"):
            code = code.replace("lambda c:", "")
            print(code)
        else:
            code = code[code.index("\n") + 1 :]
        return code

    raise TypeError("Can't serialize object of type %s", type(obj))


s = json.dumps(LEVEL, default=stringify_functions)

p = json.loads(s)
f = p["components"][1]["behaviors"]["add"][0]
print(f)
f = p["components"][3]["behaviors"]["click"][0]
print(f)
