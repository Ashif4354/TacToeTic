from asyncio import sleep

from ..Game.Room import Room

async def remove_room_on_not_joined(room_id: str) -> None:
    await sleep(60)
    
    room: Room = Room.rooms[room_id]
    
    if not await room.x_player or not await room.o_player:
        del Room.rooms[room_id]
        
    

__all__: list[str] = ['remove_room_on_not_joined']