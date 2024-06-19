import * as React from 'react';
import {
    StyleSheet, 
    Text, 
    View, 
    TouchableOpacity
  } from 'react-native';
import { router, Link, useLocalSearchParams } from 'expo-router';

const RequirementsFormScreen = () => {
  let localSearchParams = useLocalSearchParams()
  return <RequirementsFormScreenComponent localSearchParams={localSearchParams}/>
}

export default RequirementsFormScreen

class RequirementsFormScreenComponent extends React.Component<any, any> {
  constructor(props: any){
    super(props)
  }

  componentDidMount(){
    let {retailer} = this.props.localSearchParams
    console.log('params', retailer);
  }

  render(){
    return (
        <View style={styles.container}>
            <Text>This is Requirements Form screen</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text>Go Back</Text>
            </TouchableOpacity>
        </View>
    );
  }
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})