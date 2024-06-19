// import {AsyncStorage} from "@react-native-community/async-storage";
import AsyncStorage from '@react-native-async-storage/async-storage';
// import {AsyncStorage} from 'react-native'


export async function getHeader() {
  return new Promise(async (resolve, reject) => {
    let token = await _retrieveData("token");
    resolve({ headers: { auth: JSON.parse(token) } });
  });
}

export async function getCurrentUser() {
  return await _retrieveData("current_user");
}

export async function _storeData(key, value) {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.log(error);
  }
}

export async function _retrieveData(key) {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return value;
    }
  } catch (error) {
    console.log(error);
  }
}


export async function _removeData(key) {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.log(error);
  }
}


export async function _mergeData(key, value) {
  try {
    await AsyncStorage.mergeItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.log(error);
  }
}
