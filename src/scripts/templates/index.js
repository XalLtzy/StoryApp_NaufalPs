const generateSubscribeButtonTemplate = () => `
  <style>
    #subscribe-button {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background-color: #4caf50;
      color: white;
      border: none;
      padding: 0.4rem 0.8rem;
      font-size: 0.85rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s ease;
      font-weight: 600;
      user-select: none;
      white-space: nowrap;
    }
    #subscribe-button:hover {
      background-color: #388e3c;
    }
    #subscribe-button .icon {
      font-size: 1.1rem;
      line-height: 1;
    }
  </style>

  <button id="subscribe-button" aria-label="Aktifkan Notifikasi">
    <span class="icon" aria-hidden="true">🔔</span>
    Subscribe
  </button>
`;

const generateUnsubscribeButtonTemplate = () => `
  <style>
    #unsubscribe-button {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background-color: #e53935;
      color: white;
      border: none;
      padding: 0.4rem 0.8rem;
      font-size: 0.85rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s ease;
      font-weight: 600;
      user-select: none;
      white-space: nowrap;
    }
    #unsubscribe-button:hover {
      background-color: #b71c1c;
    }
    #unsubscribe-button .icon {
      font-size: 1.1rem;
      line-height: 1;
    }
  </style>

  <button id="unsubscribe-button" aria-label="Nonaktifkan Notifikasi">
    <span class="icon" aria-hidden="true">🔕</span>
    Unsubscribe
  </button>
`;

export { generateSubscribeButtonTemplate, generateUnsubscribeButtonTemplate };
