import * as React from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  View,
  ImageBackground,
  Image
} from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { router, Link } from 'expo-router';

export default class SliderScreenOne extends React.Component<any, any> {
  constructor(props: any){
    super(props)
  }

  navigate = (location: any) => {
    router.push(location)
  }

  render(){
    return (
        <ImageBackground source={require('../../slider_assets/slide-1-background.png')} resizeMode="cover" style={styles.container}>
            <View style={styles.screenContainer}>
                <Image source={require('../../slider_assets/slide-1-image.png')} style={styles.homeScreenshot} />
            </View>
            <View style={styles.textButtonContainer}>
                <View style={styles.textContainer}>
                    <Text style={styles.welcome}>Build Your Credit Profile</Text>
                    <Text style={styles.datosDesc}>Sign up today and start building your credit profile.</Text>
                </View>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <View style={styles.buttonContainer}>
                    <View style={{flexDirection: 'row'}}>
                      <TouchableOpacity onPress={() => this.navigate('Slider/GetStartedScreen')} style={styles.noneActiveSlide}></TouchableOpacity>
                      <View  style={styles.activeSlide}></View>
                      <TouchableOpacity onPress={() => this.navigate('Slider/SliderScreenTwo')} style={styles.noneActiveSlide}></TouchableOpacity>
                      <TouchableOpacity onPress={() => this.navigate('Slider/SliderScreenThree')} style={styles.noneActiveSlide}></TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.nextBtn} onPress={() => {
                          this.navigate('Slider/SliderScreenTwo')
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
    paddingTop: moderateScale(80),
  },
  screenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeScreenshot: {
    width: scale(300),
    height: verticalScale(300),
    resizeMode: 'contain',
  },
  textButtonContainer: {
    flex: 0.8,
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
    marginBottom: 15
  },
  datosDesc: {
    textAlign: 'center',
    fontSize: moderateScale(20),
    color: '#fff',
    fontFamily: 'CalibriRegular',
    lineHeight: 25,
  },
  buttonContainer: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 50,
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
