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
  TextInput,
  Alert,
  Text,
  View,
  ScrollView
} from "react-native";
import { AppInput, AppSelect, DatePickerInput, AppInputMask, DatePickerInputMask } from "../../components/Inputs";
import Constants from "expo-constants";
// import { ScrollView } from "react-native-gesture-handler";
import { globalStyle } from "../../assets/styles/globalStyle";
import { CancelBtn, BackBtn, NextBtn, SaveBtn } from "../../components/Buttons";
import axios from "axios";
import Config from "../../constants/Config";
import { router } from "expo-router";
export default class PersonalInformation extends React.Component<any> {
  constructor(public props: any) {
    super(props);
  }
  state: any = {};
  checking = () => {
    const { values } = this.props;
    if (
      values.lastName == "" ||
      values.firstName == "" ||
      values.middleName == "" ||
      values.gender == "" ||
      values.civilStatus == "" ||
      values.birthday == "" ||
      values.mobileNumber == "" ||
      values.mobileNumber.length !== 13 ||
      values.address.street == "" ||
      values.address.barangay == "" ||
      values.address.city == "" ||
      values.address.province == "" || values.findUs == "" ||
      values.existingLoan == ""
    ) {
      if (values.existingLoan == "Yes" && (values.whereDidLoan == "" || values.kindOfLoans == "")) {
        return false;
      }
      return true;
    }
    return false;
  };
  validateEmail(email: any) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  proceed = async () => {
    const { nextStep, values } = this.props;
    // if(values.email != ""){
    //   if(!this.validateEmail(values.email)){
    //     Alert.alert("Info","Invalid Email Address");
    //     return;
    //   }
    //   let res : any = await axios.post(Config.api + "/check-duplicate", {"personalInformation.email": values.email});
    //   if(res.data.result){
    //     Alert.alert("Info","Email Already Been Taken");
    //     return;
    //   }
    // }

    nextStep();
  }

  render() {
    const {
      values,
      inputChange,
      nameSuffix,
      confirmPicker,
      isDatePickerVisible,
      genderOptions,
      hidePicker,
      showDatePicker,
      civilStatusOptions,
      nextStep,
      getState,
      navigation,
      barangayOption,
      ProvinceOption,
      cityOption,
    } = this.props;
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={globalStyle.wrapper}>
              <View
                style={{ alignItems: "flex-start", padding: 10, marginTop: 10 }}
              >
                <Text style={globalStyle.title}>
                  Personal Information
                </Text>
              </View>
              <View style={styles.inputHolder}>
                <AppInput
                  placeholder="First Name"
                  label="First Name"
                  onChange={inputChange("firstName")}
                  value={values.firstName}
                />
                <AppInput
                  placeholder="Last Name"
                  label="Last Name"
                  onChange={inputChange("lastName")}
                  value={values.lastName}
                />
                <AppInput
                  placeholder="Middle Name"
                  label="Middle Name"
                  onChange={inputChange("middleName")}
                  value={values.middleName}
                />

                <AppSelect
                  placeholder="Name Suffix (Optional)"
                  onChange={inputChange("nameSuffix")}
                  value={values.nameSuffix}
                  items={nameSuffix}
                  optional={true}
                />

                <AppSelect
                  placeholder="Gender"
                  onChange={inputChange("gender")}
                  value={values.gender}
                  items={genderOptions}
                />

                <AppSelect
                  placeholder="Civil Status"
                  onChange={inputChange("civilStatus")}
                  value={values.civilStatus}
                  items={civilStatusOptions}
                />

                <AppInput
                  placeholder="Religion"
                  label="Religion"
                  onChange={inputChange("religion")}
                  value={values.religion}
                />

                <DatePickerInputMask
                  label="Birthday"
                  placeholder="Birthday (mm-dd-yyyy)"
                  onChangeText={inputChange("birthday")}
                  value={values.birthday}
                  onConfirm={confirmPicker}
                  onCancel={hidePicker}
                  mode="date"
                  isVisible={isDatePickerVisible}
                  showDatePicker={showDatePicker}
                  returnKeyType="done"
                  keyboardType="number-pad"
                  type={"datetime"}
                  options={{
                    format: "MM-DD-YYYY",
                  }}
                  maxLength={10}
                  editable={true}
                />
                {/* <AppInput
                  placeholder="Email"
                  label="Email"
                  onChange={inputChange("email")}
                  value={values.email}
                  autoCapitalize="none"
                  optional={true}
                /> */}
                <AppInputMask
                  label="Mobile Number"
                  returnKeyType="done"
                  value={values.mobileNumber}
                  keyboardType="number-pad"
                  placeholder="Mobile Number (0900 000 0000)"
                  type={"custom"}
                  options={{
                    mask: "9999 999 9999",
                  }}
                  maxLength={13}
                  onChangeText={inputChange("mobileNumber")}
                />
                <View style={{ marginTop: 20, justifyContent: 'flex-start', alignItems: 'flex-start', width: '100%' }}>
                  <Text style={globalStyle.title}>
                    Address
                  </Text>
                </View>
                <AppInput
                  placeholder="Street number or House #"
                  label="Street number or House #"
                  onChange={inputChange("street")}
                  value={values.address.street}
                />
                <AppSelect
                  placeholder="Province"
                  onChange={inputChange("province")}
                  value={values.address.province}
                  items={ProvinceOption}
                />
                <AppSelect
                  placeholder="City"
                  onChange={inputChange("city")}
                  value={values.address.city}
                  items={values.address.province != "" ? cityOption : []}
                />
                <AppSelect
                  placeholder="Barangay"
                  onChange={inputChange("barangay")}
                  value={values.address.barangay}
                  items={values.address.city != "" ? barangayOption : []}
                />
                <AppSelect
                  placeholder="How did you find us?"
                  onChange={inputChange("findUs")}
                  value={values.findUs}
                  items={[
                    { label: "Advertising", value: "Advertising" },
                    { label: "Facebook", value: "Facebook" },
                    { label: "Instagram", value: "Instagram" },
                    { label: "Search Engine", value: "Search Engine" },
                    { label: "Recommendation", value: "Recommendation" },
                    { label: "Advertising", value: "Advertising" },
                    { label: "Radio", value: "Radio" },
                    { label: "Television", value: "Television" },
                  ]}
                />
                <AppSelect
                  placeholder="With existing loan/s from other company?"
                  label="Answer"
                  onChange={inputChange("existingLoan")}
                  value={values.existingLoan}
                  items={[
                    { label: "Yes", value: "Yes" },
                    { label: "No", value: "No" },
                  ]}
                />

                {values.existingLoan && values.existingLoan == "Yes" ? (
                  <View style={styles.inputHolder}>
                    <AppInput
                      placeholder="Seperate each loan/s with (/)"
                      label="Loan/s"
                      onChange={inputChange("whereDidLoan")}
                      value={values.whereDidLoan}
                      multiline={true}
                      numberOfLines={6}
                      height={100}
                    />

                    <AppInput
                      placeholder="Kind of loans"
                      label="Kind of loans"
                      onChange={inputChange("kindOfLoans")}
                      value={values.kindOfLoans}
                    />
                  </View>
                ) : (
                  <Text />
                )}
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
                  <CancelBtn onPress={() => router.push('Auth/LoginScreen')} />
                  <View style={globalStyle.horizontalSpacer}></View>
                  <NextBtn disable={this.checking()} onPress={() => this.proceed()} />
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
});
