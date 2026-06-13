import {
    addDoc,
    collection,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    where
} from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    FlatList, KeyboardAvoidingView, Platform,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native';
import { auth, db } from '../config/firebase';

export default function ChatScreen({ navigation, route }) {
  const { partner } = route.params;
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [matchId, setMatchId] = useState(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadChat();
  }, []);

  const loadChat = async () => {
    try {
      // 매칭 찾기
      const q1 = query(
        collection(db, 'matchRequests'),
        where('fromUserId', '==', auth.currentUser.uid),
        where('toUserId', '==', partner.userId),
        where('status', '==', 'accepted')
      );
      const q2 = query(
        collection(db, 'matchRequests'),
        where('fromUserId', '==', partner.userId),
        where('toUserId', '==', auth.currentUser.uid),
        where('status', '==', 'accepted')
      );
      const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      const matchDoc = !snap1.empty ? snap1.docs[0] : !snap2.empty ? snap2.docs[0] : null;

      if (matchDoc) {
        setMatchId(matchDoc.id);
        // 메시지 실시간 
        const msgQuery = query(
          collection(db, 'messages'),
          where('matchId', '==', matchDoc.id),
          orderBy('createdAt', 'asc')
        );
        const unsubscribe = onSnapshot(msgQuery, (snapshot) => {
          const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setMessages(msgs);
        });
        return unsubscribe;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !matchId) return;
    try {
      await addDoc(collection(db, 'messages'), {
        matchId,
        senderId: auth.currentUser.uid,
        senderEmail: auth.currentUser.email,
        content: message.trim(),
        createdAt: new Date(),
      });
      setMessage('');
    } catch (error) {
      Alert.alert('오류', '메시지 전송에 실패했습니다.');
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.senderId === auth.currentUser.uid;
    return (
      <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.theirMessage]}>
        <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
          {item.content}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{partner.email}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Appointment', { partner })}>
          <Text style={styles.apptButton}>📅 약속</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="메시지를 입력하세요"
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>전송</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  back: {
    fontSize: 16,
    color: '#2563EB',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  apptButton: {
    fontSize: 16,
    color: '#2563EB',
  },
  messageList: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  myMessage: {
    backgroundColor: '#2563EB',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 2,
  },
  theirMessage: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  theirMessageText: {
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    gap: 8,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});