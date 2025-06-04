import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, doc, getDoc } from 'firebase/firestore';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
  View
} from 'react-native';
import config from '../../cloud';
import { db } from '../../firebase';

export default function UploadScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const captionInputRef = useRef<TextInput>(null);
  const uploadInProgress = useRef(false);

  const colorScheme = useColorScheme();
  const { colors } = useTheme();
  const appColors = Colors[colorScheme || 'light'];

  const auth = getAuth();
  const user = auth.currentUser;

  const pickImage = async () => {
    if (isUploading) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required!', 'We need access to your photos to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets[0].uri) {
      setImage(result.assets[0].uri);
      setTimeout(() => captionInputRef.current?.focus(), 100);
    }
  };

  const uploadImage = async () => {
    if (!image || !caption || uploadInProgress.current) return;

    uploadInProgress.current = true;
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: image,
        type: 'image/jpeg',
        name: 'upload.jpg',
      } as any);
      formData.append('upload_preset', config.uploadPreset);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      let userNameFromDb = 'Anonymous';
      if (user?.uid) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        userNameFromDb = userDocSnap.exists() ? userDocSnap.data().name || 'Anonymous' : 'Anonymous';
      }

      await addDoc(collection(db, 'posts'), {
        userId: user?.uid,
        userName: userNameFromDb,
        userEmail: user?.email,
        imageUrl: response.data.secure_url,
        caption: caption.trim(),
        createdAt: new Date(),
        likes: 0,
        comments: [],
      });

      setImage(null);
      setCaption('');
      Alert.alert('Success!', 'Your post has been uploaded.');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', 'There was an error uploading your post. Please try again.');
    } finally {
      setIsUploading(false);
      uploadInProgress.current = false;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'android' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'android' ? 90 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
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
                activeOpacity={0.7}
              >
                {image ? (
                  <Image
                    source={{ uri: image }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Ionicons
                      name="image-outline"
                      size={48}
                      color={appColors.smallText}
                    />
                    <Text style={[styles.uploadText, { color: appColors.smallText }]}>
                      Tap to select an image
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <TextInput
                ref={captionInputRef}
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
                maxLength={2200}
                returnKeyType="done"
                blurOnSubmit={true}
              />

              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  {
                    backgroundColor: isUploading || !image
                      ? appColors.buttonDisabled
                      : appColors.button,
                  },
                ]}
                onPress={uploadImage}
                disabled={isUploading || !image}
                activeOpacity={0.8}
              >
                {isUploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Upload Post</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 30, 
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
    justifyContent: 'center',
    height: 50,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});