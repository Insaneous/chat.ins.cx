import { StyleSheet } from 'react-native';

export default StyleSheet.create({
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
    backgroundColor: 'rgb(56, 56, 56)',
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
    fontWeight: 'bold',
  },
  listItem: {
    color: '#fff',
    paddingVertical: 12,
    fontSize: 16,
    borderTopColor: 'rgb(56, 56, 56)',
    borderTopWidth: 1,
  },
  chat: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  messageInputSection: {
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  messages: {
    flex: 1,
    marginVertical: 8,
    display: 'flex',
    flexDirection: 'column-reverse',
    gap: 8,
  },
  message: {
    backgroundColor: 'rgb(56, 56, 56)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    width: '100%',
  },
  ownMessage: {
    backgroundColor: 'rgb(66, 0, 171)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    width: '100%',
  },
  systemMessage: {
    backgroundColor: 'rgb(76, 76, 76)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    alignSelf: 'center',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  systemMessageText: {
    color: '#ccc',
    fontStyle: 'italic',
  },
  systemMessageTimestamp: {
    color: '#999',
    fontSize: 12,
    fontStyle: 'italic',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nickname: {
    color: '#fff',
    fontWeight: 'bold',
  },
  timestamp: {
    fontWeight: 'normal',
    color: '#ccc',
    fontSize: 12,
    marginLeft: 6,
  },
  messageText: {
    color: '#fff',
  },
  users: {
    paddingTop: 12,
    minWidth: '25%',
  },
  errorBanner: {
    backgroundColor: 'rgb(255, 77, 77)',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
  },
  errorText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
