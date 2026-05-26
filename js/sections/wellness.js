'use strict';

window.WellnessSection = (() => {
  let _container = null;
  let _activeTab = 'skincare';
  let _state = null;

  // ─── Default state ───────────────────────────────────────────────────────────
  function _defaultState() {
    const today = new Date().toISOString().split('T')[0];
    return {
      skincare: {
        amDone: false, pmDone: false,
        amStepsDone: [], pmStepsDone: [],
        lastDate: today, amStreak: 0, pmStreak: 0,
        streakDates: []
      },
      haircare: { lastOilDate: null, lastWashDate: null, activities: {} },
      water: { count: 0, lastDate: today, goal: 8 },
      habits: {},
      meals: { date: today, breakfast: null, lunch: null, dinner: null, snacks: [], calories: 0 }
    };
  }

  function _loadState() {
    const saved = window.SovereignStorage.get('wellness');
    if (!saved) { _state = _defaultState(); return; }
    _state = Object.assign(_defaultState(), saved);
    // Reset daily data if new day
    const today = new Date().toISOString().split('T')[0];
    if (_state.skincare.lastDate !== today) {
      // Update streaks before resetting
      if (_state.skincare.amDone) _state.skincare.amStreak++;
      else _state.skincare.amStreak = 0;
      if (_state.skincare.pmDone) _state.skincare.pmStreak++;
      else _state.skincare.pmStreak = 0;
      _state.skincare.amDone = false;
      _state.skincare.pmDone = false;
      _state.skincare.amStepsDone = [];
      _state.skincare.pmStepsDone = [];
      _state.skincare.lastDate = today;
    }
    if (_state.water.lastDate !== today) {
      _state.water.count = 0;
      _state.water.lastDate = today;
    }
    if (_state.meals.date !== today) {
      _state.meals = { date: today, breakfast: null, lunch: null, dinner: null, snacks: [], calories: 0 };
    }
  }

  function _saveState() {
    window.SovereignStorage.set('wellness', _state);
  }

  // ─── AM/PM routine data ───────────────────────────────────────────────────────
  const AM_STEPS = [
    { id: 0, time: '7:00 AM', duration: '2 min', icon: '🧴', name: 'Gentle Foaming Cleanser', instruction: 'Double cleanse to remove overnight buildup. In Vietnam\'s humidity, oil builds up quickly.', tip: 'Use lukewarm water — never hot. This preserves your skin barrier.' },
    { id: 1, time: '7:05 AM', duration: '3 min', icon: '✨', name: 'Vitamin C Serum (20% L-Ascorbic Acid)', instruction: 'Apply to damp skin. Vitamin C fights the oxidative stress from Vietnam\'s heavy UV exposure and pollution.', tip: 'Wait 3 minutes to fully absorb before next step.' },
    { id: 2, time: '7:10 AM', duration: '1 min', icon: '💧', name: 'Hydrating Toner', instruction: 'Pat on with hands (not cotton pad). Vietnam\'s AC causes dehydration despite the humid outdoor air.', tip: 'Pressing with palms increases absorption by up to 30%.' },
    { id: 3, time: '7:12 AM', duration: '1 min', icon: '🌿', name: 'Lightweight Moisturizer', instruction: 'Use a gel or water-based formula — heavy creams clog pores in tropical heat.', tip: 'Look for niacinamide to control oil and minimize pores.' },
    { id: 4, time: '7:15 AM', duration: '1 min', icon: '☀️', name: 'SPF 50+ Sunscreen (NON-NEGOTIABLE)', instruction: 'Vietnam\'s UV index regularly hits 11+ (extreme). Apply generously — most people use too little.', tip: 'PA++++ rating preferred. Reapply every 2 hours when outdoors.' }
  ];

  const PM_STEPS = [
    { id: 0, time: '8:00 PM', duration: '2 min', icon: '🧹', name: 'Oil Cleanser / Micellar Water', instruction: 'First cleanse to remove SPF and makeup. This is the most important step — never skip SPF removal.', tip: 'Massage gently for 60 seconds to fully dissolve sunscreen.' },
    { id: 1, time: '8:05 PM', duration: '2 min', icon: '🧴', name: 'Gentle Foaming Cleanser', instruction: 'Second cleanse for a deep clean. Now your cleanser can actually reach your skin.', tip: 'Rinse with cool water — closes pores and refreshes.' },
    { id: 2, time: '8:10 PM', duration: '1 min', icon: '💧', name: 'Hydrating Toner', instruction: 'Preps skin to absorb serums. Pat in — don\'t wipe.', tip: 'Look for toners with hyaluronic acid or glycerin.' },
    { id: 3, time: '8:13 PM', duration: '5 min', icon: '🌙', name: 'Treatment Serum (Retinol OR Niacinamide)', instruction: 'Alternate nights: retinol (anti-aging, cell turnover) and niacinamide (oil control, brightening).', tip: 'Start retinol 2x/week and build up slowly to avoid irritation.' },
    { id: 4, time: '8:18 PM', duration: '1 min', icon: '👁️', name: 'Eye Cream', instruction: 'Apply with ring finger using gentle tapping motions. The ring finger has the lightest touch.', tip: 'Tap from outer corner inward — never rub or stretch this delicate area.' },
    { id: 5, time: '8:21 PM', duration: '2 min', icon: '🌸', name: 'Night Moisturizer', instruction: 'Richer than your day cream. Night is when skin repairs itself — feed it well.', tip: 'Look for ceramides, peptides, or hyaluronic acid.' },
    { id: 6, time: '8:25 PM', duration: '1 min', icon: '💋', name: 'Lip Balm', instruction: 'Apply generously before bed. Lips have no sebaceous glands — they dry out overnight.', tip: 'An occlusive formula (shea butter, lanolin) works best overnight.' }
  ];

  const WEEKLY_TREATMENTS = [
    { day: 'Tuesday', name: 'Gentle Exfoliation', desc: 'BHA/AHA to remove dead skin cells. BHA (salicylic acid) is especially good for humid climates as it penetrates oil.', icon: '🔬' },
    { day: 'Thursday', name: 'Sheet Mask or Hydrating Mask', desc: 'Deep hydration boost. Leave on 15-20 minutes. In Vietnam heat, pop it in the fridge first!', icon: '🎭' },
    { day: 'Saturday', name: 'Deep Pore Cleansing Mask', desc: 'Clay or charcoal mask to draw out impurities. Vietnam\'s pollution makes this essential weekly.', icon: '🌾' }
  ];

  // ─── MEALS data ───────────────────────────────────────────────────────────────
  const MEALS_DB = {
    breakfast: [
      { name: 'Cháo gà', english: 'Chicken Congee with Ginger', cal: 320, protein: '22g', prep: '5 min (buy fresh)', desc: 'Anti-inflammatory, easy on digestion. The ginger boosts metabolism and soothes the stomach.', img: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800&q=80', ingredients: ['Rice porridge', 'Chicken', 'Ginger', 'Spring onions', 'Fish sauce'] },
      { name: 'Bánh mì trứng', english: 'Egg Bánh Mì', cal: 380, protein: '18g', prep: '3 min', desc: 'Protein-rich and portable — perfect for busy teaching mornings.', img: 'https://images.unsplash.com/photo-1600336153113-d66c79de3e91?w=800&q=80', ingredients: ['Baguette', 'Egg', 'Cucumber', 'Coriander', 'Chili sauce'] },
      { name: 'Yến mạch trái cây', english: 'Oatmeal with Tropical Fruits', cal: 310, protein: '12g', prep: '5 min', desc: 'High fiber to keep you full during morning study sessions. Dragon fruit adds antioxidants.', img: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80', ingredients: ['Rolled oats', 'Dragon fruit', 'Banana', 'Soy milk', 'Chia seeds'] },
      { name: 'Súp cua', english: 'Crab Soup', cal: 280, protein: '24g', prep: '5 min (buy fresh)', desc: 'Low calorie, high protein. Crab is rich in zinc — supports hair health and immunity.', img: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80', ingredients: ['Crab meat', 'Tofu', 'Egg', 'Spring onions', 'Pepper'] },
      { name: 'Trứng rau muống', english: 'Scrambled Eggs with Morning Glory', cal: 290, protein: '16g', prep: '8 min', desc: 'Iron-rich morning glory fights the fatigue from Vietnam\'s heat. Eggs provide complete protein.', img: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&q=80', ingredients: ['Eggs', 'Morning glory (rau muống)', 'Garlic', 'Fish sauce', 'Sesame oil'] }
    ],
    lunch: [
      { name: 'Bún bò Huế', english: 'Spicy Beef Noodle Soup', cal: 450, protein: '28g', prep: '3 min (buy fresh)', desc: 'Rich in collagen from the bone broth — great for skin and joint health. The spice boosts metabolism.', img: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800&q=80', ingredients: ['Rice noodles', 'Beef', 'Lemongrass', 'Shrimp paste', 'Herbs'] },
      { name: 'Cơm tấm', english: 'Broken Rice with Grilled Pork', cal: 520, protein: '32g', prep: '5 min (buy)', desc: 'Classic Vietnamese power meal. Ask for extra vegetables, less sauce to keep it clean.', img: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800&q=80', ingredients: ['Broken rice', 'Grilled pork', 'Egg', 'Cucumber', 'Pickled veg'] },
      { name: 'Bánh cuốn', english: 'Steamed Rice Rolls', cal: 340, protein: '18g', prep: '5 min (buy)', desc: 'Light and nutritious. Easy to digest in the midday heat. Great fuel for afternoon teaching.', img: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=800&q=80', ingredients: ['Rice flour sheets', 'Pork', 'Mushrooms', 'Bean sprouts', 'Herbs'] },
      { name: 'Gỏi cuốn', english: 'Fresh Spring Rolls', cal: 280, protein: '16g', prep: '5 min (buy)', desc: 'Perfect in the heat — fresh, light, hydrating. High in vegetables and lean protein.', img: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=800&q=80', ingredients: ['Rice paper', 'Shrimp', 'Vermicelli', 'Lettuce', 'Fresh herbs'] },
      { name: 'Cơm cá chiên', english: 'Fried Fish with Rice', cal: 480, protein: '30g', prep: '5 min (buy)', desc: 'Omega-3 rich fish supports brain function for afternoon lessons and hair health.', img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80', ingredients: ['White rice', 'Fried fish', 'Tomato sauce', 'Vegetables', 'Lime'] }
    ],
    dinner: [
      { name: 'Phở gà', english: 'Chicken Pho', cal: 380, protein: '28g', prep: '3 min (buy)', desc: 'Light, hydrating, protein-rich. Perfect evening meal — not too heavy before sleep.', img: 'https://images.unsplash.com/photo-1618449840665-9ed506d73a34?w=800&q=80', ingredients: ['Rice noodles', 'Chicken', 'Star anise', 'Ginger', 'Bean sprouts', 'Basil'] },
      { name: 'Lẩu rau', english: 'Vegetable Hotpot', cal: 320, protein: '14g', prep: '10 min', desc: 'Low calorie, packed with vitamins. Great for skin health — the variety of vegetables covers multiple micronutrients.', img: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80', ingredients: ['Tofu', 'Mushrooms', 'Leafy greens', 'Corn', 'Broth'] },
      { name: 'Gà nướng sả', english: 'Lemongrass Grilled Chicken', cal: 420, protein: '38g', prep: '5 min (buy marinated)', desc: 'High protein for muscle recovery. Lemongrass is anti-inflammatory and aids digestion.', img: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c2?w=800&q=80', ingredients: ['Chicken', 'Lemongrass', 'Garlic', 'Fish sauce', 'Chili'] },
      { name: 'Cá hấp gừng', english: 'Steamed Fish with Ginger', cal: 360, protein: '34g', prep: '15 min', desc: 'Steaming preserves all nutrients. Ginger reduces inflammation and aids digestion before sleep.', img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80', ingredients: ['White fish', 'Ginger', 'Spring onion', 'Soy sauce', 'Sesame oil'] }
    ],
    snacks: [
      { name: 'Sinh tố nhiệt đới', english: 'Dragon Fruit Smoothie', cal: 180, protein: '6g', prep: '5 min', desc: 'Dragon fruit + banana + soy milk. Antioxidant-rich, naturally sweet, and keeps you hydrated.', img: 'https://images.unsplash.com/photo-1571506165871-ee72a35bc9d4?w=800&q=80', ingredients: ['Dragon fruit', 'Banana', 'Soy milk', 'Ice', 'Honey'] },
      { name: 'Trái cây nhiệt đới', english: 'Tropical Fruit Plate', cal: 150, protein: '2g', prep: '2 min', desc: 'Mangosteen, dragon fruit, longan. Rich in vitamin C, antioxidants, and natural sugars for quick energy.', img: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=800&q=80', ingredients: ['Mangosteen', 'Dragon fruit', 'Longan', 'Mint'] },
      { name: 'Sữa chua trái cây', english: 'Yogurt with Fresh Fruit', cal: 180, protein: '8g', prep: '3 min', desc: 'Probiotics for gut health and skin clarity. Vietnam has excellent local yogurts (Vinamilk).', img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80', ingredients: ['Plain yogurt', 'Seasonal fruit', 'Honey', 'Granola'] }
    ]
  };

  const HABITS_DEF = [
    { id: 'vitamins',    icon: '💊', name: 'Take vitamins',           sub: 'Biotin, Vitamin C, Iron' },
    { id: 'stretch',     icon: '🧘', name: '5-min morning stretch',   sub: 'Flexibility & energy' },
    { id: 'eye2020',     icon: '👁️', name: '20-20-20 eye rule',       sub: 'Every 20 min: look 20ft for 20s' },
    { id: 'walk',        icon: '🚶', name: '10-minute walk',          sub: 'Fresh air & circulation' },
    { id: 'reading',     icon: '📖', name: 'Read before bed',         sub: 'No screens 30 min before sleep' },
    { id: 'breathing',   icon: '🌬️', name: 'Box breathing',           sub: '4-4-4-4 breath cycle' },
    { id: 'sunscreen',   icon: '🌿', name: 'Sunscreen reapplication', sub: 'If going outdoors' },
    { id: 'posture',     icon: '🪑', name: 'Posture check',           sub: 'Every hour at desk' }
  ];

  // ─── Render root ──────────────────────────────────────────────────────────────
  function render(container) {
    _container = container;
    _loadState();
    container.innerHTML = _buildHTML();
    _bindEvents();
  }

  function init() { /* called after render */ }

  function refresh() {
    if (_container) {
      _loadState();
      const content = _container.querySelector('.wellness-tab-content');
      if (content) _renderTabContent(content);
    }
  }

  // ─── HTML skeleton ────────────────────────────────────────────────────────────
  function _buildHTML() {
    return `
<div class="wellness-section">
  <div class="wellness-hero">
    <img src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&q=80"
         alt="Skincare" class="wellness-hero-img" loading="lazy">
    <div class="wellness-hero-overlay">
      <div class="wellness-hero-text">
        <span class="wellness-hero-badge">✦ Daily Wellness</span>
        <h2 class="wellness-hero-title">Your Glow Ritual</h2>
        <p class="wellness-hero-sub">Vietnam tropical care · Soukaina's personal protocol</p>
      </div>
    </div>
  </div>

  <div class="wellness-tabs">
    <button class="wellness-tab ${_activeTab==='skincare'?'active':''}" data-tab="skincare">Skincare</button>
    <button class="wellness-tab ${_activeTab==='haircare'?'active':''}" data-tab="haircare">Haircare</button>
    <button class="wellness-tab ${_activeTab==='nutrition'?'active':''}" data-tab="nutrition">Nutrition</button>
    <button class="wellness-tab ${_activeTab==='habits'?'active':''}" data-tab="habits">Habits</button>
  </div>

  <div class="wellness-tab-content"></div>
</div>

<style>
.wellness-section { padding-bottom: 80px; }
.wellness-hero { position: relative; height: 180px; overflow: hidden; border-radius: 0 0 24px 24px; margin-bottom: 0; }
.wellness-hero-img { width: 100%; height: 100%; object-fit: cover; }
.wellness-hero-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.55)); display: flex; align-items: flex-end; padding: 20px; }
.wellness-hero-text { color: #fff; }
.wellness-hero-badge { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; opacity: 0.9; background: rgba(255,255,255,0.2); padding: 3px 10px; border-radius: 20px; }
.wellness-hero-title { font-size: 24px; font-weight: 700; margin: 6px 0 2px; }
.wellness-hero-sub { font-size: 13px; opacity: 0.8; margin: 0; }
.wellness-tabs { display: flex; gap: 4px; padding: 14px 16px 0; overflow-x: auto; scrollbar-width: none; }
.wellness-tabs::-webkit-scrollbar { display: none; }
.wellness-tab { flex-shrink: 0; padding: 8px 18px; border-radius: 20px; border: 1.5px solid var(--border, #e5e7eb); background: transparent; font-size: 13px; font-weight: 600; color: var(--text-secondary, #6b7280); cursor: pointer; transition: all 0.2s; }
.wellness-tab.active { background: var(--accent, #C9886C); border-color: var(--accent, #C9886C); color: #fff; }
.wellness-tab-content { padding: 16px; }

/* Routine Steps */
.routine-section { margin-bottom: 24px; }
.routine-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.routine-title { font-size: 16px; font-weight: 700; color: var(--text, #111); display: flex; align-items: center; gap: 8px; }
.routine-badge { font-size: 11px; padding: 2px 8px; border-radius: 10px; font-weight: 600; }
.routine-badge.am { background: #FFF3E0; color: #E65100; }
.routine-badge.pm { background: #EDE7F6; color: #4527A0; }
.routine-done-pill { font-size: 12px; color: var(--text-secondary, #6b7280); background: var(--surface2, #f3f4f6); padding: 4px 10px; border-radius: 12px; font-weight: 600; }
.step-card { background: var(--surface, #fff); border-radius: 14px; border: 1.5px solid var(--border, #e5e7eb); padding: 14px; margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start; transition: all 0.2s; position: relative; overflow: hidden; }
.step-card.done { opacity: 0.6; }
.step-card.done::after { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: #4CAF50; border-radius: 3px 0 0 3px; }
.step-num { width: 28px; height: 28px; border-radius: 50%; background: var(--accent-light, #f5ece8); color: var(--accent, #C9886C); font-weight: 700; font-size: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.step-body { flex: 1; }
.step-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
.step-name { font-size: 14px; font-weight: 600; color: var(--text, #111); }
.step-time-badge { font-size: 11px; color: var(--text-secondary, #6b7280); background: var(--surface2, #f3f4f6); padding: 2px 8px; border-radius: 10px; white-space: nowrap; }
.step-instruction { font-size: 13px; color: var(--text-secondary, #6b7280); margin: 4px 0; line-height: 1.5; }
.step-tip { font-size: 12px; color: var(--accent, #C9886C); margin-top: 4px; font-style: italic; }
.step-check { width: 24px; height: 24px; border-radius: 50%; border: 2px solid var(--border, #d1d5db); background: transparent; cursor: pointer; flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.step-check.checked { background: #4CAF50; border-color: #4CAF50; }
.step-check.checked::after { content: '✓'; color: #fff; font-size: 13px; font-weight: 700; }
.weekly-treats { background: linear-gradient(135deg, #f5ece8, #ede7f6); border-radius: 16px; padding: 16px; margin-top: 16px; }
.weekly-treat-item { display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(0,0,0,0.06); }
.weekly-treat-item:last-child { border-bottom: none; padding-bottom: 0; }
.treat-day { font-size: 11px; font-weight: 700; color: #C9886C; width: 75px; flex-shrink: 0; padding-top: 2px; }
.treat-info { flex: 1; }
.treat-name { font-size: 13px; font-weight: 600; color: var(--text, #111); }
.treat-desc { font-size: 12px; color: var(--text-secondary, #6b7280); margin-top: 2px; line-height: 1.4; }

/* Streak dots */
.streak-row { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; margin-top: 8px; }
.streak-dot { width: 28px; height: 28px; border-radius: 50%; font-size: 9px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-direction: column; }
.streak-dot.filled { background: var(--accent, #C9886C); color: #fff; }
.streak-dot.empty { background: var(--surface2, #f3f4f6); color: var(--text-secondary, #9ca3af); border: 1.5px dashed var(--border, #e5e7eb); }
.streak-dot.today-dot { border: 2px solid var(--accent, #C9886C); }

/* AI button */
.ai-btn { display: flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #6B5B95, #C9886C); color: #fff; border: none; border-radius: 14px; padding: 12px 20px; font-size: 14px; font-weight: 600; cursor: pointer; width: 100%; justify-content: center; margin-top: 16px; transition: opacity 0.2s; }
.ai-btn:hover { opacity: 0.9; }
.ai-tip-card { background: linear-gradient(135deg, #f5ece8, #ede7f6); border-radius: 16px; padding: 16px; margin-top: 12px; font-size: 14px; color: var(--text, #111); line-height: 1.7; white-space: pre-wrap; }

/* Hair care */
.hair-week-grid { display: grid; grid-template-columns: 1fr; gap: 10px; }
.hair-day-card { background: var(--surface, #fff); border-radius: 14px; border: 1.5px solid var(--border, #e5e7eb); padding: 16px; }
.hair-day-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.hair-day-name { font-size: 14px; font-weight: 700; color: var(--text, #111); }
.hair-day-tag { font-size: 11px; padding: 2px 8px; border-radius: 10px; background: #E8F5E9; color: #2E7D32; font-weight: 600; }
.hair-activity-name { font-size: 13px; font-weight: 600; color: var(--accent, #C9886C); margin-bottom: 6px; }
.hair-activity-desc { font-size: 12px; color: var(--text-secondary, #6b7280); line-height: 1.5; }
.hair-log-btn { margin-top: 10px; padding: 6px 14px; border-radius: 10px; border: 1.5px solid var(--accent, #C9886C); background: transparent; color: var(--accent, #C9886C); font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.hair-log-btn.logged { background: var(--accent, #C9886C); color: #fff; }
.daily-habits-list { list-style: none; padding: 0; margin: 0; }
.daily-habit-item { display: flex; gap: 12px; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid var(--border, #f3f4f6); }
.daily-habit-item:last-child { border-bottom: none; }
.daily-habit-text { flex: 1; }
.daily-habit-name { font-size: 13px; font-weight: 600; color: var(--text, #111); }
.daily-habit-sub { font-size: 12px; color: var(--text-secondary, #6b7280); margin-top: 1px; }

/* Water tracker */
.water-section { background: linear-gradient(135deg, #e0f2fe, #b3e5fc); border-radius: 16px; padding: 16px; margin-bottom: 20px; }
.water-title { font-size: 15px; font-weight: 700; color: #01579B; margin-bottom: 4px; }
.water-sub { font-size: 12px; color: #0277BD; margin-bottom: 12px; }
.water-drops { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
.water-drop { width: 40px; height: 40px; border-radius: 50%; border: 2px solid #29B6F6; background: transparent; font-size: 18px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
.water-drop.filled { background: #0288D1; border-color: #0288D1; }
.water-count { font-size: 13px; font-weight: 600; color: #01579B; }

/* Nutrition */
.meal-section-header { display: flex; align-items: center; justify-content: space-between; margin: 16px 0 10px; }
.meal-section-title { font-size: 15px; font-weight: 700; color: var(--text, #111); }
.meal-card { background: var(--surface, #fff); border-radius: 16px; border: 1.5px solid var(--border, #e5e7eb); overflow: hidden; margin-bottom: 14px; }
.meal-card-img { width: 100%; height: 140px; object-fit: cover; }
.meal-card-body { padding: 14px; }
.meal-names { margin-bottom: 6px; }
.meal-viet-name { font-size: 16px; font-weight: 700; color: var(--text, #111); }
.meal-eng-name { font-size: 12px; color: var(--text-secondary, #6b7280); margin-left: 6px; }
.meal-meta { display: flex; gap: 12px; margin-bottom: 8px; flex-wrap: wrap; }
.meal-meta-item { font-size: 12px; color: var(--text-secondary, #6b7280); background: var(--surface2, #f3f4f6); padding: 3px 8px; border-radius: 8px; font-weight: 600; }
.meal-desc { font-size: 13px; color: var(--text-secondary, #6b7280); line-height: 1.5; margin-bottom: 8px; }
.meal-ingredients { display: flex; gap: 6px; flex-wrap: wrap; }
.meal-ingredient { font-size: 11px; background: var(--accent-light, #f5ece8); color: var(--accent, #C9886C); padding: 2px 8px; border-radius: 8px; font-weight: 500; }
.calories-summary { background: var(--surface, #fff); border-radius: 16px; border: 1.5px solid var(--border, #e5e7eb); padding: 16px; margin-top: 16px; }
.calories-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.calories-title { font-size: 15px; font-weight: 700; }
.calories-count { font-size: 22px; font-weight: 800; color: var(--accent, #C9886C); }
.calories-goal { font-size: 12px; color: var(--text-secondary, #6b7280); }
.calories-bar-bg { height: 8px; background: var(--surface2, #f3f4f6); border-radius: 4px; overflow: hidden; }
.calories-bar-fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg, #7A9B6C, #C9886C); transition: width 0.5s; }
.meal-plan-hero { background: linear-gradient(135deg, #7A9B6C22, #C9886C22); border-radius: 16px; padding: 16px; margin-bottom: 16px; text-align: center; }
.meal-plan-hero h3 { font-size: 18px; font-weight: 700; margin: 0 0 4px; }
.meal-plan-hero p { font-size: 13px; color: var(--text-secondary, #6b7280); margin: 0 0 12px; }

/* Habits */
.habits-section { }
.habit-card { background: var(--surface, #fff); border-radius: 14px; border: 1.5px solid var(--border, #e5e7eb); padding: 14px; margin-bottom: 8px; display: flex; align-items: center; gap: 14px; transition: all 0.2s; }
.habit-card.done { opacity: 0.65; border-color: #4CAF50; background: #f0faf0; }
.habit-icon { font-size: 22px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: var(--surface2, #f3f4f6); border-radius: 12px; flex-shrink: 0; }
.habit-info { flex: 1; }
.habit-name { font-size: 14px; font-weight: 600; color: var(--text, #111); }
.habit-sub-text { font-size: 12px; color: var(--text-secondary, #6b7280); margin-top: 2px; }
.habit-streak-badge { font-size: 11px; font-weight: 700; background: #FFF3E0; color: #E65100; padding: 2px 7px; border-radius: 8px; }
.habit-check-btn { width: 28px; height: 28px; border-radius: 50%; border: 2px solid var(--border, #d1d5db); background: transparent; cursor: pointer; flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: all 0.2s; font-size: 14px; }
.habit-check-btn.done { background: #4CAF50; border-color: #4CAF50; color: #fff; }
.habit-score-card { background: linear-gradient(135deg, #7A9B6C22, #C9886C22); border-radius: 14px; padding: 14px; margin-bottom: 16px; text-align: center; }
.habit-score-num { font-size: 32px; font-weight: 800; color: var(--accent, #C9886C); }
.habit-score-label { font-size: 13px; color: var(--text-secondary, #6b7280); margin-top: 2px; }
.heatmap-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-top: 8px; }
.heatmap-day { aspect-ratio: 1; border-radius: 4px; font-size: 9px; display: flex; align-items: center; justify-content: center; font-weight: 600; }
.heatmap-day.full { background: var(--accent, #C9886C); color: #fff; }
.heatmap-day.partial { background: #f5d9cd; color: var(--accent, #C9886C); }
.heatmap-day.empty { background: var(--surface2, #f3f4f6); color: var(--text-secondary, #9ca3af); }
.section-label { font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--text-secondary, #6b7280); margin: 16px 0 8px; }
</style>`;
  }

  // ─── Render tab content ───────────────────────────────────────────────────────
  function _renderTabContent(el) {
    switch (_activeTab) {
      case 'skincare':   el.innerHTML = _skincareHTML(); break;
      case 'haircare':   el.innerHTML = _haircareHTML(); break;
      case 'nutrition':  el.innerHTML = _nutritionHTML(); break;
      case 'habits':     el.innerHTML = _habitsHTML(); break;
    }
    _bindTabEvents(el);
  }

  // ─── SKINCARE tab ─────────────────────────────────────────────────────────────
  function _skincareHTML() {
    const amDone = _state.skincare.amStepsDone.length;
    const pmDone = _state.skincare.pmStepsDone.length;
    const today = new Date();
    const days = ['S','M','T','W','T','F','S'];

    // Build 7-day streak dots
    let streakDots = '';
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const isToday = i === 0;
      const filled = (_state.skincare.streakDates || []).includes(iso);
      const dayLabel = days[d.getDay()];
      streakDots += `<div class="streak-dot ${filled ? 'filled' : 'empty'} ${isToday ? 'today-dot' : ''}" title="${iso}">${dayLabel}</div>`;
    }

    return `
<div class="section-label">AM Routine</div>
<div class="routine-section">
  <div class="routine-header">
    <div class="routine-title">☀️ Morning Protocol <span class="routine-badge am">AM</span></div>
    <div class="routine-done-pill">${amDone}/${AM_STEPS.length} done</div>
  </div>
  ${AM_STEPS.map(s => _stepCardHTML(s, 'am')).join('')}
</div>

<div class="section-label">Weekly Treatments</div>
<div class="weekly-treats">
  <div style="font-size:14px;font-weight:700;margin-bottom:10px;color:var(--text,#111)">📅 Weekly Extras</div>
  ${WEEKLY_TREATMENTS.map(t => `
  <div class="weekly-treat-item">
    <div class="treat-day">${t.icon} ${t.day}</div>
    <div class="treat-info">
      <div class="treat-name">${t.name}</div>
      <div class="treat-desc">${t.desc}</div>
    </div>
  </div>`).join('')}
</div>

<div class="section-label" style="margin-top:20px">PM Routine</div>
<div class="routine-section">
  <div class="routine-header">
    <div class="routine-title">🌙 Evening Protocol <span class="routine-badge pm">PM</span></div>
    <div class="routine-done-pill">${pmDone}/${PM_STEPS.length} done</div>
  </div>
  ${PM_STEPS.map(s => _stepCardHTML(s, 'pm')).join('')}
</div>

<div class="section-label">7-Day Progress</div>
<div class="glass-card" style="padding:14px;margin-bottom:8px;">
  <div style="font-size:14px;font-weight:700;margin-bottom:8px;">Routine Streak ✨</div>
  <div style="font-size:12px;color:var(--text-secondary,#6b7280);margin-bottom:8px;">AM Streak: <strong>${_state.skincare.amStreak} days</strong> · PM Streak: <strong>${_state.skincare.pmStreak} days</strong></div>
  <div class="streak-row">${streakDots}</div>
</div>

<button class="ai-btn" id="skin-ai-btn">✦ Get AI Skincare Tip for Today</button>
<div id="skin-ai-result"></div>`;
  }

  function _stepCardHTML(step, type) {
    const doneArr = type === 'am' ? _state.skincare.amStepsDone : _state.skincare.pmStepsDone;
    const isDone = doneArr.includes(step.id);
    return `
<div class="step-card ${isDone ? 'done' : ''}" data-step="${step.id}" data-type="${type}">
  <div class="step-num">${step.icon}</div>
  <div class="step-body">
    <div class="step-top">
      <div class="step-name">${step.name}</div>
      <div class="step-time-badge">⏰ ${step.time} · ${step.duration}</div>
    </div>
    <div class="step-instruction">${step.instruction}</div>
    <div class="step-tip">💡 ${step.tip}</div>
  </div>
  <button class="step-check ${isDone ? 'checked' : ''}" data-step="${step.id}" data-type="${type}" aria-label="Mark done"></button>
</div>`;
  }

  // ─── HAIRCARE tab ─────────────────────────────────────────────────────────────
  function _haircareHTML() {
    const today = new Date().toISOString().split('T')[0];
    const acts = _state.haircare.activities || {};

    const schedule = [
      { day: 'Monday', tag: 'Day Off', activity: 'Rosemary + Castor Oil Scalp Massage', key: 'oil',
        desc: 'Mix 3-4 drops rosemary essential oil with 1 tbsp castor oil. Warm slightly. Section hair and apply directly to scalp. Massage for 10-15 minutes in circular motions. Leave overnight or minimum 4 hours.<br><br>This combination is clinically shown to rival minoxidil for hair regrowth without side effects. 🌿' },
      { day: 'Wednesday', tag: 'Wash Day', activity: 'Full Wash Routine', key: 'wash',
        desc: '1. Scalp massage before washing (5 min)<br>2. Clarifying shampoo (removes oil buildup)<br>3. Hydrating shampoo<br>4. Deep conditioner (10-15 min with shower cap)<br>5. Cool water final rinse<br>6. Microfiber towel only<br>7. Air dry — no heat needed in Vietnam' },
      { day: 'Friday', tag: 'Treatment', activity: 'Rice Water Treatment', key: 'rice',
        desc: 'Soak rice in water for 30 min, strain, apply rice water to hair, leave 20 min. Rich in inositol that repairs damaged hair. Use jasmine rice for extra fragrance — available everywhere in Vietnam. 🍚' },
      { day: 'Saturday', tag: 'Protection', activity: 'Protective Styling', key: 'protect',
        desc: 'Loose braids or a silk scrunchie bun to minimize friction damage in Vietnam\'s wind and heat. The goal is to minimize manipulation and breakage on rest days.' }
    ];

    const dailyHabits = [
      'Silk/satin pillowcase — reduces friction hair loss overnight',
      'No tight hairstyles during humid days (ponytail pressure causes breakage)',
      'Vitamins: Biotin, Iron, Zinc (available at Long Châu, Pharmacity)',
      'Gentle detangling — always start from ends, work upward'
    ];

    return `
<div class="section-label">Weekly Schedule</div>
<div class="hair-week-grid">
  ${schedule.map(s => {
    const wasLogged = acts[s.key] === today;
    return `
  <div class="hair-day-card">
    <div class="hair-day-header">
      <div class="hair-day-name">📅 ${s.day}</div>
      <div class="hair-day-tag">${s.tag}</div>
    </div>
    <div class="hair-activity-name">${s.activity}</div>
    <div class="hair-activity-desc">${s.desc}</div>
    <button class="hair-log-btn ${wasLogged ? 'logged' : ''}" data-key="${s.key}">
      ${wasLogged ? '✓ Logged today' : 'Log as done today'}
    </button>
  </div>`;
  }).join('')}
</div>

<div class="section-label">Daily Hair Habits</div>
<div class="glass-card" style="padding:14px;margin-bottom:16px;">
  <ul class="daily-habits-list">
    ${dailyHabits.map(h => `
    <li class="daily-habit-item">
      <span style="font-size:16px;">💚</span>
      <div class="daily-habit-text">
        <div class="daily-habit-name" style="font-size:13px;color:var(--text,#111)">${h}</div>
      </div>
    </li>`).join('')}
  </ul>
</div>

<div class="glass-card" style="padding:14px;background:linear-gradient(135deg,#f1f8e9,#e8f5e9);border:none;">
  <div style="font-size:14px;font-weight:700;margin-bottom:6px;color:#2E7D32;">💊 Vietnam Pharmacy Tips</div>
  <div style="font-size:13px;color:#388E3C;line-height:1.6;">
    Find these at <strong>Long Châu</strong> or <strong>Pharmacity</strong> nationwide:<br>
    • Biotin (Biotine / Biotin 5000mcg tablets)<br>
    • Iron supplements (Sắt / Ferrous sulfate)<br>
    • Zinc (Kẽm / Zinc gluconate)<br>
    • Rosemary essential oil (online: Shopee, Lazada)
  </div>
</div>`;
  }

  // ─── NUTRITION tab ────────────────────────────────────────────────────────────
  function _nutritionHTML() {
    const today = new Date();
    const dow = today.getDay(); // 0=Sun
    const meals = _state.meals;

    // Pick default meal based on day of week
    const bf = MEALS_DB.breakfast[dow % MEALS_DB.breakfast.length];
    const ln = MEALS_DB.lunch[dow % MEALS_DB.lunch.length];
    const dn = MEALS_DB.dinner[dow % MEALS_DB.dinner.length];
    const sn1 = MEALS_DB.snacks[0];
    const sn2 = MEALS_DB.snacks[1];

    const totalCal = (meals.calories > 0 ? meals.calories : bf.cal + ln.cal + dn.cal + sn1.cal);
    const goalMin = 1600, goalMax = 1800;
    const pct = Math.min(100, Math.round((totalCal / goalMax) * 100));

    // Water
    const wCount = _state.water.count;
    const wGoal = _state.water.goal || 8;

    return `
<div class="meal-plan-hero">
  <h3>Today's Menu 🌿</h3>
  <p>Curated for Vietnam's tropical climate · ${window.SovereignUtils.formatDate(today)}</p>
  <button class="btn-primary" id="gen-meal-btn" style="padding:10px 20px;font-size:13px;">✦ Generate AI Meal Plan</button>
</div>

<div id="meal-plan-container">
  <div class="meal-section-header"><div class="meal-section-title">🌅 Breakfast</div></div>
  ${_mealCardHTML(bf)}

  <div class="meal-section-header"><div class="meal-section-title">☀️ Lunch</div></div>
  ${_mealCardHTML(ln)}

  <div class="meal-section-header"><div class="meal-section-title">🌙 Dinner</div></div>
  ${_mealCardHTML(dn)}

  <div class="meal-section-header"><div class="meal-section-title">🍎 Snacks</div></div>
  ${_mealCardHTML(sn1)}
  ${_mealCardHTML(sn2)}
</div>

<div class="water-section">
  <div class="water-title">💧 Hydration Tracker</div>
  <div class="water-sub">In Ho Chi Minh City's heat (35°C+), you need minimum 2.5L daily</div>
  <div class="water-drops">
    ${Array.from({length: wGoal}, (_, i) => `
    <button class="water-drop ${i < wCount ? 'filled' : ''}" data-drop="${i}" aria-label="Water glass ${i+1}">
      ${i < wCount ? '💧' : '○'}
    </button>`).join('')}
  </div>
  <div class="water-count">${wCount} of ${wGoal} glasses today${wCount >= wGoal ? ' · 🎉 Goal reached!' : ''}</div>
</div>

<div class="calories-summary">
  <div class="calories-row">
    <div class="calories-title">Calories Today</div>
    <div>
      <div class="calories-count">${totalCal}</div>
      <div class="calories-goal">Goal: ${goalMin}–${goalMax} cal</div>
    </div>
  </div>
  <div class="calories-bar-bg"><div class="calories-bar-fill" style="width:${pct}%"></div></div>
  <div style="font-size:12px;color:var(--text-secondary,#6b7280);margin-top:6px;">${pct}% of daily goal</div>
</div>

<div id="ai-meal-result" style="display:none;" class="ai-tip-card"></div>`;
  }

  function _mealCardHTML(m) {
    if (!m) return '';
    return `
<div class="meal-card">
  <img src="${m.img}" alt="${m.english}" class="meal-card-img" loading="lazy">
  <div class="meal-card-body">
    <div class="meal-names">
      <span class="meal-viet-name">${m.name}</span>
      <span class="meal-eng-name">${m.english}</span>
    </div>
    <div class="meal-meta">
      <span class="meal-meta-item">🔥 ${m.cal} cal</span>
      <span class="meal-meta-item">💪 ${m.protein} protein</span>
      <span class="meal-meta-item">⏱ ${m.prep}</span>
    </div>
    <div class="meal-desc">${m.desc}</div>
    <div class="meal-ingredients">${(m.ingredients || []).map(i => `<span class="meal-ingredient">${i}</span>`).join('')}</div>
  </div>
</div>`;
  }

  // ─── HABITS tab ───────────────────────────────────────────────────────────────
  function _habitsHTML() {
    const today = new Date().toISOString().split('T')[0];
    let doneCnt = 0;

    // Build 7-day heatmap
    const heatDays = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      heatDays.push(d.toISOString().split('T')[0]);
    }

    const habitCards = HABITS_DEF.map(h => {
      const hState = (_state.habits[h.id] || { completedDates: [], streak: 0 });
      const isDone = hState.completedDates && hState.completedDates.includes(today);
      if (isDone) doneCnt++;
      return `
<div class="habit-card ${isDone ? 'done' : ''}" data-habit="${h.id}">
  <div class="habit-icon">${h.icon}</div>
  <div class="habit-info">
    <div class="habit-name">${h.name}</div>
    <div class="habit-sub-text">${h.sub}</div>
  </div>
  ${hState.streak > 0 ? `<span class="habit-streak-badge">🔥 ${hState.streak}d</span>` : ''}
  <button class="habit-check-btn ${isDone ? 'done' : ''}" data-habit="${h.id}" aria-label="Toggle habit">
    ${isDone ? '✓' : ''}
  </button>
</div>`;
    }).join('');

    const heatRows = heatDays.map(d => {
      const total = HABITS_DEF.length;
      let cnt = 0;
      HABITS_DEF.forEach(h => {
        const hs = _state.habits[h.id] || { completedDates: [] };
        if ((hs.completedDates || []).includes(d)) cnt++;
      });
      const pct = cnt / total;
      const cls = pct >= 1 ? 'full' : pct >= 0.5 ? 'partial' : 'empty';
      const dayLabel = new Date(d).toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1);
      return `<div class="heatmap-day ${cls}" title="${d}: ${cnt}/${total}">${dayLabel}</div>`;
    }).join('');

    return `
<div class="habit-score-card">
  <div class="habit-score-num">${doneCnt} / ${HABITS_DEF.length}</div>
  <div class="habit-score-label">Today's wellness habits complete ✦</div>
</div>

<div class="section-label">7-Day Heatmap</div>
<div class="glass-card" style="padding:14px;margin-bottom:16px;">
  <div class="heatmap-grid">${heatRows}</div>
</div>

<div class="section-label">Today's Habits</div>
${habitCards}

<button class="ai-btn" id="habits-ai-btn">✦ Get AI Wellness Tips</button>
<div id="habits-ai-result"></div>`;
  }

  // ─── Event binding ────────────────────────────────────────────────────────────
  function _bindEvents() {
    const el = _container;

    // Tab switching
    el.querySelectorAll('.wellness-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        _activeTab = btn.dataset.tab;
        el.querySelectorAll('.wellness-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const content = el.querySelector('.wellness-tab-content');
        _renderTabContent(content);
      });
    });

    // Initial render
    const content = el.querySelector('.wellness-tab-content');
    _renderTabContent(content);
  }

  function _bindTabEvents(el) {
    // Step checkboxes
    el.querySelectorAll('.step-check').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const stepId = parseInt(btn.dataset.step);
        const type = btn.dataset.type;
        const arr = type === 'am' ? _state.skincare.amStepsDone : _state.skincare.pmStepsDone;
        const idx = arr.indexOf(stepId);
        if (idx === -1) arr.push(stepId);
        else arr.splice(idx, 1);
        // Check if full routine done
        const full = type === 'am' ? AM_STEPS : PM_STEPS;
        if (arr.length === full.length) {
          if (type === 'am') _state.skincare.amDone = true;
          else _state.skincare.pmDone = true;
          const today = new Date().toISOString().split('T')[0];
          if (!(_state.skincare.streakDates || []).includes(today)) {
            _state.skincare.streakDates = _state.skincare.streakDates || [];
            _state.skincare.streakDates.push(today);
          }
          window.SovereignUtils.toast(`${type === 'am' ? 'AM' : 'PM'} routine complete! ✨`);
        }
        _saveState();
        // Re-render skincare tab
        _renderTabContent(el.closest('.wellness-tab-content') || el.parentElement);
      });
    });

    // Hair log buttons
    el.querySelectorAll('.hair-log-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        const today = new Date().toISOString().split('T')[0];
        _state.haircare.activities = _state.haircare.activities || {};
        if (_state.haircare.activities[key] === today) {
          delete _state.haircare.activities[key];
          window.SovereignUtils.toast('Activity unlogged');
        } else {
          _state.haircare.activities[key] = today;
          window.SovereignUtils.toast('Activity logged! 💚');
        }
        _saveState();
        _renderTabContent(el.closest('.wellness-tab-content') || el.parentElement);
      });
    });

    // Water drops
    el.querySelectorAll('.water-drop').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.drop);
        const newCount = i < _state.water.count ? i : i + 1;
        _state.water.count = Math.max(0, Math.min(_state.water.goal, newCount));
        if (_state.water.count >= _state.water.goal) {
          window.SovereignUtils.toast('Hydration goal reached! 💧');
        }
        _saveState();
        _renderTabContent(el.closest('.wellness-tab-content') || el.parentElement);
      });
    });

    // Habit checkboxes
    el.querySelectorAll('.habit-check-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const hId = btn.dataset.habit;
        const today = new Date().toISOString().split('T')[0];
        if (!_state.habits[hId]) _state.habits[hId] = { completedDates: [], streak: 0 };
        const hs = _state.habits[hId];
        const idx = hs.completedDates.indexOf(today);
        if (idx === -1) {
          hs.completedDates.push(today);
          hs.streak = (hs.streak || 0) + 1;
          window.SovereignUtils.toast('Habit logged! 🌟');
          if (window.SovereignReminders) window.SovereignReminders.playSound('crystal-bell');
        } else {
          hs.completedDates.splice(idx, 1);
          hs.streak = Math.max(0, (hs.streak || 1) - 1);
        }
        _saveState();
        _renderTabContent(el.closest('.wellness-tab-content') || el.parentElement);
      });
    });

    // AI skincare tip
    const skinAiBtn = el.querySelector('#skin-ai-btn');
    if (skinAiBtn) {
      skinAiBtn.addEventListener('click', async () => {
        const res = el.querySelector('#skin-ai-result');
        if (!window.ClaudeAI.isReady()) {
          window.SovereignUtils.toast('Add your Claude API key in Settings first ✦');
          return;
        }
        skinAiBtn.disabled = true;
        skinAiBtn.textContent = 'Getting tip...';
        res.innerHTML = '<div class="shimmer-loading" style="height:80px;border-radius:12px;"></div>';
        try {
          const tip = await window.ClaudeAI.chat([
            { role: 'user', content: 'Give me one specific, actionable skincare tip for today. Consider Vietnam\'s tropical climate and my routine. Keep it under 100 words.' }
          ], 'You are Soukaina\'s personal skincare advisor for tropical Vietnam climate.');
          res.innerHTML = `<div class="ai-tip-card">✦ ${window.SovereignUtils.sanitizeHtml(tip)}</div>`;
        } catch (e) {
          res.innerHTML = `<div class="ai-tip-card" style="color:var(--accent,#C9886C);">⚠️ ${e.message}</div>`;
        }
        skinAiBtn.disabled = false;
        skinAiBtn.textContent = '✦ Get AI Skincare Tip for Today';
      });
    }

    // AI wellness tips
    const habitsAiBtn = el.querySelector('#habits-ai-btn');
    if (habitsAiBtn) {
      habitsAiBtn.addEventListener('click', async () => {
        const res = el.querySelector('#habits-ai-result');
        if (!window.ClaudeAI.isReady()) {
          window.SovereignUtils.toast('Add your Claude API key in Settings first ✦');
          return;
        }
        habitsAiBtn.disabled = true;
        habitsAiBtn.textContent = 'Getting tips...';
        res.innerHTML = '<div class="shimmer-loading" style="height:100px;border-radius:12px;"></div>';
        try {
          const tips = await window.ClaudeAI.generateWellnessTips();
          res.innerHTML = `<div class="ai-tip-card">✦ ${window.SovereignUtils.sanitizeHtml(tips)}</div>`;
        } catch (e) {
          res.innerHTML = `<div class="ai-tip-card" style="color:var(--accent,#C9886C);">⚠️ ${e.message}</div>`;
        }
        habitsAiBtn.disabled = false;
        habitsAiBtn.textContent = '✦ Get AI Wellness Tips';
      });
    }

    // Generate AI meal plan
    const genBtn = el.querySelector('#gen-meal-btn');
    if (genBtn) {
      genBtn.addEventListener('click', async () => {
        if (!window.ClaudeAI.isReady()) {
          window.SovereignUtils.toast('Add your Claude API key in Settings first ✦');
          return;
        }
        genBtn.disabled = true;
        genBtn.textContent = 'Generating...';
        const container = el.querySelector('#meal-plan-container');
        const aiRes = el.querySelector('#ai-meal-result');
        container.innerHTML = '<div class="shimmer-loading" style="height:200px;border-radius:16px;margin-bottom:10px;"></div>'.repeat(3);
        try {
          const today = new Date().toISOString().split('T')[0];
          const plan = await window.ClaudeAI.generateMealPlan(today);
          aiRes.style.display = 'block';
          aiRes.textContent = plan;
          container.innerHTML = `<div class="ai-tip-card">${window.SovereignUtils.sanitizeHtml(plan)}</div>`;
        } catch (e) {
          container.innerHTML = `<div class="ai-tip-card" style="color:var(--accent,#C9886C);">⚠️ ${e.message}<br><br>Showing default meal plan.</div>`;
        }
        genBtn.disabled = false;
        genBtn.textContent = '✦ Generate AI Meal Plan';
      });
    }
  }

  return { render, init, refresh };
})();
