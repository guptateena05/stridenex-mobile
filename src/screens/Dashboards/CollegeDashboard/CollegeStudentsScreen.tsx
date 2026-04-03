import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, borderRadius } from '@/theme/spacing';
import { Card } from '@/components/Shared/Card';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Search, Users, ChevronDown } from 'lucide-react-native';

const students = [
  { id: "PS", name: "Priya Sharma", branch: "CSE", year: "3rd", employability: 87, internship: "—", status: "Interning", risk: "low", riskColor: colors.success },
  { id: "RM", name: "Rahul Mehta", branch: "ECE", year: "4th", employability: 54, internship: "—", status: "Searching", risk: "high", riskColor: colors.error },
  { id: "AK", name: "Aisha Khan", branch: "MBA", year: "2nd", employability: 73, internship: "—", status: "Interning", risk: "medium", riskColor: colors.warning },
  { id: "VS", name: "Vikram Singh", branch: "ME", year: "4th", employability: 42, internship: "—", status: "Searching", risk: "high", riskColor: colors.error },
  { id: "SP", name: "Sneha Patel", branch: "CSE", year: "3rd", employability: 91, internship: "—", status: "Interning", risk: "low", riskColor: colors.success },
  { id: "AN", name: "Arjun Nair", branch: "CS", year: "2nd", employability: 66, internship: "—", status: "Learning", risk: "medium", riskColor: colors.warning },
  { id: "PS2", name: "Priya Sharma", branch: "CSE", year: "3rd", employability: 87, internship: "—", status: "Interning", risk: "low", riskColor: colors.success },
  { id: "RM2", name: "Rahul Mehta", branch: "ECE", year: "4th", employability: 54, internship: "—", status: "Searching", risk: "high", riskColor: colors.error },
];

export const CollegeStudentsScreen = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInUp.delay(50)} style={styles.header}>
        <View style={styles.headerBadge}>
          <Users size={10} color="#059669" />
          <Text style={styles.headerBadgeText}>STUDENTS</Text>
        </View>
        <Text style={styles.title}>Student Directory</Text>
        <Text style={styles.subtitle}>Direct oversight of all student academic and placement progress</Text>
      </Animated.View>

      {/* Filters Row */}
      <View style={styles.searchRow}>
         <View style={styles.searchBar}>
            <Search color={colors.text.secondary} size={16} style={{ marginRight: 8 }} />
            <TextInput 
              placeholder="Search students, placements, metrics..." 
              placeholderTextColor={colors.text.secondary}
              style={styles.searchInput}
            />
         </View>
      </View>

      <View style={styles.filterRow}>
         <TouchableOpacity style={styles.filterDropdown}>
            <Text style={styles.filterText}>All Branches</Text>
            <ChevronDown size={14} color={colors.text.secondary} />
         </TouchableOpacity>
         <TouchableOpacity style={styles.filterDropdown}>
            <Text style={styles.filterText}>All Years</Text>
            <ChevronDown size={14} color={colors.text.secondary} />
         </TouchableOpacity>
         <TouchableOpacity style={styles.filterDropdown}>
            <Text style={styles.filterText}>All Risk Levels</Text>
            <ChevronDown size={14} color={colors.text.secondary} />
         </TouchableOpacity>
         <TouchableOpacity style={styles.exportBtn}>
            <Text style={styles.exportText}>Export CSV</Text>
         </TouchableOpacity>
      </View>

      <Card style={styles.tableCard}>
         <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
               {/* Table Header */}
               <View style={styles.tableHeader}>
                  <Text style={[styles.columnLabel, { width: 180 }]}>STUDENT</Text>
                  <Text style={[styles.columnLabel, { width: 80 }]}>BRANCH</Text>
                  <Text style={[styles.columnLabel, { width: 60 }]}>YEAR</Text>
                  <Text style={[styles.columnLabel, { width: 120 }]}>EMPLOYABILITY</Text>
                  <Text style={[styles.columnLabel, { width: 100 }]}>INTERNSHIP</Text>
                  <Text style={[styles.columnLabel, { width: 100 }]}>STATUS</Text>
                  <Text style={[styles.columnLabel, { width: 60 }]}>RISK</Text>
                  <Text style={[styles.columnLabel, { width: 80, textAlign: 'center' }]}>ACTION</Text>
               </View>

               {/* Table Rows */}
               <View style={styles.rowsContainer}>
                  {students.map((student, idx) => (
                    <View key={idx} style={[styles.row, idx === students.length - 1 && styles.noBorder]}>
                       <View style={[styles.column, { width: 180, flexDirection: 'row', alignItems: 'center' }]}>
                          <View style={[styles.avatar, { backgroundColor: student.riskColor + '20' }]}>
                             <Text style={[styles.avatarText, { color: student.riskColor }]}>{student.id.substring(0,2)}</Text>
                          </View>
                          <Text style={styles.studentName}>{student.name}</Text>
                       </View>
                       
                       <View style={[styles.column, { width: 80 }]}>
                          <Text style={styles.cellText}>{student.branch}</Text>
                       </View>

                       <View style={[styles.column, { width: 60 }]}>
                          <Text style={styles.cellText}>{student.year}</Text>
                       </View>

                       <View style={[styles.column, { width: 120, gap: 6 }]}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                             <View style={styles.miniBarBg}>
                                <View style={[styles.miniBarFill, { width: `${student.employability}%`, backgroundColor: student.riskColor }]} />
                             </View>
                             <Text style={[styles.empScore, { color: student.riskColor }]}>{student.employability}</Text>
                          </View>
                       </View>

                       <View style={[styles.column, { width: 100 }]}>
                          <Text style={styles.cellText}>{student.internship}</Text>
                       </View>

                       <View style={[styles.column, { width: 100 }]}>
                          <View style={[styles.statusBadge, { backgroundColor: student.status === 'Interning' ? 'rgba(16,185,129,0.1)' : student.status === 'Searching' ? 'rgba(234,88,12,0.1)' : 'rgba(124,58,237,0.1)' }]}>
                             <Text style={[styles.statusText, { color: student.status === 'Interning' ? colors.success : student.status === 'Searching' ? colors.warning : '#7C3AED' }]}>{student.status}</Text>
                          </View>
                       </View>

                       <View style={[styles.column, { width: 60, alignItems: 'center' }]}>
                          <View style={[styles.riskDot, { backgroundColor: student.riskColor }]} />
                       </View>

                       <View style={[styles.column, { width: 80, alignItems: 'center' }]}>
                          <TouchableOpacity style={styles.viewBtn}>
                             <Text style={styles.viewBtnText}>View</Text>
                          </TouchableOpacity>
                       </View>
                    </View>
                  ))}
               </View>
            </View>
         </ScrollView>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.light },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: 40 },
  header: { marginBottom: 24, paddingHorizontal: 4 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(5, 150, 105, 0.08)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 6 },
  headerBadgeText: { fontSize: 8, fontWeight: '800', color: '#059669', letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', fontFamily: typography.fontFamily.display, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 2 },
  
  searchRow: { marginBottom: spacing.sm },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: spacing.md, height: 44, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, height: '100%', fontSize: 12, color: colors.text.primary, fontWeight: '500' },
  
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: spacing.md, flexWrap: 'wrap' },
  filterDropdown: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  filterText: { fontSize: 11, fontWeight: '600', color: colors.text.secondary },
  exportBtn: { backgroundColor: '#F97316', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  exportText: { fontSize: 11, fontWeight: '700', color: '#fff' },

  tableCard: { padding: 0, borderRadius: 16, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F8FAFC', paddingVertical: 14, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  columnLabel: { fontSize: 10, fontWeight: '700', color: colors.text.secondary, letterSpacing: 0.5 },
  
  rowsContainer: { paddingHorizontal: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  noBorder: { borderBottomWidth: 0 },
  column: { paddingRight: 10 },
  
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarText: { fontSize: 11, fontWeight: '800' },
  studentName: { fontSize: 12, fontWeight: '800', color: colors.navy },
  cellText: { fontSize: 12, fontWeight: '600', color: colors.text.secondary },
  
  miniBarBg: { width: 60, height: 4, backgroundColor: '#EDF2F7', borderRadius: 2, overflow: 'hidden' },
  miniBarFill: { height: '100%', borderRadius: 2 },
  empScore: { fontSize: 12, fontWeight: '800' },
  
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
  statusText: { fontSize: 10, fontWeight: '800' },
  
  riskDot: { width: 10, height: 10, borderRadius: 5 },
  viewBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: colors.border, backgroundColor: '#fff' },
  viewBtnText: { fontSize: 11, fontWeight: '700', color: colors.navy }
});
