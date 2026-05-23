// LocationPicker.tsx - FIXED VERSION (Defaults to Jaipur)
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, PermissionsAndroid, Platform, Alert, StyleProp, ViewStyle, TextInput } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region, MarkerDragStartEndEvent } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import { MapPin, Navigation, Map as MapIcon, X, Search } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

// Using OpenStreetMap's Nominatim service - completely free, no API key required
const searchAddress = async (query: string): Promise<any> => {
  try {
    const encodedQuery = encodeURIComponent(query + ", India");
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=5&countrycodes=in&accept-language=en`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
};

const reverseGeocode = async (lat: number, lng: number): Promise<any> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Reverse geocode error:', error);
    return null;
  }
};

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

// JAIPUR, RAJASTHAN - Fixed coordinates
const JAIPUR_COORDINATES = {
  latitude: 26.9124,
  longitude: 75.7873,
};

const DEFAULT_REGION: Region = {
  latitude: JAIPUR_COORDINATES.latitude,
  longitude: JAIPUR_COORDINATES.longitude,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLocation,
  onLocationSelect,
  onClose,
  style
}) => {
  const mapRef = useRef<MapView>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Initialize with Jaipur coordinates
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [markerCoords, setMarkerCoords] = useState(JAIPUR_COORDINATES);
  const [currentAddress, setCurrentAddress] = useState<string>('Jaipur, Rajasthan, India');
  const [parsedLocationData, setParsedLocationData] = useState<Partial<LocationData>>({
    latitude: JAIPUR_COORDINATES.latitude,
    longitude: JAIPUR_COORDINATES.longitude,
    city: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    full_address: 'Jaipur, Rajasthan, India'
  });
  const [loading, setLoading] = useState<boolean>(false);

  // Set initial location for Jaipur
  useEffect(() => {
    if (initialLocation && initialLocation.latitude && initialLocation.longitude) {
      // Use provided initial location if available
      setMarkerCoords({
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
      });
      setRegion({
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      if (initialLocation.address) {
        setCurrentAddress(initialLocation.address);
      } else {
        reverseGeocodeLocation(initialLocation.latitude, initialLocation.longitude);
      }
    } else {
      // Default to Jaipur
      setCurrentAddress('Jaipur, Rajasthan, India');
      setParsedLocationData({
        latitude: JAIPUR_COORDINATES.latitude,
        longitude: JAIPUR_COORDINATES.longitude,
        city: 'Jaipur',
        state: 'Rajasthan',
        country: 'India',
        full_address: 'Jaipur, Rajasthan, India',
        address_line_1: 'Jaipur',
        address_line_2: '',
        pincode: ''
      });
    }
  }, [initialLocation]);

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

  const handleGetCurrentLocation = async (silent: boolean = false) => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      if (!silent) {
        Alert.alert("Permission Denied", "Location permission is required to use this feature.");
      }
      return;
    }

    setLoading(true);
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        animateToLocation(latitude, longitude);
        reverseGeocodeLocation(latitude, longitude);
        setLoading(false);
      },
      (error) => {
        console.error("Geolocation Error:", error);
        if (!silent) {
          Alert.alert("Error", "Could not fetch your current location. Make sure GPS is enabled.");
        }
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const animateToLocation = (latitude: number, longitude: number) => {
    setMarkerCoords({ latitude, longitude });
    setRegion({
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });

    mapRef.current?.animateToRegion(
      {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      500
    );
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert("Error", "Please enter an address to search");
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchAddress(searchQuery);
      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error("Search error:", error);
      Alert.alert("Error", "Failed to search address. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = async (result: any) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    setShowResults(false);
    setSearchQuery(result.display_name);
    animateToLocation(lat, lon);
    await reverseGeocodeLocation(lat, lon);
  };

  const reverseGeocodeLocation = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const data = await reverseGeocode(lat, lng);

      if (data && data.display_name) {
        setCurrentAddress(data.display_name);

        const addr = data.address || {};
        const locationData: LocationData = {
          address_line_1: data.display_name?.split(',')[0] || '',
          address_line_2: '',
          city: addr.city || addr.town || addr.village || '',
          state: addr.state || '',
          country: addr.country || '',
          pincode: addr.postcode || '',
          latitude: lat,
          longitude: lng,
          full_address: data.display_name
        };

        setParsedLocationData(locationData);
      } else {
        setCurrentAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        setParsedLocationData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          full_address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        }));
      }
    } catch (error) {
      console.error("Reverse Geocoding Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const onMarkerDragEnd = (e: MarkerDragStartEndEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    reverseGeocodeLocation(latitude, longitude);
    mapRef.current?.animateToRegion({
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 300);
  };

  const confirmLocation = () => {
    if (parsedLocationData.latitude && parsedLocationData.longitude) {
      onLocationSelect(parsedLocationData as LocationData);
      if (onClose) {
        onClose();
      }
    } else {
      // Fallback - use Jaipur coordinates
      onLocationSelect({
        address_line_1: 'Jaipur',
        address_line_2: '',
        city: 'Jaipur',
        state: 'Rajasthan',
        country: 'India',
        pincode: '',
        latitude: JAIPUR_COORDINATES.latitude,
        longitude: JAIPUR_COORDINATES.longitude,
        full_address: 'Jaipur, Rajasthan, India'
      });
      if (onClose) {
        onClose();
      }
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
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for an address (e.g., Jaipur, Mumbai, Delhi)"
            placeholderTextColor={colors.text.secondary}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (showResults) setShowResults(false);
            }}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Search size={20} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>

        {showResults && searchResults.length > 0 && (
          <View style={styles.resultsContainer}>
            {searchResults.map((result, index) => (
              <TouchableOpacity
                key={index}
                style={styles.resultItem}
                onPress={() => selectSearchResult(result)}
              >
                <MapPin size={16} color={colors.primary.DEFAULT} />
                <Text style={styles.resultText} numberOfLines={2}>
                  {result.display_name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          style={styles.map}
          region={region}
          onMapReady={() => {
            setInitialLoadComplete(true);
            // Animate to Jaipur on map ready if no initial location
            if (!initialLocation && mapRef.current) {
              mapRef.current.animateToRegion(DEFAULT_REGION, 500);
            }
          }}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
        >
          <Marker
            coordinate={markerCoords}
            draggable
            onDragEnd={onMarkerDragEnd}
            title="Company Location"
            description="Drag to adjust location"
          />
        </MapView>

        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={() => handleGetCurrentLocation(false)}
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
          <Text style={styles.addressText} numberOfLines={3}>
            {currentAddress || (loading ? "Loading address..." : "Search for a location or drag the pin")}
          </Text>
          {parsedLocationData.city && (
            <Text style={styles.addressDetail}>
              {[parsedLocationData.city, parsedLocationData.state, parsedLocationData.pincode]
                .filter(Boolean)
                .join(', ')}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={confirmLocation}
          disabled={loading}
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
    fontWeight: '600',
    color: colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    zIndex: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.text.primary,
  },
  searchButton: {
    width: 48,
    height: 48,
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsContainer: {
    position: 'absolute',
    top: 80,
    left: 16,
    right: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxHeight: 200,
    zIndex: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  resultText: {
    flex: 1,
    fontSize: 13,
    color: colors.text.primary,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    minHeight: 300,
    backgroundColor: '#F1F5F9',
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
    zIndex: 1,
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
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.body,
    fontWeight: '500',
    color: colors.text.primary,
    lineHeight: 20,
    marginBottom: 4,
  },
  addressDetail: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
  },
  confirmButton: {
    backgroundColor: colors.primary.DEFAULT,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: typography.fontFamily.body,
    fontWeight: '600',
  },
});