import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [ws, setWs] = useState(null);
  const [channelList, setChannelList] = useState([]);
  const [connected, setConnected] = useState(false);
  const [channel, setChannel] = useState('');
  const [nickname, setNickname] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

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
    const socket = new WebSocket(`wss://${address}/ws/${channel}/${nickname}`);
    socket.onopen = () => {
      setWs(socket);
      setConnected(true);
      fetchUsers();
    };
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages(prev => [...prev, data]);
        fetchUsers();
      } catch (err) {
        console.warn('Invalid JSON received:', event.data);
      }
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
    };
  
    ws.send(JSON.stringify(msgObj));
  
    setMessages(prev => [...prev, msgObj]);
  
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

              <ScrollView style={styles.messages}>
                {messages.map((msg, i) => (
                  <View key={i} style={styles.message}>
                    <Text style={styles.messageHeader}>
                      {msg.nickname} <Text style={styles.timestamp}>{msg.timestamp}</Text>
                    </Text>
                    <Text style={styles.messageText}>{msg.message}</Text>
                  </View>
                ))}
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

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    backgroundColor: 'rgb(66, 0, 171)',
    padding: 16,
    marginBottom: 8,
  },
  headerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  welcome: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    backgroundColor: 'rgb(76, 76, 76)',
    color: '#fff',
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
  },
  button: {
    backgroundColor: 'rgb(66, 0, 171)',
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subheading: {
    color: '#fff',
    marginTop: 12,
    fontSize: 18,
  },
  listItem: {
    color: '#fff',
    paddingVertical: 8,
    borderBottomColor: 'rgb(76, 76, 76)',
    borderBottomWidth: 1,
    fontSize: 16,
  },
  chat: {
    flex: 1,
  },
  messageInputSection: {
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  messages: {
    flex: 1,
    marginVertical: 8,
  },
  message: {
    backgroundColor: 'rgb(76, 76, 76)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  messageHeader: {
    color: '#fff',
    fontWeight: 'bold',
  },
  messageText: {
    color: '#fff',
  },
  timestamp: {
    fontWeight: 'normal',
    color: '#ccc',
    fontSize: 12,
    marginLeft: 6,
  },
  users: {
    paddingTop: 12,
  },
});
