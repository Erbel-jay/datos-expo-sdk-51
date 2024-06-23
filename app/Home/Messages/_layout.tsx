import { Stack } from "expo-router";

export default function MessagesLayout() {
    return <Stack initialRouteName="MessageScreen">
        <Stack.Screen name="MessageScreen" options={{headerShown: false}}/>
        <Stack.Screen name="MessageContentScreen" options={{headerShown: false}}/>
    </Stack>
}