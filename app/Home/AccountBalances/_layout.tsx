import { Stack } from "expo-router";

export default function AccountBalancesLayout() {
    return <Stack initialRouteName="AccountBalancesScreen">
        <Stack.Screen name="AccountBalancesScreen" options={{headerShown: false}}/>
        <Stack.Screen name="AccountBalancesDetailsScreen" options={{headerShown: false}}/>
        <Stack.Screen name="CustomerDetailsScreen" options={{headerShown: false}}/>
        <Stack.Screen name="PaymentScreen" options={{headerShown: false}}/>
    </Stack>
}