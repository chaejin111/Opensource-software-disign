import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView
} from 'react-native';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export default function MyProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    loadProfile();
    loadReviews();
  }, []);

  const loadProfile = async () => {
    const docSnap = await getDoc(doc(db, 'profiles', auth.currentUser.uid));
    if (docSnap.exists()) setProfile(docSnap.data());
  };

  const loadReviews = async () => {
    const q = query(
      collection(db, 'reviews'),
      where('targetUserId', '==', auth.currentUser.uid)
    );
    const snap = await getDocs(q);
    setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>내 프로필</Text>
      </View>

      {profile && (
        <View style={styles.profileCard}>
          <Text style={styles.email}>{auth.currentUser.email}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🏃 페이스</Text>
            <Text style={styles.infoValue}>{profile.pace}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📏 거리</Text>
            <Text style={styles.infoValue}>{profile.distance}km</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>⏰ 시간대</Text>
            <Text style={styles.infoValue}>{profile.timeSlot}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📍 위치</Text>
            <Text style={styles.infoValue}>{profile.location}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>⭐ 신뢰도</Text>
            <Text style={styles.infoValue}>{profile.rating} ({profile.reviewCount || 0}개 리뷰)</Text>
          </View>
          {profile.bio ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>💬 자기소개</Text>
              <Text style={styles.infoValue}>{profile.bio}</Text>
            </View>
          ) : null}
        </View>
      )}

      <View style={styles.reviewSection}>
        <Text style={styles.reviewTitle}>받은 리뷰 ({reviews.length})</Text>
        {reviews.length === 0 ? (
          <Text style={styles.emptyText}>아직 받은 리뷰가 없습니다.</Text>
        ) : (
          reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <Text style={styles.reviewRating}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</Text>
              <Text style={styles.reviewEmail}>{review.reviewerEmail}</Text>
              {review.comment ? (
                <Text style={styles.reviewComment}>{review.comment}</Text>
              ) : null}
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
  reviewSection: {
    margin: 16,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  reviewCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
  },
  reviewRating: {
    fontSize: 20,
    color: '#F59E0B',
    marginBottom: 4,
  },
  reviewEmail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  reviewComment: {
    fontSize: 14,
    color: '#333',
  },
});