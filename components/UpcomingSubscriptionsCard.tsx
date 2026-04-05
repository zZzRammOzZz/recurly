import SubscriptionIcon from "@/components/SubscriptionIcon";
import { formatCurrency } from "@/lib/utils";
import { Text, View } from "react-native";

const UpcomingSubscriptionsCard = ({icon, name, price, currency, daysLeft}: UpcomingSubscription) => {
    return (
        <View className="upcoming-card">
            <View className="upcoming-row">
                <SubscriptionIcon name={name} fallbackSource={icon} size={56} className="upcoming-icon" />
                <View>
                    <Text className="upcoming-price">{formatCurrency(price, currency)}</Text>
                    <Text className="upcoming-meta" numberOfLines={1}>
                        {daysLeft > 1
                            ? `${daysLeft} days left`
                            : daysLeft === 1
                              ? "Last day"
                              : "Expired"}
                    </Text>
                </View>
            </View>
            <Text className="upcoming-name" numberOfLines={1}>{name}</Text>
        </View>
    )
}

export default UpcomingSubscriptionsCard;