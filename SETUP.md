# Local File Manager - Setup Guide

Selamat datang di Local File Manager! Aplikasi ini memungkinkan Anda untuk mengelola file dengan sistem organisasi otomatis yang elegan dan efisien.

## 🚀 Quick Start

### 1. Akses Aplikasi

Buka browser Anda dan navigasikan ke URL yang disediakan oleh Manus. Aplikasi akan menampilkan landing page dengan opsi untuk sign in.

### 2. Login

Klik tombol "Get Started Free" atau "Sign In" untuk login menggunakan Manus OAuth. Setelah login berhasil, Anda akan diarahkan ke dashboard.

### 3. Upload File Pertama

Di dashboard, Anda dapat:
- **Drag and drop** file ke area upload
- **Klik tombol "Select Files"** untuk memilih file dari komputer

Sistem akan otomatis:
- Mendeteksi tipe file (dokumen, foto, video, audio, arsip, aplikasi, ISO, atau lainnya)
- Membuat folder struktur: `storage/Category/Year/Month/`
- Menyimpan file dengan nama asli
- Mencatat metadata di database

### 4. Kelola File

**Dashboard Features:**
- **File Table**: Lihat semua file dengan informasi lengkap (nama, kategori, ukuran, tanggal upload, lokasi)
- **File Browser**: Navigasi file berdasarkan kategori, tahun, dan bulan
- **Search**: Cari file berdasarkan nama
- **Filter**: Filter file berdasarkan kategori, tahun, atau bulan
- **Download**: Unduh file dengan satu klik
- **Delete**: Hapus file dengan konfirmasi

## 📁 Struktur Folder Otomatis

Setiap file yang diupload akan disimpan dalam struktur folder yang terorganisir:

```
storage/
├── Dokumen/
│   └── 2026/
│       └── 07 - Juli/
│           └── Proposal.docx
├── Foto/
│   └── 2026/
│       └── 07 - Juli/
│           └── Wisuda.jpg
├── Video/
│   └── 2026/
│       └── 07 - Juli/
│           └── Recording.mp4
└── ...
```

## 🏷️ Kategori File Otomatis

File secara otomatis dikategorikan berdasarkan extension:

| Kategori | Extensions | Emoji |
|----------|-----------|-------|
| Dokumen | pdf, doc, docx, xls, xlsx, ppt, pptx, txt, odt, ods, odp | 📄 |
| Foto | jpg, jpeg, png, gif, webp, bmp, svg, ico, tiff | 🖼 |
| Video | mp4, mov, mkv, avi, flv, wmv, webm, m4v, mpg, mpeg | 🎥 |
| Audio | mp3, wav, flac, aac, ogg, m4a, wma, aiff | 🎵 |
| Arsip | zip, rar, 7z, tar, gz, bz2, xz | 📦 |
| Aplikasi | exe, msi, apk, dmg, deb, rpm, app | 💻 |
| ISO | iso | 💿 |
| Lainnya | file type lainnya | 📁 |

## 🔍 Fitur Pencarian dan Filter

### Search
Cari file berdasarkan nama file. Pencarian real-time akan menampilkan hasil yang cocok.

### Filter
- **By Category**: Filter file berdasarkan kategori (Dokumen, Foto, Video, dll)
- **By Year**: Filter file berdasarkan tahun upload
- **By Month**: Filter file berdasarkan bulan upload
- **Date Range**: Filter file berdasarkan rentang tanggal (coming soon)

Anda dapat menggabungkan multiple filters untuk hasil yang lebih spesifik.

## 📊 Dashboard Statistics

Di header dashboard, Anda dapat melihat:
- **Total Files**: Jumlah total file yang telah diupload
- **Total Storage**: Total ukuran storage yang digunakan (dalam GB)

## ⚙️ Fitur Teknis

### Upload Process
1. Client mengirim request ke server untuk mendapatkan presigned URL
2. Server menentukan kategori file dan lokasi penyimpanan
3. Client upload file langsung ke S3 menggunakan presigned URL
4. Client mengirim request ke server untuk register file di database
5. Server menyimpan metadata file di database

### File Metadata
Setiap file menyimpan metadata berikut:
- Filename (nama asli)
- MIME Type
- File Size (dalam bytes)
- Category (auto-detected)
- Storage Path (lokasi di S3)
- Upload Year & Month
- Upload Timestamp

### Security
- Setiap user hanya dapat melihat dan mengelola file mereka sendiri
- File disimpan di S3 dengan enkripsi
- Semua operasi memerlukan authentication

## 🎨 Design & UX

Aplikasi dirancang dengan prinsip:
- **Elegant & Polished**: Interface yang refined dan sophisticated
- **Responsive**: Bekerja sempurna di desktop, tablet, dan mobile
- **Fast**: Optimized untuk performa maksimal
- **Intuitive**: User experience yang natural dan mudah dipahami

## 🐛 Troubleshooting

### Upload Gagal
- Pastikan koneksi internet stabil
- Cek ukuran file (tidak ada limit khusus)
- Refresh halaman dan coba lagi

### File Tidak Muncul
- Refresh halaman
- Cek filter yang aktif
- Pastikan file sudah selesai diupload (lihat progress indicator)

### Performa Lambat
- Refresh halaman
- Cek koneksi internet
- Coba filter file untuk mengurangi jumlah yang ditampilkan

## 📝 Tips & Tricks

1. **Bulk Upload**: Anda dapat upload multiple file sekaligus dengan drag-drop atau select multiple
2. **Organize Quickly**: Gunakan file browser sidebar untuk navigasi cepat ke folder tertentu
3. **Search Smart**: Gunakan search untuk menemukan file dengan cepat
4. **Monitor Storage**: Lihat statistics di header untuk monitor penggunaan storage

## 🔐 Privacy & Security

- Semua file Anda aman dan hanya dapat diakses oleh Anda
- File disimpan di cloud storage yang aman
- Tidak ada backup atau sharing file tanpa izin Anda
- Anda dapat menghapus file kapan saja

## 📞 Support

Jika Anda mengalami masalah atau memiliki pertanyaan, silakan hubungi support melalui Manus platform.

---

**Selamat menggunakan Local File Manager! 🎉**
