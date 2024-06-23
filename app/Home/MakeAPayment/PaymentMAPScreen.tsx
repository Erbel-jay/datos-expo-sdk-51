import * as React from 'react';
import { 
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    TouchableWithoutFeedback,
    Keyboard,
    Image,
    ActivityIndicator,
    Modal,
    Text,
    View
 } from 'react-native';
import axios from 'axios';
import { globalStyle } from "../../../assets/styles/globalStyle";
const { _storeData, _retrieveData } = require("../../../helpers/global-function");
import Config from "../../../constants/Config"
import Icon from '@expo/vector-icons/build/Feather';
import { showMessage, hideMessage } from "react-native-flash-message";
import Moment from 'moment';
import { AppInput, AppInputMask } from '../../../components/Inputs';
import Xendit from 'xendit-js-node'
import { WebView } from 'react-native-webview';
import CurrencyInput from 'react-native-currency-input';
import { vw, vh, vmin, vmax } from 'react-native-expo-viewport-units';
// import Crypto from 'react-native-crypto'
import {router, useLocalSearchParams} from 'expo-router'

const PaymentMAPScreen = () => {
    const localSearchParams = useLocalSearchParams();
    return <PaymentMAPScreenComponent localSearchParams={localSearchParams} />
}

export default PaymentMAPScreen

class PaymentMAPScreenComponent extends React.Component {
    constructor(public props: any){
        super(props)
    }

    state: any = {
        retailer: {},
        referenceID: '',
        firstName: '',
        lastName: '',
        middleName: '',
        email: '',
        mobileNumber: '',

        amount: 0,
        //card info
        cardNumber: '',//4000000000001091
        cardExipryDate: '',//09/30
        cardExpMonth: '',//09
        cardExpYear: '',//2030
        cardCvn: '',//035
        isMultipleUse: false,
        isSkip3DS: false,
        isTokenizing: false,

        isRenderWebview: false,
        webviewUrl: '',

        isLoaded: false,

        tokenID: '',
        authID: '',
        isSubmitted: false,

        paymentType: null,
        modalVisible: false
    }

    async componentDidMount(){
        if (this.props.localSearchParams !== undefined) {
            let params = this.props.localSearchParams
            console.log("params", params.retailer.name);
            this.setState({
                retailer: params.retailer,
                email: params.email,
                firstName: params.firstName,
                lastName: params.lastName,
                middleName: params.middleName,
                mobileNumber: params.mobileNumber,
            })
        }
    }

    check = () => {
        let returnValue
        if(
            (this.state.amount !== 0) &&
            (this.state.cardNumber !== "") &&
            (this.state.cardExipryDate.length == 5) &&
            (this.state.cardExpMonth !== "") &&
            (this.state.cardExpYear !== "") &&
            (this.state.cardCvn !== "") && 
            (this.state.isSubmitted == false)
        ){
            returnValue = false
        }else{
            returnValue = true
        }
        return returnValue
    }

    upayChecker = () => {
        let returnValue
        if(this.state.amount !== 0){
            returnValue = false
        }else{
            returnValue = true
        }
        return returnValue
    }

    currencyFormat(num: number) {
        return 'PHP' + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }

    onChangeExpiryDate = (expiryDate: any) =>{
        this.setState({cardExipryDate: expiryDate})
        let expiryDateArr = expiryDate.split("/");
        this.setState({
            cardExpMonth: expiryDateArr[0],
            cardExpYear: '20' + expiryDateArr[1]
        })
    }

    setIsTokenizing() {
        this.setState({
          isTokenizing: !this.state.isTokenizing
        });
    }
    
    tokenize() {
        this.setIsTokenizing();
        //dev  xnd_public_development_HUXp1hSUtvRphCwANrXA64W7gzYn9pfFdQiWV1nT16rGws7d1WVvuzXfFngAzW
        //live xnd_public_production_5kgGQgj6ICiqXWGF8R5kgAwLHAv4e2pABymH9Awgq3NIXQz4FaBDW88XqW2XM1M
        Xendit.setPublishableKey('xnd_public_production_5kgGQgj6ICiqXWGF8R5kgAwLHAv4e2pABymH9Awgq3NIXQz4FaBDW88XqW2XM1M');
    
        const tokenData = this.getTokenData();
    
        Xendit.card.createToken(tokenData, (err, token) => {
            this.handleXenditResponse(err, token)
        });

    }

    getTokenData() {
        const {
          amount,
          cardNumber,
          cardExpMonth,
          cardExpYear,
          cardCvn,
          isMultipleUse,
          isSkip3DS
        } = this.state;
    
        return {
          amount,
          card_number: cardNumber,
          card_exp_month: cardExpMonth,
          card_exp_year: cardExpYear,
          card_cvn: cardCvn,
          is_multiple_use: isMultipleUse,
          should_authenticate: !isSkip3DS
        };
    }

      handleXenditResponse = (err, token) => {
        if (err) {
          console.log("error here!", err);
          alert(JSON.stringify(err));
          this.setIsTokenizing();
          return;
        }

        switch (token.status) {
          case 'APPROVED': 
            
          case 'VERIFIED': 
            
          case 'FAILED':
            alert('Transaction failed!');
            break;
          case 'IN_REVIEW':
            this.setState({
              tokenID: token.id,
              webviewUrl: token.payer_authentication_url,
              isRenderWebview: true
            });
    
            break;
          default:
            alert('Unknown token status');
            break;
        }
    
        this.setIsTokenizing();
    }

      showBreakDownSummaryModal = () => {

      }
    
      checkCardInfoAndTokenize = async () => {
        try{
            let isCardNumberValid = await Xendit.card.validateCardNumber(this.state.cardNumber)
            let isCardExpiryValid = await Xendit.card.validateExpiry(this.state.cardExpMonth, this.state.cardExpYear);
            let isCardCvnValid = await Xendit.card.validateCvn(this.state.cardCvn);

            if(isCardNumberValid == false){
                alert('Card number is not valid!');
                return
            }else
            if(isCardExpiryValid == false){
                alert('Card Expiry Date is not valid!');
                return
            }else
            if(isCardCvnValid == false){
                alert('Card CVN is not valid!');
                return
            }

            if(
                (isCardNumberValid == true) &&
                (isCardExpiryValid == true) &&
                (isCardCvnValid == true)
            ){
                this.tokenize();
            }
            

        }catch(err){
            console.log("err", err);
        }
      }

      onMessage = async (rawData) => {
        try{
            if(rawData.nativeEvent.data.search('!_{"') == -1){
                const data = await JSON.parse(rawData.nativeEvent.data);
                console.log("ONMESSAGE DATA", data);
                if(data.status == "APPROVED"){
                    
                }
                else if(data.status == "VERIFIED"){
                    console.log("VERIFIED", data.status);
                    setTimeout(() => {
                        this.setState({
                            isRenderWebview: false,
                            tokenID: data.id,
                            authID: data.authentication_id,
                            isSubmitted: true
                        }, () => this.chargingAndCapturingPayment())
                    }, 1500)
                    return
                }else if(data.status == "eWallet Payment Success") {
                    setTimeout(() => {
                        this.setState({
                            webviewUrl: '',
                            isRenderWebview: false
                        }, () => {
                            router.back()
                        })
                    }, 2000)
                    return
                }else if (data.status == "eWallet Payment Failure"){
                    alert('Transaction failed!, your account wont be charged.');
                    this.setState({
                        webviewUrl: '',
                        isRenderWebview: false
                    })
                }
                else if(data.status == "FAILED"){
                    alert('Transaction failed!, your account wont be charged.');
                    this.setState({
                        webviewUrl: '',
                        isRenderWebview: false
                    })
                    return
                }
            }
        }catch(err){
            // console.log("error", err);
        }
      }

      chargingAndCapturingPayment = () => {
        try{
            let state = this.state
            let data ={
                tokenID: state.tokenID,
                authID: state.authID,
                amount: state.amount,
                referenceID: this.state.retailer._id,
                retailer_id: state.retailer._id,
                firstName: state.firstName,
                lastName: state.lastName,
                middleName: state.middleName,
                email: state.email,
                mobileNumber: state.mobileNumber,
            }
            axios.post(Config.api + `/xendit/chargeCard`, {data: data})
            .then( res => {
                let response = res.data.result
                if(response.capture.status == "CAPTURED" && response.charge.status == "AUTHORIZED"){
                    alert("Payment Success!, we successfully received your payment. thank you!")
                    this.props.navigation.goBack()
                }else{
                    alert("Capturing failed!, your account wont be charged.")
                    this.setState({
                        isSubmitted: false
                    })
                }
            })
            .catch(err => {
                alert('Transaction failed!, your account wont be charged.');
                this.setState({
                    isSubmitted: false
                })
                console.log("err", err)
            })
        }catch(err){
            alert('Transaction failed!, your account wont be charged.');
            this.setState({
                isSubmitted: false
            })
            console.log('err', err);
        }
      }

      selectedMethod = (method: any) => {
        this.setState({
            paymentType: method
        })
      }


      confirmPayment = (type: string) => {
        console.log('clicked');
        let state = this.state
        let data = {
            amount: this.state.amount,
            eWalletType: type,

            referenceID: this.state.retailer._id,
            retailer_id: state.retailer._id,
            firstName: state.firstName,
            lastName: state.lastName,
            middleName: state.middleName,
            email: state.email,
            mobileNumber: state.mobileNumber,
        }

        axios.post(Config.api + `/xendit/chargeEWallet`, {data: data})
        .then(res => {
            console.log("Response", res.data.result);
            if(res.data.status == "success"){
                this.setState({
                    webviewUrl: res.data.result.actions.mobile_web_checkout_url,
                    isRenderWebview: true
                  });
            }else{
                alert('Paymnet request failed!');
            }
        })
        .catch(err => {
            console.log("Error: ", err);
        })
      }

    hexStringToUint8Array = (hexString) => {
        if (hexString.length % 2 != 0)
        throw 'Invalid hexString';
        var arrayBuffer = new Uint8Array(hexString.length / 2);
        for (var i = 0; i < hexString.length; i += 2) {
            var byteValue = parseInt(hexString.substr(i, 2), 16);
            if (Number.isNaN(byteValue))
            throw 'Invalid hexString';
            arrayBuffer[i / 2] = byteValue;
        }
        return arrayBuffer;
    }

    arrayBufferToBase64(buffer) {
        var binary = '';
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    concatBuffers(buffer1, buffer2) {
        var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
        tmp.set(new Uint8Array(buffer1), 0);
        tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
        return tmp.buffer;
    }

    generateUniqueId = () => {
        const timestamp = Date.now().toString(36); // Convert current timestamp to base36 string
        const randomStr = Math.random().toString(36).substr(2, 5); // Generate a random string
        const uniqueId = timestamp + randomStr; // Concatenate timestamp and random string
        return uniqueId;
    }

    processForUpay = async () => {
        try {
            let Uuid = '6FD40C0A-4BF3-C834-FD89-7E732153D4CA'
            let aeskey = '343442362f232a31612333376261333442254242376537332f312a336434433f'
            let upayUrl = 'https://apiuat.unionbankph.com/ubp/external/upay/payments/v1'
            let upayEndpoint = '/transactions'
            let payload = {
                senderRefId: this.generateUniqueId(),
                transRequestDate: new Date(),
                emailAddress: this.state.email,
                amount: this.state.amount,
                paymentMethod: 'instapay',
                MobileNumber: this.state.mobileNumber,
                skipWhiteLabelPage: "true",
                callbackURL: 'http://13.212.72.37/api/upay/serviceCallback',
                references: []
            }
            
            const headers = {
                'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
                'x-ibm-client-id': 'YOUR_CLIENT_ID',
                'x-ibm-client-secret': 'YOUR_CLIENT_SECRET',
                'x-partner-id': 'YOUR_PARTNER_ID'
            };
    

            axios.post(`${upayUrl}/${upayEndpoint}`, payload, { headers })
                .then(res => {
                    console.log("🚀 ~ processForUpay= ~ res:", res.data)
                })
                .catch(err => {
                    console.log("🚀 ~ processForUpay= ~ err:", err)
                })
        } catch (error) {
            console.log("🚀 ~ processForUpay= ~ error:", error)
        }
    }
    


    render(){
        const INJECTED_JAVASCRIPT = `(function() {
            var eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent';
            var addEventListener = window[eventMethod];
            var messageEvent = eventMethod === 'attachEvent' ? 'onmessage' : 'message';
            addEventListener(messageEvent, function(e) {
              var key = e.message ? 'message' : 'data';
              var messageStr = e[key];
              try {
                window.ReactNativeWebView.postMessage(messageStr);
              } catch (err) {
                console.log("injected javascript error: ", err);
              }
          }, false);
        })();`;


        if (this.state.isRenderWebview) {
            return (
              <WebView
                source={{uri: this.state.webviewUrl}}
                onMessage={this.onMessage}
                injectedJavaScript={INJECTED_JAVASCRIPT}
              />
            )
        }

        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={globalStyle.container}
            >
                <ScrollView >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={{flex:1}}>
                            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                                <View style={{width: Dimensions.get('screen').width - 60,}}>
                                    <View style={styles.amountContainer}>

                                        <View style={styles.retailersHolder}>
                                            <View style={styles.retailerHolder}>
                                                <Image source={this.state.retailer.logo ? { uri: this.state.retailer.logo } : require("../../../assets/images/test-images/profile.png")} style={styles.logo}/>
                                                <Text style={[globalStyle.commonText]}>{this.state.retailer.name}</Text>
                                            </View>
                                        </View>

                                        <Text style={styles.paymentLabel}>Payment Amount</Text>
                                        <CurrencyInput
                                            value={this.state.amount}
                                            onChangeValue={(value: any) => {
                                            this.setState({amount: value})
                                            }}
                                            prefix="PHP"
                                            delimiter=","
                                            separator="."
                                            precision={2}
                                            style={styles.amountText}
                                            autoFocus={true}
                                        />
                                        {
                                            this.state.amount == 0 ?
                                            <Text style={styles.errorText}>Payment amount must be more than PHP0.00</Text>
                                            : null
                                        }
                                    </View>
                                </View>

                                {
                                    this.state.paymentType == null ?
                                    <View>
                                        <TouchableOpacity style={styles.paymentMethodContainer} onPress={() => this.selectedMethod('Card')} disabled={this.state.amount > 0 ? false : true}>
                                            <Icon name="credit-card" size={24} color="#5E6E74"/>
                                            <Text style={styles.methodText}>Credit / Debit Card</Text>
                                            <View style={{flexDirection: 'row'}}>
                                                <Image source={require('../../../assets/images/payment_master_cards/mc.jpg')} style={styles.cardSmall} />
                                                <Image source={require('../../../assets/images/payment_master_cards/visa.jpg')} style={styles.cardSmall} />
                                            </View>
                                        </TouchableOpacity>

                                        {/* <TouchableOpacity style={styles.paymentMethodContainer} onPress={() => this.confirmPayment('GCash')} disabled={this.state.amount > 0 ? false : true}>
                                            <Text style={styles.methodText}>GCash</Text>
                                            <Image source={require('../../../assets/images/payment_master_cards/GCash-Logo.png')} style={styles.cardSmallEWallet} />
                                        </TouchableOpacity> */}

                                        <TouchableOpacity style={styles.paymentMethodContainer} onPress={() => this.confirmPayment('Maya')} disabled={this.state.amount > 0 ? false : true}>
                                            <Text style={styles.methodText}>Maya</Text>
                                            <Image source={require('../../../assets/images/payment_master_cards/Maya_logo.svg.png')} style={styles.cardSmallEWallet} />
                                        </TouchableOpacity>
                                    </View>
                                    : null
                                }
                                
                                {
                                    this.state.paymentType == 'Card' ?
                                    <View style={styles.invoiceWrapper}>
                                        <View style={styles.invoiceContainer}>
                                            <View style={styles.invoiceTitleContainer}>
                                                <TouchableOpacity onPress={() => this.selectedMethod(null)}>
                                                    <Icon name="arrow-left" color={'#777F83'} size={24}/>
                                                </TouchableOpacity>
                                                <Text style={styles.invoiceTitle}>Pay Invoice</Text>
                                                <Text></Text>
                                            </View>

                                            <View style={styles.cardContainer}>
                                                <Image source={require('../../../assets/images/payment_master_cards/visa.jpg')} style={styles.card} />
                                                <Image source={require('../../../assets/images/payment_master_cards/mc.jpg')} style={styles.card} />
                                                <Image source={require('../../../assets/images/payment_master_cards/discover.png')} style={styles.card} />
                                            </View>

                                            {
                                                this.state.isTokenizing == true ? 
                                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                                                    <ActivityIndicator size="small" color="#70788c" />
                                                    <Text style={globalStyle.commonText}>Tokenizing...</Text>
                                                </View>
                                                : null
                                            }

                                            <View style={styles.formContainer}>
                                                <AppInputMask
                                                    label="Card Number"
                                                    returnKeyType="done"
                                                    value={this.state.cardNumber}
                                                    keyboardType="number-pad"
                                                    placeholder="Card Number"
                                                    type={"custom"}
                                                    options={{
                                                        mask: "9999999999999999",
                                                    }}
                                                    maxLength={16}
                                                    onChangeText={(cardNumber: any) => this.setState({cardNumber})}
                                                />

                                                <View style={styles.cardRow}>
                                                    <View style={{width: '49%'}}>
                                                        <AppInputMask
                                                            label="Expiry Date"
                                                            returnKeyType="done"
                                                            value={this.state.cardExipryDate}
                                                            keyboardType="number-pad"
                                                            placeholder="MM / YY"
                                                            type={"custom"}
                                                            options={{
                                                                mask: "99/99",
                                                            }}
                                                            maxLength={7}
                                                            onChangeText={(expiryDate: any) => this.onChangeExpiryDate(expiryDate)}
                                                        />
                                                    </View>
                                                    <View style={{width: '49%'}}>
                                                        <AppInputMask
                                                            label="CVN"
                                                            returnKeyType="done"
                                                            value={this.state.cardCvn}
                                                            keyboardType="number-pad"
                                                            placeholder="CVN"
                                                            type={"custom"}
                                                            options={{
                                                                mask: "999",
                                                            }}
                                                            maxLength={3}
                                                            onChangeText={(cardCvn: any) => this.setState({cardCvn})}
                                                        />
                                                    </View>
                                                </View>

                                                <TouchableOpacity style={[styles.confirmBtn, {backgroundColor: this.check() == true ? '#eee' : '#E71409' }]} onPress={() => this.checkCardInfoAndTokenize()}>
                                                    <Icon name="lock" size={24} color={'#fff'}/>
                                                    <Text style={[styles.btnText, {marginHorizontal: 10}]}>Pay</Text>
                                                    <Text style={styles.btnText}>{this.currencyFormat(Number(this.state.amount))}</Text>
                                                </TouchableOpacity> 
                                            </View>
                                        </View>
                                    </View>   
                                    : null
                                }

                                {/* {
                                    this.state.paymentType == "GCash" ?
                                    <View>
                                        <Text>GCash Payment UI</Text>
                                    </View>
                                    :null
                                }

                                {
                                    this.state.paymentType == "Maya" ?
                                    <View>
                                        <Text>Maya Payment UI</Text>
                                    </View>
                                    :null
                                } */}

                            {/* <TouchableOpacity style={[styles.confirmBtn, {backgroundColor: this.upayChecker() == true ? '#eee' : '#E71409' }]} onPress={() => this.processForUpay()}>
                                <Icon name="lock" size={24} color={'#fff'}/>
                                <Text style={[styles.btnText, {marginHorizontal: 10}]}>Pay</Text>
                                <Text style={styles.btnText}>{this.currencyFormat(Number(this.state.amount))}</Text>
                            </TouchableOpacity>  */}
                            </View>
                            <View style={{justifyContent: 'center', alignItems: 'center'}}>
                                <Image source={require('../../../assets/images/payment_master_cards/xendit.png')} style={styles.xendit} />
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </ScrollView>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {
                    console.log("modal close");
                }}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView} >
                        <TouchableOpacity style={styles.closeModal} onPress={() => {
                            this.setState({
                                modalVisible: !this.state.modalVisible
                            })
                        }}>
                            <Text style={{ fontSize: 30, color: '#e71409' }}>&times;</Text>
                        </TouchableOpacity>

                        <View style={{flex: 1, width: '100%'}}>
                            <Text>Summary</Text>
                        </View>
                    </View>
                </View>
                </Modal>
                
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
  invoiceWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  invoiceContainer: {
    borderWidth: 2,
    width: Dimensions.get('screen').width - 60,
    borderColor: '#E2E2E2',
    borderRadius: 6
  },
  invoiceTitleContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#EEF2F5',
    borderBottomWidth : 2,
    borderColor: '#E2E2E2',
    flexDirection: 'row',
  },
  invoiceTitle: {
    fontFamily: 'OpenSansRegular',
    fontSize: 20,
    color: '#777F83'
  },

  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20
  },

  formContainer: {
    padding: 20,
    paddingTop: 10,
  },

  confirmBtn: {
    backgroundColor: '#E71409',
    padding: 15,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10
  },
  btnText: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'OpenSansRegular',
    fontWeight: 'bold'
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  card: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 4,
    marginRight: 5
  },
  amountText: {
    fontFamily: 'OpenSansRegular',
    fontSize: 30
  },
  paymentLabel: {
    fontFamily: 'OpenSansRegular',
    fontSize: 15
  },
  amountContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30
  },

  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0, 0.3)',
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
  paymentMethodContainer: {
    borderWidth: 2,
    width: Dimensions.get('screen').width - 60,
    borderColor: '#E2E2E2',
    borderRadius: 6,
    padding: 20,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  cardSmall: {
    width: 35,
    height: 24,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 4,
    marginRight: 5
  },
  methodText: {
    fontFamily: 'OpenSansRegular',
    fontSize: 15
  },
  cardSmallEWallet: {
    width: 60,
    height: 30,
    borderColor: '#E2E2E2',
    marginRight: 5,
    resizeMode: 'contain'
  },
  xendit: {
    resizeMode: 'contain',
    width: 120,
    height: 40,
    marginVertical: 10
  },
  errorText: {
    fontSize: 12,
    color: 'red'
  },

  logo: {
    resizeMode: 'cover',
    width: 50,
    height: 50,
    borderRadius: 23,
    marginRight: 10
  },
  retailersHolder: {
    // backgroundColor: 'red'
  },
  retailerHolder: { 
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center', 
  },

// modal styles
centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0, 0.3)'
},
modalView: {
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '80%',
    height: vh(56),
    justifyContent: 'center',
    alignItems: 'center',
},
closeModal: {
    position: 'absolute',
    top: 0,
    right: 12,
},
});
