import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import { generateSubscribeButtonTemplate, generateUnsubscribeButtonTemplate } from '../templates';
import { isServiceWorkerAvailable } from '../utils';
import { isCurrentPushSubscriptionAvailable } from '../utils/notification-helper';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  currentPage = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this._setupDrawer();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  async #setupPushNotification() {
    const pushNotificationTools = document.getElementById('push-notification-tools');
    if (!pushNotificationTools) return;
    
    const isSubscribed = await isCurrentPushSubscriptionAvailable();
    
if (isSubscribed) {
  pushNotificationTools.innerHTML = generateUnsubscribeButtonTemplate();

  document.getElementById('unsubscribe-button').addEventListener('click', () => {
    import('../utils/notification-helper').then(({ unsubscribe }) => {
      unsubscribe().finally(() => {
        this.#setupPushNotification();
      });
    });
    
  });

  return;
}

pushNotificationTools.innerHTML = generateSubscribeButtonTemplate();
document.getElementById('subscribe-button').addEventListener('click', () => {
  import('../utils/notification-helper').then(({ subscribe }) => {
    subscribe().finally(() => {
      this.#setupPushNotification();
    });
  });
});
  }

  async renderPage() {
    if (this.currentPage?.destroy) {
      await this.currentPage.destroy();
    }

    const url = getActiveRoute();
    const page = routes[url];
    const isAuthenticated = localStorage.getItem('authToken');

    if (!isAuthenticated && url !== '/login' && url !== '/register') {
      window.location.hash = '/login';
      return;
    }

    const isAuthPage = url === '/login' || url === '/register';

    if (isAuthPage) {
      this.#drawerButton.style.display = 'none';
      this.#navigationDrawer.style.display = 'none';
    } else {
      this.#drawerButton.style.display = 'inline-block';
      this.#navigationDrawer.style.display = 'block';
    }

    if (document.startViewTransition) {
      await document.startViewTransition(async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
      });
    } else {
      this.#content.classList.remove('show');
      await new Promise((resolve) => setTimeout(resolve, 50));
      this.#content.innerHTML = await page.render();
      this.#content.classList.add('show');
      await page.afterRender();
    }

    this.currentPage = page;

    const logoutBtn = document.querySelector('#logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('authToken');
        window.location.hash = '/login';
      });
    }

    if (isServiceWorkerAvailable()) {
      this.#setupPushNotification();
    }
  }
}

export default App;
