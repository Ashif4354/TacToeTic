

class Player:
    def __init__(self, sid: str, name: str):
        self.__sid: str = sid
        self.__name: str = name
        
    @property
    async def sid(self) -> str:
        return self.__sid
    
    @property
    async def name(self) -> str:
        return self.__name
    


__all__: list[str] = ['Player']