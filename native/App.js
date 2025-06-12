import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import styles from './styles'; // <-- Import styles

export default function App() {
  const [ws, setWs] = useState(null);
  const [channelList, setChannelList] = useState([]);
  const [connected, setConnected] = useState(false);
  const [channel, setChannel] = useState('');
  const [nickname, setNickname] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const address = 'chat-be.ins.cx';

  const fetchChannels = () => {
    fetch(`https://${address}/channels`)
      .then(res => res.json())
      .then(data => setChannelList(data.channels || []));
  };

  const fetchUsers = () => {
    fetch(`https://${address}/${channel}/users`)
      .then(res => res.json())
      .then(data => setUsers(data.users || []));
  };

  useEffect(() => {
    fetchChannels();
    const interval = setInterval(fetchChannels, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleConnect = () => {
    setError('');
    const socket = new WebSocket(`wss://${address}/ws/${channel}/${nickname}`);
    socket.onopen = () => {
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
        setWs(socket);
        setConnected(true);
        fetchUsers();
      }
    
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
          <Text style={styles.headerText}>Insaneous Chat</Text>
          {connected && <Text style={styles.headerText}>{`| Channel: ${channel}`}</Text>}
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
            <KeyboardAvoidingView
              style={styles.chat}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={80}
            >
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

              <ScrollView style={styles.messages} inverted>
                {[...messages].reverse().map((msg, i) => {
                  const isOwn = msg.nickname === nickname && msg.type !== 'system';
                  const isSystem = msg.type === 'system';
                  const messageStyle = isSystem
                    ? styles.systemMessage
                    : isOwn
                    ? styles.ownMessage
                    : styles.message;

                  return (
                    <View key={i} style={messageStyle}>
                      <Text style={styles.messageHeader}>
                        {msg.nickname} <Text style={styles.timestamp}>{msg.timestamp}</Text>
                      </Text>
                      <Text style={styles.messageText}>{msg.message}</Text>
                    </View>
                  );
                })}
              </ScrollView>

              <View style={styles.users}>
                <Text style={styles.subheading}>Users:</Text>
                {users.map((user, i) => (
                  <Text key={i} style={styles.listItem}>{user}</Text>
                ))}
              </View>
            </KeyboardAvoidingView>
          )}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
