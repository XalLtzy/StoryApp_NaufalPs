import AboutPresenter from './about-presenter';

export default class AboutPage {
  async render() {
    return `
    <main id="main-content" tabindex="-1">
      <section class="container about-container" role="document" aria-labelledby="aboutPageTitle">
        <h1 id="aboutPageTitle">Tentang StoryApp</h1>
        <p>StoryApp adalah platform yang memungkinkan pengguna untuk berbagi cerita dan pengalaman mereka, sambil berbagi lokasi-lokasi menarik di sekitar mereka. Kami berusaha menciptakan ruang yang menghubungkan orang-orang melalui cerita dan pengalaman yang inspiratif.</p>

        <section class="about-info">
          <h2>Visi StoryApp</h2>
          <p>Visi kami adalah menciptakan sebuah komunitas yang berbagi cerita melalui lokasi yang mereka kunjungi, memberikan perspektif baru tentang dunia dan bagaimana kita berinteraksi dengan lingkungan sekitar kita.</p>
        </section>

        <section class="about-contact">
          <h2>Hubungi Saya</h2>
          <p>Untuk pertanyaan lebih lanjut atau untuk berbicara langsung dengan saya, Anda bisa menghubungi saya melalui:</p>
          <ul>
            <li><strong>WhatsApp:</strong> <a href="https://wa.me/6289513149721" aria-label="Hubungi saya melalui WhatsApp">Klik di sini untuk mengirim pesan</a></li>
            <li><strong>Instagram:</strong> <a href="https://instagram.com/naufalpratistas" aria-label="Kunjungi Instagram saya">@naufalpratistas</a></li>
          </ul>
        </section>
      </section>
    </main>
    `;
  }

  async afterRender() {
    AboutPresenter.init();
  }
}
