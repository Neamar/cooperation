import json
from random import randint

from django.db import models

from game.levels.components import change, disable, duplicate, enable, get_target
from game.levels.players import all_players_except, random_player
from game.levels.utils import random_pin


def run_component_code(component, state, action):
    if action not in component["behaviors"]:
        return
    functions = component["behaviors"][action]

    print("Running action:", component["id"], action)
    for function in functions:
        try:
            exec(
                function,
                {
                    "run_component_code": run_component_code,
                    "component": component,
                    "game": state,
                    "enable": enable,
                    "duplicate": duplicate,
                    "disable": disable,
                    "change": change,
                    "all_players_except": all_players_except,
                    "random_player": random_player,
                    "random_pin": random_pin,
                },
            )
        except Exception as e:
            print(function)
            raise e


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
        if not isinstance(self.state, dict):
            self.state = json.loads(self.state)
        return self.state

    def get_channel_name(self):
        return "game-%s" % self.game_id

    def __str__(self):
        return "%s" % self.game_id

    def add_player(self):
        player_id = "p%s" % randint(1, 2147483640)

        state = self.get_state()
        state["players"].append(player_id)
        return player_id

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
                    run_component_code(component, state, "enable")

    def component_click(self, event):
        component = get_target(self.get_state(), event["component"])
        run_component_code(component, self.get_state(), "click")

    def component_input(self, event):
        component = get_target(self.get_state(), event["component"])
        value = event["value"]
        if value != component["data"]["value"]:
            component["data"]["value"] = value
            run_component_code(component, self.get_state(), "input")
