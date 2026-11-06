-- Migration: Sinkronisasi 57 Data Anak Pos PAUD Dewi Sartika Debong Kulon
-- Masalah Sebelumnya: 
-- Data anak dari spreadsheet Master Data Anak 0-6 Tahun sebelumnya sempat tersinkronisasi 
-- dengan status ATS ("ATS - Anak Tidak Sekolah") dan terduplikasi 3 kali tanpa terhubung ke komunitas PAUD.
-- 
-- Solusi:
-- 1. Mengalihkan 57 anak ke Pos PAUD Dewi Sartika Debong Kulon (komunitas_id: 850f80e4-b8a5-43d1-823e-09b921c9605b)
-- 2. Mengatur is_sekolah = true dan status_approval = 'approved'
-- 3. Membersihkan 122 rekaman duplikat berlebih

UPDATE public.data_anak
SET 
  nama_sekolah = 'Pos PAUD Dewi Sartika Debong Kulon',
  komunitas_id = '850f80e4-b8a5-43d1-823e-09b921c9605b',
  is_sekolah = true,
  status_approval = 'approved',
  alasan_sekolah = '[DOM_KEL:Debong Kulon][DOM_KEC:Tegal Selatan][DOM_RW:Belum Tahu][DOM_RT:Belum Tahu][KK_KEL:Debong Kulon][KK_KEC:Tegal Selatan][KK_RW:Belum Tahu][KK_RT:Belum Tahu][ALASAN:Sudah Usia PAUD]'
WHERE 
  nama_lengkap IN (
    'ADHINATA GIVANO',
    'ADHYASTA PUTRA SEPTIAN',
    'AHMAD MAULANA MUZAQI',
    'AISYAH NUR RAHMADHANIA',
    'AKHMAD DZAKY RAYA PRATAMA',
    'ALESHA SHAHREEFA',
    'ALIA AZZAHRA SHAKEELA',
    'ALNA SYAFANIA AZZAHRA',
    'ALVARO VIANDRA PRAMBUDI',
    'ALVINO DAFA MUWAFFAQ',
    'ANANDA VITO ALZAENI',
    'ANDYRA NAIFA FADILLAH',
    'ARDILLA PARAMITHA',
    'ARKHANA SAPUTRA',
    'AYUNDHA MALIKHA FAUZI',
    'BINTANG PUTRA RAMADAN',
    'CHAYRA YUUKI ZULAIBAH',
    'CITRANI NAURAH LAKSMI',
    'DHEFIN EL FATIH',
    'DINDA DWI SYAHIRA',
    'DWI FAUZIYAH',
    'EL GHAFI FAHREZA',
    'ELVANO VIRENDRA SYAHREVI',
    'FATHAN DANINDRA',
    'FATHIYA AULIA NISA',
    'GAVIN ALBINA SANDRIA',
    'GIBRAN ATHARRAZKA',
    'HANIF AQIL HAFIZHAN',
    'ILHAM JAUHARI AZMI',
    'KAHIYANG ASMA ANINDITA',
    'LINTANG DWI MAULIDA',
    'MIFTAHURRAHMAN ASH-SOFI',
    'MOCHAMAD HAYKAL AZRIL',
    'MUHAMAD FATHAN',
    'MUHAMMAD AMSYAR ALFATEH',
    'MUHAMMAD FATIH HAKIM',
    'MUHAMMAD ZULFIKAR AL FATIH',
    'MUKHAMAD FAJAR DUMAIRI',
    'NAJWA MAULIDINA',
    'NANDA KHAERUL FIRMANSYAH',
    'NAUFAL ASFA ATHALLAH',
    'NAVYA PRIGEL ALESHA',
    'NUR AERIN AZ ZAHRA',
    'PUTRI ANNASYAH',
    'PUTRI AYNA FARZANA',
    'RAYYAN RAMADHAN ZAFIR',
    'RIFFKA PERMATA PUTRI',
    'RIFKI FAHREZI MAULANA',
    'SAFINATUN NAJAH',
    'SYAHDANIA MADINATUSSHANUM',
    'SYARIFAH NUR MAULIDA',
    'UWAIS AL QARNI',
    'UWAIS YOUCAN ARRIZKI',
    'WAHYUAJI',
    'YELSE SUCI ANTIKA',
    'ZANITHA NAFISA DWI RAMADANI',
    'ZHAFRAN ATTAYA'
  );

