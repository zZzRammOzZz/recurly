import { formatCurrency, formatSubscriptionDateTime } from "@/lib/utils";
import clsx from "clsx";
import React from "react";
import { Image, Pressable, Text, View, type ImageSourcePropType } from "react-native";

interface SubscriptionCardProps {
    name: string;
    price: number;
    currency?: string;
    billing: string;
    renewalDate?: string;
    color?: string;
    icon: ImageSourcePropType;
    category?: string;
    plan?: string;
    onPress: () => void;
    expanded: boolean;
    paymentMethod?: string;
    startDate?: string;
    status?: string;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
    name,
    price,
    currency,
    billing,
    renewalDate,
    color,
    icon,
    category,
    plan,
    onPress,
    expanded,
    paymentMethod,
    startDate,
    status,
}) => {
    return (
        <Pressable onPress={onPress} className={clsx("sub-card bg-card",expanded ? "sub-card-expanded" : "bg-card" )} style={!expanded && color ? { backgroundColor: color } : {}}>
            <View className="sub-head">
                <View className="sub-main">
                    <Image source={icon} className="sub-icon" />
                    <View className="sub-copy">
                        <Text className="sub-title" numberOfLines={1}>{name}</Text>  
                        <Text className="sub-meta" numberOfLines={1} ellipsizeMode="tail">{category?.trim() || plan?.trim() ||(renewalDate ? formatSubscriptionDateTime(renewalDate) : "")}</Text>
                    </View>
                </View>
                <View className="sub-price-box">
                    <Text className="sub-price">{formatCurrency(price, currency)}</Text>
                    <Text className="sub-billing">{billing}</Text>
                </View>
            </View>

            {expanded && (
                <View className="sub-details">
                    <View className="sub-details">
                        <View className="sub-row">
                            <View className="sub-row-copy">
                                <Text className="sub-label">Payment Method</Text>
                                <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">{paymentMethod?.trim()}</Text>
                            </View>
                        </View>
                        <View className="sub-row">
                            <View className="sub-row-copy">
                                <Text className="sub-label">Category</Text>
                                <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">{category?.trim() || plan?.trim()}</Text>
                            </View>
                        </View>
                        <View className="sub-row">
                            <View className="sub-row-copy">
                                <Text className="sub-label">Start Date</Text>
                                <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">{startDate ? formatSubscriptionDateTime(startDate) : ""}</Text>
                            </View>
                        </View>
                        <View className="sub-row">
                            <View className="sub-row-copy">
                                <Text className="sub-label">Renewal Date</Text>
                                    <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">{renewalDate ? formatSubscriptionDateTime(renewalDate) : ""}</Text>
                                </View>
                            </View>
                        </View>
                        <View className="sub-row">
                            <View className="sub-row-copy">
                                <Text className="sub-label">Status</Text>
                                <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">{status?.trim()}</Text>
                            </View>
                        </View>
                    </View>                    
            )}
        </Pressable>
    )
}

export default SubscriptionCard;