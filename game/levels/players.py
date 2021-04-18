from random import choice


def random_player(ctx):
    return choice(ctx.player_ids)


def all_players_except(ctx, player):
    return [p for p in ctx.player_ids if p != player]
