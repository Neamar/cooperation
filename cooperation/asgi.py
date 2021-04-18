"""
ASGI config for cooperation project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/asgi/
"""

import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "cooperation.settings")

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter

django.setup()

import game.routing

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": URLRouter(game.routing.websocket_urlpatterns),
    }
)
