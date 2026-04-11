import palette from '@/style/colors';
import { Modal, Pressable, Text, View } from 'react-native';
import { styles } from './NoticeModalStyle';

type NoticeModalAction = {
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
};

type NoticeModalProps = {
    visible: boolean;
    title: string;
    message: string;
    variant?: 'info' | 'success' | 'warning' | 'error';
    primaryAction: NoticeModalAction;
    secondaryAction?: NoticeModalAction;
    onRequestClose?: () => void;
};

const accentByVariant = {
    info: palette.darkBlue,
    success: '#1E8E5A',
    warning: '#D97706',
    error: '#C0392B',
} as const;

function buttonVariantStyle(variant: NoticeModalAction['variant']) {
    switch (variant) {
        case 'danger':
            return { backgroundColor: '#C0392B', borderColor: '#C0392B' };
        case 'secondary':
            return { backgroundColor: palette.white, borderColor: palette.darkGrey };
        default:
            return { backgroundColor: palette.darkBlue, borderColor: palette.darkBlue };
    }
}

function buttonTextVariantStyle(variant: NoticeModalAction['variant']) {
    if (variant === 'secondary') {
        return { color: palette.black };
    }

    return { color: palette.white };
}

export default function NoticeModal({
    visible,
    title,
    message,
    variant = 'info',
    primaryAction,
    secondaryAction,
    onRequestClose,
}: NoticeModalProps) {
    const accentColor = accentByVariant[variant];

    return (
        <Modal animationType="fade" transparent visible={visible} onRequestClose={onRequestClose ?? primaryAction.onPress}>
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <View style={[styles.badge, { backgroundColor: accentColor }]} />
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <View style={styles.actions}>
                        {secondaryAction ? (
                            <Pressable
                                style={[styles.button, styles.secondaryButton, buttonVariantStyle(secondaryAction.variant ?? 'secondary')]}
                                onPress={secondaryAction.onPress}
                            >
                                <Text style={[styles.secondaryText, buttonTextVariantStyle(secondaryAction.variant ?? 'secondary')]}>
                                    {secondaryAction.label}
                                </Text>
                            </Pressable>
                        ) : null}

                        <Pressable
                            style={[styles.button, styles.primaryButton, buttonVariantStyle(primaryAction.variant ?? 'primary')]}
                            onPress={primaryAction.onPress}
                        >
                            <Text style={[styles.primaryText, buttonTextVariantStyle(primaryAction.variant ?? 'primary')]}>
                                {primaryAction.label}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
