import * as React from 'react';
import {
    StyleSheet,
    Image,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    AppState,
    Modal
} from 'react-native';
import { ScrollView } from "react-native-gesture-handler";
import { globalStyle } from '../../../assets/styles/globalStyle';
import moment from 'moment';
import { datosBlack, datosDarkGray, datosOrange, datosWhiteShade } from '../../../assets/styles/colorUsed';
import axios from 'axios';
import Config from '../../../constants/Config';
const { _storeData, _retrieveData, _removeData } = require("../../../helpers/global-function");
import Icon from "@expo/vector-icons/Feather"
import { vw, vh, vmin, vmax } from 'react-native-expo-viewport-units';
import { showMessage, hideMessage } from "react-native-flash-message";
import * as FileSystem from 'expo-file-system';
import { router, Link, useLocalSearchParams } from 'expo-router';

const MessageContentScreen = () => {
let localSearchParams = useLocalSearchParams()
  return <MessageContentScreenComponent localSearchParams={localSearchParams}/>
}

export default MessageContentScreen

class MessageContentScreenComponent extends React.Component<any, any> {
    constructor(props: any) {
        super(props)
    }

    state: any = {
        isLoaded: false,
        current_user_object_id: null,
        retailer_id: null,
        messager_name: "",
        retailer_laon_category: "",
        messager_profile: "",
        messages: [],

        intervalID: null,
        appStateSubscription: null,
        isModalAttachmentVisible: false,
        attachmentOpened: null,
        isDownloadingModalVisible: false
    }



    componentDidMount = async () => {
        if (this.props.localSearchParams !== undefined) {
            let params = this.props.localSearchParams
            console.log('params', params);
            this.setState({
                retailer_id: params.retailer_id,
                messager_name: params.messager_name,
                retailer_laon_category: params.retailer_laon_category,
                messager_profile: params.messager_profile,
            }, async () => {
                console.log('retailer_id', this.state.retailer_id);
                console.log('messager_name', this.state.messager_name);
                console.log('retailer_laon_category', this.state.retailer_laon_category);
                console.log('messager_profile', this.state.messager_profile);

                let current_user_data: any = await _retrieveData('current_user');
                let current_user = JSON.parse(current_user_data);
                if (current_user) {
                    this.setState({
                        current_user_object_id: current_user.id,
                    }, () => {
                        this.getMessagesByRetailer_id()
                        const id = setInterval(() => {
                            this.getMessagesByRetailer_id()
                        }, 5000)

                        this.setState({
                            intervalID: id
                        })
                        // Subscribe to app state changes and save the subscription to state
                        const subscription = AppState.addEventListener('change', this.handleAppStateChange);
                        this.setState({ appStateSubscription: subscription });
                    })
                }
            })
        } else {
            console.log('No params');
        }
    }

    componentWillUnmount() {
        // Clear the interval and remove the event listener when the component unmounts
        clearInterval(this.state.intervalID);
        console.log("Interval Cleared");
        this.state.appStateSubscription.remove();
    }

    handleAppStateChange = (newState: any) => {
        if (newState === 'inactive' || newState === 'background') {
            // App is in the background or inactive, clear the interval
            clearInterval(this.state.intervalID);
            console.log("Interval Cleared");
        } else {
            // App is in the foreground, restart the interval if needed
            const newIntervalId = setInterval(() => {
                console.log('Interval running...');
            }, 1000);

            // Save the new interval ID to state
            this.setState({ intervalID: newIntervalId });
        }
    };

    downloadAttachment = async (attachment: any) => {
        try {
            this.setState({isDownloadingModalVisible: true})
            const { uri } = await FileSystem.downloadAsync(
                attachment,
                FileSystem.documentDirectory + 'attachment.jpg'
              );
            this.setState({isDownloadingModalVisible: false})
            showMessage({
                message: `Image Downloaded Successfully`,
                type: "success",
              });
        } catch (err) {
            console.log("🚀 ~ file: messageContentScreen.tsx:112 ~ MessageContentScreen ~ err:", err)
        }
    }

    getMessagesByRetailer_id = async () => {
        try {
            // console.log('retailer_id used to fetch messages', this.state.retailer_id);
            axios.get(`${Config.api}/messages/getMessageByUserAndByRetailerForCustomer/${this.state.current_user_object_id}/${this.state.retailer_id}`)
                .then(res => {
                    this.setState({
                        messages: res.data.result ? res.data.result : [],
                    }, () => {
                        console.log('-----------------------------------');
                        console.log('Messages Length:', this.state.messages.length);
                        this.setState({
                            isLoaded: true
                        })
                    })
                })
                .catch(err => {
                    console.log('getMessagesByRetailer_id err: ', err);
                })
        } catch (err) {
            console.log("Error: ", err);
        }
    }

    send = () => {
        let formData = new FormData();
        let data = {
            retailer: this.state.retailer_id,
            from: this.state.current_user_object_id,
            to: this.state.retailer_id,
            title: "",
            message: this.state.messageToSend,
            markAsRead: false
        }
        formData.append("data", JSON.stringify(data));
        axios.post(`${Config.api}/messages/sendMessage`, formData)
            .then(res => {
                this.setState({ messageToSend: null })
                console.log("send message response", res.data);
                let messages = this.state.messages
                messages.push(res.data.result)
                this.setState({ messages })
            })
    }

    attachmentOpener = (attachment: any) => {
        try {
            //open modal
            this.setState({
                isModalAttachmentVisible: true,
                attachmentOpened: attachment
            })
        } catch (err) {
            console.log("🚀 ~ file: messageContentScreen.tsx:152 ~ MessageContentScreen ~ err:", err)
        }
    }

    render() {
        return (
            <View style={[globalStyle.wrapper, { backgroundColor: '#fff' }]}>
                <View style={styles.headerHolder}>
                    <TouchableOpacity style={{ marginRight: 20 }} onPress={() => router.back()}>
                        <Icon name="arrow-left" color={datosBlack} size={25} />
                    </TouchableOpacity>
                    <Image source={{ uri: this.state.messager_profile ? this.state.messager_profile : require('../../../assets/images/test-images/profile.png')  }} style={styles.logo} />
                    <View>
                        <Text style={styles.advisoriesText}>{this.state.messager_name}</Text>
                    </View>
                </View>
                {
                    this.state.isLoaded ?
                        <ScrollView>
                            {
                                // this.state.messages.length == 0 ?
                                // <View style={{justifyContent: 'center', alignItems: 'center',  paddingTop: 50}}>
                                //     <Image source={{uri: this.state.messager_profile}} style={styles.logoLarge}/>
                                //     <Text></Text>
                                // </View>
                                // :
                                this.state.messages.map((data: any, i: any) => {
                                    return (
                                        <View key={i} style={[styles.box, { flexDirection: 'row', justifyContent: data.from == this.state.current_user_object_id ? 'flex-end' : 'flex-start' }]}>
                                            <View style={data.from !== this.state.current_user_object_id ? styles.boxFrom : styles.boxTo} key={i}>
                                                {
                                                    data.title
                                                        ? <Text style={[globalStyle.commonText, { fontWeight: 'bold', marginBottom: 10, color: data.from == this.state.current_user_object_id ? '#fff' : datosBlack }]}>{data.title}</Text>
                                                        : null
                                                }
                                                <Text style={[globalStyle.commonText, { marginBottom: 10, color: data.from == this.state.current_user_object_id ? '#fff' : datosBlack }]}>
                                                    {data.message}
                                                </Text>
                                                {
                                                    data.attachment1
                                                        ?
                                                        <View style={styles.attachmentContainer}>
                                                            <View style={{ flexDirection: 'row', borderRadius: 6, overflow: 'hidden' }}>
                                                                <TouchableOpacity onPress={() => this.attachmentOpener(data.attachment1)}>
                                                                    <Image source={{ uri: data.attachment1 }} style={styles.attachment} />
                                                                </TouchableOpacity>
                                                                <TouchableOpacity onPress={() => this.attachmentOpener(data.attachment2)}>
                                                                    <Image source={{ uri: data.attachment2 }} style={styles.attachment} />
                                                                </TouchableOpacity>
                                                            </View>
                                                        </View>
                                                        :
                                                        null
                                                }
                                                {
                                                    data.attachment3
                                                        ?
                                                        <View style={styles.attachmentContainer}>
                                                            <View style={{ flexDirection: 'row', borderRadius: 6, overflow: 'hidden' }}>
                                                                <TouchableOpacity onPress={() => this.attachmentOpener(data.attachment3)}>
                                                                    <Image source={{ uri: data.attachment3 }} style={styles.attachment} />
                                                                </TouchableOpacity>
                                                                <TouchableOpacity onPress={() => this.attachmentOpener(data.attachment4)}>
                                                                    <Image source={{ uri: data.attachment4 }} style={styles.attachment} />
                                                                </TouchableOpacity>
                                                            </View>
                                                        </View>
                                                        :
                                                        null
                                                }
                                                {
                                                    data.attachment5
                                                        ?
                                                        <View style={styles.attachmentContainer}>
                                                            <View style={{ flexDirection: 'row', borderRadius: 6, overflow: 'hidden' }}>
                                                                <TouchableOpacity onPress={() => this.attachmentOpener(data.attachment5)}>
                                                                    <Image source={{ uri: data.attachment5 }} style={styles.attachment} />
                                                                </TouchableOpacity>
                                                                <TouchableOpacity onPress={() => this.attachmentOpener(data.attachment6)}>
                                                                    <Image source={{ uri: data.attachment6 }} style={styles.attachment} />
                                                                </TouchableOpacity>
                                                            </View>
                                                        </View>
                                                        :
                                                        null
                                                }

                                                <Text style={[styles.dateText, { color: data.from == this.state.current_user_object_id ? '#fff' : datosBlack }]}>{moment(data.createdAt).format("MMM DD, yyyy | hh:mm A")}</Text>
                                            </View>
                                        </View>)
                                })
                            }
                        </ScrollView>
                        :
                        <ScrollView>
                            <View style={{ alignItems: 'center' }}>
                                <ActivityIndicator color={datosOrange} />
                                <Text style={globalStyle.commonText}>Getting messages please wait...</Text>
                            </View>
                        </ScrollView>
                }

                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <TextInput
                        placeholder='Message'
                        multiline={true}
                        numberOfLines={2}
                        style={styles.messageComposerMessageHolder}
                        value={this.state.messageToSend}
                        onChangeText={(messageToSend) => this.setState({ messageToSend })}
                    />
                    <TouchableOpacity onPress={() => this.send()}>
                        <Icon name="send" size={30} color={datosOrange} />
                    </TouchableOpacity>
                </View>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.isModalAttachmentVisible}
                    onRequestClose={() => {
                        console.log("modal close");
                    }}>
                    <View style={styles.centeredView}>
                        <View style={this.state.isSwitchAccount == false ? styles.modalView : [styles.modalView, { height: '60%', paddingHorizontal: 20 }]}>

                            <Image source={{ uri: this.state.attachmentOpened }} style={styles.modalAttachment} />
                            <TouchableOpacity onPress={() => this.downloadAttachment(this.state.attachmentOpened)} style={styles.downloadBtn}>
                                <Text style={[globalStyle.commonText, {color: '#fff'}]}>Download Attachment</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.closeModal} onPress={() => {
                                this.setState({
                                    isModalAttachmentVisible: !this.state.isModalAttachmentVisible
                                })
                            }}>
                                <Icon name="x" size={18} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.isDownloadingModalVisible}
                    onRequestClose={() => {
                        console.log("modal close");
                    }}>
                    <View style={styles.centeredView}>
                        <View style={this.state.isSwitchAccount == false ? styles.modalView : [styles.modalView, { height: '15%', paddingHorizontal: 20 }]}>

                        <Text>Please wait while downloading attachment...</Text>

                        </View>
                    </View>
                </Modal>
            </View>
        );
    }

}

const styles = StyleSheet.create({
    headerHolder: {
        marginBottom: 25,
        marginLeft: 10,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    logo: {
        width: 50,
        height: 50,
        resizeMode: 'cover',
        borderRadius: 25,
        marginRight: 20
    },
    logoLarge: {
        width: 120,
        height: 120,
        resizeMode: 'cover',
        borderRadius: 60,
    },
    advisoriesText: {
        fontSize: 17,
        fontFamily: "CalibriBold",
        color: datosBlack
    },
    dateText: {
        fontFamily: "CalibriRegular",
        fontSize: 10,
        color: datosDarkGray,
        position: 'absolute',
        bottom: 2,
        right: 5
    },
    box: {
        width: '100%',
        marginBottom: 10,
    },
    boxFrom: {
        padding: 10,
        paddingBottom: 20,
        maxWidth: '70%',
        minWidth: '32%',
        backgroundColor: '#eee',
        overflow: 'hidden',
        borderRadius: 6,
        borderTopLeftRadius: 0,
        flexDirection: 'column'
    },
    boxTo: {
        padding: 10,
        maxWidth: '70%',
        minWidth: '35%',
        backgroundColor: datosOrange,
        overflow: 'hidden',
        borderRadius: 6,
        borderBottomEndRadius: 0,
        flexDirection: 'column'
    },
    attachmentContainer: {
        flexDirection: 'row',
    },
    attachment: {
        resizeMode: 'cover',
        width: 80,
        height: 80,
        margin: 1,
    },
    messageComposerMessageHolder: {
        borderWidth: 1,
        borderRadius: 15,
        borderColor: datosOrange,
        padding: 10,
        textAlignVertical: 'top',
        flex: 1,
        marginRight: 10
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
        backgroundColor: datosOrange,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 10,
        right: 10,
    },
    modalAttachment: {
        width: '100%',
        height: 270
    },
    downloadBtn: {
        marginTop: 10,
        width: '100%',
        padding: 15,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: datosOrange
        
    },
    
});
