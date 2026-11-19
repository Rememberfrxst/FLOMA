import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { TextInput } from "./TextInput";
import { Text } from "./Text";
import { Icon } from "./StoreIcon";
import { useCart } from "@/context/CartContext";
import { useColors } from "@/hooks/useColors";
import { api, ApiCategory } from "@/services/api";

type HeaderProps = {
  query?: string;
  onChangeQuery?: (query: string) => void;
  onSearch?: (query: string) => void;
  back?: boolean;
  productName?: string;
};

/** Browser-only header inspired by familiar marketplace conventions, with Griper branding. */
export function DesktopStoreHeader({
  query,
  onChangeQuery,
  onSearch,
  back = false,
}: HeaderProps) {
  const c = useColors();
  const cart = useCart();
  const [localQuery, setLocalQuery] = useState("");
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const value = query ?? localQuery;

  useEffect(() => {
    let active = true;
    api.categories.list().then((data) => active && setCategories(data)).catch(() => {});
    return () => { active = false; };
  }, []);

  const roots = useMemo(
    () => categories.filter((cat) => !cat.parentId || !categories.some((parent) => parent.id === cat.parentId)),
    [categories],
  );
  const selectedRoot = roots.find((item) => item.id === openCategory || item.slug === openCategory);
  const children = selectedRoot
    ? categories.filter((item) => item.parentId === selectedRoot.id)
    : [];
  const visibleRoots = roots.slice(0, 6);
  const search = () => {
    const trimmed = value.trim();
    if (onSearch) onSearch(trimmed);
    else router.push({ pathname: "/products", params: trimmed ? { q: trimmed } : {} });
  };
  const browse = (category?: ApiCategory) => {
    setOpenCategory(null);
    router.push({
      pathname: "/products",
      params: category
        ? { category: category.slug, title: category.name }
        : { title: "All products" },
    });
  };

  return (
    <View style={[s.shell, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={s.utility}>
        <View style={s.utilityInner}>
          <Text style={[s.utilityMark, { color: c.mutedForeground }]}>GRIPER / CURATED MARKETPLACE</Text>
          <View style={s.utilityLinks}>
            <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}><Text style={[s.utilityLink, { color: c.mutedForeground }]}>Sign in / Account</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/help")}><Text style={[s.utilityLink, { color: c.mutedForeground }]}>Customer care</Text></TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={s.mainRow}>
        <TouchableOpacity accessibilityRole="link" accessibilityLabel="Go to home" onPress={() => router.replace("/")} style={s.logoWrap}>
          <Text style={[s.logo, { color: c.foreground }]}>GRIPER</Text>
        </TouchableOpacity>
        <View style={s.searchWrap}>
          <Icon name="search-outline" size={19} color={c.mutedForeground} />
          <TextInput
            accessibilityLabel="Search products"
            placeholder="Search products, categories and more"
            placeholderTextColor={c.mutedForeground}
            value={value}
            onChangeText={onChangeQuery || setLocalQuery}
            onSubmitEditing={search}
            returnKeyType="search"
            style={[s.searchInput, { color: c.foreground }]}
          />
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Search products" onPress={search} style={[s.searchButton, { backgroundColor: c.primary }]}>
            <Text style={{ color: c.primaryForeground, fontSize: 12, fontFamily: "GoogleSans_600SemiBold" }}>Search</Text>
          </TouchableOpacity>
        </View>
        <View style={s.actions}>
          {back && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.canGoBack() ? router.back() : router.replace("/")}><Icon name="arrow-back-outline" size={22} /></TouchableOpacity>}
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open wishlist" onPress={() => router.push("/wishlist")}><Icon name="heart-outline" size={24} color={c.foreground} /></TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Open bag, ${cart.itemCount} items`} onPress={() => router.push("/(tabs)/cart")} style={s.bag}>
            <Icon name="bag-handle-outline" size={24} color={c.foreground} />
            {cart.itemCount > 0 && <View style={[s.badge, { backgroundColor: c.accent }]}><Text style={s.badgeText}>{cart.itemCount > 9 ? "9+" : cart.itemCount}</Text></View>}
          </TouchableOpacity>
        </View>
      </View>
      <View style={[s.navRow, { borderTopColor: c.border }]}>
        <View style={s.navInner}>
          <TouchableOpacity style={s.navItem} onPress={() => browse()}><Text style={[s.navText, { color: c.foreground }]}>Shop all</Text></TouchableOpacity>
          {visibleRoots.map((item) => {
            const active = openCategory === item.id || openCategory === item.slug;
            return <TouchableOpacity key={item.id} style={s.navItem} onPress={() => setOpenCategory(active ? null : item.id)}>
              <Text style={[s.navText, { color: c.foreground }]}>{item.name}</Text><Icon name={active ? "chevron-up" : "chevron-down"} size={13} color={c.mutedForeground} />
            </TouchableOpacity>;
          })}
          <TouchableOpacity style={s.navItem} onPress={() => router.push("/offers")}><Text style={[s.navText, { color: c.accent }]}>Offers</Text></TouchableOpacity>
        </View>
      </View>
      {selectedRoot && (
        <View style={[s.mega, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={s.megaInner}>
            <View style={s.megaIntro}>
              <Text style={[s.megaTitle, { color: c.foreground }]}>{selectedRoot.name}</Text>
              <Text style={[s.megaCopy, { color: c.mutedForeground }]}>Explore our latest selection.</Text>
              <TouchableOpacity onPress={() => browse(selectedRoot)} style={[s.browseButton, { borderColor: c.foreground }]}><Text style={[s.browseButtonText, { color: c.foreground }]}>Shop {selectedRoot.name}</Text></TouchableOpacity>
            </View>
            <View style={s.megaLinks}>
              {(children.length ? children : roots).slice(0, 12).map((item) => <TouchableOpacity key={item.id} onPress={() => browse(item)} style={s.megaLink}><Text style={[s.megaLinkText, { color: c.foreground }]}>{item.name}</Text><Icon name="arrow-forward" size={13} color={c.mutedForeground} /></TouchableOpacity>)}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  shell: { borderBottomWidth: 1, zIndex: 100, elevation: 10 },
  utility: { borderBottomWidth: 1, borderBottomColor: "#EFF0F1", backgroundColor: "#FAFAFA" },
  utilityInner: { height: 29, width: "100%", maxWidth: 1280, alignSelf: "center", paddingHorizontal: 28, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  utilityMark: { fontSize: 9, letterSpacing: 1.2, fontFamily: "GoogleSans_600SemiBold" },
  utilityLinks: { flexDirection: "row", gap: 20 },
  utilityLink: { fontSize: 10, letterSpacing: 0.2 },
  mainRow: { minHeight: 67, width: "100%", maxWidth: 1280, alignSelf: "center", paddingHorizontal: 28, flexDirection: "row", alignItems: "center", gap: 36 },
  logoWrap: { paddingVertical: 12 },
  logo: { fontFamily: "GoogleSans_700Bold", fontSize: 25, letterSpacing: 3.2 },
  searchWrap: { height: 38, flex: 1, maxWidth: 570, borderWidth: 1, borderColor: "#AAB0B5", borderRadius: 3, flexDirection: "row", alignItems: "center", paddingLeft: 12, overflow: "hidden" },
  searchInput: { flex: 1, minWidth: 0, height: 37, paddingHorizontal: 9, fontSize: 12, outlineWidth: 0 } as any,
  searchButton: { alignSelf: "stretch", minWidth: 68, alignItems: "center", justifyContent: "center" },
  actions: { marginLeft: "auto", flexDirection: "row", gap: 19, alignItems: "center" },
  bag: { position: "relative" },
  badge: { position: "absolute", right: -9, top: -8, minWidth: 15, height: 15, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  badgeText: { color: "#fff", fontSize: 8, fontFamily: "GoogleSans_700Bold" },
  navRow: { minHeight: 42, borderTopWidth: 1 },
  navInner: { width: "100%", maxWidth: 1280, alignSelf: "center", paddingHorizontal: 28, height: 42, flexDirection: "row", alignItems: "center", gap: 29 },
  navItem: { height: "100%", flexDirection: "row", alignItems: "center", gap: 3 },
  navText: { fontSize: 12, fontFamily: "GoogleSans_600SemiBold", letterSpacing: 0.35, textTransform: "uppercase" },
  mega: { position: "absolute", top: "100%", left: 0, right: 0, borderTopWidth: 1, borderBottomWidth: 1, shadowColor: "#000", shadowOpacity: 0.13, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 15 },
  megaInner: { maxWidth: 1224, alignSelf: "center", minHeight: 176, paddingHorizontal: 28, paddingVertical: 24, flexDirection: "row", gap: 54 },
  megaIntro: { width: 230 },
  megaTitle: { fontSize: 17, fontFamily: "GoogleSans_700Bold" },
  megaCopy: { fontSize: 11, lineHeight: 17, marginTop: 7 },
  browseButton: { marginTop: 17, borderWidth: 1, paddingVertical: 8, paddingHorizontal: 11, alignSelf: "flex-start" },
  browseButtonText: { fontSize: 11, fontFamily: "GoogleSans_600SemiBold" },
  megaLinks: { flex: 1, flexDirection: "row", flexWrap: "wrap", alignContent: "flex-start", columnGap: 40, rowGap: 12 },
  megaLink: { width: "27%", flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  megaLinkText: { fontSize: 12 },
});
