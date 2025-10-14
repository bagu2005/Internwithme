# 📱 Mobile App Setup - InternWithMe

## 🎯 **Overview**
Transform your InternWithMe web application into a native mobile app for iOS and Android using React Native. This will give you a professional mobile experience that can be published to the App Store and Google Play Store.

## 🏗️ **Mobile App Architecture**

### **Technology Stack**
- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and deployment tool
- **TypeScript**: Type-safe development
- **React Navigation**: Mobile navigation
- **AsyncStorage**: Local data storage
- **React Native Paper**: Material Design components
- **Axios**: HTTP client for API calls

### **App Structure**
```
mobile/
├── App.tsx                 # Main app component
├── src/
│   ├── components/         # Reusable components
│   ├── screens/           # Screen components
│   ├── navigation/        # Navigation setup
│   ├── services/          # API services
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Utility functions
│   └── types/             # TypeScript types
├── assets/                # Images, fonts, etc.
└── app.json              # Expo configuration
```

## 🚀 **Quick Start**

### **1. Install Expo CLI**
```bash
npm install -g @expo/cli
```

### **2. Create Mobile App**
```bash
cd /Users/bhargavramesh/Desktop/internwithme
npx create-expo-app mobile --template typescript
cd mobile
```

### **3. Install Dependencies**
```bash
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install react-native-paper react-native-vector-icons
npm install @react-native-async-storage/async-storage
npm install axios react-hook-form
npm install expo-auth-session expo-crypto
npm install expo-image-picker expo-document-picker
```

### **4. Configure App**
Update `app.json`:
```json
{
  "expo": {
    "name": "InternWithMe",
    "slug": "internwithme",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.internwithme.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.internwithme.app"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

## 📱 **Core Mobile Features**

### **Authentication Screens**
- **Login Screen**: Email/password and Google OAuth
- **Register Screen**: User registration with role selection
- **Forgot Password**: Password reset flow
- **OTP Verification**: Email verification

### **Main App Screens**
- **Home Screen**: Browse internships with search and filters
- **Internship Detail**: View full internship details
- **Profile Screen**: User profile management
- **Applications Screen**: Track application status
- **Company Dashboard**: For company users
- **Subscription Screen**: Manage subscription plans

### **Navigation Structure**
```
Tab Navigator (Bottom Tabs)
├── Home (Internships)
├── Search
├── Applications
├── Profile
└── More (Settings, Subscription, etc.)
```

## 🔧 **Implementation Steps**

### **Step 1: Setup Navigation**
```typescript
// App.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Search" component={SearchScreen} />
        <Tab.Screen name="Applications" component={ApplicationsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
```

### **Step 2: Create API Service**
```typescript
// src/services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://your-backend-domain.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### **Step 3: Create Auth Context**
```typescript
// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        // Verify token and load user data
        const response = await api.get('/auth/me');
        setUser(response.data.data);
      }
    } catch (error) {
      await AsyncStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user: userData } = response.data.data;
    
    await AsyncStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### **Step 4: Create Main Screens**
```typescript
// src/screens/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import api from '../services/api';

interface Internship {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  isRemote: boolean;
  isPaid: boolean;
}

export default function HomeScreen() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInternships();
  }, []);

  const loadInternships = async () => {
    try {
      const response = await api.get('/internships');
      setInternships(response.data.data);
    } catch (error) {
      console.error('Error loading internships:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderInternship = ({ item }: { item: Internship }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{item.title}</Title>
        <Paragraph>{item.company}</Paragraph>
        <Paragraph>{item.location}</Paragraph>
        <Paragraph numberOfLines={3}>{item.description}</Paragraph>
      </Card.Content>
      <Card.Actions>
        <Button mode="contained">Apply</Button>
        <Button>View Details</Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={internships}
        renderItem={renderInternship}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={loadInternships}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
});
```

## 🎨 **UI/UX Design**

### **Design System**
- **Primary Color**: #2563eb (Blue)
- **Secondary Color**: #64748b (Gray)
- **Success Color**: #10b981 (Green)
- **Error Color**: #ef4444 (Red)
- **Background**: #f8fafc (Light Gray)

### **Component Library**
- **React Native Paper**: Material Design components
- **Custom Components**: Branded components for consistency
- **Icons**: React Native Vector Icons
- **Typography**: Consistent font sizes and weights

### **Responsive Design**
- **Phone**: Optimized for 375px - 414px width
- **Tablet**: Support for larger screens
- **Orientation**: Portrait and landscape support

## 📱 **Mobile-Specific Features**

### **Push Notifications**
```typescript
// Install expo-notifications
npm install expo-notifications

// Configure notifications
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
```

### **File Upload**
```typescript
// Install expo-document-picker
npm install expo-document-picker

// Resume upload functionality
import * as DocumentPicker from 'expo-document-picker';

const pickDocument = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/pdf',
  });
  
  if (!result.canceled) {
    // Upload file to server
    const formData = new FormData();
    formData.append('file', result.assets[0]);
    
    await api.post('/upload/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
};
```

### **Offline Support**
```typescript
// Install @react-native-async-storage/async-storage
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache data for offline access
const cacheInternships = async (internships: Internship[]) => {
  await AsyncStorage.setItem('cached_internships', JSON.stringify(internships));
};

const getCachedInternships = async (): Promise<Internship[]> => {
  const cached = await AsyncStorage.getItem('cached_internships');
  return cached ? JSON.parse(cached) : [];
};
```

## 🚀 **Deployment Options**

### **Option 1: Expo Application Services (EAS)**
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

### **Option 2: React Native CLI**
```bash
# Generate native projects
npx react-native init InternWithMeMobile

# Run on iOS
npx react-native run-ios

# Run on Android
npx react-native run-android
```

### **Option 3: Expo Go (Development)**
```bash
# Start development server
npx expo start

# Scan QR code with Expo Go app
# Test on real devices instantly
```

## 📊 **App Store Optimization**

### **App Store Listing**
- **App Name**: InternWithMe - Find Your Dream Internship
- **Subtitle**: Connect with top companies and land your perfect internship
- **Keywords**: internship, job, career, student, employment
- **Description**: Professional internship platform for students and companies

### **Screenshots**
- Home screen with internship listings
- Profile management
- Application tracking
- Company dashboard
- Subscription plans

### **App Store Categories**
- **Primary**: Business
- **Secondary**: Education

## 🔐 **Mobile Security**

### **Biometric Authentication**
```typescript
// Install expo-local-authentication
npm install expo-local-authentication

import * as LocalAuthentication from 'expo-local-authentication';

const authenticateWithBiometrics = async () => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  
  if (hasHardware && isEnrolled) {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access InternWithMe',
    });
    return result.success;
  }
  return false;
};
```

### **Secure Storage**
```typescript
// Use Expo SecureStore for sensitive data
import * as SecureStore from 'expo-secure-store';

const storeToken = async (token: string) => {
  await SecureStore.setItemAsync('auth_token', token);
};

const getToken = async () => {
  return await SecureStore.getItemAsync('auth_token');
};
```

## 📈 **Analytics & Monitoring**

### **Crash Reporting**
```typescript
// Install expo-crashlytics
npm install expo-crashlytics

import * as Crashlytics from 'expo-crashlytics';

// Initialize crash reporting
Crashlytics.initialize();
```

### **User Analytics**
```typescript
// Install expo-analytics
npm install expo-analytics

import { Analytics } from 'expo-analytics';

const analytics = new Analytics('YOUR_ANALYTICS_ID');

// Track user actions
analytics.event('internship_viewed', {
  internship_id: '123',
  company: 'Tech Corp',
});
```

## 🎯 **Development Workflow**

### **1. Setup Development Environment**
```bash
# Install dependencies
npm install

# Start Metro bundler
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android
```

### **2. Testing**
```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react-native

# Run tests
npm test

# Run E2E tests
npm run test:e2e
```

### **3. Building**
```bash
# Build for development
eas build --profile development

# Build for production
eas build --profile production
```

## 🎉 **Mobile App Features**

### **Core Features**
- ✅ **User Authentication**: Login, register, Google OAuth
- ✅ **Internship Browsing**: Search, filter, view details
- ✅ **Application Management**: Apply, track status
- ✅ **Profile Management**: Edit profile, upload resume
- ✅ **Company Dashboard**: Manage listings (for companies)
- ✅ **Subscription Management**: View and upgrade plans
- ✅ **Push Notifications**: Real-time updates
- ✅ **Offline Support**: Cache data for offline access

### **Mobile-Specific Features**
- ✅ **Biometric Authentication**: Fingerprint/Face ID
- ✅ **Camera Integration**: Profile photo capture
- ✅ **File Upload**: Resume and document upload
- ✅ **Location Services**: Find nearby internships
- ✅ **Share Functionality**: Share internships
- ✅ **Dark Mode**: Theme switching
- ✅ **Accessibility**: Screen reader support

## 🚀 **Ready to Build!**

Your InternWithMe mobile app will be:
- ✅ **Cross-Platform**: iOS and Android
- ✅ **Professional**: App Store ready
- ✅ **Feature-Complete**: All web features included
- ✅ **Native Performance**: Smooth user experience
- ✅ **Secure**: Biometric auth and secure storage
- ✅ **Scalable**: Handles growth efficiently

**Next Steps:**
1. Run the mobile setup commands
2. Implement core screens and navigation
3. Connect to your existing backend API
4. Test on real devices
5. Build and deploy to app stores

**Your InternWithMe mobile app will compete with LinkedIn and Indeed!** 📱🚀
