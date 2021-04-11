from django.shortcuts import render, redirect, get_object_or_404
from .models import GameState
from random import randint


def index(request):
    # Create a new game
    default_state = {}
    game = GameState(game_id=randint(1, 2147483640), game_state=default_state)
    game.save()
    return redirect(game_lobby, game_id=game.hash)


def game(request, game_id):
    return render(request, "game/game.html", {"game_id": game_id})


def game_lobby(request, game_id):
    return render(request, "game/lobby.html", {"game_id": game_id})


def game_join(request, game_id):
    get_object_or_404(GameState, hash=game_id)

    return redirect(game_lobby, game_id=game.hash)
