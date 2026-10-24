import React, { useState, useEffect } from 'react';
import { 
    Modal, 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    ScrollView, 
    ActivityIndicator, 
    TextInput,
    Dimensions,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { X, ChevronLeft, ChevronRight, BrainCircuit, CheckCircle2, Sparkles, Briefcase, Rocket, GraduationCap, HelpCircle } from 'lucide-react-native';
import { 
    getTests, 
    startNewTest, 
    loadQuestion, 
    nextQuestion, 
    previousQuestion, 
    submitTest, 
    QuestionData, 
    SubmitTestResult 
} from '@/api/psychometric.services';
import { colors } from '@/theme/colors';

const { width } = Dimensions.get('window');

interface PsychometricTestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCompleted: () => void;
    studentEmail?: string;
    isMandatory?: boolean;
}

// Maps backend result strings to our self-assessment keys for comparison
const RESULT_CATEGORY_MAP: Record<string, string> = {
    job: "job",
    "job oriented": "job",
    "job-oriented": "job",
    startup: "startup",
    "startup oriented": "startup",
    "startup-oriented": "startup",
    entrepreneur: "startup",
    entrepreneurship: "startup",
    "higher education": "higher_ed",
    "higher ed": "higher_ed",
    "higher education oriented": "higher_ed",
    academic: "higher_ed",
};

const SELF_ASSESSMENT_OPTIONS = [
    {
        id: "job",
        emoji: "💼",
        label: "Job Oriented",
        desc: "I thrive in structured environments, working for a company with clear goals and stability.",
        color: "#2563EB",
        bg: "#EFF6FF",
        border: "#93C5FD",
        badge: "#3B82F6",
        textColor: "#1D4ED8"
    },
    {
        id: "startup",
        emoji: "🚀",
        label: "Startup / Entrepreneur",
        desc: "I love building things from scratch, taking risks, and turning ideas into reality.",
        color: "#EA580C",
        bg: "#FFF7ED",
        border: "#FDBA74",
        badge: "#F97316",
        textColor: "#C2410C"
    },
    {
        id: "higher_ed",
        emoji: "🎓",
        label: "Higher Education",
        desc: "I'm passionate about research, academia, or deepening expertise through advanced studies.",
        color: "#7C3AED",
        bg: "#F5F3FF",
        border: "#C4B5FD",
        badge: "#8B5CF6",
        textColor: "#6D28D9"
    },
    {
        id: "unsure",
        emoji: "🤔",
        label: "Not Sure Yet",
        desc: "I'm still figuring it out — that's exactly why I'm here!",
        color: "#475569",
        bg: "#F8FAFC",
        border: "#CBD5E1",
        badge: "#64748B",
        textColor: "#334155"
    },
];

function getResultCategory(result: string): string {
    const lower = (result || "").toLowerCase().replace(/[^a-z\s-]/g, "").trim();
    for (const [key, val] of Object.entries(RESULT_CATEGORY_MAP)) {
        if (lower.includes(key)) return val;
    }
    return "unknown";
}

function buildComparisonMessage(
    selfId: string,
    resultCategory: string,
    resultLabel: string
): { matched: boolean; headline: string; body: string } {
    const selfOption = SELF_ASSESSMENT_OPTIONS.find((o) => o.id === selfId);
    const selfLabel = selfOption?.label || "your choice";

    if (selfId === "unsure") {
        return {
            matched: false,
            headline: "Mystery solved! 🎯",
            body: `You said you weren't sure — and now you have your answer. The assessment reveals you are most aligned with ${resultLabel}. Now you know where your strengths truly lie!`,
        };
    }

    const matched = selfId === resultCategory;

    if (matched) {
        return {
            matched: true,
            headline: "You nailed it! 🎉",
            body: `You called it! Before the test, you believed you were ${selfLabel} — and the assessment agrees. Your instincts about yourself are spot on. Trust that!`,
        };
    }

    return {
        matched: false,
        headline: "Interesting twist! 🔍",
        body: `You came in thinking you were ${selfLabel}, but the assessment tells a different story — you're actually most aligned with ${resultLabel}. That's not a bad thing; it's a powerful insight. Sometimes we surprise ourselves!`,
    };
}

export default function PsychometricTestModal({
    isOpen,
    onClose,
    onCompleted,
    studentEmail,
    isMandatory = false
}: PsychometricTestModalProps) {
    // Screen flow: "intro" → "test" → (results shown inline)
    const [step, setStep] = useState<"intro" | "test">("intro");
    const [selfAssessment, setSelfAssessment] = useState<string | null>(null);

    const [screenName, setScreenName] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [question, setQuestion] = useState<QuestionData | null>(null);
    const [questionNumber, setQuestionNumber] = useState<number>(1);
    const [totalEstimated, setTotalEstimated] = useState<number | null>(null);

    // Selection states
    const [selectedOption, setSelectedOption] = useState<string | string[]>("");
    const [userInput, setUserInput] = useState<string>("");
    const [openEnded, setOpenEnded] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");

    // Results State
    const [isFinished, setIsFinished] = useState<boolean>(false);
    const [testResult, setTestResult] = useState<SubmitTestResult | null>(null);

    useEffect(() => {
        if (isOpen) {
            setStep("intro");
            setSelfAssessment(null);
            setScreenName(null);
            setQuestion(null);
            setQuestionNumber(1);
            setTotalEstimated(null);
            setIsFinished(false);
            setTestResult(null);
            clearSelections();
        }
    }, [isOpen]);

    const handleBeginTest = async (selfId: string) => {
        setSelfAssessment(selfId);
        setStep("test");
        await initTest();
    };

    const initTest = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const tests = await getTests();
            const testName = tests && tests.length > 0 ? tests[0].name : "Psychometric Career Assessment";

            const response = await startNewTest(testName, studentEmail);
            
            if (response?.status === "quota_exceeded") {
                setErrorMessage(response.message || "You have exceeded your psychometric test limit. Please upgrade your plan.");
                setLoading(false);
                return;
            }

            // Extract string session ID safely (matches web)
            const sid = response?.test_screen || response?.name || response?.screen_name || (typeof response === "string" ? response : null);
            if (!sid || typeof sid !== "string") {
                throw new Error("Invalid session ID returned");
            }
            setScreenName(sid);

            const qData = await loadQuestion(sid);
            if (!qData) throw new Error("No question data returned");

            setQuestion(qData);
            setQuestionNumber(1);
            if (qData.total_questions) {
                setTotalEstimated(qData.total_questions);
            } else {
                setTotalEstimated(15);
            }
        } catch (err: any) {
            console.error("Failed to initialize psychometric test:", err);
            setErrorMessage("Could not load test session. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async () => {
        if (!screenName || !question) return;

        const qType = question.question_type;
        if (qType === "Choices" && (!selectedOption || (Array.isArray(selectedOption) && selectedOption.length === 0))) {
            setErrorMessage("Please select an option before proceeding.");
            return;
        }
        if (qType === "User Input" && !userInput.trim()) {
            setErrorMessage("Please type your response.");
            return;
        }
        if (qType === "Open Ended" && !openEnded.trim()) {
            setErrorMessage("Please provide your answer.");
            return;
        }

        try {
            setSubmitting(true);
            setErrorMessage("");

            const res = await nextQuestion({
                screen_name: screenName,
                selected_option: selectedOption,
                user_input: userInput,
                open_ended: openEnded,
            });

            if (res && res.completed) {
                const resultData = await submitTest(screenName, studentEmail);
                setTestResult(resultData);
                setIsFinished(true);
                return;
            }

            setQuestion(res);
            setQuestionNumber((prev) => prev + 1);
            if (res.total_questions) {
                setTotalEstimated(res.total_questions);
            }
            clearSelections();
        } catch (err: any) {
            console.error("Error advancing question:", err);
            setErrorMessage("Failed to save answer. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handlePrevious = async () => {
        if (!screenName || questionNumber <= 1) return;

        try {
            setSubmitting(true);
            setErrorMessage("");

            const res = await previousQuestion(screenName);
            setQuestion(res);
            setQuestionNumber((prev) => Math.max(1, prev - 1));

            if (res.saved_response) {
                setSelectedOption(res.saved_response);
                setUserInput(res.saved_response);
                setOpenEnded(res.saved_response);
            } else {
                clearSelections();
            }
        } catch (err: any) {
            console.error("Error loading previous question:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const clearSelections = () => {
        setSelectedOption("");
        setUserInput("");
        setOpenEnded("");
        setErrorMessage("");
    };

    const handleOptionSelect = (opt: string) => {
        setErrorMessage("");
        setSelectedOption(opt);
    };

    const handleFinishAndClose = () => {
        if (isFinished) {
            onCompleted();
        }
        onClose();
    };

    const cleanQuestionText = (raw: string) => {
        if (!raw) return "";
        return raw.replace(/<[^>]*>?/gm, "").trim();
    };

    if (!isOpen) return null;

    const totalCount = totalEstimated || 15;
    const isLastQuestion = questionNumber === totalCount || (question && question.is_last);

    // Derived comparison message for results
    const comparison = isFinished && testResult && selfAssessment
        ? buildComparisonMessage(
            selfAssessment,
            getResultCategory(testResult.result || ""),
            testResult.result || ""
        )
        : null;

    const renderProgressBar = () => {
        const progress = Math.min(100, (questionNumber / totalCount) * 100);
        return (
            <View style={styles.progressBarContainer}>
                <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>
        );
    };

    // ─── INTRO VIEW ──────────────────────────────────────────────────────────
    const renderIntroView = () => (
        <ScrollView contentContainerStyle={styles.introContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.introHero}>
                <Text style={styles.introHeroEmoji}>🌟</Text>
                <Text style={styles.introHeroTitle}>Before we begin...</Text>
                <Text style={styles.introHeroSubtitle}>
                    Every great story starts with a hunch. What do you think your career personality is?
                </Text>
                <Text style={styles.introHeroHighlight}>Pick one — we'll see if the test agrees!</Text>
            </View>

            <View style={styles.introOptionsGrid}>
                {SELF_ASSESSMENT_OPTIONS.map((opt) => {
                    const isSelected = selfAssessment === opt.id;
                    return (
                        <TouchableOpacity
                            key={opt.id}
                            style={[
                                styles.introOptionCard,
                                { backgroundColor: opt.bg, borderColor: isSelected ? opt.color : '#E2E8F0' },
                                isSelected && { borderWidth: 2, shadowColor: opt.color, shadowOpacity: 0.2, elevation: 4 }
                            ]}
                            onPress={() => setSelfAssessment(opt.id)}
                            activeOpacity={0.8}
                        >
                            <View style={styles.introOptionTop}>
                                <Text style={styles.introOptionEmoji}>{opt.emoji}</Text>
                                {isSelected && (
                                    <View style={[styles.introCheckBadge, { backgroundColor: opt.badge }]}>
                                        <Text style={styles.introCheckText}>✓</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={[styles.introOptionLabel, { color: isSelected ? opt.textColor : '#1E293B' }]}>
                                {opt.label}
                            </Text>
                            <Text style={styles.introOptionDesc}>{opt.desc}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <TouchableOpacity
                style={[
                    styles.beginTestBtn,
                    !selfAssessment && styles.beginTestBtnDisabled
                ]}
                disabled={!selfAssessment}
                onPress={() => selfAssessment && handleBeginTest(selfAssessment)}
                activeOpacity={0.8}
            >
                <Text style={styles.beginTestBtnText}>✨ Lock In My Answer & Start Test</Text>
            </TouchableOpacity>

            <Text style={styles.introFooterNote}>
                Your answer won't affect the test — only the final reveal! 🎭
            </Text>
        </ScrollView>
    );

    // ─── RESULTS VIEW ────────────────────────────────────────────────────────
    const renderResultsView = () => {
        if (!testResult) return null;

        const jobScore = Math.round(testResult.job_score || 0);
        const startupScore = Math.round(testResult.startup_score || testResult.entrepreneurship_score || 0);
        const higherEdScore = Math.round(testResult.higher_ed_score || 0);

        return (
            <ScrollView contentContainerStyle={styles.resultsContainer} showsVerticalScrollIndicator={false}>
                {/* Comparison Card */}
                {comparison && (
                    <View style={[
                        styles.comparisonCard,
                        comparison.matched ? styles.comparisonCardMatched : styles.comparisonCardDifferent
                    ]}>
                        <Text style={[
                            styles.comparisonHeadline,
                            { color: comparison.matched ? '#15803D' : '#B45309' }
                        ]}>
                            {comparison.headline}
                        </Text>
                        <Text style={styles.comparisonBody}>{comparison.body}</Text>
                    </View>
                )}

                {/* Main Result Card */}
                <View style={styles.congratsBanner}>
                    <View style={styles.completedBadge}>
                        <CheckCircle2 size={14} color="#059669" />
                        <Text style={styles.completedBadgeText}>EVALUATION COMPLETED</Text>
                    </View>
                    <Text style={styles.resultTitle}>{testResult.result || "Career Pathway Computed"}</Text>
                    <Text style={styles.resultDescription}>
                        Your responses have been processed to calculate your primary orientation and personality traits.
                    </Text>
                </View>

                {/* Scores Grid */}
                <View style={styles.scoresGrid}>
                    <View style={styles.scoreCard}>
                        <View style={styles.scoreHeader}>
                            <Text style={styles.scoreLabel}>💼 Job Score</Text>
                            <Text style={[styles.scoreValue, { color: '#2563EB' }]}>{jobScore}%</Text>
                        </View>
                        <View style={styles.scoreBarBg}>
                            <View style={[styles.scoreBarFill, { backgroundColor: '#2563EB', width: `${Math.min(100, jobScore)}%` }]} />
                        </View>
                    </View>

                    <View style={styles.scoreCard}>
                        <View style={styles.scoreHeader}>
                            <Text style={styles.scoreLabel}>🚀 Startup Score</Text>
                            <Text style={[styles.scoreValue, { color: '#EA580C' }]}>{startupScore}%</Text>
                        </View>
                        <View style={styles.scoreBarBg}>
                            <View style={[styles.scoreBarFill, { backgroundColor: '#EA580C', width: `${Math.min(100, startupScore)}%` }]} />
                        </View>
                    </View>

                    <View style={styles.scoreCard}>
                        <View style={styles.scoreHeader}>
                            <Text style={styles.scoreLabel}>🎓 Higher Ed Score</Text>
                            <Text style={[styles.scoreValue, { color: '#7C3AED' }]}>{higherEdScore}%</Text>
                        </View>
                        <View style={styles.scoreBarBg}>
                            <View style={[styles.scoreBarFill, { backgroundColor: '#7C3AED', width: `${Math.min(100, higherEdScore)}%` }]} />
                        </View>
                    </View>
                </View>

                {/* Traits Breakdown */}
                {testResult.subject_scores && Object.keys(testResult.subject_scores).length > 0 && (
                    <View style={styles.traitsContainer}>
                        <Text style={styles.traitsTitle}>PERSONALITY TRAIT BREAKDOWN</Text>
                        <View style={styles.traitsGrid}>
                            {Object.entries(testResult.subject_scores).map(([subj, score], i) => (
                                <View key={i} style={styles.traitRow}>
                                    <Text style={styles.traitLabel} numberOfLines={1}>{subj}</Text>
                                    <Text style={styles.traitValue}>{Math.round(score)}%</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
                
                <TouchableOpacity style={styles.finishButton} onPress={handleFinishAndClose} activeOpacity={0.8}>
                    <Text style={styles.finishButtonText}>🚀 Explore Dashboard & Close</Text>
                </TouchableOpacity>
            </ScrollView>
        );
    };

    // ─── ACTIVE QUESTION VIEW ────────────────────────────────────────────────
    const renderQuestionView = () => {
        if (!question) return null;

        return (
            <ScrollView contentContainerStyle={styles.questionContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.questionHeader}>
                    <View style={styles.subjectBadge}>
                        <Text style={styles.subjectText}>{question.subject || "Career Inclination Assessment"}</Text>
                    </View>
                    <Text style={styles.questionCount}>
                        Question <Text style={styles.questionCountHighlight}>{questionNumber}</Text> / {totalCount}
                    </Text>
                </View>

                <Text style={styles.questionTitle}>{cleanQuestionText(question.question)}</Text>

                {errorMessage ? (
                    <View style={styles.errorBanner}>
                        <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
                    </View>
                ) : null}

                {question.question_type === "Choices" && question.options && (
                    <View style={styles.optionsContainer}>
                        {question.options.map((opt, idx) => {
                            const isSelected = selectedOption === opt;
                            return (
                                <TouchableOpacity
                                    key={idx}
                                    style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
                                    onPress={() => handleOptionSelect(opt)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.optionRow}>
                                        <View style={[styles.optionIcon, isSelected && styles.optionIconSelected]}>
                                            <Text style={[styles.optionIconText, isSelected && styles.optionIconTextSelected]}>
                                                {String.fromCharCode(65 + idx)}
                                            </Text>
                                        </View>
                                        <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                                            {opt}
                                        </Text>
                                    </View>
                                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                                        {isSelected && <View style={styles.radioInner} />}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                {question.question_type === "User Input" && (
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textInput}
                            value={userInput}
                            onChangeText={(text) => {
                                setUserInput(text);
                                setErrorMessage("");
                            }}
                            placeholder="Type your answer..."
                            placeholderTextColor="#94A3B8"
                        />
                    </View>
                )}

                {question.question_type === "Open Ended" && (
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textArea}
                            value={openEnded}
                            onChangeText={(text) => {
                                setOpenEnded(text);
                                setErrorMessage("");
                            }}
                            placeholder="Provide your response..."
                            placeholderTextColor="#94A3B8"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>
                )}
            </ScrollView>
        );
    };

    return (
        <Modal visible={isOpen} transparent animationType="fade" onRequestClose={handleFinishAndClose}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <View style={styles.headerIconContainer}>
                                <BrainCircuit color="#FFF" size={20} />
                            </View>
                            <View>
                                <View style={styles.headerTitleRow}>
                                    <Text style={styles.headerTitle}>Psychometric Assessment</Text>
                                    <View style={styles.mandatoryBadge}>
                                        <Text style={styles.mandatoryText}>MANDATORY</Text>
                                    </View>
                                </View>
                                <Text style={styles.headerSubtitle}>
                                    {step === "intro" 
                                        ? "Let's start with a quick self-check" 
                                        : "Personalized Career Pathway Evaluation"}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.closeBtn} onPress={handleFinishAndClose}>
                            <X size={18} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    {/* Progress Bar — only during active test */}
                    {step === "test" && !isFinished && !loading && renderProgressBar()}

                    {/* Body */}
                    <View style={styles.body}>
                        {step === "intro" ? (
                            renderIntroView()
                        ) : loading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#2563EB" />
                                <Text style={styles.loadingText}>Preparing your personalized test session...</Text>
                            </View>
                        ) : isFinished ? (
                            renderResultsView()
                        ) : (
                            renderQuestionView()
                        )}
                    </View>

                    {/* Footer Controls — only during active question answering */}
                    {step === "test" && !loading && !isFinished && question && (
                        <View style={styles.footerControls}>
                            <TouchableOpacity 
                                style={[styles.controlBtn, questionNumber <= 1 && styles.controlBtnDisabled]} 
                                onPress={handlePrevious}
                                disabled={questionNumber <= 1 || submitting}
                            >
                                <ChevronLeft size={16} color={questionNumber <= 1 ? '#94A3B8' : '#64748B'} />
                                <Text style={[styles.controlBtnText, questionNumber <= 1 && styles.controlBtnTextDisabled]}>Previous</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.nextBtn, submitting && styles.nextBtnDisabled]} 
                                onPress={handleNext}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator size="small" color="#FFF" style={{ marginRight: 8 }} />
                                ) : isLastQuestion ? (
                                    <>
                                        <Text style={styles.nextBtnText}>Submit Test</Text>
                                        <CheckCircle2 size={16} color="#FFF" />
                                    </>
                                ) : (
                                    <>
                                        <Text style={styles.nextBtnText}>Next Question</Text>
                                        <ChevronRight size={16} color="#FFF" />
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16
    },
    modalContent: {
        width: '100%',
        maxWidth: 500,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        maxHeight: '90%',
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        backgroundColor: '#FFFFFF'
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1
    },
    headerIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 14,
        backgroundColor: '#2563EB',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A'
    },
    mandatoryBadge: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#DBEAFE'
    },
    mandatoryText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#2563EB',
        letterSpacing: 0.5
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center'
    },
    progressBarContainer: {
        width: '100%',
        height: 5,
        backgroundColor: '#F1F5F9'
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#2563EB',
        borderRadius: 3
    },
    body: {
        flexShrink: 1,
        maxHeight: 520
    },
    loadingContainer: {
        paddingVertical: 60,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12
    },
    loadingText: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500'
    },

    // ── Intro Styles ──
    introContainer: {
        padding: 20
    },
    introHero: {
        alignItems: 'center',
        textAlign: 'center',
        marginBottom: 16
    },
    introHeroEmoji: {
        fontSize: 32,
        marginBottom: 6
    },
    introHeroTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -0.3
    },
    introHeroSubtitle: {
        fontSize: 13,
        color: '#64748B',
        textAlign: 'center',
        marginTop: 6,
        lineHeight: 18,
        paddingHorizontal: 12
    },
    introHeroHighlight: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2563EB',
        marginTop: 4
    },
    introOptionsGrid: {
        gap: 10,
        marginBottom: 16
    },
    introOptionCard: {
        borderRadius: 16,
        borderWidth: 1.5,
        padding: 14
    },
    introOptionTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6
    },
    introOptionEmoji: {
        fontSize: 22
    },
    introCheckBadge: {
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    introCheckText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: 'bold'
    },
    introOptionLabel: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 3
    },
    introOptionDesc: {
        fontSize: 12,
        color: '#64748B',
        lineHeight: 16
    },
    beginTestBtn: {
        backgroundColor: '#2563EB',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4
    },
    beginTestBtnDisabled: {
        backgroundColor: '#94A3B8',
        shadowOpacity: 0,
        elevation: 0
    },
    beginTestBtnText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700'
    },
    introFooterNote: {
        fontSize: 11,
        color: '#94A3B8',
        textAlign: 'center',
        marginTop: 10
    },

    // ── Question Styles ──
    questionContainer: {
        padding: 20
    },
    questionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16
    },
    subjectBadge: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#DBEAFE',
        maxWidth: '65%'
    },
    subjectText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#2563EB'
    },
    questionCount: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B'
    },
    questionCountHighlight: {
        color: '#2563EB',
        fontWeight: '700'
    },
    questionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#0F172A',
        lineHeight: 24,
        marginBottom: 16
    },
    errorBanner: {
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FEE2E2',
        borderRadius: 12,
        padding: 10,
        marginBottom: 16
    },
    errorText: {
        fontSize: 12,
        color: '#DC2626',
        fontWeight: '500'
    },
    optionsContainer: {
        gap: 10
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1
    },
    optionButtonSelected: {
        borderColor: '#2563EB',
        backgroundColor: '#EFF6FF'
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1
    },
    optionIcon: {
        width: 26,
        height: 26,
        borderRadius: 8,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center'
    },
    optionIconSelected: {
        backgroundColor: '#2563EB',
        borderColor: '#2563EB'
    },
    optionIconText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748B'
    },
    optionIconTextSelected: {
        color: '#FFFFFF'
    },
    optionText: {
        fontSize: 14,
        color: '#334155',
        fontWeight: '500',
        flex: 1
    },
    optionTextSelected: {
        color: '#1D4ED8',
        fontWeight: '600'
    },
    radioCircle: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 1.5,
        borderColor: '#CBD5E1',
        alignItems: 'center',
        justifyContent: 'center'
    },
    radioCircleSelected: {
        borderColor: '#2563EB'
    },
    radioInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#2563EB'
    },
    inputContainer: {
        marginTop: 6
    },
    textInput: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        borderRadius: 14,
        padding: 14,
        fontSize: 14,
        color: '#0F172A'
    },
    textArea: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        borderRadius: 14,
        padding: 14,
        fontSize: 14,
        color: '#0F172A',
        minHeight: 100
    },

    // ── Results Styles ──
    resultsContainer: {
        padding: 20,
        gap: 14
    },
    comparisonCard: {
        padding: 14,
        borderRadius: 16,
        borderWidth: 1.5,
        alignItems: 'center'
    },
    comparisonCardMatched: {
        backgroundColor: '#F0FDF4',
        borderColor: '#BBF7D0'
    },
    comparisonCardDifferent: {
        backgroundColor: '#FFFBEB',
        borderColor: '#FDE68A'
    },
    comparisonHeadline: {
        fontSize: 17,
        fontWeight: '800',
        marginBottom: 4
    },
    comparisonBody: {
        fontSize: 12,
        color: '#475569',
        textAlign: 'center',
        lineHeight: 17
    },
    congratsBanner: {
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        padding: 16,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#E2E8F0'
    },
    completedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D1FAE5',
        marginBottom: 8
    },
    completedBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#059669',
        letterSpacing: 0.5
    },
    resultTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1D4ED8',
        textAlign: 'center',
        marginBottom: 4
    },
    resultDescription: {
        fontSize: 12,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 16,
        paddingHorizontal: 8
    },
    scoresGrid: {
        gap: 10
    },
    scoreCard: {
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0'
    },
    scoreHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6
    },
    scoreLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#334155'
    },
    scoreValue: {
        fontSize: 13,
        fontWeight: '700'
    },
    scoreBarBg: {
        height: 6,
        backgroundColor: '#F1F5F9',
        borderRadius: 3,
        overflow: 'hidden'
    },
    scoreBarFill: {
        height: '100%',
        borderRadius: 3
    },
    traitsContainer: {
        backgroundColor: '#F8FAFC',
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0'
    },
    traitsTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748B',
        marginBottom: 10,
        letterSpacing: 0.5
    },
    traitsGrid: {
        gap: 6
    },
    traitRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#F1F5F9'
    },
    traitLabel: {
        fontSize: 12,
        color: '#334155',
        flex: 1
    },
    traitValue: {
        fontSize: 12,
        fontWeight: '700',
        color: '#2563EB'
    },
    finishButton: {
        backgroundColor: '#2563EB',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4
    },
    finishButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700'
    },

    // ── Footer Controls ──
    footerControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        backgroundColor: '#F8FAFC'
    },
    controlBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10
    },
    controlBtnDisabled: {
        opacity: 0.4
    },
    controlBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B'
    },
    controlBtnTextDisabled: {
        color: '#94A3B8'
    },
    nextBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#2563EB',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3
    },
    nextBtnDisabled: {
        opacity: 0.6
    },
    nextBtnText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFFFFF'
    }
});
