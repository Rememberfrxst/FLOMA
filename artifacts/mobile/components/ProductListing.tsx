import React, { useCallback, useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions } from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "./Text";
import { StoreHeader } from "./StoreHeader";
import { ProductGrid, LoadState } from "./ShopUI";
import ProductFiltersBar, { ProductFilters } from "./ProductFilters";
import { useColors } from "@/hooks/useColors";
import { useDesktopWeb } from "@/hooks/useDesktopWeb";
import { DesktopStoreFooter } from "./DesktopStoreFooter";
import { Icon } from "./StoreIcon";
import { api, ApiCategory, mapApiProduct } from "@/services/api";
import type { Product } from "@/constants/data";
export default function ProductListing({
  categoryOverride,
  title: fixedTitle,
  defaultSort = "popular",
  embedded = false,
}: {
  categoryOverride?: string;
  title?: string;
  defaultSort?: string;
  embedded?: boolean;
}) {
  const c = useColors(),
    insets = useSafeAreaInsets(),
    desktop = useDesktopWeb(),
    { width } = useWindowDimensions(),
    params = useLocalSearchParams<{
      q?: string;
      category?: string;
      title?: string;
      sort?: string;
      slug?: string;
    }>(),
    category = categoryOverride ?? params.category ?? params.slug ?? "";
  const [query, setQuery] = useState(params.q || ""),
    [filters, setFilters] = useState<ProductFilters>({
      sort: params.sort || defaultSort,
    }),
    [page, setPage] = useState(1),
    [items, setItems] = useState<Product[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(false),
    [more, setMore] = useState(false),
    [retry, setRetry] = useState(0),
    [categoryTitle, setCategoryTitle] = useState(""),
    [categories, setCategories] = useState<ApiCategory[]>([]),
    [openFilter, setOpenFilter] = useState<string | null>("category");
  useEffect(() => {
    api.categories
      .list()
      .then((cats) => {
        setCategories(cats);
        setCategoryTitle(
          cats.find((cat) => cat.id === category || cat.slug === category)
            ?.name || "",
        );
      })
      .catch(() => {});
  }, [category]);
  useEffect(
    () => setPage(1),
    [
      query,
      category,
      filters.sort,
      filters.minPrice,
      filters.maxPrice,
      filters.inStock,
    ],
  );
  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      setError(false);
      const timer = setTimeout(
        () =>
          api.products
            .list({
              q: query,
              category,
              sort: filters.sort,
              page,
              limit: 20,
              ...(filters.minPrice !== undefined
                ? { minPrice: filters.minPrice }
                : {}),
              ...(filters.maxPrice !== undefined
                ? { maxPrice: filters.maxPrice }
                : {}),
              ...(filters.inStock ? { inStock: true } : {}),
            })
            .then((result) => {
              if (active) {
                setItems((prev) =>
                  page === 1
                    ? result.data.map(mapApiProduct)
                    : [...prev, ...result.data.map(mapApiProduct)],
                );
                setMore(result.data.length === 20);
              }
            })
            .catch(() => {
              if (active) setError(true);
            })
            .finally(() => {
              if (active) setLoading(false);
            }),
        220,
      );
      return () => {
        active = false;
        clearTimeout(timer);
      };
    }, [
      query,
      category,
      filters.sort,
      filters.minPrice,
      filters.maxPrice,
      filters.inStock,
      page,
      retry,
    ]),
  );
  const title = query
    ? `Results for “${query}”`
    : fixedTitle || params.title || categoryTitle || "All products";
  const roots = categories.filter(
    (cat) => !cat.parentId || !categories.some((parent) => parent.id === cat.parentId),
  );
  const applyPrice = (minPrice?: number, maxPrice?: number) =>
    setFilters((current) => ({ ...current, minPrice, maxPrice }));
  const chooseCategory = (item?: ApiCategory) =>
    router.push({
      pathname: "/products",
      params: item
        ? { category: item.slug, title: item.name }
        : { title: "All products" },
    });

  if (desktop) {
    const sortLabel =
      filters.sort === "newest"
        ? "Newest first"
        : filters.sort === "price_asc"
          ? "Price: low to high"
          : filters.sort === "price_desc"
            ? "Price: high to low"
            : "Recommended";
    const desktopColumns = width >= 1540 ? 4 : 3;
    const section = (key: string, label: string, content: React.ReactNode) => (
      <View style={[sDesktop.filterSection, { borderColor: c.border }]} key={key}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityState={{ expanded: openFilter === key }}
          onPress={() => setOpenFilter((current) => (current === key ? null : key))}
          style={sDesktop.filterHeading}
        >
          <Text style={[sDesktop.filterHeadingText, { color: c.foreground }]}>{label}</Text>
          <Icon name={openFilter === key ? "remove" : "add"} size={17} color={c.mutedForeground} />
        </TouchableOpacity>
        {openFilter === key && <View style={sDesktop.filterContent}>{content}</View>}
      </View>
    );
    return (
      <View testID="product-listing" style={{ flex: 1, backgroundColor: c.background }}>
        <StoreHeader
          back={!embedded}
          query={query}
          onChangeQuery={setQuery}
          onSearch={setQuery}
        />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 0 }}>
          <View style={sDesktop.page}>
            <Text style={[sDesktop.breadcrumb, { color: c.mutedForeground }]}>Home  /  Shop  /  {title}</Text>
            <View style={sDesktop.titleRow}>
              <View>
                <Text style={[sDesktop.title, { color: c.foreground }]}>{title}</Text>
                <Text style={[sDesktop.count, { color: c.mutedForeground }]}>
                  {loading ? "Finding the right pieces…" : `${items.length}${more ? "+" : ""} styles available`}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setFilters({ sort: "popular" })}
                style={[sDesktop.clearButton, { borderColor: c.border }]}
              >
                <Icon name="refresh-outline" size={15} color={c.foreground} />
                <Text style={[sDesktop.clearText, { color: c.foreground }]}>Clear filters</Text>
              </TouchableOpacity>
            </View>
            <View style={sDesktop.body}>
              <View style={[sDesktop.sidebar, { backgroundColor: c.card, borderColor: c.border }]}>
                <View style={sDesktop.sidebarTop}>
                  <Text style={[sDesktop.refine, { color: c.foreground }]}>Refine by</Text>
                  <TouchableOpacity onPress={() => setFilters({ sort: "popular" })}><Text style={[sDesktop.resetText, { color: c.link }]}>Reset</Text></TouchableOpacity>
                </View>
                {section(
                  "category",
                  "Category",
                  <>
                    <TouchableOpacity onPress={() => chooseCategory()} style={sDesktop.filterChoice}>
                      <Icon name={!category ? "radio-button-on" : "radio-button-off"} size={16} color={!category ? c.foreground : c.mutedForeground} />
                      <Text style={[sDesktop.choiceText, { color: c.foreground }]}>All products</Text>
                    </TouchableOpacity>
                    {roots.map((item) => {
                      const selected = category === item.id || category === item.slug;
                      return <TouchableOpacity key={item.id} onPress={() => chooseCategory(item)} style={sDesktop.filterChoice}>
                        <Icon name={selected ? "radio-button-on" : "radio-button-off"} size={16} color={selected ? c.foreground : c.mutedForeground} />
                        <Text style={[sDesktop.choiceText, { color: c.foreground }]}>{item.name}</Text>
                      </TouchableOpacity>;
                    })}
                  </>,
                )}
                {section(
                  "price",
                  "Price",
                  <>
                    {[
                      { label: "Any price", min: undefined, max: undefined },
                      { label: "Under ₹1,000", min: undefined, max: 1000 },
                      { label: "₹1,000 – ₹3,000", min: 1000, max: 3000 },
                      { label: "₹3,000 & above", min: 3000, max: undefined },
                    ].map((band) => {
                      const selected = filters.minPrice === band.min && filters.maxPrice === band.max;
                      return <TouchableOpacity key={band.label} onPress={() => applyPrice(band.min, band.max)} style={sDesktop.filterChoice}>
                        <Icon name={selected ? "radio-button-on" : "radio-button-off"} size={16} color={selected ? c.foreground : c.mutedForeground} />
                        <Text style={[sDesktop.choiceText, { color: c.foreground }]}>{band.label}</Text>
                      </TouchableOpacity>;
                    })}
                  </>,
                )}
                {section(
                  "availability",
                  "Availability",
                  <TouchableOpacity
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: !!filters.inStock }}
                    onPress={() => setFilters((current) => ({ ...current, inStock: !current.inStock }))}
                    style={sDesktop.filterChoice}
                  >
                    <Icon name={filters.inStock ? "checkbox" : "square-outline"} size={18} color={filters.inStock ? c.foreground : c.mutedForeground} />
                    <Text style={[sDesktop.choiceText, { color: c.foreground }]}>In stock only</Text>
                  </TouchableOpacity>,
                )}
              </View>
              <View style={sDesktop.results}>
                <View style={[sDesktop.controlBar, { backgroundColor: c.card, borderColor: c.border }]}>
                  <Text style={[sDesktop.controlNote, { color: c.mutedForeground }]}>Curated selections, updated regularly</Text>
                  <View style={sDesktop.sortControls}>
                    <Text style={[sDesktop.sortLabel, { color: c.mutedForeground }]}>Sort by</Text>
                    {[
                      { key: "popular", label: "Recommended" },
                      { key: "newest", label: "Newest" },
                      { key: "price_asc", label: "Price ↑" },
                    ].map((sort) => <TouchableOpacity key={sort.key} onPress={() => setFilters((current) => ({ ...current, sort: sort.key === "price_asc" && current.sort === "price_asc" ? "price_desc" : sort.key }))} style={[sDesktop.sortButton, { borderColor: filters.sort === sort.key || (sort.key === "price_asc" && filters.sort === "price_desc") ? c.foreground : c.border }]}>
                      <Text style={[sDesktop.sortText, { color: c.foreground }]}>{sort.label}</Text>
                    </TouchableOpacity>)}
                  </View>
                </View>
                <Text style={[sDesktop.activeSort, { color: c.mutedForeground }]}>Showing: {sortLabel}</Text>
                {loading && page === 1 ? (
                  <LoadState loading />
                ) : error ? (
                  <LoadState error="load" retry={() => setRetry((n) => n + 1)} />
                ) : items.length ? (
                  <ProductGrid products={items} columns={desktopColumns} desktop />
                ) : (
                  <LoadState empty="No products match your search" />
                )}
                {more && !error && (
                  <TouchableOpacity onPress={() => setPage((p) => p + 1)} disabled={loading} style={[sDesktop.loadMore, { borderColor: c.foreground }]}>
                    <Text style={[sDesktop.loadMoreText, { color: c.foreground }]}>{loading ? "Loading…" : "Load more styles"}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
          <DesktopStoreFooter />
        </ScrollView>
      </View>
    );
  }
  return (
    <View
      testID="product-listing"
      style={{ flex: 1, backgroundColor: c.background, paddingTop: insets.top }}
    >
      <StoreHeader
        back={!embedded}
        query={query}
        onChangeQuery={setQuery}
        onSearch={setQuery}
      />
      <Text
        style={{
          paddingHorizontal: 12,
          paddingTop: 8,
          paddingBottom: 12,
          fontSize: 17,
          fontFamily: "GoogleSans_600SemiBold",
          color: c.foreground,
        }}
      >
        {title}
      </Text>
      <ProductFiltersBar value={filters} onChange={setFilters} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 6, paddingBottom: 25 }}
      >
        {loading && page === 1 ? (
          <LoadState loading />
        ) : error ? (
          <LoadState error="load" retry={() => setRetry((n) => n + 1)} />
        ) : items.length ? (
          <ProductGrid products={items} />
        ) : (
          <LoadState empty="No products match your search" />
        )}
        {more && !error && (
          <TouchableOpacity
            onPress={() => setPage((p) => p + 1)}
            disabled={loading}
            style={{ padding: 20, alignItems: "center" }}
          >
            <Text style={{ color: c.foreground, fontSize: 13 }}>
              {loading ? "Loading…" : "Load more products"}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const sDesktop = StyleSheet.create({
  page: { width: "100%", maxWidth: 1280, alignSelf: "center", paddingHorizontal: 28, paddingTop: 23, paddingBottom: 36 },
  breadcrumb: { fontSize: 11, letterSpacing: 0.2 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingTop: 15, paddingBottom: 24 },
  title: { fontSize: 26, fontFamily: "GoogleSans_700Bold", letterSpacing: -0.2 },
  count: { fontSize: 12, marginTop: 6 },
  clearButton: { height: 34, paddingHorizontal: 12, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  clearText: { fontSize: 11, fontFamily: "GoogleSans_600SemiBold" },
  body: { flexDirection: "row", alignItems: "flex-start", gap: 24 },
  sidebar: { width: 228, borderWidth: 1, flexShrink: 0 },
  sidebarTop: { height: 52, paddingHorizontal: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  refine: { fontSize: 14, fontFamily: "GoogleSans_700Bold" },
  resetText: { fontSize: 11, fontFamily: "GoogleSans_600SemiBold" },
  filterSection: { borderTopWidth: 1, paddingHorizontal: 15 },
  filterHeading: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  filterHeadingText: { fontSize: 12, fontFamily: "GoogleSans_600SemiBold", textTransform: "uppercase", letterSpacing: 0.45 },
  filterContent: { paddingBottom: 13, gap: 8 },
  filterChoice: { minHeight: 24, flexDirection: "row", alignItems: "center", gap: 8 },
  choiceText: { fontSize: 12, flexShrink: 1 },
  results: { flex: 1, minWidth: 0 },
  controlBar: { minHeight: 52, borderWidth: 1, paddingHorizontal: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 13 },
  controlNote: { fontSize: 11, flex: 1 },
  sortControls: { flexDirection: "row", alignItems: "center", gap: 6 },
  sortLabel: { fontSize: 11, marginRight: 2 },
  sortButton: { minHeight: 28, paddingHorizontal: 9, borderWidth: 1, justifyContent: "center" },
  sortText: { fontSize: 10, fontFamily: "GoogleSans_500Medium" },
  activeSort: { fontSize: 11, paddingTop: 14, paddingBottom: 13 },
  loadMore: { height: 42, minWidth: 170, paddingHorizontal: 18, alignSelf: "center", marginTop: 29, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  loadMoreText: { fontSize: 12, fontFamily: "GoogleSans_600SemiBold" },
});
