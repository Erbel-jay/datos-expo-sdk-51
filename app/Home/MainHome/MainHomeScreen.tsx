import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Text,
  View
} from 'react-native';
import { InformationCard, NoUserHomeScreen, TwoTab, EaMessageBox } from '../../../components/cards';
import { globalStyle } from "../../../assets/styles/globalStyle";
const { _retrieveData, _storeData } = require("../../../helpers/global-function");
import Config from "../../../constants/Config";
import axios from 'axios';
import moment from "moment";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { datosBlack, datosLightGray, datosOrange } from '../../../assets/styles/colorUsed';
import { router, useFocusEffect } from 'expo-router';

function CallProcessUser({ processUser }) {
  useFocusEffect(
    React.useCallback(() => {
      processUser()
    }, [])
  );

  return null;
}


export default class MainHomeScreen extends React.Component<any, any> {
  focusListener: any;
  constructor(props: any) {
    super(props)
  }

  state: any = {
    current_user_object_id: '',
    firstName: '',
    data: null,
    listOfLoans: [],
    loanDisplayInfo: null,
    isAllLoansForwarded: true,
    _notificationSubscription: null,
    isUserLastLoanisUserCancelled: false,
    loansLength: 0,

    noUser: false,
    today: moment().format('MMM DD, YYYY'),
    isTabOne: true,
    retailersMessages: []
  }

  async componentDidMount() {

    this.registerForNotification();
    
    let current_user_data: any = await _retrieveData('current_user');
    if(current_user_data){
      await _storeData('NoUser', 'false')
    }
    
    await _retrieveData('NoUser')
    .then(async (result: any) => {
      console.log('result ->', result);
      if(result == 'true'){
        // Alert.alert(`No User, This is a guest account --- ${result}`)
        this.setState({
          noUser: true
        })
      }else{
        // Alert.alert('THERE is a User')
        this.setState({
          noUser: false
        })
        // this.processUser()
      }
    })
  }

  processUser = async () => {
    console.log("🚀 ~ MainHomeScreen ~ processUser")
    const { navigation } = this.props;
    let current_user_data: any = await _retrieveData('current_user');
    let current_user = JSON.parse(current_user_data);
    if (current_user) {
      this.setState({
        current_user_object_id: current_user.id,
        firstName: current_user.personalInformation.firstName
      }, () => {
        console.log('----_ID---:', this.state.current_user_object_id);
        this.getAllUserData();
        // this.registerToken();
        this.getLatestUnreadMessageForCustomer(this.state.current_user_object_id);
      })
    }
    
    setInterval(() => {
      this.getAllUserData(),
      this.getLatestUnreadMessageForCustomer(this.state.current_user_object_id);
    }, 30000)
  }

  registerForNotification = () => {
    try{
      this.registerForPushNotificationsAsync();
      this.setState({
        _notificationSubscription: Notifications.addNotificationReceivedListener(
          this._handleNotification
        )
      })
    }catch(err){
      console.log('registerForNotification Error: ', err);
    }
    
  }

  _handleNotification = async (notification: any) => {
    if (Constants.isDevice) {
      if (
        (await notification.origin) === "selected" &&
        notification.actionId === null
      ) {
        Notifications.dismissAllNotificationsAsync();
        router.push({pathname: "NotifDetails", 
        params: 
        {
          itemTitle: notification.data.title,
          itemDate: notification.data.dateUploaded,
          itemMsgs: notification.data.body,
        }});
        this.setState({ notification: notification });
        console.log("notificaction1", notification);
      } else if ((await notification.origin) === "recieved") {
        console.log("notificaction2", notification);
      }
    }
  };

  componentWillUnmount = () => {
    this.state._notificationSubscription && this.state._notificationSubscription.remove();
  };


  registerForPushNotificationsAsync = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    if (Constants.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      console.log("🚀 ~ MainHomeScreen ~ registerForPushNotificationsAsync= ~ finalStatus:", finalStatus)
      console.log("🚀 ~ MainHomeScreen ~ registerForPushNotificationsAsync= ~ existingStatus:", existingStatus)
      
      if (existingStatus !== 'granted') {
        console.log('requesting permission....');
        const { status } = await Notifications.requestPermissionsAsync();
        console.log("🚀 ~ MainHomeScreen ~ registerForPushNotificationsAsync= ~ status:", status)
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      this.setState({ expoPushToken: token });
      this.registerToken();
    } else {
      alert('Must use physical device for Push Notifications');
    }
  };

  registerToken = async () => {
    let token = await Notifications.getExpoPushTokenAsync();
    console.log('token', token);
    let res = await axios.post(Config.api + `/user/addToken/${this.state.current_user_object_id}`, { token: token.data })
      .then((res: any) => {
      })
  }


  getAllUserData = async () => {
    console.log('getAllUserData has been called');
    axios.get(Config.api + `/user/getUser/${this.state.current_user_object_id}`)
      .then((res: any) => {
        // console.log("res.data.result", res.data.result);
        // let index = res.data.result.loans.length - 1
        this.setState({
          data: res.data.result,
          // loanDisplayInfo: res.data.result.loans.length > 0 ? res.data.result.loans[index] : null,
        })
      })
      .catch(err => {
        console.log("getAllUserData ERROR:", err)
      })
  }
 
  getLatestUnreadMessageForCustomer = async (user_id: any) => {
    try {
      axios.get(`${Config.api}/messages/getLatestUnreadMessageForCustomer/${user_id}`)
        .then(res => {
          const uniqueArray = res.data.result.filter((object: any, index: any, arr: any) => {
            const firstIndex = arr.findIndex((o: any) => o.retailer._id === object.retailer._id);
            return index === firstIndex;
          });

          this.setState({
            retailersMessages: uniqueArray
          }, () => {
            // this.setState({
            //   isLoaded: true
            // })
            this.state.retailersMessages.map((data: any) => {
              // console.log('RETAILERS MESSAGES: ', data.retailer.logo, data.message);
            })
          })
        })
        .catch(err => {
          console.log("getMessagesSentToCustmer err: ", err);
        })
    } catch (err) {
      console.log(err);
    }
  }


  

  render() {

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView>
          <CallProcessUser processUser={this.processUser} />
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              {
                this.state.noUser == true?
                  <NoUserHomeScreen navigation={this.props.navigation} today={this.state.today}/>
                :
                  this.state.data
                    ?
                    <View>
                      <View style={globalStyle.wrapper}>
                        <Text style={styles.welcomeText}>Welcome {this.state.firstName}</Text>
      
                        <View style={styles.boxHolder}>

                          <View style={styles.cardHolder}>
                            <InformationCard
                              icon="company-1"
                              iconBgColor="#304057"
                              cardName="Connect to Retailer"
                              onPress={() => router.push("Home/MainHome/Retailer")}
                            />

                            <InformationCard
                              icon="Time-Insurance-1"
                              iconBgColor="#DA5F5A"
                              cardName="Get Free Insurance"
                              onPress={() => router.push('Home/MainHome/Insurance')}
                            />

                            <InformationCard
                              icon="organization-1"
                              iconBgColor="#E2814E"
                              cardName="Organization"
                              onPress={() => router.push('Home/MainHome/Organization')}
                            />
                          
                          </View>

                          <View style={styles.cardHolder}>
                            <InformationCard
                              icon="accounting-1"
                              iconBgColor="#F3B103"
                              cardName="Account Balances"
                              onPress={() => router.push('Home/AccountBalances')}
                            />

                            <InformationCard
                              icon="chat-1"
                              iconBgColor="#E95E0B"
                              cardName="Messages"
                              onPress={() => router.push('Home/Messages')}
                            />

                            <InformationCard
                              icon="online-payment-1"
                              iconBgColor="#2E2E2E"
                              cardName="Make a Payment"
                              onPress={() => router.push('Home/MakeAPayment')}
                            />
                            
                          </View>
                          
                        </View>

                        <View style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginVertical: 10,
                          borderTopWidth: 0.5,
                          borderColor: '#D9D9D9',
                          paddingTop: 30
                        }}>
                          <Text style={{fontFamily: 'CalibriBold', fontSize: 15}}>Today, {this.state.today}</Text>
                        </View>

                        <View style={styles.notificationContainer}>
                          <View style={{flexDirection: 'row',justifyContent: 'space-between', marginBottom: 10, paddingHorizontal: 10}}>
                            <Text style={{fontFamily: 'CalibriBold', fontSize: 19, color: datosBlack}}>Notifications</Text>
                            <TouchableOpacity onPress={() => router.push('Home/Messages')}>
                              <Text style={{fontFamily: 'CalibriBold', fontSize: 19, color: datosOrange}}>See all</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                      
                      {
                        this.state.retailersMessages.length > 0 ?
                          this.state.retailersMessages.map((data: any,i: number) => {
                            return <EaMessageBox key={i} data={data} navigation={this.props.navigation} />
                          })
                        : <Text style={{textAlign: 'center'}}>No Messages yet.</Text>
                      }
                    </View>
                    :
                    <View style={{flex: 1, justifyContent:'center', alignItems: 'center'}}>
                      <ActivityIndicator size="small" color="#70788c" />
                      <Text style={globalStyle.commonText}>Loading Data...</Text>
                    </View>
              }
              
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  welcomeText: {
    fontSize: 20,
    color: '#000',
    fontFamily: 'CalibriBold',
    marginBottom: 15,
    marginLeft: 10,
    textAlign: 'center'
  },
  boxHolder: {
    padding: 20,
    borderRadius: 30
  },
  boxTitle: {
    fontFamily: 'CalibriBold',
    fontSize: 18,
    color: datosBlack,
    marginBottom: 15
  },
  cardHolder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  submitText: {
    fontSize: 17,
    fontFamily: 'CalibriBold',
    color: '#fff'
  },
  info: {
    marginTop: 10,
    padding: 20,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  infoText: {
    fontSize: 12,
    width: '83%',
    color: datosLightGray
  },
  notificationContainer: {
    marginTop: 20,
  },
});
