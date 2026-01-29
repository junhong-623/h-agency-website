// ===== Main Website Business Logic =====

// Database reference (will be set when Firebase is ready)
let db = null;

// Current language state (initialized from translations.js)
// let currentLang = 'zh';

// Wait for Firebase to be ready
function waitForFirebase(callback) {
    if (window.appConfig && window.appConfig.database) {
        db = window.appConfig.database;
        console.log('✓ Database ready in main.js');
        callback();
    } else {
        console.log('⏳ Waiting for Firebase...');
        window.addEventListener('firebaseReady', function handler() {
            db = window.appConfig.database;
            console.log('✓ Database ready in main.js');
            window.removeEventListener('firebaseReady', handler);
            callback();
        }, { once: true });
    }
}

// ===== Theme Toggle =====
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    if (!themeToggle || themeToggle.dataset.bound) return;

    themeToggle.dataset.bound = '1';
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = body.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            body.setAttribute('data-theme', newTheme);
            themeToggle.textContent = newTheme === 'light' ? '🌙' : '☀️';
        });
    }
}

// ===== Language Toggle =====
function initLanguageToggle() {
    const langToggle = document.getElementById('langToggle');
    if (!langToggle || langToggle.dataset.bound) return;

    langToggle.dataset.bound = '1';
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            currentLang = window.i18n.toggleLanguage();
        });
    }
}

// ===== Load Leaderboard from Firebase =====
async function loadLeaderboard() {
    if (!db) {
        console.error('Database not initialized');
        return;
    }

    const leaderboardRef = db.ref('leaderboard');
    
    try {
        const snapshot = await leaderboardRef.once('value');
        const data = snapshot.val();
        const container = document.getElementById('leaderboardContainer');
        
        if (!container) return;
        
        if (!data) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">暂无排行榜数据</p>';
            return;
        }
        
        const leaderboard = Object.values(data).sort((a, b) => (b.income || 0) - (a.income || 0));
        
        let html = '';
        leaderboard.forEach((streamer, index) => {
            const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
            const rankIcon = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1;
            
            const statsZh = `本月收入: ¥${(streamer.income || 0).toLocaleString()} | 直播时长: ${streamer.hours || 0}小时 | 粉丝增长: +${(streamer.fansGrowth || 0).toLocaleString()}`;
            const statsEn = `Monthly Income: ¥${(streamer.income || 0).toLocaleString()} | Streaming Hours: ${streamer.hours || 0}hrs | Fans Growth: +${(streamer.fansGrowth || 0).toLocaleString()}`;
            
            html += `
                <div class="leaderboard-item">
                    <div class="rank ${rankClass}">${rankIcon}</div>
                    <div class="streamer-info">
                        <div class="streamer-name" data-zh="${streamer.nameZh || ''}" data-en="${streamer.nameEn || ''}">${streamer.nameZh || '主播'}</div>
                        <div class="streamer-stats" data-zh="${statsZh}" data-en="${statsEn}">${statsZh}</div>
                    </div>
                    <div class="streamer-actions">
                        <div class="achievement-badge" data-zh="${streamer.badgeZh || ''}" data-en="${streamer.badgeEn || ''}">${streamer.badgeZh || '优秀主播'}</div>
                        <button class="view-streamer-btn" data-zh="查看主播" data-en="View Profile" onclick="viewStreamer('${streamer.nameZh}', '${streamer.nameEn}')">${currentLang === 'zh' ? '查看主播' : 'View Profile'}</button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading leaderboard:', error);
    }
}

// View streamer profile
function viewStreamer(nameZh, nameEn) {
    const t = window.i18n.t();
    const name = currentLang === 'zh' ? nameZh : nameEn;
    utils.showNotification(
        t.viewingProfile,
        `${currentLang === 'zh' ? '正在查看' : 'Viewing'} ${name} ${currentLang === 'zh' ? '的主页' : "'s profile"}`
    );
}

// ===== Form Submission =====
async function handleFormSubmit(e) {
    e.preventDefault();
    
    console.log('=== Form Submit Started ===');
    
    const t = window.i18n.t();
    
    const formData = {
        name: document.getElementById('applicantName').value.trim(),
        age: document.getElementById('applicantAge').value,
        phone: document.getElementById('applicantPhone').value.trim(),
        wechat: document.getElementById('applicantWechat').value.trim(),
        email: document.getElementById('applicantEmail').value.trim(),
        experience: document.getElementById('experienceSelect').selectedOptions[0].getAttribute('data-zh'),
        specialization: document.getElementById('specializationSelect').selectedOptions[0].getAttribute('data-zh'),
        introduction: document.getElementById('applicantIntro').value.trim(),
        social: document.getElementById('applicantSocial').value.trim(),
        submittedAt: new Date().toISOString(),
        status: 'pending'
    };
    
    console.log('Form Data:', formData);
    
    // Validation
    if (!formData.name || !formData.age || !formData.phone || !formData.experience || !formData.specialization || !formData.introduction) {
        console.log('Validation failed');
        utils.showNotification(
            currentLang === 'zh' ? '请填写完整' : 'Please Complete',
            currentLang === 'zh' ? '请填写所有必填项（标注*的项目）' : 'Please fill in all required fields (marked with *)'
        );
        return false;
    }
    
    utils.showNotification(
        currentLang === 'zh' ? '正在提交...' : 'Submitting...',
        currentLang === 'zh' ? '请稍候' : 'Please wait'
    );
    
    let firebaseSuccess = false;
    let emailSuccess = false;
    
    // 1. Save to Firebase
    if (db) {
        try {
            const submissionsRef = db.ref('submissions');
            await submissionsRef.push(formData);
            console.log('✓ Saved to Firebase successfully');
            firebaseSuccess = true;
        } catch (error) {
            console.error('✗ Firebase Error:', error);
        }
    } else {
        console.warn('Firebase not configured');
    }
    
    // 2. Send Email via EmailJS
    const emailCfg = window.appConfig ? window.appConfig.email : null;
    if (emailCfg && emailCfg.publicKey && typeof emailjs !== 'undefined') {
        try {
            const templateParams = {
                from_name: formData.name,
                reply_to: formData.email || 'noreply@hagency.com',
                to_name: 'ℋ Agency 招募团队',
                message: `新主播申请：${formData.name}`,
                applicant_name: formData.name,
                applicant_age: formData.age,
                applicant_phone: formData.phone,
                applicant_wechat: formData.wechat || '未填写',
                applicant_email: formData.email || '未填写',
                applicant_experience: formData.experience,
                applicant_specialization: formData.specialization,
                applicant_introduction: formData.introduction,
                applicant_social: formData.social || '未填写',
                submitted_at: new Date(formData.submittedAt).toLocaleString('zh-CN', { timeZone: 'Asia/Kuala_Lumpur' })
            };
            
            await emailjs.send(
                emailCfg.serviceId,
                emailCfg.templateId,
                templateParams
            );
            console.log('✓ Email sent successfully');
            emailSuccess = true;
        } catch (error) {
            console.error('✗ EmailJS Error:', error);
        }
    } else {
        console.warn('EmailJS not configured');
    }
    
    // Show result
    if (firebaseSuccess || emailSuccess) {
        document.getElementById('applicationForm').reset();
        
        let successMsg = t.applicationReceived;
        if (firebaseSuccess && emailSuccess) {
            successMsg += ' (已保存到数据库并发送邮件通知)';
        } else if (firebaseSuccess) {
            successMsg += ' (已保存到数据库)';
        } else if (emailSuccess) {
            successMsg += ' (已发送邮件通知)';
        }
        
        utils.showNotification(t.thankYou, successMsg);
        console.log('=== Form Submit Complete ===');
    } else {
        utils.showNotification(
            t.formError,
            '提交失败，请检查Firebase和EmailJS配置，或直接联系我们'
        );
    }
    
    return false;
}

// ===== Scroll Reveal Animation =====
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    const revealOnScroll = () => {
        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight - 100) {
                element.classList.add('active');
            }
        });
    };
    
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check
}

// ===== Smooth Scroll for Navigation =====
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== Initialize Everything =====
function init() {
    console.log('🚀 Initializing main website...');
    
    // Initialize theme toggle
    initThemeToggle();
    
    // Initialize language toggle
    initLanguageToggle();
    
    // Initialize scroll reveal
    initScrollReveal();
    
    // Initialize smooth scroll
    initSmoothScroll();
    
    // Attach form submit handler
    const form = document.getElementById('applicationForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    console.log('✓ Main website initialized');
}

// Wait for Firebase, then load leaderboard and initialize
waitForFirebase(() => {
    loadLeaderboard();
    init();
});

// Also initialize UI parts that don't need Firebase
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
