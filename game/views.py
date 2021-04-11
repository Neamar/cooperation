import inspect
import json
from random import randint

from django.db import transaction
from django.shortcuts import get_object_or_404, redirect, render
from game.levels.level_1 import LEVEL
from .models import GameState


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


def index(request):
    # Create a new game
    default_state = json.dumps(LEVEL, default=stringify_functions)

    game = GameState(game_id=randint(1, 2147483640), game_state=default_state)
    game.save()
    return redirect(game_lobby, game_id=game.game_id)


def game(request, game_id):
    return render(request, "game/game.html", {"game_id": game_id})


def game_lobby(request, game_id):
    get_object_or_404(GameState, game_id=game_id)

    return render(request, "game/lobby.html", {"game_id": game_id})


@transaction.atomic
def game_join(request, game_id):
    game_state = get_object_or_404(GameState, game_id=game_id)

    game_state
    return redirect(game_lobby, game_id=game.game_state)
