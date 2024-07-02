import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground, Platform } from 'react-native';
import Icon from '@expo/vector-icons/build/Feather';
import { globalStyle } from "../assets/styles/globalStyle";
import { SubmitBtn, BackBtn } from "../components/Buttons"
import { datosBlack, datosDarkGray, datosLightOrange, datosOrange, datosWhiteShade, datosLightGray, datosRed } from '../assets/styles/colorUsed';
import moment from "moment";
import { ScrollView, TextInput, TouchableWithoutFeedback } from 'react-native-gesture-handler';

//
import { Feather } from "@expo/vector-icons";
import { blob } from 'stream/consumers';
import { router } from 'expo-router';



interface informationProps {
  icon: any
  cardName: string;
  iconBgColor?: string;
  onPress?: any;
  isInfoSubmitted?: boolean
}

class InformationCard extends React.Component<informationProps> {

  render() {
    return (
      <TouchableOpacity style={{ flex: 1 }}
        onPress={this.props.onPress}>
        <View style={[styles.formIcons, { backgroundColor: this.props.iconBgColor, }]}>
          <Image
            source={
              this.props.cardName == "Connect to Retailer" ? require(`../assets/png_icons/company-1.png`)
                : this.props.cardName == "Get Free Insurance" ? require(`../assets/png_icons/Time-Insurance-1.png`)
                  : this.props.cardName == "Organization" ? require(`../assets/png_icons/organization-1.png`)

                    : this.props.cardName == "Account Balances" ? require(`../assets/png_icons/accounting-1.png`)
                      : this.props.cardName == "Messages" ? require(`../assets/png_icons/chat-1.png`)
                        : this.props.cardName == "Make a Payment" ? require(`../assets/png_icons/online-payment-1.png`)
                          : null
            }
            style={styles.home_icons}
          />
        </View>
        <Text style={[styles.cardName, { alignSelf: 'center' }]}>{this.props.cardName}</Text>
      </TouchableOpacity>
    );
  }
}

interface ConfirmDetailsCardProps {
  label?: string,
  onPress?: any,
  backgroundSource?: string,
  icon?: any,
  iconBgColor?: any
}

class ConfirmDetailsCard extends React.Component<ConfirmDetailsCardProps>{
  render() {
    let props = this.props
    return (
      <View style={[{
        backgroundColor: this.props.label == "Personal Information" ? '#304057'
          : this.props.label == "Account Information" ? '#DA5F5A'
            : '#F3B104',
        padding: 20,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        borderRadius: 18
      }]}>
        <View style={{
          backgroundColor: '#fff',
          width: 40,
          height: 40,
          borderRadius: 20,
          marginRight: 20,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Icon
            name={this.props.icon}
            size={20}
            color={datosOrange}
          />
        </View>
        <TouchableOpacity onPress={props.onPress}>
          <Text style={styles.cardLabel}>{props.label}</Text>
        </TouchableOpacity>
      </View>


    );
  }
}

interface NoUserHomeScreendProps {
  navigation: any,
  today: any
}

class NoUserHomeScreen extends React.Component<NoUserHomeScreendProps> {
  render() {
    return (
      <View>
        <View style={globalStyle.wrapper}>
          <Text style={styles.welcomeText}>Welcome Guest</Text>

          <View style={styles.boxHolder}>

            <View style={styles.cardHolder}>
              <InformationCard
                icon="company-1"
                iconBgColor="#304057"
                cardName="Connect to Retailer"
                onPress={() => { }}
              />

              <InformationCard
                icon="Time-Insurance-1"
                iconBgColor="#DA5F5A"
                cardName="Get Free Insurance"
                onPress={() => { }}
              />

              <InformationCard
                icon="organization-1"
                iconBgColor="#E2814E"
                cardName="Organization"
                onPress={() => { }}
              />

            </View>

            <View style={styles.cardHolder}>
              <InformationCard
                icon="accounting-1"
                iconBgColor="#F3B103"
                cardName="Account Balances"
                onPress={() => { }}
              />

              <InformationCard
                icon="chat-1"
                iconBgColor="#E95E0B"
                cardName="Messages"
                onPress={() => { }}
              />

              <InformationCard
                icon="online-payment-1"
                iconBgColor="#2E2E2E"
                cardName="Make a Payment"
                onPress={() => this.props.navigation.navigate("OneTimePaymentStackNavigator")}
              />

            </View>

          </View>

          <View style={{
            justifyContent: 'center',
            alignItems: 'center',
            marginVertical: 10,
            borderTopWidth: 0.5,
            borderColor: '#D9D9D9',
            paddingTop: 30
          }}>
            <Text style={{ fontFamily: 'CalibriBold', fontSize: 15 }}>Today, {this.props.today}</Text>
          </View>

          <View style={styles.notificationContainer}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, paddingHorizontal: 10 }}>
              <Text style={{ fontFamily: 'CalibriBold', fontSize: 19, color: datosBlack }}>Notifications</Text>
              <TouchableOpacity onPress={() => { }}>
                <Text style={{ fontFamily: 'CalibriBold', fontSize: 19, color: datosOrange }}>See all</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>


        <Text style={{ textAlign: 'center' }}>No Messages yet.</Text>
      </View>
    )
  }
}

interface AppTrackerProps {
  loanDisplayInfo: any
}

class AppTrackerCard extends React.Component<AppTrackerProps> {
  render() {
    return (
      <View style={globalStyle.wrapper}>
        <Text style={[styles.headerTitle, { marginBottom: 20, marginLeft: 10 }]}>Loan Application Tracker</Text>

        <View style={{ backgroundColor: datosLightOrange, padding: 10, borderRadius: 15 }}>
          <Text style={[styles.headerTitle, { color: "#fff" }]}>
            {
              this.props.loanDisplayInfo.product
                ? this.props.loanDisplayInfo.product.retailer ? this.props.loanDisplayInfo.product.retailer.name : null
                : null
            }
          </Text>
          <Text style={styles.headerSubTitle}>{this.props.loanDisplayInfo.product.loanCategory}</Text>
        </View>

        <View style={[{ marginTop: 20 }]}>

          <View style={[{ flex: 1 }]}>
            <View style={[styles.verticalLine]}></View>
            <View style={{}}>

              <View style={styles.itemWrap}>
                <View style={styles.firstPoint}></View>
                <View style={[{ marginLeft: 5, flex: 1 }]}>
                  <View style={[{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                    <Text style={{ fontSize: 15, fontFamily: 'CalibriBold' }}>Application Recieved</Text>
                    <Text style={styles.trackerDate}>
                      {moment(this.props.loanDisplayInfo.createdAt).format("MMMM D, YYYY")}
                    </Text>
                  </View>
                  <Text style={styles.statusText}>All forms are securely stored in our system. Please wait for the retailer to confirm your loan application.</Text>
                </View>
              </View>

              <View style={[styles.itemWrap]}>
                <View style={[styles.firstPoint]}></View>
                <View style={[{ marginLeft: 5, flex: 1 }]}>
                  <View style={[{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                    <Text style={{ fontSize: 15, fontFamily: 'CalibriBold', color: this.props.loanDisplayInfo.loanStatus == 'Recieved' ? '#ccc' : 'black' }}>Acknowledged</Text>
                    <Text style={styles.trackerDate}>{this.props.loanDisplayInfo.reviewedDate ? moment(this.props.loanDisplayInfo.reviewedDate).format("MMMM D, YYYY") : null}</Text>
                  </View>
                  <Text style={[styles.statusText, { color: this.props.loanDisplayInfo.loanStatus == 'Recieved' ? '#ccc' : 'black' }]}>Your loan application has already been acknowledged by the retailer. </Text>
                </View>
              </View>

              <View style={[styles.itemWrap]}>
                <View style={[styles.firstPoint]}></View>
                <View style={[{ marginLeft: 5, flex: 1 }]}>
                  <View style={[{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                    <Text style={{ fontSize: 15, fontFamily: 'CalibriBold', color: this.props.loanDisplayInfo.loanStatus == 'Processed' || this.props.loanDisplayInfo.loanStatus == 'Forwarded' ? datosBlack : '#ccc' }}>On Process</Text>
                    <Text style={styles.trackerDate}>{this.props.loanDisplayInfo.processDate ? moment(this.props.loanDisplayInfo.processDate).format("MMMM D, YYYY") : null}</Text>
                  </View>
                  <Text style={[styles.statusText, { color: this.props.loanDisplayInfo.loanStatus == 'Processed' || this.props.loanDisplayInfo.loanStatus == 'Forwarded' ? datosBlack : '#ccc' }]}>The retailer is already processing your loan application and will subject it to evaluation.</Text>
                </View>
              </View>

              <View style={[styles.itemWrap]}>
                <View style={[styles.firstPoint]}></View>
                <View style={[{ marginLeft: 5, flex: 1 }]}>
                  <View style={[{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                    <Text style={{ fontSize: 15, fontFamily: 'CalibriBold', color: this.props.loanDisplayInfo.loanStatus == 'Forwarded' ? 'black' : '#ccc' }}>Evaluated</Text>
                    <Text style={styles.trackerDate}>{this.props.loanDisplayInfo.forwardedDate ? moment(this.props.loanDisplayInfo.forwardedDate).format("MMMM D, YYYY") : null}</Text>
                  </View>
                  <Text style={[styles.statusText, { color: this.props.loanDisplayInfo.loanStatus == 'Forwarded' ? datosBlack : '#ccc' }]}>Your loan application has been reviewed. Expect the result at any moment</Text>
                  <Text style={[styles.statusText, { color: this.props.loanDisplayInfo.loanStatus == 'Forwarded' ? datosBlack : '#ccc' }]}>Thank you.</Text>
                </View>
              </View>

            </View>
          </View>
        </View>
      </View>
    );
  };
}

class TermsCard extends React.Component {
  render() {
    return (
      <View style={styles.termsBox}>
        <Text style={[globalStyle.commonText, { fontSize: 13, color: '#e71409', marginBottom: 5 }]}>Loan Terms: min 6 months, max 36 months</Text>
        <Text style={[globalStyle.commonText, { fontSize: 13, color: '#e71409', marginBottom: 5 }]}>Monthly Add-on Rate: 1.6% to 1.8%</Text>
        <Text style={[globalStyle.commonText, { fontSize: 13, color: '#e71409', marginBottom: 5 }]}>Annual Percentage Rate:  20% to 22%</Text>
        <Text style={[globalStyle.commonText, { fontSize: 13, color: '#e71409', }]}>Required repayment: Monthly Basis</Text>
      </View>
    );
  }
}

interface TwoTabProps {
  changeTab: any,
  activeTab: boolean,
  retailersMessages: any,
  navigation: any,

  retailers: any,
  chosenRetailerToSend?: any,
  messageToSend: any,
  onChangeMessage: any,
  send: any,
  onChooseRetailerToSend: any,
}

class TwoTab extends React.Component<TwoTabProps> {
  render() {
    return (
      <View style={{ flex: 1, }}>
        <View style={styles.tabHeaderHolder}>
          <TouchableOpacity style={styles.tabHeader} onPress={this.props.changeTab}>
            <Text style={[
              styles.headerTitle,
              {
                color: this.props.activeTab == true ? datosOrange : datosBlack
              }
            ]}>Messages</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabHeader} onPress={this.props.changeTab}>
            <Text style={[
              styles.headerTitle,
              {
                color: this.props.activeTab == false ? datosOrange : datosBlack,
                fontSize: 12
              }
            ]}>Compose a message</Text>
          </TouchableOpacity>
        </View>
        <View style={{flex: 1}}>
          {
            this.props.activeTab == true ?
              this.props.retailersMessages.length == 0 ?
                <Text style={{ fontSize: 12, fontFamily: 'CalibriRegular', color: datosLightGray, alignSelf: 'center' }}>There is nothing here.</Text>
                :
                <>
                  {
                    this.props.retailersMessages.map((data: any, i: any) => {
                      return (
                        <View style={{padding: 10}} key={i}>
                          <NotifyBox key={i} data={data} navigation={this.props.navigation} activeTab={this.props.activeTab} />
                        </View>
                      );
                    })
                  }
                  <View style={styles.endLine}></View>
                  <View style={{ height: 10 }}>
                    <Text style={styles.endMessage}>End of messages</Text>
                  </View>
                </>

              :
              <ComposeMessage
                onChooseRetailerToSend={this.props.onChooseRetailerToSend}
                retailers={this.props.retailers}
                chosenRetailerToSend={this.props.chosenRetailerToSend}
                messageToSend={this.props.messageToSend}
                onChangeMessage={this.props.onChangeMessage}
                send={this.props.send}
                navigation={this.props.navigation}
              />
          }
        </View>
      </View>
    );
  }
}

interface ComposeMessageProps {
  retailers: any;
  chosenRetailerToSend: any,
  messageToSend: any,
  onChangeMessage: any,
  send: any,
  onChooseRetailerToSend: any,
  navigation: any
}
class ComposeMessage extends React.Component<ComposeMessageProps> {
  render() {
    return (
      <View style={[styles.listOfRetailersRecipientsWrapper, { flex: 1 }]}>
        <View style={{ alignItems: 'center', backgroundColor: '#fff', paddingVertical: 10, height: 60}}>
          <TouchableOpacity style={{position: 'absolute', left: 10, top: 10}} onPress={() => router.back()}>
            <Text style={{fontSize: 12, color: datosOrange}}>Cancel</Text>
          </TouchableOpacity>
          <Text style={{fontSize: 15, color: datosBlack, fontWeight: 'bold'}}>New Message</Text>
        </View>
        <View style={{  paddingVertical: 10 }}>
          <Text style={[globalStyle.commonText, { marginLeft: 20 }]}>To: </Text>
        </View>
        <View style={{ flex: 1 }}>
          <ScrollView>
            {
              this.props.retailers.map((r: any, i: any) => {

                return (
                  <TouchableOpacity onPress={() => this.props.onChooseRetailerToSend(r)} style={styles.listOfRetailersRecipients} key={i}>
                    <Image source={r.logo ? { uri: r.logo } : require("../assets/images/test-images/profile.png")} style={styles.retailerRecipeintLogo} />
                    <Text>{r.name}</Text>
                  </TouchableOpacity>
                )
              })
            }
          </ScrollView>
        </View>
        <View style={{alignItems: 'center', marginBottom: 30}}>
          <BackBtn onPress={() => this.props.navigation.goBack()} />
        </View>
      </View>
    )
  }
}

interface NotifyBoxProps {
  data: any,
  navigation: any,
  activeTab: boolean,
  loanDisplayInfo?: any
}
class NotifyBox extends React.Component<NotifyBoxProps> {
  render() {
    return (
      <TouchableOpacity
        style={styles.notificationBox}
        key={this.props.data._id}
        onPress={() => this.props.activeTab == true ?
          this.props.navigation.navigate('Message', {
            screen: 'MessageContentScreen',
            params: {
              retailer_id: this.props.data.retailer._id,
              messager_name: this.props.data.retailer.name,
              retailer_laon_category: this.props.data.retailer.loan_category,
              messager_profile: this.props.data ? this.props.data.retailer.logo : require("../assets/images/test-images/profile.png"),
            }
          })
          :
          this.props.navigation.navigate('ApplicationTrackerScreen', {
            loanDisplayInfo: this.props.loanDisplayInfo
          })
        }
      >
        <Image
          source={{ uri: this.props.data.retailer.logo ? this.props.data.retailer.logo : require('../assets/images/test-images/profile.png') }}
          style={{ width: 50, height: 50, resizeMode: 'cover', borderRadius: 25 }}
        />
        <View style={[styles.notifyBoxContentHolder]}>
          <Text style={{ fontSize: 15, fontWeight: this.props.data.markAsRead ? 'normal' : 'bold' }}>{this.props.data.retailer.name}</Text>
          {
            this.props.data.title
              ?
              <Text style={styles.notifyBoxTitle}>
                {this.props.data.title && this.props.data.title.length > 40 ? `${this.props.data.title.substring(0, 40)}...` : this.props.data.title}
              </Text>
              :
              <Text style={styles.notifyBoxMessage}>
                {this.props.data.message.length > 50 ? `${this.props.data.message.substring(0, 50)}...` : this.props.data.message}
              </Text>
          }


        </View>
        <Text style={[styles.notifyBoxMessage, { position: 'absolute', right: 10, bottom: 5 }]}>{moment(this.props.data.createdAt).format("MMM DD, yyyy hh:mm a")}</Text>
      </TouchableOpacity>
    );
  }
}


interface EaMessageBoxProps {
  data: any,
  navigation: any,
}
class EaMessageBox extends React.Component<EaMessageBoxProps> {
  render() {
    return (
      <TouchableOpacity
        style={styles.notificationBox}
        key={this.props.data._id}
        onPress={() => {
          this.props.navigation.navigate('MessageStackNavigator' ,{screen: 'MessageContentScreen', params: { 
            retailer_id: this.props.data.retailer._id,
            messager_name: this.props.data.retailer.name,
            retailer_laon_category: this.props.data.retailer.loan_category,
            messager_profile: this.props.data ? this.props.data.retailer.logo : require("../assets/images/test-images/profile.png"),
          }})
        }}
      >
        {/* <Icon name="bell" size={20} color={datosBlack} /> */}
        <Image
          source={{ uri: this.props.data.retailer.logo ? this.props.data.retailer.logo : require('../assets/images/test-images/profile.png') }}
          style={{ width: 50, height: 50, resizeMode: 'cover', borderRadius: 25 }}
        />
        <View style={styles.notifyBoxContentHolder}>
          {
            this.props.data.title ? 
            <Text style={styles.notifyBoxTitle}>
            {this.props.data.title && this.props.data.title.length > 40 ? `${this.props.data.title.substring(0, 30)}...` : this.props.data.title}
          </Text>
            : null
          }
          
          <Text style={[styles.notifyBoxMessage, {fontSize: !this.props.data.title ? 15 : 10}]}>
            {this.props.data.message.length > 50 ? `${this.props.data.message.substring(0, 40)}...` : this.props.data.message}
          </Text>
        </View>
        <Text style={[styles.notifyBoxMessage, { position: 'absolute', right: 10, bottom: 5 }]}>{moment(this.props.data.createdAt).format("MMM DD, yyyy")}</Text>
      </TouchableOpacity>
    );
  }
}

interface cardFormBoxProp {
  label: string,
  onPress: any
}

class CardFormBox extends React.Component<cardFormBoxProp> {
  render() {
    return (
      <View style={styles.cardBox}>
        <View style={styles.cardBoxIconContainer}>
          <Image
            source={
              this.props.label == "Personal Information" ? require(`../assets/png_icons/user-1.png`)
                : this.props.label == "Family Background" ? require(`../assets/png_icons/family-1.png`)
                  : this.props.label == "Financial Status" ? require(`../assets/png_icons/philippine-peso-1.png`)
                    : this.props.label == "Requirements" ? require(`../assets/png_icons/document-1.png`)
                      : null
            }
            style={styles.cardBoxIcon}
          />
        </View>
        <Text style={globalStyle.commonText}>{this.props.label}</Text>
        <TouchableOpacity style={styles.cardBoxBtn} onPress={this.props.onPress}>
          <Text style={[globalStyle.commonText, { color: '#fff', fontSize: 12 }]}>Edit</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 20,
    resizeMode: 'contain',
  },
  formIcons: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 10,
    width: 60,
    height: 60,
    marginBottom: 5,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 8
  },
  home_icons: {
    resizeMode: 'contain',
    width: 35,
    height: 35
  },
  iconHolder: {
    padding: 5,
    width: 50,
    borderRadius: 25,
    marginBottom: 15,
    borderWidth: 10,
  },
  cardName: {
    fontSize: 7,
    color: datosBlack,
    fontFamily: 'CalibriBold'
  },
  confirmCard: {
    padding: 15,
    marginBottom: 20,
    resizeMode: 'cover',
  },
  cardLabel: {
    fontFamily: 'CalibriBold',
    fontSize: 17,
    color: '#fff',
    flexWrap: 'wrap'
  },
  //home screen no user
  welcomeText: {
    fontSize: 20,
    color: '#000',
    fontFamily: 'CalibriBold',
    marginBottom: 15,
    marginLeft: 10,
    textAlign: 'center'
  },
  title: {
    fontSize: 20,
    color: '#000',
    marginBottom: 20,
    fontFamily: 'CalibriBold'
  },
  boxHolder: {
    padding: 20,
    backgroundColor: datosWhiteShade,
    borderRadius: 30
  },
  boxTitle: {
    fontFamily: 'CalibriBold',
    fontSize: 18,
    color: datosBlack,
  },
  cardHolder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  submitHolder: {
    marginVertical: 20,
  },
  termsBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#eff1fe',
    marginBottom: 10,
    borderRadius: 6,
    borderColor: '#e71409',
    borderWidth: 0.5,
  },

  tabHeaderHolder: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 0.5,
    borderBottomColor: datosDarkGray,
  },
  tabHeader: {
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    fontFamily: 'CalibriBold',
    fontSize: 17,
  },
  notificationBox: {
    height: 60,
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: datosWhiteShade,
    borderRadius: 6,
    marginBottom: 5,
    alignItems: 'center',
    flexDirection: 'row',
    marginHorizontal: 20,
    borderWidth: 0.2,
    borderColor: datosDarkGray
  },
  notifyBoxContentHolder: {
    marginLeft: 20
  },
  notifyBoxTitle: {
    color: datosOrange,
    fontFamily: "CalibriRegular",
    fontSize: 12,
    marginBottom: 2
  },
  notifyBoxMessage: {
    color: datosBlack,
    fontFamily: "CalibriRegular",
    fontSize: 10
  },
  headerSubTitle: {
    fontFamily: 'CalibriBold',
    fontSize: 10,
    color: '#fff'
  },

  verticalLine: {
    backgroundColor: datosLightOrange,
    width: 3,
    height: '78%',
    position: 'absolute',
    left: 14,
  },
  itemWrap: {
    height: 100,
    flexDirection: 'row',
  },
  pointWrap: {
    backgroundColor: 'black',
    height: 20,
    width: 20,
    marginLeft: 5,
    alignItems: 'center',
  },
  firstPoint: {
    backgroundColor: datosLightOrange,
    borderRadius: 6,
    height: 12,
    width: 12,
    marginLeft: 10,
  },
  statusText: {
    fontFamily: "CalibriRegular",
    fontSize: 15,
    marginTop: 5
  },
  info: {
    marginTop: 10,
    padding: 20,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  infoText: {
    fontSize: 12,
    width: '83%',
    color: datosLightGray
  },
  notificationContainer: {
    marginTop: 20,
  },
  trackerDate: {
    fontSize: 10,
    color: datosLightOrange,
    fontStyle: 'italic',
  },
  cardBox: {
    padding: 10,
    backgroundColor: '#F1F1F1',
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  cardBoxIconContainer: {
    backgroundColor: '#D9D9D9',
    borderRadius: 6,
    padding: 10
  },
  cardBoxIcon: {
    resizeMode: 'cover',
    width: 30,
    height: 30,
  },
  cardBoxBtn: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    backgroundColor: datosOrange,
    borderRadius: 6
  },
  endLine: {
    height: 2,
    width: '100%',
    borderBottomWidth: 0.2,
    borderColor: datosLightGray
  },
  endMessage: {
    alignSelf: 'center',
    fontFamily: 'CalibriRegular',
    fontSize: 10,
    color: datosLightGray,
    position: 'absolute',
    top: -7,
    backgroundColor: '#eee',
    paddingHorizontal: 10
  },
  listOfRetailersRecipientsWrapper: {
  },
  listOfRetailersRecipients: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomColor: '#eee',
    borderBottomWidth: 1
  },
  retailerRecipeintLogo: {
    resizeMode: 'contain',
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 20
  },
  messageComposerMessageHolder: {
    borderWidth: 1,
    borderRadius: 4,
    borderColor: datosLightOrange,
    padding: 10,
    textAlignVertical: 'top'
  },
  composerMessageSendBtn: {
    backgroundColor: datosLightOrange,
    paddingVertical: 10,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4
  },
  errorText: {
    fontSize: 12,
    color: datosRed
  }
})

export {
  InformationCard,
  ConfirmDetailsCard,
  NoUserHomeScreen,
  AppTrackerCard,
  TermsCard,
  TwoTab,
  NotifyBox,
  EaMessageBox,
  CardFormBox
}