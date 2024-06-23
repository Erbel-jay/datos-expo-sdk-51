import { Stack } from "expo-router";

export default function RetailersLayout() {
    return <Stack initialRouteName="RetailersScreen">
        <Stack.Screen name="RetailersScreen" options={{headerShown: false}}/>
    </Stack>
}