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
import {router, useLocalSearchParams} from 'expo-router'

const CustomerDetailsScreen = () => {
    const localSearchParams = useLocalSearchParams()
    return <CustomerDetailsScreenComponent localSearchParams={localSearchParams} />
}

export default CustomerDetailsScreen

class CustomerDetailsScreenComponent extends React.Component {
    constructor(public props: any){
        super(props)
    }

    state: any = {
        current_user_object_id: '',
        xenditCustomerID: "",

        referenceID: '',
        firstName: '',
        lastName: '',
        email: '',
        middleName: '',
        mobileNumber: '',
    }

    componentDidMount(){
        console.log("route params", this.props.localSearchParams);
        if (this.props.localSearchParams !== undefined) {
            let params = this.props.localSearchParams
            this.setState({
              current_user_object_id: params.user_id,
              referenceID: params.referenceID,
              firstName: params.firstName,
              lastName: params.lastName,
              middleName: params.middleName,
              email: params.email,
              mobileNumber: params.mobileNumber,
            })
        }
    }

    check = () => {
      let state = this.state
      if(
        (state.current_user_object_id !== '') &&
        (state.referenceID !== '') &&
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

    confirmDetails = () => {
      try{
        let data ={
          user_id: this.state.current_user_object_id,
          referenceID: this.state.referenceID,
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

  render(){
    return (
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={globalStyle.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView>
            <View style={globalStyle.wrapper}>
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

                <TouchableOpacity style={[styles.confirmBtn, {backgroundColor: this.check() == true ? '#eee' : '#E71409'}]} disabled={this.check()}>
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
  inputHolder: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  confirmBtn: {
    marginTop: 10,
    padding: 10,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6
  },
  btnText: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'OpenSansRegular',
    fontWeight: 'bold'
  },
});
