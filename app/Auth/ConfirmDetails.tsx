import * as React from "react";
import {
  StyleSheet,
  Button,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Modal,
  Text,
  View,
  ScrollView
} from "react-native";
import Constants from "expo-constants";
// import { ScrollView } from "react-native-gesture-handler";
// import Modal from "react-native-modal";
import modalStyle from "../../components/Modal";
import { globalStyle } from "../../assets/styles/globalStyle";
import { CancelBtn, BackBtn, NextBtn, SaveBtn } from "../../components/Buttons";
import { ConfirmDetailsCard } from "../../components/cards";
import { Checkbox } from "react-native-paper";
import { router } from "expo-router";

export default class AccountInformation extends React.Component<any> {
  constructor(public props: any) {
    super(props);
  }
  state: any = {
    saveInfoVisible: true,
  };

  setAndNavigate = () => {
    this.setState({
      saveInfoVisible: false,
    });
    router.push("Home");
  };

  render() {
    const { values, back, navigation, jumpStep, confirmDetails } = this.props;
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.wrapper}>
              <View
                style={{ alignItems: "flex-start", padding: 10, marginTop: 10 }}
              >
                <Text style={globalStyle.title}>Confirm Details</Text>
              </View>

              <View style={styles.inputHolder}>
                <ConfirmDetailsCard
                  label="Personal Information"
                  onPress={() => jumpStep(1)}
                  backgroundSource="red"
                  icon="user"
                  iconBgColor="#1E3884"
                />
                {values.social_id && values.social_id != "" ? (
                  <Text></Text>
                ) : (
                  <ConfirmDetailsCard
                    label="Account Information"
                    onPress={() => jumpStep(2)}
                    backgroundSource="yellow"
                    icon="lock"
                    iconBgColor="black"
                  />
                )}

                <ConfirmDetailsCard
                  label="Personal ID and Profile Picture"
                  onPress={() => jumpStep(3)}
                  backgroundSource="blue"
                  icon="image"
                  iconBgColor="#e71409"
                />
              </View>

              <View style={globalStyle.buttonHolder}>
                <BackBtn onPress={() => back()} />
                <View style={globalStyle.horizontalSpacer}></View>
                <SaveBtn disable={false} onPress={() => confirmDetails()} />
              </View>
            </View>
          </TouchableWithoutFeedback>
          <Modal
            visible={values.loadingModal}
            animationType="slide"
            transparent={true}
          >
            <View style={modalStyle.modalContent}>
              <ActivityIndicator
                size="large"
                color="#1C3789"
                animating={values.loadingModal}
              />
              <Text style={{ color: "#555555", fontSize: 15, marginLeft: 10 }}>
                Processing please wait...
              </Text>
            </View>
          </Modal>

          {/* <Modal
            visible={this.state.saveInfoVisible}
            animationType="slide"
            transparent={true}
            >
            <View style={styles.centeredView}>  
              <View style={styles.modalView}>
                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                  <Image source={values.profile ? {uri: values.profile} :require("../../assets/images/test-images/profile.png")}
                  style={styles.profile}
                />
                </View>
                <View>
                  <Text style={styles.commonText}>{values.firstName} {values.lastName}</Text>
                </View>
                <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                    <Text style={{padding: 10, fontFamily: 'OpenSansRegular', fontSize: 15}}>Save Login Info?</Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                  <CancelBtn 
                    onPress={() => {
                      
                    }}
                  />
                  <View style={{width: 10}}></View>
                  <SaveBtn 
                    onPress={() => {
                      this.setAndNavigate()
                    }}
                  />
                </View>
                <TouchableOpacity style={styles.closeModal} onPress={() => {
                  this.setAndNavigate()
                }}>
                  <Text style={{fontSize: 30, color: '#e71409'}}>&times;</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal> */}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  wrapper: {
    flex: 1,
    padding: 40,
  },
  inputHolder: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  logoContaner: {
    justifyContent: "center",
    alignItems: "center",
    height: 150,
  },

  //modal styles
  commonText: {
    padding: 10,
    fontFamily: "OpenSansRegular",
    fontSize: 15,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0, 0.3)",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 6,
    padding: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: "80%",
    height: "40%",
    justifyContent: "center",
    alignItems: "center",
  },
  profile: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  closeModal: {
    position: "absolute",
    top: 5,
    right: 10,
  },
  eachUser: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    flexDirection: "row",
    width: "100%",
  },
  switchProfileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 20,
  },
});
