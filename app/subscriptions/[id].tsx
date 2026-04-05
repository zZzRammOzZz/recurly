import { Link, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

const SubscriptionDetails = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    return (
        <View>
            <Text>Subscription Details: {id}</Text>
            <Link href="/(tabs)/subscriptions" className="mt-4 bg-primary text-white p-4">Go Back</Link>
        </View>
    )
}

export default SubscriptionDetails;