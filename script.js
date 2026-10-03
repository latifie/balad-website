// Toggle menu mobile
const toggleBtn = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

if (toggleBtn && navMenu) {
  toggleBtn.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('active');
    toggleBtn.setAttribute('aria-expanded', String(isOpen));
  });

  // Fermer le menu quand on clique sur un lien
  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

// Formulaire de réservation : envoi par email (FormSubmit) et export PDF (jsPDF)
// TODO: remplacer par l'email professionnel une fois le nom de domaine choisi
const RESERVATION_EMAIL = 'contact@balad-grenoble.fr';

// Empêche de choisir une date de fin antérieure à la date de début
const dateStartInput = document.getElementById('dateStart');
const dateEndInput = document.getElementById('dateEnd');

if (dateStartInput && dateEndInput) {
  dateStartInput.addEventListener('change', () => {
    dateEndInput.min = dateStartInput.value;
    if (dateEndInput.value && dateEndInput.value < dateStartInput.value) {
      dateEndInput.value = dateStartInput.value;
    }
  });
}

const reservationForm = document.getElementById('reservationForm');
const formStatus = document.getElementById('formStatus');
const btnDownloadPdf = document.getElementById('btnDownloadPdf');

function formatDate(isoDate) {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

function getReservationData(form) {
  return {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    telephone: form.telephone.value.trim(),
    chien: form.chien.value.trim(),
    prestation: form.prestation.value,
    dateDebut: formatDate(form.dateDebut.value),
    dateFin: formatDate(form.dateFin.value),
    message: form.message.value.trim(),
  };
}

function setFormStatus(kind, text) {
  formStatus.textContent = text;
  formStatus.classList.remove('success', 'error');
  if (kind) formStatus.classList.add(kind);
}

if (reservationForm) {
  reservationForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!reservationForm.checkValidity()) {
      reservationForm.reportValidity();
      return;
    }

    const submitBtn = document.getElementById('btnSendEmail');
    const originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours...';
    setFormStatus(null, '');

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${RESERVATION_EMAIL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(reservationForm))),
      });

      if (!response.ok) throw new Error('Réponse invalide du serveur');

      setFormStatus('success', 'Votre demande a bien été envoyée, merci ! Je reviens vers vous rapidement.');
      reservationForm.reset();
    } catch (err) {
      setFormStatus('error', "L'envoi a échoué. Vous pouvez réessayer ou me contacter directement par téléphone/mail.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });
}

if (btnDownloadPdf) {
  btnDownloadPdf.addEventListener('click', () => {
    if (!reservationForm.checkValidity()) {
      reservationForm.reportValidity();
      return;
    }

    const data = getReservationData(reservationForm);
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Bal'ad — Demande de réservation", 14, 20);
    doc.setFontSize(11);

    const rows = [
      ['Nom et prénom', data.name],
      ['Email', data.email],
      ['Téléphone', data.telephone || '—'],
      ['Nom du chien', data.chien],
      ['Prestation souhaitée', data.prestation],
      ['Dates souhaitées', `Du ${data.dateDebut} au ${data.dateFin}`],
      ['Message', data.message || '—'],
    ];

    let y = 35;
    rows.forEach(([label, value]) => {
      doc.setFont(undefined, 'bold');
      doc.text(`${label} :`, 14, y);
      doc.setFont(undefined, 'normal');
      const wrapped = doc.splitTextToSize(value, 120);
      doc.text(wrapped, 70, y);
      y += 8 * Math.max(1, wrapped.length);
    });

    doc.save('bal-ad-demande-reservation.pdf');
  });
}

// Carte de la zone couverte et point de rendez-vous (Leaflet + OpenStreetMap)
const zoneMapEl = document.getElementById('zoneMap');

if (zoneMapEl && typeof L !== 'undefined') {
  // Coordonnées de Mana Café : 21 Rue Saint-Jacques, 38000 Grenoble
  const MANA_CAFE_COORDS = [45.19055, 5.7271];
  const GRENOBLE_CENTER = [45.1885, 5.7245];

  const map = L.map(zoneMapEl, { scrollWheelZoom: false }).setView(MANA_CAFE_COORDS, 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
  }).addTo(map);

  // Zone d'intervention unique (Grenoble et environs proches : rayon ~3.5 km)
  const coverageCircle = L.circle(GRENOBLE_CENTER, {
    radius: 3500,
    color: '#2E4A3B',
    weight: 2,
    fillColor: '#2E4A3B',
    fillOpacity: 0.15,
  })
    .bindPopup("<strong>🚴 Zone d'intervention Bal'ad</strong><br>Grenoble et ses environs proches")
    .addTo(map);

  // Marqueur repère pour Mana Café
  const manaMarker = L.marker(MANA_CAFE_COORDS)
    .bindPopup('<strong>📍 Mana Café — Point de RDV</strong><br>21 Rue Saint-Jacques, 38000 Grenoble<br><em>Lieu de dépôt et de récupération des chiens.</em>')
    .addTo(map);

  // Ouvrir automatiquement le popup du Mana Café
  manaMarker.openPopup();

  document.querySelectorAll('.zone-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.zone-item').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      if (btn.dataset.zone === 'mana') {
        map.flyTo(MANA_CAFE_COORDS, 15, { duration: 0.6 });
        manaMarker.openPopup();
      } else {
        map.flyTo(GRENOBLE_CENTER, 13, { duration: 0.6 });
        coverageCircle.openPopup();
      }
    });
  });
}
