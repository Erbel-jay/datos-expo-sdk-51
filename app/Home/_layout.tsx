import * as React from 'react';
import { Drawer } from 'expo-router/drawer';
import DrawerContent from './DrawerContent';
import { DrawerActions } from '@react-navigation/native';
import { router } from 'expo-router';
import Icon from "@expo/vector-icons/Feather";
import IconMaterial from '@expo/vector-icons/build/MaterialCommunityIcons';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Image
} from 'react-native'
import { datosBlack, datosDarkGray, datosOrange } from '../../assets/styles/colorUsed';
const {
  _retrieveData,
} = require("../../helpers/global-function");

export default class extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  state: any = {
    userData: null,
  };

  async componentDidMount() {
    let current_user_data: any = await _retrieveData("current_user");
    let current_user = JSON.parse(current_user_data);
    this.setState({
      userData: current_user,
    });
    // const colorScheme = useColorScheme();
  }
  
  render() {
    return (
      <Drawer initialRouteName='MainHome' drawerContent={(props: any) => <DrawerContent {...props}/>}
        screenOptions={({ navigation }: { navigation: any }) => ({
          drawerActiveTintColor: datosOrange,
          headerShown: true,
          headerStyle: {
            backgroundColor: 'red',
            height: 200,
          },
          headerLeft: () => (
            <TouchableOpacity style={[styles.icon, { marginLeft: 20 }]} onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}>
              <Icon
                name="menu"
                color={datosBlack}
                size={26}
              />
            </TouchableOpacity>
          ),
  
          headerRight: () => (
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity style={[styles.icon, { backgroundColor: 'transparent', marginRight: 10 }]} onPress={() => router.push('Home/QRCode')}>
                <IconMaterial
                  name="qrcode"
                  color={datosOrange}
                  size={26}
                />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.icon, { marginRight: 20 }]} onPress={() => router.push('Home/Profile')}>
                <Image
                  source={this.state.userData ? { uri: this.state.userData.personalAttachment.profile } : require("../../assets/images/test-images/profile.png")}
                  style={styles.profile}
                />
              </TouchableOpacity>
            </View>
          ),
        })}
      >
        <Drawer.Screen name="MainHome"  options={{
          drawerIcon: () => <Icon name="home" size={24} color={datosDarkGray}/>,
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
          drawerIcon: () => <Icon name="layers" size={24} color={datosDarkGray}/>,
          title: 'Your Retailers',
          headerTitle: '',
          headerStyle: {
            elevation: 0,
            shadowOpacity: 0,
            height: 120
          }
        }} />
  
        <Drawer.Screen name="Messages" options={{
          drawerIcon: () => <Icon name="mail" size={24} color={datosDarkGray}/>,
          headerTitle: '',
          headerStyle: {
            elevation: 0,
            shadowOpacity: 0,
            height: 120
          }
        }} />
  
        <Drawer.Screen name="AccountBalances" options={{
          drawerIcon: () => <Icon name="file-text" size={24} color={datosDarkGray}/>,
          title: 'Account Balancees',
          headerTitle: '',
          headerStyle: {
            elevation: 0,
            shadowOpacity: 0,
            height: 120
          }
        }} />
  
        <Drawer.Screen name="LoanDetails" options={{
          drawerIcon: () => <Icon name="help-circle" size={24} color={datosDarkGray}/>,
          title: 'Loan Details',
          headerTitle: '',
          headerStyle: {
            elevation: 0,
            shadowOpacity: 0,
            height: 120
          }
        }} />
  
        <Drawer.Screen name="MakeAPayment" options={{
          drawerIcon: () => <Icon name="dollar-sign" size={24} color={datosDarkGray}/>,
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
  
        <Drawer.Screen name="QRCode" options={{
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
  
}

const styles = StyleSheet.create({
  icon: {
    backgroundColor: 'transparent',
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
    borderColor: datosOrange
  }
  
})

