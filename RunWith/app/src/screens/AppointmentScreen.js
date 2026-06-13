import {
    addDoc,
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
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native';
import { auth, db } from '../config/firebase';

export default function AppointmentScreen({ navigation, route }) {
  const partner = route.params?.partner;
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(partner ? 'create' : 'list');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const q = query(
        collection(db, 'appointments'),
        where('participantIds', 'array-contains', auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const appts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setAppointments(appts);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreate = async () => {
    if (!date || !time || !location) {
      Alert.alert('오류', '날짜, 시간, 장소를 모두 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'appointments'), {
        participantIds: [auth.currentUser.uid, partner.userId],
        participantEmails: [auth.currentUser.email, partner.email],
        scheduledDate: date,
        scheduledTime: time,
        location,
        isComplete: false,
        createdAt: new Date(),
      });
      Alert.alert('완료', '약속이 등록되었습니다!');
      setDate('');
      setTime('');
      setLocation('');
      setTab('list');
      loadAppointments();
    } catch (error) {
      Alert.alert('오류', '약속 등록에 실패했습니다.');
    }
    setLoading(false);
  };

  const handleComplete = async (appointmentId) => {
  Alert.alert(
    '약속 완료',
    '러닝을 완료하셨나요?',
    [
      { text: '취소', style: 'cancel' },
      {
        text: '완료',
        onPress: async () => {
          try {
            const appt = appointments.find(a => a.id === appointmentId);
            const partnerId = appt.participantIds.find(id => id !== auth.currentUser.uid);
            const partnerEmail = appt.participantEmails.find(e => e !== auth.currentUser.email);
            
            // 내가 완료한 것만 표시(전체 완료 아님)
            const completedBy = appt.completedBy || [];
            completedBy.push(auth.currentUser.uid);
            
            await updateDoc(doc(db, 'appointments', appointmentId), {
              completedBy,
              isComplete: completedBy.length >= 2, // 둘 다 완료해야됨
            });

            loadAppointments();
            navigation.navigate('Review', {
              partner: { userId: partnerId, email: partnerEmail }
            });
          } catch (error) {
            Alert.alert('오류', '완료 처리에 실패했습니다.');
          }
        }
      }
    ]
  );
};

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>약속</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, tab === 'list' && styles.tabActive]}
          onPress={() => setTab('list')}
        >
          <Text style={[styles.tabText, tab === 'list' && styles.tabTextActive]}>약속 목록</Text>
        </TouchableOpacity>
        {partner && (
          <TouchableOpacity
            style={[styles.tab, tab === 'create' && styles.tabActive]}
            onPress={() => setTab('create')}
          >
            <Text style={[styles.tabText, tab === 'create' && styles.tabTextActive]}>약속 등록</Text>
          </TouchableOpacity>
        )}
      </View>

      {tab === 'create' && partner && (
        <View style={styles.createContainer}>
          <Text style={styles.label}>날짜 *</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 2026-06-20"
            value={date}
            onChangeText={setDate}
          />
          <Text style={styles.label}>시간 *</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 오전 7시"
            value={time}
            onChangeText={setTime}
          />
          <Text style={styles.label}>장소 *</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 영남대"
            value={location}
            onChangeText={setLocation}
          />
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreate}
            disabled={loading}
          >
            <Text style={styles.createButtonText}>
              {loading ? '등록 중...' : '약속 등록'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {tab === 'list' && (
        <View style={styles.listContainer}>
          {appointments.length === 0 ? (
            <Text style={styles.emptyText}>등록된 약속이 없습니다.</Text>
          ) : (
            appointments.map((appt) => (
              <View key={appt.id} style={styles.apptCard}>
                <Text style={styles.apptPartner}>
                  👤 {appt.participantEmails.find(e => e !== auth.currentUser.email)}
                </Text>
                <Text style={styles.apptInfo}>📅 {appt.scheduledDate}</Text>
                <Text style={styles.apptInfo}>⏰ {appt.scheduledTime}</Text>
                <Text style={styles.apptInfo}>📍 {appt.location}</Text>
                <Text style={[styles.apptStatus, appt.isComplete && styles.apptComplete]}>
                  {appt.isComplete ? '✅ 완료' : '🔄 진행중'}
                </Text>
                {!appt.completedBy?.includes(auth.currentUser.uid) && (
                  <TouchableOpacity
                    style={styles.completeButton}
                     onPress={() => handleComplete(appt.id)}
                    >
                      <Text style={styles.completeButtonText}>완료 처리</Text>
                </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>
      )}
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
  createContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  createButton: {
    backgroundColor: '#2563EB',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
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
  apptCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },
  apptPartner: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  apptInfo: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  apptStatus: {
    fontSize: 14,
    color: '#F59E0B',
    marginTop: 8,
    fontWeight: '600',
  },
  apptComplete: {
    color: '#10B981',
  },
  completeButton: {
    backgroundColor: '#10B981',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  completeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});