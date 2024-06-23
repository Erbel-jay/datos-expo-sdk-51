import { Stack } from "expo-router";

export default function MakeAPaymentLayout() {
    return <Stack initialRouteName="RetailersScreen">
        <Stack.Screen name="RetailersScreen" options={{headerShown: false}}/>
        <Stack.Screen name="CustomerDetailsMAPScreen" options={{headerShown: false}}/>
        <Stack.Screen name="PaymentMAPScreen" options={{headerShown: false}}/>
    </Stack>
}