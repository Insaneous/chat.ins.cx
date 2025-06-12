from fastapi import FastAPI, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
import json
from datetime import datetime
import asyncio

app = FastAPI()

origins = [
    'https://chat.ins.cx'
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
        self.users = {}

    async def broadcast(self, message_dict: dict, sender: WebSocket):
        message_json = json.dumps(message_dict)
        for user in self.users.values():
            if user.connection:
                await user.connection.send_text(message_json)

class User:
    def __init__(self, nickname: str, connection: WebSocket):
        self.nickname = nickname
        self.connection = connection

channels = {}

@app.get('/channels')
async def get_channels():
    return {'channels': list(channels.keys())}

@app.get('/{channel}/users')
async def get_channel_users(channel: str):
    if channel in channels:
        return {'users': list(channels[channel].users.keys())}
    return {'users': []}

@app.websocket('/ws/{channel}/{nickname}')
async def websocket_endpoint(websocket: WebSocket, channel: str, nickname: str):
    await websocket.accept()

    if channel not in channels:
        channels[channel] = Channel(channel)

    channel_obj = channels[channel]

    if nickname in channel_obj.users:
        await websocket.send_text(json.dumps({
            "nickname": "System",
            "timestamp": datetime.now().strftime("%H:%M:%S"),
            "message": f"The nickname '{nickname}' is already in use.",
            "type": "error"
        }))
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    channel_obj.users[nickname] = User(nickname, websocket)
    
    await asyncio.sleep(1)
    
    await channel_obj.broadcast({
        "nickname": "System",
        "timestamp": datetime.now().strftime("%H:%M:%S"),
        "message": f"{nickname} joined the channel",
        "type": "system"
    }, websocket)

    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                await channel_obj.broadcast(msg, websocket)
            except json.JSONDecodeError:
                print("Invalid JSON received, ignoring.")
    except WebSocketDisconnect:
        channel_obj.users.pop(nickname, None)

        await channel_obj.broadcast({
            "nickname": "System",
            "timestamp": datetime.now().strftime("%H:%M:%S"),
            "message": f"{nickname} left the channel",
            "type": "system"
        }, websocket)

        if not channel_obj.users:
            del channels[channel]
