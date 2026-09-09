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
import { X, ChevronLeft, ChevronRight, BrainCircuit, CheckCircle2 } from 'lucide-react-native';
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

const { width, height } = Dimensions.get('window');

interface PsychometricTestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCompleted: () => void;
    studentEmail?: string;
    isMandatory?: boolean;
}

export default function PsychometricTestModal({
    isOpen,
    onClose,
    onCompleted,
    studentEmail,
    isMandatory = true
}: PsychometricTestModalProps) {
    const [screenName, setScreenName] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [question, setQuestion] = useState<QuestionData | null>(null);
    const [questionNumber, setQuestionNumber] = useState<number>(1);
    const [totalEstimated] = useState<number>(10); // Approximation as per web

    // Selection states
    const [selectedOption, setSelectedOption] = useState<string | string[]>("");
    const [userInput, setUserInput] = useState<string>("");
    const [openEnded, setOpenEnded] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");

    // Results State
    const [isFinished, setIsFinished] = useState<boolean>(false);
    const [testResult, setTestResult] = useState<SubmitTestResult | null>(null);

    useEffect(() => {
        if (isOpen && !screenName) {
            initTest();
        }
    }, [isOpen]);

    const initTest = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const tests = await getTests();
            const testName = tests && tests.length > 0 ? tests[0].name : "Demo psy 1";

            const sid = await startNewTest(testName, studentEmail);
            setScreenName(sid);

            const qData = await loadQuestion(sid);
            setQuestion(qData);
            setQuestionNumber(1);
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

    const renderProgressBar = () => {
        const progress = Math.min(100, (questionNumber / totalEstimated) * 100);
        return (
            <View style={styles.progressBarContainer}>
                <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>
        );
    };

    const renderResults = () => {
        if (!testResult) return null;

        return (
            <ScrollView contentContainerStyle={styles.resultsContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.congratsBanner}>
                    <View style={styles.completedBadge}>
                        <CheckCircle2 size={14} color="#059669" />
                        <Text style={styles.completedBadgeText}>EVALUATION COMPLETED</Text>
                    </View>
                    <Text style={styles.resultTitle}>{testResult.result || "🚀 Startup Oriented"}</Text>
                    <Text style={styles.resultDescription}>
                        Great job! Your responses have been processed to calculate your primary orientation score and personality traits.
                    </Text>
                </View>

                <View style={styles.scoresGrid}>
                    <View style={styles.scoreCard}>
                        <View style={styles.scoreHeader}>
                            <Text style={styles.scoreLabel}>💼 Job Score</Text>
                            <Text style={[styles.scoreValue, { color: '#4F46E5' }]}>{testResult.job_score}%</Text>
                        </View>
                        <View style={styles.scoreBarBg}>
                            <View style={[styles.scoreBarFill, { backgroundColor: '#4F46E5', width: `${Math.min(100, testResult.job_score)}%` }]} />
                        </View>
                    </View>

                    <View style={styles.scoreCard}>
                        <View style={styles.scoreHeader}>
                            <Text style={styles.scoreLabel}>🚀 Startup Score</Text>
                            <Text style={[styles.scoreValue, { color: '#EA580C' }]}>{testResult.startup_score}%</Text>
                        </View>
                        <View style={styles.scoreBarBg}>
                            <View style={[styles.scoreBarFill, { backgroundColor: '#EA580C', width: `${Math.min(100, testResult.startup_score)}%` }]} />
                        </View>
                    </View>

                    <View style={styles.scoreCard}>
                        <View style={styles.scoreHeader}>
                            <Text style={styles.scoreLabel}>🎓 Higher Ed Score</Text>
                            <Text style={[styles.scoreValue, { color: '#9333EA' }]}>{testResult.higher_ed_score}%</Text>
                        </View>
                        <View style={styles.scoreBarBg}>
                            <View style={[styles.scoreBarFill, { backgroundColor: '#9333EA', width: `${Math.min(100, testResult.higher_ed_score)}%` }]} />
                        </View>
                    </View>
                </View>

                {testResult.subject_scores && Object.keys(testResult.subject_scores).length > 0 && (
                    <View style={styles.traitsContainer}>
                        <Text style={styles.traitsTitle}>PERSONALITY TRAIT BREAKDOWN</Text>
                        <View style={styles.traitsGrid}>
                            {Object.entries(testResult.subject_scores).map(([subj, score], i) => (
                                <View key={i} style={styles.traitRow}>
                                    <Text style={styles.traitLabel}>{subj}</Text>
                                    <Text style={styles.traitValue}>{score}%</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
                
                <TouchableOpacity style={styles.finishButton} onPress={handleFinishAndClose}>
                    <Text style={styles.finishButtonText}>🚀 Explore Dashboard & Close</Text>
                </TouchableOpacity>
            </ScrollView>
        );
    };

    const renderQuestion = () => {
        if (!question) return null;

        return (
            <ScrollView contentContainerStyle={styles.questionContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.questionHeader}>
                    <View style={styles.subjectBadge}>
                        <Text style={styles.subjectText}>{question.subject || "General Trait Assessment"}</Text>
                    </View>
                    <Text style={styles.questionCount}>
                        Question <Text style={styles.questionCountHighlight}>{questionNumber}</Text> / {totalEstimated}
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
        <Modal visible={isOpen} transparent animationType="fade">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
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
                                    {isMandatory && (
                                        <View style={styles.mandatoryBadge}>
                                            <Text style={styles.mandatoryText}>MANDATORY</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.headerSubtitle}>Personalized Career Pathway Evaluation</Text>
                            </View>
                        </View>
                        {!isMandatory && (
                            <TouchableOpacity style={styles.closeBtn} onPress={handleFinishAndClose}>
                                <X size={20} color="#64748B" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Progress Bar */}
                    {!isFinished && !loading && renderProgressBar()}

                    {/* Body */}
                    <View style={styles.body}>
                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#2563EB" />
                                <Text style={styles.loadingText}>Loading your psychometric test session...</Text>
                            </View>
                        ) : isFinished ? (
                            renderResults()
                        ) : (
                            renderQuestion()
                        )}
                    </View>

                    {/* Footer Controls */}
                    {!loading && !isFinished && (
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
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16
    },
    modalContent: {
        width: '100%',
        maxWidth: 500,
        backgroundColor: '#F8FAFC',
        borderRadius: 24,
        maxHeight: '90%',
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        backgroundColor: '#FFFFFF'
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    headerIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#4F46E5',
        justifyContent: 'center',
        alignItems: 'center'
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
        backgroundColor: '#EEF2FF',
        borderWidth: 1,
        borderColor: '#C7D2FE',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12
    },
    mandatoryText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#4F46E5'
    },
    headerSubtitle: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 2,
        fontWeight: '500'
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0'
    },
    progressBarContainer: {
        height: 4,
        backgroundColor: '#E0E7FF',
        width: '100%'
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#4F46E5'
    },
    body: {
        flexShrink: 1,
        width: '100%'
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        minHeight: 300
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B'
    },
    questionContainer: {
        padding: 20,
        paddingBottom: 40
    },
    questionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
    },
    subjectBadge: {
        backgroundColor: '#EEF2FF',
        borderWidth: 1,
        borderColor: '#C7D2FE',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16
    },
    subjectText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#4F46E5',
        textTransform: 'uppercase'
    },
    questionCount: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B'
    },
    questionCountHighlight: {
        color: '#4F46E5',
        fontWeight: '700'
    },
    questionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0F172A',
        lineHeight: 28,
        marginBottom: 20
    },
    errorBanner: {
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center'
    },
    errorText: {
        color: '#B91C1C',
        fontSize: 12,
        fontWeight: '500'
    },
    optionsContainer: {
        gap: 12
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#FFFFFF'
    },
    optionButtonSelected: {
        borderColor: '#4F46E5',
        backgroundColor: '#EEF2FF'
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        paddingRight: 12
    },
    optionIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    optionIconSelected: {
        backgroundColor: '#4F46E5',
        borderColor: '#4F46E5'
    },
    optionIconText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B'
    },
    optionIconTextSelected: {
        color: '#FFFFFF'
    },
    optionText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#334155',
        flexShrink: 1
    },
    optionTextSelected: {
        color: '#312E81',
        fontWeight: '600'
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        justifyContent: 'center',
        alignItems: 'center'
    },
    radioCircleSelected: {
        borderColor: '#4F46E5',
        backgroundColor: '#4F46E5'
    },
    radioInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FFFFFF'
    },
    inputContainer: {
        marginTop: 8
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        fontSize: 14,
        color: '#0F172A'
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        fontSize: 14,
        color: '#0F172A',
        minHeight: 120
    },
    footerControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        backgroundColor: '#FFFFFF'
    },
    controlBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: 'transparent'
    },
    controlBtnDisabled: {
        opacity: 0.5
    },
    controlBtnText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
        marginLeft: 4
    },
    controlBtnTextDisabled: {
        color: '#94A3B8'
    },
    nextBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: '#4F46E5'
    },
    nextBtnDisabled: {
        opacity: 0.7
    },
    nextBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
        marginRight: 6
    },
    resultsContainer: {
        padding: 20,
        paddingBottom: 40
    },
    congratsBanner: {
        alignItems: 'center',
        padding: 24,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 24,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4
    },
    completedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        borderWidth: 1,
        borderColor: '#A7F3D0',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        marginBottom: 12,
        gap: 6
    },
    completedBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#059669'
    },
    resultTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#312E81',
        textAlign: 'center',
        marginBottom: 8
    },
    resultDescription: {
        fontSize: 13,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 20
    },
    scoresGrid: {
        flexDirection: 'column',
        gap: 12,
        marginBottom: 24
    },
    scoreCard: {
        width: '100%',
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2
    },
    scoreHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },
    scoreLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#475569'
    },
    scoreValue: {
        fontSize: 14,
        fontWeight: '700'
    },
    scoreBarBg: {
        height: 6,
        borderRadius: 3,
        backgroundColor: '#F1F5F9',
        overflow: 'hidden'
    },
    scoreBarFill: {
        height: '100%',
        borderRadius: 3
    },
    traitsContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 24,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2
    },
    traitsTitle: {
        fontSize: 10,
        fontWeight: '700',
        color: '#64748B',
        marginBottom: 12,
        textTransform: 'uppercase'
    },
    traitsGrid: {
        flexDirection: 'column',
        gap: 8
    },
    traitRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        borderRadius: 12,
        padding: 12,
        width: '100%'
    },
    traitLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: '#334155'
    },
    traitValue: {
        fontSize: 12,
        fontWeight: '700',
        color: '#4F46E5'
    },
    finishButton: {
        backgroundColor: '#4F46E5',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8
    },
    finishButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF'
    }
});
