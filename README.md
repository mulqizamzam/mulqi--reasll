# dsh-reasll

Plugin **DeepSeek Harness (DSH)** yang membawa skill *Reverse Engineer Anything with a Self-Learning Loop* ke dalam sesi DSH: teliti produk yang Anda berhak bangun ulang, bangun versi Anda sendiri, review dengan bukti, tutup celahnya, lalu ulangi sampai checklist 100% yang tertulis lulus.

Port dari [Speedrunlab/reverse-engineer-anything-self-learning-loop](https://github.com/Speedrunlab/reverse-engineer-anything-self-learning-loop) (MIT, Speedrun AI Labs). Isi metode, referensi, dan template disalin apa adanya — yang berubah hanya kemasannya.

`MIT` · target DSH `0.2.1-rc.2` · tanpa dependency · tanpa build step

---

## Daftar isi

- [Apa ini](#apa-ini)
- [Kebutuhan](#kebutuhan)
- [Cara pasang di DSH](#cara-pasang-di-dsh)
- [Cara pakai](#cara-pakai)
- [Alur kerja skill](#alur-kerja-skill)
- [Struktur repo](#struktur-repo)
- [Pengembangan dan test](#pengembangan-dan-test)
- [Troubleshooting](#troubleshooting)
- [Lisensi dan atribusi](#lisensi-dan-atribusi)

---

## Apa ini

DSH punya sistem *skill*: sekumpulan instruksi yang dimuat agent saat tugasnya cocok. Repo aslinya adalah skill bergaya Claude Code (`SKILL.md` + `references/` + `templates/`) yang harus disalin manual ke direktori skill.

Plugin ini mengubahnya menjadi **bundle DSH** yang bisa dipasang dengan satu perintah. Setelah terpasang:

- skill muncul di katalog skill sesi dengan nama `reverse-engineer-anything-self-learning-loop`;
- agent bisa memuatnya sendiri saat tugasnya cocok, atau Anda panggil eksplisit;
- berkas `references/` dan `templates/` tetap bisa dibaca agent lewat path relatif, persis seperti versi aslinya.

Yang **tidak** berubah: seluruh isi instruksi, urutan fase, aturan bukti, dan template. Tidak ada instruksi yang ditulis ulang.

## Kebutuhan

| Komponen | Versi |
|---|---|
| DeepSeek Harness | `>= 0.2.1-rc.2 < 0.3.0` |
| Node.js | `>= 22.19.0` |
| git + akses jaringan | untuk instalasi dari GitHub |

Cek versi DSH Anda:

```bash
dsh --version
```

Kalau masih di bawah `0.2.1-rc.2`, instalasi akan ditolak oleh pemeriksaan `engines.dsh`.

## Cara pasang di DSH

Ada dua cara. Pilih salah satu.

### Opsi A — langsung dari GitHub (rekomendasi)

```bash
dsh plugin --profile web add github:mulqizamzam/mulqi--reasll
```

Ganti `web` dengan nama profil yang Anda pakai. Perintah ini:

1. menambahkan `dsh-reasll` sebagai dependency profil;
2. mendaftarkannya ke `dsh.profile.bundles` secara otomatis — Anda tidak perlu mengedit YAML.

### Opsi B — dari clone lokal

```bash
git clone https://github.com/mulqizamzam/mulqi--reasll.git
cd mulqi--reasll
dsh plugin --profile web add .
```

Cocok kalau Anda ingin memodifikasi skill-nya.

### Verifikasi

```bash
dsh --profile web --dump-config | grep -A2 "== dsh-reasll"
```

Yang benar akan menampilkan baris plugin dari bundle ini:

```yaml
# == dsh-reasll
- id: reasll
  name: dsh-reasll
```

Terakhir, **mulai sesi DSH baru** (restart aplikasi atau buka sesi baru). Skill didaftarkan saat boot, jadi sesi yang sedang berjalan belum melihatnya.

### Mencopot

```bash
dsh plugin --profile web remove dsh-reasll
```

## Cara pakai

Skill ini tidak menambah tombol atau perintah baru. Ia menambah **pengetahuan** yang bisa dipakai agent. Ada dua pola pemakaian.

### 1. Biarkan agent memilih sendiri

Agent melihat daftar skill beserta deskripsi singkatnya. Kalau Anda meminta hal yang cocok — "bangun ulang tool ini", "port aplikasi ini ke platform lain", "rekonstruksi ini mandek di 80%" — agent akan memuat skill ini.

Contoh prompt:

```
Saya berhak membangun ulang <produk>. Yang menyetujui: <nama>. Lingkup: <batas>.
Folder kerja: <path>. Mulai dari pemeriksaan, lalu susun parity checklist untuk saya setujui.
```

### 2. Panggil eksplisit

Minta agent memuat skill dengan namanya:

```
Muat skill reverse-engineer-anything-self-learning-loop, lalu jalankan fase pemeriksaan
pada <produk>.
```

### Yang perlu Anda siapkan

Skill ini **gated**: ia menolak berjalan tanpa otorisasi yang jelas. Sebelum mulai, siapkan:

- produk yang Anda berhak bangun ulang;
- siapa yang menyetujui (nama, peran);
- lingkup: apa yang masuk dan apa yang tidak;
- folder kerja yang bisa ditulis;
- lingkungan analisis terpisah (idealnya VM sekali pakai) untuk langkah live.

Bekerja sendiri? Catat diri Anda sebagai approver dan tulis alasannya. Gate-nya ada supaya otorisasi eksplisit, bukan implisit.

## Alur kerja skill

Ringkasnya — detail lengkap ada di dalam skill:

1. **Periksa** (`references/examine.md`) — static-first, tanpa menyalin ekspresi yang dilindungi.
2. **Tulis definisi 100%** (`templates/parity-checklist.md`) — checklist yang harus Anda setujui sebelum build.
3. **Bangun** — walking skeleton dulu, lalu isi.
4. **Review dengan bukti** (`references/review.md`) — dibandingkan dengan aslinya, bukan dengan ingatan.
5. **Catat celah dan rencanakan** (`templates/gap-report.md`, `templates/iteration-plan.md`).
6. **Perbaiki dan ulangi** (`references/fix-recipes.md`) sampai semua must-have lulus di dua review berturut-turut.
7. **Belajar** (`references/learning-loop.md`) — setiap iterasi meninggalkan aturan baru di `references/`, sehingga produk berikutnya mulai lebih jauh.

Berkas pendukung yang dikirim plugin ini:

```
assets/
├── SKILL.md                     # instruksi utama (frontmatter asli dipertahankan)
├── references/
|   ├── examine.md               # metode pemeriksaan
|   ├── fix-recipes.md           # resep perbaikan per penyebab
|   ├── learning-loop.md         # apa yang dipelajari dan di mana disimpan
|   ├── parity-checklist.md      # cara menurunkan checklist per kelas produk
|   └── review.md                # review dengan mata segar
└── templates/
    ├── gap-report.md
    ├── iteration-plan.md
    ├── parity-checklist.md
    └── run-ledger.md
```

## Struktur repo

```
.
├── package.json        # manifest bundle: dsh.bundle.patch, engines.dsh
├── cordis.patch.yml    # layer yang menyisipkan baris plugin ke profil
├── index.js            # provider skill (ESM biasa, tanpa dependency)
├── assets/             # isi skill, disalin apa adanya dari upstream
└── tests/plugin.test.js
```

Bagian yang perlu Anda tahu kalau ingin memodifikasi:

- `index.js` mengekspor `name`, `inject = ['skills']`, dan `apply(ctx)`; di dalamnya ada `ctx.skills.registerProvider(...)`.
- Deskripsi dan metadata skill ada sebagai konstanta di `index.js`, karena frontmatter YAML dilepas dari body yang dibaca model.
- `resourceBase` menunjuk ke `assets/`, jadi tautan relatif `references/…` dan `templates/…` di dalam body tetap valid.

## Pengembangan dan test

```bash
npm test
```

Test-nya integrasi: ia memuat plugin ke registry skill DSH yang asli, lalu memeriksa nama, provider, isi body, dan bahwa **setiap** path `references/…` atau `templates/…` yang disebut di body benar-benar ada.

Butuh checkout DSH. Secara default menunjuk ke `/home/administrator/deepseek-harness`; timpa dengan:

```bash
DSH_ROOT=/path/ke/deepseek-harness npm test
```

## Troubleshooting

| Gejala | Penyebab | Perbaikan |
|---|---|---|
| Instalasi ditolak dengan pesan `engines` | Versi DSH di luar `>=0.2.1-rc.2 <0.3.0` | Upgrade DSH, atau longgarkan `engines.dsh` di `package.json` |
| `dsh --dump-config` tidak menampilkan `dsh-reasll` | Bundle tidak terdaftar di profil | Jalankan ulang `dsh plugin --profile <nama> add …` dan pastikan nama profilnya benar |
| Skill tidak muncul di katalog sesi | Sesi lama belum di-restart | Mulai sesi DSH baru |
| `grep` tidak menemukan apa pun | Profil yang di-dump bukan profil yang dipasangi | Cocokkan `--profile` di kedua perintah |

## Lisensi dan atribusi

MIT — lihat [`LICENSE`](LICENSE), hak cipta tetap pada **Speedrun AI Labs Pty Ltd**.

- Skill asli: [Speedrunlab/reverse-engineer-anything-self-learning-loop](https://github.com/Speedrunlab/reverse-engineer-anything-self-learning-loop)
- Terinspirasi REA (Reverse Engineer Anything) oleh [@morluto](https://github.com/morluto/rea). Tidak berafiliasi.
- Port DSH: kemasan plugin, provider skill, dan README ini. Isi metode tidak diubah.

---

## English quick start

A DeepSeek Harness plugin that ships the *reverse-engineer-anything self-learning loop* skill. Content is carried over verbatim from the upstream repo (MIT, Speedrun AI Labs); only the packaging is new.

```bash
dsh plugin --profile web add github:mulqizamzam/mulqi--reasll
dsh --profile web --dump-config | grep -A2 "== dsh-reasll"
```

Requires DSH `>= 0.2.1-rc.2 < 0.3.0` and Node `>= 22.19.0`. Restart DSH afterwards; the skill registers as `reverse-engineer-anything-self-learning-loop`. No dependencies, no build step. Run `npm test` (with `DSH_ROOT` pointing at a DSH checkout) to verify against the real skill registry.
