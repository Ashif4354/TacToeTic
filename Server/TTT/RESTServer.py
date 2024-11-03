from flask import Flask, Response, jsonify
from flask_cors import CORS
from asyncio import create_task
from asgiref.wsgi import WsgiToAsgi

from .Game.Room import Room
from .lib.remove_room_on_not_joined import remove_room_on_not_joined
from.SocketIOServer import sio

app = Flask(__name__)
CORS(app)

@app.before_request
async def before_request() -> None:
    pass
    
@app.route('/', methods=['GET'])
def index() -> Response:
    return jsonify({
        'success': True,
        'message': 'Tac Toe Tic Server Running'
    })


@app.route('/create_room', methods=['POST'])
async def create_room() -> Response:
    new_room: Room = Room(sio)
    new_room_id: str = await new_room.room_id
    
    Room.rooms[new_room_id] = new_room
    create_task(remove_room_on_not_joined(new_room_id))
    
    return jsonify({
        'success': True,
        'room_id': new_room_id
    })
    
    
    
ASGI_app = WsgiToAsgi(app)

__all__: list[str] = ['ASGI_app']

