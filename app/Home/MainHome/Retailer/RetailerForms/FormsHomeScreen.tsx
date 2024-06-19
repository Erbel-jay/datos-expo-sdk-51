import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  Text,
  View
} from 'react-native';
import { CardFormBox } from '../../../../../components/cards';
import { CancelBtn, ProceedBtn, SubmitSmallBtn } from "../../../../../components/Buttons"
import { globalStyle } from "../../../../../assets/styles/globalStyle";
const { _storeData, _retrieveData, _removeData } = require("../../../../../helpers/global-function");
import { Feather } from "@expo/vector-icons";
import Config from "../../../../../constants/Config";
import axios from 'axios';
import moment from "moment";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { datosBlack, datosLightGray, datosOrange, datosWhiteShade } from '../../../../../assets/styles/colorUsed';
import { BackBtn } from "../../../../../components/Buttons"
import { router, Link, useLocalSearchParams } from 'expo-router';


const FormsHomeScreen = () => {
  let localSearchParams = useLocalSearchParams()
  return <FormsHomeScreenComponent localSearchParams={localSearchParams}/>
}

export default FormsHomeScreen

class FormsHomeScreenComponent extends React.Component<any, any> {
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
    advisories: [],
    tracker: [],

    retailer: {},
    retailerLoanDetails: null,
    currentOngoingLoans: []
  }

  async componentDidMount() {
    if (this.props.route.params !== undefined) {
      let params = this.props.route.params
      this.setState({ retailer: params })
    }
    this.processUser()
  }

  processUser = async () => {
    const { navigation } = this.props;
    let current_user_data: any = await _retrieveData('current_user');
    let current_user = JSON.parse(current_user_data);
    if (current_user) {
      this.setState({
        current_user_object_id: current_user.id,
        firstName: current_user.personalInformation.firstName
      }, () => {
        this.getAllUserData();
      })
    }

    this.focusListener = navigation.addListener('focus', async () => {
      let current_user_data: any = await _retrieveData('current_user');
      let current_user = JSON.parse(current_user_data);
      this.setState({
        current_user_object_id: current_user.id,
        firstName: current_user.personalInformation.firstName
      })
    });

  }

  getLoanSubmitStatus = (currentOngoingLoans: any, retailer_id: any) => {
    for (let i = 0; i < currentOngoingLoans.length; i++) {
      if (currentOngoingLoans[i].retailer == retailer_id) {
        this.setState({
          retailerLoanDetails: currentOngoingLoans[i],
        })
      }
    }
  }

  isReadyToSubmit = () => {
    let retailerLoanDetails = this.state.data
    if (
      retailerLoanDetails?.dynamicPersonalInformation !== null &&
      retailerLoanDetails?.dynamicFinancialStatus !== null &&
      retailerLoanDetails?.dynamicFamilyBackground !== null &&
      retailerLoanDetails?.requirements !== null
    ) {
      console.log('isReadyToSubmit status: TRUE');
      return true
    } else {
      console.log('isReadyToSubmit status: FALSE');
      return false
    }

  }

  getAllUserData = () => {
    axios.get(Config.api + `/user/getUser/${this.state.current_user_object_id}`)
      .then(async (res: any) => {
        this.setState({
          data: res.data.result,
        })
        this.getLoanSubmitStatus(res.data.result.currentOngoingLoan, this.state.retailer._id)
        this.navigateToFormOnLoad(res.data.result)
      })
      .catch(err => {
        console.log("ERROR:", err)
      })
  }

  

  getUserNewUpdatedDataAfterSubmitForm = async () => {
    axios.get(Config.api + `/user/getUser/${this.state.current_user_object_id}`)
    .then(async (res: any) => {
      await _storeData('current_user', JSON.stringify(res.data.result));
      router.push('Home')
    })
    .catch(err => {
      console.log("getUserNewUpdatedDataAfterSubmitForm ERROR:", err)
    })
  }

  navigateToFormOnLoad = (userDetails: any) => {
    let personalInformation = userDetails.dynamicPersonalInformation
    let familyBackground = userDetails.dynamicFamilyBackground
    let financialStatus = userDetails.dynamicFinancialStatus
    let requirments = userDetails.requirements

    

    if (!personalInformation) {
      router.push({pathname: 'Home/MainHome/Retailer/RetailerForms/PersonalInformationFormScreen', params: this.state.retailer})
      return;
    }

    if (!financialStatus) {
      router.push({pathname: 'Home/MainHome/Retailer/RetailerForms/FinancialStatusFormScreen', params: this.state.retailer})
      return;
    }

    if (!familyBackground) {
      router.push({pathname: 'Home/MainHome/Retailer/RetailerForms/FamilyBackgroundFormScreen', params: this.state.retailer});
      return;
    }

    if (!requirments) {
      router.push({pathname: 'Home/MainHome/Retailer/RetailerForms/RequirementsFormScreen', params: this.state.retailer});
      return;
    }
  }

  submitAllForm = () => {
    axios.get(Config.api + `/user/getUser/${this.state.current_user_object_id}`)
      .then((res: any) => {
        this.setState({
          data: res.data.result
        }, () => {
          let financial = this.state.data.financial ? true : false
          let family = this.state.data.family ? true : false
          let requirements = this.state.data.requirements ? true : false
          let product = this.state.data.product ? true : false

          if (financial == true && family == true && requirements == true && product == true) {
            this.alert('Info', "After Submitting these informations all forms will not be editable.")

          } else {
            Alert.alert('Info', "Please fill in all the forms before submitting!.")
          }
        })
      })
      .catch(err => {
        console.log("ERROR:", err)
      })
  }

  SubmitAll = async () => {
    axios.post(Config.api + `/user/submitAllForms/${this.state.current_user_object_id}`, {loan_id: this.state.retailerLoanDetails._id})
      .then((res: any) => {
        Alert.alert('Success', 'All forms submitted. Thank you!');
          this.getUserNewUpdatedDataAfterSubmitForm()
          router.push('Home')
      })
      .catch(err => {
        console.log("ERROR:", err);
        Alert.alert('Failed', 'Something went wrong!');
      })
  }

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
          text: "OK", onPress: () => this.SubmitAll()
        }
      ],
      { cancelable: false }
    );
  }

  selectLoan = (loan: any) => {
    console.log("selected Loan"), loan
    // this.setState({
    //   loanDisplayInfo: loan
    // })
  }


  submitNewApplication = async () => {
    let res = await axios.post(Config.api + `/user/submitNewApplication/${this.state.current_user_object_id}`, { user_id: this.state.current_user_object_id })
      .then((res: any) => {
        this.getAllUserData()
      })
  }

  cancelRetailerApplication = async (retailer_name: any, loan_id: any) => {
    Alert.alert(
      "Are you sure?",
      `Cancelling your application on ${retailer_name} will clear all the information on requirements form.`,
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        {
          text: "Continue", onPress: async () => {
            let res = await axios.post(Config.api + `/user/cancelRetailerApplication/${this.state.current_user_object_id}`, { loan_id: loan_id })
              .then((res: any) => {
                Alert.alert(
                  "Cancelled",
                  "Application Successfully Cancelled!"
                )
                this.getAllUserData()
                _removeData('retailerDetails')
              })
          }
        }
      ],
      { cancelable: false }
    );
  }

  render() {

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={globalStyle.wrapper}>
              <View style={{ alignItems: 'center', marginBottom: 25 }}>
                <Image source={{ uri: this.state.retailer.logo }} style={styles.logo} />
                <Text style={[globalStyle.commonText, { fontSize: 18, fontWeight: 'bold' }]}>{this.state.retailer.name}</Text>
              </View>
              
              <CardFormBox
                label="Personal Information"
                onPress={() => router.push({pathname: "Home/MainHome/Retailer/RetailerForms/PersonalInformationFormScreen", params: this.state.retailer})}
              />

              <CardFormBox
                label="Financial Status"
                onPress={() => router.push({pathname: "Home/MainHome/Retailer/RetailerForms/FinancialStatusFormScreen", params: this.state.retailer})}
              />

              <CardFormBox
                label="Family Background"
                onPress={() => router.push({pathname: "Home/MainHome/Retailer/RetailerForms/FamilyBackgroundFormScreen", params: this.state.retailer})}
              />

              <CardFormBox
                label="Requirements"
                onPress={() => router.push({pathname: "Home/MainHome/Retailer/RetailerForms/RequirementsFormScreen", params: this.state.retailer})}
              />

              <View style={[globalStyle.buttonHolder, { marginTop: 50 }]}>
                <BackBtn onPress={() => router.back()} />
                <View style={globalStyle.horizontalSpacer}></View>
                <SubmitSmallBtn disable={!this.isReadyToSubmit()} onPress={() => this.submitAllForm()} />
              </View>
              {/* <Text>isReadySubmit Status: {!this.isReadyToSubmit()}</Text> */}

              <View style={styles.bottomTextContainer}>
                <Text style={[globalStyle.commonText, { fontSize: 14, color: '#646464' }]}>
                  By clicking Submit, I have read and accepted the Datos
                  <Text onPress={() => alert('hello')} style={[globalStyle.commonText, { fontSize: 14, color: datosOrange }]}> Terms and Condition </Text>
                  and
                  <Text style={[globalStyle.commonText, { fontSize: 14, color: datosOrange }]}> Privacy Policy </Text>
                </Text>
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
    backgroundColor: '#fff'
  },
  retailerContainer: {
    padding: 10,
    marginBottom: 5
  },
  logo: {
    resizeMode: 'cover',
    width: 150,
    height: 150,
  },
  retailerName: {
    flex: 1,
  },
  bottomTextContainer: {
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 50,
  },
  bottomTextLink: {
    justifyContent: 'center',
    alignItems: 'center',
  }

});
