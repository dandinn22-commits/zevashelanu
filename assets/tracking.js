/* ===== מעקב המרות – הצבע שלנו =====
   כאן בלבד מעדכנים את התוויות. כל שאר הדפים משתמשים בקובץ הזה.
   תווית המרה = החלק שאחרי הלוכסן ב-send_to, למשל:  'AW-18477957669/AbCdEfGh12'  ->  'AbCdEfGh12'  */
(function(){
  var ADS_ID = 'AW-18477957669';
  var GA4_ID = '';            // מזהה גוגל אנליטיקס, מתחיל ב-G-  (אם ריק – לא נשלח)
  // רישום לחיצות על טלפון/ווטסאפ בלשונית "לחיצות" בגיליון "לידים - הצבע שלנו"
  var CLICK_LOG = 'https://script.google.com/macros/s/AKfycbyaK3u9JmNjgzM_41AvY8_ECwkq9Ve7_uUu-V_mmV48PewsWlR-0urMT6gu7q3XicxS5w/exec';
  var LABELS = {
    form:     '-uzZCMiJl5MdEKWE_epE', // שליחת טופס (נמדד בדף התודה)
    call:     'XSQECNHbtZQdEKWE_epE', // לחיצה על מספר הטלפון
    whatsapp: '03htCLzkxZQdEKWE_epE'  // לחיצה על ווטסאפ
  };

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){ dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', ADS_ID, { allow_enhanced_conversions: true });
  if (GA4_ID) gtag('config', GA4_ID);

  // זיהוי מבקר שהגיע ממודעה בגוגל אדס (נשמר לכל הביקור, גם במעבר בין עמודים)
  try {
    if (/[?&](gclid|gbraid|wbraid)=|[?&]utm_medium=cpc/.test(location.search)) sessionStorage.setItem('from_ads', '1');
    window.fromAds = sessionStorage.getItem('from_ads') === '1';
  } catch(e) { window.fromAds = false; }

  var GA4_EVENTS = { form: 'generate_lead', call: 'click_call', whatsapp: 'click_whatsapp' };

  window.trackConversion = function(kind){
    try {
      if (LABELS[kind]) gtag('event', 'conversion', { send_to: ADS_ID + '/' + LABELS[kind] });
      if (GA4_ID) gtag('event', GA4_EVENTS[kind] || kind, { page_path: location.pathname });
    } catch(e) {}
  };

  function logClick(kind){
    if (!CLICK_LOG) return;
    try {
      var data = new URLSearchParams({ type: 'click', kind: kind, page: location.pathname + (window.fromAds ? ' – גוגל אדס' : '') });
      if (navigator.sendBeacon) navigator.sendBeacon(CLICK_LOG, data);
      else fetch(CLICK_LOG, { method: 'POST', mode: 'no-cors', keepalive: true, body: data });
    } catch(e) {}
  }

  // לחיצות על טלפון ווטסאפ בכל מקום באתר
  document.addEventListener('click', function(e){
    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var kind = '';
    if (href.indexOf('tel:') === 0) kind = 'call';
    else if (href.indexOf('wa.me') > -1 || href.indexOf('api.whatsapp.com') > -1) kind = 'whatsapp';
    if (!kind) return;
    // בדף התודה הליד כבר נספר – לא סופרים המרה נוספת, רק רושמים בגיליון
    if (location.pathname.indexOf('thank-you') === -1) trackConversion(kind);
    logClick(kind);
  }, true);
})();
