import React from 'react';
import { View, Text, StyleSheet, Image } from "react-native";
import {
    DrawerContentScrollView,
    DrawerItem,
    DrawerItemList
} from '@react-navigation/drawer';
import {
    Drawer,
} from 'react-native-paper'
import Icon from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
const iconSize = 20

export default function DrawerContent(props: any) {
    return (
        <View style={{ flex: 1 }}>
            <DrawerContentScrollView {...props}>
                <View style={styles.drawerContent}>
                        <View style={{ flexDirection: 'row', marginTop: 15, marginBottom: 20 }}>
                            {/* <Image
                                {...props}
                                source={require('../../assets/images/spytrack_logo_old.png')}
                                size={40}
                                style={{ height: 60, width: '100%', resizeMode: "contain", }}
                            /> */}
                        </View>

                    <DrawerItemList {...props} />

                </View>
            </DrawerContentScrollView>
            <View style={styles.bottomDrawerSection}>
                <DrawerItem
                    icon={({ color, size }) => (
                        <Icon
                            name="log-out"
                            color={'#EB524A'}
                            size={iconSize}
                        />
                    )}
                    label="Sign Out"
                    onPress={async () => {
                        router.replace('Auth')
                    }}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    drawerContent: {
        flex: 1,
    },
    userInfoSection: {
        padding: 10,
    },
    title: {
        fontSize: 17,
        marginTop: 0,
        fontWeight: 'bold',
        fontFamily: 'CalibriBold'
    },
    caption: {
        fontSize: 14,
        lineHeight: 14,
    },
    row: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center'
    },
    section: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15
    },
    paragraph: {
        fontWeight: 'bold',
        marginRight: 3
    },
    drawerSection: {
        marginTop: 0,
    },
    bottomDrawerSection: {
        marginBottom: 15,
        borderTopColor: '#f4f4f4',
        borderTopWidth: 1
    },
    preference: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16
    }
})