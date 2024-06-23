import * as React from 'react';
import { 
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  ActivityIndicator,
  Modal,
  Text,
  View
} from 'react-native';
import axios from 'axios';
import { globalStyle } from "../../../assets/styles/globalStyle";
import Config from "../../../constants/Config"
import { AppInput, AppInputMask } from '../../../components/Inputs';
import { datosOrange } from '../../../assets/styles/colorUsed';
import {router, useLocalSearchParams} from 'expo-router'

const CustomerDetailsMAPScreen = () => {
    const localSearchParams = useLocalSearchParams();
    return <CustomerDetailsMAPScreenComponent localSearchParams={localSearchParams} />
}

export default CustomerDetailsMAPScreen

class CustomerDetailsMAPScreenComponent extends React.Component {
    constructor(public props: any){
        super(props)
    }

    state: any = {
       retailer: {},

       firstName: '',
       lastName: '',
       email: '',
       middleName: '',
       mobileNumber: '',
    }

    componentDidMount(){
        if (this.props.localSearchParams !== undefined) {
            let params = this.props.localSearchParams
            this.setState({
              retailer: params
            })
        }
    }

    check = () => {
      let state = this.state
      if(
        (state.firstName !== '') &&
        (state.lastName !== '') &&
        (state.middleName !== '') &&
        (state.email.search('@') !== -1) &&
        (state.email.search('.com') !== -1) &&
        (state.email !== '') &&
        (state.email !== '') &&
        (state.mobileNumber !== '')
      ){
        console.log("disabled is false");
        return false
      }else{
        console.log("disabled is true");
        return true
      }
    }

    confirmDetails = () => { // not using
      try{
        let data ={
          firstName: this.state.firstName,
          email: this.state.email,
          mobileNumber: this.state.mobileNumber,
          middleName: this.state.middleName,
          lastName: this.state.lastName,
        }
          let url = Config.api + `/xendit/createXenditCustomer`
          axios.post(url, {data: data})
          .then((res) => {
            console.log("result data", res.data.result);
          })
          .catch(err => {
            console.log("err", err);
          })
      }catch(err){
        console.log("Error: ", err);
      }
    }

    navigateToPaymentPage = () => {
      let state = this.state
      let data = {
        retailer: state.retailer,
        firstName: state.firstName,
        lastName: state.lastName,
        middleName: state.middleName,
        email: state.email,
        mobileNumber: state.mobileNumber
      }

      router.push({pathname: 'PaymentMAPScreen', params: data})
    }

  render(){
    return (
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={globalStyle.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView>
            <View style={globalStyle.wrapper}>

              <View style={styles.retailersHolder}>
                <View style={styles.retailerHolder}>
                    <Image source={this.state.retailer.logo ? { uri: this.state.retailer.logo } : require("../../../assets/images/test-images/profile.png")} style={styles.logo}/>
                    <Text style={[globalStyle.commonText, styles.retailerName]}>{this.state.retailer.name}</Text>
                </View>
              </View>

              <Text style={globalStyle.title}>Are these informations correct?</Text>

              <View style={styles.inputHolder}>
                <AppInput
                  placeholder="First Name"
                  label="First Name"
                  onChange={(firstName: any) => this.setState({firstName})}
                  value={this.state.firstName}
                />
              
                <AppInput
                  placeholder="Last Name"
                  label="Last Name"
                  onChange={(lastName: any) => this.setState({lastName})}
                  value={this.state.lastName}
                />

                <AppInput
                  placeholder="Middle Name"
                  label="Middle Name"
                  onChange={(middleName: any) => this.setState({middleName})}
                  value={this.state.middleName}
                />

                <AppInput
                  placeholder="E-mail"
                  label="E-mail"
                  onChange={(email: any) => this.setState({email})}
                  value={this.state.email}
                  autoCapitalize="none"
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
                  onChangeText={(mobileNumber: any) => this.setState({mobileNumber})}
                />

                <TouchableOpacity onPress={() => this.navigateToPaymentPage()} style={[styles.confirmBtn, {backgroundColor: this.check() == true ? '#eee' : datosOrange}]} disabled={this.check()}>
                  <Text style={[styles.btnText, {marginHorizontal: 10}]}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  }
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  inputHolder: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  confirmBtn: {
    backgroundColor: datosOrange, 
    paddingHorizontal: 40,
    paddingVertical: 5,
    borderRadius: 50
  },
  btnText: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'OpenSansRegular',
    fontWeight: 'bold'
  },

  logo: {
    resizeMode: 'cover',
    width: 50,
    height: 50,
    borderRadius: 23,
    marginRight: 10
  },
  retailersHolder: {
  },
  retailerHolder: { 
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center', //Centered vertically
  },
  retailerName: {
    flex: 1,
  }
});
