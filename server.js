const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Path untuk menyimpan file JSON riwayat absensi
const fileDataAbsen = path.join(__dirname, "absensi.json");

// Fungsi pembantu untuk membaca data absensi yang sudah ada
const bacaDataAbsen = () => {
  try {
    if (!fs.existsSync(fileDataAbsen)) {
      return [];
    }
    const data = fs.readFileSync(fileDataAbsen, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Gagal membaca file JSON:", error);
    return [];
  }
};

// Database Karyawan
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

  if (!namaInput) {
    return res
      .status(400)
      .json({ status: "gagal", pesan: "Nama tidak boleh kosong!" });
  }

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

  // Mengambil Waktu Real-Time (Tanggal, Jam, Hari)
  const sekarang = new Date();

  // Konvensi hari dalam bahasa Indonesia
  const daftarHari = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ];
  const hari = daftarHari[sekarang.getDay()];

  // Format Tanggal: YYYY-MM-DD
  const tanggal = sekarang.toISOString().split("T")[0];

  // Format Jam: HH:MM:SS
  const jam = sekarang.toTimeString().split(" ")[0];

  const waktuAbsenDecimal = sekarang.getHours() + sekarang.getMinutes() / 60;

  let statusKehadiran = "";
  if (waktuAbsenDecimal <= 7.0) {
    statusKehadiran = `Halo ${karyawanDitemukan.nama} (${karyawanDitemukan.id}), Anda hadir tepat waktu!`;
  } else if (waktuAbsenDecimal > 7.0 && waktuAbsenDecimal <= 8.0) {
    statusKehadiran = `Halo ${karyawanDitemukan.nama} (${karyawanDitemukan.id}), Anda terlambat sedang.`;
  } else {
    statusKehadiran = `Halo ${karyawanDitemukan.nama} (${karyawanDitemukan.id}), Anda terlambat sangat berat!`;
  }

  // Buat objek data riwayat baru
  const dataBaru = {
    idKaryawan: karyawanDitemukan.id,
    nama: karyawanDitemukan.nama,
    tanggal: tanggal,
    hari: hari,
    jam: jam,
    keterangan: statusKehadiran,
  };

  // Simpan ke file absensi.json secara real-time
  try {
    const semuaAbsen = bacaDataAbsen();
    semuaAbsen.push(dataBaru);
    fs.writeFileSync(
      fileDataAbsen,
      JSON.stringify(semuaAbsen, null, 2),
      "utf8",
    );
  } catch (error) {
    console.error("Gagal menyimpan ke file JSON:", error);
  }

  return res.status(200).json({
    status: "sukses",
    pesan: statusKehadiran,
    waktuServer: `${jam} (${hari}, ${tanggal})`,
  });
});

// Endpoint tambahan (Opsional): Untuk melihat daftar riwayat absensi dalam format JSON
app.get("/api/riwayat", (req, res) => {
  const riwayat = bacaDataAbsen();
  res.status(200).json(riwayat);
});

app.listen(PORT, () => {
  console.log(`Server absensi berjalan di port ${PORT}`);
});
