const wrap = document.getElementById('characters');


const characterMotion = matchMedia('(prefers-reduced-motion: reduce)');

for (let i = 1; i <= 12; i += 1) {
  const img = new Image();
  img.src = `assets/${String(i).padStart(2, '0')}.png`;
  img.alt = `Personnage roleplay ${i}`;
  img.className = `character${i === 1 ? ' active' : ''}`;
  img.loading = i < 3 ? 'eager' : 'lazy';
  img.setAttribute('aria-hidden', String(i !== 1));
  wrap.appendChild(img);
}

let current = 0;
let timer;

function show(nextIndex) {
  wrap.children[current].classList.remove('active');
  wrap.children[current].setAttribute('aria-hidden', 'true');
  current = (nextIndex + wrap.children.length) % wrap.children.length;
  wrap.children[current].classList.add('active');
  wrap.children[current].setAttribute('aria-hidden', 'false');
}

function restart() {
  clearInterval(timer);
  if (!characterMotion.matches && !document.hidden) {
    timer = setInterval(() => show(current + 1), 4500);
  }
}

const dialog = document.getElementById('join');

document.querySelectorAll('[data-join]').forEach((button) => {
  button.addEventListener('click', () => dialog.showModal());
});

dialog.querySelector('.close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target !== dialog) return;

  const rect = dialog.getBoundingClientRect();
  const inside =
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom;

  if (!inside) {
    dialog.close();
  }
});

document.addEventListener('visibilitychange', restart);
characterMotion.addEventListener('change', restart);
restart();

const products = [
  {
    name: 'Bloox Fx',
    price: 2,
    cat: 'Packs',
    desc: 'Pack d’effets Bloox.',
    word: 'FX',
    art: '<path d="M60 8 30 55h35L50 94l44-55H62L80 8Z"/>'
  },
  {
    name: 'Pack Citizen',
    price: 3,
    cat: 'Packs',
    desc: 'Pack Citizen complet.',
    word: 'PACK',
    art: '<path d="m60 8 42 23v44L60 98 18 75V31Z M18 31l42 23 42-23M60 54v44M40 20l42 23v26"/>'
  },
  {
    name: 'Replace perso',
    price: 2,
    cat: 'Création',
    desc: 'Remplacement personnalisé sur ta vidéo.',
    word: 'EDIT',
    art: '<rect x="15" y="15" width="80" height="60" rx="4"/><path d="m65 84 34-34 12 12-34 34H65ZM27 30h28M27 42h18"/>'
  },
  {
    name: 'Bannière',
    price: 7,
    cat: 'Création',
    desc: 'Bannière sur mesure pour ta chaîne ou ton serveur.',
    word: 'DESIGN',
    art: '<rect x="5" y="22" width="110" height="60" rx="4"/><path d="M18 38h40M18 50h28M18 66h35m20-28 16 30 16-30"/>'
  },
  {
    name: 'Optimisation PC',
    price: 10,
    cat: 'Services',
    desc: 'Nettoyage complet et boost des performances.',
    word: 'BOOST',
    art: '<rect x="20" y="10" width="80" height="60" rx="4"/><path d="M60 70v18M40 90h40m-7-70L48 43h20L54 64M8 33v20m-7-10h14m93 0h12"/>'
  }
];

let cart = {};

try {
  const saved = JSON.parse(localStorage.getItem('sd-shop-cart-v1') || '{}');
  if (saved && typeof saved === 'object') {
    for (const [index, quantity] of Object.entries(saved)) {
      if (products[index] && Number.isInteger(quantity) && quantity > 0) {
        cart[index] = Math.min(quantity, 99);
      }
    }
  }
} catch (error) {
  // localStorage unavailable in some restricted contexts
}

const money = (value) => `${value.toLocaleString('fr-FR')} €`;
const catalog = document.getElementById('products');

catalog.innerHTML = products
  .map(
    (product, index) => `
      <article class="product" data-category="${product.cat}">
        <div class="product-art" data-word="${product.word}" aria-hidden="true">
          <span class="art-no">SD / 0${index + 1}</span>
          <svg viewBox="0 0 120 105" fill="none" stroke-width="1.5" stroke-linejoin="round">
            ${product.art}
          </svg>
        </div>
        <div class="product-body">
          <span class="product-cat">${product.cat}</span>
          <h3>${product.name}</h3>
          <p>${product.desc}</p>
          <span class="product-selected" data-selected="${index}" hidden></span>
          <div class="product-bottom">
            <span class="price">${product.price} <small>€</small></span>
            <button class="add" type="button" data-add="${index}" aria-label="Ajouter ${product.name} au panier">Ajouter <span aria-hidden="true">+</span></button>
          </div>
        </div>
      </article>
    `
  )
  .join('');

// Les compteurs des catégories suivent automatiquement la liste des produits.
document.querySelectorAll('[data-filter]').forEach((button) => {
  const count = products.filter((product) => button.dataset.filter === 'Tous' || product.cat === button.dataset.filter).length;
  button.querySelector('.filter-count').textContent = String(count);
});
document.getElementById('results').textContent = `${products.length} prestations`;

function renderCart() {
  let count = 0;
  let total = 0;

  for (const [index, quantity] of Object.entries(cart)) {
    count += quantity;
    total += products[index].price * quantity;
  }

  document.querySelectorAll('.cart-count').forEach((node) => {
    node.textContent = String(count);
  });

  document.getElementById('total').textContent = money(total);
  document.getElementById('shop-total').textContent = money(total);

  catalog.querySelectorAll('[data-selected]').forEach((node) => {
    const quantity = cart[node.dataset.selected] || 0;
    node.hidden = quantity === 0;
    node.textContent = `${quantity} au panier`;
    node.closest('.product').classList.toggle('in-cart', quantity > 0);
  });

  document.getElementById('cart-items').innerHTML = count
    ? Object.entries(cart)
        .map(
          ([index, quantity]) => `
            <div class="cart-row">
              <span class="cart-name">${products[index].name}</span>
              <div class="qty">
                <button data-qty="${index}" data-delta="-1" aria-label="Retirer un ${products[index].name}">−</button>
                <span>${quantity}</span>
                <button data-qty="${index}" data-delta="1" aria-label="Ajouter un ${products[index].name}">+</button>
              </div>
              <b>${money(products[index].price * quantity)}</b>
            </div>
          `
        )
        .join('')
    : '<p>Ton panier est vide. Explore la boutique et ajoute les prestations qui te plaisent.</p>';

  document.getElementById('request').value = count
    ? 'Bonjour SD SHOP, je souhaite commander :\n' +
      Object.entries(cart)
        .map(([index, quantity]) => `- ${quantity} × ${products[index].name} : ${money(products[index].price * quantity)}`)
        .join('\n') +
      `\nTotal : ${money(total)}\nComment procéder pour la commande et le paiement ?`
    : '';

  document.getElementById('copy').disabled = !count;

  try {
    localStorage.setItem('sd-shop-cart-v1', JSON.stringify(cart));
  } catch (error) {
    // ignore storage issues
  }
}

let toastTimer;

catalog.addEventListener('click', (event) => {
  const button = event.target.closest('[data-add]');
  if (!button) return;

  const index = Number(button.dataset.add);
  cart[index] = Math.min((cart[index] || 0) + 1, 99);
  renderCart();

  const toast = document.getElementById('toast');
  toast.textContent = `${products[index].name} ajouté au panier ✓`;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2200);
});

document.getElementById('cart-items').addEventListener('click', (event) => {
  const button = event.target.closest('[data-qty]');
  if (!button) return;

  const index = Number(button.dataset.qty);
  const delta = Number(button.dataset.delta);

  cart[index] = Math.min(99, (cart[index] || 0) + delta);

  if (cart[index] <= 0) {
    delete cart[index];
  }

  renderCart();
});

document.querySelectorAll('[data-filter]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach((node) => {
      const active = node === button;
      node.classList.toggle('active', active);
      node.setAttribute('aria-pressed', String(active));
    });

    let visibleCount = 0;
    catalog.classList.toggle('is-filtered', button.dataset.filter !== 'Tous');

    catalog.querySelectorAll('.product').forEach((product) => {
      const match = button.dataset.filter === 'Tous' || product.dataset.category === button.dataset.filter;
      product.hidden = !match;
      if (match) visibleCount += 1;
    });

    document.getElementById('results').textContent = `${visibleCount} prestation${visibleCount > 1 ? 's' : ''}`;
  });
});

// Réorganise les cartes sans modifier les identifiants utilisés par le panier.
document.getElementById('sort').addEventListener('change', (event) => {
  const order = event.target.value;
  const cards = Array.from(catalog.querySelectorAll('.product'));
  cards.sort((left, right) => {
    const leftIndex = Number(left.querySelector('[data-add]').dataset.add);
    const rightIndex = Number(right.querySelector('[data-add]').dataset.add);
    if (order === 'ascending') return products[leftIndex].price - products[rightIndex].price || leftIndex - rightIndex;
    if (order === 'descending') return products[rightIndex].price - products[leftIndex].price || leftIndex - rightIndex;
    return leftIndex - rightIndex;
  });
  cards.forEach((card) => catalog.appendChild(card));
  catalog.classList.toggle('is-sorted', order !== 'selection');
});

document.getElementById('copy').addEventListener('click', async () => {
  const textarea = document.getElementById('request');

  try {
    await navigator.clipboard.writeText(textarea.value);
    document.getElementById('status').textContent = 'Demande copiée ! Envoie-la à SD SHOP via ton canal habituel.';
  } catch (error) {
    textarea.focus();
    textarea.select();
    document.getElementById('status').textContent = 'Sélectionne et copie le texte ci-dessus pour envoyer ta demande.';
  }
});

renderCart();
