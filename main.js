// Простой клиентский движок: загружает products.json, рендерит карточки, поддерживает модалки и корзину (localStorage)
(function(){
const dataUrl = 'assets/data/products.json'
let products = []
let cart = JSON.parse(localStorage.getItem('ts_cart')||'[]')


// DOM
const previewGrid = document.getElementById('preview-grid')
const productsGrid = document.getElementById('products-grid')
const productModal = document.getElementById('product-modal')
const productContent = document.getElementById('product-content')
const productClose = document.getElementById('product-close')
const cartToggleBtns = document.querySelectorAll('#cart-toggle')
const cartModal = document.getElementById('cart-modal')
const cartClose = document.getElementById('cart-close')
const cartCount = document.getElementById('cart-count')
const cartItems = document.getElementById('cart-items')
const cartTotal = document.getElementById('cart-total')
const clearCartBtn = document.getElementById('clear-cart')
const checkoutBtn = document.getElementById('checkout')


// helpers
function fmt(n){return Number(n).toLocaleString('ru-RU')}


function saveCart(){localStorage.setItem('ts_cart',JSON.stringify(cart)); renderCart()}
function addToCart(id,qty=1){
const p = products.find(x=>x.id===id)
if(!p) return
const existing = cart.find(i=>i.id===id)
if(existing) existing.qty += qty
else cart.push({id:id,qty:qty,price:p.price,name:p.title})
saveCart()
}
function removeFromCart(id){cart = cart.filter(i=>i.id!==id); saveCart()}
function clearCart(){cart=[]; saveCart()}


function renderCard(p){
const el = document.createElement('article'); el.className='card'
el.innerHTML = `
<img src="${p.image}" alt="${p.title}">
<div class="card-body">
<h4>${p.title}</h4>
<p class="muted">${p.subtitle||''}</p>
<div style="display:flex;justify-content:space-between;align-items:center;">
<div class="price">${fmt(p.price)} ₸</div>
<div>
<button class="btn" data-id="${p.id}" data-action="view">Просмотр</button>
<button class="btn-outline" data-id="${p.id}" data-action="add">В корзину</button>
</div>
</div>
</div>`
return el
}
function renderPreview(list){ if(!previewGrid) return; previewGrid.innerHTML=''; list.slice(0,4).forEach(p=>previewGrid.appendChild(renderCard(p))) }
function renderProducts(list){ if(!productsGrid) return; productsGrid.innerHTML=''; list.forEach(p=>productsGrid.appendChild(renderCard(p))) }


function openProduct(id){
const p = products.find(x=>x.id===id)
if(!p) return
if(!productModal) return
productContent.innerHTML = `
<div style="display:flex;gap:18px;flex-wrap:wrap">
<div style="flex:1;min-width:260px"><img src="${p.image}" style="width:100%;height:auto;border-radius:8px"></div>
<div style="flex:1;min-width:260px">
<h2>${p.title}</h2>
<p>${p.description||''}</p>
<p class="price">${fmt(p.price)} ₸</p>
<div style="margin-top:12px">
<button class="btn" id="buy-now" data-id="${p.id}">Добавить в корзину</button>
<a class="btn-outline" href="product.html">Страница товара</a>
</div>
</div>
</div>`
productModal.classList.remove('hidden')
}
function renderCart(){
if(!cartItems) return
cartCount && (cartCount.textContent = cart.reduce((s,i)=>s+i.qty,0))
cartItems.innerHTML = ''
if(cart.length===0){cartItems.innerHTML='<p>Корзина пуста</p>'; cartTotal.textContent='0'; return}
let sum=0
cart.forEach(it=>{
const p = products.find(x=>x.id===it.id) || {}
const row = document.createElement('div'); row.style.marginBottom='10px'
const subtotal = it.qty * it.price
sum += subtotal
row.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><div><strong>${it.name}</strong><div class="muted">${it.qty} × ${fmt(it.price)} ₸</div></div><div><button class="btn-outline" data-remove="${it.id}">Удалить</button></div></div>`
cartItems.appendChild(row)
})
cartTotal.textContent = fmt(sum)
}
// events
document.addEventListener('click',e=>{
const action = e.target.dataset.action
const id = e.target.dataset.id
if(action==='view') openProduct(id)
if(action==='add') { addToCart(id*1,1) }
if(e.target.id==='buy-now') { addToCart(e.target.dataset.id*1,1); productModal.classList.add('hidden') }
if(e.target.matches('[data-remove]')) { removeFromCart(e.target.dataset.remove*1) }
})
// product modal close
if(productClose) productClose.addEventListener('click',()=>productModal.classList.add('hidden'))
if(cartClose) cartClose.addEventListener('click',()=>cartModal.classList.add('hidden'))


// cart toggle
document.querySelectorAll('#cart-toggle').forEach(btn=>btn.addEventListener('click',()=>{cartModal.classList.toggle('hidden')}))


if(clearCartBtn) clearCartBtn.addEventListener('click',()=>{clearCart()})
if(checkoutBtn) checkoutBtn.addEventListener('click',()=>{
// Для упрощения — открываем mailto с содержимым заказа. Замените на реальный процессинг.
if(cart.length===0) { alert('Корзина пуста') ; return }
const body = cart.map(i=>{
const p = products.find(x=>x.id===i.id)
return `${p.title} — ${i.qty} × ${p.price} ₸` }).join('\n')
window.location.href = `mailto:orders@timeless.example?subject=Заказ&body=${encodeURIComponent(body)}`
})
// load products
fetch(dataUrl).then(r=>r.json()).then(js=>{ products = js; renderPreview(products); renderProducts(products); renderCart(); }).catch(err=>{
console.error('Не удалось загрузить данные товаров',err)
// fallback — несколько примеров
products = [
{id:1,title:'Классический костюм Navy',subtitle:'Лёгкая шерсть, подгонка',price:72000,image:'assets/images/suit1.jpg',description:'Классический костюм для мероприятий.'},
{id:2,title:'Серый костюм Slim',subtitle:'Современная посадка',price:68000,image:'assets/images/suit2.jpg',description:'Универсальный костюм для офиса и торжеств.'},
{id:3,title:'Костюм с текстурой',subtitle:'Тонкая структура ткани',price:83000,image:'assets/images/suit3.jpg',description:'Выбор для тех, кто ценит фактуру.'}
]
renderPreview(products); renderProducts(products); renderCart()
})


// years
document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear())
document.getElementById('year2') && (document.getElementById('year2').textContent = new Date().getFullYear())
document.getElementById('year3') && (document.getElementById('year3').textContent = new Date().getFullYear())


})();