// ===== שליחת לידים: נשלח למייל ברקע ומעביר לדף תודה =====
  var LEAD_ENDPOINT = 'https://formsubmit.co/ajax/dandinn22@gmail.com';

  function handleLeadForm(formId, nameId, phoneId, source){
    var form = document.getElementById(formId);
    if(!form) return;
    var btn = form.querySelector('button[type=submit]');
    form.addEventListener('submit', function(e){
      e.preventDefault();
      if(btn.disabled) return;
      btn.disabled = true;
      var name = document.getElementById(nameId).value.trim();
      var phone = document.getElementById(phoneId).value.trim();
      var thankUrl = '/thank-you.html';
      // לא מעבירים פרטים אישיים בכתובת – רק בזיכרון הזמני של הדפדפן
      try { sessionStorage.setItem('lead_name', name); sessionStorage.setItem('lead_sent', '1'); } catch(err) {}

      var done = false;
      function go(){ if(done) return; done = true; window.location.href = thankUrl; }
      setTimeout(go, 4000);

      // form-urlencoded = בקשה "פשוטה" בלי preflight, ולכן keepalive עובד בכל הדפדפנים
      var body = new URLSearchParams({
        'שם': name,
        'טלפון': phone,
        'טופס': source,
        'עמוד': location.pathname,
        _subject: 'ליד חדש מהאתר – ' + name + ' ' + phone,
        _template: 'table',
        _cc: 'zevashelanu@gmail.com'
      });
      try {
        fetch(LEAD_ENDPOINT, { method: 'POST', keepalive: true, headers: {'Accept': 'application/json'}, body: body })
          .then(function(r){ return r.json(); })
          .then(function(res){ if(window.console) console.log('FormSubmit:', res); go(); }, go);
      } catch(err) { go(); }
    });
  }

  handleLeadForm('quoteForm', 'name', 'phone', 'טופס עליון');
  handleLeadForm('contactForm', 'cName', 'cPhone', 'טופס תחתון');

  document.getElementById('callFloatClose').addEventListener('click', function(){
    document.getElementById('callFloat').classList.add('hidden');
  });

  function initCarousel(opts){
    var track = document.getElementById(opts.track);
    var cards = track.children;
    var total = cards.length;
    var prevBtn = document.getElementById(opts.prev);
    var nextBtn = document.getElementById(opts.next);
    var dotsWrap = document.getElementById(opts.dots);
    var index = 0;

    function visibleCount(){
      var w = window.innerWidth;
      if(w <= 640) return 1;
      if(w <= 860) return 2;
      return 3;
    }

    function maxIndex(){
      return Math.max(0, total - visibleCount());
    }

    function buildDots(){
      dotsWrap.innerHTML = '';
      var steps = maxIndex() + 1;
      for(var i=0;i<steps;i++){
        var d = document.createElement('button');
        d.type = 'button';
        d.className = 'carousel-dot' + (i === index ? ' active' : '');
        d.setAttribute('aria-label', opts.dotLabel + ' ' + (i+1));
        d.addEventListener('click', (function(idx){
          return function(){ index = idx; update(); };
        })(i));
        dotsWrap.appendChild(d);
      }
    }

    function update(){
      var mi = maxIndex();
      if(index > mi) index = mi;
      if(index < 0) index = 0;
      var hideNav = mi === 0;
      prevBtn.classList.toggle('hidden', hideNav);
      nextBtn.classList.toggle('hidden', hideNav);
      dotsWrap.classList.toggle('hidden', hideNav);
      var vc = visibleCount();
      var pct = (100 / vc) * index;
      track.style.transform = 'translateX(-' + pct + '%)';
      var dots = dotsWrap.children;
      for(var i=0;i<dots.length;i++){
        dots[i].classList.toggle('active', i === index);
      }
    }

    nextBtn.addEventListener('click', function(){
      index = (index + 1) > maxIndex() ? 0 : index + 1;
      update();
    });
    prevBtn.addEventListener('click', function(){
      index = (index - 1) < 0 ? maxIndex() : index - 1;
      update();
    });

    var resizeTimer;
    window.addEventListener('resize', function(){
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function(){
        buildDots();
        update();
      }, 150);
    });

    buildDots();
    update();
  }

  initCarousel({track:'carTrack', prev:'carPrev', next:'carNext', dots:'carDots', dotLabel:'מעבר לביקורת'});
  initCarousel({track:'worksTrack', prev:'worksPrev', next:'worksNext', dots:'worksDots', dotLabel:'מעבר לעבודה'});

  var accessToggle = document.getElementById('accessToggle');
  var accessPanel = document.getElementById('accessPanel');
  var fontStep = 0;

  accessToggle.addEventListener('click', function(){
    accessPanel.classList.toggle('open');
  });

  accessPanel.addEventListener('click', function(e){
    var action = e.target.getAttribute('data-action');
    if(!action) return;
    if(action === 'font-up' && fontStep < 3){
      fontStep++;
      document.documentElement.style.fontSize = (100 + fontStep * 12) + '%';
    }
    if(action === 'font-down' && fontStep > -2){
      fontStep--;
      document.documentElement.style.fontSize = (100 + fontStep * 12) + '%';
    }
    if(action === 'contrast'){
      document.body.classList.toggle('high-contrast');
    }
    if(action === 'reset'){
      fontStep = 0;
      document.documentElement.style.fontSize = '100%';
      document.body.classList.remove('high-contrast');
    }
  });
