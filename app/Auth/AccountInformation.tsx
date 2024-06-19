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
import { CancelBtn, BackBtn, NextBtn, SaveBtn } from "../../components/Buttons";
import axios from "axios";
import Config from "../../constants/Config";

export default class AccountInformation extends React.Component<any> {
  constructor(public props: any) {
    super(props);
  }
  state: any = {
    securePasswordp: true,
    securePasswordc: true,
    isValid: null,
    isValidEmail: null,
    vCode: null,
    code: null,
    codeDidExpired: false,
    timer: 60,
    isSendClicked: false,
    codeVerified: false,
    isAllDone: false,
    validRetailerCode: []
  };
  checking = () => {
    const { values } = this.props;
    console.log("values.isValid", values.isValid);
    console.log("values.isValidEmail", values.isValidEmail);

    if (values.social_id == "" || values.social_id == null) {
      if (
        values.username == "" ||
        values.password == "" ||
        values.confirmPassword == ""
      ) {
        return true
      }

      if (
        !values.isValid ||
        (
          values.isValid &&
          values.isValid[0] == false ||
          values.isValid[1] == false ||
          values.isValid[2] == false ||
          values.isValid[3] == false
        )
      ) {
        return true
      }

      if (
        !values.isValidEmail ||
        (
          values.isValidEmail &&
          values.isValidEmail[0] == false
        )
      ) {
        return true
      }

      if (values.codeVerified == false) {
        return true
      }

      return false

    } else { //social_id is not blank OR not null
      if (values.isValidEmail &&
        values.isValidEmail[0] == true &&
        values.codeVerified == true) {
        return false;
      } else {
        return true
      }
    }
  };

  componentDidMount() {
    this.getRetailers()

  }

  getRetailers = async () => {
    axios.get(Config.api + "/retailer/getRetailers")
      .then(res => {
        let codes: any[] = []
        res.data.result.map((code: any) => {
          if (code.code !== null) {
            codes.push(code.code.toString())
          }
        })
        codes.push('00007')
        this.setState({
          validRetailerCode: codes
        }, () => {
          console.log("this.state.validRetailerCode", this.state.validRetailerCode);
        })
      })
      .catch(err => console.log("Error", err))
  }


  proceed = async () => {
    const { nextStep, values, changeStateValue } = this.props;

    if (this.state.validRetailerCode.includes(values.code) !== true) {
      // if (values.code !== '00007') {
      let checkEmail: any = await axios.post(Config.api + "/check-duplicate", { "personalInformation.email": values.email });
      if (checkEmail.data.result) {
        Alert.alert("Info", "Email Already Been Taken");
        changeStateValue("email", "")
        changeStateValue("code", null)
        changeStateValue("isValidEmail", null)
        changeStateValue("codeVerified", false)
        this.runTimerInterval('stop');
        return;
      }
    }

    if (values.social_id == "" || values.social_id == null) {
      if (values.username < 6) {
        Alert.alert("Info", "Username Need atleast 6 character");
        return
      }
      if (values.confirmPassword.length < 6 || values.password.length < 6) {
        Alert.alert("Info", "Password Need atleast 6 character");
        return
      }
      if (values.confirmPassword != values.password) {
        Alert.alert("Warning!", "Password Not Match");
        return
      }
      let res: any = await axios.post(Config.api + "/check-duplicate", { "accountInformation.username": values.username });
      if (res.data.result) {
        Alert.alert("Info", "Username Already Been Taken");
        return;
      }
    }

    nextStep();
  }

  toggleSecure = (type: string) => {
    if (type == "p") {
      this.setState({
        securePasswordp: !this.state.securePasswordp
      })
    } else {
      this.setState({
        securePasswordc: !this.state.securePasswordc
      })
    }
  }

  codeExpired = () => {
    console.log("code Expired!");
    this.setState({ codeDidExpired: true })

  }

  sendCode = () => {
    this.setState({
      isSendClicked: true
    })
    this.runTimerInterval('start');
    // this.setState({codeExpired: false})
    this.setState({ vCode: Math.floor(100000 + Math.random() * 900000) })

    setTimeout(() => {
      const { values } = this.props;
      let data = {
        email: values.email,
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

  verifyCode = () => {
    const { values, changeStateValue } = this.props;
    console.log("this.state.vCode", this.state.vCode)
    console.log("values.code", values.code)
    console.log("this.state.validRetailerCode", this.state.validRetailerCode);
    if (this.state.validRetailerCode.includes(values.code) == true) {
      // if (values.code == '00007') {
      changeStateValue("codeVerified", true)
      changeStateValue("isValidEmail", true)
    } else {
      if (this.state.vCode == values.code) {
        changeStateValue("codeVerified", true)
      } else {
        Alert.alert("Failed", 'Code do not match!')
      }
    }
  }



  runTimerInterval = (decsision: string) => {
    let callClock = setInterval(() => {
      this.decrementClock();
    }, 1000);

    if (decsision == 'start') {
      setInterval(() => {
        clearInterval(callClock)
        this.setState({
          timer: 60,
          isSendClicked: false
        })
      }, 60000);
    } else {
      clearInterval(callClock)
      this.setState({
        timer: 60,
        isSendClicked: false
      })
    }
  }

  decrementClock = () => {
    this.setState((prevstate: any) => ({ timer: prevstate.timer - 1 }));
  };


  render() {
    const { values, inputChange, nextStep, back } = this.props;
    // const { isValid, isValidEmail } = this.state;
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
                  Account Information
                </Text>
              </View>

              <View style={styles.inputHolder}>
                {
                  this.state.validRetailerCode.includes(values.code) == true && values.codeVerified == true ?
                    // values.code == '00007' && values.codeVerified == true ?
                    null
                    :
                    <AppInput
                      placeholder="Enter Email"
                      label="Email"
                      onChange={inputChange("email")}
                      value={values.email}
                      autoCapitalize="none"
                      pattern={[
                        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                      ]}
                      onValidation={inputChange("isValidEmail")}
                      valid={values.isValidEmail}
                    />
                }


                <AppInputVerification
                  placeholder="Enter Code"
                  label="Code"
                  onChange={inputChange("code")}
                  value={values.code}
                  autoCapitalize="none"
                  verify={true}
                  sendCode={() => this.sendCode()}
                  timer={this.state.timer}
                  isSendClicked={this.state.isSendClicked}
                  emailVerified={values.isValidEmail}
                  verifyCode={this.verifyCode}
                  isCodeVerified={values.codeVerified}
                />

                {
                  values.social_id == "" ||
                    values.social_id == null
                    ?
                    <View style={styles.inputHolder}>
                      <AppInput
                        placeholder="Username"
                        label="Username"
                        onChange={inputChange("username")}
                        value={values.username}
                        autoCapitalize="none"
                      />

                      <AppInput
                        placeholder="Password"
                        label="Password"
                        onChange={inputChange("password")}
                        value={values.password}
                        secure={this.state.securePasswordp}
                        password={true}
                        toggleSecure={() => this.toggleSecure("p")}
                        pattern={[
                          '^.{6,}$', // min 6 chars
                          '(?=.*\\d)', // number required
                          '(?=.*[A-Z])', // uppercase letter
                          '(?=.*[!@#\$%\^&\*])' //special chars
                        ]}
                        onValidation={inputChange("isValid")}
                        valid={values.isValid}
                      />

                      <AppInput
                        placeholder="Confirm Password"
                        label="Confirm Password"
                        onChange={inputChange("confirmPassword")}
                        value={values.confirmPassword}
                        secure={this.state.securePasswordc}
                        password={true}
                        toggleSecure={() => this.toggleSecure("c")}
                      />
                    </View>
                    :
                    null
                }
              </View>
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-around",
                }}
              >
                <View style={globalStyle.buttonHolder}>
                  <BackBtn onPress={() => back()} />
                  <View style={globalStyle.horizontalSpacer}></View>
                  <NextBtn disable={this.checking()} onPress={() => this.proceed()} />
                  {/* <Text>{this.checking() == true ? 'true' : 'false'}</Text> */}
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
  logoContaner: {
    justifyContent: "center",
    alignItems: "center",
    height: 150,
  },
  commonText: {
    fontFamily: 'OpenSansRegular', fontSize: 15
  },
});
