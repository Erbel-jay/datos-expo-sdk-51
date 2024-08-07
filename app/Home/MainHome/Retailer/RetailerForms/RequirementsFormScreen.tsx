import * as React from "react";
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Text,
  View
} from "react-native";
import { globalStyle } from "../../../../../assets/styles/globalStyle";
import { RequirementsImagePicker } from "../../../../../components/Inputs";
import { CancelBtn, BackBtn, NextBtn, SaveBtn } from "../../../../../components/Buttons";
import * as ImagePicker from "expo-image-picker";
import Config from "../../../../../constants/Config";
import axios from "axios";
import modalStyle from "../../../../../components/Modal";
import Icon from '@expo/vector-icons/build/MaterialCommunityIcons';
const { getHeader } = require("../../../../../helpers/global-function");
const { _storeData, _retrieveData } = require("../../../../../helpers/global-function");
import { router, Link, useLocalSearchParams } from 'expo-router';

const RequirementsFormScreen = () => {
  let localSearchParams = useLocalSearchParams()
  return <RequirementsFormScreenComponent 
    localSearchParams={localSearchParams}
  />
}

export default RequirementsFormScreen

class RequirementsFormScreenComponent extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  state: any = {
    loadingModal: false,
    loadingProgress: 0,
    requirements: null,
    current_user_object_id: '',

    isLoaded: false,
    sLoanSubmitted: false,

    isChooseTypeShow: false,
    process: null,
    chooseTypeIndex: null,

    productDetails: null,
    soc: null,

    requiredFields: null,
    isMissing: true,
    userData: null,

    retailer: {},
    loanRequirements: null
  }

  async componentDidMount() {
    if (this.props.localSearchParams !== undefined) {
      let params = this.props.localSearchParams
      console.log('retailer: ', params.name);
      console.log('retailer_id: ', params._id);
      this.setState({ retailer: params })
    }
    let current_user_data: any = await _retrieveData('current_user');
    let current_user = JSON.parse(current_user_data);
    if (current_user) {
      this.setState({
        current_user_object_id: current_user._id
      }, () => {
        console.log("current_user._id", current_user._id);
        this.getUserData()
      })
    }
  }

  getLoanSubmitStatus = (currentOngoingLoans: any, retailer_id: any) => {
    for(let i = 0; i < currentOngoingLoans.length; i++){
      if(currentOngoingLoans[i].retailer == retailer_id){
        console.log('');
        this.setState({
          loanRequirements: currentOngoingLoans[i]
        })
        return currentOngoingLoans[i].isLoanSubmitted
      }
    }
  }

  getUserData = async () => {
    let res = await axios.get(Config.api + `/user/getUser/${this.state.current_user_object_id}`)
      .then(res => {
        this.setState({
          userData: res.data.result,
          isLoanSubmitted: this.getLoanSubmitStatus(res.data.result.currentOngoingLoan, this.state.retailer._id)
        }, () => {
          console.log('isLoanSubmitted', this.state.isLoanSubmitted);
          this.getProductDetails()
        })
      })
  }

  checkingMissingFields = () => {
    var f;
    var found = this.state.requiredFields.some(function (item: any, index: number) { f = index; return (item.value !== "" && item.value !== null); });
    console.log("found--->", found);
    if (!found) {
      console.log("DIDNT FIND ANY UPLOAD");
      return true;
    } else {
      console.log("FOUND AN UPLOAD");
      return false
    }

  }

  getProductDetails = async () => {
    axios.get(Config.api + `/product/getProduct/${this.state.userData.product?._id}`)
      .then(res => {
        if (res.data.result == null) {
          // this.getRequirementsData()
        } else {
          let data = res.data.result
          this.setState({ productDetails: data.retailer }, () => {
            this.getFinancialStatus()
          })
        }
      })
      .catch(err => {
        console.log("ERROR:", err);
      })
  }

  getFinancialStatus = () => {
    axios.get(Config.api + `/financialStatus/getFinancialStatus/${this.state.userData.financial?._id}`)
      .then(res => {
        if (res.data.result == null) {
          this.getRequirementsData()
        } else {
          let data = res.data.result
          // this.setState({ soc: data.soc }, () => {
          //   if (this.state.productDetails !== undefined) {
          //     this.setState({
          //       requiredFields: this.state.soc == "Employed" ? this.state.productDetails.fields : this.state.productDetails.selfEmployedFields
          //     }, () => {
          //     })
          //   }
          //   this.getRequirementsData()
          // })
        }
      })
      .catch(err => {
        console.log("ERROR:", err);
      })
  }

  

  getRequirementsData = async () => {
    console.log('loanRequirements.requirements', this.state.loanRequirements._id);
    axios.get(Config.api + `/dynamicRequirements/requirements/${this.state.loanRequirements.requirements}`)
      .then((res: any) => {
        // console.log('Requirements', res.data.result);
        this.setState({
          isLoaded: true
        })
        if (res.data.result !== null) {
          let data = res.data.result;

          if (data.data !== undefined) {
            for (let i = 0; i < data.data.length; i++) {
              let objIndex = this.state.requiredFields.findIndex(((obj: any) => obj.name == data.data[i].name));
              let requiredFields = [...this.state.requiredFields];
              requiredFields[objIndex] = { ...requiredFields[objIndex], value: data.data[i].value };
              this.setState({ requiredFields });
            }
          }
          this.setState({
            requirements: data,
          })
        }
      })
      .catch(err => {
        console.log("ERROR:", err);
      })

  }

  selectPhoto = async (index: number) => {
    await this.getMediaLibraryPermissionAsync();
    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.2,
      // type: "jpeg",
    });
    if (!pickerResult.canceled) {
      let requiredFields = [...this.state.requiredFields];
      requiredFields[index] = { ...requiredFields[index], value: pickerResult.assets[0].uri };
      this.setState({ requiredFields });
    }
  };

  takePhoto = async (index: number) => {
    await this.getCameraRollPermissionAsync()
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.2,
      // type: "jpeg",
    });
    if (!result.canceled) {
      let requiredFields = [...this.state.requiredFields];
      requiredFields[index] = { ...requiredFields[index], value: result.assets[0].uri };
      this.setState({ requiredFields });
    }
  };

  pickImage = async (type: string, index: number) => {
    try {
      let result;
      if (type == "camera") {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Videos,
          allowsEditing: true,
          quality: 0.2,
          // aspect: [16, 9],
        });
        if (!result.canceled) {
          let requiredFields = [...this.state.requiredFields];
          requiredFields[index] = { ...requiredFields[index], value: result.assets[0].uri };
          this.setState({ requiredFields });
        }
      }

      if (type == "gallery") {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Videos,
          allowsEditing: true,
          quality: 0.2,
          aspect: [16, 9],
        });
        if (!result.canceled) {
          let requiredFields = [...this.state.requiredFields];
          requiredFields[index] = { ...requiredFields[index], value: result.assets[0].uri};
          this.setState({ requiredFields });
        }
      }

    } catch (err) {
      console.error(err);
    }
  }

  onPressRemovePhoto = (index: number) => {
    let requiredFields = [...this.state.requiredFields];
    requiredFields[index] = { ...requiredFields[index], value: "" };
    this.setState({ requiredFields });
  };

  getMediaLibraryPermissionAsync = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    console.log("STATUS", status);
    if (status !== "granted") {
      alert("Sorry, we need media library permissions to make this work!");
      // alert(`Permission Status: ${status}`);
    }
  };

  getCameraRollPermissionAsync = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    console.log("STATUS", status);
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      // alert(`Permission Status: ${status}`);
    }
  };

  chooseType = (process: string, index: number) => {
    this.setState({
      isChooseTypeShow: true,
      process: process,
      chooseTypeIndex: index
    })
  }

  processIncubement = (type: string) => {
    if (this.state.process == "gallery") {
      if (type == "image") {
        this.selectPhoto(this.state.chooseTypeIndex)
        this.setState({
          isChooseTypeShow: false,
          process: null
        })
      }

      if (type == "video") {
        this.pickImage(this.state.process, this.state.chooseTypeIndex);
        this.setState({
          isChooseTypeShow: false,
          process: null
        })
      }
    }

    if (this.state.process == "camera") {
      if (type == "image") {
        this.takePhoto(this.state.chooseTypeIndex)
        this.setState({
          isChooseTypeShow: false,
          process: null
        })
      }

      if (type == "video") {
        this.pickImage(this.state.process, this.state.chooseTypeIndex);
        this.setState({
          isChooseTypeShow: false,
          process: null
        })
      }
    }
  }

  alert = (title: string, message: string) => {
    Alert.alert(
      title,
      message,
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => router.push({pathname: "Home/MainHome/Retailer/RetailerForms/FormsHomeScreen", params: this.state.retailer}),
        },
      ],
      { cancelable: false }
    );
  };

  submitForm = async () => {
    try {
      this.setState({
        loadingModal: true,
      });

      let formData = new FormData();
      let state = this.state;



      for (let i = 0; i < state.requiredFields.length; i++) {
        if (state.requiredFields[i].value !== "" && state.requiredFields[i].value !== null && state.requiredFields[i].value.search('https') == -1) {
          let img: any = {
            name: `-${state.requiredFields[i].name}` + ".jpg",
            uri: state.requiredFields[i].value,
            type: "image/jpeg",
          };
          formData.append(`${state.requiredFields[i].name}`, img);
        }
      }

      formData.append("data", JSON.stringify(state.requiredFields));
      formData.append("retailer_id", this.state.retailer._id)
      this.setState({
        loadingProgress: '',
      });
      let save: boolean = true;
      let url = `/dynamicRequirements/save-requirements/${this.state.current_user_object_id}`;
      if (state.requirements && state.requirements != null) {
        url = `/dynamicRequirements/update-requirements/` + this.state.requirements._id + `/${this.state.current_user_object_id}`;
        save = false;
      }
      axios.post(Config.api + url, formData)
        .then((res) => {
          if (res.data.result) {
            let result = res.data.result;
            console.log('result', result);
            this.setState({loadingModal: false})
            if (save) {
              this.alert("Info", "Requirements Added Successfully!");
            } else {
              this.alert("Info", "Requirements Updated Successfully!");
            }
          }
        })
        .catch(err => {
          console.log("error", err)
        })
    } catch (err) {
      console.log("submit error", err);
    }
  };

  render() {
    const { loadingModal, loadingProgress } = this.state;
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={globalStyle.container}
      >
        {
          this.state.productDetails == null || this.state.soc == null
            ?
            <View style={[globalStyle.wrapper, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={[globalStyle.commonText, {marginBottom: 20}]}>Please Fill up Financial Status Form first.</Text>
              <BackBtn onPress={() => router.back()} />
            </View>
            :
            <View style={this.state.isLoaded == false ? { flex: 1, justifyContent: 'center', alignItems: 'center' } : null}>
              {this.state.isLoaded == false ?
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#70788c" />
                  <Text style={globalStyle.commonText}>Loading Data...</Text>
                </View>
                :
                <ScrollView>
                  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={globalStyle.wrapper}>

                      {/* <Text style={{ color: 'red' }}>(REMINDER:</Text>
                      <Text style={{ color: 'red' }}>HEY UPDATE LOAN REQUIREMNTS IF YOU SUBMIT ME)</Text> */}

                      <Text style={globalStyle.title}>Requirements</Text>
                      {
                        this.state.sLoanSubmitted == true ?
                          <Text style={globalStyle.commonText}>All Informations has been submitted editing is not allowed.</Text>
                          : null
                      }
                      {
                        this.state.requiredFields.map((field: any, i: number) => {
                          return <View style={globalStyle.inputHolder} key={i}>
                            {
                              field.type == "image" ?
                                <RequirementsImagePicker
                                  onPressTakePhoto={() => this.takePhoto(i)}
                                  onPressUploadPhoto={() => this.selectPhoto(i)}
                                  exist={field.value == null || field.value == "" ? false : true}
                                  photoUri={field.value}
                                  onPressRemovePhoto={() =>
                                    this.onPressRemovePhoto(i)
                                  }
                                  label={field.name}
                                  disable={this.state.sLoanSubmitted}
                                />
                                :
                                <RequirementsImagePicker
                                  onPressTakePhoto={() => this.chooseType('camera', i)}
                                  onPressUploadPhoto={() => this.chooseType('gallery', i)}
                                  exist={field.value == null || field.value == "" ? false : true}
                                  photoUri={field.value}
                                  onPressRemovePhoto={() =>
                                    this.onPressRemovePhoto(i)
                                  }
                                  label={field.name}
                                  disable={this.state.sLoanSubmitted}
                                />
                            }
                          </View>
                        })
                      }
                      <View style={globalStyle.buttonHolder}>
                        <BackBtn
                          onPress={() => this.state.step == 2 ? this.setState({ step: 1 }) : router.back()}
                        />
                        <View style={globalStyle.horizontalSpacer}></View>
                        <SaveBtn
                          onPress={() => this.submitForm()}
                          disable={this.checkingMissingFields()}
                        />
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                  <Modal
                    visible={loadingModal}
                    animationType="slide"
                    transparent={true}
                  >
                    <View style={modalStyle.modalContent}>
                      <ActivityIndicator
                        size="large"
                        color="#1C3789"
                        animating={loadingModal}
                      />
                      <Text style={{ color: "#555555", fontSize: 15, marginLeft: 10 }}>
                        Processing please wait...
                      </Text>
                    </View>
                  </Modal>

                  <Modal
                    visible={this.state.isChooseTypeShow}
                    animationType="slide"
                    transparent={true}
                  >
                    <View style={styles.modalContent}>
                      <View style={{ backgroundColor: 'white', borderRadius: 6, padding: 20 }}>
                        <Text style={globalStyle.commonText}>Choose a type</Text>
                        <View style={styles.ImagePickerIconHolder}>
                          <TouchableOpacity style={styles.eachIconHolder} onPress={() => this.processIncubement('image')}
                          >
                            <Icon
                              name="image"
                              color="#e71409"
                              size={30}
                            />
                            <Text style={styles.IconLabel}>Image</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.eachIconHolder} onPress={() => this.processIncubement('video')}
                          >
                            <Icon
                              name="video"
                              color="#e71409"
                              size={30}
                            />
                            <Text style={styles.IconLabel}>Video</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </Modal>
                </ScrollView>

              }
            </View>
        }


      </KeyboardAvoidingView>
    );
  }

}

const styles = StyleSheet.create({
  ImagePickerIconHolder: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  eachIconHolder: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20
  },
  IconLabel: {
    fontSize: 14,
    color: '#000',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0, 0.3)',
  }
})