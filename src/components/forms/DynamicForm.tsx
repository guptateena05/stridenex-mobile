import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import DynamicField, { FormField } from './DynamicField';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

export interface DynamicFormProps {
  fields: FormField[];
  onSubmit: (data: any) => void;
  buttonLabel?: string;
  loading?: boolean;
  onChange?: (data: any) => void;
  initialValues?: Record<string, any>;
  errors?: Record<string, string>;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  fields,
  onSubmit,
  buttonLabel = 'Submit',
  loading = false,
  onChange,
  initialValues = {},
  errors = {},
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialValues);

  useEffect(() => {
    setFormData((prev) => {
      let hasChanges = false;
      const newData = { ...prev };
      for (const key in initialValues) {
        if (initialValues[key] !== prev[key]) {
          hasChanges = true;
          newData[key] = initialValues[key];
        }
      }
      return hasChanges ? newData : prev;
    });
  }, [initialValues]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      };

      if (onChange) {
        setTimeout(() => {
          onChange(newData);
        }, 0);
      }

      return newData;
    });
  };

  const renderFields = () => {
    if (!fields || fields.length === 0) return null;

    const rows: React.ReactNode[] = [];
    let currentRow: FormField[] = [];
    let currentRowWidth = 0;

    fields.forEach((field) => {
      const fieldWidth = field.layout === 'half' ? 0.5 : 1;

      if (currentRowWidth + fieldWidth > 1) {
        if (currentRow.length > 0) {
          rows.push(
            <View key={rows.length} style={styles.row}>
              {currentRow.map((f) => (
                <View 
                  key={f.fieldname} 
                  style={[styles.fieldContainer, f.layout === 'half' ? styles.halfField : styles.fullField]}
                >
                  <DynamicField
                    field={f}
                    value={formData[f.fieldname]}
                    onChange={handleChange}
                    error={errors?.[f.fieldname]}
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
        <View key={rows.length} style={styles.row}>
          {currentRow.map((f) => (
            <View 
              key={f.fieldname} 
              style={[styles.fieldContainer, f.layout === 'half' ? styles.halfField : styles.fullField]}
            >
              <DynamicField
                field={f}
                value={formData[f.fieldname]}
                onChange={handleChange}
                error={errors?.[f.fieldname]}
              />
            </View>
          ))}
        </View>
      );
    }

    return rows;
  };

  return (
    <View style={styles.container}>
      {renderFields()}

      {buttonLabel && buttonLabel !== '' && (
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={() => onSubmit(formData)}
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