import json

from django.db import models

from game.levels.components import add, duplicate, remove, set
from game.levels.players import all_players_except, random_player
from game.levels.utils import random_number


class Game(models.Model):
    GATHERING_PLAYERS = "GATH"
    PLAYING = "PLAY"
    DONE = "DONE"

    STATUS_CHOICES = [
        (GATHERING_PLAYERS, "Gathering players"),
        (PLAYING, "Playing"),
        (DONE, "Finished"),
    ]

    game_id = models.IntegerField(unique=True)
    created_at = models.DateField(auto_now_add=True)
    status = models.TextField(choices=STATUS_CHOICES, max_length=4, default=GATHERING_PLAYERS)
    state = models.JSONField()
    fields_to_sync = []

    def get_state(self):
        if isinstance(self.state, dict):
            return self.state
        else:
            return json.loads(self.state)

    def get_channel_name(self):
        return "game-%s" % self.game_id

    def __str__(self):
        return "%s" % self.game_id

    def run_component_code(self, component, state, action):
        if action not in component["behaviors"]:
            return
        functions = component["behaviors"][action]
        for function in functions:
            exec(
                function,
                {
                    "component": component,
                    "game": state,
                    "add": add,
                    "duplicate": duplicate,
                    "remove": remove,
                    "set": set,
                    "all_players_except": all_players_except,
                    "random_player": random_player,
                    "random_number": random_number,
                },
            )

    def start_game(self, event):
        if self.status == Game.GATHERING_PLAYERS:
            self.status = Game.PLAYING
            state = self.get_state()

            # mark components as visible for players
            for component in state["components"]:
                if len(component["visibility"]) and component["visibility"][0] == "__all__":
                    component["visibility"] = state["players"]

            # apply "add" effect for active components
            for component in state["components"]:
                if component["state"] == "active":
                    self.run_component_code(component, state, "add")

            print(state["components"])
            # save and broadcast
            self.save()
