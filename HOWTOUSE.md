# HOWTOUSE — Mulqi ReaSLL

Panduan pemasangan dan pemakaian plugin **Mulqi ReaSLL** (`mulqi-reasll` v1.0.1)
di DeepSeek Harness **0.2.1-rc.2**.

Plugin ini tidak menambah tool, tombol, atau perintah baru. Ia mendaftarkan satu
skill ke katalog `ctx.skills`, sehingga agent bisa memuatnya saat tugasnya cocok.

---

## 1. Prasyarat

| Kebutuhan | Keterangan |
| --- | --- |
| DeepSeek Harness | `>=0.2.1-rc.2 <0.3.0` (dinyatakan di `engines.dsh`) |
| Node.js | `>=22.19.0` |
| Profil DSH | Salah satu profil, misalnya `web` |
| Izin | Menulis ke direktori profil DSH |

Tidak ada dependency runtime dan tidak ada build step. Paket ini ESM murni.

---

## 2. Instalasi

Ada dua metode yang didukung. Keduanya berakhir dengan hasil yang sama: satu
baris plugin di layer bundle profil DSH Anda.

### Metode A — dari repositori GitHub

```bash
dsh plugin --profile web add github:mulqizamzam/mulqi--reasll
```

Ganti `web` dengan nama profil yang Anda pakai. Perintah ini menambahkan
`mulqi-reasll` sebagai dependency profil dan mendaftarkannya ke
`dsh.profile.bundles` secara otomatis.

### Metode B — dari direktori lokal

```bash
git clone https://github.com/mulqizamzam/mulqi--reasll.git
cd mulqi--reasll
dsh plugin --profile web add .
```

Metode ini berguna bila Anda ingin membaca atau memodifikasi isi skill sebelum
memasangnya.

### Verifikasi

```bash
dsh --profile web --dump-config | grep -A2 "== mulqi-reasll"
```

Keluaran yang benar:

```yaml
# == mulqi-reasll
- id: mulqi-reasll
  name: mulqi-reasll
```

Terakhir, **mulai sesi DSH baru**. Skill didaftarkan saat boot, jadi sesi yang
sedang berjalan belum melihatnya.

### Mencopot

```bash
dsh plugin --profile web remove mulqi-reasll
```

---

## 3. Memakai skill

Skill ini menambah pengetahuan, bukan perintah. Ada dua pola.

### 3.1 Biarkan agent memilih

Agent melihat daftar skill beserta deskripsi singkatnya. Minta hal yang cocok,
misalnya:

> Bangun ulang alat internal yang source-nya hilang. Saya berhak
> merekonstruksinya; approver saya Budi (Engineering Manager).

Agent akan memuat skill ini bila menilai cocok.

### 3.2 Panggil eksplisit

Sebutkan namanya agar tidak bergantung pada pemilihan otomatis:

> Pakai skill `reverse-engineer-anything-self-learning-loop` untuk
> merekonstruksi parser laporan ini.

Nama skill yang terdaftar adalah
`reverse-engineer-anything-self-learning-loop` — bukan `mulqi-reasll`.
`mulqi-reasll` adalah nama paket plugin.

---

## 4. Yang harus Anda siapkan sebelum mulai

Skill ini **gated**: ia menolak berjalan tanpa otorisasi eksplisit. Siapkan
sebelum memanggilnya:

1. Produk yang Anda berhak bangun ulang.
2. Approver: nama dan peran, independen dari peminta.
3. Lingkup: apa yang masuk dan apa yang tidak.
4. Folder kerja yang bisa ditulis.
5. Lingkungan analisis terpisah (idealnya VM sekali pakai) untuk langkah live.

Bekerja sendiri? Catat diri Anda sebagai approver dan tulis alasannya. Gate-nya
ada supaya otorisasi bersifat eksplisit, bukan diasumsikan.

---

## 5. Alur kerja skill

Ringkas; detail lengkap ada di dalam skill setelah dimuat.

1. **Periksa** — `references/examine.md`. Static-first, tanpa menyalin ekspresi
   yang dilindungi.
2. **Tulis definisi 100%** — `templates/parity-checklist.md`. Checklist ini
   harus Anda setujui sebelum build dimulai.
3. **Bangun** — walking skeleton dulu, lalu isi.
4. **Review dengan bukti** — `references/review.md`.
5. **Catat celah dan rencana** — `templates/gap-report.md`,
   `templates/iteration-plan.md`.
6. **Perbaiki** — `references/fix-recipes.md`.
7. **Ulangi** sampai checklist lulus; catat tiap iterasi di
   `templates/run-ledger.md`.

---

## 6. Batas aktivasi

Ini penting dan disengaja:

- Skill dimuat sebagai **instruksi skill**, bukan system prompt. Ia tidak
  menggantikan hierarki instruksi host, dan tidak melonggarkan kontrol
  keamanan DSH.
- `SKILL.md` dan seluruh `references/`/`templates/` adalah **materi rujukan**.
  Membacanya tidak menjalankan apa pun.
- `vendor/upstream/` adalah **provenance read-only**. Tidak pernah dieksekusi
  dan tidak pernah didaftarkan ke registry skill. Isinya identik byte-per-byte
  dengan upstream commit `a0b4f1e`.
- `assets/` adalah satu-satunya salinan yang dibaca saat runtime, dan isinya
  identik byte-per-byte dengan `vendor/upstream/` — diverifikasi otomatis oleh
  `scripts/validate.mjs`.

---

## 7. Memverifikasi pemasangan

```bash
npm run check
```

Menjalankan dua hal:

1. `node scripts/validate.mjs` — memeriksa manifest, hash, target, dan
   konsistensi paket.
2. `node --test tests/` — memuat plugin ke registry skill DSH yang sebenarnya.

Test integrasi memerlukan checkout DSH. Secara default ia mencari di
`/home/administrator/deepseek-harness`; arahkan lewat `DSH_ROOT` bila berbeda:

```bash
DSH_ROOT=/path/to/deepseek-harness npm test
```

Bila checkout tidak ditemukan, test integrasi di-skip, bukan gagal.

---

## 8. Troubleshooting

**Skill tidak muncul di sesi.**

Skill didaftarkan saat boot. Mulai sesi baru atau restart aplikasi.

**`dsh plugin add` menolak dengan unmet `engines.dsh`.**

Versi DSH Anda di luar `>=0.2.1-rc.2 <0.3.0`. Perbarui DSH. Jangan memaksa
exemption kecuali Anda memahami risikonya.

**`--dump-config` menampilkan `dsh-reasll`, bukan `mulqi-reasll`.**

Profil masih memuat paket lama. Copot dulu:

```bash
dsh plugin --profile web remove dsh-reasll
dsh plugin --profile web add github:mulqizamzam/mulqi--reasll
```

**Agent memuat skill tapi menolak mulai.**

Itu gate otorisasi, bukan bug. Lengkapi approver, lingkup, dan lingkungan
analisis seperti bagian 4.

**Ingin memakai metode ini tanpa plugin DSH.**

Skill sumbernya tetap tersedia utuh di `vendor/upstream/`. Anda bisa membacanya
langsung atau menyalinnya ke harness lain. Lisensinya MIT; sertakan `LICENSE`.

---

## 9. Lisensi dan atribusi

MIT. Metode, referensi, dan template berasal dari
[Speedrunlab/reverse-engineer-anything-self-learning-loop](https://github.com/Speedrunlab/reverse-engineer-anything-self-learning-loop)
(MIT, Speedrun AI Labs), commit `a0b4f1ecff591100d207ddcc799bcb5bb769f031`.
Kemasan DSH-nya dikerjakan oleh mulqizamzam.

Rincian per file ada di [`docs/SOURCE-MANIFEST.md`](docs/SOURCE-MANIFEST.md);
laporan rekonsiliasinya di [`docs/RECONCILIATION.md`](docs/RECONCILIATION.md).