import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

from game.models import Game


class GameConsumer(WebsocketConsumer):
    def send_json(self, obj):
        self.send(text_data=json.dumps(obj))

    def connect(self):
        self.game_id = self.scope["url_route"]["kwargs"]["game_id"]
        self.player_id = self.scope["url_route"]["kwargs"]["player_id"]

        game = self.get_game()
        self.room_group_name = game.get_channel_name()

        # Join room group
        async_to_sync(self.channel_layer.group_add)(self.room_group_name, self.channel_name)

        self.accept()

        self.send_update({"status": game.status, "state": game.state})

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(self.room_group_name, self.channel_name)

    def get_game(self):
        return Game.objects.get(game_id=self.game_id)

    # Receive message from WebSocket
    def receive(self, text_data):
        """
        Forward socket message to model
        """
        data_json = json.loads(text_data)

        t = "ws_%s" % data_json["_type"]
        game = self.get_game()
        if hasattr(game, t):
            getattr(game, t)(data_json)
        else:
            raise Exception("Unknown type %s" % t)

        game.save()

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
        if "dirty_players" in event and self.player_id not in event["dirty_players"]:
            return  # player is not impacted by this change

        if "state" in event:
            game_state = event["state"]

            out["players"] = game_state["players"]
            out["components"] = [
                self.clean_component_for_sending(c)
                for c in game_state["components"]
                if c["state"] == "active" and self.player_id in c["visibility"]
            ]
        if "status" in event:
            out["status"] = event["status"]

        self.send_json(out)
