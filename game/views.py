from random import randint

from django.db import transaction
from django.http import HttpResponseGone
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.clickjacking import xframe_options_exempt

from game.levels.level_1 import LEVEL
from game.levels.serializer import serialize

from .models import Game


def index(request):
    # Create a new game
    default_state = serialize(LEVEL)

    game = Game(game_id=randint(1, 2147483640), state=default_state)
    game.save()

    if "multi" in request.GET:
        return redirect(game_multi, game_id=game.game_id)
    else:
        return redirect(game_join, game_id=game.game_id)


@xframe_options_exempt
def game(request, game_id, player_id):
    get_object_or_404(Game, game_id=game_id)

    return render(request, "game/game.html", {"game_id": game_id, "player_id": player_id})


@transaction.atomic
def game_join(request, game_id):
    game = get_object_or_404(Game, game_id=game_id)

    if game.status != Game.GATHERING_PLAYERS:
        return HttpResponseGone("Can't join game anymore")

    player_id = game.add_player()
    game.save()

    return redirect("game", game_id=game.game_id, player_id=player_id)


def game_multi(request, game_id):
    game = get_object_or_404(Game, game_id=game_id)

    player_ids = []
    if len(game.players) > 0:
        player_ids = game.players
    else:
        for i in range(0, 3):
            player_ids.append(game.add_player())
        game.save()

    return render(request, "game/multi.html", {"game_id": game_id, "player_ids": player_ids})
