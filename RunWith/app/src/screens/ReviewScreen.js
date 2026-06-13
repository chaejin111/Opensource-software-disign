import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native';
import { auth, db } from '../config/firebase';

export default function ReviewScreen({ navigation, route }) {
  const { partner } = route.params;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('오류', '평점을 선택해주세요.');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        reviewerId: auth.currentUser.uid,
        reviewerEmail: auth.currentUser.email,
        targetUserId: partner.userId,
        rating,
        comment,
        createdAt: new Date(),
      });

      // 파트너 신뢰도 점수
      const profileRef = doc(db, 'profiles', partner.userId);
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists()) {
        const currentRating = profileSnap.data().rating || 0;
        const reviewCount = profileSnap.data().reviewCount || 0;
        const newRating = ((currentRating * reviewCount + rating) / (reviewCount + 1)).toFixed(1);
        await updateDoc(profileRef, { 
         rating: parseFloat(newRating),
          reviewCount: reviewCount + 1
        });
      }

      Alert.alert('완료', '리뷰가 등록되었습니다!', [
        { text: '확인', onPress: () => navigation.navigate('Main') }
      ]);
    } catch (error) {
      Alert.alert('오류', '리뷰 등록에 실패했습니다.');
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>리뷰 작성</Text>
        <Text style={styles.subtitle}>{partner.email}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>평점 *</Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Text style={[styles.star, rating >= star && styles.starSelected]}>
                ★
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.ratingText}>
          {rating === 0 ? '평점을 선택해주세요' :
           rating === 1 ? '😞 별로였어요' :
           rating === 2 ? '😐 그저 그랬어요' :
           rating === 3 ? '🙂 괜찮았어요' :
           rating === 4 ? '😊 좋았어요' :
           '🤩 최고였어요!'}
        </Text>

        <Text style={styles.label}>한 줄 리뷰</Text>
        <TextInput
          style={styles.input}
          placeholder="파트너에 대한 리뷰를 작성해주세요 (선택)"
          value={comment}
          onChangeText={setComment}
          multiline
        />

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? '등록 중...' : '리뷰 등록'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.navigate('Main')}
        >
          <Text style={styles.skipButtonText}>건너뛰기</Text>
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
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
    marginTop: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  star: {
    fontSize: 40,
    color: '#ddd',
  },
  starSelected: {
    color: '#F59E0B',
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#2563EB',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    padding: 14,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#666',
    fontSize: 14,
  },
});