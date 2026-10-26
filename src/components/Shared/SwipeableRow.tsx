import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Animated,
  TouchableOpacity,
  Text
} from 'react-native';
import { Edit3, Trash2, ChevronsLeft } from 'lucide-react-native';

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
  const [isOpenState, setIsOpenState] = useState(false);
  const nudgeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (disableSwipe || activeActionsCount === 0) return;

    // Subtle discoverability nudge on mount to attract attention to the swipe action
    const timer = setTimeout(() => {
      Animated.sequence([
        Animated.timing(nudgeAnim, {
          toValue: -5,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(nudgeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(nudgeAnim, {
          toValue: -4,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(nudgeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }, 400);

    return () => clearTimeout(timer);
  }, [disableSwipe, activeActionsCount]);

  const openRow = () => {
    Animated.spring(translateX, {
      toValue: -swipeLimit,
      useNativeDriver: true,
      tension: 40,
      friction: 7,
    }).start();
    isOpen.current = true;
    setIsOpenState(true);
  };

  const closeRow = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 40,
      friction: 7,
    }).start();
    isOpen.current = false;
    setIsOpenState(false);
  };

  const toggleRow = () => {
    if (isOpen.current) {
      closeRow();
    } else {
      openRow();
    }
  };

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
          closeRow();
        } else {
          openRow();
        }
      },
    })
  ).current;

  if (activeActionsCount === 0) {
    return <View style={styles.container}>{children}</View>;
  }

  const indicatorColor = editTextColor || '#0A8099';

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

        {/* Visual Guidance: Swipe Affordance Tab */}
        {!disableSwipe && activeActionsCount > 0 && (
          <Animated.View
            style={[
              styles.swipeAffordance,
              {
                opacity: translateX.interpolate({
                  inputRange: [-ACTION_BUTTON_WIDTH * 0.4, 0],
                  outputRange: [0, 1],
                  extrapolate: 'clamp',
                }),
                transform: [
                  { translateY: -14 },
                  { translateX: nudgeAnim },
                ],
              },
            ]}
            pointerEvents={isOpenState ? 'none' : 'auto'}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={toggleRow}
              style={[
                styles.swipeAffordanceButton,
                editBgColor ? { backgroundColor: editBgColor } : null,
              ]}
              hitSlop={{ top: 12, bottom: 12, left: 14, right: 10 }}
            >
              <ChevronsLeft size={13} color={indicatorColor} strokeWidth={2.5} />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Tap outside to close when swiped open */}
        {isOpenState && (
          <TouchableOpacity
            activeOpacity={1}
            onPress={closeRow}
            style={styles.openBackdrop}
          />
        )}
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
  swipeAffordance: {
    position: 'absolute',
    right: 0,
    top: '50%',
    zIndex: 10,
  },
  swipeAffordanceButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    borderWidth: 1,
    borderRightWidth: 0,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    paddingVertical: 7,
    paddingLeft: 4,
    paddingRight: 2,
    shadowColor: '#0A8099',
    shadowOffset: { width: -1, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 3,
  },
  openBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 9,
  },
});
