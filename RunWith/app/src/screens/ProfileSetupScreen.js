import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import {
    Alert, ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native';
import { auth, db } from '../config/firebase';

export default function ProfileSetupScreen({ navigation }) {
  const [pace, setPace] = useState('');
  const [distance, setDistance] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  const timeSlots = ['아침', '점심', '저녁'];

  const handleSave = async () => {
    if (!pace || !distance || !timeSlot || !location) {
      Alert.alert('오류', '필수 항목을 모두 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      await setDoc(doc(db, 'profiles', auth.currentUser.uid), {
        userId: auth.currentUser.uid,
        email: auth.currentUser.email,
        pace,
        distance: parseInt(distance),
        timeSlot,
        location,
        bio,
        rating: 0,
        createdAt: new Date(),
      });
      navigation.navigate('Main');
    } catch (error) {
      Alert.alert('오류', '프로필 저장에 실패했습니다.');
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>프로필 설정</Text>
      <Text style={styles.subtitle}>러닝 정보를 입력해주세요</Text>

      <Text style={styles.label}>평균 페이스 (예: 6분/km) *</Text>
      <TextInput
        style={styles.input}
        placeholder="예: 6분/km"
        value={pace}
        onChangeText={setPace}
      />

      <Text style={styles.label}>선호 거리 (km) *</Text>
      <TextInput
        style={styles.input}
        placeholder="예: 5"
        value={distance}
        onChangeText={setDistance}
        keyboardType="numeric"
      />

      <Text style={styles.label}>선호 시간대 *</Text>
      <View style={styles.timeSlotContainer}>
        {timeSlots.map((slot) => (
          <TouchableOpacity
            key={slot}
            style={[
              styles.timeSlotButton,
              timeSlot === slot && styles.timeSlotSelected
            ]}
            onPress={() => setTimeSlot(slot)}
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

      <Text style={styles.label}>주요 러닝 위치 *</Text>
      <TextInput
        style={styles.input}
        placeholder="예: 영남대"
        value={location}
        onChangeText={setLocation}
      />

      <Text style={styles.label}>자기소개</Text>
      <TextInput
        style={[styles.input, styles.bioInput]}
        placeholder="간단한 자기소개를 작성해주세요"
        value={bio}
        onChangeText={setBio}
        multiline
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? '저장 중...' : '저장하고 시작하기'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 60,
    marginBottom: 8,
    color: '#2563EB',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
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
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  timeSlotContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  timeSlotButton: {
    flex: 1,
    padding: 12,
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
  button: {
    backgroundColor: '#2563EB',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 40,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});