import { tabs } from "@/constants/data";
import { SubscriptionsProvider } from "@/contexts/SubscriptionsContext";
import { colors, components, TAB_BAR_HEIGHT } from "@/constants/theme";
import { signInHrefWithReturnTo, useAuthRedirectReturnTo } from "@/lib/auth-return-to";
import { useAuth } from "@clerk/expo";
import clsx from "clsx";
import { Redirect, Tabs } from "expo-router";
import { Image, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const tabBar = components.tabBar;

function TabIcon({ focused, icon }: TabIconProps) {
  return (
    <View className="tabs-icon">
      <View className={clsx("tabs-pill", focused && "tabs-active")}>
        <Image source={icon} className="tabs-glyph" />
      </View>
    </View>
  );
}

const TabLayout = () => {
    const { isSignedIn, isLoaded } = useAuth();
    const insets = useSafeAreaInsets();
    const returnTo = useAuthRedirectReturnTo();

    if (!isLoaded) {
        return null;
    }

    if (!isSignedIn) {
        return <Redirect href={signInHrefWithReturnTo(returnTo)} />;
    }

     return (
        <SubscriptionsProvider>
        <Tabs screenOptions={{ 
            headerShown: false,
            tabBarHideOnKeyboard: true,
            tabBarShowLabel: false,
            tabBarStyle: {
                position: 'absolute',
                bottom:Math.max(insets.bottom, tabBar.horizontalInset),
                height: TAB_BAR_HEIGHT,
                marginHorizontal: tabBar.horizontalInset,
                borderRadius: tabBar.radius,
                backgroundColor: colors.primary,
                borderTopWidth: 0,
                elevation: 0,
        },
        tabBarItemStyle: {
            paddingVertical: TAB_BAR_HEIGHT / 2 - tabBar.iconFrame / 1.6,
        },
        tabBarIconStyle: {
            width: tabBar.iconFrame,
            height: tabBar.iconFrame,
            alignSelf: 'center',
        },
         }}>
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={tab.icon} />
            ),
          }}
        />
      ))}
    </Tabs>
        </SubscriptionsProvider>
  );
};

export default TabLayout;
