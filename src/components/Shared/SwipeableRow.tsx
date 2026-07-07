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

const ACTION_BUTTON_WIDTH = 70; // Width of each action button

export interface SwipeAction {
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  onPress: () => void;
}

interface SwipeableRowProps {
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  disableSwipe?: boolean;
  editBgColor?: string;
  editTextColor?: string;
  actions?: SwipeAction[];
}

export const SwipeableRow = ({ children, onEdit, onDelete, disableSwipe = false, editBgColor, editTextColor, actions }: SwipeableRowProps) => {
  const hasCustomActions = actions && actions.length > 0;
  const hasEdit = !hasCustomActions && !!onEdit;
  const hasDelete = !hasCustomActions && !!onDelete;
  const activeActionsCount = hasCustomActions ? actions.length : ((hasEdit ? 1 : 0) + (hasDelete ? 1 : 0));
  const swipeLimit = ACTION_BUTTON_WIDTH * activeActionsCount;

  const translateX = useRef(new Animated.Value(0)).current;
  const isOpen = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return !disableSwipe && activeActionsCount > 0 && Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 10;
      },
      onPanResponderGrant: () => {
        translateX.setOffset(isOpen.current ? -swipeLimit : 0);
        translateX.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        if (disableSwipe || activeActionsCount === 0) return;
        let newX = gestureState.dx;
        if (isOpen.current) {
          if (newX > swipeLimit) {
            newX = swipeLimit;
          }
          if (newX < -ACTION_BUTTON_WIDTH) {
            newX = -ACTION_BUTTON_WIDTH;
          }
        } else {
          if (newX > 0) {
            newX = 0;
          }
          if (newX < -swipeLimit - ACTION_BUTTON_WIDTH) {
            newX = -swipeLimit - ACTION_BUTTON_WIDTH;
          }
        }
        translateX.setValue(newX);
      },
      onPanResponderRelease: (_, gestureState) => {
        translateX.flattenOffset();
        const currentTranslateX = (translateX as any)._value;

        if (currentTranslateX > -ACTION_BUTTON_WIDTH * 0.7) {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 40,
            friction: 7,
          }).start();
          isOpen.current = false;
        } else {
          Animated.spring(translateX, {
            toValue: -swipeLimit,
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

  if (activeActionsCount === 0) {
    return <View style={styles.container}>{children}</View>;
  }

  return (
    <View style={styles.container}>
      {/* Background Actions */}
      <View style={[styles.actionsContainer, { width: swipeLimit }]}>
        {hasCustomActions ? (
          actions.map((act, actIdx) => {
            const Icon = act.icon;
            return (
              <TouchableOpacity
                key={actIdx}
                style={[styles.actionButton, { backgroundColor: act.bgColor }]}
                activeOpacity={0.7}
                onPress={() => {
                  closeRow();
                  act.onPress();
                }}
              >
                <Icon size={18} color={act.color} />
                <Text style={[styles.actionText, { color: act.color }]}>{act.label}</Text>
              </TouchableOpacity>
            );
          })
        ) : (
          <>
            {hasEdit && (
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton, editBgColor ? { backgroundColor: editBgColor } : null]}
                activeOpacity={0.7}
                onPress={() => {
                  closeRow();
                  onEdit?.();
                }}
              >
                <Edit3 size={18} color={editTextColor || '#0A8099'} />
                <Text style={[styles.actionText, { color: editTextColor || '#0A8099' }]}>Edit</Text>
              </TouchableOpacity>
            )}

            {hasDelete && (
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                activeOpacity={0.7}
                onPress={() => {
                  closeRow();
                  onDelete?.();
                }}
              >
                <Trash2 size={18} color="#EF4444" />
                <Text style={[styles.actionText, { color: '#EF4444' }]}>Delete</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      {/* Foreground Content */}
      <Animated.View
        style={{
          transform: [{ translateX }],
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
    borderRadius: 24,
    marginBottom: 16,
  },
  actionsContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
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
