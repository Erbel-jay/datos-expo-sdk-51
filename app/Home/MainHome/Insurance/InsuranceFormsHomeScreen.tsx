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
  View,
  Modal
} from 'react-native';
import modalStyle from "../../../../components/Modal";
import { CardFormBox } from '../../../../components/cards';
import { globalStyle } from "../../../../assets/styles/globalStyle";
import { BackBtn, SubmitSmallBtn } from "../../../../components/Buttons";
const { _storeData, _retrieveData, _removeData } = require("../../../../helpers/global-function");
import { Feather } from "@expo/vector-icons";
import Config from "../../../../constants/Config";
import axios from 'axios';
import moment from "moment";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { datosBlack, datosLightGray, datosOrange, datosWhiteShade } from '../../../../assets/styles/colorUsed';
import { router } from 'expo-router';

export default class InsuranceHomeScreen extends React.Component<any, any> {
  focusListener: any;
  constructor(props: any) {
    super(props)
  }

  state: any = {
    current_user_object_id: '',
    firstName: '',
    userData: null,
    today: moment().format('MMM DD, YYYY'),
    insurance_id: '65408371d473906eb8335a39',
    insuranceDetails: null,
    isLoaded: false,
    loadingModal: false
  }

  async componentDidMount() {
    this.getInsuranceDetails()
    this.processUser()
  }

  getInsuranceDetails = async () => {
    axios.get(`${Config.api}/insurance/getInsurance/${this.state.insurance_id}`)
      .then(res => {
        this.setState({
          insuranceDetails: res.data.result
        })
      }).catch(err => {
        console.log('getInsuranceDetails err: ', err);
      })
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
  }


  getAllUserData = async () => {
    await axios.get(Config.api + `/user/getUser/${this.state.current_user_object_id}`)
      .then((res: any) => {
        console.log('userData', res.data.result.dynamicInsurancePersonalInformation);
        this.setState({
          userData: res.data.result,
        }, () => {
          this.setState({
            isLoaded: true
          })
        })
      })
      .catch(err => {
        console.log("ERROR:", err)
      })
  }

  submitButtonChecker = () => {
    try {
      let iPersonalInformation = this.state.userData.dynamicInsurancePersonalInformation
      let iFinancialStatus = this.state.userData.dynamicInsuranceFinancialStatus
      let iFamilyBackground = this.state.userData.dynamicInsuranceFamilyBackground
      let iRequirements = this.state.userData.dynamicInsuranceRequirements

      let returnValue = false
      if (!iPersonalInformation) {
        returnValue = true
      }
      if (!iFinancialStatus) {
        returnValue = true
      }
      if (!iFamilyBackground) {
        returnValue = true
      }
      if (!iRequirements) {
        returnValue = true
      }

      return returnValue

    } catch (err) {
      console.log("submitButtonChecker Error:", err);
    }
  }

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
          onPress: () => router.push('Home/MainHome'),
        },
      ],
      { cancelable: false }
    );
  };

  submit = async () => {
    try {
      this.setState({
        loadingModal: true
      })
      let data = {
        user_id: this.state.current_user_object_id,
        ins_id: this.state.insurance_id
      }
      axios.post(`${Config.api}/insuranceMember/createMember`, data)
        .then(res => {
          this.setState({
            loadingModal: false
          })
          this.alert("Info", "Insurance Forms Submitted Successfully!");
        })
        .catch(err => {
          this.setState({
            loadingModal: false
          })
          console.log('submit insurance error: ', err);
        })
    } catch (err) {
      console.log('Insurance Submit', err);
    }
  }

  render() {

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
          <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
            <View style={styles.commingSoonBgDesign}>
              <Text style={styles.commingSoonText}>Comming Soon</Text>
            </View>
            <BackBtn onPress={() => router.push('Home/MainHome/MainHomeScreen')} />
          </View>
        {/* {
          this.state.isLoaded ?
            <ScrollView>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={globalStyle.wrapper}>
                  <View style={{ alignItems: 'center', marginBottom: 25 }}>
                    <Image source={require(`../../../../assets/images/logos/Datos-official-logo-design-colored.png`)} style={styles.logo} />
                    <Text style={[globalStyle.commonText, { fontSize: 18, fontWeight: 'bold' }]}>Get Free Insurance</Text>
                  </View>

                  <CardFormBox
                    label="Personal Information"
                    onPress={() => router.push({pathname: "Home/MainHome/Insurance/InsurancePersonalInformationFormScreen", params: this.state.insuranceDetails})}
                  />

                  <CardFormBox
                    label="Family Background"
                    onPress={() => router.push({pathname: "Home/MainHome/Insurance/InsuranceFamilyBackgroundFormScreen", params: this.state.insuranceDetails})}
                  />

                  <CardFormBox
                    label="Financial Status"
                    onPress={() => router.push({pathname: "Home/MainHome/Insurance/InsuranceFinancialStatusFormScreen", params: this.state.insuranceDetails})}
                  />

                  <CardFormBox
                    label="Requirements"
                    onPress={() => router.push({pathname: "Home/MainHome/Insurance/InsuranceRequirementsFormScreen", params: this.state.insuranceDetails})}
                  />

                  <View style={{ alignItems: 'center' }}>
                    <Image
                      source={require(`../../../../assets/png_icons/prudential-1.png`)}
                      style={styles.insurancelogo}
                    />
                  </View>



                  <View style={[globalStyle.buttonHolder, { marginTop: 25 }]}>
                    <BackBtn onPress={() => router.push('Home/MainHome')} />
                    <View style={globalStyle.horizontalSpacer}></View>
                    <SubmitSmallBtn disable={this.submitButtonChecker()} onPress={() => this.submit()} />
                  </View>

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
            : <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
              <ActivityIndicator />
              <Text>Getting Details...</Text>
            </View>
        } */}
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
    backgroundColor: '#fff'
  },
  commingSoonBgDesign: {
    width: 300,
    backgroundColor: datosBlack,
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderColor: datosOrange,
    borderWidth: 2,
    marginBottom: 20
  },
  commingSoonText: {
    fontFamily: 'CalibriBold',
    fontSize: 30,
    color: '#fff',
    
  },
  retailerContainer: {
    padding: 10,
    marginBottom: 5
  },
  logo: {
    resizeMode: 'contain',
    width: 250,
    height: 120,
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
  },
  insurancelogo: {
    resizeMode: 'contain',
    width: 100,
    height: 120,
  }

});