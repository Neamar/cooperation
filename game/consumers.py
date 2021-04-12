import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from game.models import GameState


class GameConsumer(WebsocketConsumer):
    def send_json(self, obj):
        self.send(text_data=json.dumps(obj))

    def connect(self):
        self.game_id = self.scope["url_route"]["kwargs"]["game_id"]
        self.player_id = self.scope["url_route"]["kwargs"]["player_id"]

        game_state = self.get_game_state()
        self.room_group_name = game_state.get_channel_name()

        # Join room group
        async_to_sync(self.channel_layer.group_add)(self.room_group_name, self.channel_name)

        self.accept()

        self.send_state({"game_state": game_state.get_state()})
        self.send_json({"status": game_state.status})

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(self.room_group_name, self.channel_name)

    def get_game_state(self):
        return GameState.objects.get(game_id=self.game_id)

    # Receive message from WebSocket
    def receive(self, text_data):
        data_json = json.loads(text_data)

        t = data_json["_type"]
        print(t)
        # if t == "request_refresh":
        #     latest_state = self.get_game_state()
        #     self.send_state(latest_state.get_state())
        # async_to_sync(self.channel_layer.group_send)(
        #     self.room_group_name, {"type": "chat_message", "message": message}
        # )

    def send_state(self, event):
        game_state = event["game_state"]

        out = {
            "players": game_state["players"],
            "components": [
                c for c in game_state["components"] if self.player_id in c["visibility"]
            ],
        }
        self.send_json(out)

    # # Receive message from room group
    # def chat_message(self, event):
    #     message = event["message"]

    #     # Send message to WebSocket
    #     self.send(text_data=json.dumps({"message": message}))
