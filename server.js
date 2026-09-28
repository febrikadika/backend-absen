const express = require("express");
const cors = require("cors");

const app = express();

// Gunakan port dari Railway, atau fallback ke 3000 jika dijalankan secara lokal
const PORT = process.env.PORT || 3000;

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

  const karyawanDitemukan = databaseKaryawan.find(
    (karyawan) =>
      karyawan.nama.toLowerCase() === namaInput.trim().toLowerCase(),
  );

  if (!karyawanDitemukan) {
    return res.status(404).json({
      status: "gagal",
      pesan: "Nama anda belum terdaftar",
    });
  }

  const sekarang = new Date();
  const jam = sekarang.getHours();
  const menit = sekarang.getMinutes();
  const waktuAbsen = jam + menit / 60;

  let statusKehadiran = "";

  if (waktuAbsen <= 7.0) {
    statusKehadiran = `Halo ${karyawanDitemukan.nama} (${karyawanDitemukan.id}), Anda hadir tepat waktu!`;
  } else if (waktuAbsen > 7.0 && waktuAbsen <= 8.0) {
    statusKehadiran = `Halo ${karyawanDitemukan.nama} (${karyawanDitemukan.id}), Anda terlambat sedang.`;
  } else {
    statusKehadiran = `Halo ${karyawanDitemukan.nama} (${karyawanDitemukan.id}), Anda terlambat sangat berat!`;
  }

  return res.status(200).json({
    status: "sukses",
    pesan: statusKehadiran,
    waktuServer: `${jam}:${menit < 10 ? "0" : ""}${menit}`,
  });
});

// Menyalakan server menggunakan port dinamis dari Railway
app.listen(PORT, () => {
  console.log(`Server absensi berjalan di port ${PORT}`);
});
