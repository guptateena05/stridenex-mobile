import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Animated,
  TouchableOpacity,
  Text
} from 'react-native';
import { Edit3, Trash2 } from 'lucide-react-native';

const ACTION_BUTTON_WIDTH = 70; // Width of each action button (Edit, Delete)

interface SwipeableRowProps {
  children: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
  disableSwipe?: boolean;
}

export const SwipeableRow = ({ children, onEdit, onDelete, disableSwipe = false }: SwipeableRowProps) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const isOpen = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disableSwipe,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only trigger horizontal swipe when drag is horizontal
        return !disableSwipe && Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 10;
      },
      onPanResponderGrant: () => {
        translateX.setOffset(isOpen.current ? -ACTION_BUTTON_WIDTH * 2 : 0);
        translateX.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        if (disableSwipe) return;
        let newX = gestureState.dx;
        if (isOpen.current) {
          if (newX > ACTION_BUTTON_WIDTH * 2) {
            newX = ACTION_BUTTON_WIDTH * 2;
          }
          if (newX < -ACTION_BUTTON_WIDTH) {
            newX = -ACTION_BUTTON_WIDTH;
          }
        } else {
          if (newX > 0) {
            newX = 0;
          }
          if (newX < -ACTION_BUTTON_WIDTH * 3) {
            newX = -ACTION_BUTTON_WIDTH * 3;
          }
        }
        translateX.setValue(newX);
      },
      onPanResponderRelease: (_, gestureState) => {
        translateX.flattenOffset();
        const currentTranslateX = (translateX as any)._value;

        if (currentTranslateX > -ACTION_BUTTON_WIDTH) {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 40,
            friction: 7,
          }).start();
          isOpen.current = false;
        } else {
          Animated.spring(translateX, {
            toValue: -ACTION_BUTTON_WIDTH * 2,
            useNativeDriver: true,
            tension: 40,
            friction: 7,
          }).start();
          isOpen.current = true;
        }
      },
    })
  ).current;

  const closeRow = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 40,
      friction: 7,
    }).start();
    isOpen.current = false;
  };

  return (
    <View style={styles.container}>
      {/* Background Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          activeOpacity={0.7}
          onPress={() => {
            closeRow();
            onEdit();
          }}
        >
          <Edit3 size={18} color="#0A8099" />
          <Text style={[styles.actionText, { color: '#0A8099' }]}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          activeOpacity={0.7}
          onPress={() => {
            closeRow();
            onDelete();
          }}
        >
          <Trash2 size={18} color="#EF4444" />
          <Text style={[styles.actionText, { color: '#EF4444' }]}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Foreground Content */}
      <Animated.View
        style={{
          transform: [{ translateX }],
          backgroundColor: '#F8FAFC',
        }}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 16,
    marginBottom: 16,
  },
  actionsContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: ACTION_BUTTON_WIDTH * 2,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'flex-end',
    backgroundColor: '#F1F5F9',
  },
  actionButton: {
    width: ACTION_BUTTON_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  editButton: {
    backgroundColor: '#E6F5F8',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
  },
  actionText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
});
