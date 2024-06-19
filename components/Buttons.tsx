import * as React from 'react';
import PropTypes from "prop-types";
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
// import { Picker } from "@react-native-picker/picker"
import Icon from '@expo/vector-icons/build/Feather'
import { LinearGradient } from 'expo-linear-gradient';
import { datosBlue, datosOrange } from '../assets/styles/colorUsed';

interface BaseInputProps {
    text?: string
    onPress?: any
    icon?: any
    color: string
    disabled?: boolean
}

class SocialLogin extends React.Component<BaseInputProps>{
    render() {
        return (
            <TouchableOpacity disabled={this.props.disabled} style={[styles.button, { backgroundColor: this.props.color }]} onPress={this.props.onPress}>
                <Image source={
                    this.props.icon ?
                        this.props.icon == 'facebook' ?
                            require(`../assets/images/facebookSignin.png`) :
                            require(`../assets/images/googleSignin.png`)
                        : null
                }
                    style={styles.btnIcon} />
                <Text style={{ color: '#000', fontSize: 16, fontWeight: '600' }}>{this.props.text}</Text>
            </TouchableOpacity>
        )
    }
}

class SocialLoginIOS extends React.Component<BaseInputProps>{
    render() {
        return (
            <TouchableOpacity style={[styles.buttonIOS, { backgroundColor: this.props.color }]} onPress={this.props.onPress}>
                <Image source={
                    this.props.icon ?
                        this.props.icon == 'facebook' ?
                            require(`../assets/images/facebookSignin.png`) :
                            require(`../assets/images/googleSignin.png`)
                        : null
                }
                    style={styles.btnIcon} />
            </TouchableOpacity>
        )
    }
}

interface GuestBtnProps {
    text?: string
    onPress?: any
    icon?: any
    color: string
    disabled?: boolean
} 


class GuestBtn extends React.Component<GuestBtnProps>{
    render() {
        return (
            <TouchableOpacity disabled={this.props.disabled} style={[styles.button, { backgroundColor: this.props.color }]} onPress={this.props.onPress}>
                <Icon name={this.props.icon} size={24} color="#000"/>
            </TouchableOpacity>
        )
    }
}

interface SubmitBtnProp {
    onPress: any,
    isInfoSubmitted: boolean
}

class SubmitBtn extends React.Component<SubmitBtnProp> {
    render() {
        return (
            <TouchableOpacity style={{
                backgroundColor: datosOrange,
                paddingHorizontal: 40,
                paddingVertical: 5,
                borderRadius: 50
            }} onPress={this.props.onPress} disabled={this.props.isInfoSubmitted}>
                <Text style={styles.submitText}>{this.props.isInfoSubmitted == true ? 'Submitted' : 'Submit'} </Text>
            </TouchableOpacity>  
        );
    }
}

interface cancelBtn {
    onPress: any,
}

class CancelBtn extends React.Component<cancelBtn> {
    render() {
        return (
            <TouchableOpacity style={styles.cancelbtn} onPress={this.props.onPress}>
                <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
        );
    }
}

interface cancelApplicationBtn {
    onPress: any,
}

class CancelApplicationBtn extends React.Component<cancelApplicationBtn> {
    render() {
        return (
            <TouchableOpacity style={styles.cancelbtn} onPress={this.props.onPress}>
                <Text style={styles.cancelText}>Cancel Application</Text>
            </TouchableOpacity>
        );
    }
}



interface backBtn {
    onPress: any,
}

class BackBtn extends React.Component<backBtn> {
    render() {
        return (
            <TouchableOpacity style={styles.cancelbtn} onPress={this.props.onPress}>
                <Text style={styles.cancelText}>Back</Text>
            </TouchableOpacity>
        );
    }
}




interface nextBtn {
    onPress: any,
    disable?: boolean
}

class NextBtn extends React.Component<nextBtn> {
    render() {
        return (
            <TouchableOpacity style={this.props.disable == false ? styles.nextbtn : styles.btnDisable} onPress={this.props.onPress} disabled={this.props.disable}>
                <Text style={styles.nextText}>Next</Text>
            </TouchableOpacity>
        );
    }
}

interface saveBtn {
    onPress: any,
    disable?: boolean
}

class SaveBtn extends React.Component<saveBtn> {
    render() {
        return (
            <TouchableOpacity style={this.props.disable == false ? styles.savebtn : styles.btnDisable} onPress={this.props.onPress} disabled={this.props.disable == false || !this.props.disable ? false : true}>
                <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
        );
    }
}

interface proceedBtnProps {
    onPress: any,
    disable?: boolean
}

class ProceedBtn extends React.Component<proceedBtnProps> {
    render() {
        return (
            <TouchableOpacity style={this.props.disable == false ? styles.savebtn : styles.btnDisable} onPress={this.props.onPress} disabled={this.props.disable == false || !this.props.disable ? false : true}>
                <Text style={styles.saveText}>Proceed</Text>
            </TouchableOpacity>
        );
    }
}

interface submitSmallBtnProps {
    onPress: any,
    disable?: boolean
}

class SubmitSmallBtn extends React.Component<submitSmallBtnProps> {
    render() {
        return (
            <TouchableOpacity style={this.props.disable == false ? styles.savebtn : styles.btnDisable} onPress={this.props.onPress} disabled={this.props.disable == false || !this.props.disable ? false : true}>
                <Text style={styles.saveText}>Submit</Text>
            </TouchableOpacity>
        );
    }
}

export {
    SocialLogin,
    SubmitBtn,
    CancelBtn,
    CancelApplicationBtn,
    NextBtn,
    SaveBtn,
    BackBtn,
    SocialLoginIOS,
    GuestBtn,
    ProceedBtn,
    SubmitSmallBtn
}


const styles = StyleSheet.create({
    button: {
        marginTop: 10,
        marginBottom: 5,
        height: 44,
        justifyContent: 'space-around',
        alignItems: 'center',
        borderRadius: 6,
        flexDirection: 'row',
        width: 220,
        paddingHorizontal: 10,

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3
    },

    buttonIOS: {
        marginBottom: 10,
        height: 50,
        width: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        flexDirection: 'row',
        marginRight: 10,

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 7
    },

    btnIcon: {
        width: 25,
        height: 25,
        borderRadius: 25,
    },

    submitbtn: {
        padding: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 6,
        marginBottom: 10
    },
    submitText: {
        fontSize: 17,
        fontFamily: 'CalibriBold',
        color: '#fff'
    },
    cancelbtn: {
        backgroundColor: '#F1F1F1',
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 6,
        marginBottom: 10,
        width: 100
    },
    cancelText: {
        fontSize: 15,
        fontFamily: 'CalibriBold',
    },
    nextbtn: {
        backgroundColor: datosBlue,
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 6,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: datosBlue,
        width: 100
    },
    btnDisable: {
        backgroundColor: 'rgba(231, 234, 237, 0.8)',
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 6,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(231, 234, 237, 0.8)',
        width: 100
    },
    nextText: {
        fontSize: 15,
        fontFamily: 'CalibriBold',
        color: '#fff'
    },
    savebtn: {
        backgroundColor: datosOrange,
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 6,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: datosOrange,
        width: 100
    },
    saveText: {
        fontSize: 15,
        fontFamily: 'CalibriBold',
        color: '#fff'
    },
});


