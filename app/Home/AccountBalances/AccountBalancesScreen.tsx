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
  TextInput,
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
import { AppInput } from '../../../components/Inputs';
import { datosBlack, datosOrange, datosRed } from '../../../assets/styles/colorUsed';
import { router } from 'expo-router';

export default class AccountBalancesScreen extends React.Component<any, any> {
  constructor(props: any) {
    super(props)
  }

  state: any = {
    current_user_object_id: '',
    retailers: [],
    isLoaded: false,
    searchInput: null,
    addAccountNumberModalVisible: false,
    accountNumber: null,
    surname: null,
    isSearchAccountNumberLoaded: true,
    searchResult: [],
  }

  async componentDidMount() {
    let current_user_data: any = await _retrieveData('current_user');
    let current_user = JSON.parse(current_user_data);
    if (current_user) {
        this.setState({
            current_user_object_id: current_user._id
        }, () => {
            this.getCustomerAccountSMERecordByObjectID(this.state.current_user_object_id)
        })
    }
}


getCustomerAccountSMERecordByObjectID = async (current_user_object_id: any) => {
  let res = await axios.get(Config.api + `/sme/getCustomerAccountSMERecordByObjectID/${current_user_object_id}`)
      .then(res => {
        let retailers:any[] = []
        let currentRetailer_id = ''
        for(let i = 0; i < res.data.result.length; i++){
          if(currentRetailer_id !== res.data.result[i].id){
            retailers.push(res.data.result[i])
          }
          currentRetailer_id = res.data.result[i].id
        }
        this.setState({retailers: retailers}, () => {
          this.getUserBindedAccountNumber()
        })
      })
}

getUserBindedAccountNumber = async () => {
  try{
    await axios.get(Config.api + `/retailer/getUserBindedAccountNumber/${this.state.current_user_object_id}`)
    .then(res => {
      let allRetailers = this.state.retailers
      let unique:any = [...new Map(res.data.result.map((item:any) => [item['retailer_id']._id, item])).values()]
      for(let i = 0; i < unique.length; i++){
        allRetailers.push(unique[i]);
      }
      this.setState({retailers: allRetailers}, () => {
        this.setState({isLoaded: true})
      })
    })
    .catch(err => console.log("getUserBindedAccountNumber", err));
  }catch(err){
    console.log("getUserBindedAccountNumber err", err);
  }
}

searchRetailer = (searchInput: any) => {
  console.log("searchInput", searchInput);
  this.setState({searchInput})
}

searchAccountNumber = async () => {
  try{
    this.setState({isSearchAccountNumberLoaded: false})
    await axios.get(Config.api + `/retailer/searchAccountNumber/${this.state.accountNumber}/${this.state.surname}`)
    .then(res => {
      this.setState({searchResult: res.data.result}, () => {
        this.setState({isSearchAccountNumberLoaded: true})
      })
    })
    .catch(err => console.log("search account number", err));
  }catch(err){
    console.log("err", err);
  }
}


addAccountNumberToUser = async (account: any) => {
  try{
    let formData = new FormData();
        let data = {
            user_id: this.state.current_user_object_id,
            AccountNo: account.AccountNo
        }
        formData.append("data", JSON.stringify(data));
        let res = await axios.post(Config.api + `/retailer/addAccountNumberToUser/`, formData)
            .then(res => {
              Alert.alert("Success!", "Account Added!")
              this.setState({addAccountNumberModalVisible: false}, () =>{
                this.setState({isLoaded: false})
                this.getCustomerAccountSMERecordByObjectID(this.state.current_user_object_id)
              })
            })
            .catch(err => {
              console.log("ERROR:", err)
              Alert.alert("Failed!", "Someting went wrong!")
            })

  }catch(err){
    console.log("addAccountNumberToUser Err:", err);
  }
}

  render(){
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={globalStyle.container}
      >
        <View style={styles.headerHolder}>
          <TouchableOpacity style={{ marginRight: 20 }} onPress={() => router.push('Home/MainHome/MainHomeScreen')}>
              <Icon name="arrow-left" color={datosBlack} size={25} />
          </TouchableOpacity>
        </View>
        <View style={styles.titleWrapper}>
          <View style={{alignItems: 'center'}}>
            <Text style={styles.title}>Retailers</Text>
          </View>
          <TouchableOpacity style={styles.addAccountNumberBtn} onPress={() => this.setState({addAccountNumberModalVisible: !this.state.addAccountNumberModalVisible})}>
            <Icon 
              name="plus"
              size={24}
              color={datosRed}
            />
            <Text>&nbsp;Add Account</Text>
          </TouchableOpacity>
        </View>
        {/* <View style={styles.AANbtnHolder}>
          <TextInput 
            value={this.state.searchInput}
            style={styles.searchRetailerInput} 
            placeholder="Search Retailer"
            onChangeText={(searchInput: any) => this.searchRetailer(searchInput)}
          />
        </View> */}

        <ScrollView>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
            
            {
              this.state.isLoaded == false ?
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#70788c" />
                <Text style={globalStyle.commonText}>Fetching Retailers...</Text>
              </View>
              :
              this.state.retailers.length > 0 ?
                this.state.retailers.map((r: any, i: any) => {
                  return (
                    <TouchableOpacity 
                      style={styles.retailerHolder} 
                      key={i} 
                      onPress={() => {
                        router.push({pathname: 'Home/AccountBalances/AccountBalancesDetailsScreen', 
                        params:
                        {
                          retailer_id: r.retailer_id ? r.retailer_id.id : r.id, 
                          logo:  r.retailer_id ? r.retailer_id.logo : r.logo,
                          retailerType: r.retailer_id ? "Financing" : "SME"
                        }})
                      }}>
                      <Image source={r.logo ? {uri: r.logo} : r.retailer_id.logo  ? {uri: r.retailer_id.logo} : require("../../../assets/images/test-images/profile.png")} style={styles.logo}/>
                      <View style={styles.retailerInfo}>
                        <Text style={styles.retailerName}>{r.name ? r.name : r.retailer_id.name}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              : 
              <View style={{justifyContent: 'center', alignItems: 'center'}}>
                <Text>No retailer to show.</Text>
              </View>
              
            }
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>

        <Modal
          visible={this.state.addAccountNumberModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContent}>
            <View style={{ backgroundColor: 'white', borderRadius: 6, padding: 20, width: Dimensions.get('screen').width - 60  }}>
              <TouchableOpacity style={styles.closeModalBtn} onPress={() => this.setState({addAccountNumberModalVisible: false})}>
                <Text style={styles.exBtn}>&times;</Text>
              </TouchableOpacity>
              <Text style={styles.retailerName}>Search For Account Number</Text>
              <AppInput 
                value={this.state.accountNumber}
                onChange={(accountNumber: any) => this.setState({accountNumber})}
                placeholder="Account Number"
              />

              <AppInput 
                value={this.state.surname}
                onChange={(surname: any) => this.setState({surname})}
                placeholder="Surname"
                autoCapitalize={"characters"}
              />
              <View style={{justifyContent: 'center', alignItems: 'center'}}>
                <TouchableOpacity style={styles.searchAccountNumber} onPress={() => this.searchAccountNumber()}>
                  <Text style={styles.searchAccountNumberLabel}>Search</Text>
                </TouchableOpacity>
              </View>

              <ScrollView>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                  {
                    this.state.isSearchAccountNumberLoaded == false ?
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                      <ActivityIndicator size="small" color="#70788c" />
                      <Text style={globalStyle.commonText}>Searching for matches...</Text>
                    </View>
                    :
                    this.state.searchResult.length == 0?
                    <View>
                      <Text>Nothing to show.</Text>
                    </View>
                    :
                    <View>
                      {
                        this.state.searchResult.map((d:any, i:number) => {
                          return(
                          <View style={{marginTop: 20}} key={i}>
                            <View style={styles.dataHolder}>

                              <View style={styles.retailerLogoAndName}>
                                <Image source={{uri: d.retailer_id.logo? d.retailer_id.logo :'https://placeholderlogo.com/img/placeholder-logo-1.png'}} style={styles.logo}/>
                                <View style={styles.retailerInfo}>
                                  <Text style={styles.dataName}>{d.retailer_id.name}</Text>
                                </View>
                              </View>

                              <View style={styles.accountNumberHolder}>
                                <View style={styles.accountNumberDetails}>
                                  <Text style={styles.accountNumberLabel}>Name</Text>
                                  <Text style={styles.accountNumber}>{d.Customer}</Text>
                                </View>
                              </View>

                              <View style={styles.accountNumberHolder}>
                                <View style={styles.accountNumberDetails}>
                                  <Text style={styles.accountNumberLabel}>Account Number</Text>
                                  <Text style={styles.accountNumber}>{d.AccountNo}</Text>
                                </View>
                                <TouchableOpacity>
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
                                <Text style={styles.accountNumber}>PHP {d.ExistingBalance}</Text>
                              </View>
                            </View>

                            <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 10}}> 
                              <Text style={styles.accountNumber}>Is this your account?</Text>
                              <TouchableOpacity onPress={() => this.addAccountNumberToUser(d)}>
                                <Text style={[styles.accountNumber, {color: datosRed, marginLeft: 5}]}>Add Now</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                          );
                        })
                      }
                    </View>
                    
                    
                  }
                    
                     
                </TouchableWithoutFeedback>
              </ScrollView>

            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    );
  }
  
}

const styles = StyleSheet.create({
  titleWrapper: {
    paddingHorizontal: 20,
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    color: '#001f50',
    fontFamily: 'OpenSansRegular'
  },
  container: {
    flex: 1,
    paddingHorizontal: 40,
  },
  retailerHolder: {
    padding: 10,
    backgroundColor: 'rgba(226, 131, 80, 0.1)',
    borderRadius: 6,
    flexDirection: 'row',
    marginBottom: 20
  },
  logo: {
    resizeMode: 'cover',
    width: 50,
    height: 50,
    borderRadius: 23
  },
  retailerInfo: {
    justifyContent: 'center',
    marginLeft: 20,
    flexShrink: 1
  },
  retailerName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: datosBlack,
  },
  retailerDesc: {
    fontSize: 12,
    color: '#001f50',
    marginTop: 5,
  },
  AANbtnHolder: {
    borderStartColor: 'blue',
    paddingHorizontal: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  addAccountNumberBtn: {
    width: 150,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(226, 131, 80, 0.1)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#e71409',
    flexDirection: 'row'
  },
  searchRetailerInput: {
    width: '100%',
    backgroundColor: '#fff',

    marginVertical: 10,
    padding: 15,
    paddingRight: 40,
    fontSize: 15,
    borderRadius: 6,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,  
    elevation: 3
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0, 0.3)',
  },
  searchAccountNumber: {
    backgroundColor: datosOrange, 
    paddingHorizontal: 40,
    paddingVertical: 5,
    borderRadius: 50,
  },
  searchAccountNumberLabel: {
    color: '#fff',
    fontSize: 15
  },



  logoModal: {
    resizeMode: 'cover',
    width: 50,
    height: 50,
  },
  dataHolder: {
    padding: 20,
    backgroundColor: '#eff1ff',
    borderRadius: 6,
  },
  dataName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#001f50'
  },
  accountNumberHolder: {
    flexDirection: 'row',
    backgroundColor: '#eff1ff',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10
  },
  accountNumberDetails: {
    backgroundColor: '#eff1ff',
  },
  accountNumberLabel: {
    fontSize: 15,
    color: '#001f50',
    fontWeight: 'bold',
    marginBottom: 5
  },
  accountNumber: {
    fontSize: 12,
    color: '#001f50',
  },
  paynow: {
    backgroundColor: '#E71409',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    borderRadius: 6
  },
  paynowText: {
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 14
  },
  retailerLogoAndName: {
    flexDirection: 'row', 
    backgroundColor: '#eff1ff',
    alignItems: 'center'
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
  headerHolder: {
    padding: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
});
