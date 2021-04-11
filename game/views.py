from django.shortcuts import render

def index(request):
    return render(request, 'game/index.html')

def game(request, room_name):
    return render(request, 'game/game.html', {
        'room_name': room_name
    })
