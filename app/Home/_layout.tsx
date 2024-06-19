import { Drawer } from 'expo-router/drawer';
import DrawerContent from './DrawerContent';
import { DrawerActions } from '@react-navigation/native';
import { router } from 'expo-router';
import Icon from "@expo/vector-icons/Feather";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Image
} from 'react-native'

export default function HomeLayout() {
  return (
    <Drawer initialRouteName='MainHome' drawerContent={(props: any) => <DrawerContent {...props}/>}
      screenOptions={({ navigation }: { navigation: any }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: 'red',
          height: 200,
        },
        headerLeft: () => (
          <TouchableOpacity style={[styles.icon, { marginLeft: 20 }]} onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}>
            <Icon
              name="menu"
              color={'#4C95A0'}
              size={26}
            />
          </TouchableOpacity>
        ),

        headerRight: () => (
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity style={[styles.icon, { backgroundColor: 'transparent', marginRight: 10 }]} onPress={() => router.push('Home/Notifications')}>
              <Icon
                name="bell"
                color={'#4C95A0'}
                size={26}
              />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.icon, { marginRight: 20 }]} onPress={() => router.push('Home/Profile')}>
              <Image
                source={require("../../assets/images/test-images/profile.png")}
                style={styles.profile}
              />
            </TouchableOpacity>
          </View>
        ),
      })}
    >
      <Drawer.Screen name="MainHome"  options={{
        drawerIcon: () => <Icon name="home" size={24} color={'#4C95A0'}/>,
        title: 'Home',
        headerTitle: '',
        headerStyle: {
          backgroundColor: '#fff',
          elevation: 0,
          shadowOpacity: 0,
          height: 120
        }
      }} />

      <Drawer.Screen name="Retailers" options={{
        drawerIcon: () => <Icon name="printer" size={24} color={'#4C95A0'}/>,
        title: 'Your Retailers',
        headerTitle: '',
        headerStyle: {
          elevation: 0,
          shadowOpacity: 0,
          height: 120
        }
      }} />

      <Drawer.Screen name="Messages" options={{
        drawerIcon: () => <Icon name="printer" size={24} color={'#4C95A0'}/>,
        headerTitle: '',
        headerStyle: {
          elevation: 0,
          shadowOpacity: 0,
          height: 120
        }
      }} />

      <Drawer.Screen name="AccountBalances" options={{
        drawerIcon: () => <Icon name="printer" size={24} color={'#4C95A0'}/>,
        title: 'Account Balancees',
        headerTitle: '',
        headerStyle: {
          elevation: 0,
          shadowOpacity: 0,
          height: 120
        }
      }} />

      <Drawer.Screen name="MakeAPayment" options={{
        drawerIcon: () => <Icon name="printer" size={24} color={'#4C95A0'}/>,
        title: 'Make a Payment',
        headerTitle: '',
        headerStyle: {
          elevation: 0,
          shadowOpacity: 0,
          height: 120
        }
      }} />

      <Drawer.Screen name="Profile" options={{
        drawerItemStyle: {height: 0},
        headerTitle: '',
        headerStyle: {
          elevation: 0,
          shadowOpacity: 0,
          height: 120
        }
      }} />

      <Drawer.Screen name="Notifications" options={{
        drawerItemStyle: {height: 0},
        headerTitle: '',
        headerStyle: {
          elevation: 0,
          shadowOpacity: 0,
          height: 120
        }
      }} />

      <Drawer.Screen name="DrawerContent" options={{
        drawerItemStyle: {height: 0},
        headerTitle: '',
        headerStyle: {
          elevation: 0,
          shadowOpacity: 0,
          height: 120
        }
      }} />

    </Drawer>
  )
}

const styles = StyleSheet.create({
  icon: {
    backgroundColor: '#1A1C30',
    width: 46,
    height: 46,
    borderRadius: 23,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  profile: {
    resizeMode: 'cover',
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: '#4C95A0'
  }
  
})

