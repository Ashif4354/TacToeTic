from socketio import AsyncNamespace
from ..Game.Room import Room  
from ..Game.Player import Player
    
class Game(AsyncNamespace):
    async def on_connect(self, sid, environ) -> None:
        print('Client connected')
        await self.emit('connected', {'success': True})
        
    async def on_disconnect(self, sid) -> None:
        print('Client disconnected')
        
    async def on_join_room(self, sid, data: dict) -> None:
        room_id: str = data['room_id']
        player: Player = Player(sid, data['name'])
        await self.enter_room(sid, room_id)
        
        if room := Room.rooms.get(room_id):
            if len(await room.players) < 2:
                await room.add_player(player)
                
                await self.emit('player_joined', 
                          {
                              'name': await player.name,
                          },
                          room=room_id,
                          skip_sid=sid,
                        )
                await self.emit('joined_room', {
                    'players': [await player_.name for player_ in await room.players if player_ != player],
                }, to=sid)
                
                if await room.is_full():
                    players: list[Player] = await room.players
                    await room.set_x_player(players[0])
                    await room.set_o_player(players[1])
                    
                    print(await players[0].sid)
                    await self.emit('game_start', 
                            {
                                'role': 'X'
                            },
                            to = await players[0].sid,                          
                        ) 
                             
                    print(await players[1].sid)
                    await self.emit('game_start',
                            {
                                'role': 'O'
                            },
                            to = await players[1].sid,
                            )         
                
            else:
                await self.emit('room_full', to=sid)
                return
        else:
            await self.emit('no_room', to=sid)
            return
        
    async def on_leave_room(self, sid, data: dict) -> None:            
        room_id: str = data['room_id']
        
        if room := Room.rooms.get(room_id):
            await self.leave_room(sid, data['room_id'])
            await room.remove_player(sid)
            await self.emit('opponent_left',
                          room=room_id,
                          skip_sid=sid,
                        )
    
        
    async def on_move(self, sid: str, data: dict) -> None:
        room_id: str = data['room_id']
        position: int = data['position']
        player: str = data['player']
        
        
        
        if room := Room.rooms.get(room_id):
            
            await self.emit('move_made', {'position': data['position']}, room=room_id, skip_sid=sid)
            await room.make_move(player, position)
            
            
    async def on_play_again(self, sid: str, data: dict) -> None:
        room_id: str = data['room_id']
        
        if room := Room.rooms.get(room_id):
            temp: Player = await room.x_player
            await room.set_x_player(await room.o_player)
            await room.set_o_player(temp)
            
            await self.emit('reset', room=room_id)
            await room.reset_game()
        

__all__: list[str] = ['Game']