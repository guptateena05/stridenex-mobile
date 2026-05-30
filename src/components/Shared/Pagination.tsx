import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors } from '@/theme/colors';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  activeColor?: string;
  disabledColor?: string;
  style?: ViewStyle;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  activeColor = colors.purple[600],
  disabledColor = '#94A3B8',
  style,
}) => {
  if (totalPages <= 1) return null;

  return (
    <View style={[styles.paginationRow, style]}>
      <TouchableOpacity
        disabled={currentPage === 1}
        onPress={() => onPageChange(currentPage - 1)}
        style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
      >
        <ChevronLeft size={16} color={currentPage === 1 ? disabledColor : activeColor} />
        <Text style={[styles.pageBtnText, { color: currentPage === 1 ? disabledColor : activeColor }]}>Prev</Text>
      </TouchableOpacity>

      <Text style={styles.pageIndicator}>
        Page {currentPage} of {totalPages}
      </Text>

      <TouchableOpacity
        disabled={currentPage === totalPages}
        onPress={() => onPageChange(currentPage + 1)}
        style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
      >
        <Text style={[styles.pageBtnText, { color: currentPage === totalPages ? disabledColor : activeColor }]}>Next</Text>
        <ChevronRight size={16} color={currentPage === totalPages ? disabledColor : activeColor} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  pageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFF',
  },
  pageBtnDisabled: {
    opacity: 0.5,
    borderColor: '#E2E8F0',
  },
  pageBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  pageIndicator: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
});
