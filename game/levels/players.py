from random import choice


def random_player(game):
    return choice(game["players"])


def all_players_except(game, player):
    return [p for p in game["players"] if p != player]
