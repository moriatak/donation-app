import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#ffffff' }
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="home" />
      <Stack.Screen name="target-selection" />
      <Stack.Screen name="amount" />
      <Stack.Screen name="phone-verification" />
      <Stack.Screen name="code-verification" />
      <Stack.Screen name="details" />
      <Stack.Screen name="payment-method" />
      <Stack.Screen name="confirmation" />
      <Stack.Screen name="bit-payment" />
      <Stack.Screen name="credit-card-manual" />
      <Stack.Screen name="processing" />
      <Stack.Screen name="success" />
      <Stack.Screen name="error" />
    </Stack>
  );
}