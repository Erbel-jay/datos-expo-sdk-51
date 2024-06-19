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
  View,
  Text,
  Modal,
  ActivityIndicator
} from "react-native";
import { AppInput, AppSelect, DatePickerInput, AppInputMask, DatePickerInputMask } from "../../../../../components/Inputs";
import Constants from "expo-constants";
import { ScrollView } from "react-native-gesture-handler";
import { globalStyle } from "../../../../../assets/styles/globalStyle";
import { CancelBtn, BackBtn, NextBtn, SaveBtn } from "../../../../../components/Buttons";
import axios from "axios";
import Config from "../../../../../constants/Config";
const { _storeData, _retrieveData, _removeData } = require("../../../../../helpers/global-function");
import modalStyle from "../../../../../components/Modal";
import ProfileAttachmentFormScreen from "./ProfileAttachmentFormScreen"
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import { router, Link, useLocalSearchParams } from 'expo-router';


const PersonalInformationFormScreen = () => {
    let localSearchParams = useLocalSearchParams()
    return <PersonalInformationFormScreenComponent localSearchParams={localSearchParams}/>
  
}

export default PersonalInformationFormScreen

class PersonalInformationFormScreenComponent extends React.Component<any> {
  constructor(public props: any) {
    super(props);
  }

  state: any = {
    firstName: "",
    lastName: "",
    middleName: "",
    nameSuffix: "",
    mobileNumber: "",
    address: {
      street: "",
      barangay: "",
      city: "",
      province: "",
    },
    tempCity: "",
    tempBarangay: "",

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
    isDatePickerVisible: false,
    provinces: [],
    barangays: [],
    cities: [],

    loadingModal: false,
    step: 1,
    retailerDetails: {},
    piFields: []
  };

  componentDidMount = () => {
    if (this.props.route.params !== undefined) {
      let params = this.props.route.params
      this.setState({ retailerDetails: params }, () => {
        this.getRetailerDetails(this.state.retailerDetails._id)
        this.getProvince()
        this.processUser();
      })
    }

  }

  //need checking
  getRetailerDetails = async (retailer_id: any) => {
    try {
      axios.get(`${Config.api}/retailer/getRetailer/${retailer_id}`)
        .then(res => {
          this.setState({
            piFields: res.data.result.piFields
          }, () => {
            console.log('piFields', this.state.piFields);
          })
        }).catch(err => {
          console.log("getRetailerDetails Error: ", err);
        })
    } catch (err) {
      console.log('getRetailerDetails Error: ', err);
    }
  }

  processUser = async () => {
    let current_user_data: any = await _retrieveData('current_user');
    let current_user = JSON.parse(current_user_data);
    if (current_user) {
      axios.get(`${Config.api}/user/getUser/${current_user.id}`)
        .then(async res => {
          await _storeData('current_user', JSON.stringify(res.data.result))
          let personalInformation = res.data.result.personalInformation
          let personalAttachment = res.data.result.personalAttachment
          let piFields = this.state.piFields
          piFields.map((f: any) => {
            if(res.data.result.dynamicPersonalInformation && res.data.result.dynamicPersonalInformation.data){
              res.data.result.dynamicPersonalInformation.data.map((userSavedPI: any) => {
                if(f.name == userSavedPI.name){
                  f.value = userSavedPI.value
                }
              })
            }
          })
          this.setState({
            piFields
          })
          this.setState({
            current_user_object_id: current_user.id,
            firstName: personalInformation.firstName,
            lastName: personalInformation.lastName,
            middleName: personalInformation.middleName,
            mobileNumber: personalInformation.mobileNumber,
            civilStatus: personalInformation.civilStatus,

            tempStreet: personalInformation.address.street,
            tempProvince: personalInformation.address.province,
            tempCity: personalInformation.address.city,
            tempBarangay: personalInformation.address.barangay,

            piFields: this.state.piFields,

            primaryId: personalAttachment.primaryId,
            primaryType: personalAttachment.primaryType,
            secondaryId: personalAttachment.secondaryId,
            secondaryType: personalAttachment.secondaryType,
            profile: personalAttachment.profile
          }, () => {
            this.setState({
              address: {
                street: personalInformation.address.street,
                province: personalInformation.address.province
              }
            })
          })
        })
        .catch(err => {
          console.log('PersonalInformation screen axios getUser error: ', err);
        })

    }
  }

  componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
    if (this.state.tempProvince !== "" && this.state.provinces.length > 0 && this.state.address.province == "") {
      this.updateProvince();
    }
    if (this.state.tempCity !== "" && this.state.cities.length > 0 && this.state.address.city == "") {
      this.updateCity();
    }

    if (this.state.tempBarangay !== "" && this.state.barangays.length > 0 && this.state.address.barangay == "") {
      this.updateBarangay();
    }
  }

  updateProvince = () => {
    this.setState({
      address: {
        street: this.state.tempStreet,
        province: this.state.tempProvince
      }
    }, () => {
      this.inputChange("province")
    })
  }

  updateCity = () => {
    this.setState({
      address: {
        street: this.state.address.street,
        province: this.state.address.province,
        city: this.state.tempCity
      }
    }, () => {
      this.inputChange("city")
    })
  }

  updateBarangay = () => {
    this.setState({
      address: {
        street: this.state.address.street,
        province: this.state.address.province,
        city: this.state.address.city,
        barangay: this.state.tempBarangay
      }
    }, () => {
      this.inputChange("barangay")
    })
  }

  checking = () => {
    let returnValue = false
    if (
      this.state.lastName == "" ||
      this.state.firstName == "" ||
      this.state.middleName == "" ||
      this.state.mobileNumber == "" ||
      this.state.mobileNumber.length !== 13 ||
      this.state.address.street == "" ||
      this.state.address.barangay == "" ||
      this.state.address.city == "" ||
      this.state.address.province == ""
    ) {
      returnValue = true;
    }

    this.state.piFields.map((f: any) => {

      console.log("-------------------------------------");
      console.log("field isRequired", f.isRequired);
      console.log("field name", f.name);
      console.log("field value", f.value);
      console.log("-------------------------------------");

      if((f.isShow && f.isRequired) && (f.value == null || f.value == "")){
        returnValue = true
      }
    })

    return returnValue
  };

  validateEmail(email: any) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  savePersonalInformation = async () => {
    try {
      this.setState({
        loadingModal: true,
      });
      let formData = new FormData();
      let state = this.state;
      let data = {
        retailer_id: this.state.retailerDetails._id,
        personalInformation: {
          firstName: state.firstName,
          lastName: state.lastName,
          middleName: state.middleName,
          mobileNumber: state.mobileNumber,
          address: state.address,
          civilStatus: state.civilStatus,
        },
        dPersonalInformation: this.state.piFields,
        // accountInformation: {
        //   username: state.username,
        //   password: state.password,
        // },
        personalAttachment: {
          primaryId: "",
          secondaryId: "",
          primaryType: state.primaryType,
          secondaryType: state.secondaryType,
          profile: state.profile,
        },
        // socialID: state.social_id,
        // code: this.state.code
      };
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
      axios.patch(Config.api + `/user/updateUserDetailsNew/${this.state.current_user_object_id}`, formData)
        .then(async (res) => {
          if (res.data.status == "success") {
            this.setState({
              loadingModal: false,
              loadingProgress: 0,
            }, async () => {
              let newUserDetails = JSON.stringify(res.data.result)
              await _storeData('current_user', newUserDetails)
              router.push('Home/MainHome/Retailer/RetailerForms');
            });
          }
        })
        .catch(err => {
          this.setState({
            loadingModal: false,
          });
          Alert.alert("Info", err.message);
        })
    } catch (err) {
      console.log("savePersonalInformation Error: ", err);
    }

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
    console.log('exdate', exdate);
    return exdate
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

  getProvince() {
    const province = require("../../../../../helpers/json/province.json");
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

  getCity(province: string = "") {
    const city = require("../../../../../helpers/json/city.json");
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

  getBarangay(city: string = "") {
    const barangay = require("../../../../../helpers/json/brgy.json");
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

  inputChange = (field: string) => (input: string) => {
    if (input == null) return;
    if (
      field == "barangay" ||
      field == "city" ||
      field == "province" ||
      field == "street"
    ) {
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

  getPermissionAsync = async () => {
    const { status } = await Permissions.askAsync(
      Permissions.CAMERA,
      Permissions.MEDIA_LIBRARY
    );
    console.log("STATUS", status);
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      // alert(`Permission Status: ${status}`);
    }
  };

  selectPhoto = async (field: string) => {
    await this.getPermissionAsync();
    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      // aspect: [4, 4],
      quality: 0.2,
    //   type: "jpeg",
    });
    if (!pickerResult.canceled) {
      let value: any = { [field]: pickerResult.assets[0].uri };
      this.setState(value);
    }
  };

  takePhoto = async (field: string) => {
    await this.getPermissionAsync();
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


  back = () => {
    this.setState({
      step: this.state.step - 1
    })
  }

  nextStep = () => {
    this.setState({
      step: this.state.step + 1
    })
  }

  inputDyanmicFields = (index: number, value: any) => {
    try {
      let piFields = [...this.state.piFields];
      piFields[index] = { ...piFields[index], value: value };
      this.setState({ piFields });
    } catch (err) {
      console.log('inputDyanmicFields error: ', err);
    }
  }


  

  render() {
    const {
      primaryId,
      secondaryId,
      primaryType,
      primaryOptions,
      secondaryType,
      secondaryOptions,
      profile
    } = this.state
    const values = {
      primaryId,
      secondaryId,
      primaryType,
      primaryOptions,
      secondaryType,
      secondaryOptions,
      profile
    }
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View>
              {
                this.state.step == 1 ?
                <View style={globalStyle.wrapper}>
                    <View
                      style={{ alignItems: "flex-start", padding: 10, marginTop: 10 }}
                    >
                      <Text style={globalStyle.title}>
                        Personal Information
                      </Text>
                    </View>
                    <View style={{ marginTop: 5, justifyContent: 'flex-start', alignItems: 'flex-start', width: '100%' }}>
                      <Text style={[globalStyle.title, { fontSize: 12 }]}>
                        Basic Information
                      </Text>
                    </View>
                    <View style={[styles.inputHolder, { paddingBottom: 25 }]}>
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

                      <AppSelect
                        placeholder="Civil Status"
                        onChange={this.inputChange("civilStatus")}
                        value={this.state.civilStatus}
                        items={this.state.civilStatusOptions}
                      />

                      <View style={{ marginTop: 20, justifyContent: 'flex-start', alignItems: 'flex-start', width: '100%' }}>
                        <Text style={[globalStyle.title, { fontSize: 12 }]}>
                          Address
                        </Text>
                      </View>
                      <AppInput
                        placeholder="Street number or House #"
                        label="Street number or House #"
                        onChange={this.inputChange("street")}
                        value={this.state.address.street}
                      />
                      <AppSelect
                        placeholder="Province"
                        onChange={this.inputChange("province")}
                        value={this.state.address.province}
                        items={this.state.provinces}
                      />
                      <AppSelect
                        placeholder="City"
                        onChange={this.inputChange("city")}
                        value={this.state.address.city}
                        items={this.state.address.province != "" ? this.state.cities : []}
                      />
                      <AppSelect
                        placeholder="Barangay"
                        onChange={this.inputChange("barangay")}
                        value={this.state.address.barangay}
                        items={this.state.address.city != "" ? this.state.barangays : []}
                      />

                      <View style={{ marginTop: 20, justifyContent: 'flex-start', alignItems: 'flex-start', width: '100%' }}>
                        <Text style={[globalStyle.title, { fontSize: 12 }]}>
                          Additional Information
                        </Text>
                      </View>

                      {
                        this.state.piFields.map((field: any, i: number) => {
                          return <View style={globalStyle.inputHolder} key={i}>
                            {
                              field.isShow ?
                              (field.name.toLowerCase() == 'birthdate' || field.name.toLowerCase() == 'birthday' || field.name.toLowerCase() == 'birth day')?
                              <DatePickerInputMask
                                label="Birthday"
                                placeholder="Birthday (mm-dd-yyyy)"
                                onChangeText={(value: any) => this.inputDyanmicFields(i, value)}
                                value={field.value}
                                onConfirm={(value: any) => this.inputDyanmicFields(i, this.confirmPicker(value))}
                                onCancel={this.hidePicker}
                                mode="date"
                                isVisible={this.state.isDatePickerVisible}
                                showDatePicker={this.showDatePicker}
                                returnKeyType="done"
                                keyboardType="number-pad"
                                type={"datetime"}
                                options={{
                                  format: "MM-DD-YYYY",
                                }}
                                maxLength={10}
                                editable={true}
                              />
                              :
                              <AppInput
                                placeholder={field.name}
                                label={field.name}
                                onChange={(value: any) => this.inputDyanmicFields(i, value)}
                                value={field.value}
                                optional={!field.isRequired}
                              />
                              : null
                            }
                          </View>
                        })
                      }

                      {/* <AppSelect
                        placeholder="Gender"
                        onChange={this.inputChange("gender")}
                        value={this.state.gender}
                        items={this.state.genderOptions}
                      />

                      <DatePickerInputMask
                        label="Birthday"
                        placeholder="Birthday (mm-dd-yyyy)"
                        onChangeText={this.inputChange("birthday")}
                        value={this.state.birthday}
                        onConfirm={this.confirmPicker}
                        onCancel={this.hidePicker}
                        mode="date"
                        isVisible={this.state.isDatePickerVisible}
                        showDatePicker={this.showDatePicker}
                        returnKeyType="done"
                        keyboardType="number-pad"
                        type={"datetime"}
                        options={{
                          format: "MM-DD-YYYY",
                        }}
                        maxLength={10}
                        editable={true}
                      /> */}

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
                        <CancelBtn onPress={() => router.back()} />
                        <View style={globalStyle.horizontalSpacer}></View>
                        <NextBtn disable={this.checking()} onPress={() => this.nextStep()} />
                      </View>
                    </View>
                  </View>
                  :
                  <ProfileAttachmentFormScreen
                    primaryId={this.state.primaryId}
                    primaryType={this.state.primaryType}
                    secondaryId={this.state.secondaryId}
                    secondaryType={this.state.secondaryType}
                    savePersonalInformation={this.savePersonalInformation}
                    values={values}
                    inputChange={this.inputChange}
                    selectPhoto={this.selectPhoto}
                    takePhoto={this.takePhoto}
                    back={this.back}
                    onPressRemovePhoto={this.onPressRemovePhoto}
                  />
              }
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
        <Modal
          visible={this.state.loadingModal}
          animationType="slide"
          transparent={true}
        >
          <View style={modalStyle.modalContent}>
            <ActivityIndicator
              size="large"
              color="#1C3789"
              animating={this.state.loadingModal}
            />
            <Text style={{ color: "#555555", fontSize: 15, marginLeft: 10 }}>
              Saving Details please wait...
            </Text>
          </View>
        </Modal>
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
