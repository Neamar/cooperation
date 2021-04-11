from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(
        r"ws/game/(?P<game_id>\d+)/player/(?P<player_id>p\d+)$", consumers.GameConsumer.as_asgi()
    ),
]
