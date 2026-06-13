import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text, TouchableOpacity,
    View
} from 'react-native';
import { auth, db } from '../config/firebase';

export default function PartnerProfileScreen({ navigation, route }) {
  const { partner } = route.params;
  const [loading, setLoading] = useState(false);

  const handleMatchRequest = async () => {
    setLoading(true);
    try {
      // 이미 요청했는지
      const q = query(
        collection(db, 'matchRequests'),
        where('fromUserId', '==', auth.currentUser.uid),
        where('toUserId', '==', partner.userId)
      );
      const existing = await getDocs(q);
      if (!existing.empty) {
        Alert.alert('알림', '이미 매칭 요청을 보냈습니다.');
        setLoading(false);
        return;
      }

      await addDoc(collection(db, 'matchRequests'), {
        fromUserId: auth.currentUser.uid,
        fromEmail: auth.currentUser.email,
        toUserId: partner.userId,
        toEmail: partner.email,
        status: 'pending',
        createdAt: new Date(),
      });
      Alert.alert('완료', '매칭 요청을 보냈습니다!');
    } catch (error) {
      Alert.alert('오류', '매칭 요청에 실패했습니다.');
    }
    setLoading(false);
  };

  const handleReport = async () => {
    Alert.alert(
      '신고',
      '이 사용자를 신고하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '신고',
          style: 'destructive',
          onPress: async () => {
            try {
              await addDoc(collection(db, 'reports'), {
                reporterId: auth.currentUser.uid,
                targetUserId: partner.userId,
                reason: '부적절한 사용자',
                createdAt: new Date(),
              });
              Alert.alert('완료', '신고가 접수되었습니다.');
            } catch (error) {
              Alert.alert('오류', '신고에 실패했습니다.');
            }
          }
        }
      ]
    );
  };

  const handleBlock = async () => {
    Alert.alert(
      '차단',
      '이 사용자를 차단하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '차단',
          style: 'destructive',
          onPress: async () => {
            try {
              await addDoc(collection(db, 'blocks'), {
                blockerId: auth.currentUser.uid,
                blockedUserId: partner.userId,
                createdAt: new Date(),
              });
              Alert.alert('완료', '차단되었습니다.');
              navigation.goBack();
            } catch (error) {
              Alert.alert('오류', '차단에 실패했습니다.');
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
        <Text style={styles.title}>파트너 프로필</Text>
      </View>

      <View style={styles.profileCard}>
        <Text style={styles.email}>{partner.email}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>🏃 페이스</Text>
          <Text style={styles.infoValue}>{partner.pace}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📏 거리</Text>
          <Text style={styles.infoValue}>{partner.distance}km</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>⏰ 시간대</Text>
          <Text style={styles.infoValue}>{partner.timeSlot}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📍 위치</Text>
          <Text style={styles.infoValue}>{partner.location}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>⭐ 신뢰도</Text>
          <Text style={styles.infoValue}>{partner.rating}</Text>
        </View>
        {partner.bio ? (
          <View style={styles.bioContainer}>
            <Text style={styles.infoLabel}>💬 자기소개</Text>
            <Text style={styles.bio}>{partner.bio}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.matchButton}
          onPress={handleMatchRequest}
          disabled={loading}
        >
          <Text style={styles.matchButtonText}>
            {loading ? '처리 중...' : '💌 매칭 요청'}
          </Text>
        </TouchableOpacity>

        <View style={styles.dangerButtons}>
          <TouchableOpacity
            style={styles.reportButton}
            onPress={handleReport}
          >
            <Text style={styles.dangerButtonText}>🚨 신고</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.blockButton}
            onPress={handleBlock}
          >
            <Text style={styles.dangerButtonText}>🚫 차단</Text>
          </TouchableOpacity>
        </View>
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
  profileCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
  },
  email: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  bioContainer: {
    marginTop: 12,
  },
  bio: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
    lineHeight: 20,
  },
  buttonContainer: {
    padding: 16,
    gap: 12,
  },
  matchButton: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  matchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dangerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  reportButton: {
    flex: 1,
    backgroundColor: '#FEF3C7',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  blockButton: {
    flex: 1,
    backgroundColor: '#FEE2E2',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});