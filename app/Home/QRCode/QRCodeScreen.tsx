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
import {BackBtn} from '../../../components/Buttons'

export default class QRCodeScreen extends React.Component<any, any> {
  constructor(props){
    super(props)
  }

  state: any = {
    retailers: []
  }

  componentDidMount(){
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
