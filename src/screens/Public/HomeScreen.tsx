import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { HeroSection } from '@/components/home/HeroSection';
import { OfferingsSection } from '@/components/home/OfferingsSection';
import { JourneySection } from '@/components/home/JourneySection';
import { PathwaysSection } from '@/components/home/PathwaysSection';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { ImpactSection } from '@/components/home/ImpactSection';
import { StakeholdersSection } from '@/components/home/StakeholdersSection';
import { WhyDifferentSection } from '@/components/home/WhyDifferentSection';
import { FinalCTASection } from '@/components/home/FinalCTASection';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';


export const HomeScreen = () => {

  return (
    <View style={styles.mainWrapper}>
      <PublicHeader />
      <ScrollView style={styles.container}>
        <HeroSection />
      
      <OfferingsSection />

      <JourneySection />
      <PathwaysSection />
      <HowItWorksSection />
      <ImpactSection />
      <StakeholdersSection />
      <WhyDifferentSection />
      <FinalCTASection />

        <PublicFooter />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  }
});
