import { icons } from "@/constants/icons";
import clsx from "clsx";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

const SUBSCRIPTION_CATEGORIES = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

type SubscriptionCategory = (typeof SUBSCRIPTION_CATEGORIES)[number];

const CATEGORY_COLORS: Record<SubscriptionCategory, string> = {
  Entertainment: "#f5c542",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#b8e8d0",
  Productivity: "#d4c4f5",
  Cloud: "#cfe8f5",
  Music: "#f5b8c4",
  Other: "#e6e6e6",
};

type BillingFrequency = "Monthly" | "Yearly";

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (subscription: Subscription) => void;
}

function parsePositivePrice(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const n = Number.parseFloat(trimmed.replace(/,/g, ""));
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

const CreateSubscriptionModal: React.FC<CreateSubscriptionModalProps> = ({
  visible,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<BillingFrequency>("Monthly");
  const [category, setCategory] = useState<SubscriptionCategory>("Entertainment");

  const resetForm = useCallback(() => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("Entertainment");
  }, []);

  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible, resetForm]);

  const parsedPrice = useMemo(() => parsePositivePrice(price), [price]);
  const canSubmit = name.trim().length > 0 && parsedPrice !== null;

  const handleSubmit = () => {
    if (!canSubmit || parsedPrice === null) return;

    const start = dayjs();
    const renewal = frequency === "Monthly" ? start.add(1, "month") : start.add(1, "year");

    const newSubscription: Subscription = {
      id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: name.trim(),
      price: parsedPrice,
      currency: "USD",
      billing: frequency,
      frequency,
      category,
      status: "active",
      startDate: start.toISOString(),
      renewalDate: renewal.toISOString(),
      icon: icons.wallet,
      color: CATEGORY_COLORS[category],
    };

    onCreate(newSubscription);
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <Pressable className="flex-1" onPress={onClose} accessibilityRole="button" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ width: "100%" }}
        >
          <View className="modal-container w-full">
            <View className="modal-header">
              <Text className="modal-title">New Subscription</Text>
              <Pressable
                onPress={onClose}
                className="modal-close"
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Text className="modal-close-text">×</Text>
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <View className="modal-body">
                <View className="auth-field">
                  <Text className="auth-label">Name</Text>
                  <TextInput
                    className="auth-input"
                    value={name}
                    onChangeText={setName}
                    placeholder="Subscription name"
                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                    autoCorrect={false}
                  />
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Price</Text>
                  <TextInput
                    className="auth-input"
                    value={price}
                    onChangeText={setPrice}
                    placeholder="0.00"
                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                    keyboardType="decimal-pad"
                  />
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Frequency</Text>
                  <View className="picker-row">
                    {(["Monthly", "Yearly"] as const).map((opt) => {
                      const active = frequency === opt;
                      return (
                        <Pressable
                          key={opt}
                          onPress={() => setFrequency(opt)}
                          className={clsx(
                            "picker-option",
                            active && "picker-option-active"
                          )}
                        >
                          <Text
                            className={clsx(
                              "picker-option-text",
                              active && "picker-option-text-active"
                            )}
                          >
                            {opt}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Category</Text>
                  <View className="category-scroll">
                    {SUBSCRIPTION_CATEGORIES.map((cat) => {
                      const active = category === cat;
                      return (
                        <Pressable
                          key={cat}
                          onPress={() => setCategory(cat)}
                          className={clsx(
                            "category-chip",
                            active && "category-chip-active"
                          )}
                        >
                          <Text
                            className={clsx(
                              "category-chip-text",
                              active && "category-chip-text-active"
                            )}
                          >
                            {cat}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <Pressable
                  onPress={handleSubmit}
                  disabled={!canSubmit}
                  className={clsx(
                    "auth-button",
                    !canSubmit && "auth-button-disabled"
                  )}
                >
                  <Text className="auth-button-text">Add subscription</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default CreateSubscriptionModal;
