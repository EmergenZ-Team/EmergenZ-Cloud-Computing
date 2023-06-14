from flask import Flask
from flask import request
from flask import jsonify
import tensorflow as tf
import re
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from keras.models import load_model
import nltk
from nltk.corpus import stopwords
from keywords import all_keywords


app = Flask(__name__)
model = load_model('news_model.h5')
tokenizer = Tokenizer()
tokenizer.fit_on_texts(all_keywords)

def clean_titles(titles):
    clean = []
    stopwords_id = stopwords.words('indonesian')
    
    for title in titles:
        title = title.lower()
        title = re.sub(r'\d+', '', title)  
        title = re.sub(r'[^\w\s]', '', title) 
        
        words = title.split()
        clean_words = [word for word in words if word not in stopwords_id]
        clean_words = ' '.join(clean_words)
        # print(clean_words)
        clean.append(clean_words)
        cleaned_titles = ' '.join([str(word) for word in clean])  
    
    return cleaned_titles

@app.route('/')
def index():
    return 'Index Page'

@app.route('/hello', methods=['POST'])
def hello():
    # title = "KPK Duga Rafael Alun Pakai Uang Hasil Gratifikasi untuk Beli Aset Apa Benar Banyak Bekas Luka Gejala Sifilis? 5 Cara Penularan Penyakit Menular Seksual Tanpa Penetrasi Gunung Anak Krakatau Kembali Erupsi, Semburkan Abu Vulkanik 2,5 Km Mayat Wanita di Depok Diduga Sudah Dibuang Sepekan Kebakaran Rumah Makan Jasunda BSD, 1 Karyawan Alami Luka Bakar Buron Sejak Maret, Pelaku Pembacokan Siswa Bogor Ditangkap Warga Siram Kencing ke Rumah Tetangga, Polisi Cari Unsur Pidana Polisi Selidiki Penemuan Mayat Wanita dengan Tangan Terikat di Depok Buruh Tolak RUU Kesehatan: Tidak Boleh Menteri Kelola Uang Rakyat Viral Ambulans di Lampung Cueki Korban Laka Lantas, Dinkes Klarifikasi" 
    # title_raw = ['Indentifikasi Bahaya dalam K3 (Keselamatan dan Kesehatan Kerja)', '9 Bunga yang Bisa Dimakan dan Memiliki Manfaat Kesehatan', 'Diskar Sumbawa Usul Ada Relawan dan Alat Damkar di Wilayah Sulit Terjangkau', 'Kabel Optik di Jatinegara Kebakaran, Api Sempat Merambat ke Pohon', 'Kebakaran Landa Pasar Caringin Bandung, Satu Orang Tewas', '9 Bunga yang Bisa Dimakan dan Memiliki Manfaat Kesehatan', 'RUU Perampasan Aset Izinkan Negara Rampas Harta Terdakwa Meninggal atau Buron', '9 Bunga yang Bisa Dimakan dan Memiliki Manfaat Kesehatan', '7 Khasiat Bunga Telang dan Efek Samping yang Patut Diwaspadai', '8 Manfaat Kafein untuk Kesehatan yang Potensial']
    title_raw = request.json["title"]
    print(type(title_raw))
    title_cleaned = clean_titles(title_raw)
    label_mapping = {'kebakaran': 0, 'polisi': 1, 'rumah sakit': 2}
    # print(title_cleaned)
    test_sequence = tokenizer.texts_to_sequences([title_cleaned])
    padded_test_sequence = pad_sequences(test_sequence, maxlen=4)
    prediction = model.predict(padded_test_sequence)[0]

    recommended_hobby_index = tf.argmax(prediction).numpy()
    recommended_hobby = [label for label, index in label_mapping.items() if index == recommended_hobby_index][0]
    return jsonify(
        result= recommended_hobby
    )

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        input = request.json["name"]
        return input
    else:
        return "Not login"
    
