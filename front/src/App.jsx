import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import { renderUnicode } from 'uqr';

function App() {
  const [ws, setWs] = useState(null);
  const [channelList, setChannelList] = useState([]);
  const [connected, setConnected] = useState(false);
  const [channel, setChannel] = useState('');
  const [nickname, setNickname] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const qr = renderUnicode("exp://94.158.50.15:8081", {
    blackChar: '██',
    whiteChar: '  ',
  });
  const address = "chat-be.ins.cx";
  const messagesRef = useRef();

  const fetchUsers = () => {
    fetch(`https://${address}/${channel}/users`)
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
      });
  };

  const fetchChannels = useCallback(() => {
    fetch(`https://${address}/channels`)
      .then(res => res.json())
      .then(data => {
        setChannelList(data.channels || []);
      });
  }, []);

  useEffect(() => {
    fetchChannels();
    const interval = setInterval(fetchChannels, 5000);
    return () => clearInterval(interval);
  }, [fetchChannels]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const handleConnect = (e) => {
    e.preventDefault();
    setError('');
    const socket = new WebSocket(`wss://${address}/ws/${channel}/${nickname}`);

    socket.onopen = () => {
      setWs(socket);
    };

    socket.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (err) {
        console.warn('Invalid JSON received:', event.data);
        return;
      }
    
      if (data.type === 'error') {
        setError(data.message);
        socket.close();
        return;
      }
    
      if (!connected && data.type !== 'error') {
        console.log('Connected to WebSocket');
        setWs(socket);
        setConnected(true);
        fetchUsers();
      }
      data.timestamp = new Date(data.timestamp).toLocaleTimeString();
      setMessages(prev => [...prev, data]);
      fetchUsers();
    };    

    socket.onclose = () => {
      setConnected(false);
      setWs(null);
      setMessages([]);
      setUsers([]);
      setChannel('');
      fetchChannels();
    };
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!ws || message.trim() === '') return;

    const payload = {
      nickname,
      timestamp: new Date().toLocaleTimeString(),
      message,
      type: 'message'
    };

    ws.send(JSON.stringify(payload));
    setMessage('');
  };

  const handleDisconnect = () => {
    if (ws) {
      ws.close();
    }
  };

  return (
    <>
      <header>
        <h1>Insaneous Chat{connected && <span> | Channel: {channel}</span>}</h1>
      </header>
      <main>
        {!connected && (
          <>
            <div className="welcome">
              <form onSubmit={handleConnect}>
                <label>Channel name:</label>
                <input value={channel} onChange={e => setChannel(e.target.value)} required />
                <label>Nickname:</label>
                <input value={nickname} onChange={e => setNickname(e.target.value)} required />
                <button>Connect</button>
              </form>
              {error && <p className="alert">{error}</p>}
              {channelList.length > 0 && (
                <>
                  <h2 id="status">Open channels:</h2>
                  <ul className="channels">
                    {channelList.map((chan, i) => <li key={i} onClick={() => setChannel(chan)}>{chan}</li>)}
                  </ul>
                </>
              )}
            </div>
            <div className='qr'>
              <h2>Scan to open in Expo</h2>
              <p>{qr}</p>
            </div>
          </>
        )}

        {connected && (
          <>
            <div className="chat">
              <form onSubmit={handleSend}>
                <label>Message:</label>
                <input value={message} onChange={e => setMessage(e.target.value)} required />
                <div className="actions">
                  <button type='submit'>Send</button>
                  <button onClick={handleDisconnect}>Disconnect</button>
                </div>
              </form>
              <div className="messages" ref={messagesRef}>
                {messages.map((msg, i) =>
                  msg.type === 'system' ? (
                    <div key={i} className="system-message">
                      <p>{msg.message}</p>
                      <p>{msg.timestamp}</p>
                    </div>
                  ) : (
                    <div key={i} className={`message ${msg.nickname === nickname ? 'own' : ''}`}>
                      <div className="message-header">
                        <h3>{msg.nickname}</h3>
                        <p>{msg.timestamp}</p>
                      </div>
                      <p>{msg.message}</p>
                    </div>
                  )
                )}
              </div>
            </div>
            {users && (
              <div className="users">
                <h2>Users:</h2>
                <ul>
                  {users.map((user, i) => (
                    <li key={i}>{user}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}

export default App;
