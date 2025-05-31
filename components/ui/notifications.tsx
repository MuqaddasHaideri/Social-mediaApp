// import { Colors } from '@/constants/Colors';
// import { Ionicons } from '@expo/vector-icons';
// import { useTheme } from '@react-navigation/native';
// import { getAuth } from 'firebase/auth';
// import { collection, getDocs, onSnapshot } from 'firebase/firestore';
// import React, { useEffect, useState } from 'react';
// import {
//   ActivityIndicator,
//   FlatList,
//   Image,
//   StyleSheet,
//   Text,
//   useColorScheme,
//   View,
// } from 'react-native';
// import { db } from '../../firebase';

// interface Like {
//   userId: string;
//   userEmail: string;
//   createdAt: Date;
// }

// interface Comment {
//   id: string;
//   userId: string;
//   userEmail: string;
//   content: string;
//   createdAt: Date;
// }

// interface PostInteraction {
//   id: string;
//   postId: string;
//   postImage: string;
//   type: 'like' | 'comment';
//   userEmail: string;
//   content?: string;
//   createdAt: Date;
// }

// export default function NotificationsScreen() {
//   const [interactions, setInteractions] = useState<PostInteraction[]>([]);
//   const [loading, setLoading] = useState(true);
//   const auth = getAuth();
//   const currentUser = auth.currentUser;
//   const { colors } = useTheme();
//   const colorScheme = useColorScheme();
//   const appColors = Colors[colorScheme || 'light'];

//   useEffect(() => {
//     if (!currentUser?.uid) return;

//     const fetchUserPostsAndInteractions = async () => {
//       try {
//         const userPostsRef = collection(db, 'posts');
//         const unsubscribe = onSnapshot(userPostsRef, async (snapshot) => {
         
//           const userPosts = snapshot.docs.filter(
//             (doc) => doc.data().userId === currentUser.uid
//           );
// console.log(userPostsRef);
//           const allInteractions: PostInteraction[] = [];

//           for (const postDoc of userPosts) {
//             const postId = postDoc.id;
//             const postData = postDoc.data();

//             const likesRef = collection(db, 'posts', postId, 'likes');
//             console.log("likeref",likesRef)
//             const likesSnapshot = await getDocs(likesRef);
//             likesSnapshot.forEach((likeDoc) => {
//               const likeData = likeDoc.data();
//               if (likeData.userId !== currentUser.uid) {
//                 allInteractions.push({
//                   id: `${postId}_like_${likeDoc.id}`,
//                   postId,
//                   postImage: postData.imageUrl || '',
//                   type: 'like',
//                   userEmail: likeData.userEmail,
//                   createdAt: likeData.createdAt.toDate(),
//                 });
//               }
//             });

//             // Get comments collection for the post
//             const commentsRef = collection(db, 'posts', postId, 'comments');
//             const commentsSnapshot = await getDocs(commentsRef);
//             commentsSnapshot.forEach((commentDoc) => {
//               const commentData = commentDoc.data();
//               if (commentData.userId !== currentUser.uid) {
//                 allInteractions.push({
//                   id: commentDoc.id,
//                   postId,
//                   postImage: postData.imageUrl || '',
//                   type: 'comment',
//                   userEmail: commentData.userEmail,
//                   content: commentData.content,
//                   createdAt: commentData.createdAt.toDate(),
//                 });
//               }
//             });
//           }

//           // Sort interactions newest first
//           setInteractions(
//             allInteractions.sort(
//               (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
//             )
//           );
//           setLoading(false);
//         });

//         return () => unsubscribe();
//       } catch (error) {
//         console.error('Error fetching interactions:', error);
//         setLoading(false);
//       }
//     };

//     fetchUserPostsAndInteractions();
//   }, [currentUser?.uid]);

//   const renderInteraction = ({ item }: { item: PostInteraction }) => (
//     <View style={[styles.notificationItem, { backgroundColor: colors.card }]}>
//       <View style={styles.notificationHeader}>
//         <Ionicons
//           name={item.type === 'like' ? 'heart' : 'chatbubble'}
//           size={24}
//           color={item.type === 'like' ? '#ff3040' : colors.text}
//           style={styles.notificationIcon}
//         />
//         <Text style={[styles.notificationText, { color: colors.text }]}>
//           <Text style={styles.boldText}>{item.userEmail?.split('@')[0]}</Text>
//           {item.type === 'like' ? ' liked your post' : ' commented: '}
//           {item.type === 'comment' && (
//             <Text style={styles.commentText}>"{item.content}"</Text>
//           )}
//         </Text>
//       </View>

//       {item.postImage ? (
//         <Image
//           source={{ uri: item.postImage }}
//           style={styles.postThumbnail}
//           resizeMode="cover"
//         />
//       ) : (
//         <Ionicons name="image-outline" size={48} color={appColors.smallText} />
//       )}
//     </View>
//   );

//   if (loading) {
//     return (
//       <View
//         style={[styles.loadingContainer, { backgroundColor: colors.background }]}
//       >
//         <ActivityIndicator size="large" color={appColors.button} />
//       </View>
//     );
//   }

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       {interactions.length === 0 ? (
//         <View style={styles.emptyContainer}>
//           <Ionicons
//             name="notifications-off-outline"
//             size={48}
//             color={appColors.smallText}
//           />
//           <Text style={[styles.emptyText, { color: appColors.smallText }]}>
//             No interactions yet
//           </Text>
//         </View>
//       ) : (
//         <FlatList
//           data={interactions}
//           renderItem={renderInteraction}
//           keyExtractor={(item) => item.id}
//           contentContainerStyle={styles.listContainer}
//         />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   emptyText: {
//     marginTop: 16,
//     fontSize: 16,
//   },
//   listContainer: {
//     padding: 16,
//   },
//   notificationItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 8,
//   },
//   notificationHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   notificationIcon: {
//     marginRight: 12,
//   },
//   notificationText: {
//     flex: 1,
//   },
//   boldText: {
//     fontWeight: 'bold',
//   },
//   commentText: {
//     fontStyle: 'italic',
//   },
//   postThumbnail: {
//     width: 50,
//     height: 50,
//     borderRadius: 4,
//     marginLeft: 12,
//   },
// });
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

export default function notifications() {
  return (
    <View>
      <Text>notifications</Text>
    </View>
  )
}

const styles = StyleSheet.create({})