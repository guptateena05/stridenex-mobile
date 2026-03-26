import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { AboutHero } from '@/components/about/AboutHero';
import { WhoWeAre } from '@/components/about/WhoWeAre';
import { VisionMission } from '@/components/about/VisionMission';
import { WhyCreated } from '@/components/about/WhyCreated';
import { Philosophy } from '@/components/about/Philosophy';
import { Approach } from '@/components/about/Approach';
import { Ecosystem } from '@/components/about/Ecosystem';
import { WhatMakesDifferent } from '@/components/about/WhatMakesDifferent';
import { JoinMovement } from '@/components/about/JoinMovement';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

export const AboutScreen = () => {
    return (
        <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
            <PublicHeader />
            <ScrollView style={styles.container}>
                
                <AboutHero />
                <WhoWeAre />
                <VisionMission />
                <WhyCreated />
                <Philosophy />
                <Approach />
                <Ecosystem />
                <WhatMakesDifferent />
                <JoinMovement />

                <PublicFooter />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
});
