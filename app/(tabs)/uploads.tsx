import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, doc, getDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';
import config from '../../cloud';
import { db } from '../../firebase';

export default function UploadScreen() {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const colorScheme = useColorScheme();
  const { colors } = useTheme();
  const appColors = Colors[colorScheme || 'light'];

  const auth = getAuth();
  const user = auth.currentUser;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (!image || !caption) {
      Alert.alert('Please select an image and add a caption.');
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', {
      uri: image,
      type: 'image/jpeg',
      name: 'upload.jpg',
    });
    formData.append('upload_preset', config.uploadPreset);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const imageUrl = response.data.secure_url;
      let userNameFromDb = 'Anonymous';
      if (user?.uid) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          userNameFromDb = userDocSnap.data().name || 'Anonymous';
        }
      }

      await addDoc(collection(db, 'posts'), {
        userId: user?.uid,
        userName: userNameFromDb,
        userEmail: user?.email,
        imageUrl,
        caption,
        createdAt: new Date(),
      });

      Alert.alert('Success!', 'Post uploaded.');
      setImage(null);
      setCaption('');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerText, { color: colors.text }]}>Create New Post</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={[
            styles.imageUploadArea,
            {
              borderColor: appColors.borderColor,
              backgroundColor: colors.card,
            },
          ]}
          onPress={pickImage}
          disabled={isUploading}
        >
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Ionicons name="image-outline" size={48} color={appColors.smallText} />
              <Text style={[styles.uploadText, { color: appColors.smallText }]}>
                Tap to select an image
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Caption Field */}
        <TextInput
          style={[
            styles.caption,
            {
              borderColor: appColors.borderColor,
              color: colors.text,
              backgroundColor: colors.card,
            },
          ]}
          placeholder="Write a caption..."
          placeholderTextColor={appColors.smallText}
          value={caption}
          onChangeText={setCaption}
          editable={!isUploading}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={[
            styles.uploadButton,
            {
              backgroundColor: isUploading ? appColors.buttonDisabled : appColors.button,
              opacity: isUploading ? 0.7 : 1,
            },
          ]}
          onPress={uploadImage}
          disabled={isUploading || !image}
        >
          <Text style={styles.buttonText}>
            {isUploading ? 'Uploading...' : 'Upload Post'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  imageUploadArea: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  uploadText: {
    marginTop: 10,
    fontSize: 16,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  caption: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    width: '100%',
    marginBottom: 20,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  uploadButton: {
    paddingVertical: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
