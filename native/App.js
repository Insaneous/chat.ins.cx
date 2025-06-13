import React, { useState, useEffect } from 'react';
import {
  FlatList,
  View,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import styles from './styles';

export default function App() {
  const [ws, setWs] = useState(null);
  const [channelList, setChannelList] = useState([]);
  const [connected, setConnected] = useState(false);
  const [channel, setChannel] = useState('');
  const [nickname, setNickname] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');

  const address = 'chat-be.ins.cx';

  const fetchChannels = () => {
    fetch(`https://${address}/channels`)
      .then(res => res.json())
      .then(data => setChannelList(data.channels || []));
  };

  useEffect(() => {
    fetchChannels();
    const interval = setInterval(fetchChannels, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleConnect = () => {
    setError('');
    const socket = new WebSocket(`wss://${address}/ws/${encodeURIComponent(channel)}/${encodeURIComponent(nickname)}`);

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

      if (!connected) {
        console.log('Connected to WebSocket');
        setConnected(true);
      }

      try {
        data.timestamp = new Date().toLocaleTimeString();
      } catch {}

      setMessages(prev => [...prev, data]);
    };

    socket.onclose = () => {
      setConnected(false);
      setWs(null);
      setMessages([]);
      setChannel('');
      fetchChannels();
    };
  };

  const handleSend = () => {
    if (!ws || message.trim() === '') return;

    const msgObj = {
      nickname,
      timestamp: new Date().toLocaleTimeString(),
      message,
      type: 'message',
    };

    ws.send(JSON.stringify(msgObj));
    setMessage('');
  };

  const handleDisconnect = () => {
    if (ws) ws.close();
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeContainer}>
        <StatusBar style='light' />
        <View style={styles.header}>
          <Text style={styles.headerText}>{connected ? `Channel: ${channel}` : 'Insaneous Chat'}</Text>
        </View>
        <View style={styles.container}>
          {!connected ? (
            <View style={styles.welcome}>
              <TextInput
                placeholder="Channel name"
                placeholderTextColor="#aaa"
                style={styles.input}
                value={channel}
                onChangeText={setChannel}
              />
              <TextInput
                placeholder="Nickname"
                placeholderTextColor="#aaa"
                style={styles.input}
                value={nickname}
                onChangeText={setNickname}
              />
              <TouchableOpacity style={styles.button} onPress={handleConnect}>
                <Text style={styles.buttonText}>Connect</Text>
              </TouchableOpacity>

              {error !== '' && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {channelList.length > 0 && (
                <>
                  <Text style={styles.subheading}>Open channels:</Text>
                  {channelList.map((chan, i) => (
                    <TouchableOpacity key={i} onPress={() => setChannel(chan)}>
                      <Text style={styles.listItem}>{chan}</Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </View>
          ) : (
            <>
              <View style={styles.messageInputSection}>
                <TextInput
                  placeholder="Message"
                  placeholderTextColor="#aaa"
                  style={styles.input}
                  value={message}
                  onChangeText={setMessage}
                />
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.button} onPress={handleSend}>
                    <Text style={styles.buttonText}>Send</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={handleDisconnect}>
                    <Text style={styles.buttonText}>Disconnect</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <FlatList
                style={{flex: 1}}
                contentContainerStyle={styles.messages}
                data={messages}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item: msg }) => {
                  const isOwn = msg.nickname === nickname && msg.type !== 'system';
                  const isSystem = msg.type === 'system';

                  if (isSystem) {
                    return (
                      <View style={styles.systemMessage}>
                        <Text style={styles.systemMessageText}>{msg.message}</Text>
                        <Text style={styles.systemMessageTimestamp}>{msg.timestamp}</Text>
                      </View>
                    );
                  }

                  const messageStyle = isOwn ? styles.ownMessage : styles.message;

                  return (
                    <View style={messageStyle}>
                      <View style={styles.messageHeader}>
                        <Text style={styles.nickname}>{msg.nickname}</Text>
                        <Text style={styles.timestamp}>{msg.timestamp}</Text>
                      </View>
                      <Text style={styles.messageText}>{msg.message}</Text>
                    </View>
                  );
                }}
              />
          </>
          )}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
