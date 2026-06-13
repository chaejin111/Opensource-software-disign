import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text, TouchableOpacity,
  View
} from 'react-native';
import { auth, db } from '../config/firebase';

export default function MainScreen({ navigation }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

const loadProfile = async () => {
  try {
    const docRef = doc(db, 'profiles', auth.currentUser.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setProfile(docSnap.data());
    }
  } catch (error) {
    console.error(error);
  }
};

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert('오류', '로그아웃에 실패했습니다.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>RunWith 🏃</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logout}>로그아웃</Text>
        </TouchableOpacity>
      </View>

      {profile && (
        <View style={styles.profileCard}>
          <Text style={styles.profileTitle}>내 프로필</Text>
          <Text style={styles.profileItem}>🏃 페이스: {profile.pace}</Text>
          <Text style={styles.profileItem}>📏 거리: {profile.distance}km</Text>
          <Text style={styles.profileItem}>⏰ 시간대: {profile.timeSlot}</Text>
          <Text style={styles.profileItem}>📍 위치: {profile.location}</Text>
          <Text style={styles.profileItem}>⭐ 신뢰도: {profile.rating}</Text>
          {profile.bio ? (
            <Text style={styles.profileItem}>💬 {profile.bio}</Text>
          ) : null}
        </View>
      )}

      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.navigate('Search')}
        >
          <Text style={styles.menuButtonText}>🔍 파트너 검색</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.navigate('MatchRequest')}
        >
          <Text style={styles.menuButtonText}>💌 매칭 요청 확인</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.navigate('Appointment')}
        >
          <Text style={styles.menuButtonText}>📅 약속 목록</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuButton, styles.menuButtonSecondary]}
          onPress={() => navigation.navigate('ProfileSetup')}
        >
          <Text style={styles.menuButtonTextSecondary}>✏️ 프로필 수정</Text>
        </TouchableOpacity>

        <TouchableOpacity
         style={[styles.menuButton, styles.menuButtonSecondary]}
         onPress={() => navigation.navigate('MyProfile')}
        >
          <Text style={styles.menuButtonTextSecondary}>👤 내 프로필 상세보기</Text>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  logout: {
    color: '#666',
    fontSize: 14,
  },
  profileCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  profileItem: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  menuContainer: {
    padding: 16,
    gap: 12,
  },
  menuButton: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  menuButtonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuButtonTextSecondary: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: 'bold',
  },
});