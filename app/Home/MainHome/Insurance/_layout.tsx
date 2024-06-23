import { Stack } from "expo-router";

export default function InsuranceLayout() {
    return <Stack initialRouteName="InsuranceFormsHomeScreen">
        <Stack.Screen name="InsuranceFormsHomeScreen" options={{headerShown: false}}/>
        <Stack.Screen name="InsurancePersonalInformationFormScreen" options={{headerShown: false}}/>
        <Stack.Screen name="InsuranceFinancialStatusFormScreen" options={{headerShown: false}}/>
        <Stack.Screen name="InsuranceFamilyBackgroundFormScreen" options={{headerShown: false}}/>
        <Stack.Screen name="InsuranceRequirementsFormScreen" options={{headerShown: false}}/>
    </Stack>
}