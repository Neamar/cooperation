import json
from random import randint

from django.db import transaction
from django.shortcuts import get_object_or_404, redirect, render

from game.levels.level_1 import LEVEL
from game.levels.serializer import serialize

from .models import GameState


def index(request):
    # Create a new game
    default_state = serialize(LEVEL)

    game = GameState(game_id=randint(1, 2147483640), state=default_state)
    game.save()
    return redirect(game_lobby, game_id=game.game_id)


def game(request, game_id, player_id):
    return render(request, "game/game.html", {"game_id": game_id})


def game_lobby(request, game_id):
    get_object_or_404(GameState, game_id=game_id)

    return render(request, "game/lobby.html", {"game_id": game_id})


@transaction.atomic
def game_join(request, game_id):
    game_state = get_object_or_404(GameState, game_id=game_id)

    player_id = "p%s" % randint(1, 2147483640)

    state = json.loads(game_state.state)
    state["players"].append(player_id)
    game_state.state = json.dumps(state)
    game_state.save()

    return redirect(game, game_id=game_state.game_id, player_id=player_id)
