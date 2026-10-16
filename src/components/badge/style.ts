import { StyleSheet } from 'react-native';

import { Colors, Palette, Radius, Spacing, type ThemeColor } from '@app-experience/theme';

import type { BadgeType } from './interface';

const { light } = Colors;

export const styles = StyleSheet.create({
  // Padding, not a height, so a longer Hindi label grows the pill instead of
  // clipping. Each type sets how much.
  base: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
    borderRadius: Radius.pill,
  },
  label: { flexShrink: 1 },
});

/** Each type's fill, edge and padding. */
export const typeStyles = StyleSheet.create({
  // 30pt tall on the caption's 16pt line, as drawn on the band.
  brand: {
    paddingVertical: Spacing.one - 1,
    paddingHorizontal: Spacing.one + Spacing.half / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    boxShadow: 'inset 0px 0px 0px 1px rgba(255, 255, 255, 0.26)',
  },
  // The design's tag: 24pt tall, a little more room after the label than before.
  tint: {
    paddingVertical: Spacing.half,
    paddingLeft: Spacing.one,
    paddingRight: Spacing.one + Spacing.half / 2,
    backgroundColor: light.brandTint,
  },
  outline: {
    paddingVertical: Spacing.half,
    paddingLeft: Spacing.one,
    paddingRight: Spacing.one + Spacing.half / 2,
    boxShadow: `inset 0px 0px 0px 1.5px ${light.lineStrong}`,
  },
});

type TypeLook = {
  label: ThemeColor;
  icon: ThemeColor | keyof typeof Palette;
  /** The band's badges draw their icon a step larger than a tag's. */
  iconSize: number;
};

/** Each type's label and icon colours, and its icon size. */
export const typeLooks = {
  brand: { label: 'onBrand', icon: 'sun', iconSize: 14 },
  tint: { label: 'brandText', icon: 'brandText', iconSize: 12 },
  outline: { label: 'ink2', icon: 'ink2', iconSize: 12 },
} as const satisfies Record<BadgeType, TypeLook>;
