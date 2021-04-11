from django.urls import path

from . import views

urlpatterns = [
    path("", views.index),
    path("<int:game_id>/player/<str:player_id>", views.game),
    path("<int:game_id>/lobby", views.game_lobby),
    path("<int:game_id>/join", views.game_join),
]
