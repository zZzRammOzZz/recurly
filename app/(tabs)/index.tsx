import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionsCard from "@/components/UpcomingSubscriptionsCard";
import { HOME_BALANCE, HOME_SUBSCRIPTIONS, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import "@/global.css";
import { accountDisplayName } from "@/lib/user-display";
import { formatCurrency } from "@/lib/utils";
import { useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { useMemo, useState } from "react";
import { FlatList, Image, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const { user, isLoaded } = useUser();
  const [expandedSubscription, setExpandedSubscription] = useState<string | null>(null);

  const displayName = useMemo(() => accountDisplayName(user), [user]);

  const avatarSource = useMemo(() => {
    const url = user?.imageUrl;
    if (url) return { uri: url };
    return images.avatar;
  }, [user?.imageUrl]);

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
     

        <FlatList 
        ListHeaderComponent={() => (
          <>
           <View className="home-header">
          <View className="home-user">
            <Image source={avatarSource} className="home-avatar" />
            <Text className="home-user-name">
              {isLoaded ? displayName : "…"}
            </Text>
          </View>
          <Image source={icons.add} className="home-add-icon" />
      </View>

      <View className="home-balance-card">
        <Text className="home-balance-label">Balance</Text>
        <View className="home-balance-row">
          <Text className="home-balance-amount">
            {formatCurrency(HOME_BALANCE.amount)}
          </Text>
          <Text className="home-balance-date">
            {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
          </Text>
        </View>
      </View>
    
      <View className="mb-5">
        <ListHeading title="Upcoming Subscriptions" />
        <FlatList 
        data={UPCOMING_SUBSCRIPTIONS} 
        renderItem={({item}) => <UpcomingSubscriptionsCard {...item} />} 
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        ListEmptyComponent={<Text className="home-empty-text">No upcoming subscriptions</Text>}
        />
      </View>

      <ListHeading title="All Subscriptions" />

          </>
        )}
        data={HOME_SUBSCRIPTIONS} 
        keyExtractor={(item) => item.id}
        renderItem={({item}) => <SubscriptionCard {...item} 
          expanded={expandedSubscription === item.id} 
          onPress={() => setExpandedSubscription((currentId) => currentId === item.id ? null : item.id)} 
          />}       
        extraData={expandedSubscription}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text className="home-empty-text">No subscriptions</Text>}
        contentContainerClassName="pb-20"
        />
    </SafeAreaView>
  );
}