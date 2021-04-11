from django.shortcuts import render, redirect
from .models import GameState


def index(request):
    # Create a new game
    return render(request, "game/index.html")


def game(request, room_name):
    return render(request, "game/game.html", {"room_name": room_name})
