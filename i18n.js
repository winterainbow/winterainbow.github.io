/* ============================================================
 * i18n.js —— 国际化支持（中英切换）
 * 1. UI 文案字典 I18N_UI（导航/按钮/标题/编辑模式等）
 * 2. 英文内容数据 DATA_EN（结构与 DEFAULT_DATA 完全一致）
 * 3. 语言管理 getLang / setLang（localStorage 持久化）
 * ============================================================ */

/* ---------- 语言管理 ---------- */
(function () {
  var KEY = 'site_lang';
  window.getLang = function () { try { return localStorage.getItem(KEY) || 'zh'; } catch (e) { return 'zh'; } };
  window.setLang = function (l) { try { localStorage.setItem(KEY, l === 'en' ? 'en' : 'zh'); } catch (e) {} };
})();

/* ---------- UI 文案字典 ---------- */
window.I18N_UI = {
  zh: {
    navHome: '首页', navAbout: '关于我', navSkills: '技能', navExp: '经历',
    navProjects: '项目作品', navEdu: '教育', navContact: '联系', navHonors: '荣誉奖项', navArticles: '文章',
    btnResume: '下载简历', btnEdit: '编辑', btnContact: '联系我',
    secAbout: '关于我', secSkills: '专业技能', secExp: '工作经历', secProjects: '项目作品',
    secEdu: '教育背景', secContact: '联系方式', secHonors: '荣誉奖项', secArticles: '技术文章',
    articlesSub: '嵌入式开发笔记 · 持续更新',
    honorsSub: '竞赛获奖 · 资格证书',
    contactEmail: '邮箱', contactPhone: '电话', contactLoc: '所在地', contactIntent: '求职意向',
    editTitle: '进入编辑模式', editSub: '请输入密码', editPwd: '密码', editBtn: '进入编辑',
    editMode: '编辑模式', preview: '预览', exportData: '导出数据', importData: '导入数据',
    resetDefault: '恢复默认', logout: '退出编辑',
    editTip: '编辑模式：点击文字可直接修改，列表可删除 / 添加条目，改完点「导出数据」发给我更新线上版本',
    langName: 'EN', langTitle: '切换语言',
    msgTitle: '给我留言', msgName: '您的称呼', msgMsg: '留言内容',
    msgSend: '发送邮件', msgHint: '提交后将调起您的邮件客户端，收件人已自动填好。也可直接复制邮箱发送。',
    copyEmail: '复制邮箱', copyOk: '已复制邮箱', backTop: '返回顶部',
    msgMailSubject: '网站留言',
    articleExpand: '展开阅读', articleCollapse: '收起',
    sitePv: '本站访问量', siteUv: '访客数', viewCount: '次'
  },
  en: {
    navHome: 'Home', navAbout: 'About', navSkills: 'Skills', navExp: 'Experience',
    navProjects: 'Projects', navEdu: 'Education', navContact: 'Contact', navHonors: 'Honors', navArticles: 'Notes',
    btnResume: 'Download CV', btnEdit: 'Edit', btnContact: 'Contact Me',
    secAbout: 'About Me', secSkills: 'Skills', secExp: 'Experience', secProjects: 'Projects',
    secEdu: 'Education', secContact: 'Contact', secHonors: 'Honors', secArticles: 'Tech Notes',
    articlesSub: 'Embedded development notes · updating',
    honorsSub: 'Awards & Certificates',
    contactEmail: 'Email', contactPhone: 'Phone', contactLoc: 'Location', contactIntent: 'Target Role',
    editTitle: 'Edit Mode', editSub: 'Enter password', editPwd: 'Password', editBtn: 'Enter',
    editMode: 'Edit Mode', preview: 'Preview', exportData: 'Export', importData: 'Import',
    resetDefault: 'Reset', logout: 'Exit',
    editTip: 'Edit mode: click text to edit, add/remove list items, then click "Export" and send to me to update the live site.',
    langName: '中', langTitle: 'Switch language',
    msgTitle: 'Leave a Message', msgName: 'Your Name', msgMsg: 'Message',
    msgSend: 'Send Email', msgHint: 'Your email client will open with the recipient prefilled. You can also copy the email address.',
    copyEmail: 'Copy Email', copyOk: 'Email copied', backTop: 'Back to top',
    msgMailSubject: 'Website message',
    articleExpand: 'Read more', articleCollapse: 'Collapse',
    sitePv: 'Page Views', siteUv: 'Visitors', viewCount: 'views'
  }
};

/* ---------- 英文内容数据（结构必须与 DEFAULT_DATA 一致） ---------- */
window.DATA_EN = {
  "profile": {
    "name": "Zhendong Zhang",
    "headline": "Embedded Software Engineer",
    "tagline": "22 y/o · B.Eng. Guangdong Polytechnic Normal University · Seeking: Electronics Engineer / Embedded Software / MCU Development",
    "location": "Guangdong, China",
    "email": "2099057954@qq.com",
    "phone": "15347609303",
    "wechat": "",
    "github": "https://github.com/winterainbow",
    "jobTitle": "Electronics Engineer / Embedded Software / MCU Development",
    "avatar": "",
    "resumeName": "张振东-嵌入式软件-简历.pdf"
  },
  "about": "<p>I am Zhendong Zhang, 22, an undergraduate student in Applied Electronic Technology Education at Guangdong Polytechnic Normal University, seeking a position as an electronics engineer / embedded software / MCU developer.</p><p>I work with mainstream MCU platforms including STM32, GD32 and ESP32, and I am proficient with the FreeRTOS RTOS and common communication interfaces such as I2C, SPI, UART, RS485 and CAN. I can independently build Python desktop tools (PyQt5 / Flask), with end-to-end capability from low-level drivers and algorithm design to whole-system integration.</p><p>I have contributed to R&D at Guangdong Zhong'an Technology and Guangdong Qifeng Nuclear Technology, working on security-inspection display systems and nuclide-separation automation control systems — independently handling hardware drivers, communication protocols and system integration. I won the National First Prize in the China Undergraduate Mathematical Contest in Modeling (CUMCM). I aim to build a long-term career in the Pearl River Delta / Yangtze River Delta region.</p>",
  "skills": "<p>1. Proficient in <b>C, Python, MATLAB</b>; familiar with <b>I2C/SPI/MODBUS-RTU/UART/RS485/CAN/SDIO</b>; familiar with <b>LVGL</b> graphics library and <b>MQTT</b> IoT protocol; experience with MQTT-based device-to-cloud data upload, remote command dispatch and state sync; can build <b>Python desktop tools (PyQt5/Flask)</b> with serial/LAN communication and phone-based remote control.</p><p>2. Familiar with <b>ARM Cortex-M and RISC-V</b> architectures; development experience on <b>STM32/GD32/ESP32</b>; proficient in <b>GPIO, UART, PWM, ADC, DMA, SPI, I2C</b> peripheral drivers; knowledge of motor control: <b>PID closed-loop</b>, brushed DC (PWM), stepper (trapezoidal accel/decel, micro-stepping), BLDC (six-step commutation, basic FOC, X-CUBE-MCSDK-FUL); capable of cross-platform driver porting and BSP construction.</p><p>3. Proficient with <b>HAL / Standard Peripheral Library (STM32CubeMX + Keil5 or VSCode)</b> for init, interrupt and DMA configuration and debugging.</p><p>4. Solid fundamentals in <b>analog/digital circuits</b>, signals &amp; systems, electronic measurement and communication principles; able to read schematics; can design simple 4-layer PCBs with <b>LCEDA</b>.</p><p>5. Skilled with <b>FreeRTOS</b>: task management, preemptive scheduling and time-slicing; proficient in <b>semaphores, queues, event groups, task notifications</b>; interrupt management and critical-section protection; memory management and software timers; can independently <b>port, configure and trim FreeRTOS on STM32</b>.</p><p>6. Patient and detail-oriented, works well under pressure; comfortable with MS Office; able to read datasheets in English; proficient with AI-assisted tools (e.g., Claude Code) to boost development efficiency.</p><p><b>Certificates:</b> Electrician (Intermediate), 1+X Sensor Network Application Development (Intermediate), ISO9001 Internal Auditor.</p>",
  "experience": [
    {
      "company": "Guangdong Qifeng Nuclear Technology Co., Ltd.",
      "role": "Embedded MCU Development Engineer",
      "period": "2026.07 - Present",
      "description": [
        "<p><b>Multi-channel servo drive</b>: independently developed dual PCA9685 driving 19 servo valves via I2C dual-bus physical isolation; 100kHz down-shift + timeout retry achieved 99.9% communication success rate; FreeRTOS queue-based command batching solved multi-servo action synchronization.</p>",
        "<p><b>Stepper motor precision control</b>: secondary development of Runze fluid controller with trapezoidal accel/decel + 1/32 micro-stepping, miss-step rate &lt; 0.1%; closed-loop dispensing with non-contact liquid-level sensor.</p>",
        "<p><b>Communication reliability</b>: added CRC16 check + auto retransmission on RS485 bus, bit error rate &lt; 0.01%.</p>",
        "<p><b>Host software &amp; remote control</b>: developed Python desktop tool (PyQt5/Flask) covering level adjustment / command queue dispatch / status monitoring; phone-browser remote debugging over LAN with 200ms async polling and local command persistence.</p>",
        "<p><b>Hardware reliability design</b>: completed 100mm x 100mm pluggable core-board PCB layout; power-domain separation (logic 3.3V / servo 5V-10A) + staged power-up eliminated power-off spikes; power sequencing + PCA9685 safe-state init achieved zero spurious actuation.</p>",
        "<p><b>System integration</b>: end-to-end bring-up and protocol definition from embedded to host, interfacing mechanical structure, superconducting gun research and Ra/Ac separation processes.</p>"
      ],
      "tags": ["STM32F407", "FreeRTOS", "PCA9685", "RS485/CRC16", "Runze Controller", "PyQt5/Flask", "LCEDA"]
    },
    {
      "company": "Guangdong Zhong'an Technology Co., Ltd.",
      "role": "Software Assistant Engineer",
      "period": "2025.03 - 2025.06",
      "description": [
        "<p><b>Low-level hardware driver</b>: implemented an 8080 parallel TFT-LCD driver on STM32F407ZGT6 using the FSMC bus, with fine-tuned timing to fully utilize 168MHz bus concurrency.</p>",
        "<p><b>Performance optimization</b>: designed a DMA double-buffer frame architecture decoupling framebuffer transfer from CPU rendering; rebuilt the refresh logic, improving frame rate by 40%+ and eliminating tearing and stutter.</p>",
        "<p><b>System &amp; interaction framework</b>: introduced FreeRTOS to decouple UI rendering, peripheral polling and business logic into independent tasks, coordinated via semaphores and message queues; built a dynamic multi-level menu engine on a doubly linked list supporting dynamic node add/remove, level jumping and cursor management.</p>",
        "<p><b>LVGL integration</b>: full LVGL port to the F407 platform, adapted to the FreeRTOS tick, rewrote the display driver for DMA double buffering, and leveraged the FPU to achieve a fluid industrial-grade GUI under constrained resources.</p>"
      ],
      "tags": ["STM32F407ZGT6", "8080 Parallel", "FreeRTOS", "DMA Double Buffer", "LVGL"]
    }
  ],
  "projects": [
    {
      "name": "STM32 Two-Wheel Self-Balancing Robot",
      "desc": "STM32F103C8T6 + MPU6050, complementary-filter attitude estimation, cascade PID (angle / speed / steering loops); NRF24L01 2.4G remote + HC-05 Bluetooth + PyQt5 host with waveform plotting, online PID tuning and parameter import/export.",
      "tags": ["STM32", "PID", "FreeRTOS", "PyQt5"],
      "link": ""
    },
    {
      "name": "CUMCM · National First Prize",
      "desc": "For a Yellow-River sediment monitoring problem, built a water-sediment flux analysis model and a SARIMA time-series forecasting model using Pearson correlation and Mann-Kendall trend tests; authored the paper and won the National First Prize.",
      "tags": ["Mathematical Modeling", "Python", "Data Analysis"],
      "link": ""
    },
    {
      "name": "Multi-Channel Servo Drive System (Nuclide Separation)",
      "desc": "STM32F407 + dual PCA9685 driving 19 servo valves over I2C dual-bus physical isolation; 100kHz down-shift and timeout retry achieved 99.9% communication success; FreeRTOS queue batching solved multi-servo sync; PyQt5/Flask host for level adjustment, command queue dispatch and phone remote debugging; power-domain separation and power sequencing ensured zero spurious actuation.",
      "tags": ["STM32F407", "FreeRTOS", "PCA9685", "RS485/CRC16", "PyQt5/Flask", "LCEDA"],
      "link": ""
    },
    {
      "name": "TFT-LCD Display System Optimization (Security Inspection)",
      "desc": "Implemented an 8080 parallel TFT-LCD driver on STM32F407ZGT6 over FSMC; DMA double-buffer architecture parallelized framebuffer transfer with CPU rendering, raising frame rate by 40%+; full LVGL port adapted to the FreeRTOS tick with FPU-accelerated graphics for a fluid industrial GUI.",
      "tags": ["STM32F407ZGT6", "8080 Parallel", "DMA Double Buffer", "FreeRTOS", "LVGL"],
      "link": ""
    }
  ],
  "education": [
    {
      "school": "Guangdong Polytechnic Normal University",
      "degree": "B.Eng. · Applied Electronic Technology Education",
      "period": "2025.09 - 2027.06",
      "description": ""
    },
    {
      "school": "Shenzhen Institute of Information Technology",
      "degree": "Associate · Internet of Things Application Technology",
      "period": "2022.09 - 2025.06",
      "description": "GPA 4.22/5.0, ranked 3/120. Key courses: Analog Electronics (100), Digital Electronics (94), PCB Design & Fabrication (100), MCU Application Development (96), Linux OS & Applications (100), IoT Technology & Applications (95), RFID Technology & Applications (96)."
    }
  ],
  "personal": [
    { "name": "CUMCM · National First Prize", "desc": "2023. Modeling & programming; built water-sediment flux and SARIMA forecasting models.", "file": null, "level": "National" },
    { "name": "BRICS Vocational Skills Competition · National Third Prize", "desc": "2023. National selection round for the South Africa main venue (Agricultural IoT).", "file": null, "level": "National" },
    { "name": "Academic Scholarship · First Class", "desc": "Two consecutive academic years (2022-2023, 2023-2024).", "file": null, "level": "University" },
    { "name": "University \"Outstanding Student\"", "desc": "Two consecutive academic years (2022-2023, 2023-2024).", "file": null, "level": "University" },
    { "name": "University \"Skill Star\"", "desc": "2022-2023 academic year.", "file": null, "level": "University" },
    { "name": "Certificates", "desc": "Electrician (Intermediate), 1+X Sensor Network Application Development (Intermediate), ISO9001 Internal Auditor.", "file": null, "level": "Other" }
  ],
  "articles": [
    {
      "title": "FreeRTOS Task Communication: Semaphore, Queue or Event Group?",
      "date": "2026-08",
      "summary": "A practical comparison of the three common FreeRTOS sync/communication mechanisms, with usage scenarios and common pitfalls.",
      "content": "<p>In multi-task embedded development, choosing the right inter-task communication primitive directly affects code clarity and reliability.</p><p><b>Queue</b> carries data, so use it when tasks need to exchange actual payloads (e.g., a sensor task sending measurements to a UI task). Always copy small structs by value and allocate queue length carefully against peak burst.</p><p><b>Semaphore (binary / counting)</b> only carries a signal, ideal for notifying a task that an ISR has fired. In ISRs use the FromISR variants, and keep critical sections as short as possible.</p><p><b>Event group</b> is the best fit for \"wait for several conditions at once\" logic, e.g., a task that should start only after init, calibration and network tasks all report ready.</p><p>Pitfalls: priority inversion with mutexes (solve with priority inheritance), and blocking forever without timeout — always prefer xQueueReceive(..., timeout) over infinite waits in production code.</p>"
    },
    {
      "title": "LVGL Porting and Performance Optimization on STM32",
      "date": "2026-08",
      "summary": "Key points from porting LVGL to an STM32F407 platform: display driver integration, framebuffer strategy, and CPU/memory tuning.",
      "content": "<p>Porting LVGL to a Cortex-M platform involves three layers: display driver, input driver and system tick.</p><p><b>Display driver:</b> implement flush_cb by writing the buffer to the LCD controller. Use double buffering so LVGL can draw into one buffer while the other is being flushed; with DMA the transfer runs in the background, leaving the CPU free to render.</p><p><b>Tick &amp; task:</b> drive lv_tick_inc() from the FreeRTOS tick hook, and call lv_timer_handler() in a low-priority task instead of blocking the main loop.</p><p><b>Performance:</b> enable the FPU for color conversion (RGB565 &lt;-&gt; ARGB8888) — on Cortex-M4F this can be several times faster; limit the number of active widgets and use partial drawing; cache frequently used styles instead of rebuilding them.</p><p>Start from the built-in porting examples (lv_port_disp, lv_port_indev) and keep the buffer size aligned to your frame dimensions for best DMA efficiency.</p>"
    }
  ]
};

/* avatar 与中文版保持一致（避免重复大字符串，运行时引用） */
window.DATA_EN.profile.avatar = (window.DEFAULT_DATA && window.DEFAULT_DATA.profile && window.DEFAULT_DATA.profile.avatar) || '';
