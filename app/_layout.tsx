import { router, SplashScreen, Stack } from 'expo-router';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

SplashScreen.preventAutoHideAsync();

export default function Start() {
  return <RootLayoutNav />
}

function RootLayoutNav() {
  SplashScreen.hideAsync();
  return (
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="Slider" options={{ headerShown: false }} />
        <Stack.Screen name="Auth" options={{ headerShown: false }} />
        <Stack.Screen name="Home" options={{ headerShown: false }} />
      </Stack>
  );
}