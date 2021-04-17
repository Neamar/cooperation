from django.urls import path

from . import views

urlpatterns = [
    path("", views.index),
    path("<int:game_id>/player/<str:player_id>", views.game, name="game"),
    path("<int:game_id>/join", views.game_join),
    path("<int:game_id>/multi", views.game_multi),
]
