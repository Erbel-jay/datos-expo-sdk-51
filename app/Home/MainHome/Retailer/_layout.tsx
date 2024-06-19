import { Stack } from "expo-router";

export default function RetailerLayout() {
    return <Stack initialRouteName="FindRetailerScreen">
        <Stack.Screen name="FindRetailerScreen" options={{headerShown: false}}/>
        <Stack.Screen name="ProductScreen" options={{headerShown: false}}/>
        <Stack.Screen name="RetailerForms" options={{headerShown: false}}/>
    </Stack>
}