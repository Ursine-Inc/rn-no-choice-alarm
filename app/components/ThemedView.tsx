import React from "react";
import { Text, View, type ViewProps } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedText, type ThemedTextProps } from "./ThemedText";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  textType?: ThemedTextProps["type"];
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  children,
  textType,
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background"
  );
  const wrapRecursively = (node: any): React.ReactNode => {
    if (node == null || typeof node === "boolean") return node;

    if (typeof node === "string" || typeof node === "number") {
      return <ThemedText type={textType}>{node}</ThemedText>;
    }

    if (Array.isArray(node)) {
      return node.map((n, i) => (
        <React.Fragment key={i}>{wrapRecursively(n)}</React.Fragment>
      ));
    }

    if (React.isValidElement(node)) {
      const elementType: any = node.type;
      // For built-in Text component and our ThemedText, don't recurse into children.
      if (elementType === Text || elementType === ThemedText) {
        return node;
      }

      // Only clone/recurse for simple container elements where nested raw
      // strings are likely (View and Fragment). Avoid cloning arbitrary
      // third-party or native components (Picker, etc.) which can break
      // internal native behavior.
      if (elementType === View || elementType === React.Fragment) {
        const childProps: any = node.props || {};
        const wrappedChildren = wrapRecursively(childProps.children);
        return React.cloneElement(node, { ...childProps }, wrappedChildren);
      }

      return node;
    }

    return node as React.ReactNode;
  };

  const safeChildren = wrapRecursively(children);

  return (
    <View style={[{ backgroundColor }, style]} {...otherProps}>
      {safeChildren}
    </View>
  );
}
