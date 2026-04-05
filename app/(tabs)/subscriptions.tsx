import SubscriptionCard from "@/components/SubscriptionCard";
import { useSubscriptions } from "@/contexts/SubscriptionsContext";
import { styled } from "nativewind";
import { useMemo, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Text, TextInput, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

function subscriptionMatchesQuery(sub: Subscription, query: string): boolean {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const haystack = [
        sub.name,
        sub.category,
        sub.plan,
        sub.status,
        sub.billing,
        sub.paymentMethod,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
    return haystack.includes(q);
}

const Subscriptions = () => {
    const { subscriptions } = useSubscriptions();
    const [query, setQuery] = useState("");
    const [expandedSubscription, setExpandedSubscription] = useState<string | null>(null);

    const filtered = useMemo(
        () => subscriptions.filter((s) => subscriptionMatchesQuery(s, query)),
        [subscriptions, query]
    );

    return (
        <SafeAreaView className="flex-1 bg-background p-5">
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
            <FlatList
                style={{ flex: 1 }}
                data={filtered}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={
                    <>
                        <Text className="mb-4 text-2xl font-sans-bold text-primary">
                            Subscriptions
                        </Text>
                        <TextInput
                            className="auth-input mb-4"
                            placeholder="Search by name, category, plan…"
                            placeholderTextColor="rgba(0, 0, 0, 0.4)"
                            value={query}
                            onChangeText={setQuery}
                            autoCorrect={false}
                            autoCapitalize="none"
                            clearButtonMode="while-editing"
                        />
                    </>
                }
                renderItem={({ item }) => (
                    <SubscriptionCard
                        {...item}
                        expanded={expandedSubscription === item.id}
                        onPress={() =>
                            setExpandedSubscription((current) =>
                                current === item.id ? null : item.id
                            )
                        }
                    />
                )}
                extraData={[expandedSubscription, subscriptions]}
                ItemSeparatorComponent={() => <View className="h-4" />}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <Text className="home-empty-text">
                        {query.trim() ? "No matching subscriptions" : "No subscriptions"}
                    </Text>
                }
                contentContainerClassName="pb-20"
                keyboardShouldPersistTaps="handled"
            />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default Subscriptions;
