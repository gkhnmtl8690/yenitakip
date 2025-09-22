
import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function TabTwoScreen() {
  return (
    <ThemedView style={styles.container}>
      {/* Main Purple Frame - Contains header and buttons */}
      <ThemedView style={styles.mainPurpleFrame}>
        <ThemedView style={styles.headerTop}>
          <ThemedView style={styles.backButton}>
            <ThemedText style={styles.backButtonText}>← Geri</ThemedText>
          </ThemedView>
          <ThemedView style={styles.schoolInfo}>
            <ThemedText style={styles.schoolName}>ŞEHİT SERACETTİN KILINÇ İHO</ThemedText>
            <ThemedText style={styles.className}>6/A</ThemedText>
          </ThemedView>
        </ThemedView>
        
        <ThemedView style={styles.actionButtons}>
          <ThemedView style={styles.buttonRow}>
            <ThemedView style={styles.button}>
              <ThemedText style={styles.buttonText}>📁 Dosya Yükle</ThemedText>
            </ThemedView>
            <ThemedView style={styles.button}>
              <ThemedText style={styles.buttonText}>👤 Öğrenci Ekle</ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedView style={styles.buttonRow}>
            <ThemedView style={styles.button}>
              <ThemedText style={styles.buttonText}>📊 Toplam</ThemedText>
            </ThemedView>
            <ThemedView style={styles.button}>
              <ThemedText style={styles.buttonText}>📋 Rapor Oluştur</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
        
        {/* Students Label */}
        <ThemedText style={styles.studentsLabel}>Öğrenciler</ThemedText>
      </ThemedView>

      {/* Second Frame - Student list */}
      <ThemedView style={styles.studentsFrame}>
        <ThemedText style={styles.emptyStateTitle}>Henüz öğrenci eklenmedi</ThemedText>
        <ThemedText style={styles.emptyStateText}>
          Excel yükle veya manuel öğrenci ekle butonlarını kullanın
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000',
  },
  mainPurpleFrame: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 16,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  schoolInfo: {
    flex: 1,
    alignItems: 'center',
  },
  schoolName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  className: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  actionButtons: {
    gap: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  studentsLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 0,
    textAlign: 'center',
  },
  studentsFrame: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    marginTop: 40,
  },
  emptyStateTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateText: {
    color: '#E5E7EB',
    fontSize: 14,
    textAlign: 'center',
  },
});
