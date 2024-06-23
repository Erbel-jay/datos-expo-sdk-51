import { Stack } from "expo-router";

export default function ProfileLayout() {
    return <Stack initialRouteName="ProfileScreen">
        <Stack.Screen name="ProfileScreen" options={{headerShown: false}}/>
    </Stack>
}