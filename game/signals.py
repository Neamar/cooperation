from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Game


@receiver(post_save, sender=Game)
def site_created(sender, instance, created, update_fields, **kwargs):
    """
    Notify any player currently on the game
    """
    if update_fields is None:
        update_fields = ["status", "state"]

    payload = {}
    for field in update_fields:
        if field == "state":
            payload[field] = instance.get_state()
        else:
            payload[field] = getattr(instance, field)

    print("Sending payload", payload)
    layer = get_channel_layer()
    async_to_sync(layer.group_send)(
        instance.get_channel_name(),
        {"type": "send_update", **payload},
    )
