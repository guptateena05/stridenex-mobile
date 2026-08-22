import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Camera, Upload, CheckCircle, AlertCircle } from 'lucide-react-native';
import * as DocumentPicker from '@react-native-documents/picker';
import { useAuth } from '@/context/AuthContext';
import { uploadProfilePicture, buildProfileImageUrl } from '@/api/api.services';

interface ProfileImageUploaderProps {
  currentImageUrl?: string | null;
  initials?: string;
  size?: 'sm' | 'md' | 'lg';
  onSuccess?: (fileUrl: string) => void;
}

const SIZE_MAP = {
  sm: { outer: 48, text: 16, icon: 14, badge: 20 },
  md: { outer: 80, text: 24, icon: 16, badge: 28 },
  lg: { outer: 112, text: 32, icon: 20, badge: 36 },
};

export default function ProfileImageUploader({
  currentImageUrl,
  initials = 'U',
  size = 'md',
  onSuccess,
}: ProfileImageUploaderProps) {
  const { updateUserImage } = useAuth();
  
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const sz = SIZE_MAP[size];
  const displayUrl = previewUrl ?? buildProfileImageUrl(currentImageUrl);

  const handlePickImage = async () => {
    try {
      setError(null);
      setSuccess(false);

      const results = await DocumentPicker.pick({
        type: [DocumentPicker.types.images],
        copyTo: 'cachesDirectory',
      });

      const result = results[0];
      if (!result) return;

      if (result.size && result.size > 5 * 1024 * 1024) {
        setError("Image must be smaller than 5 MB");
        return;
      }

      setPreviewUrl(result.uri);
      setUploading(true);

      const fileToUpload = {
        uri: result.uri,
        type: result.type || 'image/jpeg',
        name: result.name || 'profile_picture.jpg',
      };

      const uploadResult = await uploadProfilePicture(fileToUpload);
      const fullUrl = buildProfileImageUrl(uploadResult.file_url);
      if (fullUrl) setPreviewUrl(fullUrl);

      updateUserImage(uploadResult.file_url);
      onSuccess?.(uploadResult.file_url);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

    } catch (err: any) {
      if (err?.message?.toLowerCase().includes('cancel')) {
        // User cancelled the picker
        return;
      }
      setError(err?.message || "Upload failed. Please try again.");
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <View style={[styles.avatarOuter, { width: sz.outer, height: sz.outer }]}>
          {displayUrl ? (
            <Image
              source={{ uri: displayUrl }}
              style={styles.image}
              onError={() => setPreviewUrl(null)}
            />
          ) : (
            <Text style={[styles.initials, { fontSize: sz.text }]}>{initials}</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.badge, { width: sz.badge, height: sz.badge, borderRadius: sz.badge / 2 }]}
          onPress={handlePickImage}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#2563eb" />
          ) : success ? (
            <CheckCircle size={sz.icon} color="#10b981" />
          ) : (
            <Camera size={sz.icon} color="#475569" />
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.uploadBtnLabel}
        onPress={handlePickImage}
        disabled={uploading}
      >
        {uploading ? (
          <>
            <ActivityIndicator size={12} color="#2563eb" />
            <Text style={styles.uploadBtnText}>Uploading...</Text>
          </>
        ) : (
          <>
            <Upload size={14} color="#2563eb" />
            <Text style={styles.uploadBtnText}>Change photo</Text>
          </>
        )}
      </TouchableOpacity>

      {error && (
        <View style={styles.errorContainer}>
          <AlertCircle size={14} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {success && !error && (
        <View style={styles.successContainer}>
          <CheckCircle size={14} color="#10b981" />
          <Text style={styles.successText}>Profile photo updated!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
    marginVertical: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarOuter: {
    borderRadius: 9999,
    backgroundColor: '#8b5cf6', // Violet/orange gradient alternative (solid for RN without extra libs)
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#ffffff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  initials: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  badge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  uploadBtnLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  uploadBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#d1fae5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
  },
  successText: {
    fontSize: 12,
    color: '#10b981',
  },
});
