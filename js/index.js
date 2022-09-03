const TIMER = 60 // detik hitung mundur
// jika ini dirubah, ganti juga nilai di line 139 dengan mengurangi 1 angka
const TOTAL_WORDS_PER_LINE = 12 // total jumlah kata per antrian
// menampung kata yang sedang diketik
let currentTyped = ""
// digunakan untuk mengambil index dari sumber data (array)
let count = -1
// digunakan untuk menghitung jumlah kata yang diketik
// akan di-reset kembali jika kata telah mencapai, misl. 12
let length_word = -1
// untuk memotong jumlah data yang masuk pertama hingga ke .... n
let slice0 = 0
let slice1 = TOTAL_WORDS_PER_LINE
// element kata ditempatkan
let words_el = document.getElementById("words")
// input kata 
let input_el = document.getElementById("typed")
// menampung hasil ketikan (total kata, benar dan salah)
let recap = {}
// mengacak data array 
let randomizeWords = arr => {
    return arr.sort((a, b) => 0.5 - Math.random())
}
// mengambil array teracak
let getCurrentRandomArray = (source, target_lang, target_level) => {
    return randomizeWords(source[target_lang][target_level]).map(str => {
        // tambahkan spasi pada setiap kata, untuk mempermudah event 
        // trigger tombol spasi
        return str + " "
    })
}
// membuat struktur html dari list kata di array
let getHTMLStucture = source => {
    let words = source.map((str, i) => {
        return `
            <span id="mark-char-${i}" class="current">${str}</span>
        `
    })
    return words.join("")
}
// menandai kata selanjutnya yang harus diketik dengan 
// menambahkan kelas "bold"
let boldNextTypingWord = counter => {
    // id target kata selanjutnya, diambil dari urutan ketikan
    // mengacu ke variable "count" di atas
    let targetWordAfter = document.getElementById(`mark-char-${counter}`)
    // tambahkan kelas "bold" untuk target elemen
    targetWordAfter.classList.add("bold")
}
// validasi hasil ketikan dengan data/soal
let wordValidation = (cases, target) => {
    // jika benar beri kelas "green", jika salah "red"
    return cases == true ? target.classList.add("green") : target.classList.add("red")
}
// reset data
let resetData = () => {
    // mengosongkan nilai pada kondisi tertentu
    input_el.value = ""
    currentTyped = ""
}
// hitungan waktu mundur
let countTime = timeleft => {
    // element untuk meng-input hitungan waktu berjalan
    let counttime_el = document.getElementById("countdown")
    // elemen total kata yang telah diketik
    let totalWords = document.getElementById("total-words")
    // elemen total kata benar
    let totalWordsRight = document.getElementById("total-right")
    // elemen total kata salah
    let totalWordsWrong = document.getElementById("total-wrong")
    // fungsi hitung mundur
    let downloadTimer = setInterval(() => {
        if (timeleft <= 0) {
            // berhenti atau reset, ketika waktu <= 0
            clearInterval(downloadTimer)
            // mapping object hasil ketikan, tersimpan di variable "recap", line 16
            totalWords.innerHTML = Object.keys(recap).length
            totalWordsRight.innerHTML = Object.values(recap).filter(rec => rec === true).length
            totalWordsWrong.innerHTML = Object.values(recap).filter(rec => rec === false).length
            // matikan element input kata ketika waktu habis
            input_el.disabled = true
        }
        // masukan data ke elemen html
        counttime_el.innerHTML = timeleft
        // hitung waktu mundur
        timeleft -= 1
    }, 1000)
}
// fungsi utama 
let keyUp = (data, current_html) => {
    // melakukan slicing terhadap array kata yang akan masuk pertama kali
    // sejumlah input, misalnya per 12 kata
    current_html.innerHTML = getHTMLStucture(data.slice(slice0, slice1))
    // fungsi "keyup" untuk menangkap karakter keyboard 
    document.addEventListener("keyup", (e) => {
        // menandai kata selanjutnya yang harus di ketik
        boldNextTypingWord(length_word + 1)
        // kondisi trigger untuk tombol spasi
        if (e.code === "Space") {
            // saat di-"spasi" dan input kata = " ", maka data reset atau
            // dikosongkan kembali
            if (input_el.value === " ") {
                resetData()
                // jika tidak
            } else {
                // jumlahkan variable "count"
                count += 1
                // masukan kata dari elemen input ke variable "currentTyped"
                currentTyped += input_el.value
                // menghitung jumlah kata yang diketik
                length_word += 1
                // jumlahkan data slice, agar index yang masuk selanjutnya 
                // adalah kelipatan input, misalnya input per 12 kata = antriana pertama 0-11 kata, 
                // antrian kedua 12 - 21 kata, dst.... 
                slice0 += 1
                slice1 += 1
                // validasi data dengan membandingkan kata yang diketik pada input
                // dengan data array, yang diambil berdasarkan index.
                // index diperoleh dari variable "count"
                let result = currentTyped === data[count]
                // tandai elemen yang salah atau benar, dengan memilih berdasarkan ID
                // ID unik diperoleh dari line 30 dan setiap kata selalu memiliki ID
                // berdasarkan jumlah slicing, misl. per 12 kata, "mark-char-0", "mark-char-1",
                // "mark-char-2", ... , "mark-char-11".
                let currentTypedWord = document.getElementById(`mark-char-${length_word}`)
                // jalankan fungsi untuk menambahkan kelas (untuk pewarnaan) pada setiap
                // element yang diketik
                wordValidation(result, currentTypedWord)
                // masukkan hasil ketikan ke variable "recap", dengan key = kata original dari array dan
                // value = true atau false
                recap[data[count]] = result
                // reset ulang data pada setiap event ketikan
                resetData()
            }
        }
        // kondisi pengecekan total panjang kata dalam antrian
        // jika sudah === 11
        if (length_word === 11) {
            // length diatur kembali ke nilai default, untuk memperoleh
            // nilai yang sama pada total kata yang diketik.
            // Jika tidak, maka nilai "length_word" ankan terus bertambah
            // dan melampaui jumlah length pada setiap antiran
            length_word = -1
            // set soal atau target ketikan ke slicing antrian berikutnya
            current_html.innerHTML = getHTMLStucture(data.slice(slice0, slice1))
        }
    })
}
// processing akhir
fetch("assets/words.json")
    .then(response => response.json())
    .then(async json => {
        // data original yang sudah diacak
        let source = getCurrentRandomArray(json, "bahasa", "level_1")
        // tombol untuk memulai 
        let startBtn = document.getElementById("startTest")
        // tombol realod
        let reloadBtn = document.getElementById("reloadTest")
        // jalankan fungsi, jika tombol "start" diklik
        startBtn.addEventListener("click", (b) => {
            // matikan tombol start
            b.target.disabled = true
            // hidupkan tombol reload
            reloadBtn.disabled = false
            // hidupkan input ketikan
            input_el.disabled = false
            // jalankan timer
            countTime(TIMER)
            // jalan fungsi utama pengetikan
            keyUp(source, words_el)
        })
    })