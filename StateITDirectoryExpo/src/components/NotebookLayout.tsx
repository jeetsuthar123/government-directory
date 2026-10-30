import React from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../theme/colors";

function Brand() {
  return (
    <View style={styles.brandRow}>
      <View style={styles.logoMark}>
        <View style={styles.logoA} />
        <View style={styles.logoB} />
        <View style={styles.logoC} />
      </View>
      <Text style={styles.brandText}>
        D<Text style={{ color: COLORS.blue }}>o</Text>IT.C
      </Text>
    </View>
  );
}

import type { NotebookLayoutProps } from "../types/ui";

export default function NotebookLayout({
  children,
  active,
  items,
  onNavigate,
  onHome,
  showNavigation = true,
}: NotebookLayoutProps) {
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back to home"
          onPress={onHome}
          style={styles.headerIcon}
        >
          <Ionicons name="arrow-back" size={23} color={COLORS.ink} />
        </Pressable>
        <Brand />
        <View style={{ flex: 1 }} />
        <View style={styles.crest}>
          <Text style={styles.crestTop}>RAJ</Text>
          <Text style={styles.crestBottom}>IT</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Home"
          onPress={onHome}
          style={styles.headerIcon}
        >
          <Ionicons name="home-outline" size={25} color={COLORS.ink} />
        </Pressable>
      </View>
      <View style={styles.bookArea}>
        <View style={styles.book}>
          <View pointerEvents="none" style={styles.spiral}>
            {Array.from({ length: 25 }, (_, i) => (
              <View key={i} style={styles.ring} />
            ))}
          </View>
          <View style={styles.paper}>{children}</View>
        </View>
        {showNavigation && (
          <ScrollView
            style={styles.tabs}
            contentContainerStyle={styles.tabList}
            showsVerticalScrollIndicator={false}
          >
            {items.map((item) => {
              const selected = active === item.key;
              return (
                <Pressable
                  key={item.key}
                  onPress={() => onNavigate(item.key)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[
                    styles.tab,
                    {
                      backgroundColor: item.color,
                      opacity: selected ? 1 : 0.84,
                      transform: [{ translateX: selected ? -4 : 0 }],
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={18}
                    color="#fff"
                  />
                  <View style={styles.tabLabelSlot}>
                    <Text numberOfLines={1} style={styles.tabText}>
                      {item.label}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.peach },
  header: {
    height: 55,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    gap: 5,
  },
  headerIcon: { paddingHorizontal: 7, paddingVertical: 6 },
  brandRow: { flexDirection: "row", alignItems: "center" },
  logoMark: { width: 28, height: 28, marginRight: 3 },
  logoA: {
    position: "absolute",
    left: 2,
    top: 1,
    width: 13,
    height: 13,
    borderRadius: 2,
    backgroundColor: COLORS.blue,
  },
  logoB: {
    position: "absolute",
    left: 14,
    top: 5,
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: COLORS.cyan,
  },
  logoC: {
    position: "absolute",
    left: 2,
    top: 15,
    width: 12,
    height: 12,
    borderWidth: 2,
    borderColor: COLORS.blue,
    borderRadius: 2,
  },
  brandText: {
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: -1,
    color: "#333",
  },
  crest: {
    width: 39,
    height: 39,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORS.blueDark,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9e7d7",
    marginHorizontal: 4,
  },
  crestTop: { fontSize: 7, color: COLORS.blueDark, fontWeight: "900" },
  crestBottom: { fontSize: 10, color: "#d13b3b", fontWeight: "900" },
  bookArea: {
    flex: 1,
    flexDirection: "row",
    paddingTop: 3,
    paddingBottom: 8,
    paddingLeft: 16,
    paddingRight: 4,
  },
  book: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 1, height: 2 },
  },
  paper: {
    flex: 1,
    marginLeft: 20,
    borderRadius: 7,
    overflow: "hidden",
    backgroundColor: COLORS.paleBlue,
  },
  spiral: {
    position: "absolute",
    left: -15,
    top: 12,
    bottom: 12,
    width: 19,
    justifyContent: "space-around",
    zIndex: 2,
  },
  ring: {
    width: 21,
    height: 8,
    borderWidth: 1.4,
    borderColor: "#6e7779",
    borderRadius: 6,
    backgroundColor: "#f6f3ef",
  },
  tabs: { width: 48, flexGrow: 0 },
  tabList: { gap: 5, paddingTop: 30, paddingBottom: 8, paddingLeft: 5 },
  tab: {
    height: 90,
    borderTopRightRadius: 9,
    borderBottomRightRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
    gap: 8,
    elevation: 2,
  },
  tabLabelSlot: {
    width: 40,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
    transform: [{ rotate: "90deg" }],
    position: "absolute",
    left: -11,
    top: 21,
    width: 62,
    height: 12,
    textAlign: "center",
  },
});
