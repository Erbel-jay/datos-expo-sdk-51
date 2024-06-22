import * as React from 'react';
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
  View,
  Modal
} from 'react-native';
import { globalStyle } from "../../../../../assets/styles/globalStyle";
import modalStyle from "../../../../../components/Modal";
import { AppInput, AppSelect, DatePickerInput, AppInputMask, DatePickerInputMask } from "../../../../../components/Inputs";
import { CancelBtn, BackBtn, NextBtn, SaveBtn } from "../../../../../components/Buttons";
// import firebase from "firebase"
import axios from 'axios'
import Config from "../../../../../constants/Config"
const { _storeData, _retrieveData } = require("../../../../../helpers/global-function");
import { router, Link, useLocalSearchParams } from 'expo-router';

const FinancialStatusFormScreen = () => {
  let localSearchParams = useLocalSearchParams()
  return <FinancialStatusFormScreenComponent localSearchParams={localSearchParams}/>
}

export default FinancialStatusFormScreen

class FinancialStatusFormScreenComponent extends React.Component<any, any> {
  constructor(props: any) {
    super(props)
  }

  state: any = {
    step: 1,
    soc: '',
    socOptions: [
      { label: "Employed", value: "Employed" },
      { label: "Self-employed", value: "Self-employed" },
    ],
    isLoaded: false,
    isLoanSubmitted: false,
    userData: null,

    retailer: {},
    fsFields: [],
    fsSelfEmployedFields: [],
    loadingModal: false
  }

  async componentDidMount() {
    if (this.props.localSearchParams !== undefined) {
      let params = this.props.localSearchParams
      console.log('retailer: ', params.name);
      console.log('retailer_id: ', params._id);
      this.setState({ retailer: params })
    }
    let current_user_data: any = await _retrieveData('current_user');
    let current_user = JSON.parse(current_user_data);
    if (current_user) {
      this.setState({
        current_user_object_id: current_user._id
      }, () => {
        this.getRetailerDetails(this.state.retailer._id)
        this.getUserData()
      })

    }
    this.getProvince();
  }

  getRetailerDetails = async (retailer_id: any) => {
    try {
      axios.get(`${Config.api}/retailer/getRetailer/${retailer_id}`)
        .then(res => {
          console.log('retailer details: ', res.data.result.fsFields);
          this.setState({
            fsFields: res.data.result.fsFields,
            fsSelfEmployedFields: res.data.result.fsSelfEmployedFields
          })
        }).catch(err => {
          console.log("getRetailerDetails Error: ", err);
        })
    } catch (err) {
      console.log('getRetailerDetails Error: ', err);
    }
  }

  callMe = async () => {
    this.setState({ current_user_object_id: 'nothing ---' })
  }

  getLoanSubmitStatus = (currentOngoingLoans: any, retailer_id: any) => {
    for (let i = 0; i < currentOngoingLoans.length; i++) {
      if (currentOngoingLoans[i].retailer == retailer_id) {
        return currentOngoingLoans[i].isLoanSubmitted
      }
    }
  }

  getUserData = () => {
    axios.get(Config.api + `/user/getUser/${this.state.current_user_object_id}`)
      .then(res => {
        this.setState({
          userData: res.data.result,
          isLoanSubmitted: this.getLoanSubmitStatus(res.data.result.currentOngoingLoan, this.state.retailer._id)
        }, () => {
          console.log('isLoanSubmitted', this.state.isLoanSubmitted);
          this.getData();
        })
      }).catch(err => {
        console.log('getUserData error -->', err);
      })
  }

  getData = () => {
    axios.get(Config.api + `/financialStatus/getFinancialStatus/${this.state.userData.financial?._id}`)
      .then(res => {
        this.setState({ isLoaded: true })
        if (res.data.status == "success") {
          if (res.data.result !== null) {
            let data = res.data.result
            console.log('getFinancialStatus result:', data);
            if(data.soc == 'Employed'){
              let fsFields = this.state.fsFields
              fsFields.map((f: any) => {
                if (this.state.userData.dynamicFinancialStatus && this.state.userData.dynamicFinancialStatus.data) {
                  this.state.userData.dynamicFinancialStatus.data.map((userSavedPI: any) => {
                    console.log('--------------------------------');
                    console.log('name', f.name);
                    console.log('vakue', f.value);
                    console.log('isRequired', f.isRequired);
                    console.log('--------------------------------');
                    if (f.name == userSavedPI.name) {
                      f.value = userSavedPI.value
                    }
                  })
                }
              })
              this.setState({
                soc: data.soc,
                fsFields
              })
            }else{
              let fsSelfEmployedFields = this.state.fsSelfEmployedFields
              fsSelfEmployedFields.map((f: any) => {
                if (this.state.userData.dynamicFinancialStatus && this.state.userData.dynamicFinancialStatus.data) {
                  this.state.userData.dynamicFinancialStatus.data.map((userSavedPI: any) => {
                    console.log('--------------------------------');
                    console.log('name', f.name);
                    console.log('vakue', f.value);
                    console.log('isRequired', f.isRequired);
                    console.log('--------------------------------');
                    if (f.name == userSavedPI.name) {
                      f.value = userSavedPI.value
                    }
                  })
                }
              })
              this.setState({
                soc: data.soc,
                fsSelfEmployedFields
              })
            }
          }
        }
      })
      .catch(err => console.log(err))
  }


  inputChange = (field: string) => (input: string) => {
    this.setState({ addressCallCount: this.state.addressCallCount++ })
    if (input == null) return;
    if (field == "barangay" || field == "city" || field == "province" || field == "street") {

      let employerAddress = Object.assign({}, this.state.employerAddress);
      if (field == "province") {
        // if(this.state.addressCallCount < 4 && this.state.isEmployerAddress){

        // }else{
        employerAddress["city"] = "";
        employerAddress["barangay"] = "";
        employerAddress[field] = input;
        this.setState({ employerAddress }, () => {
          this.getCity(input);
        });
        // }

      } else if (field == "city") {
        // if(this.state.addressCallCount < 4 && this.state.isEmployerAddress){

        // }else{
        employerAddress["barangay"] = "";
        employerAddress[field] = input;
        this.setState({ employerAddress }, () => {
          this.getBarangay(input);
        })
        // }
      } else if (field == "barangay") {
        // if(this.state.addressCallCount < 4 && this.state.isEmployerAddress){

        // }else{
        employerAddress[field] = input;
        this.setState({ employerAddress })
        // }
      } else if (field == "street") {
        // if(this.state.addressCallCount < 4 && this.state.isEmployerAddress){

        // }else{
        employerAddress[field] = input;
        this.setState({ employerAddress })
        // }
      }

    } else {
      if (field == 'dateHired') {
        let value: any = { [field]: input };
        this.setState(value, () => {
          let date = this.state.dateHired
          let d = new Date
          let presentYear = d.getFullYear()
          if (date.search("-") == -1) {
            if (parseFloat(date) > 12) {
              this.setState({ dateHired: '12' })
            }
          } else {
            let dateInput = date.split("-")
            if (parseFloat(dateInput[0]) > 12) {
              dateInput[0] = '12'
              this.setState({ dateHired: dateInput[0] })
            }
            if (parseFloat(dateInput[1]) > 31) {
              dateInput[1] = '31'
              this.setState({ dateHired: `${dateInput[0]}-${dateInput[1]}` })
            }
            if (parseFloat(dateInput[2]) > presentYear) {
              dateInput[2] = presentYear.toString();
              this.setState({ dateHired: `${dateInput[0]}-${dateInput[1]}-${dateInput[2]}` })
            }
          }
        });
      } else {
        let value: any = { [field]: input };
        this.setState(value);
      }
    }
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
      provinces
    })
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
      cities
    })
  }

  getBarangay(city: string = "") {
    const barangay = require("../../../../../helpers/json/brgy.json");
    let barangays: any = []
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
      barangays
    })
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
      dateHired: exdate,
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

  alert = (title: string, message: string) => {
    Alert.alert(
      title,
      message,
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        {
          text: "OK", onPress: () => router.push({pathname: 'Home/MainHome/Retailer/RetailerForms/FormsHomeScreen', params: this.state.retailer})
        }
      ],
      { cancelable: false }
    );
  }

  submitForm = async () => {
    this.setState({
      loadingModal: true
    })
    let formData = new FormData();
    let state = this.state
    let data = {
      object_id: state.current_user_object_id,
      retailer: this.state.retailer._id,
      soc: state.soc,
      DFinancialStatus: this.state.soc == 'Employed' ? this.state.fsFields : this.state.fsSelfEmployedFields
    }
    formData.append("data", JSON.stringify(data));
    axios.post(Config.api + "/financialStatus/updateFinancialStatus", formData)
      .then(res => {
        console.log("data", res.data.result);
        this.setState({
          loadingModal: false
        })
        if (res.data.status == 'success') {
          this.alert('Success!', "Financial Status Updated");
        }
      }).
      catch(err => {
        this.setState({
          loadingModal: false
        })
        console.log(err)
      })
  }

  inputDyanmicFields = (index: number, value: any) => {
    try {
      if(this.state.soc == 'Employed'){
        let fsFields = [...this.state.fsFields];
        fsFields[index] = { ...fsFields[index], value: value };
        this.setState({ fsFields });
      }else{
        let fsSelfEmployedFields = [...this.state.fsSelfEmployedFields];
        fsSelfEmployedFields[index] = { ...fsSelfEmployedFields[index], value: value };
        this.setState({ fsSelfEmployedFields });
      }
      
    } catch (err) {
      console.log('inputDyanmicFields error: ', err);
    }
  }

  checker = () => {
    try {
      let returnValue = false;
      if(this.state.soc == 'Employed'){
        this.state.fsFields.map((field: any) => {
          if ((field.isShow && field.isRequired) && (field.value == null || field.value == "")) {
            returnValue = true
          }
        })
      }else{
        this.state.fsSelfEmployedFields.map((field: any) => {
          if ((field.isShow && field.isRequired) && (field.value == null || field.value == "")) {
            returnValue = true
          }
        })
      }
      
      return returnValue
    } catch (err) {
      console.log('checker err:', err);
      return true
    }
  }

  render() {
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

                <Text style={globalStyle.title}>Financial Status</Text>
                {
                  this.state.isLoanSubmitted == true ?
                    <Text style={globalStyle.commonText}>All Informations has been submitted editing is not allowed.</Text>
                    : null
                }
                <View style={globalStyle.inputHolder}>

                  <AppSelect
                    placeholder="Source of income"
                    label="Source of income"
                    onChange={(soc: any) => this.setState({ soc })}
                    value={this.state.soc}
                    items={this.state.socOptions}
                    disable={this.state.isLoanSubmitted}
                  />

                  {
                    this.state.soc == 'Employed' ?
                    this.state.fsFields.map((field: any, i: number) => {
                      return <View style={globalStyle.inputHolder} key={i}>
                        {
                          field.isShow ?
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
                    : this.state.soc == 'Self-employed' ?
                    this.state.fsSelfEmployedFields.map((field: any, i: number) => {
                      return <View style={globalStyle.inputHolder} key={i}>
                        {
                          field.isShow ?
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
                    : null
                  }



                </View>
                <View style={globalStyle.buttonHolder}>
                  <BackBtn onPress={() => { router.back() }} />
                  <View style={globalStyle.horizontalSpacer}></View>
                  <SaveBtn disable={this.checker()} onPress={() => this.submitForm()} />
                  {/* <Text>{this.checker() ? "disable true" : "disable false"}</Text> */}
                </View>
              </View>

            </TouchableWithoutFeedback>
          </ScrollView>
        }
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

const styles = StyleSheet.create({});