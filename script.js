// Toggle menu mobile
const toggleBtn = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

if (toggleBtn && navMenu) {
  toggleBtn.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('active');
    toggleBtn.setAttribute('aria-expanded', String(isOpen));
  });
}

// Formulaire de réservation : envoi par email (FormSubmit) et export PDF (jsPDF)
// TODO: remplacer par l'email professionnel une fois le nom de domaine choisi
const RESERVATION_EMAIL = 'balad.contact@gmail.com';

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

// Carte des zones desservies (Leaflet + OpenStreetMap)
const zoneMapEl = document.getElementById('zoneMap');

if (zoneMapEl && typeof L !== 'undefined') {
  const zones = {
    centre: {
      center: [45.1885, 5.7245],
      radius: 2200,
      color: '#D63E77',
      title: 'Grenoble centre — Domicile',
      detail: 'Hyper-centre, Île Verte, Championnet, Berriat, Caserne de Bonne.',
    },
    smh: {
      center: [45.1707, 5.7638],
      radius: 2200,
      color: '#2E4A3B',
      title: "Saint-Martin-d'Hères — Domicile",
      detail: 'Ensemble de la commune.',
    },
    echirolles: {
      center: [45.1650, 5.7133],
      radius: 2200,
      color: '#C98A3E',
      title: 'Échirolles — Domicile',
      detail: 'Ensemble de la commune.',
    },
    autres: {
      center: [45.1885, 5.7245],
      radius: 8000,
      color: '#1F241E',
      dashed: true,
      title: 'Autres secteurs — Sur devis',
      detail: 'Communes limitrophes de l\'agglomération grenobloise, selon la distance.',
    },
  };

  const map = L.map(zoneMapEl, { scrollWheelZoom: false }).setView([45.1885, 5.7245], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
  }).addTo(map);

  const circles = {};
  let domicileBounds = null;

  Object.entries(zones).forEach(([key, zone]) => {
    const circle = L.circle(zone.center, {
      radius: zone.radius,
      color: zone.color,
      weight: 2,
      dashArray: zone.dashed ? '6 6' : null,
      fillColor: zone.color,
      fillOpacity: zone.dashed ? 0.05 : 0.18,
    })
      .bindPopup(`<strong>${zone.title}</strong><br>${zone.detail}`)
      .addTo(map);
    circles[key] = circle;
    if (!zone.dashed) {
      domicileBounds = domicileBounds ? domicileBounds.extend(circle.getBounds()) : circle.getBounds();
    }
  });

  if (domicileBounds) map.fitBounds(domicileBounds, { padding: [24, 24] });

  // Le grand cercle "Autres secteurs" doit rester derrière les autres, sinon
  // il capte tous les clics de la carte puisqu'il les recouvre entièrement.
  if (circles.autres) circles.autres.bringToBack();

  document.querySelectorAll('.zone-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const zone = zones[btn.dataset.zone];
      const circle = circles[btn.dataset.zone];
      if (!zone || !circle) return;

      document.querySelectorAll('.zone-item').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      map.flyTo(zone.center, zone.dashed ? 11 : 13, { duration: 0.6 });
      circle.openPopup();
    });
  });
}
