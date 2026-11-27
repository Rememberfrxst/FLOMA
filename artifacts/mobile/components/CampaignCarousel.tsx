import React, { useEffect, useRef, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "./Text";
import { openBanner } from "./ShopUI";
import type { ApiBanner } from "@/services/api";
export default function CampaignCarousel({
  banners,
  height = 220,
  headerSpace = 0,
}: {
  banners: ApiBanner[];
  height?: number;
  headerSpace?: number;
}) {
  const { width } = useWindowDimensions(),
    [current, setCurrent] = useState(0),
    ref = useRef<ScrollView>(null);
  useEffect(() => {
    setCurrent(0);
    ref.current?.scrollTo({ x: 0, animated: false });
    if (banners.length < 2) return;
    let index = 0;
    const timer = setInterval(() => {
      index = (index + 1) % banners.length;
      setCurrent(index);
      ref.current?.scrollTo({ x: index * width, animated: true });
    }, 5500);
    return () => clearInterval(timer);
  }, [banners.length, width]);
  if (!banners.length) return null;
  return (
    <View>
      <ScrollView
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) =>
          setCurrent(Math.round(e.nativeEvent.contentOffset.x / width))
        }
      >
        {banners.map((b) => (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={b.title || "Shop campaign"}
            key={b.id}
            onPress={() => openBanner(b)}
            activeOpacity={0.96}
            style={{ width, height, backgroundColor: "#333" }}
          >
            {b.imageUrl.includes("/photo-1445205170230-053b83016050") && (
              <Image source={require("../assets/images/season-fashion.jpg")} style={StyleSheet.absoluteFill} contentFit="cover" />
            )}
            <Image
              source={{ uri: b.imageUrl }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
            <LinearGradient
              start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }}
              colors={["rgba(62,2,17,.96)", "rgba(92,12,33,.55)", "rgba(40,5,14,.16)"]}
              style={StyleSheet.absoluteFill}
            />
            <View
              style={[
                s.copy,
                { paddingTop: headerSpace + 8 },
                height < 190 && { paddingBottom: 15 },
              ]}
            >
              {!!b.title && (
                <Text
                  numberOfLines={2}
                  style={[
                    s.title,
                    height < 190 && { fontSize: 18, lineHeight: 21 },
                  ]}
                >
                  {b.title}
                </Text>
              )}
              {!!b.subtitle && (
                <Text
                  numberOfLines={2}
                  style={[
                    s.subtitle,
                    height < 190 && { fontSize: 10, lineHeight: 14 },
                  ]}
                >
                  {b.subtitle}
                </Text>
              )}
              <View
                style={[
                  s.cta,
                  height < 190 && { marginTop: 7, paddingVertical: 5 },
                ]}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 10,
                    fontFamily: "GoogleSans_700Bold",
                  }}
                >
                  SHOP NOW
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {banners.length > 1 && (
        <View pointerEvents="none" style={s.dots}>
          {banners.map((b, i) => (
            <View
              key={b.id}
              style={{
                height: 4,
                width: i === current ? 12 : 4,
                borderRadius: 3,
                backgroundColor: i === current ? "#fff" : "#ffffff80",
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  copy: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingBottom: 25,
    maxWidth: 300,
  },
  title: {
    fontSize: 36,
    lineHeight: 36,
    letterSpacing: -1.5,
    color: "#fff",
    fontFamily: "GoogleSans_700Bold",
  },
  subtitle: {
    fontSize: 11,
    lineHeight: 16,
    color: "#fff",
    maxWidth: 215,
    marginTop: 7,
  },
  cta: {
    alignSelf: "flex-start",
    backgroundColor: "#751833",
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginTop: 12,
  },
  dots: {
    position: "absolute",
    bottom: 11,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
  },
});
