import * as React from "react";
import {
  StyleSheet,
  Button,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Alert,
  Text,
  View,
  ScrollView
} from "react-native";
import { AppInput, AppSelect, DatePickerInput, AppInputVerification } from "../../components/Inputs";
import Constants from "expo-constants";
// import { ScrollView } from "react-native-gesture-handler";
import { globalStyle } from "../../assets/styles/globalStyle";
import {CancelBtn, BackBtn, NextBtn, SaveBtn} from "../../components/Buttons";
import { LinearGradient } from 'expo-linear-gradient';
import { TabRouter } from "@react-navigation/routers";
import axios from "axios";
import Config from "../../constants/Config";
import { router } from "expo-router";



export default class AccountRecoveryScreen extends React.Component<any, any> {
  constructor(public props: any) {
    super(props);
  }
  state: any = {
    email: "",
    newPassword: "",
    confirmNewPassword: "",
    securePasswordp: true,
    securePasswordc: true,

    timer: 60,
    isSendClicked: false,
    vCode: null,
    code: null,
    isValid: null,
    isValidEmail: null,
    codeVerified: false,

  };

  sendCode = () => {
    this.setState({
      isSendClicked: true
    })
    this.runTimerInterval('start');
    this.setState({vCode : Math.floor(100000 + Math.random() * 900000)})

    setTimeout(() => {
      let data = {
        email: this.state.email,
        code: this.state.vCode
      }
      console.log("data", data);

      axios.post(Config.api + "/sendVerificationCode", data)
      .then((res) => {
        console.log("res.data", res.data)
      })
      .catch(err => {
        console.log("err", err)
      })

    }, 1500)
  }

  runTimerInterval = (decsision: string) => {
    let callClock = setInterval(() => {
      this.decrementClock();
     }, 1000);

    if(decsision == 'start'){
       setInterval(() => {
        clearInterval(callClock)
        this.setState({
          timer: 60,
          isSendClicked: false
        })
       }, 60000);
    }else{
      clearInterval(callClock)
        this.setState({
          timer: 60,
          isSendClicked: false
        })
    }
  }

  decrementClock = () => {      
    this.setState((prevstate: any) => ({ timer: prevstate.timer-1 }));
  };

  inputChange = (field: string) => (input: string) => {
    let value: any = { [field]: input };
    this.setState(value);
  }

  changeStateValue = (stateName: any, value: any) => {
    let set: any = { [stateName]: value };
    this.setState(set);
  }

  verifyCode = () =>{
    console.log("this.state.vCode", this.state.vCode)
    console.log("values.code", this.state.code)
    if(this.state.vCode == this.state.code){
        this.changeStateValue("codeVerified", true)
    }else{
      Alert.alert("Failed",'Code do not match!')
    }
  }

  toggleSecure = (type: string) => {
    if(type == "p"){
      this.setState({
        securePasswordp: !this.state.securePasswordp
      })
    }else{
      this.setState({
        securePasswordc: !this.state.securePasswordc
      })
    }
  }
  
  updatePassword = () => {
    if(this.state.codeVerified == false){
      Alert.alert('Failed!', 'Code not verified');
    }else if(this.state.newPassword !== this.state.confirmNewPassword){
      Alert.alert('Failed!', 'Passwords do not match!');
    }else{
      let data = {
        email: this.state.email,
        newPassword: this.state.newPassword
      }
      let res = axios.post(Config.api + "/updatePassword", data)
      .then(res => {
        console.log("res",res);
        Alert.alert("Success!", "Password successfuly reset.")
        router.push("Auth/LoginScreen")
      })
      .catch(err => console.log("ERROR:", err))
    }
  }

  render() {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.wrapper}>
              <View
                style={{ alignItems: "flex-start", padding: 10, marginTop: 10 }}
              >
                <Text style={globalStyle.title}>
                  Recover your account
                </Text>
              </View>
                <View
                    style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-around",
                    }}
                >
                <View style={styles.inputHolder}>
                    <AppInput
                      placeholder="Enter Email"
                      label="Email"
                      onChange={this.inputChange("email")}
                      value={this.state.email}
                      autoCapitalize="none"
                      pattern={[
                        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                      ]}
                      onValidation={this.inputChange("isValidEmail")}
                      valid={this.state.isValidEmail}
                    />

                    <AppInputVerification
                      placeholder="Enter Code"
                      label="Code"
                      onChange={this.inputChange("code")}
                      value={this.state.code}
                      autoCapitalize="none"
                      verify={true}
                      sendCode={() => this.sendCode()}
                      timer={this.state.timer}
                      isSendClicked={this.state.isSendClicked}
                      emailVerified={this.state.isValidEmail}
                      verifyCode={this.verifyCode}
                      isCodeVerified={this.state.codeVerified}
                    />

                    { this.state.codeVerified == true ?
                      <View style={styles.inputHolder}>
                        <AppInput
                            placeholder="New Password"
                            label="Password"
                            onChange={this.inputChange("newPassword")}
                            value={this.state.newPassword}
                            secure={this.state.securePasswordp}
                            password={true}
                            toggleSecure={() => this.toggleSecure("p")}
                            pattern={[
                              '^.{6,}$', // min 6 chars
                              '(?=.*\\d)', // number required
                              '(?=.*[A-Z])', // uppercase letter
                              '(?=.*[!@#\$%\^&\*])' //special chars
                            ]}
                            onValidation={this.inputChange("isValid")}
                            valid={this.state.isValid}
                          />

                          <AppInput
                            placeholder="Confirm Password"
                            label="Confirm New Password"
                            onChange={this.inputChange("confirmNewPassword")}
                            value={this.state.confirmNewPassword}
                            secure={this.state.securePasswordc}
                            password={true}
                            toggleSecure={() => this.toggleSecure("c")}
                          />
                      </View>
                      :
                      null
                    }

                    <LinearGradient
                      colors={this.state.codeVerified == false ? ['#eee','#eee'] : ['#f7d817','#e71409']}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={styles.signinBtn}>
                      <TouchableOpacity disabled={this.state.codeVerified == false ? true: false} style={{width: '100%', justifyContent: 'center', alignItems:"center"}} onPress={() => this.updatePassword()}>
                        <Text style={{color: '#fff', fontSize: 15, fontFamily: 'OpenSansRegular'}}>Confirm</Text>
                      </TouchableOpacity>
                    </LinearGradient>
                </View>
                
              </View>
            </View>
          </TouchableWithoutFeedback>
          </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  wrapper: {
    flex: 1,
    padding: 40,
  },
  inputHolder: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  signinBtn: {
    backgroundColor: "#000",
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    padding: 15,
    borderRadius: 6,
    width: '100%'
  },
});
