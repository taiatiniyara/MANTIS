import { Stack } from "expo-router";
import React from "react";

export default function InfringementStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Record Infringement",
        }}
      />
      <Stack.Screen
        name="camera"
        options={{
          title: "Capture Evidence",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="review"
        options={{
          title: "Review & Submit",
        }}
      />
    </Stack>
  );
}
