const P = [
  {id:1, n:'Choco Coffee', p:4.5, i:'p1.jpg', d:'Espresso with rich dark chocolate', c:'coffee'},
  {id:2, n:'Espresso', p:3.0, i:'p2.jpg', d:'Strong and short, single shot', c:'coffee'},
  {id:3, n:'Caffe Americano', p:3.5, i:'p3.jpg', d:'Espresso with hot water', c:'coffee'},
  {id:4, n:'Caffe Latte', p:4.2, i:'p4.jpg', d:'Espresso with steamed milk and foam', c:'coffee'},
  {id:5, n:'Caffe Mocha', p:4.8, i:'p5.jpg', d:'Espresso, chocolate and milk', c:'coffee'},
  {id:6, n:'Caramel Macchiato', p:5.2, i:'p6.jpg', d:'Vanilla, milk, espresso and caramel', c:'coffee'},
  {id:7, n:'Sandwich', p:6.5, i:'p7.jpg', d:'Toasted bread with cheese and greens', c:'food'},
  {id:8, n:'Tea', p:2.5, i:'p8.jpg', d:'Black tea, served hot', c:'food'},
  {id:9, n:'Green Tea', p:3.0, i:'p9.jpg', d:'Light and fresh green tea', c:'food'},
  {id:10, n:'Matcha', p:4.5, i:'p10.jpg', d:'Iced matcha with milk', c:'food'},
  {id:11, n:'Pancake', p:6.0, i:'p11.jpg', d:'Pancakes with strawberries and syrup', c:'food'},
  {id:12, n:'Cupcake', p:3.5, i:'p12.jpg', d:'Vanilla cupcake with cream', c:'food'}
];
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

let cart = {};
try { cart = JSON.parse(localStorage.getItem('sweetcafe_cart')) || {}; } catch (e) {}

P.forEach(x => $('#' + x.c).insertAdjacentHTML('beforeend',
  `<article class="card" data-name="${x.n.toLowerCase()}">
    <img src="img/${x.i}" alt="${x.n}">
    <h3>${x.n}</h3><span class="pr">$${x.p.toFixed(2)}</span>
    <button data-add="${x.id}">Add to cart</button>
  </article>`));

function render() {
  let n = 0, t = 0;
  const ids = Object.keys(cart);
  $('#items').innerHTML = ids.length ? ids.map(id => {
    const x = P.find(p => p.id == id), q = cart[id];
    n += q; t += q * x.p;
    return `<li><img src="img/${x.i}" alt="">
      <div><b>${x.n}</b><small>${x.d}</small>
        <div class="q"><button data-q="${id}" data-d="-1" aria-label="Less">&minus;</button><span>${q}</span><button data-q="${id}" data-d="1" aria-label="More">+</button></div>
      </div>
      <div class="r"><b>$${(q * x.p).toFixed(2)}</b><button data-rm="${id}" aria-label="Remove">&#10005;</button></div></li>`;
  }).join('') : '<li class="empty">Your cart is empty. Add a drink to start.</li>';
  $('#count').textContent = n;
  $('#count').hidden = !n;
  $('#total').textContent = '$' + t.toFixed(2);
  try { localStorage.setItem('sweetcafe_cart', JSON.stringify(cart)); } catch (e) {}
}

let tt;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg; el.classList.add('show');
  clearTimeout(tt); tt = setTimeout(() => el.classList.remove('show'), 1800);
}

document.addEventListener('click', e => {
  const a = e.target.closest('[data-add]');
  if (a) {
    const x = P.find(p => p.id == a.dataset.add);
    cart[x.id] = (cart[x.id] || 0) + 1;
    fly(a); render(); toast(x.n + ' added to cart');
    const c = $('#count'); c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
    return;
  }
  const q = e.target.closest('[data-q]');
  if (q) {
    cart[q.dataset.q] += +q.dataset.d;
    if (cart[q.dataset.q] < 1) delete cart[q.dataset.q];
    render(); return;
  }
  const r = e.target.closest('[data-rm]');
  if (r) { delete cart[r.dataset.rm]; render(); }
});

const toggle = open => document.body.classList.toggle('open', open);
$('#cartBtn').onclick = () => toggle(true);
$('#close').onclick = $('#shade').onclick = () => toggle(false);
document.addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });
$('#buy').onclick = () => {
  if (!Object.keys(cart).length) return toast('Your cart is empty');
  cart = {}; render(); toggle(false); toast('Order placed. Thank you!');
};

// Hero slider
const slides = $$('.slide');
$('.dots').innerHTML = slides.map((_, i) => `<i${i ? '' : ' class="on"'}></i>`).join('');
const dots = $$('.dots i');
let s = 0, timer;
function go(i) {
  s = (i + slides.length) % slides.length;
  slides.forEach((el, j) => el.classList.toggle('on', j === s));
  dots.forEach((el, j) => el.classList.toggle('on', j === s));
}
const auto = () => { clearInterval(timer); timer = setInterval(() => go(s + 1), 5000); };
dots.forEach((d, i) => d.onclick = () => { go(i); auto(); });
auto();

// Feedback scroll: arrows, dots, autoplay
const fb = $('#fb'), cards = [...fb.children], fd = $('#fbDots');
fd.innerHTML = cards.map(() => '<i></i>').join('');
const step = () => cards[0].offsetWidth + 19;
const atEnd = () => fb.scrollLeft + fb.clientWidth >= fb.scrollWidth - 4;
const mark = () => {
  const i = atEnd() ? cards.length - 1 : Math.round(fb.scrollLeft / step());
  [...fd.children].forEach((d, j) => d.classList.toggle('on', j === i));
};
const slide = d => (d > 0 && atEnd()) ? fb.scrollTo({left: 0, behavior: 'smooth'}) : fb.scrollBy({left: d * step(), behavior: 'smooth'});
$('#prev').onclick = () => slide(-1);
$('#next').onclick = () => slide(1);
[...fd.children].forEach((d, i) => d.onclick = () => fb.scrollTo({left: i * step(), behavior: 'smooth'}));
fb.onscroll = mark; mark();
let ft = setInterval(() => slide(1), 4000);
fb.onmouseenter = () => clearInterval(ft);
fb.onmouseleave = () => { ft = setInterval(() => slide(1), 4000); };

// Search
$('#q').oninput = e => {
  const v = e.target.value.trim().toLowerCase();
  $$('.card').forEach(c => c.hidden = !c.dataset.name.includes(v));
  if (v) $('#product').scrollIntoView();
};

// Subscribe
$('#subForm').onsubmit = e => {
  e.preventDefault(); e.target.reset();
  toast('Subscribed. Your 20% discount is on its way.');
};

$('#clear').onclick = () => { cart = {}; render(); };

// Floating coffee beans in the hero
for (let i = 0; i < 9; i++) {
  const b = document.createElement('i');
  b.className = 'bean';
  b.style.cssText = `left:${Math.random() * 96}%;top:${Math.random() * 88}%;--s:${14 + Math.random() * 16}px;--t:${5 + Math.random() * 5}s;--dx:${(Math.random() - .5) * 70}px;--dy:${(Math.random() - .5) * 70}px;--r:${Math.random() * 360}deg`;
  $('.hero').prepend(b);
}

// Reveal on scroll
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('vis'); io.unobserve(e.target);
  setTimeout(() => e.target.style.transitionDelay = '', 900);
}), {threshold: .15});
$$('h2,.card,.frame,.fb figure,.about>div:first-child,.sub form').forEach((el, i) => {
  el.classList.add('rv'); el.style.transitionDelay = (i % 3) * 90 + 'ms'; io.observe(el);
});

render();

// Add-to-cart: a bean flies into the cart icon
function fly(from) {
  const t = $('#cartBtn').getBoundingClientRect(), f = from.getBoundingClientRect();
  const d = document.createElement('i');
  d.className = 'fly';
  d.style.left = f.left + f.width / 2 + 'px';
  d.style.top = f.top + 'px';
  document.body.append(d);
  d.animate([
    {transform: 'translate(0,0) scale(1)', opacity: 1},
    {transform: `translate(${t.left + t.width / 2 - f.left - f.width / 2}px,${t.top - f.top}px) scale(.3)`, opacity: .6}
  ], {duration: 700, easing: 'cubic-bezier(.5,-.3,.7,.4)'}).onfinish = () => d.remove();
}

// Scroll effects: progress bar, sticky nav, hero and zigzag parallax
$('.about>div:first-child').dataset.d = 'l';
$('.frame').dataset.d = 'r';
const root = document.documentElement, nav = $('.nav'), toTop = $('#toTop'), fimg = $('.frame img');
let tick = false;
function onScroll() {
  const y = scrollY, h = root.scrollHeight - innerHeight;
  root.style.setProperty('--p', h > 0 ? y / h : 0);
  root.style.setProperty('--py', Math.min(y, 700) * .3 + 'px');
  root.style.setProperty('--zx', y * .25 + 'px');
  nav.classList.toggle('stuck', y > 40);
  toTop.classList.toggle('show', y > 700);
  const r = fimg.getBoundingClientRect();
  fimg.style.transform = `translateY(${(r.top + r.height / 2 - innerHeight / 2) * -.04}px)`;
  tick = false;
}
addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, {passive: true});
toTop.onclick = () => scrollTo({top: 0, behavior: 'smooth'});
onScroll();
