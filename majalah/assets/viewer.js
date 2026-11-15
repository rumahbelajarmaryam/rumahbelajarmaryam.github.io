(function(){
  var cfg = window.MAJALAH;               // {title, pages, folder}
  var book = document.getElementById('book');
  var stage = document.querySelector('.stage');
  var total = cfg.pages;

  // buat halaman
  for (var i = 1; i <= total; i++) {
    var d = document.createElement('div');
    d.className = 'page';
    var im = new Image();
    im.src = 'p/' + (i < 10 ? '0' : '') + i + '.webp';
    im.alt = 'Halaman ' + i;
    im.draggable = false;
    d.appendChild(im);
    book.appendChild(d);
  }

  var W = 900, H = 1273, RATIO = H / W;
  function fit(){
    var aw = stage.clientWidth - 20, ah = stage.clientHeight - 20, bw, bh;
    if (aw / ah >= 1.2) { bh = Math.min(ah, aw / 2 * RATIO); bw = 2 * bh / RATIO; }
    else { bh = Math.min(ah, aw * RATIO); bw = bh / RATIO; }
    book.style.width = Math.floor(bw) + 'px';
    book.style.height = Math.floor(bh) + 'px';
  }
  fit();
  var pf = new St.PageFlip(book, {
    width: W, height: H, size: 'stretch',
    minWidth: 200, maxWidth: 2400, minHeight: 280, maxHeight: 3400,
    showCover: true, usePortrait: true, startZIndex: 0, autoSize: true,
    maxShadowOpacity: 0.45, mobileScrollSupport: false, flippingTime: 700,
    drawShadow: true
  });
  pf.loadFromHTML(document.querySelectorAll('.page'));

  var count = document.getElementById('count');
  var slider = document.getElementById('slider');
  var prev = document.getElementById('prev');
  var next = document.getElementById('next');
  slider.max = total;

  function label(idx){
    var pn = idx + 1;
    var portrait = pf.getOrientation && pf.getOrientation() === 'portrait';
    if (portrait || idx === 0 || idx === total - 1) return pn + ' / ' + total;
    // tampilan dua halaman: idx genap (non-cover) tampil bersama pendampingnya
    var left = (idx % 2 === 1) ? idx + 1 : idx;
    return left + '-' + (left + 1) + ' / ' + total;
  }
  function sync(idx){
    count.textContent = label(idx);
    slider.value = idx + 1;
    prev.disabled = idx <= 0;
    next.disabled = idx >= total - 1;
  }
  pf.on('flip', function(e){ sync(e.data); });
  pf.on('changeOrientation', function(){ sync(pf.getCurrentPageIndex()); });
  prev.onclick = function(){ pf.flipPrev(); };
  next.onclick = function(){ pf.flipNext(); };
  slider.oninput = function(){ pf.turnToPage(parseInt(slider.value,10) - 1); sync(pf.getCurrentPageIndex()); };
  document.addEventListener('keydown', function(e){
    if (e.key === 'ArrowRight') pf.flipNext();
    if (e.key === 'ArrowLeft') pf.flipPrev();
  });
  sync(0);
  var rt; window.addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(function(){ fit(); pf.update(); sync(pf.getCurrentPageIndex()); }, 150); });

  // layar penuh (jika didukung)
  var fs = document.getElementById('fs');
  var root = document.documentElement;
  if (root.requestFullscreen) {
    fs.onclick = function(){ document.fullscreenElement ? document.exitFullscreen() : root.requestFullscreen(); };
  } else { fs.style.display = 'none'; }

  // ---- penangkal salin (bukan jaminan mutlak) ----
  ['contextmenu','dragstart','selectstart','copy','cut'].forEach(function(t){
    document.addEventListener(t, function(e){ e.preventDefault(); });
  });
  document.addEventListener('keydown', function(e){
    var k = (e.key || '').toLowerCase();
    if ((e.ctrlKey || e.metaKey) && ['s','p','u','c','a'].indexOf(k) > -1) e.preventDefault();
    if (e.key === 'F12') e.preventDefault();
  });
  function veil(on){ stage.classList.toggle('veil', on); }
  document.addEventListener('visibilitychange', function(){ veil(document.hidden); });
  window.addEventListener('blur', function(){ veil(true); });
  window.addEventListener('focus', function(){ veil(false); });
  document.addEventListener('keyup', function(e){
    if (e.key === 'PrintScreen') {
      try { navigator.clipboard.writeText(''); } catch(_) {}
      veil(true); setTimeout(function(){ veil(false); }, 1800);
    }
  });
})();
