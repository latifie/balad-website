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

const reservationForm = document.getElementById('reservationForm');
const formStatus = document.getElementById('formStatus');
const btnDownloadPdf = document.getElementById('btnDownloadPdf');

function getReservationData(form) {
  return {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    telephone: form.telephone.value.trim(),
    chien: form.chien.value.trim(),
    prestation: form.prestation.value,
    dates: form.dates.value.trim(),
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
      ['Dates souhaitées', data.dates],
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
