import { collection, getDocs, query, where } from 'firebase/firestore';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text, TouchableOpacity,
    View
} from 'react-native';
import { auth, db } from '../config/firebase';

export default function SearchScreen({ navigation }) {
  const [timeSlot, setTimeSlot] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const timeSlots = ['아침', '점심', '저녁'];

  const handleSearch = async () => {
  setLoading(true);
  try {
    // 내가 차단한 사람
    const blockQ = query(
      collection(db, 'blocks'),
      where('blockerId', '==', auth.currentUser.uid)
    );
    const blockSnap = await getDocs(blockQ);
    const blockedIds = blockSnap.docs.map(d => d.data().blockedUserId);

    // 3번 이상 신고된 사람
    const reportSnap = await getDocs(collection(db, 'reports'));
    const reportCounts = {};
    reportSnap.docs.forEach(d => {
      const targetId = d.data().targetUserId;
      reportCounts[targetId] = (reportCounts[targetId] || 0) + 1;
    });
    const reportedIds = Object.keys(reportCounts).filter(id => reportCounts[id] >= 3);
    const querySnapshot = await getDocs(collection(db, 'profiles'));
    const partners = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (
        data.userId !== auth.currentUser.uid &&
        !blockedIds.includes(data.userId) &&
        !reportedIds.includes(data.userId) &&
        (!timeSlot || data.timeSlot === timeSlot)
      ) {
        partners.push({ id: doc.id, ...data });
      }
    });
    setResults(partners);
    if (partners.length === 0) {
      Alert.alert('검색 결과 없음', '조건에 맞는 파트너가 없습니다.');
    }
  } catch (error) {
    Alert.alert('오류', '검색에 실패했습니다.');
  }
  setLoading(false);
};

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>파트너 검색</Text>
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.label}>선호 시간대</Text>
        <View style={styles.timeSlotContainer}>
          {timeSlots.map((slot) => (
            <TouchableOpacity
              key={slot}
              style={[
                styles.timeSlotButton,
                timeSlot === slot && styles.timeSlotSelected
              ]}
              onPress={() => setTimeSlot(timeSlot === slot ? '' : slot)}
            >
              <Text style={[
                styles.timeSlotText,
                timeSlot === slot && styles.timeSlotTextSelected
              ]}>
                {slot}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>🔍 검색</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 20 }} />}

      {results.map((partner) => (
        <TouchableOpacity
          key={partner.id}
          style={styles.partnerCard}
          onPress={() => navigation.navigate('PartnerProfile', { partner })}
        >
          <Text style={styles.partnerEmail}>{partner.email}</Text>
          <Text style={styles.partnerInfo}>🏃 {partner.pace}</Text>
          <Text style={styles.partnerInfo}>📏 {partner.distance}km</Text>
          <Text style={styles.partnerInfo}>⏰ {partner.timeSlot}</Text>
          <Text style={styles.partnerInfo}>📍 {partner.location}</Text>
          <Text style={styles.partnerInfo}>⭐ 신뢰도: {partner.rating}</Text>
        </TouchableOpacity>
      ))}
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
  filterContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  timeSlotContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  timeSlotButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  timeSlotSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  timeSlotText: {
    color: '#333',
    fontWeight: '600',
  },
  timeSlotTextSelected: {
    color: '#fff',
  },
  searchButton: {
    backgroundColor: '#2563EB',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  partnerCard: {
    backgroundColor: '#fff',
    margin: 8,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  partnerEmail: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  partnerInfo: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
});