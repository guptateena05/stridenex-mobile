import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import DynamicField, { FormField } from './DynamicField';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

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

  useEffect(() => {
    if (initialValues) {
      setFormData(initialValues);
    }
    setLocalErrors({});
  }, [initialValues]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      
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
                    field={f}
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
                field={f}
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