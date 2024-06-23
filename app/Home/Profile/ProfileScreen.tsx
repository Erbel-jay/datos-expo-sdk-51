import * as React from "react";
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  Alert,
  ActivityIndicator,
  Text,
  View
} from "react-native";
import { globalStyle } from "../../../assets/styles/globalStyle";
import { AppInput, AppSelect, AppInputMask, DatePickerInput } from "../../../components/Inputs";
import { CancelBtn, BackBtn, NextBtn, SaveBtn } from "../../../components/Buttons";
import { string } from "prop-types";
// import firebase from "firebase";
import axios from "axios";
import Config from "../../../constants/Config";
import { router } from "expo-router";
const {
  _storeData,
  _retrieveData,
  getHeader,
  _removeData,
  _mergeData,
} = require("../../../helpers/global-function");

export default class ProfileScreen extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  state: any = {
    type: null,
    userData: {},
    firstName: "",
    lastName: "",
    middleName: "",
    nameSuffix: "",
    civilStatus: "",
    mobileNumber: "",
    current_user_object_id: "",
    isLoaded: false,
    isInfoSubmitted: false,
    civilStatusOptions: [
      { label: "Single", value: "Single" },
      { label: "Married", value: "Married" },
      { label: "Widow", value: "Widow" },
      { label: "Live-in-partner", value: "Live-in-partner" },
    ],
  };

  async componentDidMount() {
    let current_user_data: any = await _retrieveData("current_user");
    let current_user = JSON.parse(current_user_data);
    this.setState({
      current_user_object_id: current_user._id,
      type: current_user.personalInformation.civilStatus,
    }, () => {
      this.getData();
    });

  }

  getData = async () => {
    try {
      let object_id = this.state.current_user_object_id;
      let res: any = await axios.get(Config.api + `/user/getUser/${object_id}`);
      this.setState({
        isLoaded: true
      })
      if (res.data.status == "success") {
        this.setState({
          userData: res.data.result,
          firstName: res.data.result.personalInformation.firstName,
          lastName: res.data.result.personalInformation.lastName,
          middleName: res.data.result.personalInformation.middleName,
          nameSuffix: res.data.result.personalInformation.nameSuffix,
          civilStatus: res.data.result.personalInformation.civilStatus ? res.data.result.personalInformation.civilStatus : "" ,
          mobileNumber: res.data.result.personalInformation.mobileNumber,
          isInfoSubmitted: res.data.result.isInfoSubmitted
        });
      }
    } catch (err) {
      console.log("ERROR >>", err);
    }
  };

  alert = (title: string, message: string) => {
    Alert.alert(
      title,
      message,
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => router.push("Home/MainHome/MainHomeScreen"),
        },
      ],
      { cancelable: false }
    );
  };

  submitForm = async () => {
    try {
      let formData = new FormData();
      let state = this.state;
      let data = state.userData;
      data.personalInformation.firstName = state.firstName;
      data.personalInformation.lastName = state.lastName;
      data.personalInformation.middleName = state.middleName;
      data.personalInformation.nameSuffix = state.nameSuffix;
      data.personalInformation.civilStatus = state.civilStatus
      data.personalInformation.mobileNumber = state.mobileNumber
      formData.append("data", JSON.stringify(data));
      let res: any = await axios.patch(
        Config.api + "/user/updateUser/" + this.state.current_user_object_id,
        formData
      );
      if (res.data.status == "success") {
        this.alert("Info", "Personal Information Updated Successfully!");
      }
    } catch (err) {
      console.log(err);
    }
  };

  inputChange = (field: string) => (input: string) => {
    if (input == null) return;


    let value: any = { [field]: input };
    this.setState(value);
  };

  fieldCheck = () => {
    let state = this.state
    console.log(state.firstName);
    console.log(state.lastName);
    console.log(state.middleName);
    console.log(state.civilStatus, '-');
    console.log(state.mobileNumber);
    if((state.firstName == "") || (state.lastName == "") || (state.middleName == "") || (state.civilStatus == "") || (state.mobileNumber == "")){
      console.log("true");
      return true
    }else{
      console.log("false");
      return false;
    }
  }

  render() {
    let values = this.state;
    let suffixOptions = [
      { label: "Jr.", value: "Jr." },
      { label: "Sr.", value: "Sr." },
    ];
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={globalStyle.container}
      >
        {this.state.isLoaded == false ?
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#70788c" />
            <Text style={globalStyle.commonText}>Loading Data...</Text>
          </View>
          :
          <ScrollView>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={globalStyle.wrapper}>
                <Text style={globalStyle.title}>Personal Information</Text>
                {values ? (
                  <View style={globalStyle.inputHolder}>
                    <AppInput
                      placeholder="First Name"
                      label="First Name"
                      onChange={(firstName: any) => this.setState({ firstName })}
                      value={values.firstName}
                      editable={false}//this.state.isInfoSubmitted == false ? true : 
                    />
                    <AppInput
                      placeholder="Last Name"
                      label="Last Name"
                      onChange={(lastName: any) => this.setState({ lastName })}
                      value={values.lastName}
                      editable={false}
                    />
                    <AppInput
                      placeholder="Middle Name"
                      label="Middle Name"
                      onChange={(middleName: any) =>
                        this.setState({ middleName })
                      }
                      value={values.middleName}
                      editable={false}
                    />
                    {/* <AppSelect
                      placeholder="Name Suffix (Optional)"
                      onChange={(nameSuffix: any) =>
                        this.setState({ nameSuffix })
                      }
                      value={values.nameSuffix}
                      items={suffixOptions}
                      optional={true}
                      disable={true}
                    /> */}

                    <AppSelect
                      placeholder="Civil Status"
                      onChange={this.inputChange("civilStatus")}
                      value={this.state.civilStatus}
                      items={this.state.civilStatusOptions}
                    />

                    <AppInputMask
                      label="Mobile Number"
                      returnKeyType="done"
                      value={this.state.mobileNumber}
                      keyboardType="number-pad"
                      placeholder="Mobile Number (0900 000 0000)"
                      type={"custom"}
                      options={{
                        mask: "9999 999 9999",
                      }}
                      maxLength={13}
                      onChangeText={this.inputChange("mobileNumber")}
                    />
                  </View>
                ) : null}

                <View style={globalStyle.buttonHolder}>
                  <BackBtn
                    onPress={() => router.back()}
                  />
                  {this.state.type !== null ? (
                    <View style={globalStyle.horizontalSpacer}></View>
                  ) : null}
                  {this.state.type !== null ? (
                    <SaveBtn onPress={() => this.submitForm()} disable={this.fieldCheck()} />
                  ) : null}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        }

      </KeyboardAvoidingView>
    );
  }
}
