/* ============================================================
 * app.js —— 渲染、登录鉴权、编辑模式
 * ============================================================ */
(function () {
  'use strict';

  /* ---------- 存储 ---------- */
  /* 存储 key 按语言区分，避免中英文数据互相覆盖 */
  var STORAGE_KEY = 'portfolio_data_v1_' + (window.getLang ? window.getLang() : 'zh');
  var RESUME_KEY = 'portfolio_resume_v1';
  /* 编辑密码哈希（反序混淆存储，运行时还原，避免源码中直接出现完整哈希） */
  var _h0 = '93e3047b94fd6efc908724c0e1c26be751aaa954c90e43503683fb95df1935d9';
  var EDIT_PWD_HASH = (function (s) { return s.split('').reverse().join(''); })(_h0);

  /* ---------- 状态 ---------- */
  var data = loadData();
  var isEditing = false;
  var isPreview = false;

  function editUI() { return isEditing && !isPreview; }

  function loadData() {
    // 数据版本号机制：data.js 每次更新时递增 DATA_VERSION，
    // 浏览器本地旧数据版本不一致则直接重建（彻底解决"改了看不到"的缓存问题）
    var curVer = window.DATA_VERSION || 0;
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        var obj = JSON.parse(saved);
        if (obj && obj._ver === curVer) {
          upgradeData(obj);
          return obj;
        }
        // 版本不一致：用默认数据重建，丢弃旧数据
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {}
    var fresh = JSON.parse(JSON.stringify(getDefaultData()));
    fresh._ver = curVer;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh)); } catch (e) {}
    return fresh;
  }

  // 按当前语言返回默认数据源（zh→DEFAULT_DATA，en→DATA_EN）
  function getDefaultData() {
    var lang = window.getLang ? window.getLang() : 'zh';
    return (lang === 'en' && window.DATA_EN) ? window.DATA_EN : window.DEFAULT_DATA;
  }

  // 应用 UI 文案（导航/按钮/标题等 data-i18n 元素）
  function applyUI() {
    var lang = window.getLang ? window.getLang() : 'zh';
    var t = (window.I18N_UI && window.I18N_UI[lang]) || {};
    $all('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (!t[k]) return;
      var tag = el.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') el.setAttribute('placeholder', t[k]);
      else el.textContent = t[k];
    });
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
    document.title = lang === 'en'
      ? 'Zhendong Zhang - Embedded Software Engineer'
      : '张振东 - 嵌入式软件工程师 | 个人主页';
  }

  // 读取当前语言 UI 文案
  function uiText(key) {
    var lang = window.getLang ? window.getLang() : 'zh';
    var t = (window.I18N_UI && window.I18N_UI[lang]) || {};
    return t[key] || key;
  }

  // 兼容旧数据：personal 项缺 level 时按名称推断级别；education 合并默认数据中的新增项（按 school 去重）；tagline 等由默认数据维护的字段以默认数据为准
  function upgradeData(d) {
    if (!d || typeof d !== 'object') return;
    var def = getDefaultData();
    // profile 中由默认数据维护的字段，以默认数据为准（用户通过导出/导入流程管理内容）
    if (def && def.profile && d.profile) {
      ['tagline', 'jobTitle'].forEach(function (k) {
        if (def.profile[k]) d.profile[k] = def.profile[k];
      });
    }
    if (Array.isArray(d.personal)) {
      d.personal.forEach(function (it) {
        if (!it.level) {
          var n = it.name || '';
          if (n.indexOf('国家') > -1) it.level = '国家级';
          else if (n.indexOf('省') > -1) it.level = '省级';
          else if (n.indexOf('市') > -1) it.level = '市级';
          else if (n.indexOf('校') > -1 || n.indexOf('奖学金') > -1) it.level = '校级';
          else it.level = '其他';
        }
      });
    }
    // 教育背景：默认数据中的学校若本地缺失则合并；若本地为旧校名（公共前缀足够长）则同步为默认值，避免重复
    if (def && Array.isArray(def.education) && Array.isArray(d.education)) {
      function sameSchool(a, b) {
        if (!a || !b) return false;
        if (a === b) return true;
        var min = Math.min(a.length, b.length), common = 0;
        while (common < min && a[common] === b[common]) common++;
        return common >= 6; // 共享前 6 个以上字符视为同一学校（覆盖"职业技术学院/职业技术大学"等改名）
      }
      def.education.forEach(function (e) {
        var exact = d.education.filter(function (x) { return x.school === e.school; });
        if (exact.length) {
          // 已存在同校：同步 degree/period/description（以默认数据为准，保证增删改生效）
          var t = exact[0];
          t.degree = e.degree;
          t.period = e.period;
          t.description = e.description;
          return;
        }
        var fuzzy = d.education.filter(function (x) { return sameSchool(x.school, e.school); });
        if (fuzzy.length) {
          var t2 = fuzzy[0];
          t2.school = e.school;
          t2.degree = e.degree;
          t2.period = e.period;
          t2.description = e.description;
        } else {
          d.education.push(JSON.parse(JSON.stringify(e)));
        }
      });
    }
  }
  function saveData() {
    try {
      data._ver = window.DATA_VERSION || 0;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  /* ---------- 工具 ---------- */
  function $(sel) { return document.querySelector(sel); }
  function $all(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function getPath(path) {
    return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, data);
  }
  function setPath(path, val) {
    var keys = path.split('.');
    var o = data;
    for (var i = 0; i < keys.length - 1; i++) o = o[keys[i]];
    o[keys[keys.length - 1]] = val;
  }

  function formatSize(bytes) {
    if (bytes == null) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  }

  /* ---------- SHA-256（纯 JS 实现，兼容 file:// 与 http） ---------- */
  function sha256(ascii) {
    function rr(v, a) { return (v >>> a) | (v << (32 - a)); }
    var maxWord = Math.pow(2, 32);
    var result = '', words = [];
    var asciiBitLength = ascii.length * 8;

    var hash = sha256.h = sha256.h || [];
    var k = sha256.k = sha256.k || [];
    var primeCounter = k.length;
    var isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (var i = 0; i < 313; i += candidate) isComposite[i] = candidate;
        hash[primeCounter] = (Math.pow(candidate, .5) * maxWord) | 0;
        k[primeCounter++] = (Math.pow(candidate, 1 / 3) * maxWord) | 0;
      }
    }

    ascii += '\x80';
    while (ascii.length % 64 - 56) ascii += '\x00';
    for (i = 0; i < ascii.length; i++) {
      var j = ascii.charCodeAt(i);
      if (j >> 8) return '';
      words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words.length] = (asciiBitLength / maxWord) | 0;
    words[words.length] = asciiBitLength;

    for (j = 0; j < words.length;) {
      var w = words.slice(j, j += 16);
      var oldHash = hash;
      hash = hash.slice(0, 8);
      for (i = 0; i < 64; i++) {
        var w15 = w[i - 15], w2 = w[i - 2];
        var a = hash[0], e = hash[4];
        var temp1 = hash[7]
          + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25))
          + ((e & hash[5]) ^ ((~e) & hash[6]))
          + k[i]
          + (w[i] = (i < 16) ? w[i] : (
              w[i - 16]
              + (rr(w15, 7) ^ rr(w15, 18) ^ (w15 >>> 3))
              + w[i - 7]
              + (rr(w2, 17) ^ rr(w2, 19) ^ (w2 >>> 10))
            ) | 0);
        var temp2 = (rr(a, 2) ^ rr(a, 13) ^ rr(a, 22))
          + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
        hash = [(temp1 + temp2) | 0].concat(hash);
        hash[4] = (hash[4] + temp1) | 0;
      }
      for (i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
    }

    for (i = 0; i < 8; i++) {
      for (j = 3; j + 1; j--) {
        var b = (hash[i] >> (j * 8)) & 255;
        result += ((b < 16) ? '0' : '') + b.toString(16);
      }
    }
    return result;
  }

  /* ---------- 渲染 ---------- */
  function render() {
    var p = data.profile;
    var lang = window.getLang ? window.getLang() : 'zh';
    document.title = lang === 'en'
      ? (p.name + ' · ' + p.headline)
      : (p.name + ' - ' + p.headline + ' | 个人主页');

    // 导航品牌
    $('.brand').textContent = p.name;
    var brandSub = $('.brand-sub');
    if (brandSub) brandSub.textContent = p.headline;

    // Hero
    $('.hero-name').textContent = p.name;
    $('.hero-headline').textContent = p.headline;
    $('.hero-tagline').textContent = p.tagline;
    renderAvatar();
    renderHeroMeta();

    // 关于（富文本）
    $('#aboutBox').innerHTML = data.about;
    $('#aboutBox').setAttribute('data-field', 'about');
    $('#aboutBox').setAttribute('data-html', '1');

    // 技能（富文本，同关于我）
    $('#skillsBox').innerHTML = data.skills;
    $('#skillsBox').setAttribute('data-field', 'skills');
    $('#skillsBox').setAttribute('data-html', '1');

    // 经历
    $('#experienceBox').innerHTML =
      data.experience.map(function (it, i) {
        var tagsHtml;
        if (editUI()) {
          tagsHtml = '<div class="tag-edit-list">' +
            (it.tags || []).map(function (t, k) {
              return '<span class="tag-chip">' +
                '<span data-field="experience.' + i + '.tags.' + k + '">' + esc(t) + '</span>' +
                '<button class="tag-del" data-del-tag="experience" data-i="' + i + '" data-k="' + k + '" title="删除标签">×</button>' +
              '</span>';
            }).join('') +
            '<button class="tag-add" data-add-tag="experience" data-i="' + i + '">＋ 标签</button>' +
          '</div>';
        } else {
          tagsHtml = (it.tags && it.tags.length)
            ? '<div class="project-tags">' + (it.tags || []).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>'
            : '';
        }
        return '<div class="tl-item">' +
          '<div class="tl-card">' +
            '<button class="del-btn" data-del="experience" data-i="' + i + '">×</button>' +
            '<div class="tl-head">' +
              '<span class="tl-role" data-field="experience.' + i + '.company">' + esc(it.company) + '</span>' +
              '<span class="tl-period" data-field="experience.' + i + '.period">' + esc(it.period) + '</span>' +
            '</div>' +
            '<div class="tl-org" data-field="experience.' + i + '.role">' + esc(it.role) + '</div>' +
            '<div class="tl-desc"><ul>' +
              (it.description || []).map(function (d, j) {
                return '<li class="bullet-li">' +
                  '<div class="bullet-text" data-field="experience.' + i + '.description.' + j + '" data-html="1">' + d + '</div>' +
                  '<div class="bullet-ops">' +
                    '<button class="bullet-btn" data-ins-bullet="experience" data-i="' + i + '" data-j="' + j + '" title="在此后插入要点">＋</button>' +
                    '<button class="bullet-btn bullet-del" data-del-bullet="experience" data-i="' + i + '" data-j="' + j + '" title="删除此要点">－</button>' +
                  '</div>' +
                '</li>';
              }).join('') +
            '</ul>' +
            '<button class="add-btn" data-add-bullet="experience" data-i="' + i + '" style="margin:10px 0 0">＋ 添加要点</button>' +
            '</div>' +
            tagsHtml +
          '</div>' +
        '</div>';
      }).join('') +
      '<button class="add-btn" data-add="experience">＋ 添加经历</button>';

    // 项目
    $('#projectsBox').innerHTML =
      data.projects.map(function (it, i) {
        var tagsHtml = editUI()
          ? '<div class="project-tags"><span class="tags-edit" data-tags-path="projects.' + i + '.tags" data-ph="标签，用逗号分隔">' + esc((it.tags || []).join(', ')) + '</span></div>'
          : '<div class="project-tags">' + (it.tags || []).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>';
        var linkHtml = it.link ? '<a href="' + esc(it.link) + '" target="_blank" rel="noopener">🔗</a>' : '';
        return '<div class="project-card">' +
          '<button class="del-btn" data-del="projects" data-i="' + i + '">×</button>' +
          '<div class="project-name"><span data-field="projects.' + i + '.name">' + esc(it.name) + '</span>' + linkHtml + '</div>' +
          '<div class="project-desc" data-field="projects.' + i + '.desc" data-html="1">' + it.desc + '</div>' +
          tagsHtml +
          '<div class="project-link">' +
            '<span class="project-link-label">链接：</span>' +
            '<span class="project-link-input" data-field="projects.' + i + '.link">' + esc(it.link || '') + '</span>' +
          '</div>' +
        '</div>';
      }).join('') +
      '<button class="add-btn" data-add="projects" style="grid-column:1/-1">＋ 添加项目</button>';

    // 教育
    $('#educationBox').innerHTML =
      data.education.map(function (it, i) {
        return '<div class="tl-item">' +
          '<div class="tl-card">' +
            '<button class="del-btn" data-del="education" data-i="' + i + '">×</button>' +
            '<div class="tl-head">' +
              '<span class="tl-role" data-field="education.' + i + '.school">' + esc(it.school) + '</span>' +
              '<span class="tl-period" data-field="education.' + i + '.period">' + esc(it.period) + '</span>' +
            '</div>' +
            '<div class="tl-org" data-field="education.' + i + '.degree">' + esc(it.degree) + '</div>' +
            '<div class="tl-desc" data-field="education.' + i + '.description" data-html="1">' + (it.description || '') + '</div>' +
          '</div>' +
        '</div>';
      }).join('') +
      '<button class="add-btn" data-add="education">＋ 添加教育经历</button>';

    // 联系
    var contacts = [
      { label: uiText('contactEmail'), icon: '📧', field: 'profile.email', link: function (v) { return 'mailto:' + v; } },
      { label: uiText('contactPhone'), icon: '📞', field: 'profile.phone', link: null },
      { label: uiText('contactLoc'), icon: '📍', field: 'profile.location', link: null },
      { label: uiText('contactIntent'), icon: '🎯', field: 'profile.jobTitle', link: null }
    ];
    $('#contactBox').innerHTML = contacts.map(function (c) {
      var val = getPath(c.field);
      var inner = editUI() || !c.link || !val
        ? esc(val || '（未填写）')
        : '<a href="' + esc(c.link(val)) + '" target="_blank" rel="noopener">' + esc(val) + '</a>';
      return '<div class="contact-item">' +
        '<div class="contact-ico">' + c.icon + '</div>' +
        '<div style="flex:1">' +
          '<div class="contact-label">' + c.label + '</div>' +
          '<div class="contact-value" data-field="' + c.field + '">' + inner + '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    // 个人项目（可上传文件）—— 按级别分组展示
    (function () {
      // 收集所有出现的级别，并保持 LEVEL_ORDER 优先、其余按出现顺序
      var groups = {};
      data.personal.forEach(function (it, i) {
        var lv = it.level || '其他';
        (groups[lv] = groups[lv] || []).push(i);
      });
      var levelKeys = [];
      LEVEL_OPTIONS.forEach(function (lv) { if (groups[lv]) levelKeys.push(lv); });
      Object.keys(groups).forEach(function (lv) { if (levelKeys.indexOf(lv) === -1) levelKeys.push(lv); });

      var personalHtml = levelKeys.map(function (lv) {
        var items = groups[lv].map(function (i) { return personalCard(data.personal[i], i); }).join('');
        return '<div class="personal-group">' +
          '<div class="personal-group-title">' + esc(lv) + '</div>' +
          '<div class="personal-list">' + items + '</div>' +
        '</div>';
      }).join('');

      $('#personalBox').innerHTML = personalHtml +
        '<button class="add-btn" data-add="personal" style="margin:28px auto 0">＋ 添加奖项</button>';
    })();

    // 页脚
    $('#footerYear').textContent = new Date().getFullYear();
    var footName = document.querySelector('.footer-left [data-field="profile.name"]');
    var footHead = document.querySelector('.footer-left [data-field="profile.headline"]');
    if (footName) footName.textContent = p.name;
    if (footHead) footHead.textContent = p.headline;

    // 技术文章
    renderArticles();

    applyEditMode();
  }

  // 技术文章渲染（卡片 + 展开阅读）
  function renderArticles() {
    var box = $('#articlesBox');
    if (!box) return;
    var list = (data && data.articles) || [];
    if (!list.length) { box.innerHTML = ''; return; }
    var expand = uiText('articleExpand');
    var collapse = uiText('articleCollapse');
    box.innerHTML = list.map(function (a) {
      return '<article class="article-card">' +
        '<h3 class="article-title">' + esc(a.title) + '</h3>' +
        '<div class="article-meta">' + esc(a.date || '') + '</div>' +
        '<p class="article-summary">' + esc(a.summary || '') + '</p>' +
        '<div class="article-content" hidden>' + (a.content || '') + '</div>' +
        '<button class="btn btn-sm btn-outline article-toggle" data-expanded="0">' + expand + '</button>' +
      '</article>';
    }).join('');
    $all('.article-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var card = btn.parentElement;
        var content = card.querySelector('.article-content');
        var expanded = btn.getAttribute('data-expanded') === '1';
        if (content) content.hidden = expanded;
        btn.setAttribute('data-expanded', expanded ? '0' : '1');
        btn.textContent = expanded ? uiText('articleExpand') : uiText('articleCollapse');
      });
    });
  }

  /* ---------- 个人项目卡片（级别可自行输入，按级别分组） ---------- */
  var LEVEL_OPTIONS = (window.getLang && window.getLang() === 'en')
    ? ['National', 'Provincial', 'City', 'University', 'Other']
    : ['国家级', '省级', '市级', '校级', '其他'];
  function personalCard(it, i) {
    var f = it.file;
    var fileRowHtml = '';
    if (f && f.dataUrl) {
      fileRowHtml = '<div class="personal-file-row">' +
        '<div class="personal-file">' +
          '<span>📎</span>' +
          '<span class="file-name">' + esc(f.name) + '</span>' +
          '<span class="file-size">' + formatSize(f.size) + '</span>' +
          '<button class="btn btn-sm btn-outline" data-download-file="' + i + '">下载</button>' +
          '<button class="btn btn-sm btn-ghost upload-btn" data-remove-file="' + i + '">移除</button>' +
        '</div>' +
        '<button class="btn btn-sm btn-outline upload-btn" data-upload-file="' + i + '">上传文件</button>' +
      '</div>';
    } else if (editUI()) {
      fileRowHtml = '<div class="personal-file-row">' +
        '<button class="btn btn-sm btn-outline upload-btn" data-upload-file="' + i + '">上传文件</button>' +
      '</div>';
    }
    var levelHtml = editUI()
      ? '<span class="level-input" data-field="personal.' + i + '.level" data-level-placeholder="' + esc(it.level || '其他') + '">' + esc(it.level || '其他') + '</span>'
      : '<span class="level-badge">' + esc(it.level || '其他') + '</span>';
    return '<div class="personal-row">' +
      '<button class="del-btn" data-del="personal" data-i="' + i + '">×</button>' +
      '<div class="personal-level-col">' + levelHtml + '</div>' +
      '<div class="personal-main">' +
        '<div class="personal-name" data-field="personal.' + i + '.name">' + esc(it.name) + '</div>' +
        '<div class="personal-desc" data-field="personal.' + i + '.desc" data-html="1">' + it.desc + '</div>' +
        fileRowHtml +
      '</div>' +
    '</div>';
  }

  function renderAvatar() {
    var box = $('#avatarBox');
    var img = $('#avatarImg');
    var ph = $('#avatarPlaceholder');
    if (data.profile.avatar) {
      img.src = data.profile.avatar;
      box.classList.add('has-img');
    } else {
      box.classList.remove('has-img');
    }
  }

  function renderHeroMeta() {
    var p = data.profile;
    var meta = [
      ['📍', p.location], ['📧', p.email], ['📞', p.phone],
      ['💬', p.wechat], ['🔗', p.github]
    ].filter(function (m) { return m[1]; });
    $('#heroMeta').innerHTML = meta.map(function (m) {
      return '<span>' + m[0] + ' ' + esc(m[1]) + '</span>';
    }).join('');
  }

  /* ---------- 编辑模式开关 ---------- */
  function applyEditMode() {
    var ui = editUI();
    document.body.classList.toggle('editing', ui);
    $('#editToolbar').hidden = !isEditing;
    $('#editTip').hidden = !ui;

    $all('[contenteditable]').forEach(function (el) { el.contentEditable = false; });

    if (ui) {
      $all('[data-field]').forEach(function (el) {
        if (el.tagName !== 'A') el.contentEditable = 'true';
      });
      $all('[data-tags-path]').forEach(function (el) { el.contentEditable = 'true'; });
    }

    // 预览按钮文字切换
    var pb = $('#previewBtn');
    if (pb) {
      pb.textContent = isPreview ? '✏️ 返回编辑' : '👁 预览';
    }
  }

  function setEditing(on) {
    isEditing = on;
    isPreview = false;
    render();
  }

  function setPreview(on) {
    isPreview = on;
    render();
  }

  /* ---------- 事件绑定 ---------- */
  function bindEvents() {
    // 可编辑字段输入
    document.addEventListener('input', function (e) {
      var el = e.target;
      if (el.hasAttribute && el.hasAttribute('data-field')) {
        var path = el.getAttribute('data-field');
        var val = el.hasAttribute('data-html') ? el.innerHTML : el.innerText;
        if (el.hasAttribute('data-num')) {
          val = String(parseInt(val, 10) || 0);
          setPath(path, val);
          updateSkillBar(el);
        } else {
          setPath(path, val);
        }
        if (path.indexOf('profile.') === 0) renderHeroMeta();
        saveData();
      } else if (el.hasAttribute && el.hasAttribute('data-tags-path')) {
        var p2 = el.getAttribute('data-tags-path');
        var arr = el.innerText.split(/[,，、]/).map(function (s) { return s.trim(); }).filter(Boolean);
        setPath(p2, arr);
        saveData();
      }
    });

    // 删除列表项
    document.addEventListener('click', function (e) {
      var del = e.target.closest('[data-del]');
      if (del) {
        var key = del.getAttribute('data-del');
        var idx = parseInt(del.getAttribute('data-i'), 10);
        data[key].splice(idx, 1);
        saveData();
        render();
        return;
      }

      var add = e.target.closest('[data-add]');
      if (add) {
        var key2 = add.getAttribute('data-add');
        var blank = blankItem(key2);
        data[key2].push(blank);
        saveData();
        render();
        return;
      }

      var delBullet = e.target.closest('[data-del-bullet]');
      if (delBullet) {
        var key4 = delBullet.getAttribute('data-del-bullet');
        var i4 = parseInt(delBullet.getAttribute('data-i'), 10);
        var j4 = parseInt(delBullet.getAttribute('data-j'), 10);
        data[key4][i4].description.splice(j4, 1);
        saveData();
        render();
        return;
      }

      var insBullet = e.target.closest('[data-ins-bullet]');
      if (insBullet) {
        var key5 = insBullet.getAttribute('data-ins-bullet');
        var i5 = parseInt(insBullet.getAttribute('data-i'), 10);
        var j5 = parseInt(insBullet.getAttribute('data-j'), 10);
        data[key5][i5].description.splice(j5 + 1, 0, '新要点');
        saveData();
        render();
        return;
      }

      var addBullet = e.target.closest('[data-add-bullet]');
      if (addBullet) {
        var key3 = addBullet.getAttribute('data-add-bullet');
        var i3 = parseInt(addBullet.getAttribute('data-i'), 10);
        data[key3][i3].description = data[key3][i3].description || [];
        data[key3][i3].description.push('新要点');
        saveData();
        render();
        return;
      }

      var delTag = e.target.closest('[data-del-tag]');
      if (delTag) {
        var key6 = delTag.getAttribute('data-del-tag');
        var i6 = parseInt(delTag.getAttribute('data-i'), 10);
        var k6 = parseInt(delTag.getAttribute('data-k'), 10);
        data[key6][i6].tags.splice(k6, 1);
        saveData();
        render();
        return;
      }

      var addTag = e.target.closest('[data-add-tag]');
      if (addTag) {
        var key7 = addTag.getAttribute('data-add-tag');
        var i7 = parseInt(addTag.getAttribute('data-i'), 10);
        data[key7][i7].tags = data[key7][i7].tags || [];
        data[key7][i7].tags.push('新标签');
        saveData();
        render();
        return;
      }

      var up = e.target.closest('[data-upload-file]');
      if (up) {
        uploadPersonalFile(parseInt(up.getAttribute('data-upload-file'), 10));
        return;
      }

      var rm = e.target.closest('[data-remove-file]');
      if (rm) {
        var i4 = parseInt(rm.getAttribute('data-remove-file'), 10);
        data.personal[i4].file = null;
        saveData();
        render();
        return;
      }

      var dl = e.target.closest('[data-download-file]');
      if (dl) {
        downloadPersonalFile(parseInt(dl.getAttribute('data-download-file'), 10));
        return;
      }
    });

    // 头像点击更换
    $('#avatarBox').addEventListener('click', function () {
      if (!editUI()) return;
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = function () {
        var f = input.files[0];
        if (!f) return;
        var r = new FileReader();
        r.onload = function () { data.profile.avatar = r.result; saveData(); renderAvatar(); };
        r.readAsDataURL(f);
      };
      input.click();
    });

    // 编辑按钮：弹出密码框
    $('#editBtn').addEventListener('click', function () {
      openEditPwd();
    });

    // 密码弹窗关闭
    $('[data-close="editPwdModal"]').addEventListener('click', function () { $('#editPwdModal').hidden = true; });
    $('#editPwdModal').addEventListener('click', function (e) { if (e.target === this) this.hidden = true; });

    // 密码显示切换
    $('#editPwdToggle').addEventListener('click', function () {
      var pwd = $('#editPwd');
      var show = pwd.type === 'text';
      pwd.type = show ? 'password' : 'text';
      this.textContent = show ? '👁' : '🙈';
    });

    // 密码校验提交
    $('#editPwdForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var p = $('#editPwd').value;
      var err = $('#editPwdError');
      if (sha256(p) !== EDIT_PWD_HASH) {
        err.textContent = '密码错误';
        return;
      }
      err.textContent = '';
      $('#editPwdModal').hidden = true;
      $('#editPwd').value = '';
      setEditing(true);
    });

    // 隐藏入口「?」：密码验证后打开统计后台(伪装,复用编辑密码)
    $('#statsBtn').addEventListener('click', function () {
      $('#statsPwdModal').hidden = false;
      setTimeout(function () { $('#statsPwd').focus(); }, 50);
    });
    $('[data-close="statsPwdModal"]').addEventListener('click', function () { $('#statsPwdModal').hidden = true; });
    $('#statsPwdModal').addEventListener('click', function (e) { if (e.target === this) this.hidden = true; });
    $('#statsPwdToggle').addEventListener('click', function () {
      var pwd = $('#statsPwd');
      var show = pwd.type === 'text';
      pwd.type = show ? 'password' : 'text';
      this.textContent = show ? '👁' : '🙈';
    });
    $('#statsPwdForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var p = $('#statsPwd').value;
      var err = $('#statsPwdError');
      if (sha256(p) !== EDIT_PWD_HASH) {
        err.textContent = '密码错误';
        return;
      }
      err.textContent = '';
      $('#statsPwdModal').hidden = true;
      $('#statsPwd').value = '';
      window.open('https://tongji.baidu.com', '_blank');
    });

    // 工具栏
    $('#logoutBtn').addEventListener('click', function () {
      setEditing(false);
    });
    $('#previewBtn').addEventListener('click', function () {
      setPreview(!isPreview);
    });
    $('#resetBtn').addEventListener('click', function () {
      if (!confirm('确定恢复默认内容吗？你已编辑的内容将被清除。')) return;
      localStorage.removeItem(STORAGE_KEY);
      data = JSON.parse(JSON.stringify(getDefaultData()));
      saveData();
      render();
    });
    $('#exportBtn').addEventListener('click', exportData);
    $('#importBtn').addEventListener('click', function () { $('#importFile').click(); });
    $('#importFile').addEventListener('change', importData);

    // 下载简历
    $all('[data-action="resume"]').forEach(function (b) {
      b.addEventListener('click', downloadResume);
    });

    // 悬浮导航开关（桌面端可拖动，点击打开/收起左侧导航）
    var navToggle = $('#menuToggle');
    var FLOAT_KEY = 'portfolio_float_pos';
    function isDesktop() { return window.matchMedia('(min-width: 901px)').matches; }

    function toggleSidebar(force) {
      var sb = $('#sidebar');
      var open = force !== undefined ? force : !sb.classList.contains('open');
      sb.classList.toggle('open', open);
      if (isDesktop()) {
        document.body.classList.toggle('sb-open', open);
      } else {
        $('#sidebarOverlay').hidden = !open;
      }
    }

    if (navToggle) {
      try {
        var fSaved = JSON.parse(localStorage.getItem(FLOAT_KEY) || 'null');
        if (fSaved) {
          navToggle.style.left = fSaved.left + 'px';
          navToggle.style.top = fSaved.top + 'px';
        }
      } catch (e) {}
      var suppressClick = false;
      navToggle.addEventListener('click', function () {
        if (suppressClick) { suppressClick = false; return; }
        toggleSidebar();
      });
      navToggle.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        var startX = e.clientX, startY = e.clientY;
        var rect = navToggle.getBoundingClientRect();
        var sLeft = rect.left, sTop = rect.top;
        var maxL = Math.max(0, window.innerWidth - rect.width);
        var maxT = Math.max(0, window.innerHeight - rect.height);
        var moved = false;
        function onMove(ev) {
          var nl = Math.min(Math.max(0, sLeft + ev.clientX - startX), maxL);
          var nt = Math.min(Math.max(0, sTop + ev.clientY - startY), maxT);
          if (Math.abs(ev.clientX - startX) + Math.abs(ev.clientY - startY) > 5) moved = true;
          navToggle.style.left = nl + 'px';
          navToggle.style.top = nt + 'px';
        }
        function onUp() {
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
          if (moved) {
            suppressClick = true;
            try {
              localStorage.setItem(FLOAT_KEY, JSON.stringify({
                left: parseInt(navToggle.style.left, 10) || 0,
                top: parseInt(navToggle.style.top, 10) || 0
              }));
            } catch (e) {}
          }
        }
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
      });
    }

    $('#sidebarOverlay').addEventListener('click', function () {
      toggleSidebar(false);
    });
    $all('.sidebar-nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        toggleSidebar(false);
      });
    });

    // 语言切换（切后刷新页面，重新按语言加载数据与文案）
    var langBtn = $('#langToggle');
    if (langBtn) langBtn.addEventListener('click', function () {
      var cur = (window.getLang ? window.getLang() : 'zh');
      if (window.setLang) window.setLang(cur === 'zh' ? 'en' : 'zh');
      location.reload();
    });

    // 留言表单：提交后调起邮件客户端（mailto），收件人自动填好
    var msgForm = $('#msgForm');
    if (msgForm) msgForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = ($('#msgName') ? $('#msgName').value : '').trim();
      var body = ($('#msgBody') ? $('#msgBody').value : '').trim();
      var email = (data && data.profile && data.profile.email) || '';
      if (!email || !body) return;
      var subject = encodeURIComponent(uiText('msgMailSubject') + (name ? '（' + name + '）' : ''));
      var text = encodeURIComponent(body + '\n\n—— ' + (name || '匿名访客'));
      window.location.href = 'mailto:' + email + '?subject=' + subject + '&body=' + text;
    });

    // 复制邮箱
    var copyBtn = document.querySelector('[data-action="copyEmail"]');
    if (copyBtn) copyBtn.addEventListener('click', function () {
      var email = (data && data.profile && data.profile.email) || '';
      if (!email) return;
      function done() {
        var ok = $('#msgOk');
        if (ok) {
          ok.hidden = false;
          ok.textContent = uiText('copyOk');
          setTimeout(function () { ok.hidden = true; }, 2000);
        }
      }
      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = email;
        ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (err) {}
        document.body.removeChild(ta);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done, fallback);
      } else fallback();
    });

    // 返回顶部
    var backTop = $('#backTop');
    if (backTop) {
      backTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      window.addEventListener('scroll', function () {
        var y = window.pageYOffset || document.documentElement.scrollTop || 0;
        backTop.classList.toggle('show', y > 400);
      }, { passive: true });
    }
  }

  function updateSkillBar(numEl) {
    var item = numEl.closest('.skill-item');
    if (!item) return;
    var lv = Math.max(0, Math.min(100, parseInt(numEl.innerText, 10) || 0));
    item.querySelector('.skill-bar i').style.width = lv + '%';
  }

  function blankItem(key) {
    var map = {
      skills: { name: '新技能', level: 80 },
      experience: { company: '公司名称', role: '职位名称', period: '起止时间', description: ['工作内容要点'], tags: [] },
      projects: { name: '项目名称', desc: '项目简介', tags: ['标签'], link: '' },
      education: { school: '学校名称', degree: '专业 · 学历', period: '起止时间', description: '在校经历' },
      personal: { name: '新奖项', desc: '奖项说明', file: null, level: '校级' }
    };
    return JSON.parse(JSON.stringify(map[key] || {}));
  }

  /* ---------- 个人项目：文件上传 / 下载 ---------- */
  function uploadPersonalFile(i) {
    var input = document.createElement('input');
    input.type = 'file';
    input.onchange = function () {
      var f = input.files[0];
      if (!f) return;
      if (f.size > 3 * 1024 * 1024) { alert('文件过大，请选择 3MB 以内的文件'); return; }
      var r = new FileReader();
      r.onload = function () {
        data.personal[i].file = { name: f.name, size: f.size, dataUrl: r.result };
        saveData();
        render();
      };
      r.readAsDataURL(f);
    };
    input.click();
  }

  function downloadPersonalFile(i) {
    var f = data.personal[i] && data.personal[i].file;
    if (!f || !f.dataUrl) return;
    var a = document.createElement('a');
    a.href = f.dataUrl;
    a.download = f.name || '文件';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  /* ---------- 简历下载 / 上传 ---------- */
  function downloadResume() {
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(RESUME_KEY) || 'null'); } catch (e) {}
    if (saved && saved.dataUrl) {
      var a = document.createElement('a');
      a.href = saved.dataUrl;
      a.download = saved.name || data.profile.resumeName || '简历.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      var a2 = document.createElement('a');
      a2.href = 'resume.pdf';
      a2.download = data.profile.resumeName || '简历.pdf';
      document.body.appendChild(a2);
      a2.click();
      a2.remove();
    }
  }

  function addResumeUpload() {
    var btn = document.createElement('button');
    btn.className = 'btn btn-sm btn-outline';
    btn.textContent = '上传简历';
    btn.title = '上传你自己的简历文件（PDF 等），上传后“下载简历”按钮将使用该文件';
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx';
    input.style.display = 'none';
    btn.addEventListener('click', function () { input.click(); });
    input.addEventListener('change', function () {
      var f = input.files[0];
      if (!f) return;
      if (f.size > 5 * 1024 * 1024) { alert('文件过大，请选择 5MB 以内的文件'); return; }
      var r = new FileReader();
      r.onload = function () {
        localStorage.setItem(RESUME_KEY, JSON.stringify({ name: f.name, dataUrl: r.result }));
        data.profile.resumeName = f.name;
        saveData();
        alert('简历已更新为：' + f.name);
      };
      r.readAsDataURL(f);
    });
    $('.edit-toolbar-actions').insertBefore(btn, $('#resetBtn'));
    document.body.appendChild(input);
  }

  /* ---------- 导入 / 导出 ---------- */
  function exportData() {
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '个人主页数据.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function importData(e) {
    var f = e.target.files[0];
    if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      try {
        var obj = JSON.parse(r.result);
        if (!obj || typeof obj !== 'object' || !obj.profile) throw new Error('invalid');
        data = obj;
        saveData();
        render();
        alert('数据导入成功');
      } catch (err) {
        alert('文件格式不正确，导入失败');
      }
    };
    r.readAsText(f);
    e.target.value = '';
  }

  /* ---------- 滚动入场动画 ---------- */
  function initReveal() {
    var els = $all('.section, .hero');
    els.forEach(function (el) { el.classList.add('reveal'); });
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('visible'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  }

  function openEditPwd() { $('#editPwdModal').hidden = false; setTimeout(function () { $('#editPwd').focus(); }, 50); }

  /* ---------- 初始化 ---------- */
  function init() {
    applyUI();
    bindEvents();
    render();
    addResumeUpload();
    initReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
