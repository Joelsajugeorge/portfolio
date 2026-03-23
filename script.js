// ============================================================
// SUPABASE CREDENTIALS
// ============================================================
const SB_URL = 'https://cnscasydoxrrakslsdly.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuc2Nhc3lkb3hycmFrc2xzZGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwOTg1MTksImV4cCI6MjA4NzY3NDUxOX0.WzguCiIEn54uyXwFbk6j8uRTGdMch0Ev0ShNGY6k2qA';

// ── PROGRESS BAR ──
const prog = document.getElementById('progress');
window.addEventListener('scroll', () => {
  prog.style.width = (window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100) + '%';
});

// ── SKILL BARS (animate on scroll into view) ──
const obs = new IntersectionObserver(entries => {
  entries.forEach(x => {
    if (x.isIntersecting) x.target.style.animationPlayState = 'running';
  });
}, { threshold: 0.1 });

document.querySelectorAll('.skill-bar').forEach(bar => {
  bar.style.animationPlayState = 'paused';
  obs.observe(bar);
});

// ── PDF CERTIFICATES ──
// Files must be in the same folder as index.html (or update paths below)
const pdfURLs = [
  'html.pdf',
  'css.pdf',
  'FRONTEND.pdf',
  'digital.pdf',
  'aws.pdf',
  'js.pdf',
  'git.pdf',
  'nodejs.pdf'
];

const certNames = [
  'HTML Essentials',
  'CSS Styling & Design',
  'Front-End Web Developer',
  'Digital Engineering Languages',
  'AWS Cloud Practitioner',
  'JavaScript Essentials',
  'Git & Version Control',
  'Node.js Fundamentals'
];

// Event delegation — one listener handles all cert view buttons
document.querySelector('.certs-grid').addEventListener('click', function (e) {
  const btn = e.target.closest('button[data-action="view"]');
  if (!btn) return;
  openPdf(parseInt(btn.dataset.idx));
});

function openPdf(idx) {
  document.getElementById('pdfModalTitle').textContent = '⬡ ' + certNames[idx].toUpperCase();
  document.getElementById('pdfModal').classList.add('open');
  document.getElementById('pdfFrame').src = pdfURLs[idx];
}

function closePdf() {
  document.getElementById('pdfModal').classList.remove('open');
  document.getElementById('pdfFrame').src = '';
}

// Close modal by clicking backdrop or close button
document.getElementById('pdfModal').addEventListener('click', function (e) {
  if (e.target === this) closePdf();
});
document.querySelector('.pdf-close').addEventListener('click', closePdf);

// ── CONTACT FORM → SUPABASE ──
async function sendPing() {
  const name  = document.getElementById('pName').value.trim();
  const email = document.getElementById('pEmail').value.trim();
  const msg   = document.getElementById('pMsg').value.trim();
  const err   = document.getElementById('pingErr');
  const btn   = document.getElementById('pingBtn');
  const btext = document.getElementById('pingBtnText');
  const spin  = document.getElementById('pingSpinner');

  err.style.display = 'none';
  ['pName', 'pEmail', 'pMsg'].forEach(id => document.getElementById(id).classList.remove('err'));

  // Validate
  const errors = [];
  if (!name)  { errors.push('Name required.');         document.getElementById('pName').classList.add('err'); }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Valid email required.');
    document.getElementById('pEmail').classList.add('err');
  }
  if (!msg)   { errors.push('Message required.');      document.getElementById('pMsg').classList.add('err'); }
  if (errors.length) { err.textContent = '⚠ ' + errors.join(' '); err.style.display = 'block'; return; }

  // Loading state
  btn.setAttribute('disabled', '');
  btext.style.display = 'none';
  spin.style.display  = 'block';

  try {
    const res = await fetch(`${SB_URL}/rest/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SB_KEY,
        'Authorization': `Bearer ${SB_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ name, email, message: msg })
    });

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.message || `HTTP ${res.status}`);
    }

    // Success
    document.getElementById('pingForm').style.display = 'none';
    document.getElementById('pingSuccess').classList.add('show');
    document.getElementById('pingTs').textContent =
      '⬡ Saved at ' + new Date().toLocaleTimeString() + ' · ' + new Date().toLocaleDateString();

  } catch (e) {
    err.innerHTML =
      '⚠ ' + e.message +
      '<br><span style="opacity:.6;font-size:.9em">Check your Supabase URL, anon key and that the table is named <code style="color:var(--neon4)">messages</code>.</span>';
    err.style.display = 'block';
    btn.removeAttribute('disabled');
    btext.style.display = '';
    spin.style.display  = 'none';
  }
}

function resetPing() {
  ['pName', 'pEmail', 'pMsg'].forEach(id => {
    document.getElementById(id).value = '';
    document.getElementById(id).classList.remove('err');
  });
  document.getElementById('pingErr').style.display    = 'none';
  document.getElementById('pingSuccess').classList.remove('show');
  document.getElementById('pingForm').style.display   = 'block';
  document.getElementById('pingBtn').removeAttribute('disabled');
  document.getElementById('pingBtnText').style.display = '';
  document.getElementById('pingSpinner').style.display = 'none';
}
