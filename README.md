# Mulqi ReaSLL

Plugin **DeepSeek Harness (DSH)** yang membawa skill *Reverse Engineer Anything with a Self-Learning Loop* ke dalam sesi DSH: teliti produk yang Anda berhak bangun ulang, bangun versi Anda sendiri, review dengan bukti, tutup celahnya, lalu ulangi sampai checklist 100% yang tertulis lulus.

Port dari [Speedrunlab/reverse-engineer-anything-self-learning-loop](https://github.com/Speedrunlab/reverse-engineer-anything-self-learning-loop) (MIT, Speedrun AI Labs, commit `a0b4f1e`). Metodenya dipertahankan utuh; pada 1.0.2 Section 0 diubah menjadi intake opsional, dan empat file ikut disesuaikan (lihat [Kelengkapan sumber](#kelengkapan-sumber)).

`MIT` · target DSH `0.2.1-rc.2` · tanpa dependency · tanpa build step

| | |
| --- | --- |
| Nama plugin | Mulqi ReaSLL |
| Nama paket | `mulqi-reasll` |
| Versi plugin | `1.0.2` |
| Versi skill sumber | `1.0.1` (upstream) |
| Nama skill terdaftar | `reverse-engineer-anything-self-learning-loop` |

---

## Daftar isi

- [Apa ini](#apa-ini)
- [Kebutuhan](#kebutuhan)
- [Cara pasang di DSH](#cara-pasang-di-dsh)
- [Cara pakai](#cara-pakai)
- [Alur kerja skill](#alur-kerja-skill)
- [Struktur repo](#struktur-repo)
- [Kelengkapan sumber](#kelengkapan-sumber)
- [Pengembangan dan test](#pengembangan-dan-test)
- [Troubleshooting](#troubleshooting)
- [Lisensi dan atribusi](#lisensi-dan-atribusi)

---

## Apa ini

DSH punya sistem *skill*: sekumpulan instruksi yang dimuat agent saat tugasnya cocok. Repo aslinya adalah skill bergaya Claude Code (`SKILL.md` + `references/` + `templates/`). Plugin ini mengemasnya ulang supaya bisa dipasang sebagai bundle DSH, dengan satu perubahan metode yang disengaja: Section 0 kini intake opsional, bukan gate otorisasi.

Tiga hal yang perlu dipahami:

1. **Plugin ini tidak menambah tool.** Ia hanya mendaftarkan satu skill ke `ctx.skills`.
2. **Nama skill berbeda dari nama plugin.** Agent memanggil `reverse-engineer-anything-self-learning-loop`; `mulqi-reasll` adalah nama paket.
3. **Intake dianjurkan, bukan wajib.** Skill mencatat target, dasar kewenangan bila ada, batas build, definition of done, mode, dan penanganan data di run ledger. Catatan yang lengkap membuat hasilnya bisa diaudit; ketiadaannya tidak memblokir mulai.

---

## Kebutuhan

| Kebutuhan | Keterangan |
| --- | --- |
| DeepSeek Harness | `>=0.2.1-rc.2 <0.3.0` |
| Node.js | `>=22.19.0` |
| Profil DSH | Salah satu profil, misalnya `web` |

Tanpa dependency runtime. Tanpa build step. Entry module adalah ESM biasa.

---

## Cara pasang di DSH

### Opsi A — dari repositori GitHub

```bash
dsh plugin --profile web add github:mulqizamzam/mulqi--reasll
```

Ganti `web` dengan nama profil Anda. Perintah ini menambahkan `mulqi-reasll` sebagai dependency profil dan mendaftarkannya ke `dsh.profile.bundles` secara otomatis — Anda tidak perlu mengedit YAML.

### Opsi B — dari clone lokal

```bash
git clone https://github.com/mulqizamzam/mulqi--reasll.git
cd mulqi--reasll
dsh plugin --profile web add .
```

Cocok kalau Anda ingin membaca atau memodifikasi isi skill.

### Verifikasi

```bash
dsh --profile web --dump-config | grep -A2 "== mulqi-reasll"
```

Yang benar menampilkan:

```yaml
# == mulqi-reasll
- id: mulqi-reasll
  name: mulqi-reasll
```

Terakhir, **mulai sesi DSH baru**. Skill didaftarkan saat boot, jadi sesi yang sedang berjalan belum melihatnya.

### Mencopot

```bash
dsh plugin --profile web remove mulqi-reasll
```

Panduan lebih rinci, termasuk migrasi dari nama paket lama, ada di [`HOWTOUSE.md`](HOWTOUSE.md).

---

## Cara pakai

Skill ini menambah pengetahuan, bukan perintah. Dua pola pemakaian.

### 1. Biarkan agent memilih sendiri

Agent melihat daftar skill beserta deskripsi singkatnya. Kalau Anda meminta hal yang cocok — "bangun ulang alat internal yang source-nya hilang" — agent akan memuatnya.

### 2. Panggil eksplisit

> Pakai skill `reverse-engineer-anything-self-learning-loop` untuk merekonstruksi parser laporan ini.

### Yang perlu Anda siapkan

Skill ini **tidak memblokir** Anda sebelum intake lengkap. Yang dianjurkan untuk
dicatat lebih dulu:

- produk yang Anda berhak bangun ulang;
- dasar kewenangan bila ada (milik sendiri, lisensi, atau izin tertulis) — bekerja
  sendiri? catat diri Anda sebagai approver dan tulis alasannya;
- lingkup: apa yang masuk dan apa yang tidak;
- folder kerja yang bisa ditulis;
- lingkungan analisis terpisah (idealnya VM sekali pakai) untuk langkah live.

Yang belum diketahui dicatat sebagai unknown di run ledger, bukan diisi
dugaan. Intake ada supaya batas kerja eksplisit dan hasilnya bisa diaudit.

---

## Alur kerja skill

Ringkasnya — detail lengkap ada di dalam skill:

1. **Periksa** (`references/examine.md`) — static-first, tanpa menyalin ekspresi yang dilindungi.
2. **Tulis definisi 100%** (`templates/parity-checklist.md`) — checklist yang harus Anda setujui sebelum build.
3. **Bangun** — walking skeleton dulu, lalu isi.
4. **Review dengan bukti** (`references/review.md`).
5. **Catat celah dan rencana** (`templates/gap-report.md`, `templates/iteration-plan.md`).
6. **Perbaiki** (`references/fix-recipes.md`).
7. **Ulangi** sampai checklist lulus; catat tiap iterasi di `templates/run-ledger.md`.

---

## Struktur repo

```
mulqi-reasll/
├── index.js                    Plugin Cordis: registrasi provider skill
├── cordis.patch.yml            Layer patch bundle DSH
├── package.json                Manifest paket
├── README.md                   Dokumen ini
├── HOWTOUSE.md                 Panduan pasang dan pakai
├── CHANGELOG.md                Riwayat rilis plugin
├── LICENSE                     MIT (identik dengan lisensi upstream)
├── assets/                     Salinan runtime — dibaca saat ctx.skills.get()
|   ├── SKILL.md
|   ├── references/             examine, fix-recipes, learning-loop, parity-checklist, review, dsh-notes
|   └── templates/              gap-report, iteration-plan, parity-checklist, run-ledger
├── vendor/upstream/            Provenance read-only — tidak pernah dieksekusi
├── docs/
|   ├── SOURCE-MANIFEST.md      Manifest sumber-ke-target (manusia)
|   ├── source-manifest.json    Manifest sumber-ke-target (mesin)
|   └── RECONCILIATION.md       Laporan rekonsiliasi
├── scripts/validate.mjs        Validasi kelengkapan otomatis
└── tests/                      Test integrasi + test kelengkapan
```

Dua salinan isi skill disimpan dengan sengaja, dan perannya berbeda:

- `assets/` — satu-satunya yang dibaca runtime. `resourceBase` menunjuk ke sini, sehingga link `references/…` dan `templates/…` di badan skill resolve tanpa ditulis ulang.
- `vendor/upstream/` — snapshot utuh upstream. Tidak dieksekusi, tidak didaftarkan, tidak dijangkau agent. Fungsinya untuk audit dan untuk memakai metode ini di luar DSH.

Validator memverifikasi keduanya identik satu sama lain. Sembilan dari tiga belas file juga identik byte-per-byte dengan upstream `a0b4f1e`; empat file sengaja diedit lokal (Section 0 menjadi intake opsional) dan snapshot vendor diperbarui bersamaan.

---

## Kelengkapan sumber

Repositori sumber punya **13 file** pada commit `a0b4f1ecff591100d207ddcc799bcb5bb769f031`. Semuanya ada di repo ini:

| Disposisi | Jumlah | Lokasi |
| --- | --- | --- |
| executable (dibaca runtime) | 10 | `assets/` + `vendor/upstream/` |
| reference (non-eksekusi) | 3 | `vendor/upstream/` (+ `LICENSE` di root) |
| identik byte-per-byte dengan upstream `a0b4f1e` | 9 | `assets/` + `vendor/upstream/` |
| divergensi lokal terdokumentasi | 4 | `assets/` + `vendor/upstream/` (lihat di bawah) |
| dihapus / dikecualikan | 0 | — |

Rincian per file, termasuk sha256 dan alasan perlakuan, ada di [`docs/SOURCE-MANIFEST.md`](docs/SOURCE-MANIFEST.md). Ringkasan keputusannya ada di [`docs/RECONCILIATION.md`](docs/RECONCILIATION.md).

Empat file diedit secara lokal pada 1.0.2 agar Section 0 tidak lagi memblokir:
`SKILL.md`, `references/examine.md`, `references/review.md` dan
`templates/run-ledger.md`. `assets/` dan `vendor/upstream/` menyimpan byte yang
sama untuk keempat file itu, jadi salinan runtime dan provenance tetap konsisten;
hash upstream dan hash lokal dicatat berdampingan di
[`docs/SOURCE-MANIFEST.md`](docs/SOURCE-MANIFEST.md#local-divergence). Sembilan
file lainnya tetap identik byte-per-byte dengan `a0b4f1e`.

Selain itu, satu transformasi terjadi saat baca, bukan saat simpan: `index.js`
membuang blok frontmatter YAML di awal `SKILL.md` dan menyuplai metadata yang
sama secara programatik. File di disk tetap utuh.

---

## Pengembangan dan test

```bash
npm run check
```

Menjalankan dua hal:

1. `node scripts/validate.mjs` — memeriksa manifest, hash, target, kesetaraan `assets/` dengan `vendor/upstream/`, konsistensi paket, dan link yang dikutip `SKILL.md`.
2. `node --test tests/*.test.js` — memuat plugin ke registry skill DSH yang sebenarnya.

Test integrasi mencari checkout DSH di `/home/administrator/deepseek-harness`. Arahkan lewat `DSH_ROOT` bila berbeda:

```bash
DSH_ROOT=/path/to/deepseek-harness npm test
```

Bila checkout tidak ditemukan, test integrasi di-skip, bukan gagal.

Kalau Anda mengubah isi `assets/`, perbarui juga `vendor/upstream/` dan manifest — kalau tidak, validator akan menolak. Itu disengaja: mencegah drift senyap antara salinan runtime dan provenance.

---

## Troubleshooting

| Gejala | Sebab | Tindakan |
| --- | --- | --- |
| Skill tidak muncul di sesi | Skill didaftarkan saat boot | Mulai sesi baru atau restart aplikasi |
| `dsh plugin add` menolak, unmet `engines.dsh` | Versi DSH di luar rentang | Perbarui DSH; jangan paksa exemption tanpa memahami risikonya |
| `--dump-config` menampilkan `dsh-reasll` | Profil masih memuat paket lama | `dsh plugin --profile <nama> remove dsh-reasll`, lalu `add` ulang |
| Agent berhenti dan bertanya di tengah jalan | Batas kerja belum tercatat | Isi intake di run ledger (target, kewenangan, batas build, mode) lalu lanjutkan |
| `npm run check` gagal di bagian hash | `assets/` dan `vendor/upstream/` berbeda | Sinkronkan keduanya, atau perbarui manifest bila perubahan memang disengaja |

---

## Lisensi dan atribusi

MIT.

- Metode, referensi, dan template: [Speedrunlab/reverse-engineer-anything-self-learning-loop](https://github.com/Speedrunlab/reverse-engineer-anything-self-learning-loop), MIT, Speedrun AI Labs, commit `a0b4f1ecff591100d207ddcc799bcb5bb769f031`.
- Kemasan DSH: mulqizamzam.

Lisensi sumber dipertahankan verbatim di `LICENSE` dan `vendor/upstream/LICENSE`.