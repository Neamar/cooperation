from random import randint

from django.db import models

from game.levels.components import change, disable, duplicate, enable
from game.levels.players import all_players_except, random_player
from game.levels.utils import random_pin
from game.utils import random_player_name


class ExecutableContext(models.Model):
    class Meta:
        abstract = True

    components = models.JSONField()
    players = models.JSONField(default=dict)

    @property
    def player_ids(self):
        return list(self.players.keys())

    def mark_dirty(self, component):
        """
        Keep track of all dirty components,
        they'll need to be synced over the wire
        (actually we care about players dirtiness, not components, but this is abstracted away for this function)
        """
        if not hasattr(self, "_dirty"):
            self._dirty = set()

        self._dirty.update(component["visibility"])

    def get_dirty_players(self):
        if not hasattr(self, "_dirty"):
            self._dirty = set()
        return self._dirty

    def get_target(self, target):
        if type(target) == dict:
            return target
        else:
            for component in self.components:
                if component["id"] == target:
                    return component
            else:
                raise Exception("Invalid target: %s" % target)

    def exec(self, component, action, player_id=None):
        if action not in component["behaviors"]:
            return
        functions = component["behaviors"][action]

        for function in functions:
            try:
                exec(
                    compile(function, "%s:%s" % (component["id"], action), "exec"),
                    {
                        # and all helper functions
                        "enable": enable,
                        "duplicate": duplicate,
                        "disable": disable,
                        "change": change,
                        "all_players_except": all_players_except,
                        "random_player": random_player,
                        "random_pin": random_pin,
                    },
                    {
                        # send the current context
                        "ctx": self,
                        "component": component,
                        "player_id": player_id,
                    },
                )
            except Exception as e:
                print(function)
                raise e


class Game(ExecutableContext):
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
    fields_to_sync = []

    def get_channel_name(self):
        return "game-%s" % self.game_id

    def __str__(self):
        return "%s" % self.game_id

    def add_player(self):
        player_id = "p%s" % randint(1, 2147483640)
        player = {"name": random_player_name(), "connected": 0}

        self.players[player_id] = player
        return player_id

    def ws_start_game(self, player_id, event):
        if self.status == Game.GATHERING_PLAYERS:
            self.status = Game.PLAYING

            # mark components as visible for players
            for component in self.components:
                if len(component["visibility"]) and component["visibility"][0] == "__all__":
                    component["visibility"] = self.player_ids

            # apply "add" effect for active components
            for component in self.components:
                if component["state"] == "active":
                    self.exec(component, "enable", player_id)

    def ws_component_click(self, player_id, event):
        component = self.get_target(event["component"])
        self.exec(component, "click", player_id)
        return ["components"]

    def ws_component_mouseover(self, player_id, event):
        component = self.get_target(event["component"])
        self.exec(component, "mouseover", player_id)
        return ["components"]

    def ws_component_mouseleave(self, player_id, event):
        component = self.get_target(event["component"])
        self.exec(component, "mouseleave", player_id)
        return ["components"]

    def ws_component_input(self, player_id, event):
        component = self.get_target(event["component"])
        value = event["value"]
        if value != component["data"]["value"]:
            change(self, component, "data.value", value)
            self.exec(component, "input", player_id)
        return ["components"]
