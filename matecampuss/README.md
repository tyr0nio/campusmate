# CampusMate 🎓

Student Academic Planner: website sederhana untuk mengatur kegiatan kuliah dan belajar dalam satu dashboard. Dibuat untuk tugas mata kuliah Algoritma dan Pemrograman.

## Fitur

- **Dashboard**: ringkasan jadwal hari ini, tugas belum selesai, persentase progres, dan total waktu belajar.
- **Jadwal Kuliah**: lihat matkul per hari (jam, ruang), tambah dan hapus jadwal.
- **Tracker Tugas**: catat tugas, matkul, deadline, dan prioritas. Status otomatis: Selesai, Terlambat, Segera, atau Aman. Ada progress bar.
- **Study Planner**: rencana belajar harian yang bisa dicentang selesai.
- **Study Timer**: timer Pomodoro (default belajar 25 menit, istirahat 5 menit) dengan riwayat sesi.

## Teknologi

- Backend: Python, Flask
- Frontend: HTML, CSS, JavaScript
- Penyimpanan data: `localStorage` di browser
- Deployment: Vercel

## Penerapan Konsep Algoritma dan Pemrograman

| Konsep | Contoh di kode |
|---|---|
| Variabel | `tanggal`, `hari_ini`, `jumlah_selesai`, `sisa_hari` |
| Tipe data | string (nama tugas), integer (menit belajar), boolean (`selesai`), float (`persen`) |
| If-else | `hitung_status()` di `app.py` menentukan Selesai, Terlambat, Segera, atau Aman |
| List/array | daftar `jadwal`, `tugas`, `belajar`, dan `sesi` |
| Function | `hitung_status()`, `hitung_progres()`, `total_waktu_belajar()` |
| Looping | `for` untuk menghitung progres, menjumlahkan waktu belajar, dan menampilkan daftar |

## Cara Kerja Singkat

Data tugas dan jadwal disimpan di browser. Setiap kali ada perubahan, browser mengirim data ke Flask (`POST /api/ringkasan`). Flask menghitung status tugas, progres, dan ringkasan, lalu mengirim hasilnya kembali untuk ditampilkan.

## Struktur Folder

```
campusmate/
├── app.py
├── requirements.txt
├── templates/
│   └── index.html
└── public/
    └── static/
        ├── style.css
        └── script.js
```

## Menjalankan di Komputer

1. Pastikan Python sudah terpasang.
2. Pasang Flask:
   ```
   pip install -r requirements.txt
   ```
3. Jalankan:
   ```
   python app.py
   ```
4. Buka `http://127.0.0.1:5000` di browser.

## Deploy ke Vercel

1. Upload isi folder proyek ke repo GitHub (`app.py` harus berada di root repo).
2. Di Vercel, pilih **Add New → Project**, lalu import repo ini.
3. Biarkan **Root Directory** kosong, lalu klik **Deploy**.

## Catatan

- Data tersimpan per browser. Jika dibuka di perangkat atau browser lain, data mulai dari awal.
- Belum ada fitur login dan edit jadwal (hanya tambah dan hapus).
