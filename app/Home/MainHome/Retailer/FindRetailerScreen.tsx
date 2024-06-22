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
import { SearchInput } from '../../../../components/Inputs';
import { globalStyle } from "../../../../assets/styles/globalStyle";
const { _storeData, _retrieveData, _removeData } = require("../../../../helpers/global-function");
import { Feather } from "@expo/vector-icons";
import Config from "../../../../constants/Config";
import axios from 'axios';
import moment from "moment";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { datosBlack, datosLightGray, datosOrange, datosWhiteShade } from '../../../../assets/styles/colorUsed';
import {BackBtn} from "../../../../components/Buttons"
import { router } from 'expo-router';

export default class  extends React.Component<any, any> {
  focusListener: any;
  constructor(props: any) {
    super(props)
  }

  state: any = {
    current_user_object_id: '',
    firstName: '',
    data: null,

    noUser: false,
    today: moment().format('MMM DD, YYYY'),
    isLoaded: false,

    searchInput: "",
    activeRetailers: [],
    uncategorizeRetailers: [],
    matchedRetailers: [],
    retailersWithOngoingLoan: []
  }

  async componentDidMount() {
    this.getActiveRetailers()
    await _retrieveData('NoUser')
    .then(async (result: any) => {
      if(result == 'true'){
        this.setState({
          noUser: true
        })
      }else{
        this.setState({
          noUser: false
        })
        this.processUser()
      }
    })
  }

  processUser = async () => {
    const { navigation } = this.props;
    let current_user_data: any = await _retrieveData('current_user');
    let current_user = JSON.parse(current_user_data);
    if (current_user) {
      // console.log('current user _id: ', current_user.id);
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

  getActiveRetailers = async () => {
    try{
      await axios.get(Config.api + `/retailer/getActiveRetailers`)
      .then((res: any) => {
        if(res.data.status == "success"){
          this.setState({activeRetailers: res.data.result},
            () => {
              let uncategorizeRetailers: any = []
              let categories = res.data.result
              Object.keys(categories).forEach((key) => {
                // console.log('key: ', key);
                // console.log('value: ', this.state.activeRetailers[key]);
                this.state.activeRetailers[key].map((retailer: any) => {
                  uncategorizeRetailers.push(retailer)
                })
              });
              this.setState({
                uncategorizeRetailers,
                isLoaded: true
              })
            }  
          )
        }
      })
      .catch(err => {
        console.log("catch err: ", err);
      })
    }catch(err){
      console.log("Error: ", err);
    }
  }


  getAllUserData = async () => {
    await axios.get(Config.api + `/user/getUser/${this.state.current_user_object_id}`)
      .then((res: any) => {

        let retailersWithOngoingLoan: any[] = []
        res.data.result?.currentOngoingLoan.map((loan: any) => {
          retailersWithOngoingLoan.push(loan)
        })

        this.setState({
          data: res.data.result,
          retailersWithOngoingLoan
        })

      })
      .catch(err => {
        console.log("ERROR:", err)
      })
  }

  searchKeyword = (keyword: any) => {
    if(keyword == ""){
      this.setState({searchInput: ""})
      this.setState({matchedRetailers: []})
    }else{
      this.setState({searchInput: keyword})
      const filteredArray = this.state.uncategorizeRetailers.filter((obj: any) =>
        obj.name.toLowerCase().includes(keyword.toLowerCase())
      );
      this.setState({matchedRetailers: filteredArray})
    }
    
  }

  isStringInArrayOfObjects = (arrayOfObjects: any, retailer_id: any) => {
    for (let i = 0; i < arrayOfObjects.length; i++) {
      if (arrayOfObjects[i].retailer === retailer_id) {
        return true;
      }
    }
    return false;
  }

  navigateToRetailerForms = (retailer: any) => {
    //if retailer id is on current ongoing loan, then navigate to the part of the form where you stop filling up
    let isExist = this.isStringInArrayOfObjects(this.state.retailersWithOngoingLoan, retailer._id)
    if(isExist){
      router.push({pathname: "Home/MainHome/Retailer/RetailerForms/FormsHomeScreen", params: retailer} )
    }else{
      router.push({pathname: "Home/MainHome/Retailer/ProductScreen", params: retailer})
    }
  }

  render() {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={[globalStyle.wrapper]}>
              <View style={{flex: 6, marginBottom: 20, overflow: 'hidden'}}>
              <Text style={[globalStyle.title, {textAlign: 'center'}]}>Connect to Retailers</Text>

              {
                this.state.isLoaded ?
                <View style={{paddingBottom: 100}}>
                  <SearchInput placeholder='Type keyword and find' value={this.state.searchInput} onChange={(keyword: any) => this.searchKeyword(keyword)} />  
                  {
                    this.state.matchedRetailers.length == 0 ?
                    <ScrollView>
                      {
                        Object.keys(this.state.activeRetailers).map((key, x) => {
                          // console.log('key: ', key);
                          // console.log('value: ', this.state.activeRetailers[key]);
                          return(
                            <View key={x}>
                              <View style={styles.categoryHolder}>
                                <Text style={{color: '#fff', fontSize: 15}}>{key}</Text>
                              </View>
                              {
                                this.state.activeRetailers[key].map((ret: any, i: any) => {
                                  return(
                                    <TouchableOpacity style={[styles.retailerContainer, {backgroundColor: (i % 2) === 0 ? '#fff' : '#f5f5f5'}]} key={i} onPress={() => this.navigateToRetailerForms(ret)}>
                                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                      <Image source={{uri: ret.logo}} style={styles.logo}/>
                                      <Text style={[globalStyle.commonText, styles.retailerName]}>{ret.name}</Text>
                                    </View>
                                  </TouchableOpacity>
                                  )
                                })
                              }
                            </View>
                          )
                        })
                      }

                      {/* {
                        this.state.activeRetailers.map((ret, i) => {
                          return <TouchableOpacity style={[styles.retailerContainer, {backgroundColor: (i % 2) === 0 ? '#fff' : '#f5f5f5'}]} key={i} onPress={() => this.navigateToRetailerForms(ret)}>
                            <Text style={[globalStyle.commonText, {color: '#6D6D6D'}]}>{ret.loan_category}</Text>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                              <Image source={{uri: ret.logo}} style={styles.logo}/>
                              <Text style={[globalStyle.commonText, styles.retailerName]}>{ret.name}</Text>
                            </View>
                          </TouchableOpacity>
                        })
                      } */}
                    </ScrollView>
                    : 
                    <ScrollView>
                      {
                          this.state.matchedRetailers.map((ret: any, i: any) => {
                              return <TouchableOpacity style={[styles.retailerContainer, {backgroundColor: (i % 2) === 0 ? '#fff' : '#f5f5f5'}]} key={i} onPress={() => this.navigateToRetailerForms(ret)}>
                                <Text style={[globalStyle.commonText, {color: '#6D6D6D'}]}>{ret.loan_category}</Text>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                  <Image source={{uri: ret.logo}} style={styles.logo}/>
                                  <Text style={[globalStyle.commonText, styles.retailerName]}>{ret.name} </Text>
                                </View>
                              </TouchableOpacity>
                            })
                      }
                    </ScrollView>
                  }
                </View>
                :
                <View style={{alignItems: 'center'}}>
                  <Text>Please wait while were getting retailers...</Text>
                  <ActivityIndicator /> 
                </View>
              }
              </View>

              <View style={{flex: 1,alignItems: 'center'}}>
                <BackBtn onPress={() => router.back()} />
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
  retailerContainer: {
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#CDCDCD'
  },
  logo: {
    resizeMode: 'cover',
    width: 50,
    height: 50,
    borderRadius: 23,
    marginRight: 10
  },
  retailerName: {
    flex: 1,
  },
  categoryHolder: {
    backgroundColor: datosOrange,
    padding: 20
  }
});
