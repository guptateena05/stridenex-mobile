import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { Search, ChevronDown, Check, X } from 'lucide-react-native';
import { colors } from '@/theme/colors';

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
    ? (value.length > 0 ? `${value.length} selected` : placeholder)
    : (value || placeholder);

  return (
    <>
      <TouchableOpacity 
        style={[styles.dropdownTrigger]}
        onPress={handleOpenDropdown}
      >
        <Text style={[styles.dropdownTriggerText, !value || (Array.isArray(value) && value.length === 0) ? styles.dropdownPlaceholder : {}]} numberOfLines={1}>
          {displayText}
        </Text>
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
              <Text style={styles.modalTitle}>{label ? `ALL ${label.toUpperCase()}` : "SELECT OPTION"}</Text>
              <TouchableOpacity onPress={() => setShowDropdown(false)} style={styles.closeBtn}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearchContainer}>
              <Search size={16} color="#94A3B8" style={styles.modalSearchIcon} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder={`Search...`}
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
            </View>

            <View style={{ flex: 1, minHeight: 200, position: 'relative' }}>
              <ScrollView style={styles.optionsList} keyboardShouldPersistTaps="handled">
                <TouchableOpacity
                  style={[styles.optionItem, (!value || (Array.isArray(value) && value.length === 0)) ? styles.optionItemActive : {}]}
                  onPress={clearSelection}
                >
                  <Text style={[styles.optionText, (!value || (Array.isArray(value) && value.length === 0)) ? styles.optionTextActive : {}]}>
                    Clear Selection
                  </Text>
                </TouchableOpacity>

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
                          •  {option}
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
                    { backgroundColor: hasPrev ? '#F1F5F9' : '#F8FAFC' }
                  ]}
                >
                  <Text style={[styles.modalPageButtonText, { color: hasPrev ? '#1E293B' : '#94A3B8' }]}>Previous</Text>
                </TouchableOpacity>
                
                <Text style={styles.modalPageInfoText}>
                  PAGE {page} OF {totalPages}
                </Text>

                <TouchableOpacity
                  disabled={!hasNext || loading}
                  onPress={() => loadData(page + 1, searchQuery)}
                  style={[
                    styles.modalPageButton, 
                    { backgroundColor: hasNext ? '#F1F5F9' : '#F8FAFC' }
                  ]}
                >
                  <Text style={[styles.modalPageButtonText, { color: hasNext ? '#1E293B' : '#94A3B8' }]}>Next</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setShowDropdown(false)}
              >
                <Text style={styles.applyButtonText}>APPLY FILTERS</Text>
              </TouchableOpacity>
            </View>
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
    height: 48,
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    paddingBottom: 20
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1
  },
  closeBtn: {
    padding: 4
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    paddingHorizontal: 16,
    height: 48,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  modalSearchIcon: {
    marginRight: 10
  },
  modalSearchInput: {
    flex: 1,
    height: '100%',
    color: '#1E293B',
    fontSize: 15
  },
  optionsList: {
    paddingHorizontal: 20
  },
  optionItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  optionItemActive: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginHorizontal: -12
  },
  optionText: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '600'
  },
  optionTextActive: {
    color: colors.primary.DEFAULT
  },
  modalPaginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  modalPageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  modalPageButtonText: {
    fontSize: 14,
    fontWeight: '600'
  },
  modalPageInfoText: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '700'
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
