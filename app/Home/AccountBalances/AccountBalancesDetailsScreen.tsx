import * as React from 'react';
import { 
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  ActivityIndicator,
  Alert ,
  Image,
  TouchableOpacity,
  Clipboard,
  Modal,
  Dimensions,
  Text,
  View
} from 'react-native';
import axios from 'axios';
import { globalStyle } from "../../../assets/styles/globalStyle";
const { _storeData, _retrieveData } = require("../../../helpers/global-function");
import Config from "../../../constants/Config"
import Icon from '@expo/vector-icons/build/Feather';
import { showMessage, hideMessage } from "react-native-flash-message";
import Moment from 'moment';
import { AppInput, AppInputMask } from '../../../components/Inputs';
import { datosBlack, datosOrange } from '../../../assets/styles/colorUsed';
import {router, useLocalSearchParams } from 'expo-router'

const AccountBalancesDetailsScreen = () => {
    const localSearchParams = useLocalSearchParams()
    return <AccountBalancesDetailsScreenComponent localSearchParams={localSearchParams} />
}

export default AccountBalancesDetailsScreen

 class AccountBalancesDetailsScreenComponent extends React.Component<any, any> {
  constructor(props: any) {
    super(props)
  }

  state: any = {
    current_user_object_id: '',
    currentUserDetails: {},
    retailer_id: '',
    logo: '',
    overDue: [],
    isLoaded: false,
    retailerType: '',
    
    breakdownModalVisible: false,
    descModalVisible: false,
    paymentModalVisible: false,
    remarksClicked: '',
    SMERecords: [],
    lastElementSMERecord: {},

    agingSummaryRecords: [],
    totalCurrent: 0,
    totalNoneCurrent: 0,
    totalBalance: 0,

    //payment modal
    referenceID: '',
    amount: "",
    email: "",
    note: "",
  }

  async componentDidMount() {
    if (this.props.localSearchParams !== undefined) {
        console.log('retailer_id: ', this.props.localSearchParams.retailer_id);
      this.setState({
        retailer_id: this.props.localSearchParams.retailer_id
          ? this.props.route.params.retailer_id
          : "",
      });

      this.setState({
        logo: this.props.localSearchParams.logo
          ? this.props.localSearchParams.logo
          : "",
      });

      this.setState({
        retailerType: this.props.localSearchParams.retailerType
          ? this.props.localSearchParams.retailerType
          : "",
      }, () => {
        console.log("retailerType", this.state.retailerType);
      });
      let current_user_data: any = await _retrieveData('current_user');
      let current_user = JSON.parse(current_user_data);
      if (current_user) {
        this.setState({
          currentUserDetails: current_user,
          email: current_user.personalInformation.email !== "" ? current_user.personalInformation.email : ""
        })
          this.setState({
              current_user_object_id: current_user._id
          }, () => {
              if(this.state.retailerType == "Financing"){
                this.getNewAccountBalancesFinancingRecord(this.state.current_user_object_id, this.state.retailer_id);
              }else{
                this.getSMEByAccountNumberRecordsForApp(this.state.current_user_object_id, this.state.retailer_id);
              }
          })
      }
    }
  }

  getNewAccountBalancesFinancingRecord = async (current_user_object_id: any, retailer_id: any) => {
    try{
      let res = await axios.get(Config.api + `/retailer/getNewAccountBalancesFinancingRecord/${current_user_object_id}/${retailer_id}`)
      .then(res => {
        console.log("Financing Records", res.data.result);
        let newArray: any[] = [];
        for(let i = 0; i < res.data.result.length; i++){
          let data = {
            name: res.data.result[i].Customer,
            account_number: res.data.result[i].AccountNo,
            amount_due: res.data.result[i].ExistingBalance,
            retailer_code: res.data.result[i].retailer_id.code,
            acro: res.data.result[i].retailer_id.acro
          }
          newArray.push(data)
        }
        this.setState({overDue: newArray}, () => {
          this.setState({
            isLoaded: true
          })
        })
      })
      .catch(err => console.log("err", err))
    }catch(err){
      console.log("err", err);
    }
  }

  getSMEByAccountNumberRecordsForApp = async (user_id: any, retailer_id: any) =>{
    try{
      await axios.get(Config.api + `/sme/getSMEByAccountNumberRecordsForApp/${retailer_id}/${user_id}`)
      .then(res => {
        
        this.setState({
          SMERecords: res.data.result,
          lastElementSMERecord: res.data.result[res.data.result.length -1]
        })
        let totalCurrent = 0
        let totalNoneCurrent = 0
        let totalBalance = 0
        for(let i = 0;i < res.data.result.length; i++){
          if(res.data.result[i].NonCurrent == false){
            totalCurrent += res.data.result[i].remaining_sidr_amount_balance
          }else{
            totalNoneCurrent += res.data.result[i].remaining_sidr_amount_balance
          }
        }
        totalBalance = totalCurrent + totalNoneCurrent
        this.setState({
          totalCurrent,
          totalNoneCurrent,
          totalBalance
        })
  
      })
      this.setState({
        isLoaded: true
      })
    }catch(err){
      console.log("getSMEByAccountNumberRecords ERROR: ", err);
    }

  }



  undbindUserToAccountNo = async (AccountNo: any) => {
    try{
      let res = await axios.post(Config.api + `/retailer/undbindUserToAccountNo/`, {AccountNo: AccountNo})
      .then(res => {
        Alert.alert("Success!", "Account Removed!")
        this.setState({isLoaded: false})
        this.getNewAccountBalancesFinancingRecord(this.state.current_user_object_id, this.state.retailer_id);
      })
      .catch(err => {
        console.log("ERROR:", err)
        Alert.alert("Failed!", "Someting went wrong!")
      })
    }catch(err){
      console.log("Error", err);
    }
  }

  copyAccountNumber = (account_number: any) => {
      console.log("account_number", account_number);
      Clipboard.setString(account_number);
      showMessage({
        message: "Account Number Copied!",
        type: "success",
      });
  }

  showBreakdownModal = () => {
    this.setState({
      breakdownModalVisible: true
    })
  }

  showDescModal(remarks: any){
    this.setState({
      breakdownModalVisible: false,
      descModalVisible: true,
      remarksClicked: remarks
    })
  }

  payNow = () => {
    let user_id = this.state.current_user_object_id
    let referenceID = this.state.retailerType !== 'Financing' ? `${this.state.lastElementSMERecord.acro}${this.state.lastElementSMERecord.accountNumber}` : `${this.state.overDue[this.state.overDue.length -1].acro ? this.state.overDue[this.state.overDue.length -1].acro : ''}${this.state.overDue[this.state.overDue.length -1].account_number}`
    let email = this.state.currentUserDetails.personalInformation.email !== "" ? this.state.currentUserDetails.personalInformation.email : ""
    let retailer_id = this.state.retailer_id
    let firstName = this.state.currentUserDetails.personalInformation.firstName
    let lastName = this.state.currentUserDetails.personalInformation.lastName
    let middleName = this.state.currentUserDetails.personalInformation.middleName
    let mobileNumber = this.state.currentUserDetails.personalInformation.mobileNumber

    let data = {
      user_id,
      referenceID,
      retailer_id,
      email,
      firstName, 
      lastName,
      middleName,
      mobileNumber,
    }

    // if(this.state.currentUserDetails.xenditCustomerID){
      router.push({pathname: 'Home/AccountBalances/PaymentScreen', params: data})
    // }else{
    //   this.props.navigation.navigate('CustomerDetailsScreen', data)
    // }
  }

  check = () => {
    if(
      (this.state.email !== "") && 
      (this.state.amount !== "") &&
      (this.state.email.search('@') !== -1) &&
      (this.state.email.search('.com') !== -1)
      ){
        return false
    }else{
      return true
    }
  }

  render(){
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={globalStyle.container}
      >
        <View style={styles.titleWrapper}>
          {/* <Text style={globalStyle.title}>Aging Summary</Text> */}
          <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <Image source={{uri: this.state.logo !== '' ? this.state.logo : 'https://placeholderlogo.com/img/placeholder-logo-1.png'}} style={styles.logo}/>
          </View>
        </View>

        <ScrollView>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>

              {
                this.state.isLoaded == false ?
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="small" color="#70788c" />
                    <Text style={globalStyle.commonText}>Fetching Account Balances...</Text>
                  </View>
                :
                  this.state.retailerType !== "Financing" ?
                  this.state.lastElementSMERecord?.name !== undefined ?
                    <View style={{marginTop: 20}}>
                      <View style={styles.dataHolder}>
                        <Text style={styles.dataName}>{this.state.lastElementSMERecord.name}</Text>
                        <View style={styles.accountNumberHolder}>
                          <View style={styles.accountNumberDetails}>
                            <Text style={styles.accountNumberLabel}>Account Number</Text>
                            <Text style={styles.accountNumber}>{`${this.state.lastElementSMERecord.acro}${this.state.lastElementSMERecord.accountNumber}`}</Text>
                          </View>
                          <TouchableOpacity onPress={() => this.copyAccountNumber(`${this.state.lastElementSMERecord.acro}${this.state.lastElementSMERecord.accountNumber}`)}>
                            <Icon 
                              name="copy"
                              color="#001f50"
                              size={24}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={[styles.dataHolder, {marginTop: 10}]}>
                        <View style={styles.accountNumberDetails}>
                            <TouchableOpacity style={styles.accountBreakDownBtn} onPress={() => this.showBreakdownModal()}>
                              <Icon 
                                name={'arrow-right'}
                                color={'#e71409'}
                                size={20}
                              />
                              <Text style={[globalStyle.commonText, {color: '#e71409'}]}> View Account Breakdown</Text>
                            </TouchableOpacity>
                          <Text style={styles.accountNumberLabel}>Total Amount Due</Text>
                          <Text style={styles.accountNumber}>PHP {this.state.lastElementSMERecord.runningBalance}</Text>
                        </View>
                      </View>

                      <View style={{justifyContent: 'center', alignItems: 'center'}}>
                        <TouchableOpacity style={styles.paynow} onPress={() => this.payNow()}>
                          <Text style={styles.paynowText}>Pay Now</Text>
                        </TouchableOpacity>
                      </View>
                      {
                        this.state.retailerType == "Financing" ?
                        <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 5}}> 
                          <Text style={styles.accountNumber}>Not your account?</Text>
                          <TouchableOpacity onPress={() => this.undbindUserToAccountNo('')}>
                            <Text style={[styles.accountNumber, {color: 'red', marginLeft: 5}]}>Remove Now</Text>
                          </TouchableOpacity>
                        </View>
                        : null
                      }
                    </View>
                  :
                  <View style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Text>No Record to show.</Text>
                  </View>
                  : 
                    this.state.overDue.length > 0 ?
                      this.state.overDue.map((od: any, i: number) => {
                        return(
                          <View style={{marginTop: 20}} key={i}>
                            <View style={styles.dataHolder}>
                              <Text style={styles.dataName}>{od.name}</Text>
                              <View style={styles.accountNumberHolder}>
                                <View style={styles.accountNumberDetails}>
                                  <Text style={styles.accountNumberLabel}>Account Number</Text>
                                  <Text style={styles.accountNumber}>{`${od.acro ? od.acro : ''}${od.account_number}`}</Text>
                                </View>
                                <TouchableOpacity onPress={() => this.copyAccountNumber(`${od.acro ? od.acro : ''}${od.account_number}`)}>
                                  <Icon 
                                    name="copy"
                                    color="#001f50"
                                    size={24}
                                  />
                                </TouchableOpacity>
                              </View>
                            </View>

                            <View style={[styles.dataHolder, {marginTop: 10}]}>
                              <View style={styles.accountNumberDetails}>
                                <Text style={styles.accountNumberLabel}>Total Amount Due</Text>
                                <Text style={styles.accountNumber}>PHP {od.overAllAmountDue}</Text>
                              </View>
                            </View>

                            <View style={{justifyContent: 'center'}}>
                              <TouchableOpacity style={styles.paynow} onPress={() => this.payNow()}>
                                <Text style={styles.paynowText}>Pay Now</Text>
                              </TouchableOpacity>
                            </View>
                            {
                              this.state.retailerType == "Financing" ?
                              <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 5}}> 
                                <Text style={styles.accountNumber}>Not your account?</Text>
                                <TouchableOpacity onPress={() => this.undbindUserToAccountNo(od.account_number)}>
                                  <Text style={[styles.accountNumber, {color: 'red', marginLeft: 5}]}>Remove Now</Text>
                                </TouchableOpacity>
                              </View>
                              : null
                            }
                            
                          </View>
                        );
                      })
                    :
                    <View style={{justifyContent: 'center', alignItems: 'center'}}>
                      <Text>No Record to show.</Text>
                    </View>
              }

            </View>
          </TouchableWithoutFeedback>
        </ScrollView>


        <Modal
          visible={this.state.breakdownModalVisible}
          animationType="fade"
          transparent={true}
        >
          <View style={styles.modalContent}>
            <View style={{ backgroundColor: 'white', borderRadius: 6, padding: 20, width: Dimensions.get('screen').width - 60  }}>
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => this.setState({breakdownModalVisible: false})}>
              <Text style={styles.exBtn}>&times;</Text>
            </TouchableOpacity>


              <View>
                <View style={styles.breaKdownContent}>
                  <View style={styles.breakdownColumns}>
                    <Text style={styles.breakDownColumnTitle}>SI/DR NO.</Text>
                    <View style={styles.breakdownColumnContent}>
                      {
                        this.state.SMERecords.map((sr:any, i: number) => {
                          return <Text key={i} style={styles.breakdownColumnTextContent}>{sr.sidrno}</Text>
                        })
                      }
                    </View>
                  </View>
                  <View style={styles.breakdownColumns}>
                    <Text style={styles.breakDownColumnTitle}>Desc</Text>
                    <View style={styles.breakdownColumnContent}>
                      {
                        this.state.SMERecords.map((sr:any, i: number) => {
                          return (
                            <TouchableOpacity key={i} onPress={() => this.showDescModal(sr.remarks)}>
                              <Text style={[styles.breakdownColumnTextContent, {color: 'red'}]}>Show</Text>
                            </TouchableOpacity>
                          )
                        })
                      }
                    </View>
                  </View>
                  <View style={styles.breakdownColumns}>
                    <Text style={styles.breakDownColumnTitle}>Date</Text>
                    <View style={styles.breakdownColumnContent}>
                      {
                        this.state.SMERecords.map((sr:any, i: number) => {
                          return <Text key={i} style={styles.breakdownColumnTextContent}>{Moment(sr.date).format("MM/DD/yyyy")}</Text>
                        })
                      }
                    </View>
                  </View>
                  <View style={styles.breakdownColumns}>
                    <Text style={styles.breakDownColumnTitle}>Current</Text>
                    <View style={styles.breakdownColumnContent}>
                      {
                        this.state.SMERecords.map((sr:any, i: number) => {
                          if(sr.NonCurrent == false){
                            return <Text key={i} style={styles.breakdownColumnTextContent}>{sr.remaining_sidr_amount_balance}</Text>
                          }else{
                            return <Text key={i} style={styles.breakdownColumnTextContent}>0</Text>
                          }
                        })
                      }
                    </View>
                  </View>
                  <View style={styles.breakdownColumns}>
                    <Text style={styles.breakDownColumnTitle}>Non-Current</Text>
                    <View style={styles.breakdownColumnContent}>
                      {
                        this.state.SMERecords.map((sr:any, i:number) => {
                          if(sr.NonCurrent == true){
                            return <Text key={i} style={styles.breakdownColumnTextContent}>{sr.remaining_sidr_amount_balance}</Text>
                          }else{
                            return <Text key={i} style={styles.breakdownColumnTextContent}>0</Text>
                          }
                        })
                      }
                    </View>
                  </View>
                </View>

                <View style={styles.totalHolder}>

                  <View style={styles.totalContainer}>
                    <View style={styles.inlineText}>
                      <Text style={styles.breakDownColumnTitle}>Total Current:&nbsp;&nbsp;</Text>
                      <Text style={styles.breakDownColumnTitle}>{this.state.totalCurrent}</Text>
                    </View>
                    <View style={styles.inlineText}>
                      <Text style={styles.breakDownColumnTitle}>Total Non-Current:&nbsp;&nbsp;</Text>
                      <Text style={styles.breakDownColumnTitle}>{this.state.totalNoneCurrent}</Text>
                    </View>

                    <View style={{borderTopWidth: 1, borderTopColor: 'black'}}>
                      <View style={styles.inlineText}>
                        <Text style={styles.breakDownColumnTitle}>Total Balance:&nbsp;&nbsp;</Text>
                        <Text style={styles.breakDownColumnTitle}>{this.state.totalBalance}</Text>
                      </View>
                    </View>
                  </View>




                </View>

              </View>

            </View>
          </View>
        </Modal>

        <Modal
          visible={this.state.descModalVisible}
          animationType="fade"
          transparent={true}
        >
          <View style={styles.modalContent}>
            <View style={{ backgroundColor: 'white', borderRadius: 6, padding: 20, width: Dimensions.get('screen').width - 60  }}>
              <TouchableOpacity style={styles.closeModalBtn} onPress={() => {
                this.setState({
                  descModalVisible: false,
                  breakdownModalVisible: true,
                  remarksClicked: ''
                })
              }}>
                <Text style={styles.exBtn}>&times;</Text>
              </TouchableOpacity>

              <Text style={{fontWeight: 'bold', fontSize: 15}}>Description</Text>
              <Text style={[globalStyle.commonText, {marginTop: 10}]}>{this.state.remarksClicked}</Text>

            </View>
          </View>
        </Modal>

        <Modal
          visible={this.state.paymentModalVisible}
          animationType="fade"
          transparent={true}
        >
          <View style={styles.modalContentPayment}>
            <View style={{ backgroundColor: 'white', borderRadius: 6, padding: 20, width: Dimensions.get('screen').width - 60  }}>
              <TouchableOpacity style={styles.closeModalBtn} onPress={() => {
                this.setState({
                  paymentModalVisible: false,
                })
              }}>
                <Text style={styles.exBtn}>&times;</Text>
              </TouchableOpacity>

                <View>
                  <Text style={styles.dataName}>Please fill in the amount</Text>
                  <ScrollView>
                    <View>
                      <AppInputMask
                        label="Amount"
                        returnKeyType="done"
                        value={this.state.amount}
                        keyboardType="number-pad"
                        placeholder="Amount"
                        type={"custom"}
                        options={{
                          mask: "999999",
                        }}
                        maxLength={6}
                        onChangeText={(amount: any) => this.setState({amount})}
                      />
                      {
                        this.state.isLoaded == true ?
                        <AppInput
                          placeholder="E-mail"
                          label="E-mail"
                          onChange={(email: any) => this.setState({email})}
                          value={this.state.email}
                          editable={this.state.currentUserDetails.personalInformation.email !== "" ? false : true}
                        />
                        : null
                      }
                    
                      <AppInput
                        placeholder="Note (Optional)"
                        label="Note"
                        onChange={(note: any) => this.setState({note})}
                        value={this.state.note}
                        multiline={true}
                        numberOfLines={6}
                        height={80}
                        optional={true}
                      />  
                      <TouchableOpacity style={[styles.paynow, {backgroundColor: this.check() == true ? '#eee' : '#E71409'}]} onPress={() => this.payNow()} disabled={this.check()}>
                        <Text style={styles.paynowText}>Confirm Payment</Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </View>
              

            </View>
          </View>
        </Modal>

      </KeyboardAvoidingView>
    );
  }
  
}

const styles = StyleSheet.create({
  titleWrapper: {
    paddingHorizontal: 40,
    paddingVertical: 20
  },
  container: {
    flex: 1,
    paddingHorizontal: 40,
  },
  logo: {
    resizeMode: 'cover',
    width: 50,
    height: 50,
  },
  dataHolder: {
    padding: 20,
    backgroundColor: 'rgba(226, 131, 80, 0.1)',
    borderRadius: 6,
  },
  dataName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: datosBlack,
    fontFamily: 'CalibriRegular'
  },
  accountNumberHolder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10
  },
  accountNumberDetails: {
  },
  accountNumberLabel: {
    fontSize: 15,
    color: datosBlack,
    fontWeight: 'bold',
    marginBottom: 5,
    fontFamily: 'CalibriRegular'
  },
  accountNumber: {
    fontSize: 12,
    color: datosBlack,
    fontFamily: 'CalibriRegular'
  },
  paynow: {
    marginTop: 20,
    backgroundColor: datosOrange, 
    paddingHorizontal: 40,
    paddingVertical: 5,
    borderRadius: 50
  },
  paynowText: {color: '#fff', fontWeight: 'bold', fontSize: 15, fontFamily: 'CalibriBold'},
  breakdown: {
    flexDirection: 'row'
  },
  accountBreakDownBtn: {
    marginBottom: 10,
    flexDirection: 'row'
  },
  modalContentPayment: {
    flex: 1,
    paddingTop: 50,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0, 0.3)',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0, 0.3)',
  },
  closeModalBtn:{
    position: 'absolute',
    right: 5,
    top: -2
  },
  exBtn:{
    fontSize: 20,
    color: '#E71409'
  },

  breaKdownContent: {
    flexDirection: 'row'
  },
  breakdownColumns: {
    flex: 1,
    alignItems: 'center'
  },
  breakDownColumnTitle: {
    fontSize: 7,
    fontWeight: 'bold'
  },
  breakdownColumnContent: {
    flexDirection: 'column'
  },
  breakdownColumnTextContent: {
    fontSize: 8,
    paddingVertical: 2
  },
  totalHolder: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end'
  },
  totalContainer: {
    paddingVertical: 10
  },
  inlineText: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 2
  }
});
