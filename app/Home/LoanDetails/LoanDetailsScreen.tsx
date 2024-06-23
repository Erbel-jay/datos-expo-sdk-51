import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { globalStyle } from "../../../assets/styles/globalStyle";
import Icon from '@expo/vector-icons/build/Feather';

export default class LoanDetailsScreen extends React.Component {

  render(){
    return (
      <View style={styles.container}>
        <View style={styles.termsBox}>
            <View style={styles.textHolder}>
                <Text style={[globalStyle.commonText, {fontSize: 18}]}>Loan Terms:</Text>
                <Text style={[globalStyle.commonText, {color: '#e71409'}]}>Minimum 6 months, Maximum 36 months</Text>
            </View>
            <View style={styles.textHolder}>
                <Text style={[globalStyle.commonText, {fontSize: 18}]}>Monthly Add-on Rate:</Text>
                <Text style={[globalStyle.commonText, {color: '#e71409'}]}>1.6% to 1.8%</Text>
            </View>
            <View style={styles.textHolder}>
                <Text style={[globalStyle.commonText, {fontSize: 18}]}>Annual Percentage Rate:</Text>
                <Text style={[globalStyle.commonText, {color: '#e71409'}]}>20% to 22%</Text>
            </View>
            <View style={styles.textHolder}>
                <Text style={[globalStyle.commonText, {fontSize: 18}]}>Required repayment:</Text>
                <Text style={[globalStyle.commonText, {color: '#e71409'}]}>Monthly Basis</Text>
            </View>
            {/* <Text style={[globalStyle.commonText, styles.textStyle, {fontSize: 15,}]}>Monthly Addon Rate: 1.578%</Text>
            <Text style={[globalStyle.commonText, styles.textStyle, {fontSize: 15,}]}>Annual Percentage Rate:  18.936%</Text>
            <Text style={[globalStyle.commonText, {fontSize: 15, color: '#e71409',}]}>Required repayment: Monthly Basis</Text> */}
        </View>
      </View>
    );
  }
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    // justifyContent: 'center',
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  termsBox: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
    borderColor: '#e71409',
  },
  textHolder: {
    flexDirection: 'column',
    marginTop: 10
  },
});
