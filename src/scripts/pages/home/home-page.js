import HomePresenter from './home-presenter';
import IdbHelper from '../../utils/idb-helper';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default class HomePage {
  async render() {
    return `
      <main id="main-content" class="home-container" tabindex="-1" role="main">
        <header class="page-header">
          <button id="savePageBtn" class="save-page-btn" aria-label="Simpan Halaman">
            💾 Save Page
          </button>
          <h1 class="page-title">Berbagi Cerita</h1>
          <!-- Kalau ada button subs bisa tetap di sini -->
        </header>
        <div id="map" class="map-container" aria-label="Story locations map" role="region"></div>
        <div id="storyList" class="story-list"></div>
      </main>
    `;
  }

  async afterRender() {
    const storyContainer = document.querySelector('#storyList');
    const mapContainer = document.querySelector('#map');
    const savePageBtn = document.querySelector('#savePageBtn');

    const renderStories = (stories) => {
      if (!stories || stories.length === 0) {
        storyContainer.innerHTML = '<p>Tidak ada story.</p>';
        return;
      }

      const storyHtml = stories.map((story) => {
        const photoSrc = story.photo || story.photoUrl || 'default.jpg';
        return `
          <article class="story-item">
            <img src="${photoSrc}" alt="Photo from ${story.name}" class="story-img" />
            <h2 class="story-title">${story.name}</h2>
            <p class="story-description">${story.description}</p>
            <time datetime="${story.createdAt}" class="story-date">
              ${new Date(story.createdAt).toLocaleString()}
            </time>
            <button class="save-story-btn" data-id="${story.id}" aria-label="Tambahkan cerita ${story.name} ke favorit">
              💾 Tambahkan ke Favorit
            </button>
          </article>
        `;
      }).join('');
      storyContainer.innerHTML = storyHtml;

      // Event listener tombol favorit
      document.querySelectorAll('.save-story-btn').forEach((button) => {
        button.addEventListener('click', async (e) => {
          const id = e.target.dataset.id;
          const story = stories.find((s) => s.id === id);
          if (story) {
            await IdbHelper.putStory(story);
            alert(`Story "${story.name}" berhasil disimpan ke Favorit!`);
          }
        });
      });
    };

    const renderMap = (stories) => {
      const map = L.map(mapContainer).setView([-2.5, 118], 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      stories.forEach((story) => {
        if (story.lat && story.lon) {
          L.marker([story.lat, story.lon])
            .addTo(map)
            .bindPopup(`<strong>${story.name}</strong><br>${story.description}`);
        }
      });
    };

    try {
      const result = await HomePresenter.getStories();
      if (result.error) {
        throw new Error(result.message);
      }

      const stories = result.listStory;
      renderStories(stories);
      renderMap(stories);

      // Save Page button action contoh sederhana
      savePageBtn.addEventListener('click', () => {
        alert('Fungsi Save Page belum diimplementasikan');
      });

    } catch (error) {
      const offlineStories = await IdbHelper.getAllStories();
      storyContainer.innerHTML = `<p>Menampilkan data offline karena terjadi kesalahan: ${error.message}</p>`;
      renderStories(offlineStories);
      renderMap(offlineStories);
    }
  }
}
