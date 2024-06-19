import { Stack } from "expo-router";
import { useEffect } from 'react';
const { _storeData, _retrieveData, _removeData } = require("../../helpers/global-function");
import { router } from 'expo-router';

export default function SliderLayout() {

    useEffect(() => {
        load()
      }, [])
    
      const load = async () => {
        await _retrieveData('showSlides').then(async (result: any) => {
            console.log("showSlides Result", result);
            if (result && result == "false") {
                console.log("go to AUTH");
                router.replace('Auth')
            } else {
              console.log("go to SLIDES");
                await _storeData('NoUser', 'true')
                await _storeData('showSlides', 'true')
                // router.replace('Auth')
            }
        })
      }

    return <Stack initialRouteName="GetStartedScreen">
        <Stack.Screen name="GetStartedScreen" options={{headerShown: false}}/>
        <Stack.Screen name="SliderScreenOne" options={{headerShown: false}}/>
        <Stack.Screen name="SliderScreenTwo" options={{headerShown: false}}/>
        <Stack.Screen name="SliderScreenThree" options={{headerShown: false}}/>
    </Stack>
}