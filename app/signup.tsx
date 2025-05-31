import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { app } from '../firebase';

const auth = getAuth(app);
const db = getFirestore(app);

const { width } = Dimensions.get('window');

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { colors } = useTheme();
  const colorScheme = useColorScheme();
  const appColors = Colors[colorScheme || 'light'];
  const insets = useSafeAreaInsets();

  
  const handleSignUp = async () => {
    if (!email || !password || !name) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    
    try {
 
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        createdAt: new Date(),
      });

      Alert.alert('Success', 'Account created successfully!');
      router.push('/login');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create account');
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
            Now,
          </ThemedText>
          <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
            let's get started
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: appColors.smallText }]}>
            Please fill this form to create an account
          </ThemedText>
        </View>

        <View style={styles.formContainer}>
       
          <View style={[styles.inputContainer, { 
            borderColor: appColors.borderColor,
            backgroundColor: colors.card 
          }]}>
            <FontAwesome 
              name="user" 
              size={18} 
              color={appColors.smallText} 
              style={styles.icon} 
            />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Full name"
              placeholderTextColor={appColors.smallText}
              onChangeText={setName}
              value={name}
              autoCapitalize="words"
            />
          </View>

 
          <View style={[styles.inputContainer, { 
            borderColor: appColors.borderColor,
            backgroundColor: colors.card,
            marginTop: 16 
          }]}>
            <MaterialIcons 
              name="email" 
              size={20} 
              color={appColors.smallText} 
              style={styles.icon} 
            />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Email address"
              placeholderTextColor={appColors.smallText}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={setEmail}
              value={email}
            />
          </View>

    
          <View style={[styles.inputContainer, { 
            borderColor: appColors.borderColor,
            backgroundColor: colors.card,
            marginTop: 16 
          }]}>
            <Ionicons 
              name="lock-closed" 
              size={20} 
              color={appColors.smallText} 
              style={styles.icon} 
            />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Password"
              placeholderTextColor={appColors.smallText}
              secureTextEntry
              onChangeText={setPassword}
              value={password}
            />
          </View>
        </View>
      </View>

      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 30 }]}>
        <TouchableOpacity
          style={[styles.button, { 
            backgroundColor: appColors.button,
            opacity: loading ? 0.7 : 1 
          }]}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText type="defaultSemiBold" style={styles.buttonText}>
              Sign Up
            </ThemedText>
          )}
        </TouchableOpacity>

        <View style={styles.loginTextContainer}>
          <ThemedText style={styles.loginPrompt}>
            Already have an account?{' '}
          </ThemedText>
          <TouchableOpacity 
            onPress={() => router.push('/login')}
            disabled={loading}
          >
            <ThemedText style={[styles.loginLink, { color: appColors.button }]}>
              Login
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  textContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: '600',
    marginBottom: 8,
    padding: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
  },
  icon: {
    padding: 12,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  bottomContainer: {
    width: '100%',
  },
  button: {
    paddingVertical: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loginTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginPrompt: {
    fontSize: 16,
    color: '#666',
  },
  loginLink: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SignUp;