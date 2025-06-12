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
  ownMessage: {
    backgroundColor: 'rgb(66, 0, 171)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  systemMessage: {
    backgroundColor: 'rgb(56, 56, 56)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    fontStyle: 'italic',
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
  errorBanner: {
    backgroundColor: 'rgb(255, 77, 77)',
    padding: 10,
    marginVertical: 10,
    borderRadius: 8,
  },
  errorText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
