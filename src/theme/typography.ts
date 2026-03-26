export const typography = {
  fontFamily: {
    // Note: Assuming standard system font if Inter isn't linked via custom fonts in RN.
    // If Inter is added later, mapping can be updated here.
    display: 'System', 
    body: 'System'
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  }
};
