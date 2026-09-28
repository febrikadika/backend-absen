const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Database Karyawan di Backend
const databaseKaryawan = [
  { id: "B1D212045", nama: "Ardika" },
  { id: "B1D321123", nama: "Padlahudin" },
  { id: "B1D543345", nama: "Ita Dwi Cahyani" },
  { id: "B1D654456", nama: "Wiwin Susanti" },
  { id: "B1D765567", nama: "Riana Kamila Dewi" },
  { id: "B1D876678", nama: "Fitriani" },
];

// Endpoint untuk melakukan Absensi (POST)
app.post("/api/absen", (req, res) => {
  const { namaInput } = req.body;

  // 1. Cek apakah nama ada di database (Case-insensitive agar tidak terlalu ketat huruf besar/kecilnya)
  const karyawanDitemukan = databaseKaryawan.find(
    (karyawan) =>
      karyawan.nama.toLowerCase() === namaInput.trim().toLowerCase(),
  );

  // Jika nama tidak ditemukan di database
  if (!karyawanDitemukan) {
    return res.status(404).json({
      status: "gagal",
      pesan: "Nama anda belum terdaftar",
    });
  }

  // 2. Jika nama ditemukan, ambil jam saat ini secara otomatis di server (Format 24 Jam, misal: 7.30 atau 8.15)
  const sekarang = new Date();
  const jam = sekarang.getHours();
  const menit = sekarang.getMinutes();

  // Konversi waktu ke bentuk desimal untuk memudahkan perbandingan (contoh: 07:30 jadi 7.5)
  const waktuAbsen = jam + menit / 60;

  // Variabel untuk menampung pesan status kehadiran
  let statusKehadiran = "";

  // 3. Logika Waktu Kehadiran
  // Catatan: Jam <= 7 artinya jam 7.00 pas atau sebelumnya.
  // Jika ingin toleransi sampai 07:00:59, bisa disesuaikan, tapi kita pakai standar <= 7
  if (waktuAbsen <= 7.0) {
    statusKehadiran = `Halo ${karyawanDitemukan.nama} (${karyawanDitemukan.id}), Anda hadir tepat waktu!`;
  } else if (waktuAbsen > 7.0 && waktuAbsen <= 8.0) {
    statusKehadiran = `Halo ${karyawanDitemukan.nama} (${karyawanDitemukan.id}), Anda terlambat sedang.`;
  } else {
    statusKehadiran = `Halo ${karyawanDitemukan.nama} (${karyawanDitemukan.id}), Anda terlambat sangat berat!`;
  }

  // Kirim balasan sukses beserta pesan logikanya ke frontend
  return res.status(200).json({
    status: "sukses",
    pesan: statusKehadiran,
    waktuServer: `${jam}:${menit < 10 ? "0" : ""}${menit}`,
  });
});

// Menyalakan server
app.listen(PORT, () => {
  console.log(`Server absensi berjalan di http://localhost:${PORT}`);
});
