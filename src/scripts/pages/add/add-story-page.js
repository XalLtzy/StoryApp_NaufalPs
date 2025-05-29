import AddStoryPresenter from './add-story-presenter';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default class AddStoryPage {
  constructor() {
    this.stream = null;
    this.videoElement = null;
    this.map = null;
    this.marker = null;
  }

  async render() {
    return `
      <main id="main-content" tabindex="-1">
        <section class="container add-story-container" role="form" aria-labelledby="addStoryFormTitle">
          <h1 id="addStoryFormTitle">Tambah Story Baru</h1>
          <form id="addStoryForm" class="story-form" aria-describedby="formInstructions">
            <p id="formInstructions" class="visually-hidden">Isi deskripsi cerita Anda, pilih lokasi di peta, dan ambil atau unggah foto untuk melengkapi cerita.</p>

            <div class="form-group">
              <label for="description">Deskripsi:</label>
              <textarea id="description" name="description" required placeholder="Deskripsikan cerita Anda..." aria-required="true"></textarea>
            </div>

            <div class="form-group">
              <label>Ambil Foto dengan Kamera atau Unggah File:</label>
              <video id="video" autoplay playsinline style="width: 100%; max-height: 200px; border: 1px solid #ccc;" aria-live="polite" aria-label="Video untuk ambil foto"></video>
              <button type="button" id="startCamera" aria-label="Buka kamera untuk ambil foto">Buka Kamera</button>
              <button type="button" id="stopCamera" style="display: none;" aria-label="Tutup kamera" aria-disabled="true">Tutup Kamera</button>
              <button type="button" id="capture" disabled aria-label="Ambil foto" aria-disabled="true">Ambil Foto</button>

              <input type="file" id="photoFile" accept="image/*" aria-label="Unggah gambar dari perangkat" />

              <canvas id="canvas" style="display: none;"></canvas>
              <input type="hidden" id="photoData" name="photoData" />
              <img id="capturedImage" style="display: none; max-width: 100%; margin-top: 10px;" alt="Foto yang diambil atau diunggah" />
            </div>

            <div class="form-group">
              <label>Lokasi:</label>
              <div id="map" class="leaflet-map" style="height: 300px;" role="application" aria-label="Peta lokasi cerita Anda"></div>
              <input type="hidden" id="lat" name="lat" />
              <input type="hidden" id="lon" name="lon" />
            </div>

            <button type="submit" id="submitBtn" class="submit-btn" aria-label="Tambah story baru">
              <span id="submitText">Tambah Story</span>
              <span id="submitLoading" style="display: none; margin-left: 8px;">⏳</span>
            </button>
          </form>
          <p id="formMessage" class="form-message" role="alert"></p>
        </section>
      </main>
    `;
  }

  async afterRender() {
    const form = document.querySelector('#addStoryForm');
    const messageElement = document.querySelector('#formMessage');
    const submitBtn = document.querySelector('#submitBtn');
    const submitText = document.querySelector('#submitText');
    const submitLoading = document.querySelector('#submitLoading');

    const mapElement = document.getElementById('map');
    if (!mapElement) {
      console.error('Element #map tidak ditemukan. Peta tidak dapat dibuat.');
      return; 
    }

    const defaultLatLng = [-6.2, 106.8];
    const defaultZoom = 12;

    this.map = L.map('map').setView(defaultLatLng, 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        this.map.setView([lat, lon], defaultZoom);
        this.marker = L.marker([lat, lon]).addTo(this.map).bindPopup('Lokasi Anda').openPopup();

        document.querySelector('#lat').value = lat;
        document.querySelector('#lon').value = lon;
      },
      (err) => {
        console.warn('Gagal mendapatkan lokasi, gunakan default:', err.message);
        this.map.setView(defaultLatLng, 5);
      }
    );

    this.map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      document.querySelector('#lat').value = lat;
      document.querySelector('#lon').value = lng;

      if (this.marker) this.map.removeLayer(this.marker);
      this.marker = L.marker([lat, lng]).addTo(this.map).bindPopup('Lokasi dipilih').openPopup();
    });

    // Kamera & File Upload
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const captureButton = document.getElementById('capture');
    const startCameraButton = document.getElementById('startCamera');
    const stopCameraButton = document.getElementById('stopCamera');
    const capturedImage = document.getElementById('capturedImage');
    const photoDataInput = document.getElementById('photoData');
    const photoFileInput = document.getElementById('photoFile');

    this.videoElement = video;

    startCameraButton.addEventListener('click', async () => {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = this.stream;
        startCameraButton.style.display = 'none';
        stopCameraButton.style.display = 'inline-block';
        captureButton.disabled = false;
      } catch (err) {
        console.error('Gagal mengakses kamera:', err);
        alert('Tidak bisa membuka kamera. Pastikan izin kamera diaktifkan.');
      }
    });

    stopCameraButton.addEventListener('click', () => {
      this.stopCamera();
      startCameraButton.style.display = 'inline-block';
      stopCameraButton.style.display = 'none';
      captureButton.disabled = true;
    });

    captureButton.addEventListener('click', () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      photoDataInput.value = dataUrl;

      capturedImage.style.display = 'block';
      capturedImage.src = dataUrl;

      this.stopCamera();

      captureButton.disabled = true;
      captureButton.textContent = 'Foto Diambil';
    });

    photoFileInput.addEventListener('change', () => {
      const file = photoFileInput.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        photoDataInput.value = dataUrl;

        capturedImage.style.display = 'block';
        capturedImage.src = dataUrl;

        captureButton.disabled = true;
        captureButton.textContent = 'Foto Diunggah';
      };
      reader.readAsDataURL(file);
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      submitBtn.disabled = true;
      submitText.textContent = 'Menambahkan...';
      submitLoading.style.display = 'inline-block';

      const formData = new FormData(form);
      const result = await AddStoryPresenter.submitStory(formData);

      submitBtn.disabled = false;
      submitText.textContent = 'Tambah Story';
      submitLoading.style.display = 'none';

      if (result.error) {
        messageElement.textContent = `❌ ${result.message}`;
        messageElement.style.color = 'red';
      } else {
        messageElement.textContent = `✅ ${result.message}`;
        messageElement.style.color = 'white';
        form.reset();
        if (this.marker) this.map.removeLayer(this.marker);
        capturedImage.style.display = 'none';
        captureButton.disabled = true;
        captureButton.textContent = 'Ambil Foto';
        photoFileInput.value = '';
      }
    });
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      if (this.videoElement) {
        this.videoElement.srcObject = null;
      }
      this.stream = null;
    }
  }

  destroy() {
    this.stopCamera();
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}
