import React, { useEffect, useRef } from "react";
import { AccessibilityInfo, Animated, Platform, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

export function HomeSkeleton() {
  const { width } = useWindowDimensions();
  const { top } = useSafeAreaInsets();
  const c = useColors();
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    let disposed = false;
    let animation: Animated.CompositeAnimation | undefined;
    const update = (reduced: boolean) => {
      if (disposed) return;
      animation?.stop();
      opacity.setValue(1);
      if (reduced) return;
      const fade = (toValue: number) => Animated.timing(opacity, {
        toValue, duration: 800, useNativeDriver: Platform.OS !== "web", isInteraction: false,
      });
      animation = Animated.loop(Animated.sequence([fade(0.55), fade(1)]));
      animation.start();
    };
    AccessibilityInfo.isReduceMotionEnabled().then(update).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", update);
    return () => { disposed = true; animation?.stop(); subscription.remove(); };
  }, [opacity]);
  const tile = Math.min(118, (width - 56) / 5);
  const fill = c.background.toLowerCase() === "#ffffff" ? "#e2e9ef" : c.secondary;
  function block(w: number, h: number, radius = 4) {
    return <View style={{ width: w, height: h, borderRadius: radius, backgroundColor: fill }} />;
  }
  const row = { flexDirection: "row", justifyContent: "space-around", alignItems: "center" } as const;
  return (
    <View testID="home-skeleton" accessible accessibilityRole="progressbar" accessibilityLabel="Loading storefront"
      style={{ flex: 1, paddingTop: top + 22, overflow: "hidden", backgroundColor: c.background }}>
      <Animated.View style={{ opacity, gap: 16 }}>
        <View style={row}>{Array.from({ length: 5 }, (_, i) => <View key={i}>{block(tile, 14)}</View>)}</View>
        {block(width, Math.min(460, width * 0.70), 0)}
        <View style={row}>{[0, 1].map(i => <View key={i} style={{ gap: 5 }}>{block(tile * 1.6, 13)}{block(tile, 9)}</View>)}</View>
        {[0, 1].map(r => <View key={r} style={row}>{Array.from({ length: 5 }, (_, i) =>
          <View key={i} style={{ alignItems: "center", gap: 7 }}>{block(tile, tile, tile * 0.35)}{block(tile * 0.7, 10)}</View>
        )}</View>)}
        <View style={row}>{[0, 1].map(i => <View key={i}>{block(width * 0.47, 280)}</View>)}</View>
      </Animated.View>
    </View>
  );
}
