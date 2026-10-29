/* ==========================================================================
   SOCIAL MEDIA BALANCE — DATA LAYER (Supabase)
   Single module through which ALL database/auth access happens.
   Exposes window.API. UI code in app.js never touches the SDK directly.
   ========================================================================== */

(function () {
  'use strict';

  const cfg = window.APP_CONFIG || {};
  const url = (cfg.SUPABASE_URL || '').trim();
  const key = (cfg.SUPABASE_ANON_KEY || '').trim();

  function configProblem() {
    if (!url && !key) return 'SUPABASE_URL и SUPABASE_ANON_KEY не заданы в js/config.js.';
    if (!url) return 'SUPABASE_URL пуст — вставьте Project URL из Supabase Studio → Settings → API.';
    if (!key) return 'SUPABASE_ANON_KEY пуст — вставьте anon/public ключ из Supabase Studio → Settings → API.';
    if (!/^https:\/\/[a-z0-9.-]+\.supabase\.co\/?$/i.test(url) && url.indexOf('YOUR-') !== -1)
      return 'SUPABASE_URL всё ещё содержит значение-заполнитель (YOUR-PROJECT…).';
    if (url.indexOf('YOUR-') !== -1 || !/^https:\/\//i.test(url))
      return 'SUPABASE_URL должен быть полным https:// URL проекта без пути и слэша на конце.';
    if (key.indexOf('YOUR-') !== -1) return 'SUPABASE_ANON_KEY всё ещё содержит значение-заполнитель.';
    return '';
  }

  const problem = configProblem();
  const isPlaceholder = problem !== '';

  let sb = null;
  if (!isPlaceholder && window.supabase && window.supabase.createClient) {
    sb = window.supabase.createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
  }

  function unwrap(promise) {
    return promise.then(({ data, error }) => {
      if (error) throw error;
      return data;
    });
  }

  function todayStr() {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }

  // Fixed share of the simulated daily total per platform (demo model:
  // the slider controls the day total, distribution stays proportional).
  const APP_SHARES = [
    { app_id: 1, ratio: 0.45 },
    { app_id: 2, ratio: 0.30 },
    { app_id: 3, ratio: 0.12 },
    { app_id: 4, ratio: 0.08 },
    { app_id: 5, ratio: 0.05 }
  ];

  window.API = {
    ready: !!sb,
    configured: !isPlaceholder,
    configMessage: problem,

    // ---- Auth -------------------------------------------------------------
    async getSession() {
      if (!sb) return null;
      const data = await unwrap(sb.auth.getSession());
      return data.session;
    },

    onAuthChange(callback) {
      if (!sb) return () => {};
      const { data } = sb.auth.onAuthStateChange((_event, session) => callback(session));
      return () => data.subscription.unsubscribe();
    },

    signIn(email, password) {
      return unwrap(sb.auth.signInWithPassword({ email, password }));
    },

    signUp(email, password, displayName) {
      return unwrap(sb.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } }
      }));
    },

    signOut() {
      return unwrap(sb.auth.signOut());
    },

    // ---- Profile & settings -------------------------------------------------
    async fetchProfile(userId) {
      const rows = await unwrap(
        sb.from('profiles').select('*').eq('id', userId).maybeSingle()
      );
      if (!rows) {
        // Self-heal for accounts created before the schema was applied.
        await unwrap(sb.from('profiles').upsert({ id: userId, display_name: 'Student' }));
        return this.fetchProfile(userId);
      }
      return rows;
    },

    updateProfile(userId, patch) {
      return unwrap(sb.from('profiles').update(patch).eq('id', userId).select().single());
    },

    async fetchSettings(userId) {
      const row = await unwrap(
        sb.from('user_settings').select('*').eq('user_id', userId).maybeSingle()
      );
      if (!row) {
        return unwrap(sb.from('user_settings').upsert({ user_id: userId }, { onConflict: 'user_id' }).select().single());
      }
      return row;
    },

    // ---- Usage ---------------------------------------------------------------
    async fetchTodayUsage(userId) {
      const date = todayStr();
      const rows = await unwrap(
        sb.from('usage_logs')
          .select('minutes, app_id, apps(id, name, icon, brand_color, category)')
          .eq('user_id', userId)
          .eq('usage_date', date)
      );
      const total = rows.reduce((sum, r) => sum + (r.minutes || 0), 0);
      return { date, total, rows };
    },

    async saveDailyUsage(userId, totalMinutes) {
      const date = todayStr();
      let remaining = totalMinutes;
      const rows = APP_SHARES.map((s, i) => {
        const minutes = i === APP_SHARES.length - 1
          ? Math.max(0, remaining)
          : Math.round(totalMinutes * s.ratio);
        remaining -= minutes;
        return { user_id: userId, usage_date: date, app_id: s.app_id, minutes };
      });
      await unwrap(
        sb.from('usage_logs').upsert(rows, { onConflict: 'user_id,usage_date,app_id' })
      );
      return this.fetchTodayUsage(userId);
    },

    // ---- Barriers & reflection -------------------------------------------------
    logBarrier(userId, barrierType, repsDone, goalReps) {
      return unwrap(sb.from('barrier_challenges').insert({
        user_id: userId,
        barrier_type: barrierType,
        status: 'completed',
        reps_done: repsDone,
        goal_reps: goalReps
      }).select().single());
    },

    async addEmergencyOverride(userId, reason, grantedMinutes) {
      await unwrap(sb.from('emergency_overrides').insert({
        user_id: userId,
        reason,
        granted_minutes: grantedMinutes
      }));
      return this.fetchTodayOverrides(userId);
    },

    async fetchTodayOverrides(userId) {
      const rows = await unwrap(
        sb.from('emergency_overrides')
          .select('*')
          .eq('user_id', userId)
          .gte('requested_at', todayStr())
          .order('requested_at', { ascending: false })
      );
      const grantedToday = rows.reduce((sum, r) => sum + r.granted_minutes, 0);
      return { rows, grantedToday };
    },

    // ---- Lock Screen Studio -----------------------------------------------------
    async fetchWidgetConfig(userId) {
      const row = await unwrap(
        sb.from('widget_configs').select('*').eq('user_id', userId).maybeSingle()
      );
      if (!row) {
        return unwrap(sb.from('widget_configs').upsert({ user_id: userId }, { onConflict: 'user_id' }).select().single());
      }
      return row;
    },

    saveWidgetConfig(userId, patch) {
      return unwrap(
        sb.from('widget_configs')
          .upsert({ user_id: userId, ...patch, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
          .select()
          .single()
      );
    },

    fetchWidgetNote(userId) {
      return unwrap(
        sb.from('widget_notes').select('body').eq('user_id', userId).maybeSingle()
      );
    },

    saveWidgetNote(userId, body) {
      return unwrap(
        sb.from('widget_notes')
          .upsert(
            { user_id: userId, body: body.slice(0, 120), updated_at: new Date().toISOString() },
            { onConflict: 'user_id' }
          )
          .select()
          .single()
      );
    },

    // ---- Schedule ------------------------------------------------------------------
    fetchTodaySchedule(userId) {
      return unwrap(
        sb.from('schedule_events')
          .select('*')
          .eq('user_id', userId)
          .eq('event_date', todayStr())
          .order('starts_at', { ascending: true })
      );
    },

    // ---- Campus observatory (public read) -------------------------------------------
    fetchCampusMetrics() {
      return unwrap(
        sb.from('campus_metrics_daily').select('*').order('metric_date', { ascending: false }).limit(1).maybeSingle()
      );
    },

    fetchFocusZones() {
      return unwrap(sb.from('focus_zones').select('*').order('focus_load_percent', { ascending: false }));
    },

    fetchApps() {
      return unwrap(sb.from('apps').select('*').order('id'));
    }
  };
})();
