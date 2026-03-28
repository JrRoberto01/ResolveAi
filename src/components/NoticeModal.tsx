import colors from "@/style/colors";
import { Modal, Pressable, Text, View } from "react-native";
import { noticeModalStyle } from "./noticeModalStyle";

type NoticeModalAction = {
    label: string;
    onPress: () => void;
    variant?: "primary" | "secondary" | "danger";
};

type NoticeModalProps = {
    visible: boolean;
    title: string;
    message: string;
    variant?: "info" | "success" | "warning" | "error";
    primaryAction: NoticeModalAction;
    secondaryAction?: NoticeModalAction;
    onRequestClose?: () => void;
};

const accentByVariant = {
    info: colors.darkBlue,
    success: "#1E8E5A",
    warning: "#D97706",
    error: "#C0392B",
} as const;

function buttonVariantStyle(variant: NoticeModalAction["variant"]) {
    switch (variant) {
        case "danger":
            return {
                backgroundColor: "#C0392B",
                borderColor: "#C0392B",
            };
        case "secondary":
            return {
                backgroundColor: colors.white,
                borderColor: colors.darkGrey,
            };
        default:
            return {
                backgroundColor: colors.darkBlue,
                borderColor: colors.darkBlue,
            };
    }
}

function buttonTextVariantStyle(variant: NoticeModalAction["variant"]) {
    switch (variant) {
        case "secondary":
            return {
                color: colors.black,
            };
        default:
            return {
                color: colors.white,
            };
    }
}

export default function NoticeModal({ visible, title, message, variant = "info", primaryAction, secondaryAction, onRequestClose, }: NoticeModalProps) {
    const accentColor = accentByVariant[variant];

    return (
        <Modal animationType="fade" transparent visible={visible} onRequestClose={onRequestClose ?? primaryAction.onPress} >
            <View style={noticeModalStyle.overlay}>
                <View style={noticeModalStyle.card}>
                    <View style={[noticeModalStyle.badge, { backgroundColor: accentColor }]} />
                    <Text style={noticeModalStyle.title}>{title}</Text>
                    <Text style={noticeModalStyle.message}>{message}</Text>

                    <View style={noticeModalStyle.actions}>
                        {secondaryAction ? (
                            <Pressable style={[ noticeModalStyle.button, noticeModalStyle.secondaryButton, buttonVariantStyle(secondaryAction.variant ?? "secondary"), ]} onPress={secondaryAction.onPress} >
                                <Text style={[ noticeModalStyle.secondaryText, buttonTextVariantStyle(secondaryAction.variant ?? "secondary"), ]} >
                                    {secondaryAction.label}
                                </Text>
                            </Pressable>
                        ) : null}

                        <Pressable style={[ noticeModalStyle.button, noticeModalStyle.primaryButton, buttonVariantStyle(primaryAction.variant ?? "primary"), ]} onPress={primaryAction.onPress} >
                            <Text style={[ noticeModalStyle.primaryText, buttonTextVariantStyle(primaryAction.variant ?? "primary"), ]} >
                                {primaryAction.label}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
