import { colors } from "@/constants/theme";
import { resolveSubscriptionMdiIcon } from "@/lib/resolve-subscription-mdi-icon";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type { ComponentProps } from "react";
import { Image, View } from "react-native";
import type { ImageSourcePropType } from "react-native";

type MdiName = ComponentProps<typeof MaterialCommunityIcons>["name"];

interface SubscriptionIconProps {
    name: string;
    /** Used when no MDI glyph matches the subscription name (e.g. custom PNG brands). */
    fallbackSource: ImageSourcePropType;
    size: number;
    className?: string;
    /** Single-color icons use this; defaults to app primary. */
    color?: string;
}

/**
 * Picks a Material Community Icons glyph from the subscription name when possible,
 * otherwise shows the bundled image asset.
 */
export default function SubscriptionIcon({
    name,
    fallbackSource,
    size,
    className,
    color = colors.primary,
}: SubscriptionIconProps) {
    const mdiName = resolveSubscriptionMdiIcon(name);

    if (mdiName) {
        return (
            <View className={className} style={{ width: size, height: size }}>
                <MaterialCommunityIcons
                    name={mdiName as MdiName}
                    size={size}
                    color={color}
                />
            </View>
        );
    }

    return (
        <Image
            source={fallbackSource}
            className={className}
            style={{ width: size, height: size }}
            resizeMode="contain"
        />
    );
}
