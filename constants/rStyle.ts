import {StyleSheet} from "react-native";
import Colors from "@/constants/Colors";
import * as Device from 'expo-device';

const TABLE = Device.deviceType === 2;


export const fsz = {
    s14: TABLE ? 14 : 12,
    s15: TABLE ? 15 : 13,
    s16: TABLE ? 16 : 14,
    s18: TABLE ? 18 : 16,
    s20: TABLE ? 20 : 18,
    s22: TABLE ? 22 : 20,
    s24: TABLE ? 24 : 20,
    s26: TABLE ? 26 : 24,
    i22: TABLE ? 22 : 18,
    i24: TABLE ? 24 : 20,
    i26: TABLE ? 26 : 22,
    i48: TABLE ? 48 : 40,
};
export const pos = {
    p16: TABLE ? 16 : 12,
    p8: TABLE ? 8 : 4,
    pv16: TABLE ? 16 : 8,
    m16: TABLE ? 16 : 8,
    v8: TABLE ? 8 : 6,
    v16: TABLE ? 16 : 14,
    h32: TABLE ? 32 : 16,
    mb32: TABLE ? 32 : 16,
    mb16: TABLE ? 16 : 8,
    mb8: TABLE ? 8 : 4,
    mt32: TABLE ? 32 : 16,
    mt16: TABLE ? 16 : 8,
    h16: TABLE ? 16 : 8,
    g16: TABLE ? 16 : 8,
    g24: TABLE ? 24 : 8,
};


export const rStyle = StyleSheet.create({
    shadow: {
        shadowColor: Colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 1,
    },
    cardContainer: {
        flex: 1,
        backgroundColor: Colors.white,
        margin: pos.p16,
        padding: pos.p16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: "hidden"
    },
    btn: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        paddingVertical: pos.v16,
        paddingHorizontal: pos.h32,
        borderRadius: 4,
        gap: 8,
        borderWidth: 1,
    },
    btnText: {
        fontSize: fsz.s18,
        fontWeight: "500"
    },
    btnTextM: {
        fontSize: 15,
        fontWeight: "500",
        borderBottomWidth: 1,
        borderBottomColor: Colors.medium,
        paddingBottom: 8
    },
    btnPrimary: {
        borderColor: Colors.info,
        backgroundColor: Colors.info
    },
    btnPrimaryOutline: {
        borderColor: Colors.info,
        backgroundColor: Colors.white
    },
    textWhite: {
        color: Colors.white,
    },
    textPrimary: {
        color: Colors.info,
    },
    positionIcon: {
        width: TABLE ? 40 : 32,
        height: TABLE ? 40 : 32,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.info,
        borderRadius: TABLE ? 40 : 32,
        top: 4
    },
    dotLg: {
        width: 16,
        height: 16,
        borderRadius: 16
    },
    dotSm: {
        width: 10,
        height: 10,
        borderRadius: 10,
        marginLeft: 8
    },
    input: {
        backgroundColor: Colors.white,
        color: Colors.black,
        marginVertical: 4,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        padding: pos.p16,
        fontSize: fsz.s18,
    },
    tabTitleContainer: {
        flex: 1,
        height: 72,
        width: 100,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 4,
    },
    tabIconContainer: {
        height: 28,
        alignItems: "center",
        justifyContent: "center"
    },
    tabText: {
        height: 28,
        fontSize: TABLE ? 16 : 11,
    },
    searchContainer: {
        flexDirection: "row",
    },
    searchSection: {
        flex: 1,
        // flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        gap: 16,
    },
    searchField: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
    },
    searchIcon: {
        paddingLeft: 16,
        paddingRight: 8
    },
    searchInput: {
        flex: 1,
        color: Colors.black,
        padding: 16,
        fontSize: 18
    },
    searchBtn: {
        flexDirection: "row",
        backgroundColor:  Colors.white,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 16,
        borderRadius: 8,
        gap: 16
    },

    item: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: Colors.white,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderColor: Colors.greyBg,
        borderRadius: 4,
    },
    itemName: {
        fontSize: 18
    },
    itemSubName: {
        fontSize: 18,
        color: Colors.mediumDark
    },
    tabContainer: {
        flex: 0,
        flexDirection: "row",
        gap: 16
    },
    tabButton: {
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    tabButtonText: {
        color: Colors.white,
        fontSize: 16,
    },
    button: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        paddingVertical: pos.v16,
        paddingHorizontal: pos.h32,
        backgroundColor: Colors.white,
        borderRadius: 8,
        gap: 8,
        marginBottom: pos.v16,
    },
    buttonSm: {
        paddingVertical: 10,
        paddingHorizontal: 8,
    },
    buttonM: {
        paddingVertical: 0,
        paddingHorizontal: 0,
        borderWidth: 0,
        backgroundColor: Colors.greyBg
    },
    subHeader: {
        color: Colors.medium,
        fontSize: fsz.s16,
        marginBottom: pos.mb8
    },
    buttonRemoveImage: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: 4,
        paddingHorizontal: 16,
        gap: 8,
    },
    dateRow: {
        flexDirection: "row",
        gap: 16
    },
    dateGrid: {
        width: "50%",
        marginBottom: 32
    },
    dateContainer: {
        flexDirection: "row",
        borderColor: Colors.medium,
        borderWidth: 1,
        borderRadius: 4,
        paddingVertical: 8,
        paddingHorizontal: 16,
        width: 164,
        alignItems: "center",
        gap: 16
    },
    timeContainer: {
        borderColor: Colors.medium,
        borderWidth: 1,
        borderRadius: 4,
        height: 44,
        alignItems: "center",
        justifyContent: "center"
    },
    buttonSelect: {
        backgroundColor: Colors.info
    },
    buttonEmpty: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.border,
    }
});