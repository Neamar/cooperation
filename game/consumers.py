import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from django.db import transaction

from game.models import Game


class GameConsumer(WebsocketConsumer):
    def send_json(self, obj):
        self.send(text_data=json.dumps(obj))

    @transaction.atomic
    def connect(self):
        self.game_id = self.scope["url_route"]["kwargs"]["game_id"]
        self.player_id = self.scope["url_route"]["kwargs"]["player_id"]

        game = self.get_game()
        self.room_group_name = game.get_channel_name()

        # Join room group
        async_to_sync(self.channel_layer.group_add)(self.room_group_name, self.channel_name)

        self.accept()

        self.send_update({"status": game.status, "components": game.components, "players": game.players})

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(self.room_group_name, self.channel_name)

    def get_game(self):
        """
        Retrieve the game, **selecting it for update**
        This locks the game until the current transaction finishes,
        to avoid concurrent updates
        """
        return Game.objects.select_for_update().get(game_id=self.game_id)

    # Receive message from WebSocket
    @transaction.atomic
    def receive(self, text_data):
        """
        Forward socket message to model
        """
        data_json = json.loads(text_data)

        t = "ws_%s" % data_json["_type"]
        game = self.get_game()
        if hasattr(game, t):
            update_fields = getattr(game, t)(data_json)
        else:
            raise Exception("Unknown type %s" % t)

        game.save(update_fields=update_fields)

    def clean_component_for_sending(self, component):
        """
        Hide some attributes from the players
        """
        component_to_send = component.copy()
        component_to_send.pop("visibility")
        component_to_send.pop("state")
        component_to_send.pop("internal_data")
        behaviors = component_to_send.pop("behaviors")
        component_to_send["behaviors"] = list(behaviors.keys())
        return component_to_send

    def send_update(self, event):
        """
        Send an update to the connected socket (if relevant)
        """
        out = {}

        if "components" in event:
            if "dirty_players" not in event or self.player_id in event["dirty_players"]:
                # only build if player is dirty (or no dirty players specified)
                components = event["components"]
                out["components"] = [
                    self.clean_component_for_sending(c)
                    for c in components
                    if c["state"] == "active" and self.player_id in c["visibility"]
                ]
        if "players" in event:
            out["players"] = event["players"]
        if "status" in event:
            out["status"] = event["status"]

        if len(out.keys()) == 0:
            # skip sending empty updates
            return
        self.send_json(out)
