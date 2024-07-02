import { Stack } from "expo-router";

export default function OrganizationLayout() {
    return <Stack initialRouteName="FindOrganizationScreen">
        <Stack.Screen name="FindOrganizationScreen" options={{headerShown: false}}/>
        <Stack.Screen name="OrganizationFormsHomeScreen" options={{headerShown: false}}/>
        <Stack.Screen name="OrganizationPersonalInformationFormScreen" options={{headerShown: false}}/>
        <Stack.Screen name="OrganizationFamilyBackgroundFormScreen" options={{headerShown: false}}/>
        <Stack.Screen name="OrganizationFinancialStatusFormScreen" options={{headerShown: false}}/>
        <Stack.Screen name="OrganizationRequirementsFormScreen" options={{headerShown: false}}/>
    </Stack>
}