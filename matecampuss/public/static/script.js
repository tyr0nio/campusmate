// CampusMate - JavaScript: tampilan, interaksi, dan timer
const HARI = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]; // array
let data = null;            // semua data dari Flask
let hariDipilih = null;     // string: hari pada tab jadwal

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const tulis = (id, html, kosong) => { $(id).innerHTML = html || `<p class="kosong">${kosong}</p>`; };

// ---------- data disimpan di browser (localStorage) ----------
function tanggalHariIni(offset = 0) {
  const d = new Date(); d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const namaHari = () => ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][new Date().getDay()];

function dataAwal() {   // data contoh agar dashboard tidak kosong
  return {
    jadwal: [
      { id: 1, hari: namaHari(), mulai: "08:00", selesai: "09:40", matkul: "Algoritma dan Pemrograman", ruang: "Ruang kelas A" },
      { id: 2, hari: namaHari(), mulai: "10:00", selesai: "11:40", matkul: "Matematika Teknik", ruang: "Ruang kelas B" },
      { id: 3, hari: "Senin", mulai: "13:00", selesai: "14:40", matkul: "Elektronika Dasar", ruang: "Lab 2" },
    ],
    tugas: [
      { id: 1, nama: "Laporan praktikum", matkul: "Elektronika Dasar", deadline: tanggalHariIni(2), prioritas: "Tinggi", selesai: false },
      { id: 2, nama: "Tugas coding", matkul: "Algoritma dan Pemrograman", deadline: tanggalHariIni(4), prioritas: "Sedang", selesai: false },
      { id: 3, nama: "Latihan soal", matkul: "Matematika Teknik", deadline: tanggalHariIni(6), prioritas: "Rendah", selesai: false },
      { id: 4, nama: "Kuis Python", matkul: "Algoritma dan Pemrograman", deadline: tanggalHariIni(-1), prioritas: "Sedang", selesai: false },
      { id: 5, nama: "Baca modul 3", matkul: "Matematika Teknik", deadline: tanggalHariIni(), prioritas: "Rendah", selesai: true },
    ],
    belajar: [
      { id: 1, mulai: "15:00", selesai: "15:45", matkul: "Algoritma dan Pemrograman", materi: "Belajar Python", selesai_flag: false },
      { id: 2, mulai: "16:00", selesai: "16:30", matkul: "Matematika Teknik", materi: "Review materi", selesai_flag: false },
    ],
    sesi: [],
  };
}

let state;   // data mentah (disimpan)
try { state = JSON.parse(localStorage.getItem("campusmate")) || dataAwal(); } catch (e) { state = dataAwal(); }
const simpan = () => { try { localStorage.setItem("campusmate", JSON.stringify(state)); } catch (e) {} };

function buatId(daftar) {    // looping: cari id terbesar lalu tambah 1
  let terbesar = 0;
  for (const item of daftar) if (item.id > terbesar) terbesar = item.id;
  return terbesar + 1;
}

function tambahItem(koleksi, isi) {
  const item = { ...isi, id: buatId(state[koleksi]) };
  if (koleksi === "tugas") item.selesai = false;
  if (koleksi === "belajar") item.selesai_flag = false;
  state[koleksi].push(item); simpan(); muat();
}

// kirim data ke Flask untuk dihitung (status tugas, progres, ringkasan)
async function muat() {
  const res = await fetch("/api/ringkasan", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...state, hari_ini: namaHari(), tanggal: tanggalHariIni() }),
  });
  data = { ...state, ...(await res.json()) };
  if (!hariDipilih) hariDipilih = HARI.includes(data.ringkasan.hari_ini) ? data.ringkasan.hari_ini : "Senin";
  render();
}

// ---------- fungsi tampilan ----------
function barisJadwal(j, dengan_hapus) {
  return `<div class="baris"><span class="jam">${j.mulai}–${j.selesai}</span>
    <div class="isi"><b>${esc(j.matkul)}</b><small>${esc(j.ruang || "-")}</small></div>
    ${dengan_hapus ? `<button class="hapus" onclick="hapus('jadwal',${j.id})">Hapus</button>` : ""}</div>`;
}

function renderJadwal() {
  const r = data.ringkasan;
  let hariIni = "", pilihan = "";
  for (const j of data.jadwal) {                       // looping + if
    if (j.hari === r.hari_ini) hariIni += barisJadwal(j, false);
  }
  tulis("d-jadwal", hariIni, "Tidak ada kuliah hari ini.");

  for (const h of HARI) {
    pilihan += `<button class="${h === hariDipilih ? "aktif" : ""}" onclick="pilihHari('${h}')">${h}</button>`;
  }
  $("pilih-hari").innerHTML = pilihan;
  let list = "";
  for (const j of data.jadwal) {
    if (j.hari === hariDipilih) list += barisJadwal(j, true);
  }
  tulis("list-jadwal", list, `Belum ada jadwal di hari ${hariDipilih}.`);
}

function renderTugas() {
  const r = data.ringkasan;
  let list = "", dekat = "";
  for (const t of data.tugas) {
    list += `<div class="baris ${t.selesai ? "selesai-teks" : ""}">
      <input type="checkbox" ${t.selesai ? "checked" : ""} onchange="toggle('tugas',${t.id})">
      <div class="isi"><b>${esc(t.nama)}</b><small>${esc(t.matkul)} · ${t.deadline} · Prioritas ${t.prioritas}</small></div>
      <span class="label ${t.status}">${t.status}</span>
      <button class="hapus" onclick="hapus('tugas',${t.id})">Hapus</button></div>`;
  }
  for (const t of data.terdekat) {
    dekat += `<div class="baris"><div class="isi"><b>${esc(t.nama)}</b><small>${esc(t.matkul)} · ${t.deadline}</small></div>
      <span class="label ${t.status}">${t.status}</span></div>`;
  }
  tulis("list-tugas", list, "Belum ada tugas. Tambahkan lewat form di bawah.");
  tulis("d-deadline", dekat, "Semua tugas sudah selesai 🎉");
  $("bar").style.width = r.progres + "%";
  $("teks-progres").textContent = `${r.selesai} dari ${r.total_tugas} tugas selesai (${r.progres}%)`;
}

function renderBelajar() {
  let list = "", selesai = 0;
  for (const b of data.belajar) {
    if (b.selesai_flag) selesai++;
    list += `<div class="baris ${b.selesai_flag ? "selesai-teks" : ""}"><span class="jam">${b.mulai}–${b.selesai}</span>
      <input type="checkbox" ${b.selesai_flag ? "checked" : ""} onchange="toggle('belajar',${b.id})">
      <div class="isi"><b>${esc(b.materi)}</b><small>${esc(b.matkul)}</small></div>
      <button class="hapus" onclick="hapus('belajar',${b.id})">Hapus</button></div>`;
  }
  tulis("list-belajar", list, "Belum ada rencana belajar.");
  $("teks-belajar").textContent = `${selesai} dari ${data.belajar.length} rencana belajar selesai`;
}

function renderSesi() {
  const m = data.ringkasan.menit_belajar;
  let list = "";
  for (const s of data.sesi.slice().reverse()) {
    list += `<div class="baris"><div class="isi">${s.menit} menit belajar<small>${s.tanggal}</small></div></div>`;
  }
  tulis("list-sesi", list, "Belum ada sesi selesai.");
  $("total-hari").textContent = `Total belajar hari ini: ${m} menit`;
  $("r-waktu").textContent = m >= 60 ? `${Math.floor(m / 60)}j ${m % 60}m` : `${m}m`;
}

function render() {
  const r = data.ringkasan;
  $("subjudul").textContent = `Student dashboard · ${r.hari_ini}, ${r.tanggal}`;
  $("r-matkul").textContent = r.matkul_hari_ini;
  $("r-belum").textContent = r.tugas_belum;
  $("r-progres").textContent = r.progres + "%";
  renderJadwal(); renderTugas(); renderBelajar(); renderSesi();
}

// ---------- aksi ----------
function pilihHari(h) { hariDipilih = h; renderJadwal(); }
function hapus(koleksi, id) { state[koleksi] = state[koleksi].filter((i) => i.id !== id); simpan(); muat(); }
function toggle(koleksi, id) {
  const kunci = koleksi === "tugas" ? "selesai" : "selesai_flag";
  for (const i of state[koleksi]) if (i.id === id) i[kunci] = !i[kunci];
  simpan(); muat();
}

function pasangForm(idForm, koleksi) {
  $(idForm).addEventListener("submit", async (e) => {
    e.preventDefault();
    const isi = Object.fromEntries(new FormData(e.target));   // object
    e.target.reset();
    tambahItem(koleksi, isi);
  });
}
pasangForm("form-jadwal", "jadwal");
pasangForm("form-tugas", "tugas");
pasangForm("form-belajar", "belajar");

let opsi = "";
for (const h of HARI) opsi += `<option>${h}</option>`;
$("hari-form").innerHTML = opsi;

for (const tombol of document.querySelectorAll("#menu button")) {
  tombol.addEventListener("click", () => {
    for (const t of document.querySelectorAll("#menu button")) t.classList.remove("aktif");
    for (const p of document.querySelectorAll(".panel")) p.classList.remove("tampil");
    tombol.classList.add("aktif");
    $(tombol.dataset.menu).classList.add("tampil");
  });
}

// ---------- timer pomodoro ----------
let mode = "belajar", sisaDetik = 25 * 60, interval = null;     // string, integer, null

const durasi = (id) => Math.max(1, parseInt($(id).value) || 1) * 60;
function tampilTimer() {
  const m = String(Math.floor(sisaDetik / 60)).padStart(2, "0");
  const d = String(sisaDetik % 60).padStart(2, "0");
  $("layar").textContent = `${m}:${d}`;
  $("mode-timer").textContent = mode === "belajar" ? "Sesi belajar" : "Waktunya istirahat";
}
function mulaiTimer() {
  if (interval) return;
  interval = setInterval(() => {
    sisaDetik--;
    if (sisaDetik <= 0) selesaiSesi();
    tampilTimer();
  }, 1000);
}
function jedaTimer() { clearInterval(interval); interval = null; }
function resetTimer() {
  jedaTimer(); mode = "belajar"; sisaDetik = durasi("in-belajar"); tampilTimer();
}
async function selesaiSesi() {
  if (mode === "belajar") {                                   // if-else: simpan hanya sesi belajar
    tambahItem("sesi", { menit: Math.round(durasi("in-belajar") / 60), tanggal: tanggalHariIni() });
    mode = "istirahat"; sisaDetik = durasi("in-istirahat");
  } else {
    mode = "belajar"; sisaDetik = durasi("in-belajar");
  }
}
$("btn-mulai").onclick = mulaiTimer;
$("btn-jeda").onclick = jedaTimer;
$("btn-reset").onclick = resetTimer;
$("in-belajar").onchange = () => { if (!interval && mode === "belajar") resetTimer(); };

tampilTimer();
muat();
