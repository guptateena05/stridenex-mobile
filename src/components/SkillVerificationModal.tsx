import React, { useState, useEffect } from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { X, Check, Award, AlertCircle, Zap } from 'lucide-react-native';
import { getSkillTestQuestions, submitSkillTest } from '../api/student.services';
import ConfettiCannon from 'react-native-confetti-cannon';

interface SkillVerificationModalProps {
  visible: boolean;
  userName: string;
  skillName: string;
  skillLevel: string;
  onClose: () => void;
  onSuccess: (result: any) => void;
}

const SkillVerificationModal: React.FC<SkillVerificationModalProps> = ({
  visible,
  userName,
  skillName,
  skillLevel,
  onClose,
  onSuccess
}) => {
  const [testMode, setTestMode] = useState<'intro' | 'test' | 'result'>('intro');
  const [testQuestions, setTestQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentTestAnswers, setCurrentTestAnswers] = useState<Record<string, string>>({});
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Reset state when modal opens for a new skill
  useEffect(() => {
    if (visible) {
      setTestMode('intro');
      setTestQuestions([]);
      setCurrentQuestionIndex(0);
      setCurrentTestAnswers({});
      setTestResult(null);
      setTestLoading(false);
    }
  }, [visible, skillName, skillLevel]);

  const handleBeginTest = async () => {
    if (!userName || !skillName) return;
    setTestLoading(true);
    setTestMode('test');
    try {
      const res = await getSkillTestQuestions(userName, skillName, skillLevel);
      if (res.message && res.message.questions) {
        setTestQuestions(res.message.questions);
        setCurrentTestAnswers({});
        setCurrentQuestionIndex(0);
      } else {
        throw new Error("No questions returned");
      }
    } catch (err: any) {
      console.error(err);
      onClose();
      Alert.alert("Error", err?.message || "Could not generate test. Please try again later.");
    } finally {
      setTestLoading(false);
    }
  };

  const submitTestAnswers = async () => {
    if (!userName) return;
    setTestLoading(true);

    const answersPayload: Record<string, string> = {};
    testQuestions.forEach((q, idx) => {
      const questionText = q.question;
      const answerText = currentTestAnswers[idx.toString()] || "";
      answersPayload[questionText] = answerText;
    });

    try {
      const result = await submitSkillTest({
        student: userName,
        skill: skillName,
        level: skillLevel,
        answers: answersPayload
      });
      
      if (result && result.message) {
        setTestResult(result.message);
        setTestMode('result');
        setTestLoading(false);
      } else {
        throw new Error("Invalid response");
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", "Failed to submit test.");
      setTestLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', backgroundColor: 'white' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#EA580C', alignItems: 'center', justifyContent: 'center' }}>
               <Award size={20} color="white" />
            </View>
            <View>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A' }}>Skill Assessment</Text>
              <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '600' }}>{skillName} • {skillLevel}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={{ padding: 8, backgroundColor: '#F1F5F9', borderRadius: 20 }}>
            <X size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        {testMode === 'intro' && (
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
            <View style={{ backgroundColor: '#FFF7ED', borderRadius: 24, padding: 24, marginBottom: 20, borderWidth: 1, borderColor: '#FFEDD5' }}>
              <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: '#F97316', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                 <Zap size={24} color="white" fill="white" />
              </View>
              <Text style={{ fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 12 }}>Ready to verify your skill?</Text>
              <Text style={{ fontSize: 15, color: '#475569', lineHeight: 24, fontWeight: '500' }}>
                This is a quick assessment to verify your proficiency in <Text style={{ fontWeight: 'bold', color: '#EA580C' }}>{skillName}</Text> at the <Text style={{ fontWeight: 'bold', color: '#EA580C' }}>{skillLevel}</Text> level.
              </Text>
            </View>
            
            <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 24, marginBottom: 16, borderWidth: 1.5, borderColor: '#F1F5F9' }}>
               <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 }}>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: '#1E293B', letterSpacing: 1, textTransform: 'uppercase' }}>📝 What to expect</Text>
               </View>
               <View style={{ gap: 12 }}>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                     <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#F97316', marginTop: 8 }} />
                     <Text style={{ fontSize: 14, color: '#475569', fontWeight: '600', flex: 1, lineHeight: 22 }}><Text style={{ fontWeight: '800', color: '#334155' }}>5 Questions</Text> focused on core concepts.</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                     <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#F97316', marginTop: 8 }} />
                     <Text style={{ fontSize: 14, color: '#475569', fontWeight: '600', flex: 1, lineHeight: 22 }}>Multiple Choice Questions (MCQs) to evaluate knowledge.</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                     <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#F97316', marginTop: 8 }} />
                     <Text style={{ fontSize: 14, color: '#475569', fontWeight: '600', flex: 1, lineHeight: 22 }}>No strict time limit, take your time to answer carefully.</Text>
                  </View>
               </View>
            </View>

            <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 24, marginBottom: 32, borderWidth: 1.5, borderColor: '#F1F5F9' }}>
               <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 }}>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: '#1E293B', letterSpacing: 1, textTransform: 'uppercase' }}>🏅 Criteria & Badges</Text>
               </View>
               <View style={{ gap: 12 }}>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                     <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#F97316', marginTop: 8 }} />
                     <Text style={{ fontSize: 14, color: '#475569', fontWeight: '600', flex: 1, lineHeight: 22 }}>Score <Text style={{ fontWeight: '800', color: '#334155' }}>70% or higher</Text> to pass the verification.</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                     <Check size={16} color="#10B981" style={{ marginTop: 2 }} />
                     <Text style={{ fontSize: 14, color: '#475569', fontWeight: '600', flex: 1, lineHeight: 22 }}>Passing grants you the <Text style={{ fontWeight: '800', color: '#10B981' }}>AI Verified Badge 🏆</Text> on your profile.</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                     <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#F97316', marginTop: 8 }} />
                     <Text style={{ fontSize: 14, color: '#475569', fontWeight: '600', flex: 1, lineHeight: 22 }}>If you fail, you can always practice and try again later. Your skill status remains unchanged.</Text>
                  </View>
               </View>
            </View>
            
            <View style={{ flexDirection: 'row', gap: 16 }}>
               <TouchableOpacity onPress={onClose} style={{ flex: 1, height: 56, borderRadius: 16, borderWidth: 1.5, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#0F172A' }}>Cancel</Text>
               </TouchableOpacity>
               <TouchableOpacity onPress={handleBeginTest} disabled={testLoading} style={{ flex: 2, height: 56, borderRadius: 16, backgroundColor: '#F97316', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
                  {testLoading ? <ActivityIndicator color="white" /> : <Text style={{ fontSize: 15, fontWeight: '800', color: 'white' }}>Start Verification Test {'>'}</Text>}
               </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {testMode === 'test' && (
          <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
              <View style={{ height: 6, backgroundColor: '#E2E8F0', width: '100%' }}>
                <View style={{ height: '100%', backgroundColor: '#F97316', width: `${((currentQuestionIndex + 1) / (testQuestions.length || 1)) * 100}%` }} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 }}>
                <Text style={{ fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 1 }}>PROGRESS</Text>
                <Text style={{ fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 1 }}>QUESTION {currentQuestionIndex + 1} OF {testQuestions.length}</Text>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 }}>
                <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, borderWidth: 1.5, borderColor: '#F1F5F9', marginBottom: 20 }}>
                  <View style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(255, 107, 0, 0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 12 }}>
                    <Text style={{ fontSize: 9, fontWeight: '800', color: '#F97316', letterSpacing: 0.5 }}>{testQuestions[currentQuestionIndex]?.difficulty?.toUpperCase() || 'EASY'}</Text>
                  </View>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E293B', lineHeight: 22 }}>{testQuestions[currentQuestionIndex]?.question}</Text>
                </View>

                <View style={{ gap: 12 }}>
                  {testQuestions[currentQuestionIndex]?.type === 'mcq' && testQuestions[currentQuestionIndex]?.options ? (
                    Object.entries(testQuestions[currentQuestionIndex].options).map(([k, v]) => {
                      const isSelected = currentTestAnswers[currentQuestionIndex.toString()] === k || currentTestAnswers[currentQuestionIndex.toString()] === String(v);
                      return (
                        <TouchableOpacity
                          key={k}
                          onPress={() => setCurrentTestAnswers(prev => ({ ...prev, [currentQuestionIndex.toString()]: String(v) }))}
                          activeOpacity={0.7}
                          style={{
                            backgroundColor: isSelected ? 'rgba(255, 107, 0, 0.02)' : '#FFFFFF',
                            borderWidth: 1.5, borderColor: isSelected ? '#F97316' : '#E2E8F0',
                            borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12
                          }}
                        >
                          <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: isSelected ? '#F97316' : '#CBD5E1', alignItems: 'center', justifyContent: 'center' }}>
                            {isSelected && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#F97316' }} />}
                          </View>
                          <Text style={{ fontSize: 14, fontWeight: isSelected ? '700' : '600', color: isSelected ? '#0F172A' : '#475569', flex: 1 }}>{String(v)}</Text>
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    <TextInput
                      value={currentTestAnswers[currentQuestionIndex.toString()] || ''}
                      onChangeText={(text) => setCurrentTestAnswers(prev => ({ ...prev, [currentQuestionIndex.toString()]: text }))}
                      placeholder="Type your answer here..." placeholderTextColor="#94A3B8" multiline={true} numberOfLines={6}
                      style={{ backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 16, padding: 16, fontSize: 14, color: '#1E293B', minHeight: 120, textAlignVertical: 'top' }}
                    />
                  )}
                </View>
              </ScrollView>

              <View style={{ flexDirection: 'row', padding: 20, backgroundColor: '#FFFFFF', borderTopWidth: 1.5, borderTopColor: '#F1F5F9', gap: 16 }}>
                <TouchableOpacity onPress={() => { if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1); else onClose(); }} style={{ flex: 1, height: 50, borderRadius: 16, borderWidth: 1.5, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#64748B' }}>{currentQuestionIndex > 0 ? 'Back' : 'Cancel'}</Text>
                </TouchableOpacity>

                {currentQuestionIndex < testQuestions.length - 1 ? (
                  <TouchableOpacity onPress={() => { if (!currentTestAnswers[currentQuestionIndex.toString()]) { Alert.alert('Select Answer', 'Please answer the question to continue.'); return; } setCurrentQuestionIndex(prev => prev + 1); }} style={{ flex: 1, height: 50, borderRadius: 16, backgroundColor: '#F97316', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>Next Question {'>'}</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => { if (!currentTestAnswers[currentQuestionIndex.toString()]) { Alert.alert('Select Answer', 'Please answer the question to submit.'); return; } submitTestAnswers(); }} disabled={testLoading} style={{ flex: 1, height: 50, borderRadius: 16, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center', opacity: testLoading ? 0.6 : 1 }}>
                    {testLoading ? <ActivityIndicator color="white" /> : <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>Submit</Text>}
                  </TouchableOpacity>
                )}
              </View>
          </View>
        )}

        {testMode === 'result' && testResult && (
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}>
             {testResult?.status === 'Pass' || testResult?.status === 'Passed' || testResult?.passed === true || testResult?.verification_status === 'Pass' ? (
               <View style={{ width: '90%', backgroundColor: 'white', borderRadius: 20, padding: 24, alignItems: 'center' }}>
                 <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 100 }}>
                   <ConfettiCannon count={200} origin={{x: -10, y: 0}} />
                 </View>
                 <View style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: '#F97316', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                   <Award size={32} color="white" />
                 </View>
                 <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#F97316', marginBottom: 8 }}>NEW MILESTONE ACHIEVED!</Text>
                 <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 8, color: '#1E293B' }}>Congrats! You have acquired the skill</Text>
                 <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 20 }}>Skill Verified Successfully</Text>

                 <View style={{ backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, width: '100%', alignItems: 'center', marginBottom: 24 }}>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#64748B', marginBottom: 8, letterSpacing: 1 }}>ACQUIRED SKILL</Text>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1E293B' }}>{skillName}</Text>
                    <View style={{ backgroundColor: '#FFEDD5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginTop: 8 }}>
                       <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#EA580C', textTransform: 'uppercase' }}>{skillLevel}</Text>
                    </View>
                 </View>
                 <TouchableOpacity onPress={() => { onClose(); onSuccess(testResult); }} style={{ backgroundColor: '#F97316', width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}>
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>Awesome! Continue Journey</Text>
                 </TouchableOpacity>
               </View>
             ) : (
               <View style={{ width: '90%', backgroundColor: 'white', borderRadius: 20, padding: 24, alignItems: 'center' }}>
                 <View style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                   <AlertCircle size={32} color="white" />
                 </View>
                 <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 8, color: '#1E293B' }}>Not Quite There</Text>
                 <Text style={{ fontSize: 14, color: '#64748B', marginBottom: 20, textAlign: 'center' }}>{testResult.feedback?.summary || testResult.feedback || 'You need to practice more.'}</Text>

                 <TouchableOpacity onPress={() => onClose()} style={{ backgroundColor: '#EF4444', width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}>
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>Close</Text>
                 </TouchableOpacity>
               </View>
             )}
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

export default SkillVerificationModal;
