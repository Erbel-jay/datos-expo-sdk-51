import * as React from "react";
import {
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  Modal,
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  ScrollView
} from "react-native";
import { AppInput, AppSelect, DatePickerInputMask, RequirementsImagePicker, AppInputMask } from "../../components/Inputs";
// import { ScrollView } from "react-native-gesture-handler";
import * as ImagePicker from "expo-image-picker";
import AccountInformation from "./AccountInformation";
import Config from "../../constants/Config";
import axios from "axios";
import { CancelBtn, BackBtn, NextBtn, SaveBtn } from "../../components/Buttons";
import { globalStyle } from "../../assets/styles/globalStyle";
import modalStyle from "../../components/Modal";
import { router, useLocalSearchParams } from "expo-router";

const {
  _storeData,
  _retrieveData,
  getCurrentUser,
  _mergeData,
  _removeData,
} = require("../../helpers/global-function");
interface RNpickerOptions {
  label: string;
  value: string;
}
interface State {
  //Personal Information
  firstName: string;
  lastName: string;
  middleName: string;
  nameSuffix: string;
  gender: string;
  civilStatus: string;
  religion: String;
  birthday: string;
  email: string;
  mobileNumber: string;
  address: any;
  findUs: string;
  existingLoan: string;
  whereDidLoan: string;
  kindOfLoans: string;
  //Account Information
  username: string;
  password: string;
  confirmPassword: string;
  //Profile Attachment
  primaryId: any;
  primaryType: any;
  primaryOptions: any;
  secondaryId: any;
  secondaryType: any;
  secondaryOptions: any;
  profile: any;
  isDatePickerVisible: boolean;
  suffixOptions: Array<RNpickerOptions>;
  genderOptions: Array<RNpickerOptions>;
  civilStatusOptions: Array<RNpickerOptions>;
  step: number;
  loadingModal: boolean;
  loadingProgress: number;
  social_id: string;
  provinces: any;
  barangays: any;
  cities: any;
  saveInfoVisible: boolean;
  dataToRemember: any;
  code: any,
  isValid: any,
  isValidEmail: any,
  codeVerified: boolean
}

const SignupScreen = () => {
  let localSearchParams = useLocalSearchParams()
  return <SignupScreenComponent localSearchParams={localSearchParams}/>
}

export default SignupScreen

 class SignupScreenComponent extends React.Component<any, State> {
  constructor(public props: any) {
    super(props);
  }
  state: State = {
    //Personal Information
    firstName: "",
    lastName: "",
    middleName: "",
    nameSuffix: "",
    gender: "",
    civilStatus: "",
    religion: "",
    birthday: "",
    email: "",
    mobileNumber: "",
    address: {
      street: "",
      barangay: "",
      city: "",
      province: "",
    },
    findUs: "",
    existingLoan: "",
    whereDidLoan: "",
    kindOfLoans: "",
    //Account Information
    username: "",
    password: "",
    confirmPassword: "",
    //Profile Attachment
    primaryId: "",
    primaryType: "",
    secondaryId: "",
    secondaryType: "",
    profile: "",
    primaryOptions: [
      { label: "SSS", value: "SSS" },
      { label: "Passport", value: "Passport" },
      { label: "Driver License", value: "Driver License" },
      { label: "UMID", value: "UMID" },
      { label: "Philhealth", value: "Philhealth" },
      { label: "T.I.N", value: "T.I.N" },
      { label: "Postal ID", value: "Postal ID" },
      { label: "Voters ID", value: "Voters ID" },
      { label: "PRC ID", value: "PRC ID" },
      { label: "Senior Citizen ID", value: "Senior Citizen ID" },
      { label: "OFW ID", value: "OFW ID" }

    ],
    secondaryOptions: [
      { label: "Company ID", value: "Company ID" },
      { label: "PAG IBIG ID", value: "PAG IBIG ID" },
      { label: "NBI Clearance", value: "NBI Clearance" },
      { label: "Police Clearance", value: "Police Clearance" },
      { label: "Barangay Clearance", value: "Barangay Clearance" },
      { label: "Birth Certificate", value: "Birth Certificate" },
      { label: "Marriage Certificate", value: "Marriage Certificate" },
      { label: "Community Tax Certificate (Cedula)", value: "Community Tax Certificate (Cedula)" },
      { label: "GSIS ID", value: "GSIS ID" },
      { label: "IBP ID", value: "IBP ID" },
      { label: "Diplomat ID", value: "Diplomat ID" },
      { label: "GOCC and Government Office ID", value: "GOCC and Government Office ID" },
      { label: "Alien Certification of Registration", value: "Alien Certification of Registration" },

    ],
    isDatePickerVisible: false,
    suffixOptions: [
      { label: "Jr.", value: "Jr." },
      { label: "Sr.", value: "Sr." },
    ],
    genderOptions: [
      { label: "Male", value: "Male" },
      { label: "Female", value: "Female" },
      { label: "Other", value: "Other" },
    ],
    civilStatusOptions: [
      { label: "Single", value: "Single" },
      { label: "Married", value: "Married" },
      { label: "Widow", value: "Widow" },
      { label: "Live-in-partner", value: "Live-in-partner" },
    ],
    step: 1,
    loadingModal: false,
    loadingProgress: 0,

    social_id: "",
    provinces: [],
    barangays: [],
    cities: [],
    saveInfoVisible: true,
    dataToRemember: null,
    code: null,
    isValid: null,
    isValidEmail: null,
    codeVerified: false
  };

  componentDidMount() {
    let {social_id, firstName, lastName, middleName, suffix} = this.props.localSearchParams
    console.log("🚀 ~ SignupScreenComponent ~ componentDidMount ~ social_id:", social_id)
    if (social_id !== undefined) {
      console.log("social_id", social_id);
      this.setState({
        social_id: social_id
          ? social_id
          : "",
        firstName: firstName
          ? firstName
          : "",
        lastName: lastName
          ? lastName
          : "",
        middleName: middleName
          ? middleName
          : "",
        nameSuffix: suffix
          ? suffix
          : "",
      });
    }
    
    this.getProvince();
  }

  confirmPicker = (pickeddate: any) => {
    let day = pickeddate.getDate();
    let month = pickeddate.getMonth() + 1;
    let year = pickeddate.getFullYear();
    console.log("A date has been picked: " + month + "-" + day + "-" + year);
    if (day < 10) {
      day = "0" + day;
    } else if (day > 10) {
      day = day;
    }
    if (month < 10) {
      month = "0" + month;
    } else if (month > 10) {
      month = month;
    }
    let exdate = month + "-" + day + "-" + year;
    this.setState({
      birthday: exdate,
      isDatePickerVisible: false,
    });
  };

  showDatePicker = () => {
    this.setState({
      isDatePickerVisible: true,
    });
  };

  hidePicker = () => {
    this.setState({
      isDatePickerVisible: false,
    });
  };

  nextStep = () => {
    const { step, social_id } = this.state;

    if (step == 1 && social_id == "") {
      this.setState({ step: step + 1 });
    }

    if (step == 1 && (social_id && social_id != "")) {
      this.confirmDetails();
    }
    if (step == 2) {
      this.confirmDetails();
    }


  };

  jumpStep = (step: number) => {
    this.setState({ step });
  };

  back = () => {
    const { step, social_id } = this.state;
    let num = social_id && social_id != "" && step == 3 ? 2 : 1;
    // let num = 1
    this.setState({ step: step - num });
  };

  inputChange = (field: string) => (input: string) => {
    if (input == null) return;
    if (
      field == "barangay" ||
      field == "city" ||
      field == "province" ||
      field == "street"
    ) {
      // this.setState((prevState) => {
      // let address = Object.assign({}, prevState.address);
      // if (field == "province") {
      //   address["city"] = "";
      //   address["barangay"] = "";
      //   this.getCity(input);
      //   this.getBarangay();
      // } else if (field == "city") {
      //   address["barangay"] = "";
      //   this.getBarangay(input);
      // }
      // address[field] = input;
      // return { address };
      // });

      let address = Object.assign({}, this.state.address);
      if (field == "province") {
        address["city"] = "";
        address["barangay"] = "";
        address[field] = input;
        this.setState({ address }, () => {
          this.getCity(input);
        });
      } else if (field == "city") {
        address["barangay"] = "";
        address[field] = input;
        this.setState({ address }, () => {
          this.getBarangay(input);
        })
      }
      else if (field == "barangay") {
        address[field] = input;
        this.setState({ address })

      } else if (field == "street") {
        address[field] = input;
        this.setState({ address })
      }

    } else {
      if (field == 'birthday') {
        let value: any = { [field]: input };
        this.setState(value, () => {
          let date = this.state.birthday
          let d = new Date
          let presentYear = d.getFullYear()
          if (date.search("-") == -1) {
            if (parseFloat(date) > 12) {
              this.setState({ birthday: '12' })
            }
          } else {
            let dateInput = date.split("-")
            if (parseFloat(dateInput[0]) > 12) {
              dateInput[0] = '12'
              this.setState({ birthday: dateInput[0] })
            }
            if (parseFloat(dateInput[1]) > 31) {
              dateInput[1] = '31'
              this.setState({ birthday: `${dateInput[0]}-${dateInput[1]}` })
            }
            if (parseFloat(dateInput[2]) > presentYear) {
              dateInput[2] = presentYear.toString();
              this.setState({ birthday: `${dateInput[0]}-${dateInput[1]}-${dateInput[2]}` })
            }

          }
        });
      } else {
        let value: any = { [field]: input };
        this.setState(value);
      }
    }
  };

  getState = () => {
    return this.state;
  };

  getMediaLibraryPermissionAsync = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    console.log("STATUS", status);
    if (status !== "granted") {
      alert("Sorry, we need media library permissions to make this work!");
      // alert(`Permission Status: ${status}`);
    }
  };

  getCameraRollPermissionAsync = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    console.log("STATUS", status);
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      // alert(`Permission Status: ${status}`);
    }
  };

  selectPhoto = async (field: string) => {
    await this.getMediaLibraryPermissionAsync();
    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      // aspect: [4, 4],
      quality: 0.2,
      // type: "jpeg",
    });
    if (!pickerResult.canceled) {
      let value: any = { [field]: pickerResult.assets[0].uri };
      this.setState(value);
    }
  };

  takePhoto = async (field: string) => {
    await this.getCameraRollPermissionAsync();
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      // aspect: [4, 4],
      quality: 0.2,
      // type: "jpeg",
    });
    if (!result.canceled) {
      let value: any = { [field]: result.assets[0].uri };
      this.setState(value);
    }
  };

  onPressRemovePhoto = (field: any) => {
    let value: any = { [field]: "" };
    this.setState(value);
  };


  checking = () => {
    if (
      this.state.lastName == "" ||
      this.state.firstName == "" ||
      this.state.middleName == "" ||
      this.state.mobileNumber == "" ||
      this.state.mobileNumber.length !== 13 ||
      this.state.profile == ""
    ) {
      return true;
    }
    return false;
  };


  makeid(length: number) {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  confirmDetails = async () => {
    console.log('confirmDetails called');
    this.setState({
      loadingModal: true,
    });
    let option: any = {
      onUploadProgress: (event: any) => {
        const percentCompleted = Math.round(
          (event.loaded * 100) / event.total
        );
        console.log("onUploadProgress", percentCompleted);
        this.setState({
          loadingProgress: percentCompleted,
        });
      },
    };
    let formData = new FormData();
    let state = this.state;
    let data = {
      personalInformation: {
        firstName: state.firstName,
        lastName: state.lastName,
        middleName: state.middleName,
        nameSuffix: state.nameSuffix,
        gender: state.gender,
        civilStatus: state.civilStatus,
        religion: state.religion,
        birthday: state.birthday,
        email: state.email,
        mobileNumber: state.mobileNumber,
        address: state.address,
        findUs: state.findUs,
        existingLoan: state.existingLoan,
        whereDidLoan: state.whereDidLoan,
        kindOfLoans: state.kindOfLoans,
      },
      accountInformation: {
        username: state.username,
        password: state.password,
      },
      personalAttachment: {
        primaryId: "",
        secondaryId: "",
        primaryType: state.primaryType,
        secondaryType: state.secondaryType,
        profile: "",
      },
      socialID: state.social_id,
      code: this.state.code
    };
    console.log('data: ', data);
    let primaryId = state.primaryId;
    let secondaryId = state.secondaryId;
    let profile = state.profile;

    var seen: any = [];
    let stringy = JSON.stringify(data, function (key, val) {
      if (val != null && typeof val == "object") {
        if (seen.indexOf(val) >= 0) {
          return;
        }
        seen.push(val);
      }
      return val;
    });
    formData.append("data", stringy);

    if (primaryId && primaryId != "") {
      let primary: any = {
        name: "primaryId" + ".jpg",
        uri: primaryId,
        type: "image/jpeg",
      };
      formData.append("primaryId", primary);
    }
    if (secondaryId && secondaryId != "") {
      let secondary: any = {
        name: "secondaryId" + ".jpg",
        uri: secondaryId,
        type: "image/jpeg",
      };
      formData.append("secondaryId", secondary);
    }
    if (profile && profile != "") {
      let prof: any = {
        name: "profile" + ".jpg",
        uri: profile,
        type: "image/jpeg",
      };
      formData.append("profile", prof);
    }
    //erro handlers
    axios.post(Config.api + "/signup", formData, option)
      .then(async (res) => {
        if (res.data.status == "success") {
          let response = res.data.result.user;
          response.accountInformation.password = state.password;
          await _storeData("current_user", JSON.stringify(res.data.result.user));
          await _storeData("token", JSON.stringify(res.data.result.token));
          this.setState({
            loadingModal: false,
            loadingProgress: 100,
            dataToRemember: res.data.result.user,
          });
          this.setState({
            step: 3,
          });
        }
      })
      .catch(err => {
        this.setState({
          loadingModal: false,
          loadingProgress: 0,
        });
        Alert.alert("Info", err.message);
      })

  };

  getCity(province: string = "") {
    const city = require("../../helpers/json/city.json");
    let cities: any = [];
    if (province == "") {
      cities = city.RECORDS.map((list: any, key: any) => {
        return {
          key,
          label: list.citymunDesc,
          value: list.citymunCode,
        };
      });
    } else {
      cities = city.RECORDS.filter((items: any) => {
        return items.provCode === province;
      }).map((list: any) => {
        return {
          label: list.citymunDesc,
          value: list.citymunCode,
        };
      });
    }
    this.setState({
      cities,
    });
  }
  getProvince() {
    const province = require("../../helpers/json/province.json");
    let provinces: any = [];
    provinces = province.map((list: any) => {
      return {
        label: list.provDesc,
        value: list.provCode,
      };
    });
    this.setState({
      provinces,
    });
  }
  getBarangay(city: string = "") {
    const barangay = require("../../helpers/json/brgy.json");
    let barangays: any = [];
    if (city == "") {
      barangays = barangay.RECORDS.map((list: any, key: number) => {
        return {
          label: list.brgyDesc,
          value: list.brgyDesc,
        };
      });
    } else {
      barangays = barangay.RECORDS.filter((items: any) => {
        return items.citymunCode === city;
      }).map((list: any) => {
        return {
          label: list.brgyDesc,
          value: list.brgyDesc,
        };
      });
    }
    this.setState({
      barangays,
    });
  }
  async saveProfile() {
    let dataToRemember = this.state.dataToRemember;
    await _storeData("last_user_loggedin", JSON.stringify(dataToRemember));
    let current_user_list: any[] = [];
    let user_list_data = await _retrieveData("user_list");
    let user_list = JSON.parse(user_list_data || "[]");
    console.log("USER LIST", user_list);
    if (user_list.length == 0) {
      console.log("user list is undefined");
      let user = await getCurrentUser();
      if (user !== undefined) {
        let current_user_data = JSON.parse(user);
        current_user_data.accountInformation.password = this.state.password;
        current_user_list.push(current_user_data);
        // if(this.state.rememberMe == true){
        await _storeData("user_list", JSON.stringify(current_user_list));
        // }
      }
    } else {
      let user = await getCurrentUser();
      if (user !== undefined) {
        console.log("user has data");
        let current_user_data = JSON.parse(user);
        current_user_data.accountInformation.password = this.state.password;
        let user_list_data = await _retrieveData("user_list");
        let user_list = JSON.parse(user_list_data);

        let usersArray: any[] = [];
        usersArray = user_list;
        for (let i = 0; i < usersArray.length; i++) {
          if (current_user_data._id == usersArray[i]._id) {
            console.log("MATCH!");
            if (
              current_user_data.accountInformation.password ==
              usersArray[i].accountInformation.password
            ) {
              console.log("PASSWORD MATCH!");
            } else {
              usersArray.splice(i, 1, current_user_data);
              console.log("REMOVED AND PUSHED!");
            }
          }
        }

        if (
          this.checkIfUserExistOnList(usersArray, current_user_data) == false
        ) {
          console.log("not on the array");
          usersArray.push(current_user_data);
        } else {
          console.log("on the array");
        }

        // if(this.state.rememberMe == true){
        await _storeData("user_list", JSON.stringify(usersArray));
        // }
      }
    }
  }

  checkIfUserExistOnList = (usersArray: any[], current_user_data: any) => {
    for (let i = 0; i < usersArray.length; i++) {
      if (usersArray[i]._id === current_user_data._id) {
        return true;
      }
    }

    return false;
  };

  changeStateValue = (stateName: any, value: any) => {
    let set: any = { [stateName]: value };
    this.setState(set);
  }

  navigateToHome = () => {
    this.setState({
      step: 1,
      saveInfoVisible: false,
    });
    router.push("Home")
  }

  render() {
    const {
      step,
      firstName,
      lastName,
      middleName,
      nameSuffix,
      gender,
      civilStatus,
      religion,
      birthday,
      email,
      mobileNumber,
      address,
      findUs,
      whereDidLoan,
      existingLoan,
      kindOfLoans,
      suffixOptions,
      isDatePickerVisible,
      genderOptions,
      civilStatusOptions,
      username,
      password,
      confirmPassword,
      loadingModal,
      loadingProgress,
      primaryId,
      secondaryId,
      primaryType,
      primaryOptions,
      secondaryType,
      secondaryOptions,
      profile,
      provinces,
      barangays,
      cities,
      social_id,
      code,
      isValid,
      isValidEmail,
      codeVerified
    } = this.state;
    const values = {
      firstName,
      lastName,
      middleName,
      nameSuffix,
      gender,
      civilStatus,
      religion,
      birthday,
      email,
      mobileNumber,
      address,
      findUs,
      existingLoan,
      whereDidLoan,
      kindOfLoans,
      username,
      password,
      confirmPassword,
      loadingModal,
      loadingProgress,
      primaryId,
      secondaryId,
      primaryType,
      primaryOptions,
      secondaryType,
      secondaryOptions,
      profile,
      provinces,
      barangays,
      cities,
      social_id,
      code,
      isValid,
      isValidEmail,
      codeVerified
    };
    switch (step) {
      case 1:
        return (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={{ flex: 1, paddingTop: 100 }}>

                <ScrollView>
                  <View style={[globalStyle.wrapper]}>
                    <Text style={globalStyle.title}>
                      Personal Information
                    </Text>
                    <RequirementsImagePicker
                      onPressTakePhoto={() => this.takePhoto('profile')}
                      onPressUploadPhoto={() => this.selectPhoto('profile')}
                      exist={this.state.profile !== "" ? true : false}
                      photoUri={this.state.profile}
                      onPressRemovePhoto={() => this.onPressRemovePhoto('profile')}
                      label="Profile"
                    />

                    <AppInput
                      placeholder="First Name"
                      label="First Name"
                      onChange={this.inputChange("firstName")}
                      value={this.state.firstName}
                    />
                    <AppInput
                      placeholder="Last Name"
                      label="Last Name"
                      onChange={this.inputChange("lastName")}
                      value={this.state.lastName}
                    />
                    <AppInput
                      placeholder="Middle Name"
                      label="Middle Name"
                      onChange={this.inputChange("middleName")}
                      value={this.state.middleName}
                    />

                    <AppSelect
                      placeholder="Civil Status"
                      onChange={this.inputChange("civilStatus")}
                      value={this.state.civilStatus}
                      items={civilStatusOptions}
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

                    <View style={globalStyle.buttonHolder}>
                      <CancelBtn onPress={() => router.back()} />
                      <View style={globalStyle.horizontalSpacer}></View>
                      {this.state.social_id !== ""
                        ? <SaveBtn disable={this.checking()} onPress={() => this.nextStep()} />
                        : <NextBtn disable={this.checking()} onPress={() => this.nextStep()} />
                      }

                    </View>
                  </View>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
            <Modal
              visible={this.state.loadingModal}
              animationType="slide"
              transparent={true}
            >
              <View style={modalStyle.modalContent}>
                <ActivityIndicator
                  size="large"
                  color="#1C3789"
                  animating={values.loadingModal}
                />
                <Text style={{ color: "#555555", fontSize: 15, marginLeft: 10 }}>
                  Processing please wait...
                </Text>
              </View>
            </Modal>
          </KeyboardAvoidingView>
        );
      case 2:
        return (
          <AccountInformation
            nextStep={this.nextStep}
            values={values}
            inputChange={this.inputChange}
            back={this.back}
            changeStateValue={this.changeStateValue}
          />
        );
      case 3:
        return (
          <Modal
            visible={this.state.saveInfoVisible}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <View
                  style={{ justifyContent: "center", alignItems: "center" }}
                >
                  <Image
                    source={
                      values.profile && values.profile != ""
                        ? { uri: values.profile }
                        : require("../../assets/images/test-images/profile.png")
                    }
                    style={styles.profile}
                  />
                </View>
                <View>
                  <Text style={styles.commonText}>
                    {values.firstName} {values.lastName}
                  </Text>
                </View>
                <View
                  style={{ flexDirection: "row", justifyContent: "flex-end" }}
                >
                  <Text
                    style={{
                      padding: 10,
                      fontFamily: "CalibriRegular",
                      fontSize: 15,
                    }}
                  >
                    Save Login Info?
                  </Text>
                </View>
                <View style={{ flexDirection: "row" }}>
                  <CancelBtn
                    onPress={() => {
                      this.navigateToHome()
                    }}
                  />
                  <View style={{ width: 10 }}></View>
                  <SaveBtn
                    disable={false}
                    onPress={async () => {
                      let dataToRemember = this.state.dataToRemember;
                      await _storeData(
                        "last_user_loggedin",
                        JSON.stringify(dataToRemember)
                      );
                      let current_user_list: any[] = [];
                      if ((await _retrieveData("user_list")) == undefined) {
                        let user = await getCurrentUser();
                        if (user !== undefined) {
                          let current_user_data = JSON.parse(user);
                          current_user_data.accountInformation.password = this.state.password;
                          current_user_list.push(current_user_data);
                          await _storeData(
                            "user_list",
                            JSON.stringify(current_user_list)
                          );
                        }
                      }
                      this.navigateToHome()
                    }}
                  />
                </View>
                <TouchableOpacity
                  style={styles.closeModal}
                  onPress={() => {
                    this.navigateToHome()
                  }}
                >
                  <Text style={{ fontSize: 30, color: "#e71409" }}>
                    &times;
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: 'center'
  },
  //modal styles
  commonText: {
    padding: 10,
    fontFamily: "OpenSansRegular",
    fontSize: 15,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0, 0.3)",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 6,
    padding: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: "80%",
    height: "40%",
    justifyContent: "center",
    alignItems: "center",
  },
  profile: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  closeModal: {
    position: "absolute",
    top: 5,
    right: 10,
  },
  eachUser: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    flexDirection: "row",
    width: "100%",
  },
  switchProfileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 20,
  },
});
