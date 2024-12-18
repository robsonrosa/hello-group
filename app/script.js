document.addEventListener('DOMContentLoaded', function() {
  const formSection = document.getElementById('form-section');
  const biosList = document.getElementById('bios-list');
  
  if (localStorage.getItem('bioSubmitted')) {
    formSection.style.display = 'none';
    loadBios(); 
  } else if (!getey()) {
    formSection.style.display = 'none';
    alert('Você precisa de uma chave para acessar: solicite ao administrador da turma.')
  } else {
    
    document.getElementById('bioForm').addEventListener('submit', async function(event) {
      event.preventDefault();
      const k = getey(); 
      const name = document.getElementById('name').value;
      const bio = document.getElementById('bio').value;
      const x = document.getElementById('socialX').value;
      const instagram = document.getElementById('socialInstagram').value;
      const linkedin = document.getElementById('socialLinkedin').value;
      
      const userBio = { name, bio, x, instagram, linkedin, k };

      try {
        
        const response = await fetch('http://localhost:3000/api/bios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userBio),
        });

        if (response.ok) {
          alert('Sua bio foi salva com sucesso!');
          localStorage.setItem('bioSubmitted', 'true'); 
          formSection.style.display = 'none';
          loadBios(); 
        } else {
          alert('Erro ao salvar a bio. Tente novamente.');
        }
      } catch (error) {
        console.error('Erro ao enviar os dados:', error);
        alert('Erro ao salvar a bio. Tente novamente.');
      }
    });
  }

  function getey() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('k'); 
  }

  function socialIcon(name, icon, url) {
    if (!url || url === '') {
      return '';
    }
    
    return `
      <a href="${url}" target="_blank" title="Perfil no ${name}">
        <img src="${icon}" alt="${name}" class="icon">
      </a>
    `;
  }

  async function loadBios() {
    try {
      const k = getey();
      const response = await fetch(`http://localhost:3000/api/bios?k=${k}`);
      const bios = await response.json();
      biosList.innerHTML = ''; 

      console.log(bios)
      bios.forEach(bio => {
        const bioCard = document.createElement('div');
        bioCard.classList.add('card');
        bioCard.innerHTML = `
          <div class="profile-image" style="background-image: url('${bio.profileImageUrl}');"></div>
          <div class="card-content">
            <h2 class="card-title">${bio.name}</h2>
            <p class="card-bio">${bio.bio}</p>
            <div class="card-links">
              ${socialIcon('X', 'https://cdn-icons-png.flaticon.com/512/733/733635.png', bio.x)}
              ${socialIcon('Instagram', 'https://cdn-icons-png.flaticon.com/512/2111/2111463.png', bio.instagram)}
              ${socialIcon('LinkedIn', 'https://cdn-icons-png.flaticon.com/512/174/174857.png', bio.linkedin)}
            </div>
          </div>
        `;
        biosList.appendChild(bioCard);
      });
    } catch (error) {
      console.error('Erro ao carregar as bios:', error);
    }
  }
});
