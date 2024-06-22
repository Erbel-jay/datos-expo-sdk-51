import * as React from 'react';
import {
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    TouchableWithoutFeedback,
    ScrollView,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    Text,
    View,
    Image
} from 'react-native';
import { globalStyle } from "../../../../assets/styles/globalStyle";
import { AppInput, AppSelect, DatePickerInput } from "../../../../components/Inputs";
import { CancelBtn, BackBtn, NextBtn, SaveBtn, ProceedBtn } from "../../../../components/Buttons";
import axios from 'axios'
import Config from "../../../../constants/Config"
const { _storeData, _retrieveData } = require("../../../../helpers/global-function");
import Icon from '@expo/vector-icons/build/Feather';
import * as Linking from "expo-linking"
import { datosDarkGray } from '../../../../assets/styles/colorUsed';
import { router, Link, useLocalSearchParams } from 'expo-router';

const ProductScreen = () => {
  let localSearchParams = useLocalSearchParams()
  return <ProductScreenComponent localSearchParams={localSearchParams}/>
}

export default ProductScreen

class ProductScreenComponent extends React.Component<any, any> {
    constructor(props: any) {
        super(props)
    }

    state: any = {
        current_user_object_id: '',
        contact_number: '',
        retailerBranches: [],
        brands: [],
        models: [],
        variants: [],
        minimun_down_paymnets: [],
        termss: [],
        monthly_amortizations: [],
        freebiess: [],
        listOfPromoCodes: [],
        promocode: '',
        retailer: '',
        loanCategory: '',
        branch: '',
        brand: '',
        model: '',
        variant: '',
        minimun_down_paymnet: '',
        terms: '',
        monthly_amortization: '',
        freebies: '',
        data: null,

        isLoaded: false,
        isInfoSubmitted: false,
        userData: null,
        disableActions: false,
        scannedQRCodeDetails: null,
        fullRetailers: [],
    }


    async componentDidMount() {
        // alert('navigating to main home-screen');
        // setTimeout(() => {
        //     this.props.navigation.navigate('MainHomeScreen')
        // }, 3000)
        // return
        if (this.props.localSearchParams !== undefined) {
            let params = this.props.localSearchParams
            console.log('retailer', params);
            this.setState({retailer: params}, () => {
                this.getRetailerFullDetails(this.state.retailer._id)
            })
        }else{
            let qrCode = await _retrieveData('retailerDetails')
            if(qrCode){
            let qrcodeDetails = JSON.parse(qrCode)
                this.setState({
                    retailer: qrcodeDetails.retailer_id,
                    loanCategory: qrcodeDetails.loan_category,
                }, () => {
                    this.getRetailerFullDetails(this.state.retailer)
                })
            }
        }

        let current_user_data: any = await _retrieveData('current_user');
        let current_user = JSON.parse(current_user_data);
        if (current_user) {
            this.setState({
                current_user_object_id: current_user._id
            }, () => {
                this.getUserData()
            })
        }

    }

    getRetailerFullDetails = async (retailer_id: any) => {
        try{
            axios.get(Config.api + `/retailer/getRetailerFullDetails/${retailer_id}`)
            .then(res => {
                let tempRetailer = this.state.retailer
                tempRetailer.branches = res.data.result.branches,
                tempRetailer.productInformation = res.data.result.productInformation
                
                this.setState({retailer: tempRetailer}, () => {
                    this.fillForm(this.state.retailer)
                    return this.state.retailer
                })
            })
            .catch(err => {
                console.log("getRetailerFullDetails Error: ", err);
            })
        }catch(err){
            console.log("Error: ", err);
        }
    }

    getRetailerFullDetailsForExistingLoan = async (retailer_id: any) => {
        try{
            let res = await axios.get(Config.api + `/retailer/getRetailerFullDetails/${retailer_id}`)
            let tempRetailer = this.state.retailer
            tempRetailer.branches = res.data.result.branches
            tempRetailer.productInformation = res.data.result.productInformation
            return tempRetailer
        }catch(err){
            console.log("Error: ", err);
        }
    }

    getUserData = async () => {
        await axios.get(Config.api + `/user/getUserPlain/${this.state.current_user_object_id}`)
            .then(res => {
                this.setState({
                    userData: res.data.result
                }, () => {
                    //this.state.retailer._id = is the id of the retailer your clicked
                    //this.state.userData.product = is the id of the retailer where you previously applied
                    if(this.state.retailer._id == this.state.userData.product){
                        this.getData()
                    }else{
                        this.setState({ isLoaded: true })
                    }
                })
            })
    }

    getData = async () => {
        let res = await axios.get(Config.api + `/product/getProduct/${this.state.userData.product}`)
            .then(async res => {
                if (res.data.result !== null) {
                    let data = res.data.result
                    let fullRetailerDetails = await this.getRetailerFullDetailsForExistingLoan(data.retailer._id);

                    if (fullRetailerDetails) {
                        this.setState({
                            promocode: this.state.promocode,
                            retailer: fullRetailerDetails,
                            loanCategory: data.loanCategory,
                            branch: data.branch,
                            brand: data.brand,
                            model: data.model,
                            variant: data.variant,
                            minimun_down_paymnet: data.minimun_down_paymnet,
                            terms: data.terms,
                            monthly_amortization: data.monthly_amortization,
                            freebies: data.freebies,

                            isInfoSubmitted: data.user.isInfoSubmitted,
                            disableActions: true
                        }, () => {
                            this.fillForm(this.state.retailer, data.branch, data.brand, data.model)
                        })
                    }
                }
                this.setState({ isLoaded: true })
            })
            .catch(err => {
                console.log("ERROR: -", err);
            })
    }

    submitForm = async () => {
        // return this.alert('Success!', 'Product details successfully updated!'); //this is just for testing

        // try{
        //     if(this.state.promocode.length > 0){
        //         let find = this.state.listOfPromoCodes.find(code => this.state.promocode == code.code)
        //         if(find == undefined){
        //             Alert.alert("Promo Code Not Found", "The promo code you enter was not found.")
        //         }else{
        //             this.sendData()
        //         }
        //     }else{
        //         this.sendData()
        //     }
        // }catch(err){
        //     console.log("Error: ", err);
        // }

        if(this.promoCodeChecker() == false){
            return Alert.alert("Promo Code Not Found", "The promo code you enter was not found.")
        }
        this.sendData();
    }

    promoCodeChecker = () => {
        let returnValue = true
        if(this.state.promocode.length > 0){
        if(this.state.listOfPromoCodes.length > 0){
            let find = this.state.listOfPromoCodes.find((code: any) => this.state.promocode == code.code)
            if(find == undefined){
                returnValue = false
            }else{
                returnValue = true
            }
        }
        }else{
            returnValue = true
        }
        return returnValue
  }

    sendData = async () => {
        try {
            let formData = new FormData();
            let data = {
                promocode: this.state.promocode,
                retailer: this.state.retailer._id,
                loanCategory: this.state.loanCategory,
                branch: this.state.branch,
                brand: this.state.brand,
                model: this.state.model,
                variant: this.state.variant,
                minimun_down_paymnet: this.state.minimun_down_paymnet,
                terms: this.state.terms,
                monthly_amortization: this.state.monthly_amortization,
                freebies: this.state.freebies,
            }

            formData.append("data", JSON.stringify(data));
            axios.post(Config.api + `/product/product/${this.state.current_user_object_id}`, formData)
                .then(res => {
                    this.setState({
                        disableActions: true
                    })
                    this.alert("Success!", "Product Details successfuly updated!")

                })
                .catch(err => {
                    console.log("ERROR:", err)
                    Alert.alert("Failed!", "Someting went wrong!")
                })
        } catch (err) {
            console.log('sendData Error: ', err);
        }
    }

    alert = (title: string, message: string) => {
        Alert.alert(
            title,
            message,
            [
                {
                    text: "OK", onPress: () => { router.push({pathname: "Home/MainHome/Retailer/RetailerForms", params: this.state.retailer}) }
                }
            ],
            { cancelable: false }
        );
    }

    checking = () => {
        let returnValue = false
        if (this.state.isInfoSubmitted == true) {
            returnValue = true
        } else {
            if ((this.state.retailer == '') || (this.state.loanCategory == '')) {
                returnValue = true
            }else{
                returnValue = false
            }
            
            if(this.state.retailerBranches.length > 0){
                if(this.state.branch.length == 0){
                    returnValue = true
                }else{
                    returnValue = false
                }
            }
            
            if(this.state.brands.length > 0){
                if(this.state.brand == '' || this.state.brand == null){
                    return true
                }else{
                    returnValue = false
                }
            }

            if(this.state.models.length > 0){
                if(this.state.model == '' || this.state.model == null){
                    return true
                }else{
                    returnValue = false
                }
            }
            
            if(this.state.variants.length > 0){
                if(this.state.variant == '' || this.state.variant == null){
                    return true
                }else{
                    returnValue = false
                }
            }

        }
        return returnValue
    }

    getPromocodes = async (retailer_id: any) => {
        try{
        axios.get(Config.api + `/promocode/getPromocodes/${retailer_id}`)
        .then(response => {
            if(response.data.status == "success"){
                this.setState({
                    listOfPromoCodes: response.data.result
                })
            }
        })
        .catch(err => {
            console.log("Error: ", err);
        })
        }catch(err){
            console.log("err");
        }
    }

    fillForm = (retailer: any, branch: any = null, brand: any = null, model: any = null) => {
        console.log("branch", branch, " brand", brand, " model", model);
        this.setState({
            retailer: retailer,
            branch: branch ? branch: '',
            brand: brand ? brand : '',
            model: model ? model : ''
        })
        this.getPromocodes(retailer._id)
       
        let branches_items:any[] = [];
        let brands:any[] = []
        let models:any[] = []
        let variants:any[] = []
        let minimun_down_paymnets:any[] = [] 
        let termss:any[] = []
        let monthly_amortizations:any[] = []
        let freebiess:any[] = []

        // if(this.state.retailerBranches.length == 0){
            this.state.retailer.branches.filter((b: any) => {
                branches_items.push({
                    label: b.branch_name, value: b._id});
            })
            this.setState({retailerBranches: branches_items})
        // }
        
        this.state.retailer.branches.filter((b:any) => {
            if(b._id == branch){
                this.setState({contact_number: b.contact_number})
            }
        })
        
        for(let x = 0; x < this.state.retailer.productInformation.length; x++){
            brands.push({label: this.state.retailer.productInformation[x].brand, value: this.state.retailer.productInformation[x].brand})
        }
        this.setState({loanCategory: this.state.retailer.loan_category})

        let unique = brands
            .filter(item => item.label !== null) 
            .reduce((acc, item) => {
                if (!acc.has(item.label)) {
                    acc.set(item.label, item);
                }
                return acc;
            }, new Map())
            .values();

        unique = [...unique];
        
        this.setState({ brands: unique })

        for(let x = 0; x < this.state.retailer.productInformation.length; x++){
            let productInfo = this.state.retailer.productInformation[x]
            if(productInfo.brand == brand){
                models.push({label: this.state.retailer.productInformation[x].model, value: this.state.retailer.productInformation[x].model})
            }
        }
        this.setState({ models })


        for(let x = 0; x < this.state.retailer.productInformation.length; x++){
            let productInfo = this.state.retailer.productInformation[x]
            if((productInfo.brand == brand) && (productInfo.model == model)){

                for(let z = 0; z < this.state.retailer.productInformation[x]?.variant?.length; z++){
                    let cvariant = this.state.retailer.productInformation[x]?.variant[z]
                    variants.push({label: cvariant, value: cvariant})
                }
            }
        }
        this.setState({ variants })

        for(let x = 0; x < this.state.retailer.productInformation.length; x++){
            let productInfo = this.state.retailer.productInformation[x]
            if((productInfo.brand == brand) && (productInfo.model == model)){
                let cminimun_down_paymnet = this.state.retailer.productInformation[x].minimun_down_paymnet
                minimun_down_paymnets.push({label: cminimun_down_paymnet, value: cminimun_down_paymnet})
                this.setState({minimun_down_paymnet: cminimun_down_paymnet})
            }
        }
        this.setState({ minimun_down_paymnets })

        for(let x = 0; x < this.state.retailer.productInformation.length; x++){
            let productInfo = this.state.retailer.productInformation[x]
            if((productInfo.brand == brand) && (productInfo.model == model)){
                let cterms = this.state.retailer.productInformation[x].terms
                termss.push({label: cterms, value: cterms})
                this.setState({terms: cterms})
            }
        }
        this.setState({ termss })

        for(let x = 0; x < this.state.retailer.productInformation.length; x++){
            let productInfo = this.state.retailer.productInformation[x]
            if((productInfo.brand == brand) && (productInfo.model == model)){
                let cmonthly_amortization = this.state.retailer.productInformation[x].monthly_amortization
                monthly_amortizations.push({label: cmonthly_amortization, value: cmonthly_amortization})
                this.setState({ monthly_amortization: cmonthly_amortization})
            }
        }
        this.setState({ monthly_amortizations })

        for(let x = 0; x < this.state.retailer.productInformation.length; x++){
            let productInfo = this.state.retailer.productInformation[x]
            if((productInfo.brand == brand) && (productInfo.model == model)){
                let cfreebies = this.state.retailer.productInformation[x].freebies
                freebiess.push({label: cfreebies, value: cfreebies})
                this.setState({ freebies:  cfreebies})
            }
        }
        
        this.setState({ freebiess })
    }

    requiredChecker = () => {
        console.log("isInfoSubmitted", this.state.isInfoSubmitted);
        console.log("retailer", this.state.retailer);
        console.log("loanCategory", this.state.loanCategory);
        console.log("branch", this.state.branch);
        console.log("brand", this.state.brand);
        console.log("models", this.state.models);
        console.log("variants", this.state.variants);

        console.log("CHECK FUNCTION RETURNS",this.checking())
    }

    makeCall(number:any){
        Linking.openURL(`tel:${number}`)
    }

    render() {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={globalStyle.container}
            >
                {
                    this.state.isLoaded == false ?
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="small" color="#70788c" />
                            <Text style={globalStyle.commonText}>Fetching Retailers Informations...</Text>
                        </View>
                        :
                        <ScrollView>
                            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                <View style={globalStyle.wrapper}>
                                    <View style={{alignItems: 'center', marginBottom: 25}}>
                                        <Image source={{uri: this.state.retailer.logo}} style={styles.logo}/>
                                        <Text style={[globalStyle.commonText, {fontSize: 18, fontWeight: 'bold'}]}>{this.state.retailer.name}</Text>
                                    </View>

                                    {/* <View style={styles.termsBox}>
                                        <Text style={[globalStyle.commonText, {fontSize: 13, color: datosDarkGray, marginBottom: 5}]}>Loan Terms: min 6 months, max 36 months</Text>
                                        <Text style={[globalStyle.commonText, {fontSize: 13, color: datosDarkGray, marginBottom: 5}]}>Monthly Add-on Rate: 1.6% to 1.8%</Text>
                                        <Text style={[globalStyle.commonText, {fontSize: 13, color: datosDarkGray, marginBottom: 5}]}>Annual Percentage Rate:  20% to 22%</Text>
                                        <Text style={[globalStyle.commonText, {fontSize: 13, color: datosDarkGray,}]}>Required repayment: Monthly Basis</Text>
                                    </View> */}
                                    
                                    {
                                        this.state.isInfoSubmitted == true ?
                                            <Text style={globalStyle.commonText}>All Informations has been submitted editing is not allowed.</Text>
                                            : null
                                    }
                                    <View style={globalStyle.inputHolder}>
                                        

                                        
                                        {
                                            this.state.retailerBranches.length > 0 ?
                                                <AppSelect
                                                placeholder="Select Branch"
                                                onChange={(branch: any) => this.fillForm(this.state.retailer, branch)}
                                                value={this.state.branch}
                                                items={this.state.retailerBranches}
                                                disable={this.state.isInfoSubmitted}
                                            />
                                            :
                                            null
                                        }
                                        {
                                            this.state.contact_number ?
                                                <View style={styles.contactNumberHolder}>
                                                    <Text>{this.state.contact_number}</Text>
                                                    <TouchableOpacity style={styles.iconHolder} onPress={() => this.makeCall(this.state.contact_number)}>
                                                        <Icon name="phone" color="#eff1ff" size={20}/>
                                                    </TouchableOpacity>
                                                </View>
                                            :
                                            null
                                        }
                                        
                                        <AppInput
                                            placeholder="Discount Code"
                                            label="Discount Code"
                                            onChange={(promocode: any) => this.setState({promocode: promocode})}
                                            value={this.state.promocode}
                                            editable={this.state.isInfoSubmitted == false ? true : false}
                                            optional={true}
                                        />

                                        {
                                            this.state.retailer && this.state.branch && this.state.brands.length > 0 ?
                                                <AppSelect
                                                    placeholder="Select Brand"
                                                    onChange={(brand: any) => this.fillForm(this.state.retailer, this.state.branch, brand)}
                                                    value={this.state.brand}
                                                    items={this.state.brands}
                                                    disable={this.state.isInfoSubmitted}
                                                />
                                            :
                                            null
                                        }

                                        {
                                            this.state.retailer && this.state.brand && this.state.models.length > 0 ?
                                                <AppSelect
                                                    placeholder="Select Model"
                                                    onChange={(model: any) => this.fillForm(this.state.retailer, this.state.branch, this.state.brand, model)}
                                                    value={this.state.model}
                                                    items={this.state.models}
                                                    disable={this.state.isInfoSubmitted}
                                                />
                                            :
                                            null
                                        }

                                        {
                                            this.state.retailer && this.state.brand && this.state.model && this.state.variants.length > 0 ?
                                                <AppSelect
                                                    placeholder="Select Variant"
                                                    onChange={(variant: any) => { this.setState({ variant }) }}
                                                    value={this.state.variant}
                                                    items={this.state.variants}
                                                    disable={this.state.isInfoSubmitted}
                                                />
                                            :
                                            null
                                        }


                                        {
                                            this.state.retailer && this.state.brand && this.state.model && this.state.minimun_down_paymnets.length > 0 ?
                                                <View style={styles.infoHolder}>
                                                    <Text style={styles.infoLabel}>Minimum Down Payment</Text>
                                                    <View style={styles.infoContentHolder}>
                                                        <Text style={styles.infoContent}>{this.state.minimun_down_paymnet}</Text>
                                                    </View>
                                                </View>
                                            :
                                            null
                                        }

                                        {
                                            this.state.retailer && this.state.brand && this.state.model && this.state.termss.length > 0 ?
                                                <View style={styles.infoHolder}>
                                                    <Text style={styles.infoLabel}>Terms</Text>
                                                    <View style={styles.infoContentHolder}>
                                                        <Text style={styles.infoContent}>{this.state.terms}</Text>
                                                    </View>
                                                </View>
                                            :
                                            null
                                        }

                                        {
                                            this.state.retailer && this.state.brand && this.state.model && this.state.monthly_amortizations.length > 0 ?
                                                <View style={styles.infoHolder}>
                                                    <Text style={styles.infoLabel}>Monthly Amortization</Text>
                                                    <View style={styles.infoContentHolder}>
                                                        <Text style={styles.infoContent}>{this.state.monthly_amortization}</Text>
                                                    </View>
                                                </View>
                                            :
                                            null
                                        }

                                        {
                                            this.state.retailer && this.state.brand && this.state.model && this.state.freebiess.length > 0 ?
                                                <View style={styles.infoHolder}>
                                                    <Text style={styles.infoLabel}>Freebies</Text>
                                                    <View style={styles.infoContentHolder}>
                                                        <Text style={styles.infoContent}>{this.state.freebies}</Text>
                                                    </View>
                                                </View>
                                            :
                                            null
                                        }
                                        
                                    </View>
                                    <View style={globalStyle.buttonHolder}>
                                        <CancelBtn onPress={() => router.back()} />
                                        <View style={globalStyle.horizontalSpacer}></View>
                                        <ProceedBtn disable={this.checking()} onPress={() => this.submitForm()} />
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </ScrollView>
                }
            </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
    contactNumberHolder: {
        backgroundColor: '#eff1ff', 
        borderRadius: 6,
        width: '100%',
        marginVertical: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row'
    },
    iconHolder: {
        backgroundColor: '#e71409',
        width: 34,
        height: 34,
        borderRadius: 17,
        justifyContent: 'center',
        alignItems: 'center'
    },
    infoHolder:{
        backgroundColor: '#eff1ff', 
        borderRadius: 6,
        width: '100%',
        marginVertical: 10,
        paddingVertical: 15,
        paddingHorizontal: 15,
    },
    infoLabel:{
        fontSize: 12,
        position: 'absolute',
        top: -5,
        left: 15,
        backgroundColor: '#eff1ff',
        borderRadius: 6,
        padding: 2
    },
    infoContentHolder:{
        backgroundColor: '#eff1ff', 
    },
    infoContent:{
        fontSize: 15
    },
    termsBox: {
        padding: 10,
        backgroundColor: 'rgba(226, 131, 80, 0.1)',
        marginBottom: 20,
        borderRadius: 10,
    },
    logo: {
        resizeMode: 'cover',
        width: 150,
        height: 150,
    }
})