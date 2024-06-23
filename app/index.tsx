import React from 'react';
import { router, Link } from 'expo-router';
import {
    Text,
    View,
    StyleSheet,
    Image,
    ImageBackground
} from 'react-native';
import { stripBaseUrl } from 'expo-router/build/fork/getStateFromPath';
import FlashMessage from "react-native-flash-message";
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default class IndexPage extends React.Component<any, any> {
    constructor(props: any){
        super(props)
    }


    componentDidMount = () => {
        setTimeout(() => {
            router.push("Slider")
        }, 2000)
    }

    render(){
        return(
            <SafeAreaProvider>
                <StatusBar />
                <FlashMessage position="top" />
                <ImageBackground style={styles.container} source={require("../assets/images/splash.png")}/>
            </SafeAreaProvider>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    wrapper: {
        flex: 1,
        padding: 30,
    },
    welcomeHolder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    logoHolder: {
        width: 300,
        height: 100
    },
    spytrackLogo: {
        height: 100,
        width: 300,
        resizeMode: 'contain'
    },
    welcomeText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#fff'
    },
    linkText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#fff'
    },
    copyright: {
        textAlign: 'center',
        fontSize: 10,
        color: '#fff'
    }
})