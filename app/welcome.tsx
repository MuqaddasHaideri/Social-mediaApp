import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');




const Welcome = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const colorScheme = useColorScheme();
  const appColors = Colors[colorScheme || 'light'];
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image
            source={require('@/assets/images/welcome.png')}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.textContainer}>
          <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
            Welcome to SocioNet
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: appColors.smallText }]}>
            Capture moments. Connect with people. Share your story.
          </ThemedText>
        </View>
      </View>


      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 30 }]}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: appColors.button }]}
          onPress={() => router.push('/signup')}
        >
          <ThemedText type="defaultSemiBold" style={styles.buttonText}>
            Get Started
          </ThemedText>
        </TouchableOpacity>

        <View style={styles.loginTextContainer}>
          <ThemedText style={styles.loginPrompt}>Already have an account? </ThemedText>
          <TouchableOpacity
          onPress={() => router.push('/login')}
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

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    marginBottom:20,
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
  },
  textContainer: {
    alignItems: 'center',
    width: '100%',
    marginTop: 20, 
    marginBottom: height * 0.05,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 24,
    fontWeight: '600',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  bottomContainer: {
    
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
    marginTop: 10, 
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
