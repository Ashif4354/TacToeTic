from random import choices
from string import ascii_uppercase

from socketio import AsyncServer

from .Player import Player

class Room():
    
    rooms: dict[str, 'Room'] = {}
    
    def __init__(self, sio) -> None:
        self.sio: AsyncServer = sio
        self.__room_id: str = ''.join(choices(ascii_uppercase, k=6))
        self.__players: list[Player] = []
        self.__x_player: Player | None = None
        self.__o_player: Player | None = None
        
        self.__board: list[str] = ['' for _ in range(9)]
        
        self.__x_score: int = 0
        self.__o_score: int = 0
      
    @property
    async def room_id(self) -> str:
        return self.__room_id   
    
    @property
    async def players(self) -> list[Player]:
        return self.__players
     
    @property
    async def x_player(self) -> Player:
        return self.__x_player # type: ignore
    
    @property
    async def o_player(self) -> Player:
        return self.__o_player # type: ignore
    
    @property
    async def board(self) -> list[str]:
        return self.__board
    
    async def set_x_player(self, player: Player) -> None:
        self.__x_player = player
    
    async def set_o_player(self, player: Player) -> None:
        self.__o_player = player  
        
    async def add_player(self, player: Player) -> None:
        self.__players.append(player)  
        
    async def remove_player(self, sid: str) -> None:
        for player in self.__players:
            if await player.sid == sid:
                self.__players.remove(player)
                break
        
    async def is_full(self) -> bool:
        return len(self.__players) == 2    
        
    async def make_move(self, player: str, position: int) -> None:
        self.__board[position] = player
        if winner := await self.check_winner():
            if winner == self.__x_player:
                self.__x_score += 1
            else:
                self.__o_score += 1
                
            await self.sio.emit('game_over', 
                                {
                                    'winner': winner,
                                }, 
                                room=self.__room_id, 
                                namespace='/game')
        
    async def check_winner(self) -> str:
        for i in range(0, 9, 3):
            if self.__board[i] == self.__board[i + 1] == self.__board[i + 2]:
                return self.__board[i]
        for i in range(3):
            if self.__board[i] == self.__board[i + 3] == self.__board[i + 6]:
                return self.__board[i]
        if self.__board[0] == self.__board[4] == self.__board[8]:
            return self.__board[0]
        if self.__board[2] == self.__board[4] == self.__board[6]:
            return self.__board[2]
        return ''
    
    
    async def reset_game(self) -> None:
        self.__board = ['' for _ in range(9)]
        
        
        
__all__: list[str] = ['Room']