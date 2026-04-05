import "@/global.css";
import { Link } from "expo-router";
import { Text, View } from "react-native";
 
export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-xl font-bold text-success">
        Welcome to Nativewind!
      </Text>
      <Link href="/onboarding" className="mt-4 bg-primary text-white p-4">Go to Onboarding</Link>
    
      <Link href="/(auth)/sign-in" className="mt-4 bg-primary text-white p-4">Go to Sign In</Link>
      <Link href="/(auth)/sign-up" className="mt-4 bg-primary text-white p-4">Go to Sign Up</Link>
    
    <Link href={{
      pathname: "/(tabs)/subscriptions/[id]",
      params: { id: "1" },
    }} className="mt-4 bg-primary text-white p-4">Go to Subscription Spotify</Link>
    <Link href={{
      pathname: "/(tabs)/subscriptions/[id]",
      params: { id: "2" },
    }} className="mt-4 bg-primary text-white p-4">Go to Subscription Netflix</Link>
    <Link href={{
      pathname: "/(tabs)/subscriptions/[id]",
      params: { id: "3" },
    }} className="mt-4 bg-primary text-white p-4">Go to Subscription Disney+</Link>
    </View>
  );
}