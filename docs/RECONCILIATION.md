# Reconciliation Report — Mulqi ReaSLL 1.0.2

Laporan ini menjawab satu pertanyaan: **apakah setiap item di repositori sumber
sudah dipertanggungjawabkan?** Sumbernya adalah
`Speedrunlab/reverse-engineer-anything-self-learning-loop` pada commit
`a0b4f1ecff591100d207ddcc799bcb5bb769f031`.

Angka di bawah dihasilkan oleh `scripts/validate.mjs`, bukan diketik manual.
Jalankan `npm run check` untuk mereproduksinya.

---

## 1. Ringkasan eksekutif

| Kategori | Jumlah |
| --- | --- |
| Item sumber ditemukan | 13 |
| Item dipertahankan byte-per-byte | 9 |
| Item dengan divergensi lokal yang terdokumentasi | 4 |
| Item upstream dieksekusi saat runtime (`assets/`) | 10 |
| File runtime tambahan (authored, `assets/`) | 1 |
| Item referensi non-eksekusi (`vendor/upstream/`) | 13 |
| Item ditransformasi isinya | 4 (lihat bagian 3.2) |
| Item dihapus / dikecualikan | 0 |
| Item belum terselesaikan | 0 |

**Tidak ada omisi senyap.** Ketiga belas file sumber ada di repositori ini;
sepuluh di antaranya juga dibaca saat runtime.

---

## 2. Inventaris lengkap

Daftar berikut adalah keluaran `git ls-tree -r HEAD` pada snapshot upstream,
diambil sebelum clone kerja dihapus. Shallow clone tetap membawa tree penuh
dari commit tip-nya, jadi daftar ini lengkap, bukan sampel. `git ls-remote`
mengonfirmasi `a0b4f1e` masih `HEAD` upstream.

```
CHANGELOG.md
LICENSE
README.md
SKILL.md
references/examine.md
references/fix-recipes.md
references/learning-loop.md
references/parity-checklist.md
references/review.md
templates/gap-report.md
templates/iteration-plan.md
templates/parity-checklist.md
templates/run-ledger.md
```

Tidak ada direktori tersembunyi, aset biner, skrip, atau konfigurasi CI di tree
tersebut. Repositori sumber memang hanya berisi skill Markdown.

---

## 3. Item yang dipertahankan

### 3.1 Dieksekusi saat runtime — 10 item upstream + 1 authored

Kesepuluh file ini disalin ke `assets/` dan didaftarkan lewat `ctx.skills`.
`assets/` dan `vendor/upstream/` **identik satu sama lain**; validator
membandingkan sha256 keduanya. Untuk sembilan dari sepuluh file, isinya juga
identik byte-per-byte dengan upstream `a0b4f1e`. Empat file diedit secara lokal
(lihat 3.2), dan karena itu snapshot vendor untuk keempat file tersebut tidak
lagi sama dengan upstream.

| File | Bytes | Identik upstream? | Peran |
| --- | --- | --- | --- |
| `SKILL.md` | 20116 | tidak (lihat 3.2) | Badan instruksi utama |
| `references/examine.md` | 11758 | tidak (lihat 3.2) | Fase pemeriksaan |
| `references/fix-recipes.md` | 3739 | ya | Resep perbaikan |
| `references/learning-loop.md` | 6457 | ya | Mekanisme loop belajar |
| `references/parity-checklist.md` | 6046 | ya | Definisi paritas |
| `references/review.md` | 4640 | tidak (lihat 3.2) | Review berbasis bukti |
| `templates/gap-report.md` | 922 | ya | Template laporan celah |
| `templates/iteration-plan.md` | 607 | ya | Template rencana iterasi |
| `templates/parity-checklist.md` | 1059 | ya | Template checklist 100% |
| `templates/run-ledger.md` | 1314 | tidak (lihat 3.2) | Template ledger iterasi |

### 3.2 Divergensi lokal yang disengaja — 4 file

Versi 1.0.2 menghapus kewajiban "Gate Otorisasi". Section 0 pada `SKILL.md`
sekarang adalah intake yang **dianjurkan, tidak memblokir**: catatan target,
dasar kewenangan bila ada, batas build, definition of done, mode dan penanganan
data tetap diminta, tetapi ketiadaannya tidak menghentikan pekerjaan. Empat file
upstream ikut disesuaikan agar konsisten dengan perubahan itu, dan
`vendor/upstream/` diperbarui bersamaan sehingga salinan yang dieksekusi dan
salinan provenance tetap sama persis satu sama lain.

| File | Upstream bytes | Lokal bytes | Perubahan |
| --- | --- | --- | --- |
| `SKILL.md` | 19840 | 20116 | Section 0 menjadi `INTAKE AND SCOPE (RECOMMENDED)`; larangan memakai tool sebelum intake dihapus; `Authority record` menjadi `Authority, when you have one` (boleh mencatat diri sendiri sebagai approver); `the gate's scope` → `the recorded scope`; `the authority has expired` → `the authority you recorded has expired`; deskripsi `authorisation-gated` → `authorisation-aware`; baris `compatibility` tidak lagi mewajibkan approver independen. |
| `references/examine.md` | 11756 | 11758 | `the gate's mode` → `the recorded mode`. |
| `references/review.md` | 4630 | 4640 | `under the gate` → `under the recorded scope`. |
| `templates/run-ledger.md` | 1283 | 1314 | Baris `intake:` menerima `none recorded` beserta alasannya. |

Hash upstream dan hash lokal untuk keempat file dicatat berdampingan di
[`SOURCE-MANIFEST.md`](./SOURCE-MANIFEST.md#local-divergence). Sembilan file
lainnya tetap byte-identik dengan `a0b4f1e`.

Selain kesepuluh file di atas, `assets/references/dsh-notes.md` adalah file
**authored** (2683 byte) yang ditulis untuk port ini. Ia tidak punya padanan di
upstream dan karenanya tidak ikut perbandingan verbatim; hash-nya didaftarkan di
manifest agar drift tetap tertangkap.

Satu-satunya transformasi terjadi **saat baca**, bukan saat penyimpanan:
`index.js` membuang blok frontmatter YAML di awal `SKILL.md` dan menyuplai
metadata yang sama secara programatik. File di disk tetap utuh. Test integrasi
memverifikasi bahwa badan yang dimuat model tidak diawali `---` dan tetap
memuat seluruh instruksi.

### 3.2 Referensi non-eksekusi — 3 item

| File | Bytes | Alasan tidak dieksekusi |
| --- | --- | --- |
| `README.md` | 7809 | Menjelaskan pemasangan gaya Claude Code (salin ke direktori skills). Tidak berlaku di DSH, dan menjalankannya akan menyesatkan. Tetap disimpan verbatim. |
| `CHANGELOG.md` | 1266 | Riwayat rilis skill sumber, bukan riwayat plugin. Disimpan verbatim; riwayat upstream juga dikutip di `CHANGELOG.md` root. |
| `LICENSE` | 1081 | MIT. Tidak dieksekusi, tetapi wajib ikut. Root `LICENSE` byte-identik. |

---

## 4. Adaptasi yang dilakukan

Sebagian besar konten sumber tidak diubah kata-katanya; adaptasi kemasan
mendominasi. Pengecualiannya adalah empat file pada 3.2, yang diedit untuk
menjadikan intake Section 0 opsional.

| Aspek sumber | Perlakuan di plugin | Alasan |
| --- | --- | --- |
| Instalasi: salin folder ke direktori skills | Bundle DSH via `dsh.bundle.patch`, dipasang dengan `dsh plugin add` | DSH tidak memakai direktori skills Claude Code |
| Penemuan skill: pemindaian direktori | Provider `ctx.skills` dengan nama kebab-case | Kontrak registry DSH 0.2.1-rc.2 |
| Metadata: frontmatter YAML | Frontmatter tetap di `assets/SKILL.md`; metadata sama disuplai di `index.js` | Registry DSH menerima metadata terstruktur, bukan YAML mentah |
| Path relatif `references/...`, `templates/...` | `resourceBase` menunjuk `assets/` | Link di badan skill resolve tanpa menulis ulang teksnya |
| Versi skill `1.0.1` | Dipertahankan di `metadata.version`; versi plugin terpisah di `metadata.plugin.version` | Memisahkan versi instruksi dari versi kemasan |

---

## 5. File baru (authored)

Tidak mengandung konten upstream.

| Path | Peran |
| --- | --- |
| `index.js` | Plugin Cordis; registrasi provider skill |
| `cordis.patch.yml` | Layer patch bundle |
| `package.json` | Manifest paket `mulqi-reasll` 1.0.2 |
| `HOWTOUSE.md` | Panduan pasang dan pakai |
| `README.md` | Ikhtisar port |
| `CHANGELOG.md` | Riwayat rilis plugin |
| `AGENTS.md` | Aturan agent repositori (sudah ada sebelumnya) |
| `docs/SOURCE-MANIFEST.md` | Manifest sumber-ke-target |
| `docs/source-manifest.json` | Manifest mesin yang ditegakkan validator |
| `docs/RECONCILIATION.md` | Laporan ini |
| `scripts/validate.mjs` | Validasi kelengkapan otomatis |
| `tests/plugin.test.js` | Test integrasi registry skill DSH |
| `tests/manifest.test.js` | Pembungkus test untuk validator |

---

## 6. Batas aktivasi

Pemisahan ini disengaja dan ditegakkan, bukan sekadar didokumentasikan.

| Lapisan | Lokasi | Dieksekusi? | Didaftarkan ke registry? |
| --- | --- | --- | --- |
| Instruksi runtime | `assets/` | Ya, dibaca saat `ctx.skills.get()` | Ya, satu skill |
| Provenance | `vendor/upstream/` | Tidak | Tidak |
| Dokumentasi port | `docs/`, `HOWTOUSE.md`, `README.md` | Tidak | Tidak |
| Validasi | `scripts/`, `tests/` | Hanya saat dijalankan manual/CI | Tidak |

Konsekuensi yang perlu dinyatakan eksplisit:

- Skill dimuat sebagai instruksi skill, bukan system prompt. Ia tidak berada di
  atas hierarki instruksi host dan tidak melonggarkan kontrol keamanan DSH.
- `vendor/upstream/` tidak dapat dijangkau agent lewat `resourceBase`. Agent
  hanya melihat `assets/`.
- Tidak ada hook, listener, atau tool tambahan. Plugin hanya mendaftarkan satu
  provider skill dengan `rank: 600` (`BUNDLED_SKILL_RANK`).

---

## 7. Validasi otomatis

`scripts/validate.mjs` menegakkan tujuh kelompok pemeriksaan:

1. **Cakupan snapshot** — setiap file di `vendor/upstream/` ada di manifest,
   dan setiap item manifest ada di disk. Dua arah.
2. **Hash dan ukuran** — sha256 dan byte size setiap item cocok dengan disk.
3. **Target** — setiap path target yang dideklarasikan benar-benar ada.
4. **Verbatim** — setiap item `executable` identik byte-per-byte antara
   `assets/` dan `vendor/upstream/`.
5. **Tidak ada aset tak terklaim** — setiap file di `assets/` diklaim manifest,
   baik lewat `items[].targets` maupun lewat entri `authored[]` yang punya
   `sha256`/`bytes` sendiri (hash-nya diverifikasi).
6. **Konsistensi paket** — nama/versi paket, `engines.dsh`, `dsh.bundle.patch`,
   `files[]`, dan kesesuaian `name` di patch dengan nama paket.
7. **Konsistensi skill** — id skill di frontmatter = `SKILL_NAME` di
   `index.js`, dan setiap link `references/...`/`templates/...` yang dikutip
   `SKILL.md` ada di `assets/`.

Keluaran terakhir yang terverifikasi:

```
ok   vendored snapshot: 13 files, all accounted for
ok   hashes verified: 13/13
ok   targets present: 24
ok   verbatim runtime copies: 10
ok   authored runtime files verified: 1/1
ok   assets/ fully claimed: 11
ok   bundle patch resolves to the package
ok   package files[] covers runtime, assets and docs
ok   skill id consistent: reverse-engineer-anything-self-learning-loop
ok   cited resources resolve: 8

manifest complete: 13 source items, 24 targets, no omissions
```

`tests/plugin.test.js` menambahkan verifikasi terhadap registry DSH yang
sebenarnya: satu skill terdaftar, provider `reasll`, source `bundled`, invocation
model+user, `resourceBase` berupa direktori, frontmatter terbuang dari badan,
dan seluruh instruksi termuat.

---

## 8. Isu kompatibilitas yang belum terselesaikan

Tidak ada yang memblokir. Dua catatan yang perlu diketahui:

1. **Nama skill berbeda dari nama plugin.** Skill terdaftar sebagai
   `reverse-engineer-anything-self-learning-loop`; plugin bernama
   `mulqi-reasll`. Ini disengaja: nama skill adalah bagian dari konten sumber
   dan dipertahankan demi kesetiaan. Pengguna memanggil skill lewat nama
   panjangnya, bukan lewat nama plugin.
2. **Versi ganda.** `metadata.version` = `1.0.1` (versi instruksi, diturunkan
   dari rilis skill upstream), `metadata.plugin.version` = `1.0.2` (kemasan
   DSH). Keduanya benar untuk domainnya masing-masing dan tidak saling
   menggantikan.
3. **Divergensi lokal pada 4 file.** Badan instruksi, `references/examine.md`,
   `references/review.md` dan `templates/run-ledger.md` tidak identik
   byte-per-byte dengan upstream `a0b4f1e`; perbedaannya hanya pada penghapusan
   kewajiban gate otorisasi dan perbaikan istilah yang mengikutinya, seperti
   dirinci di 3.2. Enam file runtime lainnya tetap identik byte-per-byte.

---

## 9. Reproduksi

```bash
npm run check
```

Atau terpisah:

```bash
node scripts/validate.mjs
node --test tests/
```

Test integrasi memerlukan checkout DSH; arahkan lewat `DSH_ROOT` bila tidak di
`/home/administrator/deepseek-harness`. Bila checkout tidak ada, test itu
di-skip, bukan gagal.