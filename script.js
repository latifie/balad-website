// Toggle menu mobile
const toggleBtn = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

if (toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active');
  });
}

// Validation et envoi du formulaire (feedback utilisateur)
const form = document.querySelector('.contact-form');
if (form) {
  form.addEventListener('submit', (e) => {
    const submitBtn = form.querySelector('.btn-submit');
    submitBtn.innerText = 'Envoi en cours...';
    submitBtn.disabled = true;
  });
}