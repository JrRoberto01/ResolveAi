import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import colors from '@/style/colors';

type SettingsOptionProps = {
    icon: string;
    text: string;
    isDanger?: boolean;
    showDivider?: boolean;
};

export function SettingsOption({ icon, text, isDanger, showDivider = false }: SettingsOptionProps) {
    return (
        <>
            <TouchableOpacity style={styles.optionRow}>
                <View style={styles.optionLeft}>
                    <FontAwesome5 
                        name={icon} 
                        size={18} 
                        color={isDanger ? '#EF4444' : '#475569'} 
                        style={[styles.optionIcon, isDanger && { color: '#EF4444' }]} 
                    />
                    <Text style={[styles.optionText, isDanger && { color: '#EF4444' }]}>
                        {text}
                    </Text>
                </View>
                {!isDanger && <FontAwesome5 name="chevron-right" size={14} color={colors.darkGrey} />}
            </TouchableOpacity>
            {showDivider && <View style={styles.divider} />}
        </>
    );
}

const styles = StyleSheet.create({
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionIcon: {
        width: 24,
        textAlign: 'center',
        marginRight: 12,
        color: '#475569',
    },
    optionText: {
        fontSize: 16,
        color: colors.black,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginLeft: 52,
    }
});
