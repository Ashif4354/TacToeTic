from socketio import AsyncServer

from .namespaces.Game import Game

sio = AsyncServer(async_mode='asgi', cors_allowed_origins='*')

sio.register_namespace(Game('/game'))

__all__: list[str] = ['sio']