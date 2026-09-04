import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Clipboard, ActivityIndicator, TextInput, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { 
  Settings, 
  Mail, 
  Send, 
  Copy, 
  X,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  FileText,
  Plus,
  Check,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  List as ListIcon
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeInDown, Layout } from 'react-native-reanimated';
import { useIndustry } from '@/context/IndustryContext';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { 
  generateEmailTemplate, 
  getInvitationTemplate,
  getOfferTemplates,
  createOfferTemplate,
  updateOfferTemplate,
  deleteOfferTemplate,
  OfferTemplatePayload
} from '@/api/industry.services';

const formatDateStrDDMMYYYY = (date: Date) => {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
};

const calculateEffectiveTo = (fromDateStr: string | undefined, durationStr: string | undefined) => {
  if (!fromDateStr || !durationStr) return '';
  const parts = fromDateStr.split('-');
  if (parts.length !== 3) return '';
  const fromDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  if (isNaN(fromDate.getTime())) return '';

  const match = durationStr.match(/(\d+)\s*(month|year|week|day)s?/i);
  if (!match) return '';
  
  const amount = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  
  const toDate = new Date(fromDate);
  if (unit === 'month') {
    toDate.setMonth(toDate.getMonth() + amount);
  } else if (unit === 'year') {
    toDate.setFullYear(toDate.getFullYear() + amount);
  } else if (unit === 'week') {
    toDate.setDate(toDate.getDate() + amount * 7);
  } else if (unit === 'day') {
    toDate.setDate(toDate.getDate() + amount);
  }
  return formatDateStrDDMMYYYY(toDate);
};

// --- Helper Select Component ---
const CustomSelect = ({ label, value, options, onChange }: { label: string, value: string, options: string[], onChange: (val: string) => void }) => {
  const [show, setShow] = useState(false);
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity style={styles.selectBox} onPress={() => setShow(true)}>
        <Text style={[styles.selectText, !value && { color: '#94A3B8' }]}>{value || 'Select...'}</Text>
        <ChevronDown size={18} color="#64748B" />
      </TouchableOpacity>
      <Modal visible={show} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {label}</Text>
              <TouchableOpacity onPress={() => setShow(false)}><X size={20} color="#64748B" /></TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalOption} onPress={() => { onChange(item); setShow(false); }}>
                  <Text style={[styles.modalOptionText, value === item && { color: '#0F172A', fontWeight: '700' }]}>{item}</Text>
                  {value === item && <Check size={18} color="#0F172A" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export const IndustrySettingsScreen = () => {
  const { industryData } = useIndustry();
  const [activeTab, setActiveTab] = useState<'outreach' | 'offer'>('outreach');

  // --- Outreach State ---
  const [activeTemplate, setActiveTemplate] = useState<'email' | 'invite' | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadingType, setLoadingType] = useState<'email' | 'invite' | null>(null);
  const [generatedEmail, setGeneratedEmail] = useState<{subject: string, body: string} | null>(null);
  const [generatedInvite, setGeneratedInvite] = useState<string | null>(null);

  // --- Offer Letters State ---
  const EMPTY_FORM: OfferTemplatePayload = {
    template_name: "",
    template_code: "",
    link_ewqm: industryData?.company_name || "",
    select_egwf: "Internship",
    status: "Active",
    subject: "",
    salutation: "Dear ",
    body: "<p>We are pleased to offer you...</p>",
    compensation_type: "Stipend",
    compensation_amount: 0,
    currency: "INR",
    duration: "",
    effective_from: "",
    effective_to: "",
  };

  const [templates, setTemplates] = useState<any[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<OfferTemplatePayload & { name?: string }>({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [datePickerType, setDatePickerType] = useState<'from' | 'to' | null>(null);

  // Fetch templates on mount or company change
  useEffect(() => {
    if (industryData?.company_name) {
      setForm(prev => ({ ...prev, link_ewqm: industryData.company_name }));
      fetchTemplates();
    }
  }, [industryData?.company_name]);

  const fetchTemplates = async () => {
    if (!industryData?.company_name) return;
    try {
      setTemplatesLoading(true);
      const res = await getOfferTemplates(industryData.company_name);
      const data = res?.message?.data?.offer_templates ??
        res?.data?.data?.offer_templates ??
        res?.data?.offer_templates ??
        res?.message?.data ??
        res?.message ??
        [];
      setTemplates(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setTemplatesLoading(false);
    }
  };

  // --- Handlers for Outreach ---
  const handleGenerateEmail = async () => {
    const compName = industryData?.company_name;
    if (!compName) {
      Alert.alert("Error", "Company name not found. Please complete your profile first.");
      return;
    }
    try {
      setLoadingType('email');
      const res = await generateEmailTemplate(compName);
      const data = res?.message || res?.data || res;
      if (data) {
        setGeneratedEmail({
          subject: data.subject || '',
          body: data.body || ''
        });
        setActiveTemplate('email');
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err?.message || "Failed to generate email template");
    } finally {
      setLoadingType(null);
    }
  };

  const handleGenerateInvitation = async () => {
    const compName = industryData?.company_name;
    if (!compName) {
      Alert.alert("Error", "Company name not found. Please complete your profile first.");
      return;
    }
    try {
      setLoadingType('invite');
      const res = await getInvitationTemplate(compName);
      const data = res?.message || res?.data || res;
      if (data) {
        setGeneratedInvite(data.body || '');
        setActiveTemplate('invite');
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err?.message || "Failed to generate invitation template");
    } finally {
      setLoadingType(null);
    }
  };

  const handleCopy = (text: string) => {
    Clipboard.setString(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    Alert.alert("Success", "Copied to clipboard!");
  };

  // --- Handlers for Offer Letters ---
  const handleSaveTemplate = async () => {
    if (!form.template_name || !form.template_code) {
      Alert.alert("Required", "Please fill in Template Name and Code.");
      return;
    }
    try {
      setSubmitting(true);
      const payload = { ...form };
      if (payload.effective_from && payload.effective_from.includes('-')) {
        const parts = payload.effective_from.split('-');
        if (parts.length === 3 && parts[2].length === 4) payload.effective_from = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      if (payload.effective_to && payload.effective_to.includes('-')) {
        const parts = payload.effective_to.split('-');
        if (parts.length === 3 && parts[2].length === 4) payload.effective_to = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      
      if (payload.name) {
        await updateOfferTemplate(payload);
        Alert.alert("Success", "Template updated successfully");
      } else {
        await createOfferTemplate(payload);
        Alert.alert("Success", "Template created successfully");
      }
      setShowForm(false);
      setForm({ ...EMPTY_FORM, link_ewqm: industryData?.company_name || "" });
      fetchTemplates();
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to save template");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTemplate = (item: any) => {
    const editForm = {
      ...item,
      select_egwf: item.select_egwf || "Internship",
      status: item.status || "Active",
      compensation_type: item.compensation_type || "Stipend",
      currency: item.currency || "INR",
    };
    if (editForm.effective_from && editForm.effective_from.includes('-')) {
      const parts = editForm.effective_from.split('-');
      if (parts.length === 3 && parts[0].length === 4) editForm.effective_from = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    if (editForm.effective_to && editForm.effective_to.includes('-')) {
      const parts = editForm.effective_to.split('-');
      if (parts.length === 3 && parts[0].length === 4) editForm.effective_to = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    setForm(editForm);
    setShowForm(true);
  };

  const handleDeleteTemplate = (name: string) => {
    Alert.alert("Delete", "Are you sure you want to delete this template?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        try {
          await deleteOfferTemplate(name);
          Alert.alert("Success", "Template deleted successfully");
          fetchTemplates();
        } catch (error: any) {
          Alert.alert("Error", error?.message || "Failed to delete template");
        }
      }}
    ]);
  };

  // --- Render Sections ---
  const renderOutreachTab = () => (
    <Animated.View entering={FadeInUp.duration(300)}>
      <View style={styles.cardsRow}>
        <Animated.View entering={FadeInUp.delay(100)} style={styles.actionCard}>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(249, 115, 22, 0.1)' }]}>
            <Mail size={20} color="#F97316" />
          </View>
          <Text style={styles.cardTitle}>Professional Email</Text>
          <Text style={styles.cardDesc}>Generate a high-conversion follow-up email template personalized for your company outreach.</Text>
          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={handleGenerateEmail}
            disabled={loadingType !== null}
          >
            {loadingType === 'email' ? (
              <ActivityIndicator size="small" color="#FFF" style={{ marginRight: 6 }} />
            ) : (
              <Sparkles size={14} color="#FFF" style={{ marginRight: 6 }} />
            )}
            <Text style={styles.actionBtnText}>
              {loadingType === 'email' ? 'Generating...' : 'Generate Email Template'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200)} style={styles.actionCard}>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
            <Send size={20} color="#3B82F6" />
          </View>
          <Text style={styles.cardTitle}>Student Invitation</Text>
          <Text style={styles.cardDesc}>Get a concise, friendly invitation template perfect for quick platform-based student invites.</Text>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: '#3B82F6' }]} 
            onPress={handleGenerateInvitation}
            disabled={loadingType !== null}
          >
            {loadingType === 'invite' ? (
              <ActivityIndicator size="small" color="#FFF" style={{ marginRight: 6 }} />
            ) : (
              <Sparkles size={14} color="#FFF" style={{ marginRight: 6 }} />
            )}
            <Text style={styles.actionBtnText}>
              {loadingType === 'invite' ? 'Generating...' : 'Get Invitation Template'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Expanded Template View */}
      {activeTemplate && (
        <Animated.View layout={Layout.springify()} entering={FadeInDown} style={styles.templateExpandedCard}>
          <View style={styles.templateHeader}>
            <View style={styles.templateHeaderLeft}>
              <Mail size={16} color="#64748B" />
              <Text style={styles.templateHeaderText}>
                {activeTemplate === 'email' ? 'EMAIL TEMPLATE' : 'INVITATION TEMPLATE'}
              </Text>
            </View>
            <View style={styles.templateHeaderRight}>
              <TouchableOpacity 
                style={styles.copyPill} 
                onPress={() => handleCopy(activeTemplate === 'email' ? `${generatedEmail?.subject || ''}\n\n${generatedEmail?.body || ''}` : (generatedInvite || ''))}
              >
                <Copy size={14} color="#64748B" style={{ marginRight: 6 }} />
                <Text style={styles.copyPillText}>{copied ? 'Copied!' : 'Copy to Clipboard'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setActiveTemplate(null)} style={styles.closeBtn}>
                <X size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.templateBody}>
            {activeTemplate === 'email' && generatedEmail ? (
              <>
                <Text style={styles.subjectLine}><Text style={styles.boldText}>Subject:</Text> {generatedEmail.subject}</Text>
                <Text style={styles.bodyText}>{generatedEmail.body}</Text>
              </>
            ) : (
              <Text style={styles.bodyText}>{generatedInvite}</Text>
            )}
          </View>
        </Animated.View>
      )}

      {/* Info Banner */}
      <Animated.View entering={FadeInUp.delay(300)} style={styles.infoBanner}>
        <View style={styles.bannerIconBox}>
          <ShieldCheck size={28} color="#FFF" />
        </View>
        <View style={styles.bannerContent}>
          <View style={styles.bannerHeaderRow}>
            <Text style={styles.bannerTitle}>Automated Verification Enabled</Text>
            <View style={styles.secureBadge}>
              <Text style={styles.secureBadgeText}>SECURE OUTREACH</Text>
            </View>
          </View>
          <Text style={styles.bannerDesc}>
            Every template generated here follows Stridenex's quality guidelines. Your outreach is automatically verified to increase student response rates by up to 45%.
          </Text>
        </View>
      </Animated.View>
    </Animated.View>
  );

  const renderOfferLettersTab = () => {
    if (showForm) {
      return (
        <Animated.View entering={FadeInUp.duration(300)} style={styles.formContainer}>
          <View style={styles.formHeaderRow}>
            <Text style={styles.formHeaderTitle}>{form.name ? 'Edit Template' : 'New Template'}</Text>
            <TouchableOpacity onPress={() => { setShowForm(false); setForm({ ...EMPTY_FORM, link_ewqm: industryData?.company_name || "" }); }}>
              <X size={24} color="#64748B" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Template Name *</Text>
            <TextInput style={styles.input} value={form.template_name} onChangeText={t => setForm(p => ({...p, template_name: t}))} placeholder="e.g. Standard Internship Offer" />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Template Code *</Text>
            <TextInput style={styles.input} value={form.template_code} onChangeText={t => setForm(p => ({...p, template_code: t}))} placeholder="e.g. STD-INT-001" />
          </View>

          <CustomSelect label="Opportunity Type" value={form.select_egwf} options={['Internship', 'Project', 'Job']} onChange={t => setForm(p => ({...p, select_egwf: t}))} />
          <CustomSelect label="Status" value={form.status} options={['Active', 'Inactive', 'Draft']} onChange={t => setForm(p => ({...p, status: t}))} />
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Subject</Text>
            <TextInput style={styles.input} value={form.subject} onChangeText={t => setForm(p => ({...p, subject: t}))} placeholder="Offer Letter Subject" />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Salutation</Text>
            <TextInput style={styles.input} value={form.salutation} onChangeText={t => setForm(p => ({...p, salutation: t}))} placeholder="Dear " />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Body (HTML supported)</Text>
            <TextInput style={[styles.input, styles.textArea]} value={form.body} onChangeText={t => setForm(p => ({...p, body: t}))} multiline numberOfLines={4} placeholder="<p>We are pleased to...</p>" />
          </View>

          <CustomSelect label="Compensation Type" value={form.compensation_type} options={['Stipend', 'Salary', 'Honorarium', 'Unpaid']} onChange={t => setForm(p => ({...p, compensation_type: t}))} />
          
          {form.compensation_type !== 'Unpaid' && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Amount</Text>
                <TextInput style={styles.input} value={form.compensation_amount?.toString() || ''} onChangeText={t => setForm(p => ({...p, compensation_amount: parseFloat(t) || 0}))} keyboardType="numeric" placeholder="0" />
              </View>
              <CustomSelect label="Currency" value={form.currency} options={['INR', 'USD', 'EUR', 'GBP']} onChange={t => setForm(p => ({...p, currency: t}))} />
            </>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Duration (e.g. 6 Months)</Text>
            <TextInput 
              style={styles.input} 
              value={form.duration} 
              onChangeText={t => setForm(p => {
                const effective_to = calculateEffectiveTo(p.effective_from, t) || p.effective_to;
                return { ...p, duration: t, effective_to };
              })} 
              placeholder="e.g. 6 Months" 
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Effective From</Text>
            <TouchableOpacity style={styles.input} onPress={() => setDatePickerType('from')}>
              <Text style={{ color: form.effective_from ? '#0F172A' : '#94A3B8' }}>{form.effective_from || 'Select Date'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Effective To</Text>
            <TouchableOpacity style={styles.input} onPress={() => setDatePickerType('to')}>
              <Text style={{ color: form.effective_to ? '#0F172A' : '#94A3B8' }}>{form.effective_to || 'Select Date'}</Text>
            </TouchableOpacity>
          </View>

          <DateTimePickerModal
            isVisible={datePickerType !== null}
            mode="date"
            onConfirm={(date) => {
              const dateStr = formatDateStrDDMMYYYY(date);
              if (datePickerType === 'from') {
                setForm(p => {
                  const effective_to = calculateEffectiveTo(dateStr, p.duration) || p.effective_to;
                  return { ...p, effective_from: dateStr, effective_to };
                });
              }
              if (datePickerType === 'to') setForm(p => ({...p, effective_to: dateStr}));
              setDatePickerType(null);
            }}
            onCancel={() => setDatePickerType(null)}
          />

          <TouchableOpacity style={[styles.actionBtn, { marginTop: 20 }]} onPress={handleSaveTemplate} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.actionBtnText}>Save Template</Text>}
          </TouchableOpacity>
        </Animated.View>
      );
    }

    return (
      <Animated.View entering={FadeInUp.duration(300)}>
        <View style={styles.templatesHeader}>
          <Text style={styles.sectionTitle}>Saved Templates</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
            <Plus size={16} color="#FFF" />
            <Text style={styles.addBtnText}>New Template</Text>
          </TouchableOpacity>
        </View>

        {templatesLoading ? (
          <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#0F172A" />
        ) : templates.length === 0 ? (
          <View style={styles.emptyState}>
            <FileText size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No templates found. Create one to get started.</Text>
          </View>
        ) : (
          <View style={styles.templatesList}>
            {templates.map((tpl, i) => {
              const isExpanded = expandedId === tpl.name;
              return (
                <Animated.View key={tpl.name || i.toString()} layout={Layout.springify()} style={styles.templateCard}>
                  <TouchableOpacity style={styles.tCardHeader} onPress={() => setExpandedId(isExpanded ? null : tpl.name)}>
                    <View style={styles.tCardLeft}>
                      <Text style={styles.tCardTitle}>{tpl.template_name || 'Untitled'}</Text>
                      <View style={styles.badgesRow}>
                        <View style={styles.tCardBadge}><Text style={styles.tCardBadgeText}>{tpl.select_egwf}</Text></View>
                        <View style={[styles.tCardBadge, tpl.status === 'Active' ? styles.badgeActive : styles.badgeDraft]}>
                          <Text style={[styles.tCardBadgeText, tpl.status === 'Active' ? styles.badgeActiveText : styles.badgeDraftText]}>{tpl.status}</Text>
                        </View>
                      </View>
                    </View>
                    {isExpanded ? <ChevronUp size={20} color="#94A3B8" /> : <ChevronDown size={20} color="#94A3B8" />}
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.tCardBody}>
                      <View style={styles.tCardDetailsGrid}>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>Code</Text>
                          <Text style={styles.detailValue}>{tpl.template_code}</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>Compensation</Text>
                          <Text style={styles.detailValue}>{tpl.compensation_type} {tpl.compensation_amount > 0 ? `(${tpl.currency} ${tpl.compensation_amount})` : ''}</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>Duration</Text>
                          <Text style={styles.detailValue}>{tpl.duration || '-'}</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>Subject</Text>
                          <Text style={styles.detailValue} numberOfLines={1}>{tpl.subject || '-'}</Text>
                        </View>
                      </View>
                      
                      <View style={styles.tCardActions}>
                        <TouchableOpacity style={styles.tCardBtn} onPress={() => handleEditTemplate(tpl)}>
                          <Edit2 size={14} color="#3B82F6" style={{ marginRight: 6 }} />
                          <Text style={[styles.tCardBtnText, { color: '#3B82F6' }]}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.tCardBtn} onPress={() => handleDeleteTemplate(tpl.name)}>
                          <Trash2 size={14} color="#EF4444" style={{ marginRight: 6 }} />
                          <Text style={[styles.tCardBtnText, { color: '#EF4444' }]}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </Animated.View>
              );
            })}
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
          <Text style={styles.title}>Recruitment Settings</Text>
          <Text style={styles.subtitle}>Manage your Outreach templates and Offer letters.</Text>
        </Animated.View>

        {/* Custom Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'outreach' && styles.tabBtnActive]} 
            onPress={() => setActiveTab('outreach')}
          >
            <Mail size={16} color={activeTab === 'outreach' ? '#0F172A' : '#64748B'} />
            <Text style={[styles.tabBtnText, activeTab === 'outreach' && styles.tabBtnTextActive]}>Outreach</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'offer' && styles.tabBtnActive]} 
            onPress={() => setActiveTab('offer')}
          >
            <FileText size={16} color={activeTab === 'offer' ? '#0F172A' : '#64748B'} />
            <Text style={[styles.tabBtnText, activeTab === 'offer' && styles.tabBtnTextActive]}>Offer Letters</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'outreach' ? renderOutreachTab() : renderOfferLettersTab()}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1 },
  content: { padding: 20 },
  row: { flexDirection: 'row', alignItems: 'center' },

  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '900', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#64748B', fontWeight: '500', marginTop: 4 },

  tabsContainer: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 12, padding: 4, marginBottom: 24 },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8, gap: 8 },
  tabBtnActive: { backgroundColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  tabBtnText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  tabBtnTextActive: { color: '#0F172A', fontWeight: '700' },

  cardsRow: { gap: 16, marginBottom: 24 },
  actionCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  iconCircle: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  cardDesc: { fontSize: 12, color: '#64748B', lineHeight: 18, marginBottom: 20 },
  actionBtn: { backgroundColor: '#0F172A', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12 },
  actionBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  templateExpandedCard: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 5 },
  templateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  templateHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  templateHeaderText: { fontSize: 11, fontWeight: '800', color: '#64748B', letterSpacing: 0.5 },
  templateHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  copyPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#F1F5F9' },
  copyPillText: { fontSize: 10, fontWeight: '700', color: '#64748B' },
  closeBtn: { padding: 4 },
  
  templateBody: { padding: 24 },
  subjectLine: { fontSize: 14, color: '#334155', fontStyle: 'italic', marginBottom: 16 },
  boldText: { fontWeight: '700', fontStyle: 'normal' },
  bodyText: { fontSize: 13, color: '#334155', lineHeight: 22, fontWeight: '500' },

  infoBanner: { backgroundColor: '#0F172A', borderRadius: 20, padding: 24, flexDirection: 'row', gap: 16, marginTop: 10 },
  bannerIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  bannerContent: { flex: 1 },
  bannerHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 },
  bannerTitle: { fontSize: 15, fontWeight: '800', color: '#FFF' },
  secureBadge: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  secureBadgeText: { fontSize: 9, fontWeight: '800', color: '#FFF', letterSpacing: 0.5 },
  bannerDesc: { fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 18 },

  // Form styles
  formContainer: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 2 },
  formHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  formHeaderTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  
  inputContainer: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 8 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#0F172A' },
  textArea: { height: 100, textAlignVertical: 'top' },

  // Select styles
  selectBox: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectText: { fontSize: 14, color: '#0F172A' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 110, maxHeight: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  modalOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  modalOptionText: { fontSize: 15, color: '#334155' },

  // List styles
  templatesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 6 },
  addBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { marginTop: 12, color: '#94A3B8', fontSize: 14, fontWeight: '500' },
  
  templatesList: { gap: 12 },
  templateCard: { backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  tCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  tCardLeft: { flex: 1, gap: 8 },
  tCardTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  badgesRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  tCardBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tCardBadgeText: { fontSize: 10, fontWeight: '600', color: '#475569' },
  badgeActive: { backgroundColor: 'rgba(34, 197, 94, 0.1)' },
  badgeActiveText: { color: '#22C55E' },
  badgeDraft: { backgroundColor: 'rgba(245, 158, 11, 0.1)' },
  badgeDraftText: { color: '#F59E0B' },

  tCardBody: { padding: 16, paddingTop: 0, borderTopWidth: 1, borderTopColor: '#F8FAFC', marginTop: 4 },
  tCardDetailsGrid: { gap: 12, marginBottom: 16, paddingTop: 12 },
  detailItem: { gap: 4 },
  detailLabel: { fontSize: 11, fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase' },
  detailValue: { fontSize: 13, color: '#334155', fontWeight: '500' },
  tCardActions: { flexDirection: 'row', gap: 12, justifyContent: 'flex-end', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F8FAFC' },
  tCardBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, backgroundColor: '#F8FAFC' },
  tCardBtnText: { fontSize: 12, fontWeight: '700' }
});
