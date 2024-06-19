import { StyleSheet, Dimensions, Platform } from "react-native";
import { datosBlack } from "./colorUsed";



export const globalStyle = StyleSheet.create({
    wrapper: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 20
    },
    horizontalSpacer: {
        width: 10
    },
    container: {
        flex: 1,
        backgroundColor: '#fff'
      },
      inputHolder: {
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
      },
      buttonHolder: {
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection:'row',
          marginVertical: 10,
          paddingHorizontal: 10
      },
      title: {
          fontSize: 20,
          color: datosBlack,
          marginBottom: 20,
          fontFamily: 'CalibriBold'
      },
      commonText: {
        fontFamily: 'CalibriRegular', fontSize: 15
      },
})