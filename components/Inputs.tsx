import * as React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Platform } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { Entypo, Feather, AntDesign, Ionicons } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Icon from '@expo/vector-icons/build/MaterialCommunityIcons';
import { TextInputMask } from "react-native-masked-text";
import { Video } from 'expo-av';
import { datosBlack, datosOrange } from '../assets/styles/colorUsed';

interface BaseInputProps {
    children?: any;
    label?: string
}

class BaseInput extends React.Component<BaseInputProps> {
  render(){
    return(
      <View style={styles.baseInput}>
        {this.props.children}
      </View>
    );
  }
}

interface AppInputProps {
    value: any;
    onChange: any;
    label?: string
    placeholder: string
    editable?: boolean,
    secure?: boolean,
    autoCapitalize?: any,
    multiline?: boolean,
    numberOfLines?: number,
    height?: number
    maxLength?: number,
    toggleSecure?: any,
    password?: boolean,
    keyboardType?: any,
    optional?: boolean,

    pattern?: any,
    onValidation?: any,
    valid?: any,
}

class AppInput extends React.Component<AppInputProps> {
  handleValidation(value: any) {
    const { pattern } = this.props;
    if (!pattern) return true;
    // string pattern, one validation rule
    if (typeof pattern === 'string') {
      const condition = new RegExp(pattern, 'g');
      return condition.test(value);
    }
    // array patterns, multiple validation rules
    if (typeof pattern === 'object') {
      const conditions = pattern.map((rule: any) => new RegExp(rule, 'g'));
      return conditions.map((condition: any) => condition.test(value));
    }
  }

  onChange(value: any) {
    const { onChange, onValidation } = this.props;
    const isValid = this.handleValidation(value);
    onValidation && onValidation(isValid);
    onChange && onChange(value);
  }

  render(){
    return(
      <BaseInput label={this.props.label}>
        <TextInput placeholder={this.props.placeholder}
          value={this.props.value}
          onChangeText={this.props.label == "Password" || this.props.label == "Email" ? value => this.onChange(value) :this.props.onChange}
          style={
            this.props.editable == false ?
            [styles.input, {height: this.props.height, borderWidth: 1, borderColor: '#70788c'}]
            :
            this.props.value == null ||
            this.props.value == "" &&
            !this.props.optional ||
            this.props.optional == false ?
            [styles.input, {height: this.props.height}] :
            this.props.value == null ||
            this.props.value == ""
            ?
            [styles.input, {height: this.props.height}]
            :
            [styles.input, {height: this.props.height}]}
          placeholderTextColor="#000"
          secureTextEntry={this.props.secure}
          autoCapitalize={this.props.autoCapitalize}
          multiline={this.props.multiline}
          numberOfLines={this.props.numberOfLines}
          maxLength={this.props.maxLength}
          keyboardType={this.props.keyboardType}
          editable={this.props.editable}
        />
        {
          this.props.value == null ||
          this.props.value == "" &&
          !this.props.optional  ?
          <Text style={[styles.commonText, {color: '#da5e5a', fontSize: 12, marginLeft: 10}]}>{this.props.label} is required!</Text>
          : null
        }

        {
          this.props.label == "Password" 
          ?
          <View>
            <Text style={[styles.commonText, { color: this.props.valid && this.props.valid[0] ? '#f3b104' : '#da5e5a', fontSize: 12, marginLeft: 10 }]}>
              Rule 1: Alteast 6 characters
            </Text>
            <Text style={[styles.commonText, { color: this.props.valid && this.props.valid[1] ? '#f3b104' : '#da5e5a', fontSize: 12, marginLeft: 10 }]}>
              Rule 2: Number is required
            </Text>
            <Text style={[styles.commonText, { color: this.props.valid && this.props.valid[2] ? '#f3b104' : '#da5e5a', fontSize: 12, marginLeft: 10 }]}>
              Rule 3: Uppercase letter
            </Text>
            <Text style={[styles.commonText, { color: this.props.valid && this.props.valid[3] ? '#f3b104' : '#da5e5a', fontSize: 12, marginLeft: 10 }]}>
              Rule 4: Special characters
            </Text>
          </View>
          : 
          this.props.label == "Email" 
          ?
          <View>
            <Text style={[styles.commonText, { color: this.props.valid && this.props.valid[0] ? '#f3b104' : '#da5e5a', fontSize: 12, marginLeft: 10 }]}>
              Please Input Valid Email
            </Text>
          </View>
          :
          null
        }

        {this.props.password == true ? 
         <TouchableOpacity
            style={{position: 'absolute',right: 10,top: this.props.label == 'Password' ? 10 : 10, bottom: '50%', height: 50, elevation: 5}}
            onPress={this.props.toggleSecure}
            activeOpacity={0.6}
          >
            <Feather name={this.props.secure == true ? "eye" : "eye-off"} size={20} color="#000"/>
        </TouchableOpacity>
         : 
         null
         }
       
      </BaseInput>
    );
  }
}

interface AppInputVerifyProps {
  value: any;
  onChange: any;
  label?: string
  placeholder: string
  autoCapitalize?: any,
  height?: number
  maxLength?: number,
  keyboardType?: any,
  verify? : boolean, 
  sendCode : any,
  timer: any,
  isSendClicked: boolean,
  emailVerified: any,
  verifyCode?: any,
  isCodeVerified?: boolean
}

class AppInputVerification extends React.Component<AppInputVerifyProps> {
render(){
  return(
    <BaseInput label={this.props.label}>
      <TextInput placeholder={this.props.placeholder}
        value={this.props.value}
        onChangeText={this.props.onChange}
        style={[styles.input, {height: this.props.height, borderWidth: 1, borderColor: this.props.value == "" || this.props.value == null ? '#da5e5a' : '#f3b104'}]}
        placeholderTextColor="#000"
        autoCapitalize={this.props.autoCapitalize}
        maxLength={this.props.maxLength}
        keyboardType={this.props.keyboardType}
        editable={this.props.isCodeVerified == false ? true : false}
      />
      {this.props.value == "" || this.props.value == null ? 
       <TouchableOpacity
          style={{position: 'absolute',right: 15,top: 10, height: 50, elevation: 5}}
          onPress={this.props.sendCode}
          activeOpacity={0.6}
          disabled={this.props.isSendClicked == true || ( !this.props.emailVerified || this.props.emailVerified[0] == false) ? true : false}
        >
          <Text style={this.props.isSendClicked == true || ( !this.props.emailVerified || this.props.emailVerified[0] == false) ? [styles.commonText, {color: '#70788c'}] :[styles.commonText, {color: '#da5e5a'}]}>{this.props.isSendClicked == true ? `Send Again(${this.props.timer})` : 'Send Code'}</Text>
      </TouchableOpacity>
       : 
       this.props.isCodeVerified == false
       ?
        <TouchableOpacity
            style={{position: 'absolute',right: 15,top: 10, height: 50, elevation: 5}}
            onPress={this.props.verifyCode}
            activeOpacity={0.6}
          >
            <Text style={[styles.commonText, {color: '#000'}]}>Verify</Text>
        </TouchableOpacity>
        :
        null
       }

       {
         this.props.isCodeVerified == true ?
          <TouchableOpacity
            style={{position: 'absolute',right: 15,top: '30%', bottom: '50%', height: 50, elevation: 5}}
            onPress={this.props.sendCode}
            activeOpacity={0.6}
            disabled={true}
          >
            <Icon 
              name="check"
              color="#00E284"
              size={30}
            />
          </TouchableOpacity>
        :
          null
       }

       {
        this.props.value == null ||
        this.props.value == ""
        ?
        <Text style={[styles.commonText, {color: '#da5e5a', fontSize: 12, marginLeft: 10}]}>{this.props.label} is required!</Text>
        : null
       }
       {
         this.props.value == null ||
         this.props.value == "" ?
         null
         :
         this.props.isCodeVerified == false ?
          <Text style={[styles.commonText, {color: '#da5e5a', fontSize: 12, marginLeft: 10}]}>Please verify the code!</Text>
        :
        null
       }
     
    </BaseInput>
  );
}
}

interface AppInputMaskProps {
  returnKeyType: any,
  type: any,
  options: any,
  value: any,
  maxLength: any,
  onChangeText: any,
  placeholder: any,
  label: any,
  keyboardType?: any,
  optional?: boolean
  editable?: boolean,
  onBlur?: any
}

class AppInputMask extends React.Component<AppInputMaskProps> {
  render(){
    return(
      <BaseInput label={this.props.label}>
        <View style={
          this.props.editable == false?
          [styles.input, {borderWidth: 1, borderColor: '#70778c'}]
          :
          this.props.value == null ||
          this.props.value == "" &&
          !this.props.optional ||
          this.props.optional == false ?
          [styles.input]
          :
          [styles.input]
        }>
        <TextInputMask
          returnKeyType={this.props.returnKeyType}
          type={this.props.type}
          options={this.props.options}
          value={this.props.value}
          maxLength={this.props.maxLength}
          onChangeText={this.props.onChangeText}
          placeholder={this.props.placeholder}
          keyboardType={this.props.keyboardType}
          placeholderTextColor="black"
          editable={this.props.editable}
          onBlur={this.props.onBlur}
        />
        </View>
        {
          this.props.value == null ||
          this.props.value == "" &&
          !this.props.optional ||
          this.props.optional == false ?
          <Text style={[styles.commonText, {color: '#da5e5a', fontSize: 12, marginLeft: 10}]}>{this.props.label} is required!</Text>
          : null
        }
      </BaseInput>
    );
  }
}




interface AppSelectProps {
    value: any;
    onChange: any;
    items: any;
    placeholder: string,
    optional?: boolean,
    label?: string,
    disable?: boolean
}

class AppSelect extends React.Component<AppSelectProps>{
  render(){
    return(
      <BaseInput>
        <View style={
          this.props.disable == true ?
          [styles.selectHolder, {borderColor: '#70788c'}]
          :
          this.props.value == null ||
          this.props.value == "" &&
          !this.props.optional ||
          this.props.optional == false ?
          [styles.selectHolder] 
          : 
            this.props.optional == true &&
            this.props.value == "" || 
            this.props.value == null
          ?
            [styles.selectHolder, ]  
          : 
            [styles.selectHolder, ]
        }>
          <RNPickerSelect
            placeholder={{
              label: this.props.placeholder,
              value: null,
            }}
            disabled={this.props.disable}
            value={this.props.value}
            onValueChange={this.props.onChange}
            items={this.props.items}
            style={{ 
              inputAndroid: {
                color: 'black', 
                fontFamily: 'CalibriRegular',
                fontSize: 15,
                padding: 5,
                paddingLeft: 10
              }, 
              placeholder: {color: 'black'}, 
              inputIOS: {
                padding: 10,
              }
            }}
            useNativeAndroidPickerStyle={false}
            // pickerProps={{
            //   style: { 
            //     fontFamily: 'CalibriRegular',
            //     fontSize: 15,
            //     backgroundColor: '#fff',
            //     borderRadius: 18,
            //     margin: -6,
            //     marginLeft: 5,
            //   }
            // }}
          />

        </View>
        {
          this.props.value == null ||
          this.props.value == "" &&
          !this.props.optional ||
          this.props.optional == false ?
          <Text style={[styles.commonText, {color: '#da5e5a', fontSize: 12, marginLeft: 10}]}>{this.props.placeholder.length > 20 ? this.props.label : this.props.placeholder} is required!</Text>
          : null
        }
      </BaseInput>
    );
  }
}





interface DatePickerProp {
  onConfirm?: any
  onCancel?: any
  mode?: any
  isVisible?: boolean,
  showDatePicker?: any

  value?: any
  onChange?: any
  label?: string
  placeholder?: string
  disable?: boolean
  maxLength?: number
  editable?: boolean
}

class DatePickerInput extends React.Component<DatePickerProp>{
  
  render(){
    return(
      <BaseInput>
        <View style={styles.input}>
          <TextInput 
            value={this.props.value}
            onChange={this.props.onChange}
            placeholder={this.props.placeholder}
            maxLength={this.props.maxLength}
            editable={this.props.editable}
          />

          <TouchableOpacity
            style={{position: 'absolute',right: 10, top: 0}}
            onPress={this.props.showDatePicker}
            activeOpacity={0.6}
          >
            <AntDesign name="calendar" size={20} color="#1C3789" />
          </TouchableOpacity>
        </View>
        
        <DateTimePickerModal
          isVisible={this.props.isVisible}
          mode={this.props.mode}
          onConfirm={this.props.onConfirm}
          onCancel={this.props.onCancel}
        />
      </BaseInput>
    );
  }
}

interface AppDateInputMaskProps {
  returnKeyType: any,
  type: any,
  options: any,
  onChangeText: any,
  keyboardType?: any,
  onConfirm?: any
  onCancel?: any
  mode?: any
  isVisible?: boolean,
  showDatePicker?: any
  value?: any
  onChange?: any
  label?: string
  placeholder?: string
  disable?: boolean
  maxLength?: number
  editable?: boolean
  optional?: boolean
}

class DatePickerInputMask extends React.Component<AppDateInputMaskProps>{
  render(){
    return(
      <BaseInput>
        <View style={
          this.props.editable == false ?
          [styles.input, {borderWidth: 1, borderColor: '#70788c'}]
          : 
          this.props.value == null ||
          this.props.value == "" &&
          !this.props.optional ||
          this.props.optional == false ?
          [styles.input] 
          : 
        this.props.optional == true &&
        this.props.value == "" || 
        this.props.value == null
        ?
          styles.input :
          [styles.input] 
          }>

          <TextInputMask
            returnKeyType={this.props.returnKeyType}
            type={this.props.type}
            options={this.props.options}
            value={this.props.value}
            maxLength={this.props.maxLength}
            onChangeText={this.props.onChangeText}
            placeholder={this.props.placeholder}
            keyboardType={this.props.keyboardType}
            placeholderTextColor="black"
            editable={this.props.editable}
          />

          <TouchableOpacity
            style={{position: 'absolute',right: 10, top: 8}}
            onPress={this.props.showDatePicker}
            activeOpacity={0.6}
            disabled={this.props.editable == true ? false : true}
          >
            <AntDesign name="calendar" size={20} color={datosOrange} />
          </TouchableOpacity>
        </View>

        <DateTimePickerModal
          isVisible={this.props.isVisible}
          mode={this.props.mode}
          onConfirm={this.props.onConfirm}
          onCancel={this.props.onCancel}
        />
        {
          this.props.value == null ||
          this.props.value == "" &&
          !this.props.optional ||
          this.props.optional == false ?
          <Text style={[styles.commonText, {color: '#da5e5a', fontSize: 12, marginLeft: 10}]}>{this.props.placeholder} is required!</Text>
          : null
        }
      </BaseInput>
    );
  }
}

interface RequirementsImagePickerProps {
  label?: string;
  value?: any;
  onPressTakePhoto?: any;
  onPressUploadPhoto?: any;
  exist?: any;
  photoUri?: any;
  onPressRemovePhoto?: any;
  disable?: boolean;
}

class RequirementsImagePicker extends React.Component<RequirementsImagePickerProps>{
  render(){
    let props = this.props
    return(
      <View style={{width: '100%', marginBottom: 20}} >
        <Text style={styles.ImagePickerLabel}>{props.label}</Text>
        <View style={[styles.requirmentsImagePicker,{borderColor: this.props.disable == true ? '#70788c' : '#da5e5a'}]}>
          {props.exist == false ? 
            <View style={styles.ImagePickerIconHolder}>
              <TouchableOpacity style={styles.eachIconHolder} onPress={props.onPressTakePhoto}
                disabled={this.props.disable}
              >
                <Icon 
                  name="camera"
                  color="#da5e5a"
                  size={30}
                />
                <Text style={styles.IconLabel}>Capture</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.eachIconHolder} onPress={props.onPressUploadPhoto}
                disabled={this.props.disable}
              >
                <Icon 
                  name="folder"
                  color="#da5e5a"
                  size={30}
                />
                <Text style={styles.IconLabel}>Upload</Text>
              </TouchableOpacity>
            </View>
          :
            <View style={styles.imageHolder}>
              {
                  this.props.photoUri.search('.mp4') == -1 ? 
                  <Image source={{uri: props.photoUri}} style={styles.removePhotoBtn}/>
                  :
                  < Video
                    source={{ uri: props.photoUri }}
                    useNativeControls 
                    style={styles.removePhotoBtn}
                  />
                }
              {this.props.disable == true ? null :
                <TouchableOpacity style={styles.removePhoto} onPress={props.onPressRemovePhoto} >
                  <Icon 
                    name="close"
                    color="red"
                    size={20}
                  />
                </TouchableOpacity>
              }
            </View>
          }
        </View>
      </View>
    );
  }
}


interface QRImagePicker {
  label?: string;
  value?: any;
  onPressUploadPhoto?: any;
  exist?: any;
  photoUri?: any;
  onPressRemovePhoto?: any;
  disable?: boolean;
}

class QRImagePicker extends React.Component<RequirementsImagePickerProps>{
  render(){
    let props = this.props
    return(
      <View style={{width: '100%'}} >
        <View style={[styles.requirmentsImagePicker,{borderColor: this.props.disable == true ? '#70788c' : '#da5e5a', width: 250}]}>
          {props.exist == false ? 
            <View style={styles.ImagePickerIconHolder}>
              <TouchableOpacity style={styles.eachIconHolder} onPress={props.onPressUploadPhoto}
                disabled={this.props.disable}
              >
                <Icon 
                  name="folder"
                  color="#da5e5a"
                  size={30}
                />
                <Text style={styles.IconLabel}>Upload QR Code</Text>
              </TouchableOpacity>
            </View>
          :
            <View style={styles.imageHolder}>
              <Image source={{uri: props.photoUri}} style={styles.removePhotoBtn}/>
              {this.props.disable == true ? null :
                <TouchableOpacity style={styles.removePhoto} onPress={props.onPressRemovePhoto} >
                  <Icon 
                    name="close"
                    color="red"
                    size={20}
                  />
                </TouchableOpacity>
              }
            </View>
          }
        </View>
      </View>
    );
  }
}

interface SearchInputProps {
  value: any;
  onChange: any;
  label?: string
  placeholder: string
}

class SearchInput extends React.Component<SearchInputProps> {
  render(){
    return(
      <BaseInput>
        <TextInput 
          placeholder={this.props.placeholder} 
          value={this.props.value}
          onChangeText={this.props.onChange}
          style={styles.searchInput}
        />
        <Feather 
          name="search" 
          size={20} 
          color="#000" 
          style={{position: 'absolute',left: 15,top: 15, height: 50}}
        />
      </BaseInput>
    )
  }
}





const styles = StyleSheet.create({
  baseInput: {
    width: '100%',
    marginBottom: 10,
  },

  commonText: {
    fontFamily: 'CalibriRegular', fontSize: 15
  },

  input: {
    fontFamily: 'CalibriRegular',
    fontSize: 15,
    paddingVertical: Platform.OS == 'ios' ? 10 : 5, 
    borderRadius: 18, 
    paddingLeft: 15,
    backgroundColor: '#fff',
    marginBottom: 5,
    
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,  
    elevation: 8
  },
  selectHolder: {
    fontFamily: 'CalibriRegular',
    borderRadius: 18, 
    backgroundColor: '#fff',
    marginBottom: 5,
    // overflow: 'hidden',
    
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,  
    elevation: 8
  },
  ImagePickerLabel: {
    fontSize: 15,
    fontFamily: 'CalibriRegular',
    color: datosBlack,
    marginBottom: 10,
    marginLeft: 10
  },
  requirmentsImagePicker: {
    backgroundColor: 'rgba(226, 131, 80, 0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#da5e5a',
    justifyContent: 'center',
    alignItems: 'center',
    height: 200
  },
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
  removePhoto: {
    position: 'absolute',
    top: 5,
    right: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20
  },
  imageHolder: { 
    width: '100%', 
    height: 200, 
    alignItems: 'center', 
    justifyContent: 'center'
  },
  removePhotoBtn: {
    width: '100%', 
    height: 198, 
    borderRadius: 10
  },
  searchInput: {
    borderWidth: 0.5,
    borderColor: '#CDCDCD',
    backgroundColor: "#F5F5F5",
    borderRadius: 60,
    padding: 10,
    paddingLeft: 50
  }
});




export {
  AppInput,
  AppSelect,
  DatePickerInput,
  RequirementsImagePicker,
  AppInputMask,
  DatePickerInputMask,
  AppInputVerification,
  QRImagePicker,
  SearchInput
}