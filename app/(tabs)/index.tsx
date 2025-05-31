import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  updateDoc
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';
import { db } from '../../firebase';

interface Comment {
  userId: string;
  userEmail: string;
  userName?: string;
  text: string;
  createdAt: Date;
}

interface Post {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  imageUrl: string;
  caption?: string;
  createdAt: any;
  likedBy?: string[];
  comments?: Comment[];
}

export default function ExploreScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null);

  const colorScheme = useColorScheme();
  const { colors } = useTheme();
  const appColors = Colors[colorScheme || 'light'];

  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'posts'), (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(postsData.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis()));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLike = async (postId: string, likedBy: string[] = []) => {
    if (!currentUser?.uid) return;

    const postRef = doc(db, 'posts', postId);
    if (likedBy.includes(currentUser.uid)) {
      await updateDoc(postRef, {
        likedBy: arrayRemove(currentUser.uid)
      });
    } else {
      await updateDoc(postRef, {
        likedBy: arrayUnion(currentUser.uid)
      });
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!commentText.trim() || !currentUser?.uid || !currentUser?.email) return;

    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      comments: arrayUnion({
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName || currentUser.email.split('@')[0],
        text: commentText,
        createdAt: new Date()
      })
    });
    setCommentText('');
    setActiveCommentPost(null);
  };

  const renderItem = ({ item }: { item: Post }) => (
    <View style={[styles.postContainer, { backgroundColor: colors.card }]}>
    <View style={[styles.postContainer, { backgroundColor: colors.card }]}>
  <View style={styles.postHeader}>
    <View style={styles.userInfo}>
      <View style={[styles.avatarCircle, { backgroundColor: appColors.button }]}>
        <Text style={styles.avatarLetter}>
          {(item.userName || item.userEmail || 'U')[0].toUpperCase()}
        </Text>
      </View>
      <Text style={[styles.username, { color: colors.text }]}>
        {item.userName || item.userEmail?.split('@')[0] || 'Unknown user'}
      </Text>
    </View>
  </View>
</View>


      <Image source={{ uri: item.imageUrl }} style={styles.postImage} resizeMode="cover" />

      <View style={styles.postActions}>
        <TouchableOpacity
          onPress={() => handleLike(item.id, item.likedBy)}
          style={styles.actionButton}
        >
          <Ionicons
            name={item.likedBy?.includes(currentUser?.uid || '') ? 'heart' : 'heart-outline'}
            size={28}
            color={item.likedBy?.includes(currentUser?.uid || '') ? '#ff3040' : colors.text}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            setActiveCommentPost(activeCommentPost === item.id ? null : item.id)
          }
          style={styles.actionButton}
        >
          <Ionicons name="chatbubble-outline" size={26} color={colors.text} />
        </TouchableOpacity>
      </View>

      {item.likedBy && item.likedBy.length > 0 && (
        <Text style={[styles.likesCount, { color: colors.text }]}>
          {item.likedBy.length} {item.likedBy.length === 1 ? 'like' : 'likes'}
        </Text>
      )}

      {item.caption && (
        <View style={styles.captionContainer}>
          <Text style={[styles.captionText, { color: colors.text }]}>
            <Text style={styles.captionUsername}>
              {item.userName || item.userEmail?.split('@')[0] || 'user'}
            </Text>{' '}
            {item.caption}
          </Text>
        </View>
      )}

      {item.comments && item.comments.length > 0 && (
        <View style={styles.commentsContainer}>
          {(expandedCommentsPostId === item.id
            ? item.comments
            : item.comments.slice(0, 2)
          ).map((comment, index) => (
            <View key={index} style={styles.commentItem}>
              <Text style={[styles.commentText, { color: colors.text }]}>
                <Text style={styles.commentUsername}>
                  {comment.userName || comment.userEmail?.split('@')[0] || 'user'}
                </Text>{' '}
                {comment.text}
              </Text>
            </View>
          ))}

          {item.comments.length > 2 && expandedCommentsPostId !== item.id && (
            <Text
              style={[styles.viewAllComments, { color: appColors.smallText }]}
              onPress={() => setExpandedCommentsPostId(item.id)}
            >
              View all {item.comments.length} comments
            </Text>
          )}

          {expandedCommentsPostId === item.id && (
            <Text
              style={[styles.viewAllComments, { color: appColors.smallText }]}
              onPress={() => setExpandedCommentsPostId(null)}
            >
              Show less
            </Text>
          )}
        </View>
      )}

  
      {activeCommentPost === item.id && (
        <View style={styles.addCommentContainer}>
          <TextInput
            style={[
              styles.commentInput,
              {
                color: colors.text,
                backgroundColor: colors.background,
                borderColor: appColors.borderColor
              }
            ]}
            placeholder="Add a comment..."
            placeholderTextColor={appColors.smallText}
            value={commentText}
            onChangeText={setCommentText}
            autoFocus
          />
    <TouchableOpacity
  onPress={() => handleAddComment(item.id)}
  disabled={!commentText.trim()}
>
  <Ionicons
    name="send"
    size={20}
    color={commentText.trim() ? appColors.button : appColors.smallText}
  />
</TouchableOpacity>

        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={appColors.button} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={[styles.exploreTitle, { color: colors.text }]}>Explore</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  exploreTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    margin: 16,
    marginTop: 40
  },
  postContainer: {
    marginBottom: 6,
    padding:9
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',

  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  username: {
    marginLeft: 8,
    fontWeight: '600'
  },
  postImage: {
    width: '100%',
    aspectRatio: 1
  },
  postActions: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  actionButton: {
    marginRight: 16
  },
  likesCount: {
    fontWeight: '600',
    paddingHorizontal: 12,
    marginBottom: 4
  },
  captionContainer: {
    paddingHorizontal: 12,
    marginBottom: 6
  },
  captionText: {
    fontSize: 14
  },
  captionUsername: {
    fontWeight: '600'
  },
  commentsContainer: {
    paddingHorizontal: 12
  },
  commentItem: {
    marginBottom: 4
  },
  commentText: {
    fontSize: 14
  },
  commentUsername: {
    fontWeight: '600'
  },
  viewAllComments: {
    fontSize: 13,
    marginTop: 4
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12
  },
  commentInput: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    marginRight: 8
  },
  postButton: {
    fontWeight: '600',
    fontSize: 14
  },

avatarCircle: {
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: '#888', 
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 2,
},
avatarLetter: {
  color: 'white',
  fontWeight: 'bold',
  fontSize: 16,
},

});
