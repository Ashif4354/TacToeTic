try:
    from dotenv import load_dotenv
    load_dotenv()
except:
    pass

from socketio import AsyncServer
from os import environ

from .namespaces.Game import Game

sio = AsyncServer(
    async_mode='asgi', 
    cors_allowed_origins=[
        'https://ttt-dg.netlify.app',
        'https://admin.socket.io'
    ],
    # cors_allowed_origins='*', # for development
)

sio.instrument(
    auth = {
        'username': environ['username'],
        'password': environ['password']
    },
    server_id="TacToeTic",
    server_stats_interval=30
)

@sio.on('test')
async def ashif(sid, data):
    return {
        'data': data,
        'sid': sid
    }

sio.register_namespace(Game('/game'))

__all__: list[str] = ['sio']