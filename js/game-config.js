/* Gamification configuration — the ONLY place to change XP values, levels, streak rewards and badges. */
window.GAME_CONFIG={
  /* XP for meaningful learning only. Each reward is granted once per activity (see the ledger in js/game.js). */
  xp:{
    correct:10,        // correct answer (MCQ question or auto-graded assessment item) — once per question
    firstTry:5,        // bonus when the very first attempt at that question was correct
    lesson:50,         // mark a Student Book lesson as complete
    infographic:15,    // explore every panel of a lesson infographic
    quiz:30,           // finish a quiz: a lesson/unit/full-bank MCQ set or an Assessment Book sheet
    perfect:50,        // bonus for 100% in that quiz
    unit:100,          // complete every lesson of a unit (chapter)
    dailyGoal:40,      // reach today's goal
  },
  dailyGoal:10,                       // correct answers needed in one day
  streak:{3:30,7:100,14:150,30:300},  // streak milestone (days) -> bonus XP
  speedSecPerQ:30,                    // «المتعلم السريع»: average seconds per question (quiz of 10+ questions, 90%+)
  minQuizForStats:5,                  // quizzes shorter than this don't count for «بطل الاختبارات»
  levels:[
    {min:0,    name:'مبتدئ',        en:'Beginner'},
    {min:100,  name:'مستكشف',       en:'Explorer'},
    {min:250,  name:'متعلّم',        en:'Learner'},
    {min:500,  name:'منجِز',         en:'Achiever'},
    {min:1000, name:'دارس',         en:'Scholar'},
    {min:2000, name:'خبير',         en:'Expert'},
    {min:3500, name:'بطل',          en:'Champion'},
    {min:5000, name:'أستاذ',        en:'Master'},
    {min:7500, name:'أسطورة',       en:'Legend'},
    {min:10000,name:'بطل التعليم',  en:'Education Hero'}
  ],
  cats:{learn:'التعلّم',quiz:'الاختبارات',days:'المواظبة',special:'أوسمة خاصة'},
  /* metric: value computed by the engine; need: target; bonus: XP granted on unlock; c: two badge colours; e: emblem */
  badges:[
    {id:'first-steps',     cat:'learn',  name:'أول خطوة',          en:'First Steps',       desc:'أكمل أول درس من كتاب المدرسة.',              metric:'lessons',  need:1,   bonus:20,  c:['#2ee6c5','#0d8f80'], e:'steps'},
    {id:'knowledge-seeker',cat:'learn',  name:'باحث عن المعرفة',   en:'Knowledge Seeker',  desc:'أكمل ٥ دروس.',                                metric:'lessons',  need:5,   bonus:40,  c:['#4fd1ff','#1f5bd8'], e:'book'},
    {id:'book-explorer',   cat:'learn',  name:'مستكشف الكتاب',     en:'Book Explorer',     desc:'أكمل ١٠ دروس.',                               metric:'lessons',  need:10,  bonus:60,  c:['#8f7bff','#4b2db8'], e:'compass'},
    {id:'unit-master',     cat:'learn',  name:'سيّد الوحدة',        en:'Chapter Master',    desc:'أكمل كل دروس وحدة كاملة.',                    metric:'units',    need:1,   bonus:80,  c:['#ffd25e','#e08a00'], e:'crown'},
    {id:'knowledge-champ', cat:'learn',  name:'بطل المعرفة',       en:'Knowledge Champion',desc:'أكمل الوحدات الثلاث للفصل الدراسي.',          metric:'units',    need:3,   bonus:150, c:['#ff9d5c','#d6361f'], e:'trophy'},
    {id:'first-victory',   cat:'quiz',   name:'أول انتصار',        en:'First Victory',     desc:'أنهِ أول اختبار أو تقييم.',                   metric:'quizzes',  need:1,   bonus:20,  c:['#7ef0a0','#139a5b'], e:'flag'},
    {id:'perfect-score',   cat:'quiz',   name:'العلامة الكاملة',   en:'Perfect Score',     desc:'احصل على ١٠٠٪ في اختبار.',                    metric:'perfects', need:1,   bonus:40,  c:['#ffe169','#f0a500'], e:'star'},
    {id:'quiz-champion',   cat:'quiz',   name:'بطل الاختبارات',    en:'Quiz Champion',     desc:'احصل على ٩٠٪ أو أكثر في ٥ اختبارات مختلفة.',  metric:'q90',      need:5,   bonus:80,  c:['#ff7eb6','#c2185b'], e:'medal'},
    {id:'unstoppable',     cat:'quiz',   name:'لا يمكن إيقافه',    en:'Unstoppable',       desc:'أجب ١٠ أسئلة صحيحة متتالية.',                 metric:'bestRun',  need:10,  bonus:50,  c:['#ffb347','#ff5e3a'], e:'bolt'},
    {id:'sharp-mind',      cat:'quiz',   name:'العقل الذكي',        en:'Sharp Mind',        desc:'أجب ٢٠ سؤالًا إجابة صحيحة.',                  metric:'correct',  need:20,  bonus:30,  c:['#9be7ff','#3f8efc'], e:'bulb'},
    {id:'first-day',       cat:'days',   name:'اليوم الأول',       en:'First Day',         desc:'أكمل أول جلسة تعلّم (اكسب أول نقاط).',         metric:'days',     need:1,   bonus:10,  c:['#ffd38a','#ff8a1f'], e:'sun'},
    {id:'streak-3',        cat:'days',   name:'ثلاثة أيام متتالية', en:'Three-Day Streak',  desc:'تعلّم ٣ أيام متتالية.',                        metric:'bestStreak',need:3,  bonus:30,  c:['#ffad61','#f24e1e'], e:'flame', n:'٣'},
    {id:'streak-7',        cat:'days',   name:'محارب الأسبوع',     en:'Weekly Warrior',    desc:'تعلّم ٧ أيام متتالية.',                        metric:'bestStreak',need:7,  bonus:70,  c:['#ff8f6b','#d1235a'], e:'flame', n:'٧'},
    {id:'streak-30',       cat:'days',   name:'سيّد الشهر',         en:'Monthly Master',    desc:'تعلّم ٣٠ يومًا متتاليًا.',                      metric:'bestStreak',need:30, bonus:200, c:['#c38bff','#6a1bd1'], e:'flame', n:'٣٠'},
    {id:'speed-learner',   cat:'special',name:'المتعلّم السريع',    en:'Speed Learner',     desc:'أنهِ اختبارًا من ١٠ أسئلة أو أكثر بنسبة ٩٠٪+ في الوقت المقترح (٣٠ ثانية للسؤال).', metric:'speed', need:1, bonus:50, c:['#6ff7e8','#0b8ea8'], e:'rocket'},
    {id:'perfectionist',   cat:'special',name:'الكمالي',           en:'Perfectionist',     desc:'احصل على ١٠٠٪ في ٣ اختبارات مختلفة.',         metric:'perfects', need:3,   bonus:80,  c:['#a5f3ff','#7a4de0'], e:'gem'},
    {id:'explorer',        cat:'special',name:'المستكشف',          en:'Explorer',          desc:'تعلّم في الأقسام الثلاثة: كتاب المدرسة وبنك الأسئلة وكتاب التقييمات.', metric:'sections', need:3, bonus:30, c:['#8ff0b0','#11b5a4'], e:'globe'},
    {id:'super-learner',   cat:'special',name:'المتعلّم الخارق',    en:'Super Learner',     desc:'اجمع ١٠٠٠ نقطة XP.',                          metric:'xp',       need:1000,bonus:0,   c:['#ffe27a','#ff8a1f'], e:'burst'},
    {id:'legendary',       cat:'special',name:'الطالب الأسطوري',   en:'Legendary Student', desc:'اجمع ٥٠٠٠ نقطة XP.',                          metric:'xp',       need:5000,bonus:0,   c:['#ffd700','#7a4de0'], e:'crown2'}
  ],
  messages:{
    ok:['ممتاز!','رائع!','أحسنت!','إجابة عبقرية!','أنت تتقدّم بشكل رائع!','إجابة مثالية!'],
    no:['ليست هذه المرة! راجع الإجابة الصحيحة.','اقتربت كثيرًا!','واصل المحاولة!','أنت تستطيع!','لنتعلّم من هذا الخطأ!']
  }
};
