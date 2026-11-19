import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Icon } from "./StoreIcon";
import { Text } from "./Text";
import { useColors } from "@/hooks/useColors";
import { useDesktopWeb } from "@/hooks/useDesktopWeb";

function FooterLink({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity accessibilityRole="link" onPress={onPress} style={s.link}>
      <Text style={s.linkText}>{children}</Text>
    </TouchableOpacity>
  );
}

/** A desktop-only trust rail and navigational footer for the browser storefront. */
export function DesktopStoreFooter() {
  const desktop = useDesktopWeb();
  const c = useColors();
  if (!desktop) return null;

  return (
    <View style={s.root}>
      <View style={[s.promises, { borderColor: c.border }]}>
        <View style={s.promise}>
          <Icon name="return-down-back-outline" size={30} color={c.foreground} />
          <View>
            <Text style={[s.promiseTitle, { color: c.foreground }]}>Easy returns</Text>
            <Text style={[s.promiseText, { color: c.mutedForeground }]}>Simple support when an order needs help</Text>
          </View>
        </View>
        <View style={s.promise}>
          <Icon name="heart-outline" size={30} color={c.foreground} />
          <View>
            <Text style={[s.promiseTitle, { color: c.foreground }]}>Curated for you</Text>
            <Text style={[s.promiseText, { color: c.mutedForeground }]}>Thoughtful finds from trusted sellers</Text>
          </View>
        </View>
        <View style={s.promise}>
          <Icon name="shield-checkmark-outline" size={30} color={c.foreground} />
          <View>
            <Text style={[s.promiseTitle, { color: c.foreground }]}>Secure checkout</Text>
            <Text style={[s.promiseText, { color: c.mutedForeground }]}>Protected payments and order updates</Text>
          </View>
        </View>
      </View>
      <View style={s.darkFooter}>
        <View style={s.footerInner}>
          <View style={[s.footerColumn, s.brandColumn]}>
            <Text style={s.brand}>GRIPER</Text>
            <Text style={s.brandCopy}>
              A simpler place to discover products worth keeping.
            </Text>
          </View>
          <View style={s.footerColumn}>
            <Text style={s.columnTitle}>Customer care</Text>
            <FooterLink onPress={() => router.push("/help")}>Help centre</FooterLink>
            <FooterLink onPress={() => router.push({ pathname: "/help", params: { section: "shipping" } })}>Shipping</FooterLink>
            <FooterLink onPress={() => router.push({ pathname: "/help", params: { section: "returns" } })}>Returns</FooterLink>
          </View>
          <View style={s.footerColumn}>
            <Text style={s.columnTitle}>Shop</Text>
            <FooterLink onPress={() => router.push("/products")}>All products</FooterLink>
            <FooterLink onPress={() => router.push({ pathname: "/products", params: { sort: "newest", title: "New arrivals" } })}>New arrivals</FooterLink>
            <FooterLink onPress={() => router.push("/offers")}>Store offers</FooterLink>
          </View>
          <View style={s.footerColumn}>
            <Text style={s.columnTitle}>Your account</Text>
            <FooterLink onPress={() => router.push("/wishlist")}>Wishlist</FooterLink>
            <FooterLink onPress={() => router.push("/(tabs)/cart")}>Bag</FooterLink>
            <FooterLink onPress={() => router.push("/(tabs)/profile")}>Profile</FooterLink>
          </View>
        </View>
        <View style={s.footerBottom}>
          <Text style={s.footerBottomText}>© {new Date().getFullYear()} Griper</Text>
          <Text style={s.footerBottomText}>UPI · Cards · Cash on delivery</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { marginTop: 50 },
  promises: {
    minHeight: 126,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingHorizontal: 32,
    flexDirection: "row",
    justifyContent: "center",
    gap: 74,
    alignItems: "center",
  },
  promise: { flexDirection: "row", alignItems: "center", gap: 13, minWidth: 250 },
  promiseTitle: { fontSize: 14, fontFamily: "GoogleSans_700Bold", textTransform: "uppercase", letterSpacing: 0.4 },
  promiseText: { fontSize: 11, marginTop: 5, maxWidth: 175, lineHeight: 16 },
  darkFooter: { backgroundColor: "#243B50", paddingTop: 42 },
  footerInner: { width: "100%", maxWidth: 1240, alignSelf: "center", flexDirection: "row", paddingHorizontal: 30, paddingBottom: 40, gap: 42 },
  footerColumn: { flex: 1, minWidth: 140 },
  brandColumn: { flex: 1.5, minWidth: 245 },
  brand: { color: "#fff", fontSize: 27, fontFamily: "GoogleSans_700Bold", letterSpacing: 4 },
  brandCopy: { color: "#D3DDE5", fontSize: 12, lineHeight: 19, marginTop: 13, maxWidth: 230 },
  columnTitle: { color: "#fff", fontSize: 14, fontFamily: "GoogleSans_600SemiBold", marginBottom: 12 },
  link: { paddingVertical: 4, alignSelf: "flex-start" },
  linkText: { color: "#D3DDE5", fontSize: 12 },
  footerBottom: { borderTopWidth: 1, borderTopColor: "#547084", minHeight: 58, paddingHorizontal: 30, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  footerBottomText: { color: "#D3DDE5", fontSize: 11 },
});
