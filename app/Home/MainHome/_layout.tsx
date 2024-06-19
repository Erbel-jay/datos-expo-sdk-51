import { Stack } from "expo-router";

export default function MainHomeLayout() {
    return <Stack initialRouteName="MainHomeScreen">
        <Stack.Screen name="MainHomeScreen" options={{headerShown: false}}/>
        <Stack.Screen name="Retailer" options={{headerShown: false}}/>
    </Stack>
}