import * as React from 'react';
import {
    StyleSheet, 
    TouchableOpacity, 
    Text, 
    View, 
    ImageBackground, 
    Image 
  } from 'react-native';
import { router, Link } from 'expo-router';


export default class GetStartedScreen extends React.Component<any, any> {
  constructor(props: any){
    super(props)
  }

  render(){
    return (
        <ImageBackground source={require('../../slider_assets/background.png')} resizeMode="cover" style={styles.container}>
            <View style={styles.dogContainer}>
                <Image source={require('../../slider_assets/dog-2.png')} style={styles.dog} />
            </View>
            <View style={styles.textButtonContainer}>
                <View style={styles.textContainer}>
                    <Text style={styles.welcome}>Welcome!</Text>
                    <Text style={styles.datosDesc}>DATOS is a mobile application developed to connect enterpreneurs and individuals.</Text>
                </View>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.getStartedBtn} onPress={() => {
                      router.push("Slider/SliderScreenOne")
                    }}>
                        <Text style={styles.btnText}>Get Started</Text>
                    </TouchableOpacity>
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
  dogContainer: {
    marginTop: 100,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dog: {
    width: 250,
    height: 300,
    resizeMode: 'contain',
  },
  textButtonContainer: {
    flex: 1,
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 30
  },
  welcome: {
    fontSize: 40,
    fontFamily: 'CalibriBold',
    color: '#fff',
    marginBottom: 15
  },
  datosDesc: {
    textAlign: 'center',
    fontSize: 20,
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
  getStartedBtn: {
    backgroundColor: 'rgb(52, 63, 85)',
    alignSelf: 'stretch',
    paddingVertical: 20,
    borderRadius: 32.5
  },
  btnText: {
    textAlign: 'center',
    fontSize: 25,
    color: '#fff',
    fontFamily: 'CalibriBold'
  }
})