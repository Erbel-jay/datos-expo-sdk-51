import { Stack } from "expo-router";

export default function LoanDetailsLayout() {
    return <Stack initialRouteName="LoanDetailsScreen">
        <Stack.Screen name="LoanDetailsScreen" options={{headerShown: false}}/>
    </Stack>
}