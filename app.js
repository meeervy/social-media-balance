/* ==========================================================================
   SOCIAL MEDIA BALANCE — APPLICATION LOGIC (Supabase-backed)
   Astana IT University • ICT Course • HCI Assignment 2
   All data access goes through window.API (js/api.js). This module only
   handles UI state, rendering and event wiring.
   ========================================================================== */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Translations (only keys referenced by data-i18n or code)
  // ---------------------------------------------------------------------------
  const i18n = {
    ru: {
      brandBadge: 'AITU • HCI Проект',
      brandSubtitle: 'Система цифрового баланса и осознанных привычек',
      tabSimulator: '📱 Симулятор & Барьеры',
      tabStudio: '🎨 Студия Lock Screen',
      tabAnalytics: '📊 Аналитика студента & Пульс AITU',

      authorsTag: 'Авторы: Дильназ Нурумова & Гульжан Нагасбай • Astana IT University',
      heroTitle: 'Мягкие барьеры вместо жестких блокировок',
      heroSubtitle: 'Человеко-ориентированная ICT-платформа: замена импульсивного сброса паролей на полезные физические и интеллектуальные микро-задания, упреждающие 80% подсказки и адаптивные виджеты экрана блокировки.',
      screenTimeTitle: 'Регулятор экранного времени за день',
      capLabelFmt: 'Лимит: {cap}',

      stateHealthy: 'Здоровый режим (<70%)',
      stateWarning: 'Мягкий сигнал (80% Nudge)',
      stateCritical: 'Переход к фокусу (100% Cap)',

      scenarioHealthyFmt: '{t} (Норма)',
      scenarioNudgeFmt: '{t} (80% Nudge)',
      scenarioCriticalFmt: '{t} (100% Лимит)',

      barrierSectionTitle: 'Дисциплинарные микро-барьеры при 100% лимите (из Отчета потребностей):',
      barrierPushupsTitle: '💪 Физический барьер',
      barrierPushupsDesc: '10 отжиманий или приседаний. Включает тело и выводит из транса соцсетей.',
      barrierMathTitle: '🧠 Ментальная пауза',
      barrierMathDesc: 'Быстрая задача на устный счет. Активирует префронтальную кору мозга.',
      barrierBreathTitle: '🌬️ Дыхание 4-7-8',
      barrierBreathDesc: '60 секунд сенсорной перезагрузки для снижения тревожности и FoMO.',
      barrierEmergencyTitle: '🛡️ Срочный пропуск (HCI #5)',
      barrierEmergencyDesc: 'Разблокировка для экстренной учебы с обязательной фиксацией причины.',

      phoneAppLabel: 'Instagram / Reels',
      phoneLeftLabel: 'Осталось:',
      phoneNudgeTitle: 'Время сделать учебную паузу',
      phoneNudgeDesc: 'Вы использовали 80% суточного лимита. До дедлайна по сдаче задания осталось мало времени!',
      phoneLockTitle: 'Лимит времени исчерпан',
      phoneLockDesc: 'Доступ временно приостановлен для сохранения фокуса на учебе.',
      btnPushupAction: 'Засчитать повторение',
      btnSubmitMath: 'Проверить',
      btnEmergencyPassLink: 'Срочный доступ по учебе (HCI #5)',
      emergencyTitle: 'Экстренный учебный доступ',
      emergencyDesc: 'Эвристика Нильсена #5 (Предотвращение ошибок & Гибкость): система не блокирует экстренную связь, но фиксирует причину для вечерней рефлексии.',
      emergencyPlaceholder: 'Укажите причину (например: срочное сообщение от старосты или преподавателя)...',
      btnConfirmEmergency: 'Зафиксировать причину и продлить на 15 мин',
      unlockSuccessToast: '✅ Доступ открыт на 15 минут осознанной работы!',
      barrierSuccessToast: '✅ Барьер пройден! Суточное использование сброшено до 75% лимита.',
      reasonTooShort: 'Пожалуйста, укажите причину (мин. 3 символа) для журнала рефлексии.',
      reflectionTitle: 'Журнал вечерней рефлексии (экстренные пропуски за сегодня)',
      reflectionEmpty: 'Записей нет — сегодня вы не использовали экстренные пропуски. 👏',
      grantFmt: '+{m} мин',

      studioTitle: 'WYSIWYG Редактор виджетов экрана блокировки',
      studioDesc: 'Интерактивный конфигуратор на основе эвристики Нильсена #1 (Осведомленность о состоянии). Настраивайте виджеты со 100% соответствием мобильному Lock Screen справа.',
      labelWallpapers: '1. Фоновое изображение (с адаптивным слоем контраста Smart Scrim):',
      labelLayouts: '2. Тип метафоры отображения (Match with real world):',
      layoutGauge: 'Трехцветная шкала',
      layoutSticky: 'Стикер задач',
      layoutPill: 'Компактный стиль',
      labelQuickCapture: '3. Быстрый ввод заметки (Quick Capture в 1-2 клика):',
      autosaveActive: '● Автосохранение активно',
      autosaveSaved: '✓ Сохранено',

      analyticsTitle: 'Аналитика студента & Пульс кампуса AITU',
      analyticsDesc: 'Комплексный мониторинг персонального фокуса, расписания, когнитивной нагрузки и коллективного цифрового здоровья университета.',
      fomoMetricTitle: 'Индекс фрагментации внимания (FoMO Switch Rate)',
      fomoHintHigh: 'Высокая частота переключений',
      fomoHintOk: 'Умеренная частота переключений',
      fomoHintLow: 'Низкая фрагментация внимания',
      fomoDescFmt: 'Оценка ~{n} переключений в час по {apps} активным платформам сегодня. Рекомендация: сгруппировать уведомления в 25-минутные учебные спринты Pomodoro.',
      fomoDescEmpty: 'Сегодня данных об использовании пока нет.',
      appDistributionTitle: 'Распределение экранного времени за сегодня',
      distEmpty: 'Нет записей за сегодня — подвигайте слайдер или дождитесь синхронизации.',
      studySyncTitle: 'Синхронизация с расписанием Astana IT University',
      badgeActiveNow: 'Сейчас идет',
      badgePlanned: 'Запланировано',
      badgeDone: 'Завершено',
      scheduleEmpty: 'На сегодня занятий нет.',
      campusTitle: 'AITU Campus Observatory — Пульс цифрового здоровья',
      campusSubtitle: 'Анонимизированная агрегированная телеметрия кампуса Astana IT University для анализа стрессовых нагрузок и перегрузки экранным временем во время сессий (Ivanov & Smirnova, 2023).',
      statStudentsActive: 'Активных студентов в фокус-режиме',
      statTimeSaved: 'Сэкономлено от думскроллинга',
      statOverrideRate: 'Снижение импульсивных сбросов блокировок',
      weekTrendFmt: '↑ +{n}% за текущую неделю сессии',
      timeSavedHint: 'Перенаправлено на подготовку к проектам',
      overrideHint: 'Благодаря полезным физическим микро-барьерам',
      zonesTitle: 'Зоны осознанной тишины кампуса AITU',
      zoneLoadFmt: 'Загрузка фокус-режима: {n}%',

      authSub: 'Войдите, чтобы синхронизировать привычки и данные',
      authTabLogin: 'Вход',
      authTabRegister: 'Регистрация',
      authNameLabel: 'Отображаемое имя',
      authPassLabel: 'Пароль',
      authBtnLogin: 'Войти',
      authBtnRegister: 'Создать аккаунт',
      authCheckEmail: '📬 Проверьте почту для подтверждения аккаунта, затем войдите.',
      errEmail: 'Введите корректный email.',
      errPassEmpty: 'Введите пароль.',
      errPassShort: 'Пароль должен содержать не менее 6 символов.',
      errLogin: 'Не удалось войти',
      errRegister: 'Не удалось зарегистрироваться',
      errData: 'Ошибка загрузки данных из базы.',
      errSave: 'Не удалось сохранить изменения в базу.',
      btnLogout: 'Выйти'
    },
    en: {
      brandBadge: 'AITU • HCI Project',
      brandSubtitle: 'Digital Well-Being & Mindful Technology Platform',
      tabSimulator: '📱 Simulator & Barriers',
      tabStudio: '🎨 Lock Screen Studio',
      tabAnalytics: '📊 Student Dashboard & Campus Pulse',

      authorsTag: 'Authors: Dilnaz Nurumova & Gulzhan Nagasbay • Astana IT University',
      heroTitle: 'Supportive Friction Over Disruptive Lockouts',
      heroSubtitle: 'A human-centered ICT solution replacing rigid lockout traps with gamified physical/intellectual micro-barriers, proactive 80% threshold nudges, and ambient lock screen widgets.',
      screenTimeTitle: 'Daily Screen Time Controller',
      capLabelFmt: 'Cap: {cap}',

      stateHealthy: 'Healthy State (<70%)',
      stateWarning: 'Soft Nudge (80% Trigger)',
      stateCritical: 'Mindful Transition (100% Cap)',

      scenarioHealthyFmt: '{t} (Normal)',
      scenarioNudgeFmt: '{t} (80% Nudge)',
      scenarioCriticalFmt: '{t} (100% Cap)',

      barrierSectionTitle: 'Gamified Micro-Barriers at 100% Cap (User Needs Report):',
      barrierPushupsTitle: '💪 Physical Barrier',
      barrierPushupsDesc: '10 push-ups or squats. Awakens physical physiology and breaks doomscrolling trance.',
      barrierMathTitle: '🧠 Prefrontal Reset',
      barrierMathDesc: 'Rapid mental math challenge. Re-engages the rational prefrontal cortex.',
      barrierBreathTitle: '🌬️ 4-7-8 Mindful Breath',
      barrierBreathDesc: '60-second sensory regulation circle to diffuse FoMO and cognitive fatigue.',
      barrierEmergencyTitle: '🛡️ Emergency Pass (HCI #5)',
      barrierEmergencyDesc: 'Urgent academic unlock with mandatory written reflection on motive.',

      phoneAppLabel: 'Instagram / Reels',
      phoneLeftLabel: 'Remaining:',
      phoneNudgeTitle: 'Time for a Mindful Study Break',
      phoneNudgeDesc: 'You have reached 80% of your daily limit. Your assignment deadline is approaching!',
      phoneLockTitle: 'Daily Limit Reached',
      phoneLockDesc: 'Screen access paused to protect deep focus and study momentum.',
      btnPushupAction: 'Log Repetition',
      btnSubmitMath: 'Verify',
      btnEmergencyPassLink: 'Emergency Academic Bypass (HCI #5)',
      emergencyTitle: 'Emergency Academic Pass',
      emergencyDesc: 'Nielsen Heuristic #5 (Error Prevention & Flexibility): The system does not trap urgent tasks, but logs override motives for evening reflection.',
      emergencyPlaceholder: 'Enter urgent reason (e.g., group assignment deadline discussion)...',
      btnConfirmEmergency: 'Log Reason & Unlock 15 Mins',
      unlockSuccessToast: '✅ Unlocked 15 minutes of intentional focus session!',
      barrierSuccessToast: '✅ Barrier cleared! Daily usage reset to 75% of your limit.',
      reasonTooShort: 'Please enter a reason (min. 3 characters) for the reflection log.',
      reflectionTitle: 'Evening Reflection Journal (emergency passes today)',
      reflectionEmpty: 'No entries — you did not use any emergency passes today. 👏',
      grantFmt: '+{m} min',

      studioTitle: 'WYSIWYG Lockscreen Widget Studio',
      studioDesc: 'Live WYSIWYG configurator adhering to Nielsen Heuristic #1 (Visibility of System Status). Accurately simulates the ambient mobile lock screen experience.',
      labelWallpapers: '1. Background Wallpaper (with Smart Scrim dynamic contrast layer):',
      labelLayouts: '2. Widget Metaphor (Match between system and real world):',
      layoutGauge: 'Shneiderman Tri-Color Bar',
      layoutSticky: 'Sticky Note Planner',
      layoutPill: 'Minimalist WCAG 2.2 Pill',
      labelQuickCapture: '3. Quick Capture Note (1-2 taps with persistent autosave):',
      autosaveActive: '● Autosave active',
      autosaveSaved: '✓ Saved',

      analyticsTitle: 'Student Focus & Cognitive Dashboard',
      analyticsDesc: 'Track attention fragmentation, rapid app switching frequency (FoMO), and late-night sleep hygiene.',
      fomoMetricTitle: 'Attention Fragmentation Index (FoMO Switch Rate)',
      fomoHintHigh: 'High switching frequency',
      fomoHintOk: 'Moderate switching frequency',
      fomoHintLow: 'Low attention fragmentation',
      fomoDescFmt: '~{n} switches per hour across {apps} active platforms today. Recommendation: batch social notifications into 25-minute Pomodoro study sprints.',
      fomoDescEmpty: 'No usage data recorded for today yet.',
      appDistributionTitle: 'Today\'s Platform Consumption Distribution',
      distEmpty: 'No records today — move the slider or wait for sync.',
      studySyncTitle: 'Astana IT University Schedule Sync',
      badgeActiveNow: 'Active Now',
      badgePlanned: 'Scheduled',
      badgeDone: 'Done',
      scheduleEmpty: 'No events scheduled for today.',
      campusTitle: 'AITU Campus Observatory — Well-Being Telemetry',
      campusSubtitle: 'Aggregated anonymized digital health metrics across Astana IT University (Ivanov & Smirnova, 2023)',
      statStudentsActive: 'Active Students in Focus Mode',
      statTimeSaved: 'Doomscrolling Hours Reclaimed Today',
      statOverrideRate: 'Reduction in Impulsive App Lock Resets',
      weekTrendFmt: '↑ +{n}% this week of exam session',
      timeSavedHint: 'Reclaimed for project preparation',
      overrideHint: 'Thanks to supportive physical micro-barriers',
      zonesTitle: 'AITU Campus Mindful-Quiet Zones',
      zoneLoadFmt: 'Focus mode load: {n}%',

      authSub: 'Sign in to sync your habits and data',
      authTabLogin: 'Sign in',
      authTabRegister: 'Register',
      authNameLabel: 'Display name',
      authPassLabel: 'Password',
      authBtnLogin: 'Sign in',
      authBtnRegister: 'Create account',
      authCheckEmail: '📬 Check your inbox to confirm the account, then sign in.',
      errEmail: 'Enter a valid email address.',
      errPassEmpty: 'Enter your password.',
      errPassShort: 'Password must be at least 6 characters.',
      errLogin: 'Sign-in failed',
      errRegister: 'Registration failed',
      errData: 'Failed to load data from the database.',
      errSave: 'Failed to save changes to the database.',
      btnLogout: 'Sign out'
    }
  };

  function t(key) { return i18n[state.lang][key] || i18n.ru[key] || key; }
  function fmt(key, vars) {
    let s = t(key);
    Object.keys(vars || {}).forEach(k => { s = s.replace('{' + k + '}', vars[k]); });
    return s;
  }

  // ---------------------------------------------------------------------------
  // Ephemeral UI state + hydrated server state
  // ---------------------------------------------------------------------------
  const state = {
    lang: 'ru',
    soundEnabled: true,
    user: null,          // Supabase auth user
    profile: null,
    settings: null,      // user_settings row
    usage: { date: null, total: 0, rows: [] },
    overrideRows: [],
    grantedToday: 0,
    widgetConfig: { wallpaper: 'wallpaper-obsidian', layout: 'gauge', smart_scrim: true },
    note: '',
    schedule: [],
    campus: null,
    zones: [],
    apps: [],

    activeBarrierType: 'pushups',
    pushupsCompleted: 0,
    pushupsGoal: 10,
    mathAnswer: null,
    mathNum1: 0,
    mathNum2: 0,
    authMode: 'login'
  };

  function baseLimit() { return state.settings ? state.settings.daily_limit_minutes : 240; }
  function effectiveCap() { return baseLimit() + state.grantedToday; }
  function currentMinutes() { return Math.min(state.usage.total, effectiveCap()); }

  // ---------------------------------------------------------------------------
  // Sound (Web Audio API) — unchanged, non-persistent micro-feedback
  // ---------------------------------------------------------------------------
  const audioCtx = (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext))
    ? new (window.AudioContext || window.webkitAudioContext)() : null;

  function playTone(freq, duration = 0.15, type = 'sine') {
    if (!state.soundEnabled || !audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start(); osc.stop(audioCtx.currentTime + duration);
    } catch (e) { /* audio is best-effort */ }
  }
  function playSuccessChime() {
    playTone(523.25, 0.1, 'sine');
    setTimeout(() => playTone(659.25, 0.15, 'sine'), 100);
    setTimeout(() => playTone(783.99, 0.25, 'sine'), 200);
  }
  function playNudgeTone() {
    playTone(440, 0.18, 'triangle');
    setTimeout(() => playTone(554.37, 0.25, 'sine'), 120);
  }

  // ---------------------------------------------------------------------------
  // DOM helpers
  // ---------------------------------------------------------------------------
  const $ = id => document.getElementById(id);
  const dom = {};
  function cacheDom() {
    [
      'authOverlay', 'authForm', 'authTabLogin', 'authTabRegister', 'authNameField',
      'authName', 'authEmail', 'authPassword', 'authError', 'authInfo', 'authSubmit', 'configNote',
      'userChip', 'userEmail', 'logoutBtn',
      'langToggle', 'soundToggle', 'contrastToggle',
      'sliderValueDisplay', 'stateBadge', 'gaugeFill', 'capLabel',
      'phoneScreen', 'smartScrim', 'ambientWidget', 'widgetTimerNum', 'widgetProgressBar',
      'widgetNoteText', 'phoneNudgeBanner', 'phoneLockBarrier', 'challengeContainer',
      'emergencyModal', 'emergencyInput', 'btnConfirmEmergency', 'btnEmergencyCancel', 'btnEmergencyTrigger',
      'phoneCarrierTime', 'phoneLockTime', 'phoneLockDate',
      'wpThumbs', 'layoutChoices', 'scrimCheckbox', 'quickCaptureArea', 'charCounter', 'autosaveStatus',
      'simBtns', 'scenarioChips', 'barrierCards', 'tabBtns', 'tabPanels',
      'appBreakdownList', 'scheduleList', 'campusGrid', 'zonesGrid', 'reflectionList',
      'fomoNum', 'fomoHint', 'fomoDesc', 'toastRegion'
    ].forEach(id => { dom[id] = $(id); });
    dom.timeSlider = $('screenTimeSlider');
    dom.scenarioChips = document.querySelectorAll('.scenario-chip');
    dom.barrierCards = document.querySelectorAll('.barrier-card');
    dom.wpThumbs = document.querySelectorAll('.wp-thumb');
    dom.layoutChoices = document.querySelectorAll('.layout-choice');
    dom.simBtns = document.querySelectorAll('.sim-btn');
    dom.tabBtns = document.querySelectorAll('.nav-tabs .tab-btn');
    dom.tabPanels = document.querySelectorAll('.tab-panel');
  }

  function debounce(fn, ms) {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  function toast(msg, isError) {
    if (!dom.toastRegion) return;
    const el = document.createElement('div');
    el.className = 'toast' + (isError ? ' toast-error' : '');
    el.textContent = msg;
    dom.toastRegion.appendChild(el);
    setTimeout(() => el.classList.add('toast-out'), 3200);
    setTimeout(() => el.remove(), 3800);
  }

  function showSkeleton(container, count) {
    if (!container) return;
    container.innerHTML = '';
    const tpl = $('tplSkeletonBar');
    for (let i = 0; i < count; i++) {
      container.appendChild(tpl.content.cloneNode(true));
    }
  }

  function instantiate(tplId) {
    return $(tplId).content.cloneNode(true);
  }

  // ---------------------------------------------------------------------------
  // Formatting
  // ---------------------------------------------------------------------------
  function formatHoursMinutes(totalMinutes) {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return state.lang === 'ru' ? `${h} ч ${m} мин` : `${h}h ${m}m`;
  }

  function updateLiveClock() {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    if (dom.phoneCarrierTime) dom.phoneCarrierTime.textContent = timeStr;
    if (dom.phoneLockTime) dom.phoneLockTime.textContent = timeStr;
    if (dom.phoneLockDate) {
      dom.phoneLockDate.textContent = now.toLocaleDateString(
        state.lang === 'ru' ? 'ru-RU' : 'en-US',
        { weekday: 'long', month: 'short', day: 'numeric' }
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Translations & static chrome
  // ---------------------------------------------------------------------------
  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(elem => {
      const key = elem.getAttribute('data-i18n');
      if (i18n[state.lang][key] !== undefined && !elem.hasAttribute('data-dynamic')) {
        elem.textContent = i18n[state.lang][key];
      }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(elem => {
      const key = elem.getAttribute('data-i18n-placeholder');
      if (i18n[state.lang][key]) elem.placeholder = i18n[state.lang][key];
    });
    if (dom.langToggle) dom.langToggle.textContent = state.lang === 'ru' ? 'EN' : 'RU';
    if (dom.btnEmergencyTrigger) dom.btnEmergencyTrigger.textContent = t('btnEmergencyPassLink');
    renderScenarioChips();
    renderSimulator();
    renderBarriersMeta();
    generateMathProblem();
    renderActiveBarrier();
    if (state.user) { renderAnalytics(); renderSchedule(); renderCampus(); renderReflection(); }
  }

  // Scenario chips are three fixed slots: healthy / nudge / critical
  function renderScenarioChips() {
    if (!dom.scenarioChips) return;
    const cap = baseLimit();
    const nudgePct = state.settings ? state.settings.nudge_threshold_percent : 80;
    const values = [Math.round(cap * 0.4), Math.round(cap * nudgePct / 100), cap];
    const keys = ['scenarioHealthyFmt', 'scenarioNudgeFmt', 'scenarioCriticalFmt'];
    Array.from(dom.scenarioChips).forEach((chip, i) => {
      chip.setAttribute('data-mins', String(values[i]));
      const label = chip.querySelector('span:last-child');
      if (label) label.textContent = fmt(keys[i], { t: formatHoursMinutes(values[i]) });
    });
    if (dom.capLabel) dom.capLabel.textContent = fmt('capLabelFmt', { cap: formatHoursMinutes(cap) });
  }

  function renderBarriersMeta() {
    document.querySelectorAll('.barrier-card').forEach(card => {
      const type = card.getAttribute('data-barrier');
      const suffix = { pushups: 'Pushups', math: 'Math', breathing: 'Breath', emergency: 'Emergency' }[type];
      card.querySelector('.barrier-card-desc').textContent = t('barrier' + suffix + 'Desc');
    });
  }

  // ---------------------------------------------------------------------------
  // Tab 1 — Simulator rendering
  // ---------------------------------------------------------------------------
  function renderSimulator() {
    if (!state.user) return;
    const dict = { healthy: t('stateHealthy'), warning: t('stateWarning'), critical: t('stateCritical') };
    const mins = currentMinutes();
    const cap = effectiveCap();
    const nudgePct = state.settings ? state.settings.nudge_threshold_percent : 80;
    const pct = cap > 0 ? Math.min(100, Math.round((mins / cap) * 100)) : 0;

    if (dom.timeSlider) {
      dom.timeSlider.max = String(cap);
      dom.timeSlider.value = String(mins);
    }
    if (dom.sliderValueDisplay) {
      dom.sliderValueDisplay.textContent = `${formatHoursMinutes(mins)} / ${formatHoursMinutes(cap)} (${pct}%)`;
    }
    if (dom.gaugeFill) dom.gaugeFill.style.width = `${pct}%`;
    if (dom.widgetProgressBar) dom.widgetProgressBar.style.width = `${pct}%`;
    if (dom.widgetTimerNum) dom.widgetTimerNum.textContent = formatHoursMinutes(Math.max(0, cap - mins));

    if (pct < 70) {
      setBadge('state-healthy', dict.healthy);
      paint('var(--gauge-healthy)');
      hide(dom.phoneNudgeBanner); hide(dom.phoneLockBarrier); hide(dom.emergencyModal);
    } else if (mins < Math.round(cap * (nudgePct / 100)) || pct < 100) {
      setBadge('state-warning', dict.warning);
      paint('var(--gauge-warning)');
      show(dom.phoneNudgeBanner, 'flex'); hide(dom.phoneLockBarrier); hide(dom.emergencyModal);
    } else {
      setBadge('state-critical', dict.critical);
      paint('var(--gauge-critical)');
      hide(dom.phoneNudgeBanner); show(dom.phoneLockBarrier, 'flex');
    }
  }

  function setBadge(cls, text) {
    if (!dom.stateBadge) return;
    dom.stateBadge.className = 'state-badge ' + cls;
    dom.stateBadge.innerHTML = `<span>●</span> ${text}`;
  }
  function paint(color) {
    if (dom.gaugeFill) dom.gaugeFill.style.backgroundColor = color;
    if (dom.widgetProgressBar) dom.widgetProgressBar.style.backgroundColor = color;
  }
  function hide(el) { if (el) el.style.display = 'none'; }
  function show(el, mode) { if (el) el.style.display = mode || 'block'; }

  // ---------------------------------------------------------------------------
  // Micro-challenges inside the phone (local interaction, DB entry on success)
  // ---------------------------------------------------------------------------
  function generateMathProblem() {
    const a = Math.floor(Math.random() * 25) + 12;
    const b = Math.floor(Math.random() * 35) + 15;
    state.mathNum1 = a; state.mathNum2 = b; state.mathAnswer = a + b;
  }

  let breathInterval = null;
  function cycleBreathingPhases() {
    clearInterval(breathInterval);
    const phases = state.lang === 'ru'
      ? ['Вдох (4с)', 'Задержка (7с)', 'Выдох (8с)']
      : ['Inhale (4s)', 'Hold (7s)', 'Exhale (8s)'];
    let idx = 0;
    breathInterval = setInterval(() => {
      const el = $('breathPhaseText');
      if (!el) { clearInterval(breathInterval); return; }
      idx = (idx + 1) % phases.length;
      el.textContent = phases[idx];
    }, 5500);
  }

  function renderActiveBarrier() {
    const c = dom.challengeContainer;
    if (!c) return;
    clearInterval(breathInterval);

    if (state.activeBarrierType === 'pushups') {
      c.innerHTML = `
        <div class="challenge-title">${t('barrierPushupsTitle')}</div>
        <div class="rep-counter-display">${state.pushupsCompleted} / ${state.pushupsGoal}</div>
        <div class="rep-goal-sub">${t('barrierPushupsDesc')}</div>
        <button class="rep-tap-btn">${t('btnPushupAction')} (+1)</button>`;
      c.querySelector('button').onclick = () => {
        state.pushupsCompleted++;
        playTone(400 + state.pushupsCompleted * 35, 0.1, 'sine');
        if (state.pushupsCompleted >= state.pushupsGoal) {
          completeBarrier('pushups', state.pushupsCompleted, state.pushupsGoal);
        } else {
          renderActiveBarrier();
        }
      };
    } else if (state.activeBarrierType === 'math') {
      c.innerHTML = `
        <div class="challenge-title">${t('barrierMathTitle')}</div>
        <div class="math-problem-display">${state.mathNum1} + ${state.mathNum2} = ?</div>
        <div class="rep-goal-sub">${t('barrierMathDesc')}</div>
        <div class="math-input-row">
          <input type="number" class="math-input" placeholder="?" />
          <button class="math-submit-btn">${t('btnSubmitMath')}</button>
        </div>`;
      const input = c.querySelector('input');
      const btn = c.querySelector('button');
      btn.onclick = () => {
        if (parseInt(input.value, 10) === state.mathAnswer) {
          completeBarrier('math', null, null);
        } else {
          playTone(200, 0.2, 'sawtooth');
          input.style.borderColor = '#f43f5e';
          input.value = '';
          setTimeout(() => { input.style.borderColor = 'rgba(255,255,255,0.2)'; }, 1200);
        }
      };
      input.onkeydown = e => { if (e.key === 'Enter') btn.click(); };
    } else if (state.activeBarrierType === 'breathing') {
      c.innerHTML = `
        <div class="challenge-title">${t('barrierBreathTitle')}</div>
        <div class="breathing-circle-wrap">
          <div class="breathing-ring"></div>
          <div class="breath-phase-text" id="breathPhaseText">${state.lang === 'ru' ? 'Вдох (4с)' : 'Inhale (4s)'}</div>
        </div>
        <div class="rep-goal-sub">${t('barrierBreathDesc')}</div>
        <button class="rep-tap-btn" style="margin-top:0.5rem;">${state.lang === 'ru' ? 'Завершить практику (60 сек)' : 'Finish practice (60s)'}</button>`;
      c.querySelector('button').onclick = () => completeBarrier('breathing', null, null);
      cycleBreathingPhases();
    } else if (state.activeBarrierType === 'emergency') {
      c.innerHTML = `
        <div class="challenge-title">${t('barrierEmergencyTitle')}</div>
        <div class="rep-goal-sub">${t('barrierEmergencyDesc')}</div>
        <button class="emergency-confirm-btn" style="margin-top:0.5rem;">${t('btnEmergencyPassLink')}</button>`;
      c.querySelector('button').onclick = () => show(dom.emergencyModal, 'flex');
    }
  }

  // Barrier cleared → persist challenge log + reset usage to 75% of base limit
  async function completeBarrier(type, repsDone, goalReps) {
    playSuccessChime();
    try {
      await API.logBarrier(state.user.id, type, repsDone, goalReps);
      const newTotal = Math.round(baseLimit() * 0.75);
      state.usage = await API.saveDailyUsage(state.user.id, newTotal);
      state.pushupsCompleted = 0;
      generateMathProblem();
      renderActiveBarrier();
      toast(t('barrierSuccessToast'));
      renderSimulator();
      renderAnalytics();
    } catch (e) {
      console.error(e);
      toast(t('errSave'), true);
    }
  }

  // ---------------------------------------------------------------------------
  // Usage persistence
  // ---------------------------------------------------------------------------
  async function persistUsage(totalMinutes) {
    try {
      state.usage = await API.saveDailyUsage(state.user.id, totalMinutes);
      renderSimulator();
      renderAnalytics();
    } catch (e) {
      console.error(e);
      toast(t('errSave'), true);
    }
  }

  // ---------------------------------------------------------------------------
  // Emergency override (writes real row, extends cap)
  // ---------------------------------------------------------------------------
  async function submitEmergency() {
    const reason = dom.emergencyInput ? dom.emergencyInput.value.trim() : '';
    if (reason.length < 3) {
      toast(t('reasonTooShort'), true);
      return;
    }
    try {
      const res = await API.addEmergencyOverride(state.user.id, reason, 15);
      state.overrideRows = res.rows;
      state.grantedToday = res.grantedToday;
      hide(dom.emergencyModal);
      if (dom.emergencyInput) dom.emergencyInput.value = '';
      playSuccessChime();
      toast(fmt('unlockSuccessToast'));
      renderScenarioChips();
      renderSimulator();
      renderReflection();
    } catch (e) {
      console.error(e);
      toast(t('errSave'), true);
    }
  }

  function renderReflection() {
    const list = dom.reflectionList;
    if (!list) return;
    list.innerHTML = '';
    if (!state.overrideRows.length) {
      const empty = document.createElement('li');
      empty.className = 'reflection-empty';
      empty.textContent = t('reflectionEmpty');
      list.appendChild(empty);
      return;
    }
    state.overrideRows.forEach(row => {
      const node = instantiate('tplReflectionItem');
      const time = new Date(row.requested_at);
      node.querySelector('.reflection-time').textContent =
        `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
      node.querySelector('.reflection-reason').textContent = row.reason; // textContent = XSS-safe
      node.querySelector('.reflection-grant').textContent = fmt('grantFmt', { m: row.granted_minutes });
      list.appendChild(node);
    });
  }

  // ---------------------------------------------------------------------------
  // Tab 3 — Analytics, Schedule, Campus (real queries rendered from DB rows)
  // ---------------------------------------------------------------------------
  function renderAnalytics() {
    const list = dom.appBreakdownList;
    if (!list) return;
    list.innerHTML = '';

    const active = state.usage.rows.filter(r => r.minutes > 0 && r.apps);
    const maxMin = active.reduce((m, r) => Math.max(m, r.minutes), 0);

    if (!active.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-hint';
      empty.textContent = t('distEmpty');
      list.appendChild(empty);
    } else {
      active
        .sort((a, b) => b.minutes - a.minutes)
        .forEach(row => {
          const node = instantiate('tplAppRow');
          const total = state.usage.total || 1;
          node.querySelector('.app-name').textContent = `${row.apps.icon || ''} ${row.apps.name}`;
          const mins = node.querySelector('.app-minutes');
          mins.textContent = formatHoursMinutes(row.minutes);
          mins.style.color = row.minutes > maxMin * 0.6 ? 'var(--gauge-warning)' : 'var(--gauge-healthy)';
          const fill = node.querySelector('.app-bar-fill');
          fill.style.width = `${Math.round((row.minutes / maxMin) * 100)}%`;
          fill.style.background = row.apps.brand_color || 'var(--accent-teal)';
          fill.title = `${Math.round((row.minutes / total) * 100)}% ${state.lang === 'ru' ? 'от общего времени' : 'of total'}`;
          list.appendChild(node);
        });
    }

    // FoMO estimate from usage rows
    const switches = active.length ? Math.max(2, Math.round(active.length * 4.5)) : 0;
    if (dom.fomoNum) dom.fomoNum.textContent = `${switches} / ${state.lang === 'ru' ? 'ч' : 'h'}`;
    if (dom.fomoHint) {
      dom.fomoHint.textContent = switches >= 15 ? t('fomoHintHigh') : switches >= 8 ? t('fomoHintOk') : t('fomoHintLow');
      dom.fomoHint.style.color = switches >= 15 ? 'var(--gauge-warning)' : 'var(--gauge-healthy)';
    }
    if (dom.fomoDesc) {
      dom.fomoDesc.setAttribute('data-dynamic', 'true');
      dom.fomoDesc.textContent = active.length
        ? fmt('fomoDescFmt', { n: switches, apps: active.length })
        : t('fomoDescEmpty');
    }
  }

  function renderSchedule() {
    const list = dom.scheduleList;
    if (!list) return;
    list.innerHTML = '';
    if (!state.schedule.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-hint';
      empty.textContent = t('scheduleEmpty');
      list.appendChild(empty);
      return;
    }
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    state.schedule.forEach(ev => {
      const [sh, sm] = ev.starts_at.split(':').map(Number);
      const [eh, em] = ev.ends_at.split(':').map(Number);
      const startMin = sh * 60 + sm;
      const endMin = eh * 60 + em;
      let status, cls;
      if (nowMin >= startMin && nowMin < endMin) { status = t('badgeActiveNow'); cls = 'active-now'; }
      else if (nowMin < startMin) { status = t('badgePlanned'); cls = ''; }
      else { status = t('badgeDone'); cls = 'done'; }

      const node = instantiate('tplScheduleItem');
      const item = node.querySelector('.schedule-item');
      if (cls) item.classList.add(cls);
      node.querySelector('.sched-time').textContent =
        `${ev.starts_at.slice(0, 5)} – ${ev.ends_at.slice(0, 5)}${ev.location ? ' • ' + ev.location : ''}`;
      node.querySelector('.sched-title').textContent = ev.title;
      const badge = node.querySelector('.sched-status');
      badge.textContent = status;
      if (cls === 'active-now') {
        badge.style.background = 'rgba(0, 212, 178, 0.15)';
        badge.style.color = 'var(--accent-teal)';
      }
      list.appendChild(node);
    });
  }

  function renderCampus() {
    const grid = dom.campusGrid;
    if (grid) {
      grid.innerHTML = '';
      const m = state.campus;
      const cards = [
        {
          label: t('statStudentsActive'),
          value: m ? m.active_focus_students.toLocaleString(state.lang === 'ru' ? 'ru-RU' : 'en-US') : '—',
          color: 'var(--accent-teal)',
          hint: m ? fmt('weekTrendFmt', { n: Math.round(m.week_over_week_pct) }) : ''
        },
        {
          label: t('statTimeSaved'),
          value: m ? `${Math.round(m.hours_saved).toLocaleString(state.lang === 'ru' ? 'ru-RU' : 'en-US')} ч` : '—',
          color: '#38bdf8',
          hint: t('timeSavedHint')
        },
        {
          label: t('statOverrideRate'),
          value: m ? `-${Math.round(m.override_reduction_pct)}%` : '—',
          color: 'var(--gauge-healthy)',
          hint: t('overrideHint')
        }
      ];
      cards.forEach(c => {
        const node = instantiate('tplCampusCard');
        node.querySelector('.campus-label').textContent = c.label;
        const big = node.querySelector('.campus-stat-big');
        big.textContent = c.value;
        big.style.color = c.color;
        node.querySelector('.campus-hint').textContent = c.hint;
        grid.appendChild(node);
      });
    }

    const zonesGrid = dom.zonesGrid;
    if (zonesGrid) {
      zonesGrid.innerHTML = '';
      state.zones.forEach(z => {
        const node = instantiate('tplFocusZone');
        node.querySelector('.zone-name').textContent = z.name;
        node.querySelector('.zone-load').textContent = fmt('zoneLoadFmt', { n: z.focus_load_percent });
        node.querySelector('.zone-desc').textContent = z.description || '';
        zonesGrid.appendChild(node);
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Tab 2 — Studio (debounced persistence)
  // ---------------------------------------------------------------------------
  const persistWidgetConfig = debounce(async patch => {
    try {
      state.widgetConfig = await API.saveWidgetConfig(state.user.id, patch);
    } catch (e) {
      console.error(e);
      toast(t('errSave'), true);
    }
  }, 450);

  const persistNote = debounce(async body => {
    try {
      await API.saveWidgetNote(state.user.id, body);
      if (dom.autosaveStatus) {
        dom.autosaveStatus.setAttribute('data-dynamic', 'true');
        dom.autosaveStatus.textContent = t('autosaveSaved');
        dom.autosaveStatus.style.opacity = '1';
        setTimeout(() => {
          dom.autosaveStatus.removeAttribute('data-dynamic');
          dom.autosaveStatus.textContent = t('autosaveActive');
          dom.autosaveStatus.style.opacity = '0.5';
        }, 1500);
      }
    } catch (e) {
      console.error(e);
      toast(t('errSave'), true);
    }
  }, 800);

  function applyWidgetConfig(cfg) {
    if (!cfg) return;
    state.widgetConfig = cfg;
    if (dom.phoneScreen) dom.phoneScreen.className = `phone-screen ${cfg.wallpaper}`;
    document.querySelectorAll('.wp-thumb').forEach(t2 =>
      t2.classList.toggle('active', t2.getAttribute('data-wallpaper') === cfg.wallpaper));
    if (dom.ambientWidget) dom.ambientWidget.className = `ambient-widget widget-${cfg.layout}`;
    document.querySelectorAll('.layout-choice').forEach(lc =>
      lc.classList.toggle('active', lc.getAttribute('data-layout') === cfg.layout));
    if (dom.scrimCheckbox) dom.scrimCheckbox.checked = cfg.smart_scrim;
    if (dom.smartScrim) dom.smartScrim.style.display = cfg.smart_scrim ? 'block' : 'none';
  }

  function applyNote(body) {
    state.note = body || '';
    if (dom.quickCaptureArea) dom.quickCaptureArea.value = state.note;
    if (dom.widgetNoteText) dom.widgetNoteText.textContent = state.note; // textContent + pre-line = XSS-safe
    if (dom.charCounter) dom.charCounter.textContent = `${state.note.length} / 120`;
  }

  // ---------------------------------------------------------------------------
  // Profile preferences chrome
  // ---------------------------------------------------------------------------
  function applyProfilePrefs() {
    if (!state.profile) return;
    state.lang = state.profile.locale || 'ru';
    state.soundEnabled = state.profile.sound_enabled !== false;
    document.body.classList.toggle('high-contrast', !!state.profile.high_contrast);
    if (dom.contrastToggle) dom.contrastToggle.classList.toggle('active', !!state.profile.high_contrast);
    if (dom.soundToggle) dom.soundToggle.classList.toggle('active', state.soundEnabled);
  }

  function renderUserChip() {
    if (!dom.userChip) return;
    if (state.user) {
      dom.userChip.hidden = false;
      dom.userEmail.textContent = state.user.email;
    } else {
      dom.userChip.hidden = true;
    }
  }

  // ---------------------------------------------------------------------------
  // Hydration: load everything for the signed-in user
  // ---------------------------------------------------------------------------
  async function hydrate() {
    const uid = state.user.id;
    showSkeleton(dom.appBreakdownList, 4);
    showSkeleton(dom.scheduleList, 3);
    showSkeleton(dom.campusGrid, 3);
    showSkeleton(dom.zonesGrid, 3);
    showSkeleton(dom.reflectionList, 2);

    const results = await Promise.allSettled([
      API.fetchProfile(uid),
      API.fetchSettings(uid),
      API.fetchTodayUsage(uid),
      API.fetchTodayOverrides(uid),
      API.fetchWidgetConfig(uid),
      API.fetchWidgetNote(uid),
      API.fetchTodaySchedule(uid),
      API.fetchCampusMetrics(),
      API.fetchFocusZones()
    ]);

    const val = i => results[i].status === 'fulfilled' ? results[i].value : null;
    if (results.some(r => r.status === 'rejected')) {
      console.error(results.filter(r => r.status === 'rejected').map(r => r.reason));
      toast(t('errData'), true);
    }

    state.profile = val(0);
    state.settings = val(1) || { daily_limit_minutes: 240, nudge_threshold_percent: 80 };
    state.usage = val(2) || { total: 0, rows: [] };
    const ov = val(3); state.overrideRows = ov ? ov.rows : []; state.grantedToday = ov ? ov.grantedToday : 0;
    applyWidgetConfig(val(4));
    applyNote(val(5) ? val(5).body : '');
    state.schedule = val(6) || [];
    state.campus = val(7);
    state.zones = val(8) || [];

    applyProfilePrefs();
    renderUserChip();
    applyTranslations();
    renderSchedule();
    renderCampus();
    renderAnalytics();
    renderReflection();
  }

  // ---------------------------------------------------------------------------
  // Auth UI
  // ---------------------------------------------------------------------------
  function setAuthMode(mode) {
    state.authMode = mode;
    dom.authTabLogin.classList.toggle('active', mode === 'login');
    dom.authTabRegister.classList.toggle('active', mode === 'register');
    dom.authNameField.hidden = mode !== 'register';
    dom.authSubmit.textContent = mode === 'register' ? t('authBtnRegister') : t('authBtnLogin');
    dom.authError.hidden = true;
    dom.authInfo.hidden = true;
  }

  function showAuthOverlay(showFlag) {
    if (dom.authOverlay) dom.authOverlay.hidden = !showFlag;
    document.body.classList.toggle('auth-locked', showFlag);
  }

  async function handleAuthSubmit(e) {
    e.preventDefault();
    if (!API.configured || !API.ready) {
      if (dom.configNote) {
        dom.configNote.hidden = false;
        if (API.configMessage) dom.configNote.textContent = '⚠️ ' + API.configMessage;
      }
      return;
    }
    const email = dom.authEmail.value.trim();
    const password = dom.authPassword.value;
    hideError();
    if (!email || email.indexOf('@') === -1) { showError(t('errEmail')); return; }
    if (!password) { showError(t('errPassEmpty')); return; }
    if (state.authMode === 'register' && password.length < 6) { showError(t('errPassShort')); return; }

    try {
      if (state.authMode === 'login') {
        const res = await API.signIn(email, password);
        if (res && res.session && res.session.user) {
          await enterApp(res.session.user);
        } else {
          showError(t('errLogin'));
        }
      } else {
        const name = dom.authName.value.trim() || email.split('@')[0];
        const res = await API.signUp(email, password, name);
        if (res && res.session && res.session.user) {
          // Email confirmation disabled in Supabase → session returned directly
          await enterApp(res.session.user);
        } else if (res && res.user) {
          // Email confirmation enabled → user exists, session is null
          dom.authInfo.textContent = t('authCheckEmail');
          dom.authInfo.hidden = false;
          setAuthMode('login');
        } else {
          showError(t('errRegister'));
        }
      }
    } catch (err) {
      console.error(err);
      const detail = err && (err.message || err.msg) ? String(err.message || err.msg) : '';
      showError((state.authMode === 'login' ? t('errLogin') : t('errRegister')) + (detail ? ' — ' + detail : ''));
    }
  }

  function hideError() { if (dom.authError) { dom.authError.hidden = true; } }
  function showError(msg) {
    if (dom.authError) { dom.authError.textContent = msg; dom.authError.hidden = false; }
  }

  async function enterApp(user) {
    state.user = user;
    showAuthOverlay(false);
    await hydrate();
  }

  async function handleLogout() {
    try { await API.signOut(); } catch (e) { console.error(e); }
    state.user = null;
    location.reload();
  }

  // ---------------------------------------------------------------------------
  // Event wiring
  // ---------------------------------------------------------------------------
  function initEvents() {
    // Tabs
    dom.tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        dom.tabBtns.forEach(b => b.classList.remove('active'));
        dom.tabPanels.forEach(p => p.classList.remove('active-panel'));
        btn.classList.add('active');
        const panel = document.getElementById(`panel-${btn.getAttribute('data-tab')}`);
        if (panel) panel.classList.add('active-panel');
      });
    });

    // Auth
    if (dom.authForm) dom.authForm.addEventListener('submit', handleAuthSubmit);
    if (dom.authTabLogin) dom.authTabLogin.addEventListener('click', () => setAuthMode('login'));
    if (dom.authTabRegister) dom.authTabRegister.addEventListener('click', () => setAuthMode('register'));
    if (dom.logoutBtn) dom.logoutBtn.addEventListener('click', handleLogout);

    // Preference toggles (persisted to profiles)
    if (dom.langToggle) {
      dom.langToggle.addEventListener('click', () => {
        state.lang = state.lang === 'ru' ? 'en' : 'ru';
        applyTranslations();
        updateLiveClock();
        if (state.user) API.updateProfile(state.user.id, { locale: state.lang }).catch(() => {});
      });
    }
    if (dom.soundToggle) {
      dom.soundToggle.addEventListener('click', () => {
        state.soundEnabled = !state.soundEnabled;
        dom.soundToggle.classList.toggle('active', state.soundEnabled);
        if (state.soundEnabled) playSuccessChime();
        if (state.user) API.updateProfile(state.user.id, { sound_enabled: state.soundEnabled }).catch(() => {});
      });
    }
    if (dom.contrastToggle) {
      dom.contrastToggle.addEventListener('click', () => {
        document.body.classList.toggle('high-contrast');
        const on = document.body.classList.contains('high-contrast');
        dom.contrastToggle.classList.toggle('active', on);
        if (state.user) API.updateProfile(state.user.id, { high_contrast: on }).catch(() => {});
      });
    }

    // Slider: optimistic preview on input, DB write on change
    if (dom.timeSlider) {
      let prePct = 0;
      dom.timeSlider.addEventListener('input', e => {
        state.usage.total = parseInt(e.target.value, 10);
        renderSimulator();
        prePct = Math.round((state.usage.total / effectiveCap()) * 100);
      });
      dom.timeSlider.addEventListener('change', e => {
        const val = parseInt(e.target.value, 10);
        persistUsage(val);
        const pct = Math.round((val / effectiveCap()) * 100);
        if (pct >= 80 && pct < 100 && prePct < 80) playNudgeTone();
      });
    }

    // Scenario presets
    dom.scenarioChips.forEach(chip => {
      chip.addEventListener('click', () => {
        dom.scenarioChips.forEach(c => c.classList.remove('active-chip'));
        chip.classList.add('active-chip');
        const mins = parseInt(chip.getAttribute('data-mins'), 10);
        persistUsage(mins);
        if (mins >= effectiveCap() * 0.8 && mins < effectiveCap()) playNudgeTone();
      });
    });

    // Barrier selection
    dom.barrierCards.forEach(card => {
      card.addEventListener('click', () => {
        dom.barrierCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        state.activeBarrierType = card.getAttribute('data-barrier');
        state.pushupsCompleted = 0;
        generateMathProblem();
        renderActiveBarrier();
      });
    });

    // Emergency modal
    if (dom.btnEmergencyTrigger) dom.btnEmergencyTrigger.addEventListener('click', () => show(dom.emergencyModal, 'flex'));
    if (dom.btnEmergencyCancel) dom.btnEmergencyCancel.addEventListener('click', () => hide(dom.emergencyModal));
    if (dom.btnConfirmEmergency) dom.btnConfirmEmergency.addEventListener('click', submitEmergency);

    // Studio controls
    dom.wpThumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        const wallpaper = thumb.getAttribute('data-wallpaper');
        applyWidgetConfig({ ...state.widgetConfig, wallpaper });
        persistWidgetConfig({ wallpaper });
      });
    });
    dom.layoutChoices.forEach(choice => {
      choice.addEventListener('click', () => {
        const layout = choice.getAttribute('data-layout');
        applyWidgetConfig({ ...state.widgetConfig, layout });
        persistWidgetConfig({ layout });
      });
    });
    if (dom.scrimCheckbox) {
      dom.scrimCheckbox.addEventListener('change', e => {
        applyWidgetConfig({ ...state.widgetConfig, smart_scrim: e.target.checked });
        persistWidgetConfig({ smart_scrim: e.target.checked });
      });
    }
    if (dom.quickCaptureArea) {
      dom.quickCaptureArea.addEventListener('input', e => {
        const val = e.target.value.slice(0, 120);
        state.note = val;
        if (dom.widgetNoteText) dom.widgetNoteText.textContent = val;
        if (dom.charCounter) dom.charCounter.textContent = `${val.length} / 120`;
        persistNote(val);
      });
    }

    // Simulator quick-view buttons (persist target usage)
    dom.simBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        dom.simBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const view = btn.getAttribute('data-sim');
        const cap = effectiveCap();
        const target = view === 'lock' ? Math.round(cap * 0.42)
          : view === 'nudge' ? Math.round(cap * 0.81)
          : cap;
        persistUsage(target);
        if (view === 'nudge') playNudgeTone();
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Bootstrap
  // ---------------------------------------------------------------------------
  async function init() {
    cacheDom();
    generateMathProblem();
    initEvents();
    applyTranslations();
    setInterval(updateLiveClock, 1000);
    updateLiveClock();

    if (!API.configured || !API.ready) {
      showAuthOverlay(true);
      if (dom.configNote) {
        dom.configNote.hidden = false;
        if (API.configMessage) {
          dom.configNote.textContent = '⚠️ ' + API.configMessage;
        } else if (API.configured && !API.ready) {
          dom.configNote.textContent = state.lang === 'ru'
            ? '⚠️ Не удалось загрузить Supabase SDK (lib/supabase-js@2.js).'
            : '⚠️ Failed to load the Supabase SDK (lib/supabase-js@2.js).';
        }
      }
      if (dom.authForm) dom.authForm.style.display = 'none';
      return;
    }

    let session = null;
    try { session = await API.getSession(); } catch (e) { console.error(e); }
    if (session && session.user) {
      await enterApp(session.user);
    } else {
      showAuthOverlay(true);
      setAuthMode('login');
    }

    API.onAuthChange(async session2 => {
      if (session2 && session2.user && !state.user) {
        await enterApp(session2.user);
      } else if (!session2 && state.user) {
        state.user = null;
        showAuthOverlay(true);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
