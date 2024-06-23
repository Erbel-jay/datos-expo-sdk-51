import * as React from 'react';
import { 
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
    Image,
    Text,
    View
  } from 'react-native';
import { globalStyle } from "../../../assets/styles/globalStyle";
import axios from 'axios';
import Config from '../../../constants/Config';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { datosBlack, datosLightGray, datosOrange, datosWhiteShade } from '../../../assets/styles/colorUsed';
import { router } from 'expo-router';
import {BackBtn} from "../../../components/Buttons"

export default class RetailersScreen extends React.Component<any, any> {
  constructor(props){
    super(props)
  }

  state: any = {
    retailers: []
  }

  componentDidMount(){
      this.getRetailers();
  }

  getRetailers = async () => {
    try{
        axios.get(Config.api + "/retailer/getRetailersOnly")
        .then(response => {
            this.setState({retailers: response.data.result})
        })
        .catch(err => {
            console.log("Error: ", err);
        })
    }catch(err){
        console.log("Error: ", err);
    }
  }

  continue = (r: any) => {
    router.push({pathname: 'Home/MakeAPayment/CustomerDetailsScreen', params: r})
  }

  render(){
    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={globalStyle.container}>
          {
          <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
            <View style={styles.commingSoonBgDesign}>
              <Text style={styles.commingSoonText}>Comming Soon</Text>
            </View>
            <BackBtn onPress={() => router.push('Home/MainHome/MainHomeScreen')} />
          </View>
          }
          {
          /* <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView>
                    <View style={globalStyle.wrapper}>
                        <Text style={globalStyle.title}>Select Retailer</Text>
                        
                        <View style={styles.retailersHolder}>
                            {
                                this.state.retailers.map(r => {
                                    return(
                                        <TouchableOpacity key={r._id} style={styles.retailerHolder} onPress={() => this.continue(r)}>
                                            <Image source={r.logo ? { uri: r.logo } : require("../../assets/images/test-images/profile.png")} style={styles.logo}/>
                                            <Text style={[globalStyle.commonText, styles.retailerName]}>{r.name}</Text>
                                        </TouchableOpacity>
                                    );
                                })
                            }
                            
                        </View>
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback> */
          }
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
  logo: {
    resizeMode: 'cover',
    width: 50,
    height: 50,
    borderRadius: 23,
    marginRight: 10
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
