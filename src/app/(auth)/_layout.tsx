import { useAuth } from "@/contexts/AuthContext";
import { Redirect, Stack } from "expo-router";

export default function AuthLayout() {
  const { isAuthenticated, isLoading, isAuthRedirectPaused } = useAuth();

  if (isLoading) return null;
  if (isAuthenticated && !isAuthRedirectPaused) return <Redirect href="/(tabs)" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
