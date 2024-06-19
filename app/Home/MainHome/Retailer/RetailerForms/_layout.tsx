import { Stack } from "expo-router";

export default function RetailerFormsLayout() {
    return <Stack initialRouteName="FormsHomeScreen">
        <Stack.Screen name="FormsHomeScreen" options={{headerShown: false}}/>
        <Stack.Screen name="PersonalInformationFormScreen" options={{headerShown: false}}/>
        <Stack.Screen name="FamilyBackgroundFormScreen" options={{headerShown: false}}/>
        <Stack.Screen name="FinancialStatusFormScreen" options={{headerShown: false}}/>
        <Stack.Screen name="RequirementsFormScreen" options={{headerShown: false}}/>
    </Stack>
}