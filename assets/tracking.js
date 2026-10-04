/* ===== מעקב המרות – הצבע שלנו =====
   כאן בלבד מעדכנים את התוויות. כל שאר הדפים משתמשים בקובץ הזה.
   תווית המרה = החלק שאחרי הלוכסן ב-send_to, למשל:  'AW-18477957669/AbCdEfGh12'  ->  'AbCdEfGh12'  */
(function(){
  var ADS_ID = 'AW-18477957669';
  var GA4_ID = '';            // מזהה גוגל אנליטיקס, מתחיל ב-G-  (אם ריק – לא נשלח)
  var LABELS = {
    form:     '',             // שליחת טופס (נמדד בדף התודה)
    call:     '',             // לחיצה על מספר הטלפון
    whatsapp: ''              // לחיצה על ווטסאפ
  };

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){ dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', ADS_ID, { allow_enhanced_conversions: true });
  if (GA4_ID) gtag('config', GA4_ID);

  var GA4_EVENTS = { form: 'generate_lead', call: 'click_call', whatsapp: 'click_whatsapp' };

  window.trackConversion = function(kind){
    try {
      if (LABELS[kind]) gtag('event', 'conversion', { send_to: ADS_ID + '/' + LABELS[kind] });
      if (GA4_ID) gtag('event', GA4_EVENTS[kind] || kind, { page_path: location.pathname });
    } catch(e) {}
  };

  // לחיצות על טלפון ווטסאפ בכל מקום באתר
  document.addEventListener('click', function(e){
    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('tel:') === 0) trackConversion('call');
    else if (href.indexOf('wa.me') > -1 || href.indexOf('api.whatsapp.com') > -1) trackConversion('whatsapp');
  }, true);
})();
