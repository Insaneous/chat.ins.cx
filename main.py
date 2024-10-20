from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI()

class Channel:
  def __init__(self, name):
    self.name = name
    self.connections = []

  async def broadcast(self, message, sender):
    for connection in self.connections:
      await connection.send_text(message)

channels = {}

@app.websocket('/ws/{channel}/{nickname}')
async def websocket_endpoint(websocket:WebSocket, channel: str, nickname: str):
    try:
        await websocket.accept()
        if channel not in channels:
            channels[channel] = Channel(channel)

        channel_obj = channels[channel]
        channel_obj.connections.append(websocket)
        await channel_obj.broadcast(f'{nickname} joined the channel', websocket)

        while True:
            data = await websocket.receive_text()
            await channel_obj.broadcast(data, websocket)
    except WebSocketDisconnect:
        channel_obj = channels[channel]
        channel_obj.connections.remove(websocket)
        await channel_obj.broadcast(f'{nickname} left the channel', websocket)
        if len(channel_obj.connections) == 0:
            del channels[channel]