import * as React from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  View,
  ImageBackground,
  Image
} from 'react-native';
import Icon from '@expo/vector-icons/build/Feather';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { router, Link } from 'expo-router';

export default class SliderScreenTwo extends React.Component<any, any> {
  constructor(props: any){
    super(props)
  }


  render(){
    return (
        <ImageBackground source={require('../../slider_assets/slide-2-background.png')} resizeMode="cover" style={styles.container}>
            <View style={styles.screenContainer}>
              <View style={{width: scale(600), height: verticalScale(600)}}>
                <Image source={require('../../slider_assets/slide-2-image.png')} style={styles.loanTrackerScreenShot} />
              </View>
            </View>
            <View style={styles.textButtonContainer}>
                <View style={styles.textContainer}>
                    <Text style={styles.welcome}>Easily Track Your Loan</Text>
                    <Text style={styles.datosDesc}>Don't be left out in the dark! Track your application every step of the process.</Text>
                </View>
                <View style={{flex: 1, flexDirection: 'row'}}>
                <View style={styles.buttonContainer}>
                    <View style={{flexDirection: 'row'}}>
                      <TouchableOpacity onPress={() => router.push('Slider/GetStartedScreen')} style={styles.noneActiveSlide}></TouchableOpacity>
                      <TouchableOpacity onPress={() => router.push('Slider/SliderScreenOne')} style={styles.noneActiveSlide}></TouchableOpacity>
                      <View style={styles.activeSlide}></View>
                      <TouchableOpacity onPress={() => router.push('Slider/SliderScreenThree')} style={styles.noneActiveSlide}></TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.nextBtn} onPress={() => {
                          router.push('Slider/SliderScreenThree')
                      }}>
                        <Image source={require('../../slider_assets/arrow-right.png')} style={styles.arrowRight}/>
                    </TouchableOpacity>
                  </View>
                </View>
                
            </View>
        </ImageBackground>
    );
  }
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loanTrackerScreenShot: {
    width: scale(500),
    height: verticalScale(500),
    resizeMode: 'contain',
  },
  textButtonContainer: {
    flex: 0.5,
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: moderateScale(30)
  },
  welcome: {
    fontSize: moderateScale(30),
    fontFamily: 'CalibriBold',
    textAlign: 'center',
    color: '#fff',
    marginBottom: moderateScale(15)
  },
  datosDesc: {
    textAlign: 'center',
    fontSize: moderateScale(20),
    color: '#fff',
    fontFamily: 'CalibriRegular',
    lineHeight: moderateScale(25),
  },
  buttonContainer: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(50),
  },
  activeSlide: {
    backgroundColor: 'rgb(52, 63, 85)',
    width: 20,
    height: 10,
    borderRadius: 5,
    marginRight: 10
  },
  noneActiveSlide: {
    backgroundColor: '#fff',
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10
  },
  nextBtn: {
    backgroundColor: 'rgb(52, 63, 85)',
    paddingVertical: 15,
    width: 80,
    borderRadius: 30.5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  arrowRight: {
    height: 25,
    width: 40,
    resizeMode: 'contain'
  }
})
