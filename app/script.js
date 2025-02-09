const App = (() => {
  const API_URL =
    window.location.hostname === 'localhost'
      ? 'http://localhost:3000/api/bios'
      : 'https://ef15-45-230-42-93.ngrok-free.app/api/bios';

  let DOM = {};
  const domLoader = () => ({
    loader: document.getElementById('loader'),
    formSection: document.getElementById('form-section'),
    biosList: document.getElementById('bios-list'),
    searchBar: document.getElementById('search-bar'),
    searchInput: document.getElementById('searchInput'),
    bioForm: document.getElementById('bioForm'),
    fields: {
      name: document.getElementById('name'),
      area: document.getElementById('area'),
      digital: document.getElementById('digital'),
      bio: document.getElementById('bio'),
      socialX: document.getElementById('socialX'),
      socialInstagram: document.getElementById('socialInstagram'),
      socialLinkedin: document.getElementById('socialLinkedin'),
    },
  });
  
  const showLoader = () => (DOM.loader.style.display = 'flex');
  const hideLoader = () => (DOM.loader.style.display = 'none');

  const getKey = () => new URLSearchParams(window.location.search).get('k');

  const socialIcon = (name, icon, url) =>
    url
      ? `
        <a name="${name.toLowerCase()}" href="${url}" target="_blank" title="Perfil no ${name}">
          <img src="${icon}" alt="${name}" class="icon">
        </a>
      `
      : '';

  const loadBios = async () => {
    try {
      showLoader();
      DOM.searchBar.style.display = 'flex';

      const k = getKey();
      const response = await fetch(`${API_URL}?k=${k}`, {
        headers: { 'ngrok-skip-browser-warning': 'true' },
      });

      if (!response.ok) throw new Error('Erro ao carregar as bios.');

      const bios = await response.json();
      DOM.biosList.innerHTML = '';

      bios.forEach((bio) => {
        const bioCard = document.createElement('div');
        bioCard.classList.add('card');
        bioCard.innerHTML = `
          <div class="profile-image" style="background-image: url('${bio.profileImageUrl || generateAvatar()}');"></div>
          <div class="card-content">
            <h2 class="card-title">${bio.name}</h2>
            <span class="card-area">${bio.area || ''}</span>
            <span class="card-digital">${bio.digital || ''}</span>
            <p class="card-bio">${bio.bio}</p>
            <div class="card-links">
              ${socialIcon('X', 'https://cdn-icons-png.flaticon.com/512/733/733635.png', bio.x)}
              ${socialIcon('Instagram', 'https://cdn-icons-png.flaticon.com/512/2111/2111463.png', bio.instagram)}
              ${socialIcon('LinkedIn', 'https://cdn-icons-png.flaticon.com/512/174/174857.png', bio.linkedin)}
            </div>
          </div>
        `;
        DOM.biosList.appendChild(bioCard);
      });
    } catch (error) {
      console.error(error);
    } finally {
      hideLoader();
    }
  };

  const generateAvatar = () =>
    `https://avatar.iran.liara.run/public/${Math.floor(Math.random() * 100) + 1}`;

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const isValid = DOM.bioForm.checkValidity();
    if (!isValid) {
      alert('Por favor, preencha todos os campos corretamente.');
      return;
    }

    const userBio = {
      name: DOM.fields.name.value,
      area: DOM.fields.area.value,
      digital: DOM.fields.digital.value,
      bio: DOM.fields.bio.value,
      x: DOM.fields.socialX.value,
      instagram: DOM.fields.socialInstagram.value,
      linkedin: DOM.fields.socialLinkedin.value,
      k: getKey(),
    };

    try {
      showLoader();
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(userBio),
      });

      if (response.ok) {
        alert('Sua bio foi salva com sucesso!');
        localStorage.setItem('bioSubmitted', userBio.k);
        DOM.formSection.style.display = 'none';
        loadBios();
      } else {
        throw new Error('Erro ao salvar a bio.');
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar a bio. Tente novamente.');
    } finally {
      hideLoader();
    }
  };

  const filterBios = () => {
    const searchQuery = DOM.searchInput.value.toLowerCase();
    Array.from(DOM.biosList.getElementsByClassName('card')).forEach((bioCard) => {
      const name = bioCard.querySelector('.card-title').textContent.toLowerCase();
      const area = bioCard.querySelector('.card-area').textContent.toLowerCase();
      const digital = bioCard.querySelector('.card-digital').textContent.toLowerCase();
      const instagram = bioCard.querySelector('.card-links a[name="instagram"]')?.href.toLowerCase() || '';

      bioCard.style.display =
        name.includes(searchQuery) || area.includes(searchQuery) || digital.includes(searchQuery) || instagram.includes(searchQuery)
          ? 'block'
          : 'none';
    });
  };

  const init = () => {
    DOM = domLoader();
    const k = getKey();

    if (localStorage.getItem('bioSubmitted') === k) {
      DOM.formSection.style.display = 'none';
      loadBios();
    } else if (!k) {
      DOM.formSection.style.display = 'none';
      alert('Você precisa de uma chave para acessar: solicite ao administrador da turma.');
    } else {
      DOM.bioForm.addEventListener('submit', handleFormSubmit);
    }

    DOM.searchInput.addEventListener('input', filterBios);
  };

  return { init };
})();

document.addEventListener('DOMContentLoaded', App.init);
