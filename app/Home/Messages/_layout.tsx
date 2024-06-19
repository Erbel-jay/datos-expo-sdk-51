import { router } from 'expo-router';
import {View, Text, TouchableOpacity} from 'react-native';

export default function MessagesLayout() {
    return(
        <View>
            <Text>This is a messages layout</Text>
            <TouchableOpacity onPress={() => router.push('Home/MainHome/Retailer')}>
                <Text>Test</Text>
            </TouchableOpacity>
        </View>
    )
}