# Routes

## Tidak memerlukan authentication

 - POST   `/login`
 - POST	  `/register`
 - GET 	  `/users`<br>
   Daftarkan para user (tidak memerlukan authentication).<br>
   Query params: 
    - `p` - Page Number
 - GET    `/users/:id`<br>
   Mendapatkan data user (tidak memerlukan authentication).
 - GET    `/job-postings`<br>
   Query params: 
    - `p` - Page Number
    - `gender` - Filter pekerjaan dengan gender requirement terpilih
    - `maxAge` - Filter pekerjaan yang tidak memiliki age requirement atau memiliki max age requirement yang di bawah nilai query
    - `categoryId` - Filter pekerjaan dengan category terpilih
    - `education` - Filter pekerjaan dengan min education requirement di bawah nilai query
    - `location` - Filter pekerjaan di location terpilih
    - `isUrgent` - Filter pekerjaan yang urgent
    - `status` - Filter pekerjaan dengan status tertentu (default: Status Active)
 - GET    `/job-postings/:id`

## Memerlukan authentication
 - GET    `/user`<br>
   Daftarkan detil diri sendiri (setelah login)
 - GET    `/user/reviews`<br>
   Daftarkan review yang diterima diri sendiri (setelah login)
 - GET    `/user/job-applications`<br>
   Daftarkan job application yang sudah dibuat oleh diri sendiri (setelah login)
 - GET    `/user/job-postings`<br>
   Daftarkan job posting yang sudah dibuat oleh diri sendiri (setelah login)
 - PATCH  `/user`<br>
   Mengupdate name, address, imgUrl, EducationId, gender, dateOfBirth, ataupun profileDescription dari diri sendiri
 - POST	  `/job-postings`<br>
   Membuat posting lowongan kerja baru
 - PUT	  `/job-postings/:id`<br>
   Mengupdate posting lowongan kerja
 - PATCH  `/job-postings/:id`<br>
   Mengupdate status posting lowongan kerja (dari 3 pilihan: Active, Inactive, atau Filled)
 - POST	  `/job-postings/:id/application`<br>
   Apply kepada satu job posting
 - PATCH	`/job-postings/:id/application/:appId`<br>
   Employer mengupdate status job application, di antara kasus:
    - Menerima lamaran, dan user yang diterima memulai pekerjaan
    - Menolak lamaran
    - Pekerja yang menerima lamaran dan memulai pekerjaan sudah memutuskan hubungan kerja dengan employer
 - POST	  `/users/:id/review`
   Employer meng-posting review kepada user