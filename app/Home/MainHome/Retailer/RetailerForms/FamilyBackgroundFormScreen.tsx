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
import { AppInput, AppSelect, AppInputMask, DatePickerInput } from "../../../../../components/Inputs";
import { CancelBtn, BackBtn, NextBtn, SaveBtn } from "../../../../../components/Buttons";
// import { string } from 'prop-types';
// import firebase from "firebase";
import axios from "axios";
import Config from "../../../../../constants/Config";
const { _storeData, _retrieveData, getHeader } = require("../../../../../helpers/global-function");
import { router, Link, useLocalSearchParams } from 'expo-router';

const FamilyBackgroundFormScreen = () => {
  let localSearchParams = useLocalSearchParams()
  return <FamilyBackgroundFormScreenComponent localSearchParams={localSearchParams}/>

}

export default FamilyBackgroundFormScreen

class FamilyBackgroundFormScreenComponent extends React.Component<any, any> {
    constructor(props: any) {
        super(props)

    }

    state: any = {
        type: null,

        current_user_object_id: '',
        isLoaded: false,
        isLoanSubmitted: false,
        userData: null,

        retailer: {},
        fbFields: [],
        fbMarriedFields: [],
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
        let current_user = JSON.parse(current_user_data)
        this.setState({
            current_user_object_id: current_user._id,
            type: current_user.personalInformation.civilStatus
        }, () => {
            this.getRetailerDetails(this.state.retailer._id)
            this.getUserData();
        })
    }
    //next dynamic checking
    getRetailerDetails = async (retailer_id: any) => {
        try {
            axios.get(`${Config.api}/retailer/getRetailer/${retailer_id}`)
                .then(res => {
                    console.log('retailer details: ', res.data.result.fbFields);
                    console.log('reatiler Married: ', res.data.result.fbMarriedFields);
                    this.setState({
                        fbFields: res.data.result.fbFields,
                        fbMarriedFields: res.data.result.fbMarriedFields
                    })
                }).catch(err => {
                    console.log("getRetailerDetails Error: ", err);
                })
        } catch (err) {
            console.log('getRetailerDetails Error: ', err);
        }
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
                    // sLoanSubmitted: this.getLoanSubmitStatus(res.data.result.currentOngoingLoan, this.state.retailer._id)
                }, () => {
                    console.log('civilStatus', this.state.userData.personalInformation);
                    console.log('this.state.userData.dynamicFamilyBackground', this.state.userData.dynamicFamilyBackground);
                    //check if current data match the civil status
                    if(this.state.userData.dynamicFamilyBackground){
                        if (
                            (this.state.userData.personalInformation.civilStatus.toLowerCase() == 'single') ||
                            (this.state.userData.personalInformation.civilStatus.toLowerCase() == 'widow') ||
                            (this.state.userData.personalInformation.civilStatus.toLowerCase() == 'divorce')
                        ) {
                            if(this.compareArraysIgnoreValues(this.state.userData.dynamicFamilyBackground.data, this.state.fbFields) == true){
                                this.setState({
                                    fbFields: this.state.userData.dynamicFamilyBackground ? this.state.userData.dynamicFamilyBackground.data : this.state.fbFields,
                                }, () => {
                                    this.setState({ isLoaded: true })
                                })
                            }else{
                                this.setState({ isLoaded: true })
                            }
                        }else{
                            if(this.compareArraysIgnoreValues(this.state.userData.dynamicFamilyBackground.data, this.state.fbMarriedFields) == true){
                                this.setState({
                                    fbMarriedFields: this.state.userData.dynamicFamilyBackground ? this.state.userData.dynamicFamilyBackground.data : this.state.fbMarriedFields
                                }, () => {
                                    this.setState({ isLoaded: true })
                                })
                            }else{
                                this.setState({ isLoaded: true })
                            }
                        }
                    }else{
                        this.setState({ isLoaded: true })
                    }
                    // this.getData();
                })
            })
            .catch(err => {
                console.log("/getUser error:", err)
            })
    }

    compareArraysIgnoreValues = (array1: any, array2: any) => {
        // Check if the arrays have the same length
        if (array1.length !== array2.length) {
          return false;
        }
      
        // Iterate through each object in the arrays
        for (let i = 0; i < array1.length; i++) {
          const obj1 = array1[i];
          const obj2 = array2[i];
      
          // Check if the objects have the same number of properties
          if (Object.keys(obj1).length !== Object.keys(obj2).length) {
            return false;
          }
      
          // Iterate through each property of the objects
          for (const key in obj1) {
            // Check if the corresponding keys match
            if (!obj2.hasOwnProperty(key)) {
              return false;
            }
          }
        }
      
        // If all checks pass, the arrays are considered equal
        return true;
      }


    // getData = async () => {
    //     let object_id = this.state.current_user_object_id
    //     axios.get(Config.api + `/familyBackground/getFamilyBackground/${this.state.userData.family?._id}`)
    //         .then(res => {
    //             this.setState({ isLoaded: true })
    //             if (res.data.status == "success") {
    //                 if (res.data.result == null) {
    //                     console.log("no record");
    //                 } else {
    //                     let r: any = res.data.result
    //                     this.setState({
    //                         fbFields: this.state.userData.dynamicFamilyBackground ? this.state.userData.dynamicFamilyBackground.data : this.state.fbFields
    //                     })
    //                 }
    //             }
    //         })
    //         .catch(err => console.log(err))


    // }



    // checker = () => {
    //     let state = this.state
    //     if (this.state.isLoanSubmitted == true) {
    //         return true
    //     } else {
    //         if (state.type == "Single" || state.type == "Widowed") {
    //             if (
    //                 state.numberOfSiblings == null || state.numberOfSiblings == "" ||
    //                 state.mothersName == null || state.mothersName == "" ||
    //                 state.motherSourceOfIncome == null || state.motherSourceOfIncome == "" ||
    //                 state.motherGrossIncome == null || state.motherGrossIncome == "" ||
    //                 state.motherContactNumber == null || state.motherContactNumber == "" ||
    //                 state.fathersName == null || state.fathersName == "" ||
    //                 state.fatherSourceOfIncome == null || state.fatherSourceOfIncome == "" ||
    //                 state.fatherGrossIncome == null || state.fatherGrossIncome == "" ||
    //                 state.fatherContactNumber == null || state.fatherContactNumber == ""
    //             ) {
    //                 return true
    //             } else {
    //                 return false
    //             }
    //         } else {
    //             if (
    //                 state.numberOfChildren == null || state.numberOfChildren == "" ||
    //                 state.spouseName == null || state.spouseName == "" ||
    //                 state.spouseSourceOfIcome == null || state.spouseSourceOfIcome == "" ||
    //                 state.spouseGrossIncome == null || state.spouseGrossIncome == "" ||
    //                 state.spouseContactNumber == null || state.spouseContactNumber == ""
    //             ) {
    //                 return true
    //             } else {
    //                 return false
    //             }
    //         }
    //     }

    // }

    checker = () => {
        try {
            let returnValue = false;
            if (
                (this.state.userData.personalInformation.civilStatus.toLowerCase() == 'single') ||
                (this.state.userData.personalInformation.civilStatus.toLowerCase() == 'widow') ||
                (this.state.userData.personalInformation.civilStatus.toLowerCase() == 'divorce')
            ) {
                this.state.fbFields.map((field: any) => {
                    if ((field.isShow && field.isRequired) && (field.value == null || field.value == "")) {
                        returnValue = true
                    }
                })
            } else {
                this.state.fbMarriedFields.map((field: any) => {
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
            DFamilyBackground: (this.state.userData.personalInformation.civilStatus.toLowerCase() == 'single') ||
                (this.state.userData.personalInformation.civilStatus.toLowerCase() == 'widow') ||
                (this.state.userData.personalInformation.civilStatus.toLowerCase() == 'divorce') ? this.state.fbFields : this.state.fbMarriedFields
        }
        formData.append("data", JSON.stringify(data));

        let res: any = await axios.post(Config.api + "/familyBackground/updateFamilyBackground", formData)
            .then(res => {
                console.log("data", res.data)
                this.setState({
                    loadingModal: false
                })
                if (res.data.status == 'success') {
                    this.alert('Success!', "Family background Updated");
                }
            })
            .catch(err => console.log(err))
    }

    inputDyanmicFields = (index: number, value: any) => {
        try {
            if (
                (this.state.userData.personalInformation.civilStatus.toLowerCase() == 'single') ||
                (this.state.userData.personalInformation.civilStatus.toLowerCase() == 'widow') ||
                (this.state.userData.personalInformation.civilStatus.toLowerCase() == 'divorce')
            ) {
                let fbFields = [...this.state.fbFields];
                fbFields[index] = { ...fbFields[index], value: value };
                this.setState({ fbFields });
            } else {
                let fbMarriedFields = [...this.state.fbMarriedFields];
                fbMarriedFields[index] = { ...fbMarriedFields[index], value: value };
                this.setState({ fbMarriedFields });
            }

        } catch (err) {
            console.log('inputDyanmicFields error: ', err);
        }
    }

    render() {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={globalStyle.container}
            >
                {
                    this.state.isLoaded == false ?
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="small" color="#70788c" />
                            <Text style={globalStyle.commonText}>Loading Data...</Text>
                        </View>
                        :
                        <ScrollView>
                            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                <View style={globalStyle.wrapper}>

                                    <Text style={globalStyle.title}>Family Background</Text>
                                    {
                                        this.state.isLoanSubmitted == true ?
                                            <Text style={globalStyle.commonText}>All Informations has been submitted editing is not allowed.</Text>
                                            : null
                                    }
                                    <View style={globalStyle.inputHolder}>
                                        
                                        {
                                            (this.state.userData.personalInformation.civilStatus.toLowerCase() == 'single') ||
                                                (this.state.userData.personalInformation.civilStatus.toLowerCase() == 'widow') ||
                                                (this.state.userData.personalInformation.civilStatus.toLowerCase() == 'divorce') ?
                                                this.state.fbFields.map((field: any, i: number) => {
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
                                                :
                                                this.state.fbMarriedFields.map((field: any, i: number) => {
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
                                        }

                                    </View>

                                    <View style={globalStyle.buttonHolder}>
                                        <CancelBtn onPress={() => router.back()} />
                                        {this.state.type !== null ? <View style={globalStyle.horizontalSpacer}></View> : null}
                                        {this.state.type !== null ?
                                            <SaveBtn onPress={() => this.submitForm()} disable={this.checker()} />

                                            : null
                                        }

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
