// ===== שליחת לידים: נשלח למייל ברקע ומעביר לדף תודה =====
  var LEAD_ENDPOINT = 'https://formsubmit.co/ajax/dandinn22@gmail.com';
  // גיבוי לידים לגיליון "לידים - הצבע שלנו" בגוגל דרייב
  var BACKUP_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyaK3u9JmNjgzM_41AvY8_ECwkq9Ve7_uUu-V_mmV48PewsWlR-0urMT6gu7q3XicxS5w/exec';
  var WA_NUMBER = '972537479284';

  // מחזיר מספר ישראלי תקין בפורמט 05XXXXXXXX, או מחרוזת ריקה
  function normalizePhone(raw){
    var d = String(raw || '').replace(/[^\d+]/g, '');
    if (d.indexOf('+972') === 0) d = '0' + d.slice(4);
    else if (d.indexOf('972') === 0 && d.length >= 11) d = '0' + d.slice(3);
    d = d.replace(/\D/g, '');
    if (d.length === 9 && d.charAt(0) !== '0') d = '0' + d;
    return /^0(?:5\d{8}|7\d{8}|[23489]\d{7})$/.test(d) ? d : '';
  }

  function handleLeadForm(formId, nameId, phoneId, source){
    var form = document.getElementById(formId);
    if(!form) return;
    var btn = form.querySelector('button[type=submit]');
    var nameEl = document.getElementById(nameId);
    var phoneEl = document.getElementById(phoneId);
    var hp = form.querySelector('input[name="_honey"]');
    var errBox = form.querySelector('.form-error');
    var phoneErr = document.getElementById(phoneId + 'Err');

    function showPhoneErr(on){
      if (phoneErr) phoneErr.hidden = !on;
      phoneEl.setAttribute('aria-invalid', on ? 'true' : 'false');
    }
    phoneEl.addEventListener('input', function(){
      if (phoneErr && !phoneErr.hidden && normalizePhone(phoneEl.value)) showPhoneErr(false);
    });

    form.addEventListener('submit', function(e){
      e.preventDefault();
      if(btn.disabled) return;
      if (errBox) errBox.hidden = true;

      var name = nameEl.value.trim();
      var phone = normalizePhone(phoneEl.value);
      if(!phone){ showPhoneErr(true); phoneEl.focus(); return; }
      showPhoneErr(false);

      // שדה נסתר שרק רובוטים ממלאים: לא שולחים ולא סופרים המרה
      if (hp && hp.value){ window.location.href = '/thank-you.html'; return; }

      btn.disabled = true;
      btn.classList.add('is-sending');
      var finished = false;

      function success(){
        if(finished) return; finished = true;
        // לא מעבירים פרטים אישיים בכתובת – רק בזיכרון הזמני של הדפדפן
        try {
          sessionStorage.setItem('lead_name', name);
          sessionStorage.setItem('lead_phone', phone);
          sessionStorage.setItem('lead_sent', '1');
        } catch(err) {}
        window.location.href = '/thank-you.html';
      }
      function failure(){
        if(finished) return; finished = true;
        btn.disabled = false;
        btn.classList.remove('is-sending');
        if (!errBox) return;
        var msg = 'היי, אני ' + name + ' (' + phone + '). אשמח לקבל הצעת מחיר לצביעה';
        errBox.innerHTML = 'השליחה לא עברה. אפשר <a href="https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg) +
          '" target="_blank" rel="noopener">לשלוח לנו את הפרטים בווטסאפ</a> או להתקשר ל־<a href="tel:0537479284" dir="ltr">053-747-9284</a>.';
        errBox.hidden = false;
      }
      var timer = setTimeout(failure, 12000);

      if (BACKUP_ENDPOINT) {
        try {
          fetch(BACKUP_ENDPOINT, { method: 'POST', mode: 'no-cors', keepalive: true,
            body: new URLSearchParams({ name: name, phone: phone, source: source, page: location.pathname }) });
        } catch(err) {}
      }

      // form-urlencoded = בקשה "פשוטה" בלי preflight, ולכן keepalive עובד בכל הדפדפנים
      var body = new URLSearchParams({
        'שם': name,
        'טלפון': phone,
        'טופס': source,
        'עמוד': location.pathname,
        _subject: 'ליד חדש מהאתר – ' + name + ' ' + phone,
        _template: 'table',
        _cc: 'zevashelanu@gmail.com',
        _honey: ''
      });
      try {
        fetch(LEAD_ENDPOINT, { method: 'POST', keepalive: true, headers: {'Accept': 'application/json'}, body: body })
          .then(function(r){ return r.json(); })
          .then(function(res){
            clearTimeout(timer);
            if (res && (res.success === true || res.success === 'true')) success(); else failure();
          }, function(){ clearTimeout(timer); failure(); });
      } catch(err) { clearTimeout(timer); failure(); }
    });
  }

  handleLeadForm('quoteForm', 'name', 'phone', 'טופס עליון');
  handleLeadForm('contactForm', 'cName', 'cPhone', 'טופס תחתון');

  var callFloatClose = document.getElementById('callFloatClose');
  if (callFloatClose) callFloatClose.addEventListener('click', function(){
    document.getElementById('callFloat').classList.add('hidden');
  });

  function initCarousel(opts){
    var track = document.getElementById(opts.track);
    if (!track) return;
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
