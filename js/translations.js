// ===== Translation System =====

const translations = {
    zh: {
        // Navigation
        home: '首页',
        about: '关于我们',
        benefits: '福利待遇',
        leaderboard: '获奖榜单',
        apply: '立即报名',
        
        // Hero Section
        heroBadge: '✨ 2026 招募季启动',
        heroTitle: '加入<span class="gradient-text">希望公会</span><br>成为闪耀主播',
        heroSubtitle: '专业培训 · 流量扶持 · 高额提成 · 业绩奖励<br>让你的才华在这里绽放光芒',
        applyNow: '立即报名',
        learnMore: '了解更多',
        
        // About Section
        whyUs: '为什么选择希望公会',
        whyUsSub: '专业团队 · 完善体系 · 成长保障',
        
        // Benefits Section
        benefitsTitle: '丰厚福利待遇',
        benefitsSub: '我们为主播提供全方位的支持与保障',
        
        // Leaderboard Section
        leaderboardTitle: '本月明星主播',
        leaderboardSub: '优秀主播榜单 · 见证你的成长',
        
        // Application Section
        applyTitle: '立即加入我们',
        applySub: '填写报名表，开启你的主播之路',
        
        // Form
        name: '姓名',
        age: '年龄',
        phone: '联系电话',
        wechat: '微信号',
        email: '邮箱',
        experience: '直播经验',
        specialization: '擅长领域',
        introduction: '个人简介',
        socialMedia: '社交媒体账号',
        submit: '提交申请',
        
        // Form Placeholders
        namePlaceholder: '请输入你的姓名',
        agePlaceholder: '请输入你的年龄',
        phonePlaceholder: '请输入你的手机号',
        wechatPlaceholder: '请输入你的微信号',
        emailPlaceholder: '请输入你的邮箱',
        introPlaceholder: '请简单介绍一下你自己，包括特长、优势、对直播的想法等...',
        socialPlaceholder: '请输入你的抖音、快手、B站等账号链接',
        
        // Form Options
        selectOption: '请选择',
        expNone: '无经验',
        exp1to3: '1-3个月',
        exp3to12: '3-12个月',
        exp1plus: '1年以上',
        specSinging: '唱歌',
        specDancing: '跳舞',
        specChatting: '聊天互动',
        specTalent: '才艺表演',
        specOther: '其他',
        
        // Notifications
        thankYou: '感谢申请！',
        applicationReceived: '我们已收到你的申请，招募团队会在24小时内联系你。',
        submitting: '正在提交...',
        pleaseWait: '请稍候',
        pleaseComplete: '请填写完整',
        fillRequired: '请填写所有必填项（标注*的项目）',
        formError: '提交失败',
        pleaseCheckForm: '请检查表单并重试，或直接联系我们。',
        viewingProfile: '查看主播',
        
        // Footer
        footerTagline: '希望公会 | 让每个主播都闪闪发光',
        footerCopyright: '© 2026 ℋ Agency 希望公会. All rights reserved. | 主播招募 | h_agency21'
    },
    
    en: {
        // Navigation
        home: 'Home',
        about: 'About',
        benefits: 'Benefits',
        leaderboard: 'Leaderboard',
        apply: 'Apply',
        
        // Hero Section
        heroBadge: '✨ 2026 Recruitment Season',
        heroTitle: 'Join <span class="gradient-text">ℋ Agency</span><br>Become a Shining Star',
        heroSubtitle: 'Professional Training · Traffic Support · High Commission · Performance Rewards<br>Unleash Your Talent Here',
        applyNow: 'Apply Now',
        learnMore: 'Learn More',
        
        // About Section
        whyUs: 'Why Choose ℋ Agency',
        whyUsSub: 'Professional Team · Complete System · Growth Guarantee',
        
        // Benefits Section
        benefitsTitle: 'Amazing Benefits',
        benefitsSub: 'Comprehensive Support & Security for All Streamers',
        
        // Leaderboard Section
        leaderboardTitle: 'Top Streamers This Month',
        leaderboardSub: 'Excellence Board · Witness Your Growth',
        
        // Application Section
        applyTitle: 'Join Us Today',
        applySub: 'Fill out the form and start your streaming journey',
        
        // Form
        name: 'Name',
        age: 'Age',
        phone: 'Phone',
        wechat: 'WeChat ID',
        email: 'Email',
        experience: 'Streaming Experience',
        specialization: 'Specialization',
        introduction: 'About Yourself',
        socialMedia: 'Social Media',
        submit: 'Submit Application',
        
        // Form Placeholders
        namePlaceholder: 'Enter your name',
        agePlaceholder: 'Enter your age',
        phonePlaceholder: 'Enter your phone number',
        wechatPlaceholder: 'Enter your WeChat ID',
        emailPlaceholder: 'Enter your email',
        introPlaceholder: 'Tell us about yourself, your strengths, advantages, and thoughts about streaming...',
        socialPlaceholder: 'Enter your TikTok, Kuaishou, Bilibili or other social media links',
        
        // Form Options
        selectOption: 'Please select',
        expNone: 'No experience',
        exp1to3: '1-3 months',
        exp3to12: '3-12 months',
        exp1plus: '1+ years',
        specSinging: 'Singing',
        specDancing: 'Dancing',
        specChatting: 'Chatting',
        specTalent: 'Talent Show',
        specOther: 'Other',
        
        // Notifications
        thankYou: 'Thank You!',
        applicationReceived: 'We have received your application. Our recruitment team will contact you within 24 hours.',
        submitting: 'Submitting...',
        pleaseWait: 'Please wait',
        pleaseComplete: 'Please Complete',
        fillRequired: 'Please fill in all required fields (marked with *)',
        formError: 'Submission Failed',
        pleaseCheckForm: 'Please check the form and try again, or contact us directly.',
        viewingProfile: 'Viewing Profile',
        
        // Footer
        footerTagline: 'ℋ Agency | Making Every Streamer Shine',
        footerCopyright: '© 2026 ℋ Agency. All rights reserved. | Streamer Recruitment | h_agency21'
    }
};

// Current language state
let currentLang = 'zh';

// Language toggle function
function toggleLanguage() {
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    updatePageLanguage();
    return currentLang;
}

// Update all page elements with translations
function updatePageLanguage() {
    const t = translations[currentLang];
    
    // Update navigation
    const navLinks = document.querySelectorAll('.nav-links a');
    if (navLinks.length >= 5) {
        navLinks[0].textContent = t.home;
        navLinks[1].textContent = t.about;
        navLinks[2].textContent = t.benefits;
        navLinks[3].textContent = t.leaderboard;
        navLinks[4].textContent = t.apply;
    }
    
    // Update hero section
    const heroBadge = document.querySelector('.hero-badge');
    if (heroBadge) heroBadge.innerHTML = t.heroBadge;
    
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle) heroTitle.innerHTML = t.heroTitle;
    
    const heroSubtitle = document.querySelector('.hero p');
    if (heroSubtitle) heroSubtitle.innerHTML = t.heroSubtitle;
    
    const btnPrimary = document.querySelectorAll('.btn-primary')[0];
    if (btnPrimary) btnPrimary.textContent = t.applyNow;
    
    const btnSecondary = document.querySelector('.btn-secondary');
    if (btnSecondary) btnSecondary.textContent = t.learnMore;
    
    // Update section titles
    const sectionTitles = document.querySelectorAll('.section-title');
    if (sectionTitles.length >= 4) {
        sectionTitles[0].textContent = t.whyUs;
        sectionTitles[1].textContent = t.benefitsTitle;
        sectionTitles[2].textContent = t.leaderboardTitle;
        sectionTitles[3].textContent = t.applyTitle;
    }
    
    const sectionSubtitles = document.querySelectorAll('.section-subtitle');
    if (sectionSubtitles.length >= 4) {
        sectionSubtitles[0].textContent = t.whyUsSub;
        sectionSubtitles[1].textContent = t.benefitsSub;
        sectionSubtitles[2].textContent = t.leaderboardSub;
        sectionSubtitles[3].textContent = t.applySub;
    }
    
    // Update all elements with data-zh and data-en attributes
    document.querySelectorAll('[data-zh][data-en]').forEach(element => {
        const zhText = element.getAttribute('data-zh');
        const enText = element.getAttribute('data-en');
        element.textContent = currentLang === 'zh' ? zhText : enText;
    });
    
    // Update placeholders
    document.querySelectorAll('[data-placeholder-zh][data-placeholder-en]').forEach(element => {
        const zhPlaceholder = element.getAttribute('data-placeholder-zh');
        const enPlaceholder = element.getAttribute('data-placeholder-en');
        element.placeholder = currentLang === 'zh' ? zhPlaceholder : enPlaceholder;
    });
    
    // Update select options
    const experienceSelect = document.getElementById('experienceSelect');
    const specializationSelect = document.getElementById('specializationSelect');
    
    if (experienceSelect) {
        Array.from(experienceSelect.options).forEach(option => {
            const zh = option.getAttribute('data-zh');
            const en = option.getAttribute('data-en');
            if (zh && en) {
                option.textContent = currentLang === 'zh' ? zh : en;
            }
        });
    }
    
    if (specializationSelect) {
        Array.from(specializationSelect.options).forEach(option => {
            const zh = option.getAttribute('data-zh');
            const en = option.getAttribute('data-en');
            if (zh && en) {
                option.textContent = currentLang === 'zh' ? zh : en;
            }
        });
    }
    
    // Update language toggle button
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.textContent = currentLang === 'zh' ? 'EN' : '中文';
    }
}

// Get translation for a specific key
function getTranslation(key) {
    return translations[currentLang][key] || key;
}

// Export for global use
window.i18n = {
    translations,
    currentLang,
    toggleLanguage,
    updatePageLanguage,
    getTranslation,
    t: () => translations[currentLang]
};
