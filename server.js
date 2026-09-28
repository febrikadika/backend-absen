const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const fileDataAbsen = path.join(__dirname, "absensi.json");

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

const databaseKaryawan = [
  { id: "B1D212045", nama: "Ardika" },
  { id: "B1D321123", nama: "Padlahudin" },
  { id: "B1D543345", nama: "Ita Dwi Cahyani" },
  { id: "B1D654456", nama: "Wiwin Susanti" },
  { id: "B1D765567", nama: "Riana Kamila Dewi" },
  { id: "B1D876678", nama: "Fitriani" },
];

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

  // Mengambil waktu lokal dengan zona waktu Asia/Jakarta (WIB) agar akurat di server cloud
  const sekarang = new Date();

  const opsiJam = {
    timeZone: "Asia/Jakarta",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  };
  const formatterWaktu = new Intl.DateTimeFormat("en-GB", opsiJam);
  const partsWaktu = formatterWaktu.formatToParts(sekarang);

  let jamWIB = 0;
  let menitWIB = 0;
  partsWaktu.forEach((part) => {
    if (part.type === "hour")
      jamWIB = parseInt(part.type === "hour" ? part.value : 0); // Diperbaiki di bawah agar aman
  });

  // Cara aman ambil angka jam & menit WIB
  const jamStr = formatterWaktu.format(sekarang); // format "HH:MM:SS"
  const [jamPart, menitPart] = jamStr.split(":");
  const jamNum = parseInt(jamPart, 10);
  const menitNum = parseInt(menitPart, 10);

  const waktuAbsenDecimal = jamNum + menitNum / 60;

  // Hari dan Tanggal dalam format Indonesia
  const opsiTanggal = {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long",
  };
  const formatterTanggal = new Intl.DateTimeFormat("id-ID", opsiTanggal);
  const partsTgl = formatterTanggal.formatToParts(sekarang);

  let hari = "",
    tanggal = "";
  partsTgl.forEach((part) => {
    if (part.type === "weekday") hari = part.value;
    if (part.type === "day") tanggal = part.value + "-" + tanggal; // disusun
  });
  // Format simpel tanggal YYYY-MM-DD versi WIB
  const formatTanggalWIB = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
  }).format(sekarang);

  let statusKehadiran = "";
  let statusKirimFrontend = "";

  if (waktuAbsenDecimal <= 7.0) {
    statusKehadiran = "anda hadir tepat waktu";
    statusKirimFrontend = `Halo ${karyawanDitemukan.nama} (${karyawanDitemukan.id}), Anda hadir tepat waktu!`;
  } else if (waktuAbsenDecimal > 7.0 && waktuAbsenDecimal <= 8.0) {
    statusKehadiran = "anda terlambat sedang";
    statusKirimFrontend = `Halo ${karyawanDitemukan.nama} (${karyawanDitemukan.id}), Anda terlambat sedang.`;
  } else {
    statusKehadiran = "anda terlambat sangat berat";
    statusKirimFrontend = `Halo ${karyawanDitemukan.nama} (${karyawanDitemukan.id}), Anda terlambat sangat berat!`;
  }

  const dataBaru = {
    idKaryawan: karyawanDitemukan.id,
    nama: karyawanDitemukan.nama,
    tanggal: formatTanggalWIB,
    hari: hari,
    jam: jamStr,
    keterangan: statusKehadiran,
  };

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
    pesan: statusKirimFrontend,
    waktuServer: `${jamStr} (${hari}, ${formatTanggalWIB})`,
  });
});

app.get("/api/riwayat", (req, res) => {
  const riwayat = bacaDataAbsen();
  res.status(200).json(riwayat);
});

app.listen(PORT, () => {
  console.log(`Server absensi berjalan di port ${PORT}`);
});
