# Bal'ad — Dog-Sitting & Dog-Walking Service in Grenoble

Landing page for Bal'ad, a professional dog-sitting and dog-walking service based in Grenoble, France.

## About Bal'ad

Bal'ad offers enriching walking experiences for dogs using an eco-friendly cargo bike, combined with professional in-home pet care services. The service is designed with a deep understanding of canine behavior and well-being.

**Key Points:**
- ACACED certified dog caretaker with two dogs
- Focus on appeasement signals and respect for individual animal boundaries
- Eco-friendly cargo bike transportation for stress-free outings
- Serving Grenoble and surrounding areas (La Tronche, Saint-Martin-d'Hères)


**Availability:** Monday–Friday, 8am–12pm, 2pm–6pm  
**Weekend & Holiday Surcharge:** +€5 (+ short notice availability)

## Contact

📞 **Phone:** 06 xx xx xx xx  
📧 **Email:** balad.contact@gmail.com  
📱 **Instagram:** [@bal_ad_grenoble](https://instagram.com/bal_ad_grenoble)

**First Consultation:** Free meeting to discuss your dog's needs and sign the service agreement.

## Website Features

- Responsive landing page built with HTML5, CSS3, and vanilla JavaScript
- Hero section with service overview
- Detailed pricing table, with per-field labels on mobile
- FAQ section addressing common concerns
- Direct contact cards
- Photo gallery showcasing service activities
- Mobile-friendly navigation with accessible menu toggle
- Reservation form: send a booking request by email or download it as a PDF

## Reservation Form

Visitors can fill out a booking request (contact info, dog's name, service, dates, message) from the Contact section and either:

- **Send it by email** — submitted via [FormSubmit.co](https://formsubmit.co), a backend-free form relay service, to `balad.contact@gmail.com`. The destination address is set in a single constant (`RESERVATION_EMAIL`) at the top of `script.js`, ready to update once a professional email is set up. Note: FormSubmit requires a one-time confirmation click on the first real submission before it starts delivering messages.
- **Download it as a PDF** — generated client-side with [jsPDF](https://github.com/parallax/jsPDF), no server involved.

## Technical Details

- **Framework:** None (static HTML/CSS/JS)
- **Styling:** Custom CSS with responsive grid layout
- **Images:** WebP, optimized and resized locally
- **Forms/PDF:** FormSubmit.co (email relay) + jsPDF (client-side PDF export, loaded with a Subresource Integrity hash)
- **Deployment:** Static site hosted on GitHub Pages — https://latifie.github.io/balad-website/
- **SEO:** `robots.txt` and `sitemap.xml` included, absolute Open Graph/Schema.org image URLs
- **CI:** GitHub Actions workflow (`.github/workflows/checks.yml`) validates HTML and checks for broken links on every push/PR

## Browser Compatibility

Works on all modern browsers (Chrome, Firefox, Safari, Edge) and mobile devices.

## License

© 2026 Bal'ad Dog-Sitting Grenoble — All rights reserved.
