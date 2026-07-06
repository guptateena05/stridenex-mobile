import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import DynamicField, { FormField } from './DynamicField';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { disableToDateBeforeFromDate } from '@/utils/date.utils';

const getOneDayPriorDate = (dateStr: string): Date | undefined => {
  if (!dateStr) return undefined;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return undefined;
  d.setDate(d.getDate() - 1);
  return d;
};

export interface DynamicFormProps {
  fields: FormField[];
  onSubmit: (data: any) => void;
  onCreateCustomValue?: (fieldName: string, value: string) => Promise<void>;
  buttonLabel?: string;
  loading?: boolean;
  onChange?: (data: any) => void;
  initialValues?: Record<string, any>;
  errors?: Record<string, string>;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  fields,
  onSubmit,
  onCreateCustomValue,
  buttonLabel = 'Submit',
  loading = false,
  onChange,
  initialValues = {},
  errors = {},
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialValues || {});
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const prevInitialValuesStr = React.useRef(JSON.stringify(initialValues));

  useEffect(() => {
    const currentStr = JSON.stringify(initialValues);
    if (currentStr !== prevInitialValuesStr.current) {
      setFormData(initialValues || {});
      setLocalErrors({});
      prevInitialValuesStr.current = currentStr;
    }
  }, [initialValues]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      // Automatically adjust end_date/to_date if start_date/from_date becomes later
      if (name === 'start_date' && newData.end_date) {
        if (new Date(newData.end_date) < new Date(value)) {
          newData.end_date = value;
        }
      }
      if (name === 'from_date' && newData.to_date) {
        if (new Date(newData.to_date) < new Date(value)) {
          newData.to_date = value;
        }
      }
      
      // Automatically adjust registeration_deadline if drive_date becomes earlier than registeration_deadline + 1 day
      if (name === 'drive_date' && newData.registeration_deadline && value) {
        const drive = new Date(value);
        const reg = new Date(newData.registeration_deadline);
        if (!isNaN(drive.getTime()) && !isNaN(reg.getTime())) {
          drive.setDate(drive.getDate() - 1);
          if (reg > drive) {
            newData.registeration_deadline = drive.toISOString().split('T')[0];
          }
        }
      }
      if (name === 'registeration_deadline' && newData.drive_date && value) {
        const drive = new Date(newData.drive_date);
        const reg = new Date(value);
        if (!isNaN(drive.getTime()) && !isNaN(reg.getTime())) {
          drive.setDate(drive.getDate() - 1);
          if (reg > drive) {
            newData.registeration_deadline = drive.toISOString().split('T')[0];
          }
        }
      }
      
      // Clear error for this field
      if (localErrors[name]) {
        setLocalErrors(errs => {
          const newErrs = { ...errs };
          delete newErrs[name];
          return newErrs;
        });
      }

      if (onChange) {
        setTimeout(() => onChange(newData), 0);
      }
      return newData;
    });
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    fields.forEach(f => {
      if (f.hidden) return; // Skip validation for hidden fields
      if (f.required && (!formData[f.fieldname] || (Array.isArray(formData[f.fieldname]) && formData[f.fieldname].length === 0))) {
        newErrors[f.fieldname] = 'This field is mandatory';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setLocalErrors(newErrors);
      return;
    }
    
    setLocalErrors({});
    onSubmit(formData);
  };

  // Build rows for rendering
  const rows: React.ReactNode[] = [];
  if (fields && fields.length > 0) {
    let currentRow: FormField[] = [];
    let currentRowWidth = 0;

    fields.forEach((field, index) => {
      const fieldWidth = field.layout === 'half' ? 0.5 : 1;

      if (currentRowWidth + fieldWidth > 1) {
        if (currentRow.length > 0) {
          rows.push(
            <View key={`row-${rows.length}`} style={styles.row}>
              {currentRow.map((f) => (
                <View
                  key={f.fieldname}
                  style={[styles.fieldContainer, f.layout === 'half' ? styles.halfField : styles.fullField]}
                >
                  <DynamicField
                    field={(f.fieldname === 'end_date' || f.fieldname === 'to_date')
                      ? { ...f, minDate: disableToDateBeforeFromDate(formData.start_date || formData.from_date) }
                      : (f.fieldname === 'registeration_deadline' && formData.drive_date)
                        ? { ...f, maxDate: getOneDayPriorDate(formData.drive_date) }
                        : f}
                    value={formData[f.fieldname]}
                    onChange={handleChange}
                    onCreateCustomValue={onCreateCustomValue ? (val) => onCreateCustomValue(f.fieldname, val) : undefined}
                    error={localErrors[f.fieldname] || errors?.[f.fieldname]}
                  />
                </View>
              ))}
            </View>
          );
        }
        currentRow = [field];
        currentRowWidth = fieldWidth;
      } else {
        currentRow.push(field);
        currentRowWidth += fieldWidth;
      }
    });

    if (currentRow.length > 0) {
      rows.push(
        <View key={`row-${rows.length}`} style={styles.row}>
          {currentRow.map((f) => (
            <View
              key={f.fieldname}
              style={[styles.fieldContainer, f.layout === 'half' ? styles.halfField : styles.fullField]}
            >
              <DynamicField
                field={(f.fieldname === 'end_date' || f.fieldname === 'to_date')
                  ? { ...f, minDate: disableToDateBeforeFromDate(formData.start_date || formData.from_date) }
                  : (f.fieldname === 'registeration_deadline' && formData.drive_date)
                    ? { ...f, maxDate: getOneDayPriorDate(formData.drive_date) }
                    : f}
                value={formData[f.fieldname]}
                onChange={handleChange}
                onCreateCustomValue={onCreateCustomValue ? (val) => onCreateCustomValue(f.fieldname, val) : undefined}
                error={localErrors[f.fieldname] || errors?.[f.fieldname]}
              />
            </View>
          ))}
        </View>
      );
    }
  }

  return (
    <View style={styles.container}>
      {rows}

      {buttonLabel && buttonLabel !== '' && (
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Loading...' : buttonLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default DynamicForm

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  fieldContainer: {
    marginBottom: spacing.xs,
  },
  halfField: {
    width: '48%',
    marginRight: '2%',
  },
  fullField: {
    width: '100%',
  },
  button: {
    backgroundColor: colors.accent.DEFAULT,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.display,
    fontWeight: 'bold',
    fontSize: typography.fontSize.base,
  },
});