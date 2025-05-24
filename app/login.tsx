import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth } from '../firebase';

const { width } = Dimensions.get('window');

const Login = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const colorScheme = useColorScheme();
  const appColors = Colors[colorScheme || 'light'];
  const insets = useSafeAreaInsets();


  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Logged in:', user.email);

  
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error.message);
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
            Hey,
          </ThemedText>
          <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
            welcome back
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: appColors.smallText }]}>
            Please login to continue
          </ThemedText>
        </View>

        <View style={styles.formContainer}>
          <View style={[styles.inputContainer, {
            borderColor: appColors.borderColor,
            backgroundColor: colors.card
          }]}>
            <MaterialIcons
              name="email"
              size={20}
              color={appColors.smallText}
              style={styles.icon}
            />
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={[styles.input, { color: colors.text }]}
              placeholder="Enter email"
              placeholderTextColor={appColors.smallText}
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
              value={password}
              onChangeText={setPassword}
              style={[styles.input, { color: colors.text }]}
              placeholder="Password"
              placeholderTextColor={appColors.smallText}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <ThemedText style={[styles.forgotPasswordText, { color: appColors.button }]}>
              Forgot password?
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 30 }]}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: appColors.button }]}
          onPress={handleLogin}
        >
          <ThemedText type="defaultSemiBold" style={styles.buttonText}>
            Login
          </ThemedText>
        </TouchableOpacity>

        <View style={styles.signupTextContainer}>
          <ThemedText style={styles.signupPrompt}>Don't have an account? </ThemedText>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <ThemedText style={[styles.signupLink, { color: appColors.button }]}>
              Sign up
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 12,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
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
  signupTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupPrompt: {
    fontSize: 16,
    color: '#666',
  },
  signupLink: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Login;
