var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// 1) ფოტო რომ არ არის, მინიშნება გამოჩნდეს
document.querySelectorAll('.ph img').forEach(function(img){
  function miss(){img.parentElement.classList.add('missing');img.style.display='none'}
  img.addEventListener('error',miss);
  if(img.complete && img.naturalWidth===0) miss();
});

// 2) ზედა ზოლი და ჩატვირთვის პროგრესი
var nav=document.getElementById('nav'),prog=document.getElementById('prog'),heroPh=document.getElementById('heroPh');
addEventListener('scroll',function(){
  var y=scrollY,h=document.documentElement.scrollHeight-innerHeight;
  nav.classList.toggle('solid',y>60);
  prog.style.width=(y/h*100)+'%';
  if(!reduce && y<innerHeight) heroPh.style.marginTop=(y*0.25)+'px'; // მსუბუქი პარალაქსი
},{passive:true});

// 3) ოდომეტრი
var dEl=document.getElementById('digits'),val=dEl.dataset.value,cols=[];
val.split('').forEach(function(ch,i){
  var n=(val.length-i)%3===0&&i>0; // ათასების გამყოფი
  if(n){var s=document.createElement('span');s.className='sep';dEl.appendChild(s)}
  var d=document.createElement('div');d.className='dg';
  var ol=document.createElement('ol');
  for(var k=0;k<=9;k++){var li=document.createElement('li');li.textContent=k;ol.appendChild(li)}
  d.appendChild(ol);dEl.appendChild(d);cols.push({ol:ol,t:+ch});
});
var u=document.createElement('span');u.className='unit';u.textContent='კმ';dEl.appendChild(u);
function spin(){cols.forEach(function(c,i){
  setTimeout(function(){c.ol.style.transform='translateY(-'+(c.t*10)+'%)'},reduce?0:i*180);
})}

// 4) რიცხვების დათვლა
function count(el){
  var to=+el.dataset.count,t0=null;
  if(reduce){el.textContent=to;return}
  (function step(t){t0=t0||t;var p=Math.min((t-t0)/1600,1);
    el.textContent=Math.round(to*(1-Math.pow(1-p,3)));
    if(p<1)requestAnimationFrame(step)})(performance.now());
}

// 5) ეკრანზე გამოჩენისას ჩართვა
var io=new IntersectionObserver(function(es){es.forEach(function(e){
  if(!e.isIntersecting)return;
  var el=e.target;io.unobserve(el);el.classList.add('in');
  if(el.querySelector('#digits'))spin();
  el.querySelectorAll('[data-count]').forEach(count);
  el.querySelectorAll('[data-w]').forEach(function(b){b.style.width=(b.dataset.w/240*100)+'%'});
})},{threshold:.3});
document.querySelectorAll('.reveal').forEach(function(r){io.observe(r)});

// 6) ლაითბოქსი
var lb=document.getElementById('lb'),lbImg=lb.querySelector('img'),lbC=lb.querySelector('.c');
var items=[].slice.call(document.querySelectorAll('#gal .ph')),cur=0;
var returnFocus=null;
function show(i){
  var opening=!lb.classList.contains('on');
  cur=(i+items.length)%items.length;
  var p=items[cur];
  if(p.classList.contains('missing')){lbImg.removeAttribute('src');lbImg.alt=''}
  else{lbImg.src=p.querySelector('img').src}
  lbC.textContent=(cur+1)+' / '+items.length;
  lb.classList.add('on');
  if(opening){returnFocus=document.activeElement;lb.querySelector('.x').focus()}
}
items.forEach(function(p,i){
  p.addEventListener('click',function(){show(i)});
});
function closeLb(){
  lb.classList.remove('on');
  if(returnFocus){returnFocus.focus();returnFocus=null}
}
lb.querySelector('.x').onclick=closeLb;
lb.querySelector('.p').onclick=function(e){e.stopPropagation();show(cur-1)};
lb.querySelector('.n').onclick=function(e){e.stopPropagation();show(cur+1)};
lb.addEventListener('click',function(e){if(e.target===lb)closeLb()});
addEventListener('keydown',function(e){
  if(!lb.classList.contains('on'))return;
  if(e.key==='Escape')closeLb();
  if(e.key==='ArrowLeft')show(cur-1);
  if(e.key==='ArrowRight')show(cur+1);
  if(e.key==='Tab'){
    var controls=lb.querySelectorAll('button'),first=controls[0],last=controls[controls.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  }
});
var sx=0;
lb.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});
lb.addEventListener('touchend',function(e){var dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>50)show(cur+(dx<0?1:-1))});