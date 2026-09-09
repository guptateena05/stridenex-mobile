import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { Search, ChevronDown, Check, X } from 'lucide-react-native';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

interface MasterDropdownModalProps {
  label?: string;
  placeholder: string;
  value: string | string[];
  onChange: (val: any) => void;
  fetchData: (page: number, search: string) => Promise<any>;
  multiSelect?: boolean;
}

export const MasterDropdownModal: React.FC<MasterDropdownModalProps> = ({
  label,
  placeholder,
  value,
  onChange,
  fetchData,
  multiSelect = false
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const lastSearchRef = useRef("");

  const loadData = async (pageNum = 1, searchTxt = "") => {
    try {
      setLoading(true);
      const res = await fetchData(pageNum, searchTxt);
      const raw = res?.data ?? res?.message?.data ?? res?.message ?? res;
      const arr = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
      
      const newOptions = arr.map((item: any) => item.name || item.value || (typeof item === 'string' ? item : '')).filter(Boolean);
      setOptions(newOptions);

      const paginationData = res?.pagination || res?.message?.pagination;
      if (paginationData) {
        setHasNext(paginationData.has_next === true);
        setHasPrev(paginationData.has_prev === true);
        const totalCount = paginationData.total_count || 0;
        const pageSize = paginationData.page_size || 20;
        setTotalPages(Math.ceil(totalCount / pageSize) || 1);
      } else {
        setHasNext(arr.length === 20);
        setHasPrev(pageNum > 1);
        setTotalPages(pageNum > 1 || arr.length === 20 ? pageNum + (arr.length === 20 ? 1 : 0) : 1);
      }
      setPage(pageNum);
    } catch (err) {
      console.error(`Error loading ${label}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDropdown = () => {
    setSearchQuery("");
    lastSearchRef.current = "";
    setShowDropdown(true);
    loadData(1, "");
  };

  useEffect(() => {
    if (!showDropdown) return;
    const delayDebounce = setTimeout(() => {
      if (searchQuery !== lastSearchRef.current) {
        lastSearchRef.current = searchQuery;
        loadData(1, searchQuery);
      }
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, showDropdown]);

  const toggleSelection = (option: string) => {
    if (multiSelect) {
      let currentVal = Array.isArray(value) ? [...value] : [];
      if (currentVal.includes(option)) {
        currentVal = currentVal.filter(v => v !== option);
      } else {
        currentVal.push(option);
      }
      onChange(currentVal);
    } else {
      onChange(option);
      setShowDropdown(false);
    }
  };

  const clearSelection = () => {
    onChange(multiSelect ? [] : "");
    setShowDropdown(false);
  };

  const displayText = Array.isArray(value) 
    ? (value.length > 0 ? value.join(', ') : placeholder)
    : (value || placeholder);

  return (
    <>
      <TouchableOpacity 
        style={[styles.dropdownTrigger]}
        onPress={handleOpenDropdown}
      >
        {multiSelect && Array.isArray(value) && value.length > 0 ? (
          <View style={styles.multiSelectContainer}>
            {value.map((val: string) => (
              <View key={val} style={[styles.tag, { backgroundColor: 'rgba(255, 107, 0, 0.1)' }]}>
                <Text style={[styles.tagText, { color: '#FF6F00' }]}>{val}</Text>
                <TouchableOpacity onPress={() => toggleSelection(val)}>
                  <Text style={[styles.tagRemove, { color: '#FF6F00' }]}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <Text style={[styles.dropdownTriggerText, !value || (Array.isArray(value) && value.length === 0) ? styles.dropdownPlaceholder : {}]} numberOfLines={1}>
            {displayText}
          </Text>
        )}
        <ChevronDown size={14} color="#94A3B8" />
      </TouchableOpacity>

      <Modal
        visible={showDropdown}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDropdown(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {label || "Option"}</Text>
              <TouchableOpacity onPress={() => setShowDropdown(false)} style={styles.closeBtn}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                placeholderTextColor="#64748b"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
            </View>

            <View style={{ flex: 1, minHeight: 200, position: 'relative' }}>
              <ScrollView style={styles.optionsList} keyboardShouldPersistTaps="handled">


                {options.map((option) => {
                  const isActive = multiSelect ? Array.isArray(value) && value.includes(option) : value === option;
                  return (
                    <TouchableOpacity
                      key={option}
                      style={[styles.optionItem, isActive ? styles.optionItemActive : {}]}
                      onPress={() => toggleSelection(option)}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <Text style={[styles.optionText, isActive ? styles.optionTextActive : {}]}>
                          {option}
                        </Text>
                      </View>
                      {isActive && <Check size={16} color={colors.primary.DEFAULT} />}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {loading && (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255, 255, 255, 0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 10 }]}>
                  <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
                </View>
              )}
            </View>

            {(hasNext || hasPrev || totalPages > 1) && (
              <View style={styles.modalPaginationContainer}>
                <TouchableOpacity
                  disabled={!hasPrev || loading}
                  onPress={() => loadData(page - 1, searchQuery)}
                  style={[
                    styles.modalPageButton, 
                    { backgroundColor: hasPrev ? '#FF6F00' : '#cbd5e1', opacity: loading ? 0.5 : 1, borderWidth: 0 }
                  ]}
                >
                  <Text style={[styles.modalPageButtonText, { color: hasPrev ? '#ffffff' : '#64748b' }]}>Previous</Text>
                </TouchableOpacity>
                
                <Text style={styles.modalPageInfoText}>
                  Page {page} of {totalPages}
                </Text>

                <TouchableOpacity
                  disabled={!hasNext || loading}
                  onPress={() => loadData(page + 1, searchQuery)}
                  style={[
                    styles.modalPageButton, 
                    { backgroundColor: hasNext ? '#FF6F00' : '#cbd5e1', opacity: loading ? 0.5 : 1, borderWidth: 0 }
                  ]}
                >
                  <Text style={[styles.modalPageButtonText, { color: hasNext ? '#ffffff' : '#64748b' }]}>Next</Text>
                </TouchableOpacity>
              </View>
            )}

          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  dropdownTrigger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
    elevation: 2,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8
  },
  dropdownTriggerText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
    flex: 1
  },
  multiSelectContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: spacing.xs,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  tagText: {
    fontSize: typography.fontSize.xs,
    marginRight: 4,
    fontFamily: typography.fontFamily.display,
  },
  tagRemove: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  dropdownPlaceholder: {
    color: '#94A3B8',
    fontWeight: '400'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: 400,
    height: 550
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: '#1E293B',
    fontFamily: typography.fontFamily.display
  },
  closeBtn: {
    padding: spacing.xs
  },
  searchContainer: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.display,
    color: '#1E293B'
  },
  optionsList: {
    paddingHorizontal: 0
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  optionItemActive: {
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
  },
  optionText: {
    fontSize: typography.fontSize.sm,
    flex: 1,
    color: '#1E293B',
    fontFamily: typography.fontFamily.display
  },
  optionTextActive: {
    color: '#FF6F00'
  },
  modalPaginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0'
  },
  modalPageButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalPageButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600'
  },
  modalPageInfoText: {
    fontSize: typography.fontSize.sm,
    color: '#1E293B'
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingBottom: 20
  },
  applyButton: {
    backgroundColor: '#FF6F00',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center'
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5
  }
});
