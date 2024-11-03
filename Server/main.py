from socketio import ASGIApp

from TTT import sio, REST_ASGI_app

app = ASGIApp(sio, REST_ASGI_app)

