import palette from '@/style/colors';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from './SettingsOptionStyle';

type SettingsOptionProps = {
    icon: string;
    text: string;
    isDanger?: boolean;
    showDivider?: boolean;
    onPress?: () => void;
};

export function SettingsOption({ icon, text, isDanger, showDivider = false, onPress }: SettingsOptionProps) {
    return (
        <>
            <TouchableOpacity style={styles.optionRow} onPress={onPress}>
                <View style={styles.optionLeft}>
                    <FontAwesome5
                        name={icon}
                        size={18}
                        color={isDanger ? '#EF4444' : '#475569'}
                        style={[styles.optionIcon, isDanger && { color: '#EF4444' }]}
                    />
                    <Text style={[styles.optionText, isDanger && { color: '#EF4444' }]}>{text}</Text>
                </View>
                {!isDanger ? <FontAwesome5 name="chevron-right" size={14} color={palette.darkGrey} /> : null}
            </TouchableOpacity>
            {showDivider ? <View style={styles.divider} /> : null}
        </>
    );
}
