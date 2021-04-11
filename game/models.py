from django.db import models


class GameState(models.Model):
    game_id = models.IntegerField(unique=True)
    created_at = models.DateField(auto_now_add=True)
    game_state = models.JSONField()

    def __str__(self):
        print("%s") % self.game_id
