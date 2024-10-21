from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    'https://chat.ins.cx',
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

class Channel:
  def __init__(self, name):
    self.name = name
    self.connections = []
    
  def __str__(self):
    return self.name

  async def broadcast(self, message, sender):
    for connection in self.connections:
      await connection.send_text(message)

channels = {}

@app.get('/')
async def get_channels():
    return {'channels': list(channels.keys())}

@app.websocket('/ws/{channel}/{nickname}')
async def websocket_endpoint(websocket:WebSocket, channel: str, nickname: str):
    try:
        await websocket.accept()
        if channel not in channels:
            channels[channel] = Channel(channel)
            
        channel_obj = channels[channel]
        channel_obj.connections.append(websocket)
        await channel_obj.broadcast(f"""
                                    <div class="alert">
                                        <p>{nickname} joined the channel</p>
                                    </div>
                                    """, websocket)

        while True:
            data = await websocket.receive_text()
            await channel_obj.broadcast(data, websocket)
    except WebSocketDisconnect:
        channel_obj = channels[channel]
        channel_obj.connections.remove(websocket)
        await channel_obj.broadcast(f"""
                                    <div class="alert">
                                        <p>{nickname} left the channel</p>
                                    </div>
                                    """, websocket)
        if len(channel_obj.connections) == 0:
            del channels[channel]
