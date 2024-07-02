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
  Text,
  View
} from "react-native";
import { AppInput, AppSelect, DatePickerInput } from "../../../../components/Inputs";
import Constants from "expo-constants";
import { ScrollView } from "react-native-gesture-handler";
import { globalStyle } from "../../../../assets/styles/globalStyle";
import {CancelBtn, BackBtn, NextBtn, SaveBtn} from "../../../../components/Buttons";
import {RequirementsImagePicker} from "../../../../components/Inputs";
import * as ImagePicker from "expo-image-picker";


export default class InsuranceProfileAttachmentFormScreen extends React.Component<any> {
  constructor(public props: any) {
    super(props);
  }
  
  checking = () => {
    const { values } = this.props;
    if (
      values.primaryId == "" ||
      values.primaryType == "" ||
      values.secondaryId == "" ||
      values.secondaryType == ""
    ) {
      return true;
    }else{
      return false;
    }
  };
  render() {
    const {
      values,
      inputChange,
      savePersonalInformation,
      selectPhoto,
      takePhoto,
      onPressRemovePhoto,
      back,
    } = this.props;
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
                <Text style={globalStyle.title}>
                  Personal ID and Profile Picture
                </Text>
              </View>
              <View style={styles.inputHolder}>
              <View style={styles.inputContainer}>
                <RequirementsImagePicker
                  onPressTakePhoto={() => takePhoto('primaryId')}
                  onPressUploadPhoto={() => selectPhoto('primaryId')}
                  exist={values.primaryId !== "" ? true : false}
                  photoUri={values.primaryId}
                  onPressRemovePhoto={() => onPressRemovePhoto('primaryId')}
                  label="Primary ID"
                />
                <AppSelect
                  placeholder="Primary ID type"
                  onChange={inputChange("primaryType")}
                  value={values.primaryType}
                  items={values.primaryOptions}
                />
              </View>
                
              <View style={styles.inputContainer}>
                <RequirementsImagePicker
                  onPressTakePhoto={() => takePhoto('secondaryId')}
                  onPressUploadPhoto={() => selectPhoto('secondaryId')}
                  exist={values.secondaryId !== "" ? true : false}
                  photoUri={values.secondaryId}
                  onPressRemovePhoto={() => onPressRemovePhoto('secondaryId')}
                  label="Secondary ID"
                />
                <AppSelect
                  placeholder="Secondary ID type"
                  onChange={inputChange("secondaryType")}
                  value={values.secondaryType}
                  items={values.secondaryOptions}
                />
                </View>
                <RequirementsImagePicker
                  onPressTakePhoto={() => takePhoto('profile')}
                  onPressUploadPhoto={() => selectPhoto('profile')}
                  exist={values.profile !== "" ? true : false}
                  photoUri={values.profile}
                  onPressRemovePhoto={() => onPressRemovePhoto('profile')}
                  label="Profile"
                />

              </View>

                <View style={globalStyle.buttonHolder}>
                  <BackBtn onPress={() => back()}/>
                    <View style={globalStyle.horizontalSpacer}></View>
                    <SaveBtn disable={this.checking()} onPress={() => savePersonalInformation()}/>
                    
                </View>
            </View>
          </TouchableWithoutFeedback>
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
  inputContainer: {
    marginBottom: 20,
    width: '100%'
  }
});
