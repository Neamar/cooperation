from random import choice


def random_player(ctx):
    return choice(ctx.players)


def all_players_except(ctx, player):
    return [p for p in ctx.players if p != player]
