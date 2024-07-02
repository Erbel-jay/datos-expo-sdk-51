import * as React from 'react';
import {
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Image,
  TouchableOpacity,
  Text,
  View
} from 'react-native';
import { ScrollView } from "react-native-gesture-handler";
import Config from "../../../constants/Config";
import axios from 'axios';
import Icon from "@expo/vector-icons/Feather"
import { NotifyBox, TwoTab } from "../../../components/cards"
import { datosBlack, datosLightGray, datosRed } from '../../../assets/styles/colorUsed';
import { globalStyle } from '../../../assets/styles/globalStyle';
import { BackBtn } from '../../../components/Buttons';
import { router, useFocusEffect } from 'expo-router';
const { _storeData, _retrieveData, _removeData } = require("../../../helpers/global-function");

function CallStartFunction({ startFunction }) {
  useFocusEffect(
    React.useCallback(() => {
      startFunction()
    }, [])
  );

  return null;
}

export default class MessageScreen extends React.Component<any, any> {
  focusListener: any;
  constructor(props: any) {
    super(props)
  }

  state: any = {
    current_user_object_id: '',
    isTabOne: true,
    advisories: [],
    tracker: [],
    isLoaded: false,

    data: [],
    retailersMessages: [],
    retailers: null,
    messageToSend: null,
    chosenRetailerToSend: null,

    noRetailerToSendError: null,
    noMessageToSendError: null
  }

  async componentDidMount() {
    this.startFunction();
  }

  startFunction = async () => {
    console.log('i got called');
    let current_user_data: any = await _retrieveData('current_user');
    let current_user = JSON.parse(current_user_data);
    if (current_user) {
      this.setState({
        current_user_object_id: current_user.id,
        firstName: current_user.personalInformation.firstName
      }, () => {
        this.getMyMessages();
        this.getAllUserData()
        this.getMessagesSentToCustmer(current_user.id)
      })
    }
  }

  getMyMessages = async () => {
    try {
      console.log('this.state.current_user_object_id', this.state.current_user_object_id);
      let res = await axios.get(Config.api + `/spn/getCustomersMessages/${this.state.current_user_object_id}`)
        .then((res: any) => {
          console.log('res: ', res.data);
          this.setState({
            advisories: res.data.result,
            isLoaded: true
          })
        })
    } catch (err) {
      console.log("Error Message: ", err);
    }
  }

  removeDuplicates(array, key) {
    const seen = new Set();
    return array.filter(item => {
        const value = item[key];
        // Return false if duplicate is found
        if (seen.has(value)) {
            return false;
        }
        // Add key (e.g., item.id) to Set
        seen.add(value);
        return true;
    });
}

  getMessagesSentToCustmer = async (user_id: any) => {
    try {
      axios.get(`${Config.api}/messages/getMessagesSentToCustmer/${user_id}`)
        .then(res => {
          const uniqueArray = res.data.result.filter((object: any, index: any, arr: any) => {
            console.log("🚀 ~ MessageScreen ~ uniqueArray ~ object:", object)
            const firstIndex = arr.findIndex((o: any) => o.retailer._id === object.retailer._id);
            return index === firstIndex;
          });

          this.setState({
            retailersMessages: uniqueArray
          }, () => {
            this.setState({
              isLoaded: true
            })
            this.state.retailersMessages.map((data: any) => {
              // console.log('RETAILERS MESSAGES: ', data.retailer.logo, data.message);
            })
          })
        })
        .catch(err => {
          console.log("getMessagesSentToCustmer err: ", err);
        })
    } catch (err) {
      console.log(err);
    }
  }

  getAllUserData = async () => {
    await axios.get(Config.api + `/user/getUser/${this.state.current_user_object_id}`)
      .then((res: any) => {
        let retailers: any = []
        let loans = res.data.result.loans
        for (let i = 0; i < loans.length; i++) {
          loans[i].product.retailer.name
          console.log('retailer:', loans[i].product.retailer.name);
          retailers.push(loans[i].product.retailer)
        }
        let uniqueArrayOfRetailers = this.removeDuplicates(retailers, '_id');
        this.setState({
          data: res.data.result,
          retailers: uniqueArrayOfRetailers,
        })
      })
      .catch(err => {
        console.log("ERROR:", err)
      })
  }

  changeTab = () => {
    this.setState({
      isTabOne: !this.state.isTabOne
    })
  }

  onChangeMessage = (messageToSend: any) => {
    this.setState({
      messageToSend,
    })
  }

  send = async () => {
    {
      try {
        if (!this.state.messageToSend) {
          this.setState({
            noMessageToSendError: 'Message is required!.'
          });
        }

        if (!this.state.chosenRetailerToSend) {
          this.setState({
            noMessageToSendError: 'Retailer is required!.'
          });
        }

        if (this.state.messageToSend && this.state.chosenRetailerToSend) {
          let formData = new FormData();
          let data = {
            retailer: this.state.chosenRetailerToSend._id,
            from: this.state.current_user_object_id,
            to: this.state.chosenRetailerToSend._id,
            title: "",
            message: this.state.messageToSend,
            markAsRead: false
          }
          formData.append("data", JSON.stringify(data));
          axios.post(`${Config.api}/messages/sendMessage`, formData)
            .then(res => {
              console.log("send message response", res.data);
              router.push({pathname: 'Home/Messages/MessageContentScreen',
              params: {
                retailer_id: this.state.chosenRetailerToSend._id,
                messager_name: this.state.chosenRetailerToSend.name,
                retailer_laon_category: this.state.chosenRetailerToSend.loan_category,
                messager_profile: this.state.chosenRetailerToSend ? this.state.chosenRetailerToSend.logo : require("../../../assets/images/test-images/profile.png"),
              }})
            })
        }

      } catch (err) {
        console.log("send error: ", err);
      }
    }
  }

  onChooseRetailerToSend = (retailer: any) => {
    console.log('--');
    this.setState({
      chosenRetailerToSend: retailer,
    }, () => {
      router.push({pathname: 'Home/Messages/MessageContentScreen',
            params: {
                retailer_id: this.state.chosenRetailerToSend._id,
                messager_name: this.state.chosenRetailerToSend.name,
                retailer_laon_category: this.state.chosenRetailerToSend.loan_category,
                messager_profile: this.state.chosenRetailerToSend ? this.state.chosenRetailerToSend.logo : require("../../../assets/images/test-images/profile.png"),
            }
        })
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.headerHolder}>
          <TouchableOpacity style={{ marginRight: 20 }} onPress={() => router.push('Home/MainHome/MainHomeScreen')}>
              <Icon name="arrow-left" color={datosBlack} size={25} />
          </TouchableOpacity>
        </View>
        <CallStartFunction startFunction={this.startFunction} />
        {/* <ScrollView> */}
        {
          this.state.isLoaded ?
            <View style={{ flex: 1 }}>
              <TwoTab
                changeTab={() => this.changeTab()}
                activeTab={this.state.isTabOne}
                retailersMessages={this.state.retailersMessages}
                navigation={this.props.navigation}
                retailers={this.state.retailers}
                messageToSend={this.state.messageToSend}
                onChangeMessage={this.onChangeMessage}
                send={this.send}
                onChooseRetailerToSend={this.onChooseRetailerToSend}
                chosenRetailerToSend={this.state.chosenRetailerToSend}
              />
              
            </View>
            : null
        }


        {/* </ScrollView> */}
      </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eee",
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerHolder: {
    padding: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  headerContainer: {
    marginBottom: 20,
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  message: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  profile: {
    resizeMode: 'cover',
    width: 46,
    height: 46,
    borderRadius: 23
  },
  messageContent: {
    flexDirection: 'row'
  },
  messageText: {
    marginLeft: 20
  },
  
});
