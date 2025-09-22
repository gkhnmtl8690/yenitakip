import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  FlatList,
  SafeAreaView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Date picker component for React Native
const DatePicker = ({ date, onDateChange, placeholder = "Tarih Seç" }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [localDate, setLocalDate] = useState(date || new Date());

  // Format date as dd/mm/yyyy
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Convert dd/mm/yyyy to yyyy-mm-dd
  const formatDateForStorage = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Parse dd/mm/yyyy string to Date
  const parseDate = (dateString) => {
    if (!dateString) return new Date();
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/');
      return new Date(year, month - 1, day);
    }
    return new Date(dateString);
  };

  const handleDateSelect = (selectedDate) => {
    setLocalDate(selectedDate);
    setShowDatePicker(false);
    // Date object olarak geri dön
    onDateChange(selectedDate);
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.datePickerButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.datePickerText}>
          {date ? formatDate(date instanceof Date ? date : parseDate(date)) : placeholder}
        </Text>
        <Text style={styles.calendarIcon}>📅</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <Modal transparent visible={showDatePicker} animationType="slide">
          <View style={styles.datePickerModal}>
            <View style={styles.datePickerContent}>
              <Text style={styles.datePickerTitle}>Tarih Seçin</Text>

              <View style={styles.calendarGrid}>
                {/* Simple calendar implementation */}
                <DateCalendar
                  selectedDate={localDate}
                  onDateSelect={handleDateSelect}
                />
              </View>

              <View style={styles.datePickerButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.buttonText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={() => handleDateSelect(localDate)}
                >
                  <Text style={styles.buttonText}>Seç</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

// Simple calendar component
const DateCalendar = ({ selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Get first day of week (Monday = 0)
    let startDay = (firstDay.getDay() + 6) % 7;

    const days = [];

    // Add empty days for previous month
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const days = getDaysInMonth(currentMonth);

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isSelectedDate = (date) => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  return (
    <View style={styles.calendar}>
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={goToPreviousMonth}>
          <Text style={styles.calendarNavButton}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.calendarTitle}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Text>
        <TouchableOpacity onPress={goToNextMonth}>
          <Text style={styles.calendarNavButton}>▶</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.calendarDayNames}>
        {dayNames.map((dayName) => (
          <Text key={dayName} style={styles.calendarDayName}>
            {dayName}
          </Text>
        ))}
      </View>

      <View style={styles.calendarDays}>
        {days.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.calendarDay,
              day && isSelectedDate(day) ? styles.selectedCalendarDay : null,
              !day ? styles.emptyCalendarDay : null,
            ]}
            onPress={() => day && onDateSelect(day)}
            disabled={!day}
          >
            <Text
              style={[
                styles.calendarDayText,
                day && isSelectedDate(day) ? styles.selectedCalendarDayText : null,
              ]}
            >
              {day ? day.getDate() : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const STORAGE_KEYS = {
  CLASSES: 'student_tracker_classes',
  SCHOOLS: 'student_tracker_schools',
  CALENDAR_SETTINGS: 'student_tracker_calendar',
  ARCHIVE: 'student_tracker_archive',
};

// Varsayılan takvim ayarları - 2025-2026 eğitim öğretim yılı
const DEFAULT_CALENDAR = {
  year: '2025-2026',
  periods: [
    {
      name: '1. Dönem 1. Ders Etkinliği',
      start: '2025-09-08',
      end: '2025-11-07',
      weeks: 9,
      pdfDate: '2025-11-07',
    },
    {
      name: '1. Dönem 2. Ders Etkinliği',
      start: '2025-11-17',
      end: '2026-01-09',
      weeks: 8,
      pdfDate: '2026-01-09',
    },
    {
      name: '2. Dönem 1. Ders Etkinliği',
      start: '2026-02-02',
      end: '2026-04-10',
      weeks: 9,
      pdfDate: '2026-04-10',
    },
    {
      name: '2. Dönem 2. Ders Etkinliği',
      start: '2026-04-13',
      end: '2026-06-12',
      weeks: 9,
      pdfDate: '2026-06-12',
    },
  ],
  holidays: [
    { name: '1. Dönem Ara Tatil', start: '2025-11-10', end: '2025-11-16' },
    { name: 'Yarıyıl Tatili', start: '2026-01-17', end: '2026-02-01' },
    { name: '2. Dönem Ara Tatil', start: '2026-03-16', end: '2026-03-22' },
  ],
};

// Türkçe karakterleri büyük harfe çevirme fonksiyonu
const toUpperCaseTurkish = (text) => {
  if (!text) return '';
  return text
    .replace(/ı/g, 'I')
    .replace(/i/g, 'İ')
    .replace(/ş/g, 'Ş')
    .replace(/ğ/g, 'Ğ')
    .replace(/ü/g, 'Ü')
    .replace(/ö/g, 'Ö')
    .replace(/ç/g, 'Ç')
    .toUpperCase();
};

// Tatil kontrolü fonksiyonu
const isCurrentlyOnHoliday = (holidays = []) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Saat bilgisini sıfırla

  return holidays.some(holiday => {
    const holidayStart = new Date(holiday.start);
    const holidayEnd = new Date(holiday.end);
    holidayStart.setHours(0, 0, 0, 0);
    holidayEnd.setHours(23, 59, 59, 999);

    return today >= holidayStart && today <= holidayEnd;
  });
};

// Haftalık tarihleri hesaplama fonksiyonu
const calculateWeeklyDates = (startDate, endDate, holidays = []) => {
  const weeks = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  let currentWeek = 1;
  let currentDate = new Date(start);

  while (currentDate <= end) {
    const weekStart = new Date(currentDate);
    const weekEnd = new Date(currentDate);
    weekEnd.setDate(weekEnd.getDate() + 6);

    // Cuma gününü ve saatini hesapla (haftanın 5. günü, Cuma 17:00)
    // JS'de getDay(): Pazar=0, Pazartesi=1, ..., Cuma=5
    // Pazartesi başlangıçlı haftalar için normalize et
    const fridayDate = new Date(currentDate);
    const dayOfWeek = (currentDate.getDay() + 6) % 7; // Pazartesi=0, Salı=1, ..., Cuma=4
    const daysUntilFriday = (4 - dayOfWeek + 7) % 7; // Cuma'ya kadar olan gün sayısı
    fridayDate.setDate(currentDate.getDate() + daysUntilFriday);
    fridayDate.setHours(17, 0, 0, 0);

    const resetDate = fridayDate; // Cuma 17:00 olarak ayarla

    // Tatil kontrolü
    const isHoliday = holidays.some(holiday => {
      const holidayStart = new Date(holiday.start);
      const holidayEnd = new Date(holiday.end);
      holidayStart.setHours(0, 0, 0, 0);
      holidayEnd.setHours(23, 59, 59, 999);
      return (weekStart <= holidayEnd && weekEnd >= holidayStart);
    });

    if (!isHoliday) {
      weeks.push({
        week: currentWeek,
        startDate: weekStart.toLocaleDateString('tr-TR'),
        endDate: weekEnd.toLocaleDateString('tr-TR'),
        resetDate: resetDate, // Her hafta için reset zamanını kaydet
      });
      currentWeek++;
    }

    currentDate.setDate(currentDate.getDate() + 7);
  }

  return weeks;
};

// Excel ve CSV parse fonksiyonu - Sadece CSV formatını destekle
const parseExcelData = async (arrayBuffer) => {
  throw new Error('Excel desteği henüz aktif değil. Lütfen CSV formatında dosya yükleyin.');
};

// CSV parse fonksiyonu
const parseCSVData = (csvText) => {
  try {
    console.log('CSV parse edilen veri:', csvText.substring(0, 300));

    // Satırları ayır
    const lines = csvText.split(/\r?\n/);
    const students = [];

    console.log('Toplam satır sayısı:', lines.length);

    // İlk satırı başlık olarak kontrol et, gerekirse atla
    let startIndex = 0;
    if (lines.length > 0) {
      const firstLine = lines[0].toLowerCase();
      if (firstLine.includes('okul') || firstLine.includes('numara') || firstLine.includes('ad') || firstLine.includes('soyad')) {
        startIndex = 1;
        console.log('Başlık satırı atlandı:', lines[0]);
      }
    }

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      console.log(`Satır ${i}:`, line);

      if (line && line.length > 3) { // Boş veya çok kısa satırları atla
        // Farklı ayırıcıları dene
        let columns = [];

        // Tab ile ayrılmış değerleri kontrol et
        if (line.includes('\t')) {
          columns = line.split('\t');
        }
        // Noktalı virgül ile ayrılmış
        else if (line.includes(';')) {
          columns = line.split(';');
        }
        // Virgül ile ayrılmış
        else if (line.includes(',')) {
          columns = line.split(',');
        }
        // Boşluk ile ayrılmış (iki veya daha fazla boşluk)
        else if (line.includes('  ')) {
          columns = line.split(/\s{2,}/);
        }
        // Tek boşluk ile ayrılmış
        else {
          columns = line.split(' ');
        }

        // Sütunları temizle
        columns = columns.map(col => col.trim()).filter(col => col.length > 0);

        console.log(`Satır ${i} sütunları:`, columns);

        if (columns.length >= 2 && columns[0] && columns[1]) {
          // İlk sütun okul numarası, ikinci sütun ad soyad
          const schoolNumber = columns[0];
          const name = columns.slice(1).join(' '); // Kalan sütunları ad soyad olarak birleştir

          if (schoolNumber.length > 0 && name.length > 0) {
            students.push({
              id: Date.now().toString() + '_' + i + '_' + Math.random(),
              schoolNumber: toUpperCaseTurkish(schoolNumber),
              name: toUpperCaseTurkish(name),
              weeklyScores: {},
              totalPlus: 0,
              totalMinus: 0,
              totalFivePlus: 0,
              totalAbsent: 0,
            });

            console.log('Öğrenci eklendi:', schoolNumber, name);
          }
        }
      }
    }

    console.log('Toplam eklenen öğrenci sayısı:', students.length);
    return students;
  } catch (error) {
    console.error('CSV parse hatası:', error);
    throw new Error('Dosya formatı okunamadı: ' + error.message);
  }
};

// Web için dosya okuma fonksiyonu
const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file, 'UTF-8');
  });
};

// HTML tablo formatında Word/PDF uyumlu dosya oluşturma fonksiyonu
const generateWordDocument = async (wordData, weeklyDates) => {
  try {
    let htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${wordData.schoolName} - ${wordData.className} Raporu</title>
    <style>
        @page {
            margin: 1.27cm;
            size: A4;
        }
        body { 
            font-family: Arial, sans-serif; 
            margin: 0;
            padding: 8px;
            font-size: 9px;
        }
        .header { 
            text-align: center; 
            margin-bottom: 8px; 
            margin-top: 5px;
        }
        .header-line1 { 
            font-family: Arial, sans-serif;
            font-size: 9pt; 
            font-weight: bold; 
            margin-bottom: 2px;
            line-height: 1.2;
        }
        .header-line2 { 
            font-family: Arial, sans-serif;
            font-size: 9pt; 
            font-weight: bold; 
            margin-bottom: 5px;
            line-height: 1.2;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 5px;
            font-size: 8px;
        }
        th, td { 
            border: 1px solid #000; 
            padding: 1px; 
            text-align: center; 
            vertical-align: middle;
            height: 18px;
        }
        tbody tr {
            height: 0.4cm;
        }
        tbody td {
            height: 0.4cm;
            line-height: 1;
        }
        th { 
            background-color: #f0f0f0; 
            font-weight: bold; 
            font-size: 7px;
            line-height: 1.1;
        }
        .student-info { 
            text-align: left; 
            font-size: 7px;
            max-width: 60px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .week-header {
            writing-mode: vertical-rl;
            text-orientation: mixed;
            width: 25px;
            min-width: 25px;
            max-width: 25px;
            font-size: 6px;
            line-height: 1;
        }
        .score-cell {
            font-size: 8px;
            font-weight: bold;
            width: 25px;
            min-width: 25px;
            max-width: 25px;
        }
        .final-score { 
            background-color: #e8f5e8; 
            font-weight: bold; 
            font-size: 8px;
            width: 35px;
        }
        .total-cell {
            font-size: 6px;
            width: 45px;
        }
        .okul-no {
            width: 35px;
            font-size: 7px;
        }
        .ad-soyad {
            width: 80px;
            font-size: 7px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-line1">${wordData.year} EĞİTİM ÖĞRETİM YILI ${wordData.schoolName}</div>
        <div class="header-line2">${wordData.period} MÜZİK DERSİ ${wordData.gradeNumber}</div>
        <div style="font-size: 8px; color: #666; margin-top: 8px;">Rapor Tarihi: ${wordData.createdDate}</div>
    </div>

    <table>
        <thead>
            <tr>
                <th class="okul-no">OKUL<br>NO</th>
                <th class="ad-soyad">AD SOYAD</th>`;

    // Hafta başlıkları - dikey format
    weeklyDates.forEach(week => {
      const weekDate = week.startDate.split('.'); // Türkçe tarih formatı: dd.mm.yyyy
      const shortDate = `${weekDate[0]}.${weekDate[1]}.${weekDate[2]}`;
      htmlContent += `<th class="week-header">${week.week}. HAFTA<br>(${shortDate})</th>`;
    });

    htmlContent += `<th class="total-cell">TOPLAM<br>+-5+G</th>
                <th class="final-score">ALDIĞI<br>NOT</th>
            </tr>
        </thead>
        <tbody>`;

    // Öğrenci verileri
    wordData.students.forEach(student => {
      htmlContent += `
            <tr>
                <td class="student-info okul-no">${student.schoolNumber}</td>
                <td class="student-info ad-soyad">${student.name}</td>`;

      // Haftalık puanlar
      weeklyDates.forEach(week => {
        const weekKey = `week_${week.week}`;
        const weekScore = student.weeklyScores[weekKey] || {};
        let scoreText = '';
        let cellColor = '';

        if (weekScore.plus) {
          scoreText += '+';
          cellColor = 'background-color: #d4edda;';
        }
        if (weekScore.minus) {
          scoreText += '-';
          cellColor = 'background-color: #f8d7da;';
        }
        if (weekScore.fivePlus) {
          const count = typeof weekScore.fivePlus === 'number' ? weekScore.fivePlus : 1;
          scoreText += count > 1 ? `++(${count})` : '++';
          cellColor = 'background-color: #fff3cd;';
        }
        if (weekScore.absent) {
          scoreText += 'G';
          cellColor = 'background-color: #cce5ff;';
        }

        htmlContent += `<td class="score-cell" style="${cellColor}">${scoreText}</td>`;
      });

      // Toplam puanlar ve final notu
      htmlContent += `
                <td class="total-cell">+${student.totalPlus} -${student.totalMinus}<br>5+${student.totalFivePlus} G${student.totalAbsent}</td>
                <td class="final-score">${student.finalScore}</td>
            </tr>`;
    });

    htmlContent += `
        </tbody>
    </table>

    <div style="margin-top: 5px; font-size: 6px; color: #666;">
        <strong>Puanlama:</strong> Her 1 eksi (-) = 5 puan düşer | Her 1 tane 5+ = 5 puan eklenir | G = Devamsızlık | Maksimum puan: 100
    </div>
</body>
</html>`;

    return htmlContent;
  } catch (error) {
    console.error('Dosya oluşturma hatası:', error);
    throw new Error('Dosya oluşturulamadı');
  }
};

// Web için Word/PDF dosya indirme fonksiyonu
const downloadWordFile = (content, filename) => {
  // HTML içeriğini Word formatında indir
  const blob = new Blob([content], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);

  if (Platform.OS === 'web') {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

// Otomatik haftalık sıfırlama ve dönem sonu arşivleme fonksiyonları
const checkAndHandleWeeklyReset = async () => {
    try {
      const now = new Date();
      const savedClasses = await AsyncStorage.getItem(STORAGE_KEYS.CLASSES);
      const savedCalendar = await AsyncStorage.getItem(STORAGE_KEYS.CALENDAR_SETTINGS);

      if (!savedClasses || !savedCalendar) return;

      const classesData = JSON.parse(savedClasses);
      const calendarData = JSON.parse(savedCalendar);

      let hasChanges = false;

      const updatedClasses = classesData.map(classItem => {
        const currentPeriod = calendarData.periods[classItem.currentPeriod] || calendarData.periods[0];
        if (!currentPeriod) return classItem;

        const weeklyDates = calculateWeeklyDates(currentPeriod.start, currentPeriod.end, calendarData.holidays);
        const currentWeekData = weeklyDates.find(week => week.week === classItem.currentWeek);

        if (!currentWeekData) return classItem;

        const resetTime = currentWeekData.resetDate;
        const lastResetCheck = new Date(classItem.lastResetCheck || 0);

        // Eğer reset zamanı geçmişse ve daha önce reset yapılmamışsa
        if (now >= resetTime && lastResetCheck < resetTime && classItem.currentWeek < weeklyDates.length) {
          console.log(`Haftalık sıfırlama yapılıyor: ${classItem.name}, Hafta: ${classItem.currentWeek} -> ${classItem.currentWeek + 1}`);

          // Bu haftaki puanları toplama ekle
          const updatedStudents = classItem.students.map(student => {
            const currentWeekKey = `week_${classItem.currentWeek}`;
            const currentWeekScore = student.weeklyScores[currentWeekKey] || {};

            let weeklyPlus = 0, weeklyMinus = 0, weeklyFivePlus = 0, weeklyAbsent = 0;
            if (currentWeekScore.plus) weeklyPlus = 1;
            if (currentWeekScore.minus) weeklyMinus = 1;
            if (currentWeekScore.fivePlus) weeklyFivePlus = (typeof currentWeekScore.fivePlus === 'number' && currentWeekScore.fivePlus > 0 ? currentWeekScore.fivePlus : 1);
            if (currentWeekScore.absent) weeklyAbsent = 1;

            return {
              ...student,
              totalPlus: student.totalPlus + weeklyPlus,
              totalMinus: student.totalMinus + weeklyMinus,
              totalFivePlus: student.totalFivePlus + weeklyFivePlus,
              totalAbsent: student.totalAbsent + weeklyAbsent,
            };
          });

          hasChanges = true;
          return {
            ...classItem,
            currentWeek: classItem.currentWeek + 1,
            students: updatedStudents,
            lastResetCheck: now.toISOString(),
          };
        }

        return classItem;
      });

      if (hasChanges) {
        await AsyncStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(updatedClasses));
        // setClasses(updatedClasses); // Bu fonksiyon component'in state'ini günceller, buraya eklenmemeli.

        // Eğer seçili sınıf varsa güncelle
        // if (selectedClass) {
        //   const updatedSelectedClass = updatedClasses.find(cls => cls.id === selectedClass.id);
        //   if (updatedSelectedClass) {
        //     setSelectedClass(updatedSelectedClass);
        //   }
        // }

        console.log('Haftalık sıfırlama tamamlandı');
        Alert.alert('Haftalık Sıfırlama', 'Yeni hafta başladı! Puanlama sistemi yeni hafta için hazırlandı.');
      }
    } catch (error) {
      console.error('Haftalık sıfırlama hatası:', error);
    }
  };

const checkAndHandlePeriodEnd = async () => {
    try {
      const now = new Date();
      const savedClasses = await AsyncStorage.getItem(STORAGE_KEYS.CLASSES);
      const savedCalendar = await AsyncStorage.getItem(STORAGE_KEYS.CALENDAR_SETTINGS);
      const savedArchive = await AsyncStorage.getItem(STORAGE_KEYS.ARCHIVE);

      if (!savedClasses || !savedCalendar) return;

      const classesData = JSON.parse(savedClasses);
      const calendarData = JSON.parse(savedCalendar);
      const archiveData = JSON.parse(savedArchive) || [];

      let newArchiveItems = [];

      for (const classItem of classesData) {
        const currentPeriod = calendarData.periods[classItem.currentPeriod] || calendarData.periods[0];
        if (!currentPeriod) continue;

        const weeklyDates = calculateWeeklyDates(currentPeriod.start, currentPeriod.end, calendarData.holidays);
        const periodEndDate = new Date(currentPeriod.end);
        periodEndDate.setHours(17, 0, 0, 0); // Son gün 17:00

        // Eğer dönem bitmiş ve daha önce arşivlenmemişse
        if (now >= periodEndDate && !classItem.periodArchived) {
          console.log(`Dönem sonu arşivleme yapılıyor: ${classItem.name}`);

          // Okul adını bul
          const schoolObj = JSON.parse(await AsyncStorage.getItem(STORAGE_KEYS.SCHOOLS) || '[]')
            .find(school => school.id === classItem.schoolId);
          const schoolName = schoolObj ? schoolObj.name : 'Bilinmeyen Okul';

          // Arşiv için veri hazırla
          const archiveItem = {
            id: Date.now().toString() + '_' + classItem.id,
            schoolName: schoolName,
            className: classItem.name,
            period: currentPeriod.name,
            gradeNumber: 'OTOMATİK ARŞİV',
            year: calendarData.year,
            students: classItem.students.map(student => ({
              schoolNumber: student.schoolNumber,
              name: student.name,
              finalScore: calculateFinalScore(student),
              totalPlus: student.totalPlus,
              totalMinus: student.totalMinus,
              totalFivePlus: student.totalFivePlus,
              totalAbsent: student.totalAbsent,
              weeklyScores: student.weeklyScores,
            })),
            createdDate: now.toLocaleDateString('tr-TR'),
            autoArchived: true,
          };

          newArchiveItems.push(archiveItem);

          // Sınıfı dönem arşivlenmiş olarak işaretle
          classItem.periodArchived = true;
        }
      }

      if (newArchiveItems.length > 0) {
        const updatedArchive = [...archiveData, ...newArchiveItems];
        await AsyncStorage.setItem(STORAGE_KEYS.ARCHIVE, JSON.stringify(updatedArchive));
        // setArchive(updatedArchive); // Bu fonksiyon component'in state'ini günceller, buraya eklenmemeli.

        // Sınıfları güncelle
        const updatedClasses = classesData.map(classItem => {
          const archiveItem = newArchiveItems.find(item => item.id.includes(classItem.id));
          if (archiveItem) {
            return { ...classItem, periodArchived: true };
          }
          return classItem;
        });

        await AsyncStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(updatedClasses));
        // setClasses(updatedClasses); // Bu fonksiyon component'in state'ini günceller, buraya eklenmemeli.

        console.log(`${newArchiveItems.length} sınıf otomatik olarak arşivlendi`);
        Alert.alert(
          'Dönem Sonu Arşivleme',
          `${newArchiveItems.length} sınıfın dönem sonu raporu otomatik olarak arşive eklendi!\n\nArşiv bölümünden görüntüleyebilirsiniz.`
        );
      }
    } catch (error) {
      console.error('Dönem sonu arşivleme hatası:', error);
    }
  };

export default function StudentTrackerApp() {
  const [classes, setClasses] = useState([]);
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedClass, setSelectedClass] = useState(null);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showTotalsModal, setShowTotalsModal] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newStudentNumber, setNewStudentNumber] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [showEditSchoolModal, setShowEditSchoolModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [editSchoolName, setEditSchoolName] = useState('');
  const [calendarSettings, setCalendarSettings] = useState(DEFAULT_CALENDAR);
  const [archive, setArchive] = useState([]);
  const [pdfSettings, setPdfSettings] = useState({
    schoolName: '',
    className: '',
    period: '',
    gradeNumber: ''
  });
  const [isHolidayMode, setIsHolidayMode] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    school: false,
    class: false,
    period: false,
    grade: false
  });
  const [showEditClassModal, setShowEditClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [editClassName, setEditClassName] = useState('');
  
  // Tarih seçici ve kaydet butonu için yeni state'ler
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentEditingWeek, setCurrentEditingWeek] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    loadData();

    // Her 60 saniyede bir kontrol yap (örn: haftalık sıfırlama ve dönem sonu kontrolü)
    const interval = setInterval(() => {
      checkAndHandleWeeklyReset();
      checkAndHandlePeriodEnd();
    }, 60000); // 60 saniye

    // Component unmount edildiğinde interval'ı temizle
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Tatil durumunu kontrol et
    const holidayStatus = isCurrentlyOnHoliday(calendarSettings.holidays);
    setIsHolidayMode(holidayStatus);
  }, [calendarSettings.holidays]);

  // Otomatik kayıt için useEffect - hafta değiştiğinde veya component unmount'ta
  useEffect(() => {
    // Eğer kaydedilmemiş değişiklikler varsa otomatik kaydet
    const autoSave = () => {
      if (hasUnsavedChanges && currentEditingWeek && selectedClass) {
        // Sessiz otomatik kaydet (Alert olmadan)
        const weekKey = `week_${currentEditingWeek}`;
        const isAlreadySaved = selectedClass.students.some(student => 
          student.weeklyScores[weekKey] && student.weeklyScores[weekKey].saved
        );
        
        if (!isAlreadySaved) {
          // Otomatik kaydet işlemini yap
          const updatedClasses = classes.map(cls => {
            if (cls.id === selectedClass.id) {
              const updatedStudents = cls.students.map(student => {
                const weekScore = student.weeklyScores[weekKey] || {};
                
                if (Object.keys(weekScore).length > 0 && !weekScore.saved) {
                  let weeklyPlus = 0, weeklyMinus = 0, weeklyFivePlus = 0, weeklyAbsent = 0;
                  if (weekScore.plus) weeklyPlus = 1;
                  if (weekScore.minus) weeklyMinus = 1;
                  if (weekScore.fivePlus) weeklyFivePlus = (typeof weekScore.fivePlus === 'number' && weekScore.fivePlus > 0 ? weekScore.fivePlus : 1);
                  if (weekScore.absent) weeklyAbsent = 1;
                  
                  const updatedWeekScore = { ...weekScore, saved: true };
                  
                  return {
                    ...student,
                    totalPlus: student.totalPlus + weeklyPlus,
                    totalMinus: student.totalMinus + weeklyMinus,
                    totalFivePlus: student.totalFivePlus + weeklyFivePlus,
                    totalAbsent: student.totalAbsent + weeklyAbsent,
                    weeklyScores: {
                      ...student.weeklyScores,
                      [weekKey]: updatedWeekScore
                    }
                  };
                }
                return student;
              });
              
              return { ...cls, students: updatedStudents };
            }
            return cls;
          });
          
          setClasses(updatedClasses);
          setSelectedClass(updatedClasses.find(cls => cls.id === selectedClass.id));
          saveData(STORAGE_KEYS.CLASSES, updatedClasses);
          setHasUnsavedChanges(false);
        }
      }
    };
    
    // Hafta/sınıf değiştiğinde otomatik kaydet
    autoSave();
    
    // Cleanup function - component unmount edildiğinde otomatik kaydet
    return () => {
      autoSave();
    };
  }, [hasUnsavedChanges, currentEditingWeek, selectedClass, classes]);

  const loadData = async () => {
    try {
      const savedClasses = await AsyncStorage.getItem(STORAGE_KEYS.CLASSES);
      const savedSchools = await AsyncStorage.getItem(STORAGE_KEYS.SCHOOLS);
      const savedCalendar = await AsyncStorage.getItem(STORAGE_KEYS.CALENDAR_SETTINGS);
      const savedArchive = await AsyncStorage.getItem(STORAGE_KEYS.ARCHIVE);

      if (savedClasses) {
        const parsedClasses = JSON.parse(savedClasses);
        // Eski veri formatını yeni formata uygun hale getir (varsa)
        const classesWithDefaults = parsedClasses.map(cls => ({
          ...cls,
          currentWeek: cls.currentWeek || 1, // Eğer currentWeek yoksa 1 olarak ayarla
          lastResetCheck: cls.lastResetCheck || null, // Eğer yoksa null olarak ayarla
          periodArchived: cls.periodArchived || false, // Eğer yoksa false olarak ayarla
          students: cls.students.map(student => ({
            ...student,
            totalPlus: student.totalPlus || 0,
            totalMinus: student.totalMinus || 0,
            totalFivePlus: student.totalFivePlus || 0,
            totalAbsent: student.totalAbsent || 0,
          }))
        }));
        setClasses(classesWithDefaults);
      }
      if (savedSchools) {
        const schoolsData = JSON.parse(savedSchools);
        setSchools(schoolsData);
      }
      if (savedCalendar) {
        const parsedCalendar = JSON.parse(savedCalendar);
        // Varsayılan tatilleri ekle eğer hiç yoksa
        const calendarWithDefaults = {
          ...DEFAULT_CALENDAR,
          ...parsedCalendar,
          holidays: parsedCalendar.holidays || DEFAULT_CALENDAR.holidays,
          periods: parsedCalendar.periods || DEFAULT_CALENDAR.periods,
        };
        setCalendarSettings(calendarWithDefaults);
      } else {
        setCalendarSettings(DEFAULT_CALENDAR); // Eğer kaydedilmiş takvim yoksa varsayılanı kullan
      }
      if (savedArchive) setArchive(JSON.parse(savedArchive));
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    }
  };

  const saveData = async (key, data) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Veri kaydetme hatası:', error);
    }
  };

  const addSchool = () => {
    if (newSchoolName.trim()) {
      const newSchool = {
        id: Date.now().toString(),
        name: toUpperCaseTurkish(newSchoolName.trim()),
      };
      const updatedSchools = [...schools, newSchool];
      setSchools(updatedSchools);
      saveData(STORAGE_KEYS.SCHOOLS, updatedSchools);
      setNewSchoolName('');
    }
  };

  const editSchool = (school) => {
    setEditingSchool(school);
    setEditSchoolName(school.name);
    setShowEditSchoolModal(true);
  };

  const saveEditedSchool = () => {
    if (editSchoolName.trim() && editingSchool) {
      const updatedSchools = schools.map(school =>
        school.id === editingSchool.id
          ? { ...school, name: toUpperCaseTurkish(editSchoolName.trim()) }
          : school
      );
      setSchools(updatedSchools);
      saveData(STORAGE_KEYS.SCHOOLS, updatedSchools);

      // Eğer düzenlenen okul seçili okulsa güncelle
      if (selectedSchool && selectedSchool.id === editingSchool.id) {
        setSelectedSchool({ ...selectedSchool, name: toUpperCaseTurkish(editSchoolName.trim()) });
      }

      setShowEditSchoolModal(false);
      setEditingSchool(null);
      setEditSchoolName('');
    }
  };

  const deleteSchool = (schoolId) => {
    if (Platform.OS === 'web') {
      if (confirm('Bu okulu ve bağlı tüm sınıfları silmek istediğinizden emin misiniz?')) {
        const updatedClasses = classes.filter(cls => cls.schoolId !== schoolId);
        setClasses(updatedClasses);
        saveData(STORAGE_KEYS.CLASSES, updatedClasses);

        const updatedSchools = schools.filter(school => school.id !== schoolId);
        setSchools(updatedSchools);
        saveData(STORAGE_KEYS.SCHOOLS, updatedSchools);

        if (selectedSchool && selectedSchool.id === schoolId) {
          setSelectedSchool(null);
          setCurrentScreen('home');
        }
      }
    } else {
      Alert.alert(
        'Okul Sil',
        'Bu okulu ve bağlı tüm sınıfları silmek istediğinizden emin misiniz?',
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Sil',
            style: 'destructive',
            onPress: () => {
              const updatedClasses = classes.filter(cls => cls.schoolId !== schoolId);
              setClasses(updatedClasses);
              saveData(STORAGE_KEYS.CLASSES, updatedClasses);

              const updatedSchools = schools.filter(school => school.id !== schoolId);
              setSchools(updatedSchools);
              saveData(STORAGE_KEYS.SCHOOLS, updatedSchools);

              if (selectedSchool && selectedSchool.id === schoolId) {
                setSelectedSchool(null);
                setCurrentScreen('home');
              }
            }
          }
        ]
      );
    }
  };

  const addClass = () => {
    if (newClassName.trim() && selectedSchool) {
      const newClass = {
        id: Date.now().toString(),
        name: toUpperCaseTurkish(newClassName.trim()),
        schoolId: selectedSchool.id,
        students: [],
        currentWeek: 1,
        lastResetCheck: null, // Başlangıçta sıfırlama kontrolü tarihi yok
        periodArchived: false, // Başlangıçta arşivlenmemiş
        currentPeriod: 0, // Varsayılan olarak ilk dönemi seç
      };
      const updatedClasses = [...classes, newClass];

      // Sınıfları sırala: önce sayı, sonra harf (A, B, C...)
      updatedClasses.sort((a, b) => {
        // Sınıf adından sayı ve harf kısmını ayır
        const parseClassName = (name) => {
          const match = name.match(/^(\d+)\/([A-Z])$/);
          if (match) {
            return { grade: parseInt(match[1]), section: match[2] };
          }
          // Eğer standart format değilse alfabetik olarak sırala
          return { grade: 999, section: name };
        };

        const classA = parseClassName(a.name);
        const classB = parseClassName(b.name);

        // Önce sınıf numarasına göre sırala
        if (classA.grade !== classB.grade) {
          return classA.grade - classB.grade;
        }

        // Sonra şube harfine göre sırala
        return classA.section.localeCompare(classB.section);
      });

      setClasses(updatedClasses);
      saveData(STORAGE_KEYS.CLASSES, updatedClasses);
      setNewClassName('');
      setShowAddClassModal(false);
    }
  };

  const editClass = (classItem) => {
    setEditingClass(classItem);
    setEditClassName(classItem.name);
    setShowEditClassModal(true);
  };

  const saveEditedClass = () => {
    if (editClassName.trim() && editingClass) {
      const updatedClasses = classes.map(cls =>
        cls.id === editingClass.id
          ? { ...cls, name: toUpperCaseTurkish(editClassName.trim()) }
          : cls
      );

      // Sınıfları tekrar sırala
      updatedClasses.sort((a, b) => {
        const parseClassName = (name) => {
          const match = name.match(/^(\d+)\/([A-Z])$/);
          if (match) {
            return { grade: parseInt(match[1]), section: match[2] };
          }
          return { grade: 999, section: name };
        };

        const classA = parseClassName(a.name);
        const classB = parseClassName(b.name);

        if (classA.grade !== classB.grade) {
          return classA.grade - classB.grade;
        }

        return classA.section.localeCompare(classB.section);
      });

      setClasses(updatedClasses);
      saveData(STORAGE_KEYS.CLASSES, updatedClasses);

      // Eğer düzenlenen sınıf seçili sınıfsa güncelle
      if (selectedClass && selectedClass.id === editingClass.id) {
        setSelectedClass({ ...selectedClass, name: toUpperCaseTurkish(editClassName.trim()) });
      }

      setShowEditClassModal(false);
      setEditingClass(null);
      setEditClassName('');
    }
  };

  const removeClass = (classId) => {
    console.log('removeClass fonksiyonu çağrıldı:', classId);

    if (Platform.OS === 'web') {
      // Web için basit confirm dialog
      if (confirm('Bu sınıfı silmek istediğinizden emin misiniz?')) {
        console.log('Sınıf silme onaylandı:', classId);
        const updatedClasses = classes.filter(cls => cls.id !== classId);
        setClasses(updatedClasses);
        saveData(STORAGE_KEYS.CLASSES, updatedClasses);

        // Eğer silinen sınıf seçili sınıfsa, okul sayfasına dön
        if (selectedClass && selectedClass.id === classId) {
          setSelectedClass(null);
          setCurrentScreen('school');
        }
      }
    } else {
      // Mobil için Alert
      Alert.alert(
        'Sınıf Sil',
        'Bu sınıfı silmek istediğinizden emin misiniz?',
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Sil',
            style: 'destructive',
            onPress: () => {
              console.log('Sınıf silme onaylandı:', classId);
              const updatedClasses = classes.filter(cls => cls.id !== classId);
              setClasses(updatedClasses);
              saveData(STORAGE_KEYS.CLASSES, updatedClasses);

              if (selectedClass && selectedClass.id === classId) {
                setSelectedClass(null);
                setCurrentScreen('school');
              }
            }
          }
        ]
      );
    }
  };

  const removeStudent = (studentId) => {
    console.log('removeStudent fonksiyonu çağrıldı:', studentId);

    if (Platform.OS === 'web') {
      // Web için basit confirm dialog
      if (confirm('Bu öğrenciyi silmek istediğinizden emin misiniz?')) {
        console.log('Öğrenci silme onaylandı:', studentId);
        const updatedClasses = classes.map(cls => {
          if (cls.id === selectedClass.id) {
            return {
              ...cls,
              students: cls.students.filter(student => student.id !== studentId),
            };
          }
          return cls;
        });

        const updatedSelectedClass = updatedClasses.find(cls => cls.id === selectedClass.id);

        setClasses(updatedClasses);
        setSelectedClass(updatedSelectedClass);
        saveData(STORAGE_KEYS.CLASSES, updatedClasses);
      }
    } else {
      // Mobil için Alert
      Alert.alert(
        'Öğrenci Sil',
        'Bu öğrenciyi silmek istediğinizden emin misiniz?',
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Sil',
            style: 'destructive',
            onPress: () => {
              console.log('Öğrenci silme onaylandı:', studentId);
              const updatedClasses = classes.map(cls => {
                if (cls.id === selectedClass.id) {
                  return {
                    ...cls,
                    students: cls.students.filter(student => student.id !== studentId),
                  };
                }
                return cls;
              });

              const updatedSelectedClass = updatedClasses.find(cls => cls.id === selectedClass.id);

              setClasses(updatedClasses);
              setSelectedClass(updatedSelectedClass);
              saveData(STORAGE_KEYS.CLASSES, updatedClasses);
            }
          }
        ]
      );
    }
  };

  const addStudentManually = () => {
    if (newStudentNumber.trim() && newStudentName.trim() && selectedClass) {
      const newStudent = {
        id: Date.now().toString(),
        schoolNumber: toUpperCaseTurkish(newStudentNumber.trim()),
        name: toUpperCaseTurkish(newStudentName.trim()),
        weeklyScores: {},
        totalPlus: 0,
        totalMinus: 0,
        totalFivePlus: 0,
        totalAbsent: 0,
      };

      const updatedClasses = classes.map(cls => {
        if (cls.id === selectedClass.id) {
          // Mevcut öğrenci listesine yeni öğrenciyi ekle
          const updatedStudents = [...cls.students, newStudent];

          // Okul numarasına göre sırala
          updatedStudents.sort((a, b) => {
            const aNum = parseInt(a.schoolNumber) || 0;
            const bNum = parseInt(b.schoolNumber) || 0;
            return aNum - bNum;
          });

          return {
            ...cls,
            students: updatedStudents,
          };
        }
        return cls;
      });

      const updatedSelectedClass = updatedClasses.find(cls => cls.id === selectedClass.id);

      setClasses(updatedClasses);
      setSelectedClass(updatedSelectedClass);
      saveData(STORAGE_KEYS.CLASSES, updatedClasses);
      
      // Eğer özel hafta düzenleme modundaysak, değişiklikleri işaretle
      if (currentEditingWeek) {
        setHasUnsavedChanges(true);
      }
      setNewStudentNumber('');
      setNewStudentName('');
      setShowAddStudentModal(false);
    }
  };

  const pickDocument = async () => {
    try {
      if (Platform.OS === 'web') {
        // Web için HTML file input kullan
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv,.txt';
        input.multiple = false;

        input.onchange = async (e) => {
          const file = e.target.files[0];
          if (file) {
            try {
              console.log('Dosya seçildi:', file.name, 'Tip:', file.type, 'Boyut:', file.size);

              let students = [];

              // Sadece CSV/Text dosyası destekle
              console.log('Dosya parse ediliyor...');
              let content = '';

              // Farklı encoding denemesi
              try {
                content = await readFileAsText(file);
                console.log('Dosya içeriği (UTF-8):', content.substring(0, 200));
              } catch (error) {
                console.log('UTF-8 okuma hatası, farklı encoding deneniyor');
                // Latin-1 encoding deneme
                content = await new Promise((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = (e) => resolve(e.target.result);
                  reader.onerror = (e) => reject(e);
                  reader.readAsText(file, 'ISO-8859-1');
                });
                console.log('Dosya içeriği (ISO-8859-1):', content.substring(0, 200));
              }

              students = parseCSVData(content);

              if (students.length === 0) {
                Alert.alert('Hata', 'Dosyada geçerli öğrenci bilgisi bulunamadı.\n\nDosya formatı:\n1. sütun: Okul numarası\n2. sütun: Ad Soyad\n\nCSV veya tab ile ayrılmış dosya olmalı.');
                return;
              }

              const updatedClasses = classes.map(cls => {
                if (cls.id === selectedClass.id) {
                  // Mevcut öğrenciler + yeni yüklenen öğrenciler
                  const allStudents = [...cls.students, ...students];

                  // Okul numarasına göre sırala
                  allStudents.sort((a, b) => {
                    const aNum = parseInt(a.schoolNumber) || 0;
                    const bNum = parseInt(b.schoolNumber) || 0;
                    return aNum - bNum;
                  });

                  return {
                    ...cls,
                    students: allStudents,
                  };
                }
                return cls;
              });

              const updatedSelectedClass = updatedClasses.find(cls => cls.id === selectedClass.id);

              setClasses(updatedClasses);
              setSelectedClass(updatedSelectedClass);
              saveData(STORAGE_KEYS.CLASSES, updatedClasses);
              Alert.alert('Başarılı', `${students.length} öğrenci eklendi!`);
            } catch (error) {
              console.error('Dosya işleme hatası:', error);
              Alert.alert('Hata', 'Dosya işlenemedi: ' + error.message + '\n\nLütfen dosyanın formatının doğru olduğundan emin olun.');
            }
          }
        };

        input.click();
      } else {
        // Mobil için expo-document-picker kullan
        const result = await DocumentPicker.getDocumentAsync({
          type: ['text/csv', 'text/plain'],
          copyToCacheDirectory: true,
        });

        if (!result.canceled && result.assets[0]) {
          let students = [];

          // CSV/Text dosyası
          const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri, {
            encoding: FileSystem.EncodingType.UTF8,
          });

          students = parseCSVData(fileContent);

          if (students.length === 0) {
            Alert.alert('Hata', 'Dosyada geçerli öğrenci bilgisi bulunamadı.');
            return;
          }

          const updatedClasses = classes.map(cls => {
            if (cls.id === selectedClass.id) {
              // Mevcut öğrenciler + yeni yüklenen öğrenciler
              const allStudents = [...cls.students, ...students];

              // Okul numarasına göre sırala
              allStudents.sort((a, b) => {
                const aNum = parseInt(a.schoolNumber) || 0;
                const bNum = parseInt(b.schoolNumber) || 0;
                return aNum - bNum;
              });

              return {
                ...cls,
                students: allStudents,
              };
            }
            return cls;
          });

          const updatedSelectedClass = updatedClasses.find(cls => cls.id === selectedClass.id);

          setClasses(updatedClasses);
          setSelectedClass(updatedSelectedClass);
          saveData(STORAGE_KEYS.CLASSES, updatedClasses);
          Alert.alert('Başarılı', `${students.length} öğrenci eklendi!`);
        }
      }
    } catch (error) {
      console.error('Dosya seçme hatası:', error);
      Alert.alert('Hata', 'Dosya seçme hatası: ' + error.message);
    }
  };

  // Seçilen tarihin hangi haftaya ait olduğunu hesapla
  const getWeekFromDate = (selectedDate, classItem, calendarSettings) => {
    if (!classItem || !calendarSettings) return null;
    
    // selectedDate'i normalize et (Date object olarak)
    const selectedDateObj = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);
    selectedDateObj.setHours(12, 0, 0, 0); // Saat problemlerini önlemek için öğle saati
    
    // Önce classItem.currentPeriod index ile dönemi al
    let currentPeriod = null;
    if (typeof classItem.currentPeriod === 'number' && calendarSettings.periods[classItem.currentPeriod]) {
      currentPeriod = calendarSettings.periods[classItem.currentPeriod];
    } else {
      // Fallback: Seçilen tarihin hangi döneme girdiğini bul
      for (const period of calendarSettings.periods) {
        const periodStart = new Date(period.start);
        const periodEnd = new Date(period.end);
        periodStart.setHours(0, 0, 0, 0);
        periodEnd.setHours(23, 59, 59, 999);
        
        if (selectedDateObj >= periodStart && selectedDateObj <= periodEnd) {
          currentPeriod = period;
          break;
        }
      }
    }
    
    if (!currentPeriod) return null;
    
    const weeklyDates = calculateWeeklyDates(currentPeriod.start, currentPeriod.end, calendarSettings.holidays);
    
    // Seçilen tarihin hangi hafta aralığında olduğunu bul
    for (const weekData of weeklyDates) {
      const weekStart = new Date(weekData.startDate.split('.').reverse().join('-'));
      const weekEnd = new Date(weekData.endDate.split('.').reverse().join('-'));
      weekStart.setHours(0, 0, 0, 0);
      weekEnd.setHours(23, 59, 59, 999);
      
      if (selectedDateObj >= weekStart && selectedDateObj <= weekEnd) {
        return {
          week: weekData.week,
          period: currentPeriod,
          periodIndex: calendarSettings.periods.indexOf(currentPeriod)
        };
      }
    }
    
    return null;
  };

  // Haftalık verileri kaydet ve sayfayı sıfırla - idempotent versiyonu
  const saveWeeklyDataAndReset = () => {
    if (!selectedClass || !currentEditingWeek) return;
    
    const weekKey = `week_${currentEditingWeek}`;
    
    // Bu hafta zaten kaydedilmiş mi kontrol et
    const isAlreadySaved = selectedClass.students.some(student => 
      student.weeklyScores[weekKey] && student.weeklyScores[weekKey].saved
    );
    
    if (isAlreadySaved) {
      Alert.alert('Bilgi', `${currentEditingWeek}. hafta verileri zaten kaydedilmiş. Sayfayı sıfırlıyorum.`);
      // Sadece UI'yı sıfırla
      setCurrentEditingWeek(null);
      setSelectedDate(new Date());
      return;
    }
    
    Alert.alert(
      'Kaydet',
      `${currentEditingWeek}. hafta verileri kaydedilip sayfa sıfırlanacak. Emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Kaydet',
          onPress: () => {
            // Bu haftaki puanları toplama ekle ve kayıt bayrağını işaretle
            const updatedClasses = classes.map(cls => {
              if (cls.id === selectedClass.id) {
                const updatedStudents = cls.students.map(student => {
                  const weekScore = student.weeklyScores[weekKey] || {};
                  
                  // Eğer bu hafta için veriler varsa ve henüz kaydedilmemişse
                  if (Object.keys(weekScore).length > 0 && !weekScore.saved) {
                    // Bu haftanın puanlarını hesapla
                    let weeklyPlus = 0, weeklyMinus = 0, weeklyFivePlus = 0, weeklyAbsent = 0;
                    if (weekScore.plus) weeklyPlus = 1;
                    if (weekScore.minus) weeklyMinus = 1;
                    if (weekScore.fivePlus) weeklyFivePlus = (typeof weekScore.fivePlus === 'number' && weekScore.fivePlus > 0 ? weekScore.fivePlus : 1);
                    if (weekScore.absent) weeklyAbsent = 1;
                    
                    // Kayıt bayrağını ekle ve totalleri güncelle
                    const updatedWeekScore = { ...weekScore, saved: true };
                    
                    return {
                      ...student,
                      totalPlus: student.totalPlus + weeklyPlus,
                      totalMinus: student.totalMinus + weeklyMinus,
                      totalFivePlus: student.totalFivePlus + weeklyFivePlus,
                      totalAbsent: student.totalAbsent + weeklyAbsent,
                      weeklyScores: {
                        ...student.weeklyScores,
                        [weekKey]: updatedWeekScore
                      }
                    };
                  }
                  
                  return student;
                });
                
                return {
                  ...cls,
                  students: updatedStudents,
                };
              }
              return cls;
            });
            
            setClasses(updatedClasses);
            setSelectedClass(updatedClasses.find(cls => cls.id === selectedClass.id));
            saveData(STORAGE_KEYS.CLASSES, updatedClasses);
            
            // UI'yı temizle ve sıfırla
            setHasUnsavedChanges(false);
            setCurrentEditingWeek(null);
            setSelectedDate(new Date());
            
            Alert.alert('Başarılı', `${currentEditingWeek}. hafta verileri kaydedildi ve sayfa sıfırlandı!`);
          }
        }
      ]
    );
  };

  const updateStudentScore = (classId, studentId, scoreType, week) => {
    const updatedClasses = classes.map(cls => {
      if (cls.id === classId) {
        return {
          ...cls,
          students: cls.students.map(student => {
            if (student.id === studentId) {
              const weekKey = `week_${week}`;
              const currentWeekScore = student.weeklyScores[weekKey] || {};

              // Devamsızlık kontrolü - sadece devamsızlık diğer puanlarla çakışamaz
              if (scoreType === 'absent') {
                if (currentWeekScore.plus || currentWeekScore.minus || (currentWeekScore.fivePlus && currentWeekScore.fivePlus > 0)) {
                  Alert.alert('Hata', 'Öğrenci devamsız ise başka puan alamaz!');
                  return student;
                }
              } else if (scoreType === 'plus' || scoreType === 'minus' || scoreType === 'fivePlus') {
                if (currentWeekScore.absent) {
                  Alert.alert('Hata', 'Devamsız öğrenciye puan verilemez!');
                  return student;
                }
              }

              // + ve - aynı anda verilemez kontrolü
              if (currentWeekScore.minus && scoreType === 'plus') {
                Alert.alert('Hata', 'Aynı hafta hem + hem - verilemez!');
                return student;
              }
              if (currentWeekScore.plus && scoreType === 'minus') {
                Alert.alert('Hata', 'Aynı hafta hem + hem - verilemez!');
                return student;
              }

              // Aynı puan türü tekrar verme kontrolü (C butonu hariç)
              if (scoreType !== 'fivePlus' && currentWeekScore[scoreType]) {
                Alert.alert('Hata', 'Bu puan bu hafta zaten verildi!');
                return student;
              }

              let newWeekScore;
              if (scoreType === 'fivePlus') {
                // 5+ için sayısal değer tut
                const currentFivePlusCount = currentWeekScore.fivePlus || 0;
                newWeekScore = { ...currentWeekScore, fivePlus: currentFivePlusCount + 1 };
              } else {
                newWeekScore = { ...currentWeekScore, [scoreType]: true };
              }

              const newWeeklyScores = { ...student.weeklyScores, [weekKey]: newWeekScore };

              // Toplam puanları hesapla
              let totalPlus = 0, totalMinus = 0, totalFivePlus = 0, totalAbsent = 0;
              Object.values(newWeeklyScores).forEach(weekScore => {
                if (weekScore.plus) totalPlus++;
                if (weekScore.minus) totalMinus++;
                if (weekScore.fivePlus) totalFivePlus += (typeof weekScore.fivePlus === 'number' && weekScore.fivePlus > 0 ? weekScore.fivePlus : 1);
                if (weekScore.absent) totalAbsent++;
              });

              return {
                ...student,
                weeklyScores: newWeeklyScores,
                totalPlus,
                totalMinus,
                totalFivePlus,
                totalAbsent,
              };
            }
            return student;
          }),
        };
      }
      return cls;
    });

    setClasses(updatedClasses);
    setSelectedClass(updatedClasses.find(cls => cls.id === classId));
    saveData(STORAGE_KEYS.CLASSES, updatedClasses);
  };

  const calculateFinalScore = (student) => {
    let score = 100;
    // Her 1 eksi için 5 puan düş
    score -= student.totalMinus * 5;
    // Her 1 tane 5+ için 5 puan ekle (maksimum 100)
    const bonusPoints = student.totalFivePlus * 5;
    score = Math.min(100, score + bonusPoints);
    return Math.max(0, score);
  };

  const generateWordReport = async () => {
    if (!pdfSettings.schoolName || !pdfSettings.className || !pdfSettings.period || !pdfSettings.gradeNumber) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun!');
      return;
    }

    const selectedClassData = classes.find(cls => cls.name === pdfSettings.className);
    if (!selectedClassData) {
      Alert.alert('Hata', 'Sınıf bulunamadı!');
      return;
    }

    // Haftalık tarihleri hesapla
    const currentPeriod = calendarSettings.periods.find(p => p.name === pdfSettings.period && p.name.startsWith(pdfSettings.period.split(' ')[0])) || calendarSettings.periods[0];
    const weeklyDates = calculateWeeklyDates(currentPeriod.start, currentPeriod.end, calendarSettings.holidays);

    const wordData = {
      id: Date.now().toString() + '_' + selectedClassData.id, // Sınıf ID'sini kullanarak benzersizleştir
      schoolName: pdfSettings.schoolName,
      className: pdfSettings.className,
      period: pdfSettings.period,
      gradeNumber: pdfSettings.gradeNumber,
      year: calendarSettings.year,
      students: selectedClassData.students.map(student => ({
        schoolNumber: student.schoolNumber,
        name: student.name,
        finalScore: calculateFinalScore(student),
        totalPlus: student.totalPlus,
        totalMinus: student.totalMinus,
        totalFivePlus: student.totalFivePlus,
        totalAbsent: student.totalAbsent,
        weeklyScores: student.weeklyScores,
      })),
      createdDate: new Date().toLocaleDateString('tr-TR'),
    };

    try {
      const htmlContent = await generateWordDocument(wordData, weeklyDates);
      const fileName = `${pdfSettings.schoolName}_${pdfSettings.className}_${pdfSettings.period}.doc`;

      if (Platform.OS === 'web') {
        downloadWordFile(htmlContent, fileName);
      } else {
        const fileUri = FileSystem.documentDirectory + fileName;
        await FileSystem.writeAsStringAsync(fileUri, htmlContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/msword',
            dialogTitle: 'Öğrenci Raporu Paylaş'
          });
        }
      }

      // Arşivlenmemiş bir sınıf için yeni rapor oluşturuluyorsa, mevcut arşive ekle
      // Eğer sınıf zaten arşivlenmişse ve tekrar rapor oluşturuluyorsa, bu yeni rapor arşivlenmez
      const isClassAlreadyArchived = classes.find(cls => cls.id === selectedClassData.id)?.periodArchived;

      if (!isClassAlreadyArchived) {
        const updatedArchive = [...archive, wordData];
        setArchive(updatedArchive);
        await saveData(STORAGE_KEYS.ARCHIVE, updatedArchive);
      }


      setShowPDFModal(false);
      setPdfSettings({ schoolName: '', className: '', period: '', gradeNumber: '' });
      setExpandedSections({ school: false, class: false, period: false, grade: false });
      Alert.alert('Başarılı', 'Word raporu oluşturuldu!');
    } catch (error) {
      Alert.alert('Hata', 'Rapor oluşturulamadı: ' + error.message);
    }
  };

  const saveCalendarSettings = () => {
    saveData(STORAGE_KEYS.CALENDAR_SETTINGS, calendarSettings);
    setShowCalendarModal(false);
    Alert.alert('Başarılı', 'Akademik takvim kaydedildi!');
  };

  const getButtonStyle = (student, scoreType, week) => {
    const weekKey = `week_${week}`;
    const currentWeekScore = student.weeklyScores[weekKey] || {};

    let baseStyle = [styles.scoreButtonLarge];
    let disabled = false;

    // Buton türüne göre renk ekle
    if (scoreType === 'plus') {
      baseStyle.push(styles.plusButton);
    } else if (scoreType === 'minus') {
      baseStyle.push(styles.minusButton);
    } else if (scoreType === 'fivePlus') {
      baseStyle.push(styles.fivePlusButton);
    } else if (scoreType === 'absent') {
      baseStyle.push(styles.absentButton);
    }

    // Tatil modu kontrolü
    if (isHolidayMode) {
      disabled = true;
    }

    // Devamsızlık ile çakışma kontrolü
    if (scoreType === 'absent') {
      if (currentWeekScore.plus || currentWeekScore.minus || (currentWeekScore.fivePlus && currentWeekScore.fivePlus > 0)) {
        disabled = true;
      }
    } else if (scoreType === 'plus' || scoreType === 'minus' || scoreType === 'fivePlus') {
      if (currentWeekScore.absent) {
        disabled = true;
      }
    }

    // + ve - aynı anda verilemez kontrolü
    if (scoreType === 'plus' && currentWeekScore.minus) {
      disabled = true;
    }
    if (scoreType === 'minus' && currentWeekScore.plus) {
      disabled = true;
    }

    // Disabled durumunu son olarak uygula (sadece opacity değiştir)
    if (disabled) {
      baseStyle.push(styles.disabledButtonLarge);
    } else if (scoreType === 'fivePlus') {
      // C butonu için özel kontrol - eğer puan verilmişse basılmış görünüm
      if (currentWeekScore.fivePlus && currentWeekScore.fivePlus > 0) {
        baseStyle.push(styles.pressedButton);
      }
    } else {
      // Diğer butonlar için normal kontrol
      if (currentWeekScore[scoreType]) {
        baseStyle.push(styles.pressedButton);
      }
    }

    return baseStyle;
  };




  // Sınıf detay sayfası header - hem okul hem sınıf adı
  const renderClassHeader = () => (
    <View style={styles.classHeaderContainer}>
      <Text style={styles.classHeaderSchoolName}>{selectedSchool?.name}</Text>
      <Text style={styles.classHeaderClassName}>{selectedClass?.name}</Text>
    </View>
  );


  const renderHomeScreen = () => (
    <SafeAreaView style={styles.container}>
      {/* Başlık Bölümü - Mor Çerçeveli */}
      <View style={styles.titleFrame}>
        <Text style={styles.titleFirstLine}>ÖĞRENCİ</Text>
        <Text style={styles.titleSecondLine}>TAKİP SİSTEMİ</Text>
        <View style={styles.titleButtons}>
          <TouchableOpacity
            style={styles.titleButton}
            onPress={() => setShowSettingsModal(true)}
          >
            <Text style={styles.titleButtonText}>⚙️ Ayarlar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.titleButton}
            onPress={() => setShowArchiveModal(true)}
          >
            <Text style={styles.titleButtonText}>📁 Arşiv</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Okul Ekle Bölümü - Mor Çerçeveli */}
      <View style={styles.schoolSectionFrame}>
        <Text style={styles.sectionTitle}>Okul Ekle</Text>
        <View style={styles.schoolInputRow}>
          <TextInput
            style={styles.schoolInput}
            value={newSchoolName}
            onChangeText={(text) => setNewSchoolName(toUpperCaseTurkish(text))}
            placeholder="Okul adını giriniz"
            placeholderTextColor="#666"
            autoCapitalize="characters"
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={addSchool}
          >
            <Text style={styles.buttonText}>Ekle</Text>
          </TouchableOpacity>
        </View>

        {/* Eklenen Okullar Listesi - Çerçeve İçinde */}
        {schools.length > 0 && (
          <View style={styles.schoolsInsideFrame}>
            <Text style={styles.schoolsListTitle}>Ekli Okullar:</Text>
            {schools.map((item) => (
              <View key={item.id} style={styles.schoolItemInFrame}>
                <TouchableOpacity
                  style={styles.schoolCardInFrame}
                  onPress={() => {
                    setSelectedSchool(item);
                    setCurrentScreen('school');
                  }}
                >
                  <Text style={styles.schoolNameInFrame}>{item.name}</Text>
                  <Text style={styles.classCountInFrame}>
                    {classes.filter(cls => cls.schoolId === item.id).length} sınıf
                  </Text>
                </TouchableOpacity>
                <View style={styles.schoolActionButtonsInFrame}>
                  <TouchableOpacity
                    style={styles.editSchoolButtonInFrame}
                    onPress={() => {
                      setEditingSchool(item);
                      setEditSchoolName(item.name);
                      setShowEditSchoolModal(true);
                    }}
                  >
                    <Text style={styles.editButtonText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteSchoolButtonInFrame}
                    onPress={() => deleteSchool(item.id)}
                  >
                    <Text style={styles.deleteButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Ayarlar Modal */}
      <Modal visible={showSettingsModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ayarlar</Text>

            <TouchableOpacity
              style={styles.settingButton}
              onPress={() => {
                setShowSettingsModal(false);
                setShowCalendarModal(true);
              }}
            >
              <Text style={styles.buttonText}>📅 Akademik Takvim Oluştur</Text>
            </TouchableOpacity>

            <Text style={styles.settingLabel}>Mevcut Eğitim Yılı:</Text>
            <Text style={styles.settingValue}>{calendarSettings.year}</Text>

            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setShowSettingsModal(false)}
            >
              <Text style={styles.buttonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Arşiv Modal */}
      <Modal visible={showArchiveModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Word Arşivi</Text>

            <FlatList
              data={archive}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.archiveItem}>
                  <Text style={styles.archiveTitle}>
                    {item.schoolName} - {item.className}
                  </Text>
                  <Text style={styles.archiveSubtitle}>{item.period}</Text>
                  <Text style={styles.archiveDate}>Tarih: {item.createdDate}</Text>
                  <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={async () => {
                      try {
                        const currentPeriod = calendarSettings.periods.find(p => p.name === item.period && p.name.startsWith(item.period.split(' ')[0])) || calendarSettings.periods[0];
                        const weeklyDates = calculateWeeklyDates(currentPeriod.start, currentPeriod.end, calendarSettings.holidays);
                        const htmlContent = await generateWordDocument(item, weeklyDates);
                        const fileName = `${item.schoolName}_${item.className}_${item.period}.doc`;

                        if (Platform.OS === 'web') {
                          downloadWordFile(htmlContent, fileName);
                        } else {
                          const fileUri = FileSystem.documentDirectory + fileName;
                          await FileSystem.writeAsStringAsync(fileUri, htmlContent, {
                            encoding: FileSystem.EncodingType.UTF8,
                          });

                          if (await Sharing.isAvailableAsync()) {
                            await Sharing.shareAsync(fileUri, {
                              mimeType: 'application/msword',
                              dialogTitle: 'Arşiv Raporu Paylaş'
                            });
                          }
                        }
                      } catch (error) {
                        Alert.alert('Hata', 'Dosya indirilemedi: ' + error.message);
                      }
                    }}
                  >
                    <Text style={styles.buttonText}>📄 İndir</Text>
                  </TouchableOpacity>
                </View>
              )}
            />

            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setShowArchiveModal(false)}
            >
              <Text style={styles.buttonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Okul Düzenleme Modal */}
      <Modal visible={showEditSchoolModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Okul Adını Düzenle</Text>
            <TextInput
              style={styles.textInput}
              value={editSchoolName}
              onChangeText={(text) => setEditSchoolName(toUpperCaseTurkish(text))}
              placeholder="Okul adını giriniz"
              placeholderTextColor="#666"
              autoCapitalize="characters"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setShowEditSchoolModal(false);
                  setEditingSchool(null);
                  setEditSchoolName('');
                }}
              >
                <Text style={styles.buttonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={saveEditedSchool}
              >
                <Text style={styles.buttonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Akademik Takvim Modal */}
      <Modal visible={showCalendarModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>Akademik Takvim Ayarları</Text>

            <Text style={styles.settingLabel}>Eğitim Yılı:</Text>
            <TextInput
              style={styles.textInput}
              value={calendarSettings.year}
              onChangeText={(text) => setCalendarSettings({...calendarSettings, year: text})}
              placeholder="2025-2026"
              placeholderTextColor="#666"
            />

            <Text style={styles.sectionTitle}>Dönemler:</Text>
            {calendarSettings.periods.map((period, index) => (
              <View key={index} style={styles.periodItem}>
                <Text style={styles.periodName}>{period.name}</Text>

                <Text style={styles.settingLabel}>Başlangıç Tarihi:</Text>
                <DatePicker
                  date={period.start}
                  onDateChange={(date) => {
                    const updatedPeriods = [...calendarSettings.periods];
                    updatedPeriods[index] = { ...period, start: date };
                    setCalendarSettings({...calendarSettings, periods: updatedPeriods});
                  }}
                  placeholder="Başlangıç tarihi seçin"
                />

                <Text style={styles.settingLabel}>Bitiş Tarihi:</Text>
                <DatePicker
                  date={period.end}
                  onDateChange={(date) => {
                    const updatedPeriods = [...calendarSettings.periods];
                    updatedPeriods[index] = {
                      ...period,
                      end: date,
                      pdfDate: date // Bitiş tarihi otomatik olarak PDF tarihi olacak
                    };
                    setCalendarSettings({...calendarSettings, periods: updatedPeriods});
                  }}
                  placeholder="Bitiş tarihi seçin"
                />

                <Text style={styles.settingLabel}>Hafta Sayısı:</Text>
                <TextInput
                  style={styles.textInput}
                  value={period.weeks.toString()}
                  onChangeText={(text) => {
                    const weeks = parseInt(text) || 0;
                    const updatedPeriods = [...calendarSettings.periods];
                    updatedPeriods[index] = { ...period, weeks: weeks };
                    setCalendarSettings({...calendarSettings, periods: updatedPeriods});
                  }}
                  placeholder="Hafta sayısı"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />

                <Text style={styles.settingValue}>
                  PDF Arşivleme Tarihi: {period.pdfDate ? (() => {
                    const d = new Date(period.pdfDate);
                    const day = String(d.getDate()).padStart(2, '0');
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const year = d.getFullYear();
                    return `${day}/${month}/${year}`;
                  })() : 'Tarih seçilmedi'}
                </Text>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Tatil Dönemleri:</Text>
            {calendarSettings.holidays.map((holiday, index) => (
              <View key={index} style={styles.periodItem}>
                <Text style={styles.periodName}>{holiday.name}</Text>

                <Text style={styles.settingLabel}>Başlangıç Tarihi:</Text>
                <DatePicker
                  date={holiday.start}
                  onDateChange={(date) => {
                    const updatedHolidays = [...calendarSettings.holidays];
                    updatedHolidays[index] = { ...holiday, start: date };
                    setCalendarSettings({...calendarSettings, holidays: updatedHolidays});
                  }}
                  placeholder="Tatil başlangıç tarihi"
                />

                <Text style={styles.settingLabel}>Bitiş Tarihi:</Text>
                <DatePicker
                  date={holiday.end}
                  onDateChange={(date) => {
                    const updatedHolidays = [...calendarSettings.holidays];
                    updatedHolidays[index] = { ...holiday, end: date };
                    setCalendarSettings({...calendarSettings, holidays: updatedHolidays});
                  }}
                  placeholder="Tatil bitiş tarihi"
                />

                <Text style={styles.holidayInfo}>
                  Tatil süresince: Sadece arşiv, öğrenci ekleme ve raporlama aktif olacak
                </Text>
              </View>
            ))}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowCalendarModal(false)}
              >
                <Text style={styles.buttonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={saveCalendarSettings}
              >
                <Text style={styles.buttonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );

  const renderSchoolScreen = () => {
    if (!selectedSchool) return null;

    const schoolClasses = classes.filter(cls => cls.schoolId === selectedSchool.id).sort((a, b) => {
      // Sınıf adından sayı ve harf kısmını ayır
      const parseClassName = (name) => {
        const match = name.match(/^(\d+)\/([A-Z])$/);
        if (match) {
          return { grade: parseInt(match[1]), section: match[2] };
        }
        // Eğer standart format değilse alfabetik olarak sırala
        return { grade: 999, section: name };
      };

      const classA = parseClassName(a.name);
      const classB = parseClassName(b.name);

      // Önce sınıf numarasına göre sırala
      if (classA.grade !== classB.grade) {
        return classA.grade - classB.grade;
      }

      // Sonra şube harfine göre sırala
      return classA.section.localeCompare(classB.section);
    });

    return (
      <SafeAreaView style={styles.container}>
        {/* Okul Başlık Bölümü - Lila Çerçeveli */}
        <View style={styles.schoolTitleFrame}>
          <TouchableOpacity
            style={styles.schoolBackButton}
            onPress={() => setCurrentScreen('home')}
          >
            <Text style={styles.buttonText}>← Geri</Text>
          </TouchableOpacity>
          <Text style={styles.schoolTitleText}>{selectedSchool.name}</Text>
        </View>

        {/* Sınıf Ekleme Bölümü - Lila Çerçeveli */}
        <View style={styles.classeSectionFrame}>
          <Text style={styles.sectionTitle}>Sınıf Ekle</Text>
          <TouchableOpacity
            style={styles.addClassButtonInFrame}
            onPress={() => setShowAddClassModal(true)}
          >
            <Text style={styles.buttonText}>➕ Sınıf Ekle</Text>
          </TouchableOpacity>

          {/* Eklenen Sınıflar Listesi - Çerçeve İçinde */}
          {schoolClasses.length > 0 && (
            <View style={styles.classesInsideFrame}>
              <Text style={styles.classesListTitle}>Eklenen Sınıflar:</Text>
              {schoolClasses.map((classItem) => (
                <View key={classItem.id} style={styles.classItemInFrame}>
                  <TouchableOpacity
                    style={styles.classCardInFrame}
                    onPress={() => {
                      setSelectedClass(classItem);
                      setCurrentScreen('class');
                    }}
                  >
                    <Text style={styles.classNameInFrame}>{classItem.name}</Text>
                    <Text style={styles.studentCountInFrame}>
                      {classItem.students.length} öğrenci
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.classActionButtonsInFrame}>
                    <TouchableOpacity
                      style={styles.editClassButtonInFrame}
                      onPress={() => {
                        editClass(classItem);
                      }}
                    >
                      <Text style={styles.editButtonText}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteClassButtonInFrame}
                      onPress={() => removeClass(classItem.id)}
                    >
                      <Text style={styles.deleteButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Sınıf Düzenleme Modal */}
        <Modal visible={showEditClassModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Sınıf Adını Düzenle</Text>
              <TextInput
                style={styles.textInput}
                value={editClassName}
                onChangeText={(text) => setEditClassName(toUpperCaseTurkish(text))}
                placeholder="Sınıf adı giriniz"
                placeholderTextColor="#666"
                autoCapitalize="characters"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setShowEditClassModal(false);
                    setEditingClass(null);
                    setEditClassName('');
                  }}
                >
                  <Text style={styles.buttonText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={saveEditedClass}
                >
                  <Text style={styles.buttonText}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Sınıf Ekleme Modal */}
        <Modal visible={showAddClassModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Yeni Sınıf Ekle</Text>
              <TextInput
                style={styles.textInput}
                value={newClassName}
                onChangeText={(text) => setNewClassName(toUpperCaseTurkish(text))}
                placeholder="Sınıf adı giriniz"
                placeholderTextColor="#666"
                autoCapitalize="characters"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setShowAddClassModal(false);
                    setNewClassName('');
                  }}
                >
                  <Text style={styles.buttonText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={addClass}
                >
                  <Text style={styles.buttonText}>Ekle</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  };

  const renderClassScreen = () => {
    if (!selectedClass) return null;

    const currentPeriodForClass = calendarSettings.periods.find(p => p.name === selectedClass.currentPeriodName) || calendarSettings.periods[0];

    return (
      <SafeAreaView style={styles.container}>
        {/* Sınıf Başlık Bölümü - Lila Çerçeveli */}
        <View style={styles.classTitleFrame}>
          <TouchableOpacity
            style={styles.classBackButton}
            onPress={() => setCurrentScreen('school')}
          >
            <Text style={styles.buttonText}>← Geri</Text>
          </TouchableOpacity>
          <View style={styles.classTitleContainer}>
            <Text style={styles.classTitleSchoolName}>{selectedSchool?.name}</Text>
            <Text style={styles.classTitleClassName}>{selectedClass?.name}</Text>
          </View>
        </View>

        {isHolidayMode && (
          <View style={styles.holidayBanner}>
            <Text style={styles.holidayBannerText}>
              🏖️ TATİL DÖNEMİ - Puanlama sistemi pasif
            </Text>
            <Text style={styles.holidayBannerSubtext}>
              Sadece arşiv, öğrenci ekleme ve raporlama aktif
            </Text>
          </View>
        )}

        {/* Öğrenci Kontrolleri - Lila Çerçeveli */}
        <View style={styles.studentControlsFrame}>
          <View style={styles.headerWithIcons}>
            <Text style={styles.sectionTitle}>Öğrenci İşlemleri</Text>
            <View style={styles.headerIcons}>
              <DatePicker 
                date={selectedDate}
                onDateChange={(newDate) => {
                  if (hasUnsavedChanges) {
                    Alert.alert(
                      'Kaydedilmemiş Değişiklikler',
                      'Yeni tarih seçmeden önce mevcut değişiklikleri kaydetmek ister misiniz?',
                      [
                        { text: 'Kaydetme', onPress: () => {
                          setHasUnsavedChanges(false);
                          setCurrentEditingWeek(null);
                          const dateObj = newDate instanceof Date ? newDate : new Date(newDate);
                          setSelectedDate(dateObj);
                          const weekData = getWeekFromDate(dateObj, selectedClass, calendarSettings);
                          if (weekData && weekData.week) {
                            setCurrentEditingWeek(weekData.week);
                          }
                        }},
                        { text: 'Kaydet', onPress: () => {
                          saveWeeklyDataAndReset();
                          const dateObj = newDate instanceof Date ? newDate : new Date(newDate);
                          setSelectedDate(dateObj);
                          const weekData = getWeekFromDate(dateObj, selectedClass, calendarSettings);
                          if (weekData && weekData.week) {
                            setCurrentEditingWeek(weekData.week);
                          }
                        }}
                      ]
                    );
                  } else {
                    const dateObj = newDate instanceof Date ? newDate : new Date(newDate);
                    setSelectedDate(dateObj);
                    const weekData = getWeekFromDate(dateObj, selectedClass, calendarSettings);
                    if (weekData && weekData.week) {
                      setCurrentEditingWeek(weekData.week);
                    } else {
                      Alert.alert('Uyarı', 'Seçilen tarih okul döneminin dışında kalan bir tarihtir.');
                      setCurrentEditingWeek(null);
                    }
                  }
                }}
                placeholder="📅"
              />
              <TouchableOpacity
                style={styles.headerIconButton}
                onPress={saveWeeklyDataAndReset}
              >
                <Text style={styles.headerIcon}>💾</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.classControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={pickDocument}
            >
              <Text style={styles.controlButtonText}>📁 Dosya</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setShowAddStudentModal(true)}
            >
              <Text style={styles.controlButtonText}>👤 Öğrenci</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setShowTotalsModal(true)}
            >
              <Text style={styles.controlButtonText}>📊 Toplam</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => {
                setPdfSettings({
                  ...pdfSettings,
                  schoolName: schools.find(s => s.id === selectedSchool.id)?.name || '',
                  className: selectedClass.name,
                  period: currentPeriodForClass.name
                });
                setShowPDFModal(true);
              }}
            >
              <Text style={styles.controlButtonText}>📄 Rapor</Text>
            </TouchableOpacity>
          </View>
        </View>


        {/* Hafta Bilgisi Başlığı */}
        {currentEditingWeek ? (
          <View style={styles.weekHeaderInfo}>
            <Text style={styles.weekHeaderText}>
              📅 {currentEditingWeek}. HAFTA DÜZENLENİYOR
            </Text>
            <Text style={styles.weekHeaderSubText}>
              {selectedDate.toLocaleDateString('tr-TR')} tarihine ait veriler
            </Text>
          </View>
        ) : (
          <Text style={styles.sectionTitleCentered}>ÖĞRENCİLER</Text>
        )}

        {/* Öğrenci Listesi - Çerçevesiz */}
        <View style={styles.studentListNoFrame}>
          {selectedClass.students.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Henüz öğrenci eklenmedi</Text>
              <Text style={styles.emptyStateSubtext}>Excel yükle veya manuel öğrenci ekle butonlarını kullanın</Text>
            </View>
          ) : (
            <FlatList
              data={selectedClass.students}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.studentListContainer}
              renderItem={({ item }) => {
              // Seçili hafta varsa onu kullan, yoksa mevcut haftayı kullan
              const displayWeek = currentEditingWeek || selectedClass.currentWeek;
              const weekKey = `week_${displayWeek}`;
              const currentWeekScore = item.weeklyScores[weekKey] || {};

              // Bu hafta için puan sayılarını hesapla
              let weeklyPlus = 0, weeklyMinus = 0, weeklyFivePlus = 0, weeklyAbsent = 0;
              if (currentWeekScore.plus) weeklyPlus = 1;
              if (currentWeekScore.minus) weeklyMinus = 1;
              if (currentWeekScore.fivePlus) weeklyFivePlus = (typeof currentWeekScore.fivePlus === 'number' && currentWeekScore.fivePlus > 0 ? currentWeekScore.fivePlus : 1);
              if (currentWeekScore.absent) weeklyAbsent = 1;

              return (
                <View style={styles.studentRowLarge}>
                  <TouchableOpacity
                    style={styles.deleteStudentButtonSmall}
                    onPress={() => removeStudent(item.id)}
                  >
                    <Text style={styles.deleteButtonTextSmall}>🗑️</Text>
                  </TouchableOpacity>

                  <View style={styles.studentInfoLarge}>
                    <Text style={styles.studentNumberLarge}>{item.schoolNumber}</Text>
                    <Text style={styles.studentNameLarge}>{item.name}</Text>
                  </View>

                  <View style={styles.scoreCountDisplayLarge}>
                    <Text style={styles.scoreCountTextLarge}>
                      {(() => {
                        const weekKey = `week_${displayWeek}`;
                        const weekScore = item.weeklyScores[weekKey] || {};
                        const symbols = [];
                        if (weekScore.plus) symbols.push('+');
                        if (weekScore.minus) symbols.push('-');
                        if (weekScore.fivePlus) {
                          const count = typeof weekScore.fivePlus === 'number' ? weekScore.fivePlus : 1;
                          symbols.push(count > 1 ? `++(${count})` : '++');
                        }
                        if (weekScore.absent) symbols.push('G');
                        return symbols.length > 0 ? symbols.join(' ') : '-';
                      })()}
                    </Text>
                  </View>

                  <View style={styles.scoreButtonsLarge}>
                    <View style={styles.buttonWithCount}>
                      <TouchableOpacity
                        style={getButtonStyle(item, 'plus', displayWeek)}
                        onPress={() => updateStudentScore(selectedClass.id, item.id, 'plus', displayWeek)}
                        disabled={getButtonStyle(item, 'plus', displayWeek).includes(styles.disabledButtonLarge)}
                      >
                        <Text style={styles.scoreButtonLargeText}>+</Text>
                      </TouchableOpacity>
                      <View style={styles.countBadge}>
                        <Text style={styles.countBadgeText}>{weeklyPlus}</Text>
                      </View>
                    </View>

                    <View style={styles.buttonWithCount}>
                      <TouchableOpacity
                        style={getButtonStyle(item, 'minus', displayWeek)}
                        onPress={() => updateStudentScore(selectedClass.id, item.id, 'minus', displayWeek)}
                        disabled={getButtonStyle(item, 'minus', displayWeek).includes(styles.disabledButtonLarge)}
                      >
                        <Text style={styles.scoreButtonLargeText}>-</Text>
                      </TouchableOpacity>
                      <View style={styles.countBadge}>
                        <Text style={styles.countBadgeText}>{weeklyMinus}</Text>
                      </View>
                    </View>

                    <View style={styles.buttonWithCount}>
                      <TouchableOpacity
                        style={getButtonStyle(item, 'fivePlus', displayWeek)}
                        onPress={() => updateStudentScore(selectedClass.id, item.id, 'fivePlus', displayWeek)}
                        disabled={getButtonStyle(item, 'fivePlus', displayWeek).includes(styles.disabledButtonLarge)}
                      >
                        <Text style={styles.scoreButtonLargeText}>C</Text>
                      </TouchableOpacity>
                      <View style={styles.countBadge}>
                        <Text style={styles.countBadgeText}>{weeklyFivePlus}</Text>
                      </View>
                    </View>

                    <View style={styles.buttonWithCount}>
                      <TouchableOpacity
                        style={getButtonStyle(item, 'absent', displayWeek)}
                        onPress={() => updateStudentScore(selectedClass.id, item.id, 'absent', displayWeek)}
                        disabled={getButtonStyle(item, 'absent', displayWeek).includes(styles.disabledButtonLarge)}
                      >
                        <Text style={styles.scoreButtonLargeText}>G</Text>
                      </TouchableOpacity>
                      <View style={styles.countBadge}>
                        <Text style={styles.countBadgeText}>{weeklyAbsent}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            }}
            />
          )}
        </View>

        {/* Modals */}
        <Modal visible={showAddStudentModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Öğrenci Ekle</Text>
              <TextInput
                style={styles.textInput}
                value={newStudentNumber}
                onChangeText={(text) => setNewStudentNumber(toUpperCaseTurkish(text))}
                placeholder="Okul numarası giriniz"
                placeholderTextColor="#666"
                autoCapitalize="characters"
              />
              <TextInput
                style={styles.textInput}
                value={newStudentName}
                onChangeText={(text) => setNewStudentName(toUpperCaseTurkish(text))}
                placeholder="Ad soyad giriniz"
                placeholderTextColor="#666"
                autoCapitalize="characters"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setShowAddStudentModal(false);
                    setNewStudentNumber('');
                    setNewStudentName('');
                  }}
                >
                  <Text style={styles.buttonText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={addStudentManually}
                >
                  <Text style={styles.buttonText}>Ekle</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={showTotalsModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Öğrenci Toplamları</Text>
              <FlatList
                data={selectedClass.students}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.totalItem}>
                    <View style={styles.totalRowContent}>
                      <Text style={styles.totalStudentName}>{item.name}</Text>
                      <View style={styles.totalScores}>
                        {item.totalPlus > 0 && (
                          <View style={[styles.totalScoreItem, styles.totalPlusItem]}>
                            <Text style={styles.totalScoreText}>+{item.totalPlus}</Text>
                          </View>
                        )}
                        {item.totalMinus > 0 && (
                          <View style={[styles.totalScoreItem, styles.totalMinusItem]}>
                            <Text style={styles.totalScoreText}>-{item.totalMinus}</Text>
                          </View>
                        )}
                        {item.totalFivePlus > 0 && (
                          <View style={[styles.totalScoreItem, styles.totalFivePlusItem]}>
                            <Text style={styles.totalScoreText}>C{item.totalFivePlus}</Text>
                          </View>
                        )}
                        {item.totalAbsent > 0 && (
                          <View style={[styles.totalScoreItem, styles.totalAbsentItem]}>
                            <Text style={styles.totalScoreText}>G{item.totalAbsent}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.totalFinalScore}>NOT: {calculateFinalScore(item)}</Text>
                    </View>
                  </View>
                )}
              />
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowTotalsModal(false)}
              >
                <Text style={styles.buttonText}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={showPDFModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.scrollableModalContent}>
              <Text style={styles.modalTitle}>Rapor Oluştur</Text>

              <ScrollView style={styles.pdfModalScrollView} showsVerticalScrollIndicator={true}>
                <View style={styles.pdfSectionsContainer}>
                  {/* Okul Seçimi */}
                  <View style={styles.collapsibleSection}>
                    <TouchableOpacity
                      style={styles.sectionHeader}
                      onPress={() => {
                        setExpandedSections({
                          ...expandedSections,
                          school: !expandedSections.school,
                          class: false, // Okul seçimi değiştiğinde sınıf bölümünü kapat
                          period: false,
                          grade: false
                        });
                      }}
                    >
                      <Text style={styles.sectionHeaderText}>📚 Okul Adı</Text>
                      <Text style={styles.selectedValueText}>
                        {pdfSettings.schoolName || 'OK tuşuna basın'}
                      </Text>
                      <Text style={[styles.expandIcon, { transform: [{ rotate: expandedSections.school ? '180deg' : '0deg' }] }]}>▼</Text>
                    </TouchableOpacity>
                    {expandedSections.school && (
                      <View style={styles.sectionContent}>
                        <View style={styles.gridContainer}>
                          {schools.map((school) => (
                            <TouchableOpacity
                              key={school.id}
                              style={[
                                styles.gridItem,
                                pdfSettings.schoolName === school.name && styles.selectedGridItem
                              ]}
                              onPress={() => {
                                setPdfSettings({
                                  ...pdfSettings,
                                  schoolName: school.name,
                                  className: '', // Okul değiştirildiğinde sınıf seçimini temizle
                                  period: '',
                                  gradeNumber: ''
                                });
                                setExpandedSections({
                                  ...expandedSections,
                                  school: false,
                                  class: true // Okul seçildikten sonra sınıf bölümünü aç
                                });
                              }}
                            >
                              <Text style={[
                                styles.gridItemText,
                                pdfSettings.schoolName === school.name && styles.selectedGridItemText
                              ]}>
                                {school.name}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Sınıf Seçimi - Sadece okul seçildiyse göster */}
                  {pdfSettings.schoolName && (
                    <View style={styles.collapsibleSection}>
                      <TouchableOpacity
                        style={styles.sectionHeader}
                        onPress={() => {
                          setExpandedSections({
                            ...expandedSections,
                            class: !expandedSections.class,
                            period: false,
                            grade: false
                          });
                        }}
                      >
                        <Text style={styles.sectionHeaderText}>🏛️ Sınıf</Text>
                        <Text style={styles.selectedValueText}>
                          {pdfSettings.className || 'OK tuşuna basın'}
                        </Text>
                        <Text style={[styles.expandIcon, { transform: [{ rotate: expandedSections.class ? '180deg' : '0deg' }] }]}>▼</Text>
                      </TouchableOpacity>
                      {expandedSections.class && (
                        <View style={styles.sectionContent}>
                          <View style={styles.gridContainer}>
                            {classes
                              .filter(cls => {
                                const selectedSchoolObj = schools.find(s => s.name === pdfSettings.schoolName);
                                return selectedSchoolObj && cls.schoolId === selectedSchoolObj.id;
                              })
                              .map((cls) => (
                                <TouchableOpacity
                                  key={cls.id}
                                  style={[
                                    styles.gridItem,
                                    pdfSettings.className === cls.name && styles.selectedGridItem
                                  ]}
                                  onPress={() => {
                                    setPdfSettings({
                                      ...pdfSettings,
                                      className: cls.name,
                                      period: '',
                                      gradeNumber: ''
                                    });
                                    setExpandedSections({
                                      ...expandedSections,
                                      class: false,
                                      period: true // Sınıf seçildikten sonra dönem bölümünü aç
                                    });
                                  }}
                                >
                                  <Text style={[
                                    styles.gridItemText,
                                    pdfSettings.className === cls.name && styles.selectedGridItemText
                                  ]}>
                                    {cls.name}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                          </View>
                          {classes.filter(cls => {
                            const selectedSchoolObj = schools.find(s => s.name === pdfSettings.schoolName);
                            return selectedSchoolObj && cls.schoolId === selectedSchoolObj.id;
                          }).length === 0 && (
                            <Text style={styles.noDataText}>Bu okula ait sınıf bulunamadı</Text>
                          )}
                        </View>
                      )}
                    </View>
                  )}

                  {/* Dönem Seçimi - Sadece sınıf seçildiyse göster */}
                  {pdfSettings.className && (
                    <View style={styles.collapsibleSection}>
                      <TouchableOpacity
                        style={styles.sectionHeader}
                        onPress={() => {
                          setExpandedSections({
                            ...expandedSections,
                            period: !expandedSections.period,
                            grade: false
                          });
                        }}
                      >
                        <Text style={styles.sectionHeaderText}>📅 Dönem</Text>
                        <Text style={styles.selectedValueText}>
                          {pdfSettings.period || 'OK tuşuna basın'}
                        </Text>
                        <Text style={[styles.expandIcon, { transform: [{ rotate: expandedSections.period ? '180deg' : '0deg' }] }]}>▼</Text>
                      </TouchableOpacity>
                      {expandedSections.period && (
                        <View style={styles.sectionContent}>
                          <View style={styles.gridContainer}>
                            <TouchableOpacity
                              style={[
                                styles.gridItem,
                                pdfSettings.period === '1. DÖNEM' && styles.selectedGridItem
                              ]}
                              onPress={() => {
                                setPdfSettings({
                                  ...pdfSettings,
                                  period: '1. DÖNEM',
                                  gradeNumber: ''
                                });
                                setExpandedSections({
                                  ...expandedSections,
                                  period: false,
                                  grade: true // Dönem seçildikten sonra not bölümünü aç
                                });
                              }}
                            >
                              <Text style={[
                                styles.gridItemText,
                                pdfSettings.period === '1. DÖNEM' && styles.selectedGridItemText
                              ]}>
                                1. DÖNEM
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[
                                styles.gridItem,
                                pdfSettings.period === '2. DÖNEM' && styles.selectedGridItem
                              ]}
                              onPress={() => {
                                setPdfSettings({
                                  ...pdfSettings,
                                  period: '2. DÖNEM',
                                  gradeNumber: ''
                                });
                                setExpandedSections({
                                  ...expandedSections,
                                  period: false,
                                  grade: true // Dönem seçildikten sonra not bölümünü aç
                                });
                              }}
                            >
                              <Text style={[
                                styles.gridItemText,
                                pdfSettings.period === '2. DÖNEM' && styles.selectedGridItemText
                              ]}>
                                2. DÖNEM
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Not Seçimi - Sadece dönem seçildiyse göster */}
                  {pdfSettings.period && (
                    <View style={styles.collapsibleSection}>
                      <TouchableOpacity
                        style={styles.sectionHeader}
                        onPress={() => {
                          setExpandedSections({
                            ...expandedSections,
                            grade: !expandedSections.grade
                          });
                        }}
                      >
                        <Text style={styles.sectionHeaderText}>📝 Kaçıncı Not</Text>
                        <Text style={styles.selectedValueText}>
                          {pdfSettings.gradeNumber || 'OK tuşuna basın'}
                        </Text>
                        <Text style={[styles.expandIcon, { transform: [{ rotate: expandedSections.grade ? '180deg' : '0deg' }] }]}>▼</Text>
                      </TouchableOpacity>
                      {expandedSections.grade && (
                        <View style={styles.sectionContent}>
                          <View style={styles.gridContainer}>
                            <TouchableOpacity
                              style={[
                                styles.gridItem,
                                pdfSettings.gradeNumber === '1. DERS ETKİNLİK NOTU' && styles.selectedGridItem
                              ]}
                              onPress={() => {
                                setPdfSettings({...pdfSettings, gradeNumber: '1. DERS ETKİNLİK NOTU'});
                                setExpandedSections({
                                  ...expandedSections,
                                  grade: false // Not seçildikten sonra kapat
                                });
                              }}
                            >
                              <Text style={[
                                styles.gridItemText,
                                pdfSettings.gradeNumber === '1. DERS ETKİNLİK NOTU' && styles.selectedGridItemText
                              ]}>
                                1. DERS ETKİNLİK NOTU
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[
                                styles.gridItem,
                                pdfSettings.gradeNumber === '2. DERS ETKİNLİK NOTU' && styles.selectedGridItem
                              ]}
                              onPress={() => {
                                setPdfSettings({...pdfSettings, gradeNumber: '2. DERS ETKİNLİK NOTU'});
                                setExpandedSections({
                                  ...expandedSections,
                                  grade: false // Not seçildikten sonra kapat
                                });
                              }}
                            >
                              <Text style={[
                                styles.gridItemText,
                                pdfSettings.gradeNumber === '2. DERS ETKİNLİK NOTU' && styles.selectedGridItemText
                              ]}>
                                2. DERS ETKİNLİK NOTU
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </ScrollView>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setShowPDFModal(false);
                    setPdfSettings({ schoolName: '', className: '', period: '', gradeNumber: '' });
                    setExpandedSections({ school: false, class: false, period: false, grade: false });
                  }}
                >
                  <Text style={styles.buttonText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={generateWordReport}
                >
                  <Text style={styles.buttonText}>Word/PDF Oluştur</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* DatePicker component kendi modalını yönetiyor, ayrı modal gereksiz */}
      </SafeAreaView>
    );
  };

  if (currentScreen === 'home') return renderHomeScreen();
  if (currentScreen === 'school') return renderSchoolScreen();
  return renderClassScreen();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: 20,
    paddingHorizontal: 15,
    paddingBottom: 40, // Alt boşluğu artırarak telefon butonlarından kaçınma
  },
  header: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  titleFrame: {
    backgroundColor: '#2A1A3A',
    borderWidth: 2,
    borderColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
    marginTop: 28, // 1 cm aşağı kaydırma (yaklaşık)
    marginHorizontal: 15,
    elevation: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  schoolSectionFrame: {
    backgroundColor: '#2A1A3A',
    borderWidth: 2,
    borderColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 15,
    margin: 15,
    elevation: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  schoolsInsideFrame: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#8B5CF6',
  },
  schoolsListTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  schoolItemInFrame: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  schoolCardInFrame: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginRight: 8,
  },
  schoolNameInFrame: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  classCountInFrame: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  schoolActionButtonsInFrame: {
    flexDirection: 'row',
    gap: 8,
  },
  editSchoolButtonInFrame: {
    backgroundColor: '#FF9800',
    padding: 8,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteSchoolButtonInFrame: {
    backgroundColor: '#F44336',
    padding: 8,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  titleFirstLine: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  titleSecondLine: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 4,
  },
  titleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 12,
    gap: 10,
  },
  titleButton: {
    backgroundColor: '#333333',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  titleButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 0,
    marginTop: 10,
  },
  headerButton: {
    backgroundColor: '#333333',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    flex: 0.45,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 15,
    letterSpacing: 1,
  },
  backButton: {
    backgroundColor: '#8B5CF6',
    padding: 10,
    borderRadius: 8,
    position: 'absolute',
    left: 15,
    top: 60,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    minWidth: 80,
    alignItems: 'center',
  },
  backButtonLeft: {
    backgroundColor: '#8B5CF6',
    padding: 10,
    borderRadius: 8,
    position: 'absolute',
    left: 15,
    top: 60,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    minWidth: 80,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  schoolSection: {
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  sectionTitleCentered: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  schoolInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  schoolInput: {
    flex: 1,
    backgroundColor: '#333333',
    color: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    minWidth: 60,
  },
  schoolItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  schoolActionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  schoolCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginRight: 8,
  },
  schoolName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  classCount: {
    color: '#CCCCCC',
    fontSize: 13,
  },
  schoolContent: {
    flex: 1,
    paddingHorizontal: 5,
  },
  addClassButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  classItem: {
    flexDirection: 'row',
    backgroundColor: '#333333',
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  classActionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  classNameButton: {
    flex: 1,
    padding: 12,
  },
  classNameText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  studentCountText: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  deleteButton: {
    padding: 12,
  },
  editSchoolButton: {
    backgroundColor: '#FF9800',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editClassButton: {
    backgroundColor: '#FF9800',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
  },
  deleteSchoolButton: {
    backgroundColor: '#F44336',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 10,
    width: '95%',
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: '#333333',
    color: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  settingLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 5,
    marginTop: 10,
  },
  settingValue: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 10,
  },
  settingButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#666666',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  archiveItem: {
    backgroundColor: '#333333',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  archiveTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  archiveSubtitle: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  archiveDate: {
    color: '#CCCCCC',
    fontSize: 12,
    marginBottom: 10,
  },
  downloadButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  periodItem: {
    backgroundColor: '#333333',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  periodName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  periodDates: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 5,
  },
  pdfDate: {
    color: '#4CAF50',
    fontSize: 12,
    fontStyle: 'italic',
  },
  studentControlsFrame: {
    backgroundColor: '#2A1A3A',
    borderWidth: 2,
    borderColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 15,
    marginTop: 10,
    marginHorizontal: 15,
    elevation: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  studentListFrame: {
    backgroundColor: '#2A1A3A',
    borderWidth: 2,
    borderColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginHorizontal: 15,
    marginTop: 10,
    elevation: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    flex: 1,
  },
  studentListNoFrame: {
    flex: 1,
    marginHorizontal: 15,
    marginTop: 10,
  },
  classControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 3,
    flexWrap: 'nowrap',
  },
  controlButton: {
    backgroundColor: '#333333',
    paddingHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    minWidth: 0,
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    numberOfLines: 1,
  },
  // Tarih seçici ve kaydet butonu stilleri
  dateControlsFrame: {
    backgroundColor: '#2A1A3A',
    borderWidth: 2,
    borderColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 15,
    marginTop: 5,
    marginHorizontal: 15,
    elevation: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  dateControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 10,
    flexWrap: 'wrap',
  },
  dateButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 120,
  },
  dateButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  dateDisplayText: {
    color: '#E8F4FF',
    fontSize: 11,
    marginTop: 3,
    textAlign: 'center',
  },
  weekInfo: {
    backgroundColor: '#1B4D3E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  weekInfoText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  saveButtonUnsaved: {
    backgroundColor: '#FF3333',
    shadowColor: '#FF3333',
    elevation: 6,
    borderWidth: 2,
    borderColor: '#FFAAAA',
  },
  saveButtonNormal: {
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  weekDisplayInfo: {
    backgroundColor: '#1B4D3E',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  weekDisplayText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalSubtitle: {
    color: '#CCCCCC',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  // Hafta başlığı stilleri
  weekHeaderInfo: {
    backgroundColor: '#2A1A3A',
    borderWidth: 2,
    borderColor: '#FF6B35',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 15,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  weekHeaderText: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  weekHeaderSubText: {
    color: '#FFCAB0',
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptyStateSubtext: {
    color: '#CCCCCC',
    fontSize: 14,
    textAlign: 'center',
  },
  studentRow: {
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  studentRowSingle: {
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  studentInfo: {
    flex: 1,
  },
  studentInfoSingle: {
    flex: 2,
  },
  studentNumber: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  studentNumberSingle: {
    color: '#CCCCCC',
    fontSize: 11,
  },
  studentName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  studentNameSingle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  scoreButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  scoreButtonSmallText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  scoreButtonSmall: {
    backgroundColor: '#4CAF50',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grayButton: {
    backgroundColor: '#666666',
  },
  scoreCountDisplay: {
    flex: 1.5,
    alignItems: 'center',
  },
  scoreCountText: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: 'bold',
  },
  scoreButtonsInline: {
    flexDirection: 'row',
    flex: 1.5,
    justifyContent: 'space-around',
  },
  scoreButtonInline: {
    backgroundColor: '#4CAF50',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreButtonInlineText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  studentRowLarge: {
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 8,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 1,
  },
  studentInfoLarge: {
    flex: 1.6,
    paddingRight: 4,
  },
  studentNumberLarge: {
    color: '#CCCCCC',
    fontSize: 10,
  },
  studentNameLarge: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    flexWrap: 'wrap',
  },
  scoreCountDisplayLarge: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  scoreCountTextLarge: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scoreButtonsLarge: {
    flexDirection: 'row',
    flex: 2.8,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 3,
  },
  buttonWithCount: {
    alignItems: 'center',
    position: 'relative',
    marginHorizontal: 0.5,
  },
  scoreButtonLarge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  scoreButtonLargeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  countBadge: {
    backgroundColor: '#FFD700',
    borderRadius: 5,
    paddingHorizontal: 3,
    paddingVertical: 1,
    minWidth: 14,
    alignItems: 'center',
    position: 'absolute',
    top: -4,
    right: -2,
    zIndex: 1,
  },
  countBadgeText: {
    color: '#000000',
    fontSize: 7,
    fontWeight: 'bold',
  },
  plusButton: {
    backgroundColor: '#4CAF50',
  },
  minusButton: {
    backgroundColor: '#F44336',
  },
  fivePlusButton: {
    backgroundColor: '#FF9800',
  },
  absentButton: {
    backgroundColor: '#2196F3',
  },
  activeButton: {
    backgroundColor: '#2196F3',
  },
  pressedButton: {
    backgroundColor: '#1976D2',
    opacity: 0.8,
  },
  disabledButtonLarge: {
    opacity: 0.3,
  },
  overallTotal: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  finalScore: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalItem: {
    backgroundColor: '#333333',
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
  totalRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalStudentName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    flex: 2,
  },
  totalScores: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 2,
    justifyContent: 'center',
  },
  totalScoreItem: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  totalScoreText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  totalPlusItem: {
    backgroundColor: '#4CAF50',
  },
  totalMinusItem: {
    backgroundColor: '#F44336',
  },
  totalFivePlusItem: {
    backgroundColor: '#FF9800',
  },
  totalAbsentItem: {
    backgroundColor: '#2196F3',
  },
  totalFinalScore: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  pdfLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 10,
    marginTop: 5,
  },
  pickerContainer: {
    marginBottom: 15,
  },
  pickerItem: {
    backgroundColor: '#333333',
    padding: 10,
    borderRadius: 6,
    marginBottom: 5,
  },
  selectedPickerItem: {
    backgroundColor: '#4CAF50',
  },
  pickerText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  scrollablePickerContainer: {
    maxHeight: 120,
    backgroundColor: '#222222',
    borderRadius: 8,
    marginBottom: 15,
  },
  scrollableModalContent: {
    backgroundColor: '#1A1A1A',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '90%',
  },
  pdfModalScrollView: {
    maxHeight: 500,
  },
  pdfSectionsContainer: {
    paddingBottom: 10,
  },
  collapsibleSection: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    backgroundColor: '#333333',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#555555',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  selectedValueText: {
    color: '#4CAF50',
    fontSize: 13,
  },
  sectionContent: {
    padding: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridItem: {
    backgroundColor: '#444444',
    padding: 12,
    borderRadius: 6,
    minWidth: '22%',
    maxWidth: '48%',
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#555555',
  },
  selectedGridItem: {
    backgroundColor: '#4CAF50',
    borderColor: '#66BB6A',
  },
  gridItemText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedGridItemText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  expandIcon: {
    color: '#CCCCCC',
    fontSize: 14,
    position: 'absolute',
    right: 15,
    top: '50%',
    marginTop: -7,
  },
  noDataText: {
    color: '#CCCCCC',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  datePickerButton: {
    backgroundColor: '#333333',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  datePickerText: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
  },
  calendarIcon: {
    fontSize: 16,
  },
  datePickerModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContent: {
    backgroundColor: '#1A1A1A',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  datePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  calendar: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 15,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  calendarTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  calendarNavButton: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
    padding: 10,
  },
  calendarDayNames: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  calendarDayName: {
    color: '#CCCCCC',
    fontSize: 12,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    paddingVertical: 5,
  },
  calendarDays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    marginBottom: 2,
  },
  selectedCalendarDay: {
    backgroundColor: '#4CAF50',
  },
  emptyCalendarDay: {
    backgroundColor: 'transparent',
  },
  calendarDayText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  selectedCalendarDayText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  calendarGrid: {
    marginBottom: 20,
  },
  holidayBanner: {
    backgroundColor: '#FF9800',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  holidayBannerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  holidayBannerSubtext: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  holidayInfo: {
    color: '#FF9800',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  deleteStudentButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  deleteStudentButtonSmall: {
    backgroundColor: '#F44336',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  deleteButtonTextSmall: {
    fontSize: 9,
  },
  studentListContainer: {
    paddingBottom: 80,
    flexGrow: 1,
  },
  // Okul sayfası stilleri
  schoolTitleFrame: {
    backgroundColor: '#2A1A3A',
    borderWidth: 2,
    borderColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
    marginTop: 28, // 1 cm aşağı kaydırma (yaklaşık)
    marginHorizontal: 15,
    elevation: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  schoolBackButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 15,
  },
  schoolTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginRight: 80, // Geri butonunun genişliği kadar sağdan boşluk bırak
  },
  classeSectionFrame: {
    backgroundColor: '#2A1A3A',
    borderWidth: 2,
    borderColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 15,
    margin: 15,
    elevation: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  addClassButtonInFrame: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  classesInsideFrame: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#8B5CF6',
  },
  classesListTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  classItemInFrame: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  classCardInFrame: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginRight: 8,
  },
  classNameInFrame: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  studentCountInFrame: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  classActionButtonsInFrame: {
    flexDirection: 'row',
    gap: 8,
  },
  editClassButtonInFrame: {
    backgroundColor: '#FF9800',
    padding: 8,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteClassButtonInFrame: {
    backgroundColor: '#F44336',
    padding: 8,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Sınıf detay sayfası stilleri
  classTitleFrame: {
    backgroundColor: '#2A1A3A',
    borderWidth: 2,
    borderColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 15,
    marginTop: 60,
    marginHorizontal: 15,
    elevation: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  classBackButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 15,
  },
  classTitleContainer: {
    flex: 1,
    alignItems: 'center',
    marginRight: 80,
  },
  classTitleSchoolName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  classTitleClassName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 2,
  },
  classHeaderContainer: {
    backgroundColor: '#000000',
    padding: 20,
    paddingTop: 50,
    paddingBottom: 25,
    alignItems: 'center',
    minHeight: 100,
  },
  classHeaderSchoolName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
  },
  classHeaderClassName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 2,
  },
  headerWithIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconButton: {
    padding: 5,
  },
  headerIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});