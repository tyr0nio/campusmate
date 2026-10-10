# CampusMate - Student Academic Planner (Flask, versi Vercel)
# Catatan: data disimpan di browser (localStorage). Flask khusus menghitung logika.
from datetime import date
from flask import Flask, jsonify, request, render_template

# static_folder hanya untuk jalan di laptop; di Vercel file di public/ dilayani otomatis
app = Flask(__name__, static_folder="public/static", static_url_path="/static")


def hitung_status(tugas, tanggal):
    """If-else: tentukan status tugas dari deadline dan status selesai."""
    sisa_hari = (date.fromisoformat(tugas["deadline"]) - date.fromisoformat(tanggal)).days  # integer
    if tugas["selesai"]:                 # boolean
        return "Selesai"
    elif sisa_hari < 0:
        return "Terlambat"
    elif sisa_hari <= 2:
        return "Segera"
    else:
        return "Aman"


def hitung_progres(daftar_tugas):
    """Looping: hitung persen tugas selesai."""
    if len(daftar_tugas) == 0:
        return 0
    jumlah_selesai = 0
    for t in daftar_tugas:
        if t["selesai"]:
            jumlah_selesai += 1
    persen = jumlah_selesai / len(daftar_tugas) * 100    # float
    return int(persen)                                   # dibulatkan jadi integer


def total_waktu_belajar(daftar_sesi, tanggal):
    """Looping: jumlahkan menit belajar pada tanggal tertentu."""
    total = 0
    for s in daftar_sesi:
        if s["tanggal"] == tanggal:
            total += int(s["menit"])
    return total


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/ringkasan", methods=["POST"])
def ringkasan():
    """Terima data dari browser, hitung status dan ringkasan, kirim balik."""
    body = request.get_json()
    tanggal, hari_ini = body["tanggal"], body["hari_ini"]
    tugas = body["tugas"]
    for t in tugas:                                      # looping: tambahkan status
        t["status"] = hitung_status(t, tanggal)
    belum = [t for t in tugas if not t["selesai"]]
    return jsonify({
        "tugas": tugas,
        "terdekat": sorted(belum, key=lambda t: t["deadline"])[:3],
        "ringkasan": {
            "hari_ini": hari_ini,
            "tanggal": tanggal,
            "matkul_hari_ini": len([j for j in body["jadwal"] if j["hari"] == hari_ini]),
            "tugas_belum": len(belum),
            "progres": hitung_progres(tugas),
            "selesai": len(tugas) - len(belum),
            "total_tugas": len(tugas),
            "menit_belajar": total_waktu_belajar(body["sesi"], tanggal),
        },
    })


if __name__ == "__main__":
    app.run(debug=False)
