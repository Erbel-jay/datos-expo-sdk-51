import { Stack } from "expo-router";

export default function QRCodeLayout() {
    return <Stack initialRouteName="QRCodeScreen">
        <Stack.Screen name="QRCodeScreen" options={{headerShown: false}}/>
    </Stack>
}
