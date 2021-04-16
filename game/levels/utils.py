from random import randint


def random_pin(number_length):
    r = ""
    for i in range(0, number_length):
        r += str(randint(0, 9))
    return r
