import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  FlatList, TextInput, ActivityIndicator, ScrollView,
  Alert, Platform, Switch, Linking
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import * as DocumentPicker from '@react-native-documents/picker';
import { UploadCloud, FileText, CheckCircle2, Trash2, Eye, Paperclip } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { api } from '@/api/api.services';

export interface FormField {
  fieldname: string;
  label: string;
  fieldtype: string;
  required?: boolean;
  placeholder?: string;
  layout?: 'half' | 'full';
  apiEndpoint?: string;
  apiParams?: any;
  mapOptions?: (data: any) => Array<{ value: string; label: string }>;
  disabled?: boolean;
  read_only?: boolean;
  multiSelect?: boolean;
  options?: string[];
  maxLength?: number;
  accept?: string;
  description?: string;
  inputClassName?: string;
  allowCustom?: boolean;
  customPlaceholder?: string;
  minLetters?: number;
  hidden?: boolean;
  minDate?: Date;
  maxDate?: Date;
  textTransform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
  testTransform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
}

interface DynamicFieldProps {
  field: FormField;
  value: any;
  onChange: (name: string, value: any) => void;
  onCreateCustomValue?: (value: string) => Promise<void>;
  error?: string;
  accentColor?: string;
}

export default function DynamicField({ field, value, onChange, onCreateCustomValue, error, accentColor: accentColorProp }: DynamicFieldProps) {
  const [options, setOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [filteredOptions, setFilteredOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const searchInputRef = useRef<TextInput>(null);
  const customInputRef = useRef<TextInput>(null);
  const fetchedRef = useRef<boolean>(false);
  const lastSearchTermRef = useRef<string>('');

  const hasOthersOption = field.allowCustom === true;

  const getColor = (colorObj: any) => {
    if (typeof colorObj === 'string') return colorObj;
    return colorObj?.DEFAULT || colorObj?.light || '#000000';
  };

  const backgroundColor = getColor(colors.background);
  const accentColor = accentColorProp || getColor(colors.accent);
  const textPrimary = getColor(colors.text?.primary);
  const textSecondary = getColor(colors.text?.secondary);
  const borderColor = getColor(colors.border);
  const errorColor = getColor(colors.error);
  const successColor = getColor(colors.success);

  const fieldRef = useRef(field);
  useEffect(() => {
    fieldRef.current = field;
  }, [field]);

  const fetchOptions = useCallback(async (pageNum = 1, searchTxt = '') => {
    const currentField = fieldRef.current;
    if (!currentField.apiEndpoint) return;
    if (currentField.disabled) return;
    if (currentField.apiEndpoint.includes('master.get_master_data') && (!currentField.apiParams || !currentField.apiParams.doctype)) {
      return;
    }

    setLoading(true);
    setFetchError('');
    try {
      let response;
      let responseData;

      if (currentField.apiEndpoint.includes('master.get_master_data')) {
        const body = {
          ...(currentField.apiParams || {}),
          search: searchTxt,
          page: pageNum
        };
        const doctype = currentField.apiParams?.doctype || '';
        const separator = currentField.apiEndpoint.includes('?') ? '&' : '?';
        const url = `${currentField.apiEndpoint}${separator}page=${pageNum}&search=${encodeURIComponent(searchTxt)}&doctype=${doctype}`;
        response = await api.post(url, body);
        responseData = response.data;
      } else {
        response = await api.get(currentField.apiEndpoint, {
          params: {
            ...(currentField.apiParams || {}),
            page: pageNum,
            page_size: 20,
            search: searchTxt
          }
        });
        responseData = response.data;
      }

      let data = [];
      let nextFlag = false;
      let prevFlag = false;
      let totalPgs = 1;

      if (responseData) {
        if (responseData.pagination) {
          data = responseData.data || [];
          nextFlag = responseData.pagination.has_next === true;
          prevFlag = responseData.pagination.has_prev === true;
          const totalCount = responseData.pagination.total_count || 0;
          const pageSize = responseData.pagination.page_size || 20;
          totalPgs = Math.ceil(totalCount / pageSize) || 1;
        } else if (responseData.data && responseData.data.pagination) {
          data = responseData.data.data || [];
          const pag = responseData.data.pagination;
          nextFlag = pag.has_next === true;
          prevFlag = pag.has_prev === true;
          const totalCount = pag.total_count || 0;
          const pageSize = pag.page_size || 20;
          totalPgs = Math.ceil(totalCount / pageSize) || 1;
        } else if (responseData.message && responseData.message.pagination) {
          data = responseData.message.data || [];
          const pag = responseData.message.pagination;
          nextFlag = pag.has_next === true;
          prevFlag = pag.has_prev === true;
          const totalCount = pag.total_count || 0;
          const pageSize = pag.page_size || 20;
          totalPgs = Math.ceil(totalCount / pageSize) || 1;
        } else {
          if (Array.isArray(responseData)) {
            data = responseData;
          } else if (responseData.data && Array.isArray(responseData.data)) {
            data = responseData.data;
          } else if (responseData.data?.data && Array.isArray(responseData.data.data)) {
            data = responseData.data.data;
          } else if (responseData.message && Array.isArray(responseData.message)) {
            data = responseData.message;
          } else if (responseData.message?.data && Array.isArray(responseData.message.data)) {
            data = responseData.message.data;
          } else if (responseData.message?.message && Array.isArray(responseData.message.message)) {
            data = responseData.message.message;
          }
        }
      }

      let mappedOptions = [];
      if (data.length > 0) {
        if (currentField.mapOptions) {
          mappedOptions = currentField.mapOptions(data);
        } else {
          mappedOptions = data.map((item: any) => {
            const val = item.name || item.value || item.specialization || item.skill || item.designation || item.round || item.domain || item.sub_domain || (typeof item === 'string' ? item : '');
            const lbl = item.label || item.name || item.specialization || item.skill || item.designation || item.round || item.domain || item.sub_domain || item.district_name || (typeof item === 'string' ? item : '');
            return {
              value: val,
              label: lbl
            };
          });
        }
      }

      setOptions(mappedOptions);
      setFilteredOptions(mappedOptions);
      if (mappedOptions.length === 0) {
        setFetchError('No options available');
      }

      setHasNext(nextFlag || data.length === 20);
      setHasPrev(prevFlag || pageNum > 1);
      setTotalPages(totalPgs);
      setPage(pageNum);
      fetchedRef.current = true;
    } catch (err: any) {
      console.warn(`Error fetching ${currentField.fieldname}:`, err);
      setFetchError(err?.message || `Failed to load ${currentField.label}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const serializedParams = JSON.stringify(field.apiParams);
  useEffect(() => {
    fetchedRef.current = false;
    setOptions([]);
    setFilteredOptions([]);
    setPage(1);
    setTotalPages(1);
    setHasNext(false);
    setHasPrev(false);
  }, [serializedParams, field.apiEndpoint]);

  // Effect for local searching/filtering options when there's no apiEndpoint
  useEffect(() => {
    if (!field.apiEndpoint) {
      const filtered = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [searchTerm, options, field.apiEndpoint]);

  // Effect for API-based search option fetching with debounce
  useEffect(() => {
    if (!field.apiEndpoint) return;
    if (!isOpen) return;

    const delayDebounce = setTimeout(() => {
      if (searchTerm !== lastSearchTermRef.current) {
        lastSearchTermRef.current = searchTerm;
        fetchOptions(1, searchTerm);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, isOpen, field.apiEndpoint, fetchOptions]);

  useEffect(() => {
    if (field.apiEndpoint && value && !fetchedRef.current && !field.disabled) {
      fetchOptions(1, '');
      lastSearchTermRef.current = '';
    }
  }, [field.apiEndpoint, value, fetchOptions, field.disabled]);

  useEffect(() => {
    if (field.fieldtype === 'File') {
      if (typeof value === 'string' && value) {
        setFileName(value.split('/').pop() || 'document.pdf');
      } else if (value && value.name) {
        setFileName(value.name);
      } else if (!value) {
        setFileName('');
      }
    }
  }, [value, field.fieldtype]);

  const handleDropdownClick = () => {
    if (field.read_only || field.disabled) return;

    if (!fetchedRef.current || options.length === 0) {
      fetchOptions(1, '');
    }

    lastSearchTermRef.current = '';
    setIsOpen(true);
    setSearchTerm('');
    setShowCustomInput(false);
  };

  const handleSingleSelect = (val: string) => {
    onChange(field.fieldname, val);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleMultiSelect = (val: string) => {
    const currentValues = Array.isArray(value) ? value : [];
    if (currentValues.includes(val)) {
      onChange(field.fieldname, currentValues.filter((v: string) => v !== val));
    } else {
      onChange(field.fieldname, [...currentValues, val]);
    }
  };

  const removeSelectedItem = (itemToRemove: string) => {
    if (Array.isArray(value)) {
      onChange(field.fieldname, value.filter((v: string) => v !== itemToRemove));
    }
  };

  const handleAddCustomValue = async () => {
    if (customValue.trim()) {
      const customOptionValue = customValue.trim();

      if (onCreateCustomValue) {
        setLoading(true);
        try {
          await onCreateCustomValue(customOptionValue);
        } catch (err: any) {
          console.error("Error creating custom value:", err);
          Alert.alert("Error", err?.message || `Failed to create custom ${field.label}`);
          return; // Don't add if creation fails
        } finally {
          setLoading(false);
        }
      }

      const newOption = { value: customOptionValue, label: customValue.trim() };
      const exists = options.some(opt => opt.value === customOptionValue);
      if (!exists) {
        setOptions(prev => [...prev, newOption]);
        setFilteredOptions(prev => [...prev, newOption]);
      }
      if (field.multiSelect) {
        const currentValues = Array.isArray(value) ? value : [];
        if (!currentValues.includes(customOptionValue)) {
          onChange(field.fieldname, [...currentValues, customOptionValue]);
        }
      } else {
        onChange(field.fieldname, customOptionValue);
        setIsOpen(false);
      }
      setCustomValue('');
      setShowCustomInput(false);
      setSearchTerm('');
    }
  };

  const getSelectedLabel = () => {
    if (!value) return field.placeholder || `Select ${field.label}`;
    const selected = options.find(opt => opt.value === value);
    if (selected) return selected.label;
    if (value) return value; // Show raw value if option not found yet
    return field.placeholder || `Select ${field.label}`;
  };

  const getSelectedLabels = () => {
    if (!Array.isArray(value) || value.length === 0) return [];

    return value.map(v => {
      const found = options.find(opt => opt.value === v);
      return found || { value: v, label: v };
    });
  };

  const handleDateConfirm = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const storageFormat = `${year}-${month}-${day}`;

    onChange(field.fieldname, storageFormat); // Store YYYY-MM-DD
    setDatePickerVisible(false);
  };

  const handleFilePick = async () => {
    if (field.read_only) return;

    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
        allowMultiSelection: false,
      });

      if (result) {
        const file = Array.isArray(result) ? result[0] : result;

        if (file.size && file.size > 5 * 1024 * 1024) {
          Alert.alert('File Size Error', 'File size should be less than 5MB');
          return;
        }

        // Store file object with proper structure for FormData
        const fileObject = {
          uri: file.uri,
          type: file.type || 'application/pdf',
          name: file.name || 'document.pdf',
          size: file.size,
        };

        const fileNameValue = file.name ? file.name : 'document.pdf';
        setFileName(fileNameValue);
        onChange(field.fieldname, fileObject); // Store the properly structured file object
        Alert.alert('Success', 'PDF file selected successfully');
      }
    } catch (err: any) {
      if (err.code === 'DOCUMENT_PICKER_CANCELED' || err.code === 'CANCELED') {
        console.log('User cancelled file picker');
      } else {
        console.error('Error picking file:', err);
        Alert.alert('Error', 'Failed to pick file. Please try again.');
      }
    }
  };

  if (field.hidden) return null;

  const renderDropdownModal = () => {
    return (
      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
        statusBarTranslucent={true}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: backgroundColor, maxHeight: '90%', minHeight: 400, height: 550 }]}>
            <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
              <Text style={[styles.modalTitle, { color: textPrimary }]}>Select {field.label}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)} style={styles.closeButton}>
                <Text style={[styles.closeButtonText, { color: textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {!showCustomInput ? (
              <>
                <View style={[styles.searchContainer, { borderBottomColor: borderColor }]}>
                  <TextInput
                    ref={searchInputRef}
                    style={[styles.searchInput, { borderColor, color: textPrimary }]}
                    placeholder="Search..."
                    placeholderTextColor={textSecondary}
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                  />
                </View>

                <View style={{ flex: 1, minHeight: 200, position: 'relative' }}>
                  {fetchError && !loading ? (
                    <View style={styles.errorContainer}>
                      <Text style={[styles.errorMessage, { color: errorColor }]}>{fetchError}</Text>
                      <TouchableOpacity onPress={() => fetchOptions(page, searchTerm)} style={[styles.retryButton, { backgroundColor: accentColor }]}>
                        <Text style={styles.retryText}>Retry</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <FlatList
                      data={filteredOptions}
                      keyExtractor={(item, index) => item.value + index}
                      renderItem={({ item }) => {
                        const isSelected = field.multiSelect
                          ? (Array.isArray(value) && value.includes(item.value))
                          : (value === item.value);

                        return (
                          <TouchableOpacity
                            style={[
                              styles.optionItem,
                              { borderBottomColor: borderColor },
                              isSelected && { backgroundColor: accentColor + '10' }
                            ]}
                            onPress={() => field.multiSelect ? handleMultiSelect(item.value) : handleSingleSelect(item.value)}
                          >
                            <Text style={[
                              styles.optionText,
                              { color: textPrimary },
                              isSelected && { color: accentColor }
                            ]}>
                              {item.label}
                            </Text>
                            {isSelected && (
                              <Text style={[styles.checkIcon, { color: accentColor }]}>✓</Text>
                            )}
                          </TouchableOpacity>
                        );
                      }}
                      ListEmptyComponent={
                        !loading ? (
                          <Text style={[styles.emptyText, { color: textSecondary }]}>No options available</Text>
                        ) : null
                      }
                    />
                  )}

                  {loading && (
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255, 255, 255, 0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 10 }]}>
                      <ActivityIndicator size="large" color={accentColor} />
                    </View>
                  )}
                </View>

                {/* Pagination Controls */}
                {field.apiEndpoint && !fetchError && (hasNext || hasPrev || totalPages > 1) && (
                  <View style={styles.paginationContainer}>
                    <TouchableOpacity
                      disabled={!hasPrev || loading}
                      onPress={() => fetchOptions(page - 1, searchTerm)}
                      style={[
                        styles.pageButton, 
                        { backgroundColor: hasPrev ? accentColor : '#cbd5e1', opacity: loading ? 0.5 : 1 }
                      ]}
                    >
                      <Text style={[styles.pageButtonText, { color: hasPrev ? '#ffffff' : '#64748b' }]}>Previous</Text>
                    </TouchableOpacity>
                    
                    <Text style={[styles.pageInfoText, { color: textPrimary }]}>
                      Page {page} of {totalPages}
                    </Text>

                    <TouchableOpacity
                      disabled={!hasNext || loading}
                      onPress={() => fetchOptions(page + 1, searchTerm)}
                      style={[
                        styles.pageButton, 
                        { backgroundColor: hasNext ? accentColor : '#cbd5e1', opacity: loading ? 0.5 : 1 }
                      ]}
                    >
                      <Text style={[styles.pageButtonText, { color: hasNext ? '#ffffff' : '#64748b' }]}>Next</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {hasOthersOption && (
                  <TouchableOpacity
                    style={[styles.customOptionBtn, { borderTopColor: borderColor }]}
                    onPress={() => setShowCustomInput(true)}
                  >
                    <Text style={[styles.customOptionText, { color: accentColor }]}>+ Add Others (Custom Value)</Text>
                  </TouchableOpacity>
                )}

                {field.multiSelect && (
                  <View style={[styles.modalFooter, { borderTopColor: borderColor }]}>
                    <TouchableOpacity style={[styles.doneButton, { backgroundColor: accentColor }]} onPress={() => setIsOpen(false)}>
                      <Text style={styles.doneButtonText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.customInputContainer}>
                <Text style={[styles.customInputLabel, { color: textPrimary }]}>
                  {field.customPlaceholder || 'Enter custom value'}
                </Text>
                <TextInput
                  ref={customInputRef}
                  style={[styles.customTextInput, { borderColor, color: textPrimary }]}
                  value={customValue}
                  onChangeText={setCustomValue}
                  placeholder="Type here..."
                  placeholderTextColor={textSecondary}
                  autoFocus
                  editable={!loading}
                />
                <View style={styles.customInputButtons}>
                  {loading ? (
                    <ActivityIndicator size="small" color={accentColor} style={{ flex: 1 }} />
                  ) : (
                    <>
                      <TouchableOpacity
                        style={[styles.cancelButton, { borderColor, backgroundColor: backgroundColor }]}
                        onPress={() => setShowCustomInput(false)}
                      >
                        <Text style={[styles.cancelButtonText, { color: textSecondary }]}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.addButton,
                          { backgroundColor: accentColor, flex: 1, marginLeft: 10 },
                          !customValue.trim() && { opacity: 0.5 }
                        ]}
                        onPress={handleAddCustomValue}
                        disabled={!customValue.trim() || loading}
                      >
                        <Text style={styles.addButtonText}>Add</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  const renderStaticSelectModal = () => {
    return (
      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
        statusBarTranslucent={true}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: backgroundColor, maxHeight: '90%', minHeight: 400, height: 550 }]}>
            <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
              <Text style={[styles.modalTitle, { color: textPrimary }]}>Select {field.label}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)} style={styles.closeButton}>
                <Text style={[styles.closeButtonText, { color: textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.searchContainer, { borderBottomColor: borderColor }]}>
              <TextInput
                style={[styles.searchInput, { borderColor, color: textPrimary }]}
                placeholder="Search..."
                placeholderTextColor={textSecondary}
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
            </View>

            <FlatList
              data={field.options?.filter(opt =>
                opt.toLowerCase().includes(searchTerm.toLowerCase())
              ) || []}
              keyExtractor={(item, index) => item + index}
              renderItem={({ item }) => {
                const isSelected = field.multiSelect 
                  ? (Array.isArray(value) && value.includes(item))
                  : (value === item);
                return (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      { borderBottomColor: borderColor },
                      isSelected && { backgroundColor: accentColor + '10' }
                    ]}
                    onPress={() => {
                      if (field.multiSelect) {
                        handleMultiSelect(item);
                      } else {
                        onChange(field.fieldname, item);
                        setIsOpen(false);
                        setSearchTerm('');
                      }
                    }}
                  >
                    <Text style={[
                      styles.optionText,
                      { color: textPrimary },
                      isSelected && { color: accentColor }
                    ]}>
                      {item}
                    </Text>
                    {isSelected && (
                      <Text style={[styles.checkIcon, { color: accentColor }]}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: textSecondary }]}>No options available</Text>
              }
              showsVerticalScrollIndicator={true}
              style={styles.flatList}
            />
            {field.multiSelect && (
              <View style={[styles.modalFooter, { borderTopColor: borderColor }]}>
                <TouchableOpacity style={[styles.doneButton, { backgroundColor: accentColor }]} onPress={() => setIsOpen(false)}>
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  const renderField = () => {
    // API Dropdown with search
    if (field.apiEndpoint) {
      return (
        <View>
          <TouchableOpacity
            style={[
              styles.inputContainer,
              { borderColor: error ? errorColor : borderColor, backgroundColor },
              (field.read_only || field.disabled) && { backgroundColor: '#f5f5f5', opacity: 0.6 }
            ]}
            onPress={handleDropdownClick}
            disabled={field.read_only || field.disabled}
          >
            {field.multiSelect && Array.isArray(value) && value.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.multiSelectContainer}>
                {getSelectedLabels().map((selected: any) => (
                  <View key={selected.value} style={[styles.tag, { backgroundColor: accentColor + '20' }]}>
                    <Text style={[styles.tagText, { color: accentColor }]}>{selected.label}</Text>
                    <TouchableOpacity onPress={() => removeSelectedItem(selected.value)}>
                      <Text style={[styles.tagRemove, { color: accentColor }]}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text style={[
                styles.inputText,
                { color: textPrimary },
                (!value && !field.multiSelect) && { color: textSecondary }
              ]}>
                {field.multiSelect ? (field.placeholder || "Select options") : getSelectedLabel()}
              </Text>
            )}
            <Text style={[styles.dropdownIcon, { color: textSecondary }]}>▼</Text>
          </TouchableOpacity>

          {isOpen && renderDropdownModal()}
        </View>
      );
    }

    // Static Select field (like Gender)
    if (field.fieldtype === 'Select' && field.options && field.options.length > 0) {
      return (
        <View>
          <TouchableOpacity
            style={[
              styles.inputContainer,
              { borderColor: error ? errorColor : borderColor, backgroundColor },
              (field.read_only || field.disabled) && { backgroundColor: '#f5f5f5', opacity: 0.6 }
            ]}
            onPress={() => setIsOpen(true)}
            disabled={field.read_only || field.disabled}
          >
            {field.multiSelect && Array.isArray(value) && value.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.multiSelectContainer}>
                {value.map((v: string) => (
                  <View key={v} style={[styles.tag, { backgroundColor: accentColor + '20' }]}>
                    <Text style={[styles.tagText, { color: accentColor }]}>{v}</Text>
                    <TouchableOpacity onPress={() => removeSelectedItem(v)}>
                      <Text style={[styles.tagRemove, { color: accentColor }]}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text style={[
                styles.inputText,
                { color: textPrimary },
                !value && { color: textSecondary }
              ]}>
                {Array.isArray(value) ? (value.length > 0 ? value.join(', ') : (field.placeholder || `Select ${field.label}`)) : (value || field.placeholder || `Select ${field.label}`)}
              </Text>
            )}
            <Text style={[styles.dropdownIcon, { color: textSecondary }]}>▼</Text>
          </TouchableOpacity>

          {isOpen && renderStaticSelectModal()}
        </View>
      );
    }

    switch (field.fieldtype) {
      case 'Time':
        const formatTime = (timeStr: string) => {
          if (!timeStr) return '';
          const parts = timeStr.split(':');
          if (parts.length < 2) return timeStr;
          const h = parseInt(parts[0], 10);
          const minutes = parts[1];
          const ampm = h >= 12 ? 'PM' : 'AM';
          const h12 = h % 12 || 12;
          return `${h12}:${minutes} ${ampm}`;
        };
        return (
          <>
            <TouchableOpacity
              style={[styles.inputContainer, { borderColor: error ? errorColor : borderColor, backgroundColor }]}
              onPress={() => setDatePickerVisible(true)}
              disabled={field.read_only}
            >
              <Text style={[
                styles.inputText,
                { color: textPrimary },
                !value && { color: textSecondary }
              ]}>
                {value ? formatTime(value) : (field.placeholder || 'Select time')}
              </Text>
              <Text style={[styles.calendarIcon, { color: textSecondary }]}>⏰</Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="time"
              onConfirm={(date) => {
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                onChange(field.fieldname, `${hours}:${minutes}`);
                setDatePickerVisible(false);
              }}
              onCancel={() => setDatePickerVisible(false)}
            />
          </>
        );

      case 'Check':
      case 'Switch':
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48, paddingHorizontal: 4 }}>
            <Text style={{ color: textPrimary, fontSize: 14, fontFamily: typography.fontFamily.display }}>{field.placeholder || 'Enable Option'}</Text>
            <Switch
              value={value === '1' || value === 1 || value === true}
              onValueChange={(val) => onChange(field.fieldname, val ? '1' : '0')}
              trackColor={{ false: '#D1D5DB', true: accentColor }}
              thumbColor={(value === '1' || value === 1 || value === true) ? '#FFF' : '#F4F4F5'}
              disabled={field.read_only || field.disabled}
            />
          </View>
        );

      case 'Password':
        return (
          <View style={[styles.inputContainer, { borderColor: error ? errorColor : borderColor, backgroundColor }]}>
            <TextInput
              style={[styles.inputInner, { color: textPrimary }]}
              placeholder={field.placeholder}
              placeholderTextColor={textSecondary}
              value={value || ''}
              onChangeText={(val) => onChange(field.fieldname, val)}
              secureTextEntry={!showPassword}
              editable={!field.read_only}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={{ color: textSecondary }}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
        );

      case 'Date':
        const displayValue = value ? value.split('-').reverse().join('-') : '';
        const shouldUppercase = field.textTransform === 'uppercase' || (field as any).testTransform === 'uppercase';
        return (
          <>
            <TouchableOpacity
              style={[styles.inputContainer, { borderColor: error ? errorColor : borderColor, backgroundColor }]}
              onPress={() => setDatePickerVisible(true)}
              disabled={field.read_only}
            >
              <Text style={[
                styles.inputText,
                { color: textPrimary },
                !value && { color: textSecondary },
                shouldUppercase && { textTransform: 'uppercase' }
              ]}>
                {displayValue || field.placeholder || 'Select date'}
              </Text>
              <Text style={[styles.calendarIcon, { color: textSecondary }]}>📅</Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleDateConfirm}
              onCancel={() => setDatePickerVisible(false)}
              minimumDate={field.minDate}
              maximumDate={field.maxDate}
            />
          </>
        );

      case 'File':
        const isUrl = typeof value === 'string' && value.length > 0;
        const fullUrl = isUrl ? (value.startsWith('http') ? value : `https://devstridenex.quantcloud.in${value}`) : null;
        const fileSizeMB = value?.size ? (value.size / (1024 * 1024)).toFixed(2) : null;

        return (
          <View style={{ gap: 8 }}>
            {fileName ? (
              <View style={{ backgroundColor: '#ECFDF5', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#A7F3D0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View style={{ backgroundColor: '#D1FAE5', padding: 8, borderRadius: 8, marginRight: 10 }}>
                    {isUrl ? <Paperclip size={18} color="#059669" /> : <FileText size={18} color="#059669" />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#064E3B' }} numberOfLines={1}>{fileName}</Text>
                    {isUrl && fullUrl ? (
                      <TouchableOpacity onPress={() => Linking.openURL(fullUrl)} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#059669', marginRight: 4 }}>View Current Document</Text>
                        <Eye size={10} color="#059669" />
                      </TouchableOpacity>
                    ) : (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <CheckCircle2 size={10} color="#059669" style={{ marginRight: 4 }} />
                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#059669' }}>Ready to upload {fileSizeMB ? `(${fileSizeMB} MB)` : ''}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <TouchableOpacity onPress={handleFilePick} disabled={field.read_only} style={{ backgroundColor: '#FFFFFF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#D1FAE5' }}>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#059669' }}>Change</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setFileName(''); onChange(field.fieldname, null); }} disabled={field.read_only} style={{ padding: 6 }}>
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[{ padding: 16, borderRadius: 12, borderWidth: 2, borderStyle: 'dashed', borderColor: '#CBD5E1', backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' }, field.read_only && { opacity: 0.6 }]}
                onPress={handleFilePick}
                disabled={field.read_only}
              >
                <View style={{ backgroundColor: '#FFFFFF', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 8 }}>
                  <UploadCloud size={20} color="#94A3B8" />
                </View>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#334155' }}>Click to attach {field.label}</Text>
                <Text style={{ fontSize: 10, color: '#94A3B8', marginTop: 4 }}>Supports PDF (Max 5MB)</Text>
              </TouchableOpacity>
            )}
          </View>
        );

      case 'Int':
      case 'Float':
      case 'Currency':
        return (
          <TextInput
            style={[
              styles.input,
              { borderColor: error ? errorColor : borderColor, backgroundColor, color: textPrimary },
              field.read_only && { backgroundColor: '#f5f5f5', opacity: 0.6 }
            ]}
            placeholder={field.placeholder}
            placeholderTextColor={textSecondary}
            value={value !== undefined && value !== null ? String(value) : ''}
            onChangeText={(val) => {
              const numVal = field.fieldtype === 'Int' ? parseInt(val, 10) : parseFloat(val);
              onChange(field.fieldname, isNaN(numVal) ? (val === '' ? null : val) : numVal);
            }}
            editable={!field.read_only}
            keyboardType="numeric"
            maxLength={field.maxLength}
          />
        );

      case 'Phone':
        return (
          <TextInput
            style={[
              styles.input,
              { borderColor: error ? errorColor : borderColor, backgroundColor, color: textPrimary },
              field.read_only && { backgroundColor: '#f5f5f5', opacity: 0.6 }
            ]}
            placeholder={field.placeholder}
            placeholderTextColor={textSecondary}
            value={value || ''}
            onChangeText={(val) => onChange(field.fieldname, val)}
            editable={!field.read_only}
            keyboardType="phone-pad"
            maxLength={field.maxLength}
          />
        );

      case 'Text':
      case 'Long Text':
      case 'Data':
      default:
        return (
          <TextInput
            style={[
              styles.input,
              { borderColor: error ? errorColor : borderColor, backgroundColor, color: textPrimary },
              field.fieldtype === 'Long Text' && styles.textArea,
              field.read_only && { backgroundColor: '#f5f5f5', opacity: 0.6 }
            ]}
            placeholder={field.placeholder}
            placeholderTextColor={textSecondary}
            value={value || ''}
            onChangeText={(val) => onChange(field.fieldname, val)}
            editable={!field.read_only}
            multiline={field.fieldtype === 'Long Text'}
            numberOfLines={field.fieldtype === 'Long Text' ? 4 : 1}
            maxLength={field.maxLength}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      {field.label ? (
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: textPrimary }]}>
            {field.label}
            {field.required && <Text style={[styles.requiredAsterisk, { color: errorColor }]}> *</Text>}
          </Text>
          {field.description && (
            <Text style={[styles.description, { color: textSecondary }]}>{field.description}</Text>
          )}
        </View>
      ) : null}

      {renderField()}

      {error ? <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xs,
  },
  labelRow: {
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    fontFamily: typography.fontFamily.display,
  },
  requiredAsterisk: {
    fontSize: typography.fontSize.sm,
  },
  description: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderRadius: 8,
    fontFamily: typography.fontFamily.display,
  },
  inputInner: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    paddingVertical: spacing.sm,
    fontFamily: typography.fontFamily.display,
  },
  inputText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    paddingVertical: spacing.sm,
    fontFamily: typography.fontFamily.display,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dropdownIcon: {
    fontSize: 12,
    marginLeft: spacing.sm,
  },
  calendarIcon: {
    fontSize: 18,
    marginLeft: spacing.sm,
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
  browseButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  browseText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.display,
  },
  fileSelectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  fileNameText: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.display,
  },
  removeText: {
    fontSize: typography.fontSize.xs,
    marginLeft: spacing.sm,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
    fontFamily: typography.fontFamily.display,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    fontFamily: typography.fontFamily.display,
  },
  closeButton: {
    padding: spacing.xs,
  },
  closeButtonText: {
    fontSize: 20,
  },
  searchContainer: {
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.display,
  },
  loader: {
    padding: spacing.xl,
  },
  errorContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  errorMessage: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: typography.fontSize.sm,
    flex: 1,
    fontFamily: typography.fontFamily.display,
  },
  checkIcon: {
    fontSize: 16,
    marginLeft: spacing.sm,
  },
  emptyText: {
    padding: spacing.xl,
    textAlign: 'center',
    fontSize: typography.fontSize.sm,
  },
  customOptionBtn: {
    padding: spacing.md,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  customOptionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
  },
  modalFooter: {
    padding: spacing.md,
    borderTopWidth: 1,
  },
  doneButton: {
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  customInputContainer: {
    padding: spacing.md,
  },
  customInputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  customTextInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.md,
  },
  customInputButtons: {
    flexDirection: 'row',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: typography.fontSize.sm,
  },
  addButton: {
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  flatList: {
    flex: 1,
    marginBottom: Platform.OS === 'ios' ? 0 : 0,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  pageButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  pageButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  pageInfoText: {
    fontSize: 12,
    fontWeight: '600',
  },
});