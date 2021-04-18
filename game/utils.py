from random import choice

# http://creativityforyou.com/combomaker.html
ADJECTIVES = [
    "abnormal",
    "bureaucratic",
    "chosen",
    "defensive",
    "elderly",
    "foolish",
    "giant",
    "hostile",
    "intense",
    "judicial",
    "kind",
    "lazy",
    "magical",
    "ninja",
]
NOUNS = [
    "artist",
    "biscuit",
    "brocoli",
    "cab",
    "coffee",
    "customer",
    "detector",
    "deputy",
    "emperor",
    "evil",
    "factory",
    "failure",
    "gentleman",
    "goalkeeper",
    "grandmother",
    "headmaster",
    "immigrant",
    "infant",
    "judge",
    "joke",
    "journalist",
    "kidney",
    "kilometer",
]


def random_player_name():
    return "%s %s" % (choice(ADJECTIVES), choice(NOUNS))
