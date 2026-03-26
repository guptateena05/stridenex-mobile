import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Dimensions, Image, TouchableOpacity } from 'react-native';
import { Sparkles, ArrowRight, Zap, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Button } from '@/components/Shared/Button';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, borderRadius } from '@/theme/spacing';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const heroSlides = [
    {
        id: 1,
        microTagline: "Discover Your Direction. Build Real Skills. Achieve Real Careers.",
        title: "Bridge Your Learning to\nReal Industry Success",
        description: "StrideNex helps students move beyond degrees and certifications by identifying their real interests, building practical skills, and guiding them toward careers.",
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        stat: "10k+",
        statLabel: "Active Students",
        icon: "🚀"
    },
    {
        id: 2,
        microTagline: "Industry-Aligned Learning. Real-World Results.",
        title: "Transform Your Future with\nReal-World Skills",
        description: "Join thousands of students who have accelerated their careers through our industry-connected programs, mentorship, and practical project experience.",
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80",
        stat: "500+",
        statLabel: "Partner Institutes",
        icon: "⚡"
    },
    {
        id: 3,
        microTagline: "From Learning to Earning. Faster.",
        title: "Launch Your Career with\nIndustry Connections",
        description: "Connect directly with industry partners, work on real projects, and build a portfolio that employers trust. Your journey to career success starts here.",
        image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        stat: "200+",
        statLabel: "Industry Partners",
        icon: "🔥"
    }
];

export const HeroSection = () => {
    const navigation = useNavigation<any>();
    const scrollRef = useRef<ScrollView>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    // Floating animation
    const floatAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
                Animated.timing(floatAnim, { toValue: 0, duration: 2500, useNativeDriver: true })
            ])
        ).start();
    }, []);

    const handleScroll = (e: any) => {
        const x = e.nativeEvent.contentOffset.x;
        setActiveIndex(Math.round(x / width));
    };

    const nextSlide = () => {
        let i = activeIndex + 1;
        if (i >= heroSlides.length) i = 0;
        scrollRef.current?.scrollTo({ x: i * width, animated: true });
    };

    const prevSlide = () => {
        let i = activeIndex - 1;
        if (i < 0) i = heroSlides.length - 1;
        scrollRef.current?.scrollTo({ x: i * width, animated: true });
    };

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {heroSlides.map((slide, index) => (
                    <View key={slide.id} style={styles.slide}>
                        <View style={styles.microTagBox}>
                            <Sparkles size={14} color={colors.primary.DEFAULT} style={{ marginRight: 6 }} />
                            <Text style={styles.microTagText}>{slide.microTagline}</Text>
                        </View>

                        <Text style={styles.title}>{slide.title}</Text>
                        <Text style={styles.description}>{slide.description}</Text>

                        <View style={styles.buttonRow}>
                            <Button 
                                title="Start Your Career Journey" 
                                variant="accent" 
                                onPress={() => navigation.navigate('Signup')} 
                                style={{ marginBottom: spacing.sm, width: '100%' }}
                            />
                            <Button 
                                title="Partner as Institute" 
                                variant="outline" 
                                onPress={() => {}} 
                                style={{ marginBottom: spacing.sm, width: '100%' }}
                            />
                        </View>

                        <View style={styles.imageContainer}>
                            <Image source={{ uri: slide.image }} style={styles.heroImg} />
                            
                            <Animated.View style={[styles.floatingBadge, { transform: [{ translateY: floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -15] }) }] }]}>
                                <Text style={styles.emoji}>{slide.icon}</Text>
                                <View>
                                    <Text style={styles.statText}>{slide.stat}</Text>
                                    <Text style={styles.statLabel}>{slide.statLabel}</Text>
                                </View>
                            </Animated.View>

                            <Animated.View style={[styles.floatingBadgeBottom, { transform: [{ translateY: floatAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 0] }) }] }]}>
                                <Zap color="#eab308" size={20} />
                                <Text style={styles.badgeBottomTxt}>Industry-Aligned</Text>
                            </Animated.View>
                        </View>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.controlsRow}>
                <TouchableOpacity onPress={prevSlide} style={styles.arrowBtn}>
                    <ChevronLeft color={colors.primary.DEFAULT} />
                </TouchableOpacity>
                <View style={styles.dotsRow}>
                    {heroSlides.map((_, i) => (
                        <View key={i} style={[styles.dot, i === activeIndex && styles.activeDot]} />
                    ))}
                </View>
                <TouchableOpacity onPress={nextSlide} style={styles.arrowBtn}>
                    <ChevronRight color={colors.primary.DEFAULT} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { width: '100%', backgroundColor: colors.background.light, paddingVertical: spacing.xl },
    slide: { width, paddingHorizontal: spacing.lg, alignItems: 'flex-start' },
    microTagBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: (colors.primary.DEFAULT) + '15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: spacing.lg },
    microTagText: { color: colors.primary.DEFAULT, fontSize: typography.fontSize.xs, fontWeight: 'bold' },
    title: { fontSize: typography.fontSize['3xl'], fontWeight: '900', color: colors.navy, marginBottom: spacing.md, fontFamily: typography.fontFamily.display },
    description: { fontSize: typography.fontSize.base, color: colors.text.secondary, marginBottom: spacing.xl, lineHeight: 24 },
    buttonRow: { width: '100%', marginBottom: spacing.xl },
    imageContainer: { width: '100%', aspectRatio: 4/5, borderRadius: 30, backgroundColor: '#ccc', position: 'relative', marginTop: 20, marginBottom: 40 },
    heroImg: { width: '100%', height: '100%', borderRadius: 30 },
    floatingBadge: { position: 'absolute', top: -20, right: -10, backgroundColor: '#fff', padding: spacing.md, borderRadius: borderRadius.xl, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderColor: colors.border },
    emoji: { fontSize: 24, marginRight: 10 },
    statText: { fontSize: 20, fontWeight: '900', color: colors.navy },
    statLabel: { fontSize: 10, color: colors.text.secondary },
    floatingBadgeBottom: { position: 'absolute', bottom: -20, left: -10, backgroundColor: '#fff', padding: spacing.md, borderRadius: borderRadius.xl, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5, flexDirection: 'row', alignItems: 'center', borderColor: colors.border, borderWidth: 1 },
    badgeBottomTxt: { fontSize: 12, fontWeight: 'bold', color: colors.navy, marginLeft: 6 },
    controlsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
    arrowBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3, marginHorizontal: spacing.md },
    dotsRow: { flexDirection: 'row', alignItems: 'center' },
    dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.border, marginHorizontal: 4 },
    activeDot: { width: 30, backgroundColor: colors.primary.DEFAULT }
});
