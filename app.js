// ===== Helpers =====
const $ = (q, root=document) => root.querySelector(q);
const $$ = (q, root=document) => Array.from(root.querySelectorAll(q));
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

// ===== Theme Toggle =====
const themeToggle = $('#themeToggle');
const savedTheme = localStorage.getItem('theme');
if(savedTheme === 'light') document.documentElement.classList.add('light');
const setThemeIcon = () => themeToggle.textContent =
  document.documentElement.classList.contains('light') ? '☀️' : '🌙';
setThemeIcon();
themeToggle.addEventListener('click', ()=>{
  document.documentElement.classList.toggle('light');
  localStorage.setItem('theme',
    document.documentElement.classList.contains('light') ? 'light' : 'dark');
  setThemeIcon();
});

// ===== Copy Email =====
$('#copyEmail').addEventListener('click', async ()=>{
  try{
    await navigator.clipboard.writeText('abhirupn2004@gmail.com');
    const b = $('#copyEmail');
    const old = b.textContent; b.textContent = 'Copied! ✅';
    setTimeout(()=> b.textContent = old, 1200);
  }catch{
    alert('Copy failed. Email: abhirupn2004@gmail.com');
  }
});

// ===== Active nav via IntersectionObserver =====
const sections = ['about','skills','cp','projects','contact'];
const observer = new IntersectionObserver(entries => {
  entries.forEach(e=>{
    if(e.isIntersecting){
      $$('.nav a').forEach(a=>a.classList.remove('active'));
      const link = $(`.nav a[href="#${e.target.id}"]`);
      if(link) link.classList.add('active');
    }
  })
}, {rootMargin:'-40% 0px -55% 0px', threshold:0});
sections.forEach(id=>{
  const el = document.getElementById(id);
  if(el) observer.observe(el);
});

// ===== Skills =====
const skills = [
  { name:'C++', level:92 },
  { name:'HTML/CSS', level:92 },
  { name:'JavaScript', level:90 },
  { name:'Node + Express', level:88 },
  { name:'MongoDB', level:82 },
  { name:'Git & CI', level:85 },
  { name:'Design/UX', level:80 },
  { name:'C', level:85 },
];
const skillsGrid = $('#skillsGrid');
skills.forEach(s=>{
  const el = document.createElement('div');
  el.className = 'skill reveal';
  el.innerHTML = `<span>${s.name}</span><span style="min-width:48%;display:grid;gap:8px">
    <div class="meter"><span style="width:${clamp(s.level,0,100)}%"></span></div>
    <small class="muted">${s.level}%</small></span>`;
  skillsGrid.appendChild(el);
});

// ===== Projects =====
const projects = [
  {
    title:'StudyBuddy — Peer Learning',
    tags:['fullstack','node','design'],
    summary:'Matches students by subjects and timing, enabling quick study sprints and spaced-repetition reminders.',
    details:'StudyBuddy is a smart learning assistant platform designed to support students in their academic journey. It helps with planning study schedules, offering personalized content recommendations, tracking progress, and providing practice quizzes. The goal is to make learning more structured, adaptive, and engaging, helping students stay organized and improve performance.'
  }  
];

const filterSet = new Set(['all', ...projects.flatMap(p=>p.tags)]);
const filters = $('#filters');
let currentFilter = 'all';

const renderFilters = ()=>{
  filters.innerHTML = '';
  [...filterSet].forEach(tag=>{
    const b = document.createElement('button');
    b.className = 'filter' + (tag===currentFilter?' active':'');
    b.textContent = tag;
    b.addEventListener('click', ()=>{
      currentFilter = tag;
      renderFilters();
      renderProjects();
    });
    filters.appendChild(b);
  })
}

const projectGrid = $('#projectGrid');
const tagBadge = t => `<span class="tag">#${t}</span>`;

const openModal = (title, html)=>{
  $('#modalTitle').textContent = title;
  $('#modalBody').innerHTML = html;
  $('#modal').classList.add('open');
}
$('#modalClose').addEventListener('click', ()=> $('#modal').classList.remove('open'));
$('#modal').addEventListener('click', (e)=>{ if(e.target.id==='modal') $('#modal').classList.remove('open'); });

const renderProjects = ()=>{
  projectGrid.innerHTML = '';
  const list = projects.filter(p => currentFilter==='all' || p.tags.includes(currentFilter));
  list.forEach((p, i)=>{
    const card = document.createElement('article');
    card.className = 'proj reveal';
    card.innerHTML = `
      <div class="thumb">${p.title.split('—')[0]}</div>
      <div class="meta">
        <strong>${p.title}</strong>
        <p class="muted" style="margin:0">${p.summary}</p>
        <div class="tags">${p.tags.map(tagBadge).join('')}</div>
        <div class="actions">
          <button class="btn" data-idx="${i}">Details</button>
          <a class="btn ghost" href="#" onclick="alert('Coming Soon')">Live</a>
          <a class="btn ghost" href="https://github.com/Abhirup-261004/StudyBuddy" onclick="alert('StudyBuddy')">Code</a>
        </div>
      </div>`;
    projectGrid.appendChild(card);
    card.querySelector('button[data-idx]')?.addEventListener('click', (e)=>{
      const idx = +e.target.getAttribute('data-idx');
      const proj = projects[idx];
      openModal(proj.title, `<p>${proj.details}</p><p><strong>Stack:</strong> ${proj.tags.join(', ')}</p>`);
    })
  });

  // animate newly added cards
  $$('.reveal').forEach(el=>revealObs.observe(el));
}

renderFilters();
renderProjects();

// ===== Contact form (mailto fallback) =====
$('#contactForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  if(!data.name || !data.email || !data.message){
    $('#formStatus').textContent = 'Please fill out all fields.'; return;
  }
  const body = encodeURIComponent(`${data.message}\n\n— ${data.name} (${data.email})`);
  const mailto = `mailto:abhirupn2004@gmail.com?subject=${encodeURIComponent('Portfolio Inquiry')}&body=${body}`;
  window.location.href = mailto;
  $('#formStatus').textContent = 'Opening your email client…';
  e.target.reset();
});

// ===== Print to PDF =====
$('#printResume').addEventListener('click', ()=>{
  window.print();
});

// ===== Reveal on scroll =====
const revealObs = new IntersectionObserver(es=>{
  es.forEach(({isIntersecting, target})=>{
    if(isIntersecting){
      target.animate(
        [{opacity:0, transform:'translateY(12px)'}, {opacity:1, transform:'translateY(0)'}],
        {duration:500, easing:'cubic-bezier(.2,.6,.2,1)', fill:'forwards'}
      );
      revealObs.unobserve(target);
    }
  })
}, {threshold:.15});

// Footer year
$('#year').textContent = new Date().getFullYear();

// Accessibility: keyboard close
window.addEventListener('keydown', (e)=>{
  if(e.key==='Escape') $('#modal').classList.remove('open');
});
