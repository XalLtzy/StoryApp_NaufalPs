import SavedPresenter from './saved-presenter';

export default class SavedPage {
  async render() {
    return `
      <main class="saved-container">
        <h1 class="page-title">Story Tersimpan</h1>
        <div id="savedStories" class="story-list"></div>
      </main>
    `;
  }

  async afterRender() {
    const container = document.querySelector('#savedStories');
    const stories = await SavedPresenter.getSavedStories();

    if (stories.length === 0) {
      container.innerHTML = '<p>Belum ada story yang disimpan.</p>';
      return;
    }

    const html = stories.map((story) => `
      <article class="story-item">
        <img src="${story.photoUrl}" alt="Photo from ${story.name}" class="story-img" />
        <h2 class="story-title">${story.name}</h2>
        <p class="story-description">${story.description}</p>
        <time datetime="${story.createdAt}" class="story-date">
          ${new Date(story.createdAt).toLocaleString()}
        </time>
        <button class="delete-story-btn" data-id="${story.id}">🗑️ Hapus</button>
      </article>
    `).join('');

    container.innerHTML = html;

    document.querySelectorAll('.delete-story-btn').forEach((button) => {
      button.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        await SavedPresenter.deleteSavedStory(id);
        e.target.closest('.story-item').remove();
      });
    });
  }
}
