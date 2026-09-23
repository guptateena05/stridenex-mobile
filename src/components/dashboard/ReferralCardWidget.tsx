import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, ActivityIndicator, Clipboard, TouchableOpacity, Text } from 'react-native';
import { getReferenceCard } from '@/api/api.services';

export const ReferralCardWidget = ({ referalCode, role = "student" }: { referalCode?: string, role?: string }) => {
  const [refCardUrl, setRefCardUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (referalCode) {
      setLoading(true);
      getReferenceCard({ reference_code: referalCode, module: role })
        .then((res: any) => {
          if (res?.message?.data?.image_url) {
            setRefCardUrl(res.message.data.image_url);
          }
        })
        .catch(err => console.error("Failed to load reference card", err))
        .finally(() => setLoading(false));
    }
  }, [referalCode, role]);

  const handleCopyCode = async () => {
    try {
      Clipboard.setString(referalCode || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code", err);
    }
  };

  if (!referalCode) return null;

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="small" color="#10B981" style={{ padding: 20 }} />
      ) : refCardUrl ? (
        <View style={styles.imageWrapper}>
          <Image 
            source={{ uri: refCardUrl }} 
            style={styles.image} 
            resizeMode="contain"
          />
          <TouchableOpacity 
            style={styles.copyBtn} 
            onPress={handleCopyCode}
            activeOpacity={0.7}
          >
            <Text style={styles.copyBtnText}>{copied ? "Copied!" : "Copy Code"}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: undefined,
    aspectRatio: 16 / 9, // Adjust based on actual SVG/Image proportions
    borderRadius: 12,
  },
  imageWrapper: {
    width: '100%',
    position: 'relative',
  },
  copyBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#334155',
  }
});
