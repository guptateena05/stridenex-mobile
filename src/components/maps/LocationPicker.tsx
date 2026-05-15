import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, PermissionsAndroid, Platform, Alert, StyleProp, ViewStyle } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region, MarkerDragStartEndEvent } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding';
import { MapPin, Navigation, Map as MapIcon, X } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { GOOGLE_MAPS_API_KEY } from '../../config/maps';

// Geocoder will be initialized inside the component

export interface LocationData {
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  latitude: number;
  longitude: number;
  full_address: string;
}

interface LocationPickerProps {
  initialLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  onLocationSelect: (data: LocationData) => void;
  onClose?: () => void;
  style?: StyleProp<ViewStyle>;
}

const DEFAULT_REGION: Region = {
  latitude: 28.6139, // Default to New Delhi if nothing is available
  longitude: 77.2090,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLocation,
  onLocationSelect,
  onClose,
  style
}) => {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    // Initialize Geocoder with the API Key inside the component
    Geocoder.init(GOOGLE_MAPS_API_KEY);
  }, []);

  const [region, setRegion] = useState<Region>(
    initialLocation ? {
      latitude: initialLocation.latitude,
      longitude: initialLocation.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    } : DEFAULT_REGION
  );

  const [markerCoords, setMarkerCoords] = useState({
    latitude: initialLocation?.latitude || DEFAULT_REGION.latitude,
    longitude: initialLocation?.longitude || DEFAULT_REGION.longitude,
  });

  const [currentAddress, setCurrentAddress] = useState<string>(initialLocation?.address || '');
  const [parsedLocationData, setParsedLocationData] = useState<Partial<LocationData>>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (initialLocation) {
      handleReverseGeocoding(initialLocation.latitude, initialLocation.longitude);
    }
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      const auth = await Geolocation.requestAuthorization('whenInUse');
      return auth === 'granted';
    }

    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'Stridenex needs access to your location to set your exact company address.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return false;
  };

  const handleGetCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert("Permission Denied", "Location permission is required to use this feature.");
      return;
    }

    setLoading(true);
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        animateToLocation(latitude, longitude);
        handleReverseGeocoding(latitude, longitude);
        setLoading(false);
      },
      (error) => {
        console.error("Geolocation Error:", error);
        Alert.alert("Error", "Could not fetch your current location. Make sure GPS is enabled.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const animateToLocation = (latitude: number, longitude: number) => {
    setMarkerCoords({ latitude, longitude });
    mapRef.current?.animateToRegion({
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 1000);
  };

  const handleReverseGeocoding = async (lat: number, lng: number) => {
    // Set coordinates immediately so the "Confirm" button enables
    setParsedLocationData(prev => ({ ...prev, latitude: lat, longitude: lng }));
    setMarkerCoords({ latitude: lat, longitude: lng });

    if (GOOGLE_MAPS_API_KEY === "AIzaSyAf-ypNGApRTwjmzctoSt3i3moC56fPK_0") {
      console.warn("Google Maps API Key is still a placeholder. Address search and reverse-geocoding will not work.");
      return;
    }
    setLoading(true);
    try {
      const response = await Geocoder.from(lat, lng);
      const addressComponents = response.results[0].address_components;
      const formattedAddress = response.results[0].formatted_address;

      setCurrentAddress(formattedAddress);

      // Parse Google Maps components to our structured LocationData
      let addressLine1 = '';
      let addressLine2 = '';
      let city = '';
      let state = '';
      let country = '';
      let pincode = '';

      addressComponents.forEach((comp) => {
        const types = comp.types;
        if (types.includes('street_number')) addressLine1 += comp.long_name + ' ';
        if (types.includes('route')) addressLine1 += comp.long_name;
        if (types.includes('sublocality')) addressLine2 += comp.long_name + ', ';
        if (types.includes('neighborhood')) addressLine2 += comp.long_name;

        if (types.includes('locality')) city = comp.long_name;
        if (types.includes('administrative_area_level_1')) state = comp.long_name;
        if (types.includes('country')) country = comp.long_name;
        if (types.includes('postal_code')) pincode = comp.long_name;
      });

      // Fallback logic
      if (!addressLine1.trim()) addressLine1 = formattedAddress.split(',')[0];
      if (!city) city = addressComponents.find(c => c.types.includes('administrative_area_level_2'))?.long_name || '';

      const locationData: LocationData = {
        address_line_1: addressLine1.trim(),
        address_line_2: addressLine2.replace(/,\s*$/, '').trim(),
        city,
        state,
        country,
        pincode,
        latitude: lat,
        longitude: lng,
        full_address: formattedAddress
      };

      setParsedLocationData(locationData);
    } catch (error) {
      console.error("Geocoding Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const onMarkerDragEnd = (e: MarkerDragStartEndEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarkerCoords({ latitude, longitude });
    handleReverseGeocoding(latitude, longitude);
  };

  const confirmLocation = () => {
    if (parsedLocationData.latitude) {
      onLocationSelect(parsedLocationData as LocationData);
    } else {
      Alert.alert("Error", "Please select a valid location first.");
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <MapIcon size={20} color={colors.text.primary} style={{ marginRight: 8 }} />
          <Text style={styles.title}>Select Location</Text>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.searchContainer}>
        <GooglePlacesAutocomplete
          placeholder="Search for an address..."
          fetchDetails={true}
          onPress={(data, details = null) => {
            if (details) {
              const { lat, lng } = details.geometry.location;
              setMarkerCoords({ latitude: lat, longitude: lng });
              setParsedLocationData(prev => ({ ...prev, latitude: lat, longitude: lng }));
              animateToLocation(lat, lng);
              handleReverseGeocoding(lat, lng);
            }
          }}
          query={{
            key: GOOGLE_MAPS_API_KEY === "AIzaSyAf-ypNGApRTwjmzctoSt3i3moC56fPK_0" ? "" : GOOGLE_MAPS_API_KEY,
            language: 'en',
          }}
          styles={{
            textInputContainer: styles.autocompleteContainer,
            textInput: styles.autocompleteInput,
            listView: styles.autocompleteListView,
          }}
          enablePoweredByContainer={false}
          textInputProps={{
            placeholderTextColor: colors.text.secondary,
          }}
        />
      </View>

      <View style={styles.mapContainer}>
        {/* <MapView
          ref={mapRef}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          style={styles.map}
          initialRegion={region}
          showsUserLocation={true}
          showsMyLocationButton={false}
        > */}
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: 28.6139,
            longitude: 77.2090,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker
            coordinate={markerCoords}
            draggable
            onDragEnd={onMarkerDragEnd}
          >
            <MapPin size={36} color={colors.primary.DEFAULT} fill="#E0E7FF" />
          </Marker>
        </MapView>

        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={handleGetCurrentLocation}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Navigation size={20} color="#FFF" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <View style={styles.addressDisplay}>
          <Text style={styles.addressLabel}>Selected Address:</Text>
          <Text style={styles.addressText} numberOfLines={2}>
            {currentAddress || "Drag the pin or search for a location..."}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.confirmButton, !parsedLocationData.latitude && styles.confirmButtonDisabled]}
          onPress={confirmLocation}
          disabled={!parsedLocationData.latitude || loading}
        >
          <Text style={styles.confirmButtonText}>Confirm Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: typography.fontFamily.display,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    padding: 16,
    zIndex: 10, // Important for autocomplete list dropdown
  },
  autocompleteContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  autocompleteInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 48,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.body,
    fontSize: 14,
  },
  autocompleteListView: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    marginTop: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    minHeight: 300,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  addressDisplay: {
    marginBottom: 16,
  },
  addressLabel: {
    fontSize: 12,
    fontFamily: typography.fontFamily.body,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.body,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    lineHeight: 20,
  },
  confirmButton: {
    backgroundColor: colors.primary.DEFAULT,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: typography.fontFamily.body,
    fontWeight: typography.fontWeight.semibold,
  },
});
