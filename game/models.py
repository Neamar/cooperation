import json
from django.db import models


class GameState(models.Model):
    STATE_GATHERING_PLAYERS = "GATHERING_PLAYERS"
    STATE_PLAYING = "PLAYING"
    STATE_DONE = "DONE"

    game_id = models.IntegerField(unique=True)
    created_at = models.DateField(auto_now_add=True)
    state = models.JSONField()

    def get_state(self):
        if isinstance(self.state, dict):
            return self.state
        else:
            return json.loads(self.state)

    def get_channel_name(self):
        return "game-%s" % self.game_id

    def __str__(self):
        return "%s" % self.game_id
