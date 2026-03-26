import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { OfferingsSection } from '@/components/home/OfferingsSection';
import { colors } from '@/theme/colors';

export const OfferingsScreen = () => {
    return (
        <View style={styles.container}>
            <PublicHeader />
            <ScrollView style={styles.scroll}>
                <OfferingsSection />
                <PublicFooter />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.light },
    scroll: { flex: 1 },
});
