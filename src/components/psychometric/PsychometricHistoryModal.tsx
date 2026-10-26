import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { X, Sparkles, RefreshCw } from 'lucide-react-native';
import { getStudentPsychometricResults, PsychometricHistoryItem } from '@/api/psychometric.services';

interface PsychometricHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentEmail?: string;
}

const TRACK = {
    job: { fill: "#6366F1", light: "#EEF2FF", text: "#4338CA", label: "Job", emoji: "💼" },
    startup: { fill: "#F59E0B", light: "#FFFBEB", text: "#B45309", label: "Startup", emoji: "🚀" },
    higher_ed: { fill: "#14B8A6", light: "#F0FDFA", text: "#0F766E", label: "Higher Ed", emoji: "🎓" },
};
type TrackKey = keyof typeof TRACK;

function parseTags(pt?: string | null): TrackKey[] {
    const s = (pt || "").toLowerCase();
    const out: TrackKey[] = [];
    if (s.includes("job")) out.push("job");
    if (s.includes("entrepreneur") || s.includes("startup")) out.push("startup");
    if (s.includes("higher") || s.includes("edu")) out.push("higher_ed");
    return out;
}

function dominantKey(item: PsychometricHistoryItem): TrackKey | null {
    const scores: [TrackKey, number][] = [
        ["job", item.job_score ?? 0],
        ["startup", item.entrepreneurship_score ?? 0],
        ["higher_ed", item.higher_education_score ?? 0],
    ];
    const best = scores.reduce((a, b) => (b[1] > a[1] ? b : a));
    return best[1] > 0 ? best[0] : null;
}

function fmtDate(iso: string) {
    if (!iso) return { date: "N/A", time: "", rel: "" };
    const d = new Date(iso.replace(" ", "T"));
    const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
    const rel = days === 0 ? "Today" : days === 1 ? "Yesterday"
        : days < 7 ? `${days}d ago` : days < 30 ? `${Math.floor(days / 7)}w ago` : `${Math.floor(days / 30)}mo ago`;
    return {
        date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        rel,
    };
}

function HistoryCard({ item, idx }: { item: PsychometricHistoryItem; idx: number }) {
    const dom = dominantKey(item);
    const domTrack = dom ? TRACK[dom] : null;
    const tags = parseTags(item.profile_type);
    const { date, time, rel } = fmtDate(item.creation);
    const pct = Math.round(item.percentage ?? item.score ?? 0);
    const j = item.job_score ?? 0;
    const e = item.entrepreneurship_score ?? 0;
    const h = item.higher_education_score ?? 0;
    const hasScores = j + e + h > 0;

    const ringColor = pct >= 70 ? "#22C55E" : pct >= 45 ? "#F59E0B" : "#F87171";
    const ringBg = pct >= 70 ? "#F0FDF4" : pct >= 45 ? "#FFFBEB" : "#FEF2F2";

    return (
        <View style={styles.cardContainer}>
            {/* Left vertical color accent */}
            <View style={[styles.cardAccent, { backgroundColor: domTrack ? domTrack.fill : "#CBD5E1" }]} />

            <View style={styles.cardBody}>
                {/* Top row */}
                <View style={styles.cardTopRow}>
                    <View style={styles.cardInfoLeft}>
                        {/* Index badge */}
                        <View style={[styles.indexBadge, { backgroundColor: domTrack ? domTrack.light : "#F1F5F9" }]}>
                            <Text style={[styles.indexBadgeText, { color: domTrack ? domTrack.text : "#64748B" }]}>
                                {idx + 1}
                            </Text>
                        </View>

                        <View style={styles.tagsCol}>
                            {tags.length > 0 ? (
                                <View style={styles.tagsRow}>
                                    {tags.map((key) => {
                                        const t = TRACK[key];
                                        return (
                                            <View key={key} style={[styles.tagBadge, { backgroundColor: t.light }]}>
                                                <Text style={[styles.tagBadgeText, { color: t.text }]}>
                                                    {t.emoji} {t.label}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            ) : item.profile_type ? (
                                <View style={[styles.tagBadge, { backgroundColor: "#F8FAFC" }]}>
                                    <Text style={[styles.tagBadgeText, { color: "#64748B" }]}>
                                        {item.profile_type}
                                    </Text>
                                </View>
                            ) : (
                                <View style={[styles.tagBadge, { backgroundColor: "#F8FAFC" }]}>
                                    <Text style={[styles.tagBadgeText, { color: "#94A3B8" }]}>
                                        No profile assigned
                                    </Text>
                                </View>
                            )}

                            {/* Date */}
                            <View style={styles.dateRow}>
                                <Text style={styles.dateText}>{date} · {time}</Text>
                                {rel ? (
                                    <View style={styles.relBadge}>
                                        <Text style={styles.relBadgeText}>{rel}</Text>
                                    </View>
                                ) : null}
                            </View>
                        </View>
                    </View>

                    {/* Score circle */}
                    <View style={[styles.scoreCircle, { borderColor: ringColor, backgroundColor: ringBg }]}>
                        <Text style={[styles.scoreCircleText, { color: ringColor }]}>{pct}%</Text>
                    </View>
                </View>

                {/* Score bars */}
                {hasScores ? (
                    <View style={styles.barsContainer}>
                        {([
                            ["job", "💼 Job", j],
                            ["startup", "🚀 Startup", e],
                            ["higher_ed", "🎓 Higher", h],
                        ] as [TrackKey, string, number][]).map(([key, shortLabel, val]) => {
                            const t = TRACK[key];
                            const fillWidth = Math.min(100, Math.max(0, val));
                            return (
                                <View key={key} style={styles.barRow}>
                                    <Text style={styles.barLabel}>{shortLabel}</Text>
                                    <View style={styles.barTrack}>
                                        <View style={[styles.barFill, { width: `${fillWidth}%`, backgroundColor: t.fill }]} />
                                    </View>
                                    <Text style={styles.barPercent}>{val.toFixed(1)}%</Text>
                                </View>
                            );
                        })}
                    </View>
                ) : (
                    <Text style={styles.noScoresText}>Score breakdown not available for this attempt.</Text>
                )}
            </View>
        </View>
    );
}

export default function PsychometricHistoryModal({ isOpen, onClose, studentEmail }: PsychometricHistoryModalProps) {
    const [results, setResults] = useState<PsychometricHistoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            let emailToUse = studentEmail;
            if (!emailToUse) {
                emailToUse = (await AsyncStorage.getItem('userEmail')) || (await AsyncStorage.getItem('userName')) || undefined;
            }
            const res = await getStudentPsychometricResults(emailToUse);
            setResults(res.data || []);
        } catch (err) {
            console.error("Error fetching assessment history:", err);
            setError("Couldn't load your history. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isOpen) return;
        fetchHistory();
    }, [isOpen, studentEmail]);

    const real = results.filter(r => (r.job_score ?? 0) + (r.entrepreneurship_score ?? 0) + (r.higher_education_score ?? 0) > 0);
    const latest = real[0];
    const best = real.length ? Math.round(Math.max(...real.map(r => r.percentage ?? r.score ?? 0))) : 0;
    const avg = real.length ? Math.round(real.reduce((s, r) => s + (r.percentage ?? r.score ?? 0), 0) / real.length) : 0;

    return (
        <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    {/* Header matching Web Dashboard */}
                    <View style={styles.header}>
                        <View style={styles.headerTopRow}>
                            <View style={styles.headerTitleCol}>
                                <Text style={styles.headerCategoryText}>ASSESSMENT HISTORY</Text>
                                <Text style={styles.headerMainTitle}>Your Progress</Text>
                                {!loading && (
                                    <Text style={styles.headerSubtitleCount}>
                                        {results.length} attempt{results.length !== 1 ? "s" : ""}{real.length ? ` · ${real.length} scored` : ""}
                                    </Text>
                                )}
                            </View>
                            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
                                <X size={16} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>

                        {/* Top Stat Pills */}
                        {!loading && real.length > 0 && (
                            <View style={styles.statsRow}>
                                <View style={styles.statCard}>
                                    <Text style={[styles.statValue, { color: "#818CF8" }]}>{real.length}</Text>
                                    <Text style={styles.statLabel}>ATTEMPTS</Text>
                                </View>
                                <View style={styles.statCard}>
                                    <Text style={[styles.statValue, { color: "#34D399" }]}>{best}%</Text>
                                    <Text style={styles.statLabel}>BEST</Text>
                                </View>
                                <View style={styles.statCard}>
                                    <Text style={[styles.statValue, { color: "#FBBF24" }]}>{avg}%</Text>
                                    <Text style={styles.statLabel}>AVERAGE</Text>
                                </View>
                            </View>
                        )}

                        {/* Latest Profile Banner */}
                        {!loading && latest?.profile_type && (
                            <View style={styles.latestProfileCard}>
                                <Text style={styles.sparkleIcon}>✨</Text>
                                <View style={styles.latestProfileTextCol}>
                                    <Text style={styles.latestProfileLabel}>LATEST PROFILE</Text>
                                    <Text style={styles.latestProfileValue} numberOfLines={1}>
                                        {latest.profile_type}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Scrollable Body */}
                    <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
                        {loading ? (
                            <View style={styles.centerContainer}>
                                <ActivityIndicator size="large" color="#4F46E5" />
                                <Text style={styles.loadingText}>Loading assessment history...</Text>
                            </View>
                        ) : error ? (
                            <View style={styles.centerContainer}>
                                <Text style={styles.errorText}>{error}</Text>
                                <TouchableOpacity style={styles.retryBtn} onPress={fetchHistory} activeOpacity={0.8}>
                                    <RefreshCw size={14} color="#FFF" style={{ marginRight: 6 }} />
                                    <Text style={styles.retryBtnText}>Try Again</Text>
                                </TouchableOpacity>
                            </View>
                        ) : results.length === 0 ? (
                            <View style={styles.centerContainer}>
                                <View style={styles.emptyIcon}>
                                    <Sparkles size={28} color="#94A3B8" />
                                </View>
                                <Text style={styles.emptyTitle}>No Assessments Yet</Text>
                                <Text style={styles.emptyDesc}>Take the psychometric test to discover your career strengths and track your journey.</Text>
                            </View>
                        ) : (
                            <View style={styles.list}>
                                {results.map((item, idx) => (
                                    <HistoryCard key={item.name || idx} item={item} idx={idx} />
                                ))}
                            </View>
                        )}
                    </ScrollView>

                    {/* Footer matching Web */}
                    <View style={styles.footer}>
                        <Text style={styles.footerNoteText}>
                            Scores reflect your responses at the time of each attempt
                        </Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    modalContent: {
        width: '100%',
        maxWidth: 480,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        maxHeight: '88%',
        overflow: 'hidden',
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
    },
    header: {
        backgroundColor: '#1E293B',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    headerTitleCol: {
        flex: 1,
        marginRight: 12,
    },
    headerCategoryText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#94A3B8',
        letterSpacing: 1.5,
        marginBottom: 4,
    },
    headerMainTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    headerSubtitleCount: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 4,
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 10,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 12,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: {
        fontSize: 17,
        fontWeight: '800',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 9,
        fontWeight: '700',
        color: '#94A3B8',
        letterSpacing: 0.8,
    },
    latestProfileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 9,
        gap: 10,
    },
    sparkleIcon: {
        fontSize: 16,
    },
    latestProfileTextCol: {
        flex: 1,
    },
    latestProfileLabel: {
        fontSize: 9,
        fontWeight: '800',
        color: '#94A3B8',
        letterSpacing: 1,
        marginBottom: 1,
    },
    latestProfileValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#F1F5F9',
    },
    body: {
        padding: 16,
        gap: 12,
        backgroundColor: '#F8FAFC',
    },
    centerContainer: {
        paddingVertical: 50,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
    },
    errorText: {
        fontSize: 13,
        color: '#EF4444',
        textAlign: 'center',
    },
    retryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4F46E5',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 10,
    },
    retryBtnText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '600',
    },
    emptyIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
    },
    emptyDesc: {
        fontSize: 13,
        color: '#64748B',
        textAlign: 'center',
        maxWidth: 280,
        lineHeight: 18,
    },
    list: {
        gap: 12,
    },
    cardContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        overflow: 'hidden',
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    cardAccent: {
        width: 4,
    },
    cardBody: {
        flex: 1,
        padding: 14,
    },
    cardTopRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 8,
    },
    cardInfoLeft: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        flex: 1,
    },
    indexBadge: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    indexBadgeText: {
        fontSize: 11,
        fontWeight: '800',
    },
    tagsCol: {
        flex: 1,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 6,
    },
    tagBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    tagBadgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
    },
    dateText: {
        fontSize: 11,
        color: '#94A3B8',
    },
    relBadge: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 5,
        paddingVertical: 1,
        borderRadius: 4,
    },
    relBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#94A3B8',
    },
    scoreCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scoreCircleText: {
        fontSize: 13,
        fontWeight: '900',
    },
    barsContainer: {
        marginTop: 12,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        gap: 8,
    },
    barRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    barLabel: {
        width: 72,
        fontSize: 11,
        fontWeight: '600',
        color: '#64748B',
    },
    barTrack: {
        flex: 1,
        height: 6,
        backgroundColor: '#F1F5F9',
        borderRadius: 3,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 3,
    },
    barPercent: {
        width: 48,
        fontSize: 11,
        fontWeight: '700',
        color: '#475569',
        textAlign: 'right',
    },
    noScoresText: {
        marginTop: 10,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        fontSize: 11,
        color: '#94A3B8',
        fontStyle: 'italic',
    },
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        backgroundColor: '#FFFFFF',
    },
    footerNoteText: {
        fontSize: 11,
        color: '#94A3B8',
        textAlign: 'center',
    },
});
