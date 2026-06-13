import {
    collection,
    doc,
    getDocs,
    query,
    updateDoc,
    where
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text, TouchableOpacity,
    View
} from 'react-native';
import { auth, db } from '../config/firebase';

export default function MatchRequestScreen({ navigation }) {
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [tab, setTab] = useState('received');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
  try {
    const receivedQ = query(
      collection(db, 'matchRequests'),
      where('toUserId', '==', auth.currentUser.uid)
    );
    const receivedSnap = await getDocs(receivedQ);
    setReceived(receivedSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    const sentQ = query(
      collection(db, 'matchRequests'),
      where('fromUserId', '==', auth.currentUser.uid)
    );
    const sentSnap = await getDocs(sentQ);
    setSent(sentSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (error) {
    console.error(error);
  }
};

  const handleAccept = async (request) => {
  setLoading(true);
  try {
    await updateDoc(doc(db, 'matchRequests', request.id), {
      status: 'accepted',
    });
    Alert.alert('완료', '매칭이 수락되었습니다! 채팅을 시작하세요.');
    await loadRequests();
  } catch (error) {
    Alert.alert('오류', '수락에 실패했습니다.');
  }
  setLoading(false);
};

  const handleReject = async (request) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'matchRequests', request.id), {
        status: 'rejected',
      });
      Alert.alert('완료', '매칭 요청을 거절했습니다.');
      loadRequests();
    } catch (error) {
      Alert.alert('오류', '거절에 실패했습니다.');
    }
    setLoading(false);
  };

  const handleChat = (request) => {
    const partner = {
      userId: tab === 'received' ? request.fromUserId : request.toUserId,
      email: tab === 'received' ? request.fromEmail : request.toEmail,
    };
    navigation.navigate('Chat', { partner });
  };

  const requests = tab === 'received' ? received : sent;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>매칭 요청</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, tab === 'received' && styles.tabActive]}
          onPress={() => setTab('received')}
        >
          <Text style={[styles.tabText, tab === 'received' && styles.tabTextActive]}>
            받은 요청 ({received.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'sent' && styles.tabActive]}
          onPress={() => setTab('sent')}
        >
          <Text style={[styles.tabText, tab === 'sent' && styles.tabTextActive]}>
            보낸 요청 ({sent.length})
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        {requests.length === 0 ? (
          <Text style={styles.emptyText}>
            {tab === 'received' ? '받은 매칭 요청이 없습니다.' : '보낸 매칭 요청이 없습니다.'}
          </Text>
        ) : (
          requests.map((request) => (
            <View key={request.id} style={styles.requestCard}>
              <Text style={styles.requestEmail}>
                {tab === 'received' ? `👤 ${request.fromEmail}` : `👤 ${request.toEmail}`}
              </Text>
              <Text style={[
                styles.requestStatus,
                request.status === 'accepted' && styles.statusAccepted,
                request.status === 'rejected' && styles.statusRejected,
              ]}>
                {request.status === 'pending' ? '⏳ 대기중' :
                 request.status === 'accepted' ? '✅ 수락됨' : '❌ 거절됨'}
              </Text>

              {tab === 'received' && request.status === 'pending' && (
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => handleAccept(request)}
                    disabled={loading}
                  >
                    <Text style={styles.acceptButtonText}>수락</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => handleReject(request)}
                    disabled={loading}
                  >
                    <Text style={styles.rejectButtonText}>거절</Text>
                  </TouchableOpacity>
                </View>
              )}

              {request.status === 'accepted' && (
                <TouchableOpacity
                  style={styles.chatButton}
                  onPress={() => handleChat(request)}
                >
                  <Text style={styles.chatButtonText}>💬 채팅하기</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
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
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
    gap: 16,
  },
  back: {
    fontSize: 16,
    color: '#2563EB',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#2563EB',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  tabTextActive: {
    color: '#2563EB',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 40,
    fontSize: 16,
  },
  requestCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },
  requestEmail: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  requestStatus: {
    fontSize: 14,
    color: '#F59E0B',
    marginBottom: 12,
  },
  statusAccepted: {
    color: '#10B981',
  },
  statusRejected: {
    color: '#EF4444',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  chatButton: {
    backgroundColor: '#2563EB',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  chatButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});