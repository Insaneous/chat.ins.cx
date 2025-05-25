import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

function App() {
  const [ws, setWs] = useState(null);
  const [channelList, setChannelList] = useState([]);
  const [connected, setConnected] = useState(false);
  const [channel, setChannel] = useState('');
  const [nickname, setNickname] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

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
  });

  useEffect(() => {
    fetchChannels();
    const interval = setInterval(fetchChannels, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const handleConnect = (e) => {
    e.preventDefault();
    const socket = new WebSocket(`wss://${address}/ws/${channel}/${nickname}`);

    socket.onopen = () => {
      setWs(socket);
      setConnected(true);
      setUsers(fetchUsers());
    };

    socket.onmessage = (event) => {
      setMessages(prev => [...prev, event.data]);
      setUsers(fetchUsers());
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
    if (!ws) return;

    ws.send(`
      <div class="message">
        <div class="message-header">
          <h3>${nickname}</h3>
          <p>${new Date().toLocaleTimeString()}</p>
        </div>
        <p>${message}</p>
      </div>
    `);
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
          <div className="welcome">
            <form onSubmit={handleConnect}>
              <label>Channel name:</label>
              <input value={channel} onChange={e => setChannel(e.target.value)} required />
              <label>Nickname:</label>
              <input value={nickname} onChange={e => setNickname(e.target.value)} required />
              <button>Connect</button>
            </form>
            {channelList.length > 0 && (
              <>
                <h2 id="status">Open channels:</h2>
                <ul className="channels">
                  {channelList.map((chan, i) => <li key={i} onClick={() => setChannel(chan)}>{chan}</li>)}
                </ul>
              </>
            )}
          </div>
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
                {messages.map((msg, i) => (
                  <div key={i} dangerouslySetInnerHTML={{ __html: msg }} />
                ))}
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
