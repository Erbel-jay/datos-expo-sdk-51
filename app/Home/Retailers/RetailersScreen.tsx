import * as React from 'react';
import { 
  StyleSheet, 
  Text, 
  View,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Image
} from 'react-native';
import { ScrollView } from "react-native-gesture-handler";
import { globalStyle } from "../../../assets/styles/globalStyle";
import axios from "axios";
import Config from "../../../constants/Config";
const { _retrieveData } = require("../../../helpers/global-function");
import {BackBtn} from "../../../components/Buttons"
import Icon from '@expo/vector-icons/build/Feather';
import { datosOrange } from '../../../assets/styles/colorUsed';
import { router, useFocusEffect } from 'expo-router';


//need focus hook
function FetchData({ processUser }) {
  useFocusEffect(
    React.useCallback(() => {
      processUser()
    }, [])
  );

  return null;
}

export default class RetailersScreen extends React.Component {
  focusListener: any;
  constructor(public props: any) {
    super(props);
  }

  state: any = {
    current_user_object_id: null,
    userDetails: null,
    isRetailersLoaded: false,
    retailers: []
  }

  componentDidMount() {
    console.log("🚀 ~ RetailersScreen ~ componentDidMount:")
    // this.processUser();
  }

  processUser = async () => {
    console.log("🚀 ~ RetailersScreen ~ processUser:")
    let current_user_data: any = await _retrieveData('current_user');
    let current_user = JSON.parse(current_user_data);
    if (current_user) {
      this.setState({
        current_user_object_id: current_user.id
      }, () =>{
        this.getUserLoansRetailer();
        this.getAllUserData();
      })
    }

    
  }

  

  getUserLoansRetailer = async () => {
    try{
      axios.get(Config.api + `/loan/getUserLoansRetailer/${this.state.current_user_object_id}`)
      .then(res => {
        if(res.data.status == 'success'){
          this.setState({
            retailers: res.data.result,
            isRetailersLoaded: true
          })
        }else{
          Alert.alert("Something went wrong while fetching retailers.");
        }
      })
      .catch(err => {
        console.log("getLoanRetailers error: ", err);
      })
    }catch(err){
      console.log("getLoanRetailers err: ", err);
    }
  }

  getAllUserData = async () => {
    let res = await axios.get(Config.api + `/user/getUser/${this.state.current_user_object_id}`)
      .then((res: any) => {
        this.setState({
          userDetails: res.data.result
        }, () => {
          console.log('user_loan');
        })
      })
      .catch(err => {
        console.log("ERROR:", err)
      })
  }

  checkLastProgressAndNavigate = async (data: any) => {
    console.log('data', data);
    const elementExists = this.state.userDetails.currentOngoingLoan.some((obj: any) => obj.retailer === data._id);
    if(elementExists){
      router.push({pathname: 'Home/MainHome/Retailer/RetailerForms/FormsHomeScreen', params: data.retailer_info});
    }else{
      router.push({pathname: 'Home/Messages', params: { 
        retailer_id: data._id,
        messager_name: data.retailer_info.name,
        retailer_laon_category: data.retailer_info.loan_category,
        messager_profile: data ? data.retailer_info.logo : require("../../../assets/images/test-images/profile.png"),
      }})
    }
  }

  _handleUpdate = (data) => {
    console.log("🚀 ~ RetailersScreen ~ data:", data)
  }

  render(){
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[globalStyle.wrapper]}>
          <FetchData 
            processUser={this.processUser}
          />
            <Text style={globalStyle.title}>
              Your Retailers
            </Text>
            <View style={{flex: 1}}>
              {
                this.state.isRetailersLoaded == false
                  ?
                  <View style={styles.occupyAndCenter}>
                    <ActivityIndicator />
                    <Text style={globalStyle.commonText}>Getting Retailers...</Text>
                  </View>
                  :
    
                  <View style={[styles.occupy]}>
                    {
                      this.state.retailers.length == 0 ? 
                      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={globalStyle.commonText}>You have not applied to any retailers yet.</Text>
                      </View>
                      :
                      <ScrollView style={[styles.occupy]}>
                      {
                        this.state.retailers.map((data: any, i: any) => {
                          return (
                            <View style={[styles.retailerContainer, { backgroundColor: (i % 2) === 0 ? '#fff' : '#f5f5f5' }]} key={i}>
                              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Image source={{ uri: data.retailer_info.logo }} style={styles.logo} />
                                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                                  <View style={{ flexDirection: 'column', justifyContent: 'flex-start' }}>
                                    <Text style={[globalStyle.commonText, styles.retailerName]}>{data.retailer_info.name} </Text>
                                    <Text style={[globalStyle.commonText, { color: '#6D6D6D' }]}>{data.retailer_info.loan_category}</Text>
                                  </View>
                                  <TouchableOpacity style={styles.arrowRightBtn} onPress={() => this.checkLastProgressAndNavigate(data)}>
                                    <Icon name="chevron-right" size={24} color={"#fff"}  />
                                  </TouchableOpacity>
                                </View>
                              </View>
                            </View>
                          )
                        })
                      }
                    </ScrollView>
                    }
                    
                    <View style={{alignItems: 'center'}}>
                      <BackBtn onPress={() => router.back()} />
                    </View>
                  </View>
                  
              }
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  }
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  toprow: {
    width: '100%',
    padding: 20,
    justifyContent:'flex-start'
  },
  occupy: {
    flex: 1, 
  },
  occupyAndCenter: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  retailerContainer: {
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#CDCDCD',
    width: '100%'
  },
  logo: {
    resizeMode: 'cover',
    width: 70,
    height: 70,
    borderRadius: 23,
    marginRight: 15
  },
  retailerName: {
    marginBottom: 5
  },
  arrowRightBtn: {
    width: 40,
    height: 40,
    borderRadius: 40 / 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: datosOrange,
  }
});
