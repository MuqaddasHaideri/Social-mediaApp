import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, DrawerLayoutAndroid, FlatList, Image, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { auth, db } from '../../firebase';

type PostType = {
  id: string;
  imageUrl?: string;
  caption?: string;
  createdAt?: any;
  likedBy?: string[];
  comments?: any[];
  userEmail?: string;
  userName?: string;
};

type UserType = {
  name: string;
  email: string;
  posts: PostType[];
};

const Profile = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const drawer = useRef<DrawerLayoutAndroid | null>(null);

  const colorScheme = useColorScheme();
  const { colors } = useTheme();
  const appColors = Colors[colorScheme || 'light'];

  const fetchUserData = useCallback(async () => {
    setIsRefreshing(true);
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      setIsRefreshing(false);
      return;
    }

    try {

      const usersRef = collection(db, "users");
      const userQuery = query(usersRef, where("email", "==", firebaseUser.email));
      const userSnapshot = await getDocs(userQuery);

      let userName = firebaseUser.email?.split('@')[0];
      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        userName = userData.name;
      }

  
      const postsRef = collection(db, "posts");
      const postsQuery = query(postsRef, where("userEmail", "==", firebaseUser.email));
      const querySnapshot = await getDocs(postsQuery);

      const fetchedPosts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toMillis()
      })) as PostType[];

      setUser({
        name: userName,
        email: firebaseUser.email || "No email",
        posts: fetchedPosts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)),
      });
    } catch (error) {
      console.log("Error fetching data:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [fetchUserData])
  );

  const renderDrawer = () => (
    <View style={[styles.drawerContainer, { backgroundColor: colors.background }]}>
      <View style={{ flex: 1 }} />
      <TouchableOpacity 
        style={[
          styles.logoutButton, 
          { 
            backgroundColor: colors.card,
            borderTopColor: colors.border 
          }
        ]}
        onPress={() => auth.signOut()}
      >
        <Ionicons name="log-out-outline" size={24} color="#ff3040" style={styles.logoutIcon} />
        <Text style={[styles.logoutText, { color: colors.text }]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );

  if (!user && !isRefreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={appColors.button} />
      </View>
    );
  }

  return (
    <DrawerLayoutAndroid
      drawerWidth={250}
      drawerPosition="right"
      renderNavigationView={renderDrawer}
      ref={drawer}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <View style={styles.profileArea}>
            <View style={[styles.profileInitial, { backgroundColor: appColors.button }]}>
              <Text style={styles.initialText}>{user?.name?.[0]?.toUpperCase() ?? 'U'}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>{user?.name ?? 'User'}</Text>
              <Text style={[styles.userEmail, { color: appColors.smallText }]}>{user?.email ?? 'No email'}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => drawer.current?.openDrawer()}
            style={styles.menuButton}
          >
            <Ionicons name="menu" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={user?.posts || []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.postContainer, { backgroundColor: colors.card }]}>
              {item.imageUrl && (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.postImage}
                  resizeMode="cover"
                />
              )}
              {item.caption && (
                <View style={styles.captionContainer}>
                  <Text style={[styles.captionText, { color: colors.text }]}>
                    {item.caption}
                  </Text>
                </View>
              )}
            </View>
          )}
          refreshing={isRefreshing}
          onRefresh={fetchUserData}
          contentContainerStyle={styles.postsContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="image-outline" size={48} color={appColors.smallText} />
              <Text style={[styles.emptyText, { color: appColors.smallText }]}>
                No posts yet
              </Text>
            </View>
          }
        />
      </View>
    </DrawerLayoutAndroid>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  profileArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInitial: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
  },
  menuButton: {
    padding: 8,
  },
  postsContainer: {
    paddingBottom: 20,
  },
  postContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    aspectRatio: 1,
  },
  captionContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  captionText: {
    fontSize: 14,
  },
  drawerContainer: {
    flex: 1,
    paddingTop: 40,
    justifyContent: 'space-between', 
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    marginBottom: 20, 
  },
  logoutIcon: {
    marginRight: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 10,
  },
});

export default Profile;