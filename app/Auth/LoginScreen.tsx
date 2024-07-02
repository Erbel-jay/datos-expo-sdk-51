import * as React from 'react';
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  TouchableOpacity,
  Image,
  Modal,
  TouchableHighlight,
  TextInput,
  Text, 
  View,
  ScrollView
} from "react-native";
// import { ScrollView } from "react-native-gesture-handler";
import { SocialLogin, SocialLoginIOS, GuestBtn } from "../../components/Buttons";
// import firebase from "firebase"
import { AppInput } from "../../components/Inputs";
import Config from "../../constants/Config";
import axios from "axios";
// import * as Facebook from "expo-facebook";
// import * as GoogleAppAuth from 'expo-google-app-auth';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { globalStyle } from '../../assets/styles/globalStyle';
import { LinearGradient } from 'expo-linear-gradient';
import { Checkbox } from 'react-native-paper';
import Icon from '@expo/vector-icons/build/Feather';
// @ts-ignore
import { vw, vh, vmin, vmax } from 'react-native-expo-viewport-units';
import * as Linking from 'expo-linking';
import * as AppleAuthentication from 'expo-apple-authentication';
// import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import { datosBlack, datosOrange, datosRed, datosWhiteShade } from '../../assets/styles/colorUsed';
import { router, Link } from 'expo-router';

const { _storeData, _retrieveData, getCurrentUser, _mergeData, _removeData } = require("../../helpers/global-function");
WebBrowser.maybeCompleteAuthSession();

const useLoginGoogle = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: '1003614269676-djcorc1j7pi98an1b810at4nngimbfb5.apps.googleusercontent.com',
    androidClientId: '1003614269676-f3a5l9hvi2cf1geqgu468a3kovookkp0.apps.googleusercontent.com',
    webClientId: '1003614269676-s9tiv7gg5uekospcgvna1fhf25jfn00c.apps.googleusercontent.com',
  });

  React.useEffect(() => {
    // alert(`Use Effect is called ${response?.type}`);
    if (response?.type === 'success') {
      getUserData(response.authentication?.accessToken)//this is not called in standalone build
    }
  }, [response]);

  return {promptAsync, disbaled: !request};
};

async function getUserData(googleAccessToken: any, ) {
  try{
    // alert("getUserData is called")
    await fetch(`https://www.googleapis.com/userinfo/v2/me`, {
      headers: {Authorization: `Bearer ${googleAccessToken}`}
    }).then((data) => {
      data.json().then(async (d) => {
        new LoginScreen(null).getGoogleAccountDetails(d)
      })
    })
  }catch(err){
    console.log("Error:", err);
  }
}

const LoginGoogle = () => {
  const { promptAsync, disbaled } = useLoginGoogle();
  return (
      <SocialLoginIOS
        icon={'google'}
        text="Sign in with Google"
        color="#fff"
        disabled={disbaled}
        onPress={() => promptAsync({showInRecents: true})}
      />
  );
};


export default class LoginScreen extends React.Component<any, any> {
  constructor(props: any) {
    super(props)
  }

  state: any = {
    userDetails: null,
    isAuthenticatated: false,
    username: '',
    password: '',
    securePassword: true,

    rememberMe: true,
    modalVisible: false,
    appleModalVisible: false,

    isSwitchAccount: false,
    usersList: [],
    lastUser: null,

    passwordSecure: true,
    isFacebookSignInTriggered: false
  }
  async componentDidMount() {
    this.getLastUserLoggedIn()
    this.getUserList();
    let user = await getCurrentUser()
    if (user !== undefined) {
      let data = JSON.parse(user);
    }
    await _removeData("remember_user")
  }

  getLastUserLoggedIn = async () => {
    console.log('getLastUserLoggedIn was called');
    let current_user_data: any = await _retrieveData('current_user');
    let current_user = JSON.parse(current_user_data);
    console.log("🚀 ~ LoginScreen ~ getLastUserLoggedIn= ~ current_user:", current_user)
    if (current_user) {
      console.log('there is still a current user');
      router.push("Home")
    } else {
      console.log('NO current user');
      let last_user = await _retrieveData('last_user_loggedin');
      if (last_user == undefined) {
        //---
      } else {
        this.setState({
          lastUser: JSON.parse(last_user),
        })
        setTimeout(() => {
          this.setState({
            modalVisible: true
          })
        }, 1500);
      }
    }
  }

  getUserList = async () => {
    let user_list = await _retrieveData('user_list');
    if (user_list == undefined) {
      console.log("user list is still undefined!");
    } else {
      // console.log("user_list", JSON.parse(user_list))
      // let parsed_array: any[] = []
      // let parsed_user_list = JSON.parse(user_list)
      // for(let i = 0; i < parsed_user_list.length; i++){
      //   let parsed = JSON.parse(parsed_user_list[i])
      //   parsed_array.push(parsed)
      // }
      this.setState({
        usersList: JSON.parse(user_list)
      })
    }
  }

  


  checkIfUserExistOnList = (usersArray: any[], current_user_data: any) => {
    for (let i = 0; i < usersArray.length; i++) {
      if (usersArray[i]._id === current_user_data._id) {
        return true;
      }
    }

    return false
  }

  storeData = async (data: any) => {
    try {
      if (data.user) {
        await _storeData('last_user_loggedin', JSON.stringify(data.user));
        await _storeData('current_user', JSON.stringify(data.user));
        await _storeData('token', JSON.stringify(data.token));
      } else {
        await _storeData('last_user_loggedin', JSON.stringify(data));
        await _storeData('current_user', JSON.stringify(data));
      }

      let current_user_list: any[] = []
      let user_list_data = await _retrieveData('user_list');
      let user_list = JSON.parse(user_list_data || '[]');
      if (user_list.length == 0) {
        console.log("user list is undefined");
        let user = await getCurrentUser()
        if (user !== undefined) {
          let current_user_data = JSON.parse(user);
          if(current_user_data.hasOwnProperty('accountInformation')){
            current_user_data.accountInformation.password = this.state.password
          }
          current_user_list.push(current_user_data);
          if (this.state.rememberMe == true) {
            await _storeData('user_list', JSON.stringify(current_user_list))
          }
        }
      } else {
        let user = await getCurrentUser()
        if (user !== undefined) {
          let current_user_data = JSON.parse(user);
          if(current_user_data.hasOwnProperty('accountInformation')){
            console.log('inside here');
            current_user_data.accountInformation.password = this.state.password
          }
          let user_list_data = await _retrieveData('user_list');
          let user_list = JSON.parse(user_list_data)

          let usersArray: any[] = []
          usersArray = user_list
          for (let i = 0; i < usersArray.length; i++) {
            if (current_user_data._id == usersArray[i]._id) {
              console.log("MATCH!");
              if(current_user_data.hasOwnProperty('accountInformation')){
                if (current_user_data.accountInformation.password == usersArray[i].accountInformation.password) {
                  console.log("PASSWORD MATCH!");
                } else {
                  usersArray.splice(i, 1, current_user_data);
                  console.log("REMOVED AND PUSHED!");
                }
              }
            }
          }

          if (this.checkIfUserExistOnList(usersArray, current_user_data) == false) {
            console.log("not on the array");
            usersArray.push(current_user_data)
          } else {
            console.log("on the array");
          }

          if (this.state.rememberMe == true) {
            await _storeData('user_list', JSON.stringify(usersArray))
          }

        }
      }

      await _storeData('NoUser', 'false')
      router.push("Home")
    } catch (err) {
      console.log('storeData Error: ', err);
    }

  }

  getUserData = async () => {
    try {
      let header = await _retrieveData('token');
      let user = await axios.get(Config.api + `/getuser`, header);
      if (user.data.status == "success") {
        if (user.data.result !== null) {

        }
      }
    } catch (err) {
      console.log("err", err);
    }
  }

  signin = async () => {
    try {
      // if(this.state.unsername == "" && this.state.password == ""){
      //   return Alert.alert("Failed", "Please fill in username and password");
      // }

      let creds = {
        username: this.state.username,
        password: this.state.password
      }
      console.log("creds", creds);
      let res: any = await axios.post(Config.api + `/signin`, creds);
      if (res.data.status == "success") {
        if (res.data.result) {
          res.data.result.user.accountInformation.password = this.state.password
          this.storeData(res.data.result)
        }
      } else {
        Alert.alert("Failed", "No user found, please review your credentials.");
      }
    } catch (err: any) {
      Alert.alert("Info", err.message);
    }
  }

  continueSignin = async () => {
    try {
      let creds = {
        username: this.state.lastUser?.accountInformation.username,
        password: this.state.lastUser?.accountInformation.password !== "" ? this.state.lastUser?.accountInformation.password : this.state.password
      }
      console.log("creds continue", creds);
      let res: any = await axios.post(Config.api + `/signin`, creds);
      if (res.data.status == "success") {
        if (res.data.result) {
          if (this.state.password == "") {
            res.data.result.user.accountInformation.password = this.state.lastUser.accountInformation.password
          } else {
            res.data.result.user.accountInformation.password = this.state.password
          }
          this.storeData(res.data.result)
          this.setState({
            modalVisible: false
          })
        }
      } else {
        Alert.alert("Failed", "Your session is Expired Please Log in again.");
      }
    } catch (err: any) {
      Alert.alert("Info", err.message);
    }
  }


  lastSocialIDSignIn = async () => { 
    console.log("this.state.lastUser", this.state.lastUser);
    if(this.state.lastUser && this.state.lastUser.socialID !== null){
      console.log("SOCIALID", this.state.lastUser.socialID);
      let socialID = this.state.lastUser.socialID
      if(socialID.search('appleID') == -1){
        this.signInWithAppleAsync();
      }else{
        this.storeData(this.state.lastUser);
        this.setState({
          modalVisible: false
        })
      }
    }else{
      this.signInWithAppleAsync();
    }
  }

  facebookSignin = async () => {
    this.setState({isFacebookSignInTriggered: true})
    return console.log('currently not working');
    // try {
    //   await Facebook.initializeAsync({
    //     appId: '225308005932859',
    //   });
    //   const {
    //     type,
    //     token,
    //     expirationDate,
    //     permissions,
    //     declinedPermissions,
    //   }: any = await Facebook.logInWithReadPermissionsAsync({
    //     permissions: ['public_profile'],
    //   });
    //   if (type === 'success') {
    //     const response = await fetch(`https://graph.facebook.com/me?access_token=${token}&fields=id,name,email,picture.height(500)`);
    //     let facebookResult = await response.json()
    //     console.log('facebookResult', facebookResult);
    //     let res: any = await axios.get(Config.api + `/getSocialData/${facebookResult.id}`);
    //     if (res.data.status == "success") {
    //       if (res.data.result !== null) {
    //         this.storeData(res.data.result);
    //         this.setState({
    //           modalVisible: false
    //         })
    //       } else {
    //         this.props.navigation.navigate('SignupScreen', { social_id: facebookResult.id })
    //         this.setState({
    //           modalVisible: false
    //         })
    //       }
    //     }
    //   } else {
    //     // type === 'cancel'
    //   }
    // } catch ({ message }) {
    //   alert(`Facebook Login Error: ${message}`);
    // }
  }

  // _fbSignIn = async () => {
  //   const result = await LoginManager.logInWithPermissions(['public_profile']);
  //   if(result.isCancelled){
  //     throw new Error('User cancelled login');
  //   }
  //   const data = await AccessToken.getCurrentAccessToken();
  //   if(!data){
  //     throw new Error('Somthing went wrong obtaining access token');
  //   }

  //   const response = await fetch(`https://graph.facebook.com/me?access_token=${data.accessToken}&fields=id,name,email,picture.height(500)`);
  //   let facebookResult = await response.json()
  //   console.log("facebookResult", facebookResult);
  //   let res: any = await axios.get(Config.api + `/getSocialData/${facebookResult.id}`);
  //   if (res.data.status == "success") {
  //     if (res.data.result !== null) {
  //       this.storeData(res.data.result);
  //       this.setState({
  //         modalVisible: false
  //       })
  //     } else {
  //       this.props.navigation.navigate('SignupScreen', { social_id: facebookResult.id })
  //       this.setState({
  //         modalVisible: false
  //       })
  //     }
  //   }

  // }

  // facebookLogout = async () => {
  //   await Facebook.logOutAsync()
  //   Alert.alert('Logged Out');
  // }

  // signInWithGoogleAsync = async () => {
  //   try {
  //     console.log("Google signin");
  //     const result = await GoogleAppAuth.logInAsync({
  //       androidClientId: '1003614269676-9s634n187fs1ksc5dsv557lbu2hidj4u.apps.googleusercontent.com',
  //       iosClientId: '1003614269676-5qhl3m1fqj5gh1lvtoosaa5c2d3af440.apps.googleusercontent.com',

  //       iosStandaloneAppClientId: "1003614269676-djcorc1j7pi98an1b810at4nngimbfb5.apps.googleusercontent.com",
  //       androidStandaloneAppClientId: "1003614269676-f3a5l9hvi2cf1geqgu468a3kovookkp0.apps.googleusercontent.com",
  //       scopes: ['profile', 'email'],
  //     });

  //     if (result.type === 'success') {
  //       let res: any = await axios.get(Config.api + `/getSocialData/${result.user.id}`);
  //       if (res.data.status == "success") {
  //         if (res.data.result !== null) {
  //           console.log('user data -->', res.data.result);
  //           this.storeData(res.data.result);
  //           this.setState({
  //             modalVisible: false
  //           })
  //         } else {
  //           this.props.navigation.navigate('SignupScreen', { social_id: result.user.id })
  //           this.setState({
  //             modalVisible: false
  //           })
  //         }
  //       }
  //     } else {
  //       return { cancelled: true };
  //     }
  //   } catch (e) {
  //     console.log("error", e);
  //     return { error: true };
  //   }
  // }

    getUserDetailsByGoogleID = async (data: any) => {
    try {
      let res: any = await axios.get(Config.api + `/getSocialData/${data.id}`);
      if (res.data.status == "success") {
        if (res.data.result !== null) {
          this.storeData(res.data.result);
          this.setState({
            modalVisible: false
          })
        } else {
          router.push({pathname: 'Auth/SignupScreen', params: {social_id: data.id }})
          this.setState({
            modalVisible: false
          })
        }
      }
    } catch (err) {
      console.log("Error: ", err);
    }
  }

  signInWithAppleAsync = async () => {
    try {
      try {
        const credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
        });
        console.log("apple promise", credential.user)
        console.log("apple name", credential.fullName);
        let appleSocialID = `appleID-${credential.user}`
        if (credential.user) {
          console.log("inside if user");
          let res: any = await axios.get(Config.api + `/getSocialData/${appleSocialID}`);
          if (res.data.status == "success") {
            if (res.data.result !== null) {
              console.log("data exist");
              this.storeData(res.data.result);
              this.setState({
                modalVisible: false
              })
            } else {
              console.log("navigate to signup screen");
              router.push({pathname: 'Auth/SignupScreen', params: {
                social_id: appleSocialID,
                firstName: credential.fullName?.givenName,
                lastName: credential.fullName?.familyName,
                middleName: credential.fullName?.middleName,
                suffix: credential.fullName?.nameSuffix,
              }})
              this.setState({
                modalVisible: false
              })
            }
          }
        }


      } catch (e: any) {
        if (e.code === 'ERR_CANCELED') {
          // handle that the user canceled the sign-in flow
          console.log("apple sign in cancelled!");
        } else {
          // handle other errors
          console.log("err", e);
        }
      }
    } catch (err) {
      console.log("err", err);
    }
  }

  toggleSecure = () => {
    this.setState({
      securePassword: !this.state.securePassword
    })
  }

  rememberUser = () => {
    this.setState({
      rememberMe: !this.state.rememberMe
    });
  }

  switchUser = async (user: any) => {
    this.setState({
      lastUser: user,
      isSwitchAccount: false
    })
  }

  

  getGoogleAccountDetails = async (data: any) => {
    try {
      console.log(`you are calling getGoogleAccountDetails ${data.id}`)
      console.log("Config.api", Config.api);
      axios.get(Config.api + `/getSocialData/${data.id}`).then(res => {
        if (res.data.status == "success") {
          if (res.data.result !== null) {
            this.storeData(res.data.result);
            this.setState({
              modalVisible: false
            })
          } else {
            router.push({pathname: 'Auth/SignupScreen', params: { social_id: data.id }})
            this.setState({
              modalVisible: false
            })
          }
        }
      })
      
    } catch (err) {
      console.log("Error: ", err);
    }
  }

  hideShowPassword = async () => {
    this.setState({
      passwordSecure: !this.state.passwordSecure
    })
  }

  continueAsGuest = async () => {
    await _storeData('NoUser', 'true')
    router.push('Home')
  }
  
  render() {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, backgroundColor: 'white' }}
        enabled={false}
      >
        <ScrollView style={{ backgroundColor: 'white' }}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>

              <View style={styles.logoContaner}>
                <Image source={require('../../assets/images/logos/Datos-official-logo-design-colored.png')} style={styles.logo} />
              </View>
              <View style={styles.welcomeHolder}>
                <Text style={{fontSize: 25, fontFamily: 'CalibriBold'}}>Welcome!</Text>
                <Text style={{fontSize: 16, fontFamily: 'CalibriRegular'}}>Login to your account</Text>
              </View>

              
              {
              this.state.isFacebookSignInTriggered ? 
              <View style={{paddingHorizontal: 50, paddingBottom: 20}}>
                <View style={{backgroundColor: datosRed, padding: 10, borderRadius: 10}}>
                  <Text style={[globalStyle.commonText, {color: datosWhiteShade}]}>Facebook Signin is currently not working. Sorry for inconvinience, we are currently working on resolving this issue. Thank you for understanding.</Text>
                </View>
              </View>
              : null
            }
            

              <View style={styles.wrapper}>
                <View style={{marginBottom: 30}}>
                  <TextInput 
                    style={styles.loginInput} 
                    placeholder='Username'
                    value={this.state.username}
                    autoCapitalize="none"
                    onChangeText={(username: string) => this.setState({ username })}
                    placeholderTextColor={datosBlack}
                  />
                  <View style={styles.iconRoundHolder}>
                    <Icon name='user' size={24} color={datosBlack}/>
                  </View>
                </View>

                <View style={{marginBottom: 20}}>
                  <TextInput 
                    style={styles.loginInput} 
                    placeholder='Password'
                    value={this.state.password}
                    onChangeText={(password: string) => this.setState({ password })}
                    secureTextEntry={this.state.passwordSecure}
                    placeholderTextColor={datosBlack}
                  />
                  <View style={styles.iconRoundHolder}>
                    <Icon name='lock' size={24} color={datosBlack}/>
                  </View>
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      right: 15,
                      top: 10
                    }} 
                    onPress={() => this.hideShowPassword()}
                  >
                    <Icon name={this.state.passwordSecure ? 'eye' : 'eye-off'} size={20} color={datosBlack}/>
                  </TouchableOpacity>
                </View>
                <View style={styles.rememberContainer}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={styles.rememberText}>Remember</Text>
                      <Checkbox
                        color={datosOrange}
                        status={this.state.rememberMe == true ? 'checked' : 'unchecked'}
                        onPress={() => {
                        this.rememberUser();
                        }}
                      />
                  </View>
                  <TouchableOpacity style={{paddingTop: 10}} onPress={() => router.push("Auth/AccountRecoveryScreen")}>
                    <Text style={styles.rememberText}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>

                <View style={{marginTop: 30, marginBottom: 30, justifyContent: 'center', alignItems: 'center'}}>
                  <TouchableOpacity style={styles.signinBtn}
                    onPress={() => this.signin()}
                    >
                    <Text style={{fontFamily: 'CalibriBold', fontSize: 17, color: '#fff'}}>Sign in</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.socialContainer}>
                  <Text style={[styles.text, { marginBottom: 20 }]}>-Or sign in with-</Text>

                    {
                      Platform.OS == 'ios' ?
                        <View style={styles.socialBtnHolderIOS}>
                          <AppleAuthentication.AppleAuthenticationButton
                            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                            cornerRadius={25}
                            style={{ width: 50, height: 50, marginRight: 10, marginTop: 1 }}
                            // onPress={async () => this.lastSocialIDSignIn()}
                            onPress={() => this.signInWithAppleAsync()}
                          />

                          <SocialLoginIOS
                            icon={'facebook'}
                            text="Sign in with facebook"
                            color="#fff"
                            // onPress={() => this.facebookSignin()}
                            onPress={() => this.facebookSignin()}
                          />
                          <LoginGoogle/>

                      </View>
                    :
                      <View style={styles.socialBtnHolderIOS}>
                        <SocialLoginIOS
                          icon={'facebook'}
                          text="Sign in with facebook"
                          color="#fff"
                          onPress={() => this.facebookSignin()}
                        />
                        <LoginGoogle/>
                      </View>
                    }
                </View>
                <View style={{marginVertical: 30, justifyContent: 'center', alignItems: 'center'}}>
                  <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={() => this.continueAsGuest()}>
                    <Icon name="user" size={17} color={datosBlack}/>
                    <Text style={{marginLeft: 10, fontFamily: 'CalibriBold', fontSize: 17}}>Login as guest</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
          {
            this.state.lastUser !== null ?
              <TouchableOpacity onPress={() => this.setState({ modalVisible: true, isSwitchAccount: true })} style={{marginTop: 10, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                <Text style={styles.text}>View Remembered </Text>
                <Text style={[styles.text, { color: datosOrange }]}>Accounts?</Text>
              </TouchableOpacity> :
              null
          }

          <TouchableOpacity onPress={() => router.push('Auth/SignupScreen')} style={{marginTop: 10, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
            <Text style={styles.text}>Don't have an Account? </Text>
            <Text style={[styles.text, { color: datosOrange }]}>Sign up</Text>
          </TouchableOpacity>

          <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
            <TouchableOpacity onPress={() => {
              Linking.openURL('https://datos.ph/terms-conditions/');
            }} style={{ marginTop: 10, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
              <Text style={[styles.text, { color: datosOrange }]}>Terms and Condition </Text>
            </TouchableOpacity>
            <View style={{ marginTop: 10, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
              <Text style={styles.text}>&amp;</Text>
            </View>
            <TouchableOpacity onPress={() => {
              Linking.openURL('https://datos.ph/privacy-policy/');
            }} style={{ marginTop: 10, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
              <Text style={[styles.text, { color: datosOrange }]}> Privacy Policy</Text>
            </TouchableOpacity>
          </View>



        </ScrollView>
        <View style={{ alignItems: 'center', margin: 10 }}>
          <Text style={{ color: datosOrange, fontSize: 10 }}>v4.0</Text>
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            console.log("modal close");
          }}>
          <View style={styles.centeredView}>
            <View style={this.state.isSwitchAccount == false ? styles.modalView : [styles.modalView, { height: '80%', paddingHorizontal: 20 }]}>

              {this.state.isSwitchAccount == false ?
                <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>

                  <Image source={this.state.lastUser !== null ? { uri: this.state.lastUser.personalAttachment.profile } : require("../../assets/images/test-images/profile.png")}
                    style={styles.profile}
                  />
                  {
                    this.state.lastUser?.accountInformation.password == "" || this.state.lastUser?.socialID !== "" ?
                      <View>
                        <Text style={styles.commonText}>{this.state.lastUser?.personalInformation.firstName} {this.state.lastUser?.personalInformation.lastName}</Text>
                        <Text style={[styles.commonText, { color: '#e71409' }]}>Session Expired</Text>
                      </View>
                      : null
                  }
                  {
                    this.state.lastUser?.accountInformation.password == "" && this.state.lastUser?.socialID == "" ?
                      <AppInput placeholder="Password"
                        label="Password (min 6 chars)"
                        value={this.state.password}
                        onChange={(password: string) => this.setState({ password })}
                        secure={this.state.securePassword}
                        password={true}
                        toggleSecure={() => this.toggleSecure()}
                        optional={true}
                      />
                      : null
                  }
                  {
                    this.state.lastUser?.socialID !== "" ?
                      <View style={styles.socialContainer}>

                        {
                          Platform.OS == 'ios' ?
                            <View style={styles.socialBtnHolderIOS}>
                              <AppleAuthentication.AppleAuthenticationButton
                                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                                cornerRadius={25}
                                style={{ width: 50, height: 50, marginRight: 10, marginTop: 1 }}
                                onPress={() => this.signInWithAppleAsync()}
                              />
    
                              <SocialLoginIOS
                                icon={'facebook'}
                                text="Sign in with facebook"
                                color="#fff"
                                onPress={() => this.facebookSignin()}
                              />
                              <LoginGoogle/>
                            </View>
                          :
                          <View style={styles.socialBtnHolderIOS}>
                            <SocialLoginIOS
                              icon={'facebook'}
                              text="Sign in with facebook"
                              color="#fff"
                              onPress={() => this.facebookSignin()}
                            />
                            <LoginGoogle/>
                        </View>
                        }
                      </View>
                      :
                      <TouchableOpacity 
                      style={styles.signinBtn} onPress={() => this.continueSignin()}>
                        <Text style={{ color: '#fff', fontSize: 17, fontFamily: 'CalibriBold' }}>{this.state.lastUser?.accountInformation.password == "" ? `Continue` : `Continue as ${this.state.lastUser?.personalInformation.firstName}`} </Text>
                      </TouchableOpacity>
                  }


                  <TouchableOpacity style={{marginTop: 30}} onPress={() => {
                    this.setState({
                      isSwitchAccount: !this.state.isSwitchAccount
                    })
                  }}>
                    <Text style={styles.commonText}>Not you?
                      <Text style={[styles.commonText, { color: datosOrange }]}> Switch Account</Text>
                    </Text>
                  </TouchableOpacity>
                </View>
                :

                <View style={{ width: '100%', flex: 1, alignItems: 'center', marginTop: 20 }}>
                  <Text style={[styles.commonText, { marginBottom: 20 }]}>Sign in as?</Text>
                  <ScrollView>
                    {
                      this.state.usersList.map((user: any, i: number) => {
                        return (
                          <TouchableOpacity style={styles.eachUser} key={i} onPress={() => this.switchUser(user)}>
                            <Image source={user.personalAttachment.profile ? { uri: user.personalAttachment.profile } : require("../../assets/images/test-images/profile.png")} style={styles.switchProfileImage} />
                            <Text style={styles.commonText}>{user.personalInformation.firstName} {user.personalInformation.lastName}</Text>
                          </TouchableOpacity>
                        );
                      })
                    }
                  </ScrollView>
                </View>
              }

              <TouchableOpacity style={styles.closeModal} onPress={() => {
                this.setState({
                  modalVisible: !this.state.modalVisible
                })
              }}>
                <Icon name="x" size={18} color="#fff" />
              </TouchableOpacity>
              {
                this.state.isSwitchAccount == true ?
                  <TouchableOpacity style={styles.switchBack} onPress={() => {
                    this.setState({
                      isSwitchAccount: false
                    })
                  }}>
                    <Icon
                      name="arrow-left"
                      color='#e71409'
                      size={30}
                    />
                  </TouchableOpacity>
                  :
                  null
              }

            </View>
          </View>
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.appleModalVisible}
          onRequestClose={() => {
            console.log("modal close");
          }}>
          <View style={styles.centeredView}>
            <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }} >

            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={5}
              style={{ width: '100%', paddingVertical: 10 }}
              onPress={async () => {
                try {
                  const credential = await AppleAuthentication.signInAsync({
                    requestedScopes: [
                      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                      AppleAuthentication.AppleAuthenticationScope.EMAIL,
                    ],
                  });
                  // signed in
                } catch (e:any) {
                  if (e.code === 'ERR_CANCELED') {
                    // handle that the user canceled the sign-in flow
                  } else {
                    // handle other errors
                  }
                }
              }}
            />

              <TouchableOpacity style={styles.closeModal} onPress={() => {
                this.setState({
                  appleModalVisible: !this.state.appleModalVisible
                })
              }}>
                <Text style={{ fontSize: 30, color: '#e71409' }}>&times;</Text>
              </TouchableOpacity>
              
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  commonText: {
    padding: 10, 
    fontFamily: 'CalibriRegular', 
    fontSize: 15
  },
  logoContaner: {
    flex: 1,
    backgroundColor: 'transparent', 
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },

  logo: {
    resizeMode: "contain",
    width: 250,
    height: 100,
    marginTop: 50
  },

  welcomeHolder: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 40 
  },

  wrapper: {
    flex: 1,
    paddingHorizontal: 50,
    backgroundColor: '#fff',
  },

  iconRoundHolder: {
    position: 'absolute',
    left: 0,
    top: -10,

    justifyContent: 'center',
    alignItems: 'center',
    width: 56,
    height: 56,
    backgroundColor: '#fff',
    borderRadius: 28,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,  
    elevation: 2
  },

  loginInput: {
    fontFamily: 'CalibriRegular',
    fontSize: 15,
    paddingVertical: Platform.OS == 'ios' ? 10 : 5, 
    borderRadius: 18, 
    paddingLeft: 75,
    backgroundColor: '#fff',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 1,  
    elevation: 2
  },

  rememberContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 15
  },

  rememberText: {
    fontFamily: 'CalibriRegular', 
    fontSize: 14, 
    color: 'black' 
  },

  signinBtn: {
    backgroundColor: datosOrange, 
    paddingHorizontal: 40,
    paddingVertical: 5,
    borderRadius: 50
  },

  text: {
    fontFamily: 'CalibriBold',
    color: datosBlack,
    fontSize: 17
  },

  socialContainer: {
    alignItems: 'center',
    marginTop: 30,
    backgroundColor: 'white'
  },

  socialBtnHolder: {
    flexDirection: 'column',
    backgroundColor: 'white',

  },
  socialBtnHolderIOS: {
    flexDirection: 'row',
    backgroundColor: 'white',

  },

  // modal styles
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0, 0.3)'
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '80%',
    height: vh(56),
    justifyContent: 'center',
    alignItems: 'center',
  },
  profile: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 40
  },
  closeModal: {
    backgroundColor: datosOrange,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 10,
    right: 10,
  },
  eachUser: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    flexDirection: 'row',
    width: '100%'
  },
  switchProfileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 20
  },
  switchBack: {
    position: 'absolute',
    top: 5,
    left: 10,
  },
  iosSocialBtnStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3
  }
});

