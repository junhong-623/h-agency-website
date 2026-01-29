// ===== Admin Panel Business Logic =====

// Database reference (will be set when Firebase is ready)
let db = null;

// Current admin state
let currentAdminKey = null;
let currentReviewId = null;

// Wait for Firebase to be ready
function waitForFirebase(callback) {
    if (window.appConfig && window.appConfig.database) {
        db = window.appConfig.database;
        console.log('✓ Database ready in admin.js');
        callback();
    } else {
        console.log('⏳ Waiting for Firebase...');
        window.addEventListener('firebaseReady', function handler() {
            db = window.appConfig.database;
            console.log('✓ Database ready in admin.js');
            window.removeEventListener('firebaseReady', handler);
            callback();
        }, { once: true });
    }
}

// ===== Authentication =====

async function initDefaultAdmin() {
    if (!db) {
        console.warn('Database not ready yet');
        return;
    }
    
    const snapshot = await db.ref('admins').once('value');
    if (!snapshot.val()) {
        await db.ref('admins').push({
            username: 'admin',
            password: utils.hashPassword('admin123'),
            name: '超级管理员',
            isDefault: true,
            createdAt: new Date().toISOString()
        });
        console.log('✓ Default admin created');
    }
}

function checkAuth() {
    const user = localStorage.getItem('currentUser');
    currentAdminKey = localStorage.getItem('currentAdminKey');
    
    if (!user || !currentAdminKey) {
        document.getElementById('loginPage')?.classList.remove('hidden');
        document.getElementById('dashboard')?.classList.add('hidden');
        return false;
    }
    
    document.getElementById('loginPage')?.classList.add('hidden');
    document.getElementById('dashboard')?.classList.remove('hidden');
    
    const currentUserEl = document.getElementById('currentUser');
    if (currentUserEl) {
        currentUserEl.textContent = '👤 ' + user;
    }
    
    return true;
}

async function login() {
    const username = document.getElementById('loginUsername')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;
    const errorDiv = document.getElementById('loginError');

    if (!username || !password) {
        if (errorDiv) {
            errorDiv.textContent = '请输入用户名和密码';
            errorDiv.classList.add('show');
        }
        return;
    }

    if (!db) {
        if (errorDiv) {
            errorDiv.textContent = 'Firebase未初始化，请刷新页面';
            errorDiv.classList.add('show');
        }
        return;
    }

    const snapshot = await db.ref('admins').once('value');
    const admins = snapshot.val();
    
    if (!admins) {
        if (errorDiv) {
            errorDiv.textContent = '管理员数据不存在';
            errorDiv.classList.add('show');
        }
        return;
    }

    const hashedPwd = utils.hashPassword(password);
    let found = null, foundKey = null;

    for (const [key, admin] of Object.entries(admins)) {
        if (admin.username === username && admin.password === hashedPwd) {
            found = admin;
            foundKey = key;
            break;
        }
    }

    if (found) {
        localStorage.setItem('currentUser', found.name || found.username);
        localStorage.setItem('currentAdminKey', foundKey);
        if (errorDiv) errorDiv.classList.remove('show');
        checkAuth();
        loadSubmissions();
    } else {
        if (errorDiv) {
            errorDiv.textContent = '用户名或密码错误';
            errorDiv.classList.add('show');
        }
    }
}

function logout() {
    if (confirm('确定要登出吗？')) {
        localStorage.clear();
        checkAuth();
    }
}

// ===== Tab Switching =====

function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    event.target.classList.add('active');
    
    const content = document.getElementById(tabName);
    if (content) content.classList.add('active');
    
    if (tabName === 'submissions') loadSubmissions();
    else if (tabName === 'leaderboard') loadLeaderboard();
    else if (tabName === 'admins') loadAdmins();
}

// ===== Submissions Management =====

async function loadSubmissions() {
    if (!db) return;
    
    const snapshot = await db.ref('submissions').once('value');
    const data = snapshot.val();
    const tableDiv = document.getElementById('submissionsTable');
    
    if (!tableDiv) return;
    
    if (!data) {
        tableDiv.innerHTML = '<p>暂无申请</p>';
        return;
    }
    
    const submissions = Object.entries(data)
        .map(([k, v]) => ({...v, key: k}))
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    
    let html = '<table><thead><tr><th>姓名</th><th>电话</th><th>经验</th><th>提交时间</th><th>状态</th><th>操作</th></tr></thead><tbody>';
    
    submissions.forEach(sub => {
        const time = sub.submittedAt ? utils.formatDate(sub.submittedAt) : '-';
        const status = sub.status || 'pending';
        
        let statusBadge = '';
        if (status === 'pending' || status === 'new') {
            statusBadge = '<span class="status-badge status-pending">待审核</span>';
        } else if (status === 'approved') {
            statusBadge = '<span class="status-badge status-approved">已通过</span>';
        } else if (status === 'rejected') {
            statusBadge = '<span class="status-badge status-rejected">已拒绝</span>';
        }
        
        html += `<tr>
            <td>${sub.name || '-'}</td>
            <td>${sub.phone || '-'}</td>
            <td>${sub.experience || '-'}</td>
            <td>${time}</td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn btn-small btn-success" onclick="reviewApplication('${sub.key}')">审核</button>
                <button class="btn btn-small btn-danger" onclick="deleteSubmission('${sub.key}')">删除</button>
            </td>
        </tr>`;
    });
    
    html += '</tbody></table>';
    tableDiv.innerHTML = html;
}

async function reviewApplication(key) {
    currentReviewId = key;
    const snapshot = await db.ref('submissions/' + key).once('value');
    const sub = snapshot.val();
    
    if (!sub) return;
    
    const content = document.getElementById('reviewContent');
    if (!content) return;
    
    const status = sub.status || 'pending';
    
    content.innerHTML = `
        <div class="info-row">
            <div class="info-label">申请人姓名</div>
            <div class="info-value">${sub.name || '-'}</div>
        </div>
        <div class="info-row">
            <div class="info-label">年龄</div>
            <div class="info-value">${sub.age || '-'} 岁</div>
        </div>
        <div class="info-row">
            <div class="info-label">联系电话</div>
            <div class="info-value">${sub.phone || '-'}</div>
        </div>
        <div class="info-row">
            <div class="info-label">微信号</div>
            <div class="info-value">${sub.wechat || '未填写'}</div>
        </div>
        <div class="info-row">
            <div class="info-label">邮箱</div>
            <div class="info-value">${sub.email || '未填写'}</div>
        </div>
        <div class="info-row">
            <div class="info-label">直播经验</div>
            <div class="info-value">${sub.experience || '-'}</div>
        </div>
        <div class="info-row">
            <div class="info-label">擅长领域</div>
            <div class="info-value">${sub.specialization || '-'}</div>
        </div>
        <div class="info-row">
            <div class="info-label">个人简介</div>
            <div class="info-value" style="white-space: pre-wrap;">${sub.introduction || '-'}</div>
        </div>
        <div class="info-row">
            <div class="info-label">社交媒体</div>
            <div class="info-value">${sub.social || '未填写'}</div>
        </div>
        <div class="info-row">
            <div class="info-label">提交时间</div>
            <div class="info-value">${sub.submittedAt ? utils.formatDate(sub.submittedAt) : '-'}</div>
        </div>
        <div class="info-row">
            <div class="info-label">当前状态</div>
            <div class="info-value">
                ${status === 'approved' ? '✅ 已通过' : status === 'rejected' ? '❌ 已拒绝' : '⏳ 待审核'}
            </div>
        </div>
        
        ${status === 'approved' && sub.nickname ? `
        <div class="info-row">
            <div class="info-label">主播昵称</div>
            <div class="info-value">${sub.nickname}</div>
        </div>
        ` : ''}
        
        ${status === 'rejected' && sub.rejectionReason ? `
        <div class="info-row">
            <div class="info-label">拒绝理由</div>
            <div class="info-value">${sub.rejectionReason}</div>
        </div>
        ` : ''}
        
        <div class="action-section">
            <h3 style="margin-bottom: 1rem;">审核操作</h3>
            
            <div id="approveSection" style="margin-bottom: 2rem; padding: 1.5rem; background: var(--bg-primary); border-radius: 15px;">
                <h4 style="color: #4caf50; margin-bottom: 1rem;">✅ 通过申请</h4>
                <div class="form-group">
                    <label>主播昵称（中文）*</label>
                    <input type="text" id="nicknameZh" placeholder="例如：甜心小兔" value="${sub.nickname || sub.name || ''}">
                </div>
                <div class="form-group">
                    <label>主播昵称（英文）*</label>
                    <input type="text" id="nicknameEn" placeholder="例如：Sweet Bunny" value="${sub.nicknameEn || ''}">
                </div>
                <div class="form-group">
                    <label>直播链接</label>
                    <input type="text" id="reviewStreamUrl" placeholder="https://..." value="${sub.streamUrl || ''}">
                </div>
                <div class="checkbox-group">
                    <input type="checkbox" id="addToLeaderboard" ${sub.inLeaderboard ? 'checked' : ''}>
                    <label style="margin: 0;">同时添加到排行榜</label>
                </div>
                <button class="btn btn-success" onclick="approveApplication()" style="margin-top: 1rem;">确认通过</button>
            </div>
            
            <div id="rejectSection" style="padding: 1.5rem; background: var(--bg-primary); border-radius: 15px;">
                <h4 style="color: #f44336; margin-bottom: 1rem;">❌ 拒绝申请</h4>
                <div class="form-group">
                    <label>拒绝理由 *</label>
                    <textarea id="rejectionReason" placeholder="请填写拒绝理由...">${sub.rejectionReason || ''}</textarea>
                </div>
                <button class="btn btn-danger" onclick="rejectApplication()">确认拒绝</button>
            </div>
        </div>
    `;
    
    document.getElementById('reviewModal')?.classList.add('show');
}

async function approveApplication() {
    const nicknameZh = document.getElementById('nicknameZh')?.value.trim();
    const nicknameEn = document.getElementById('nicknameEn')?.value.trim();
    const streamUrl = document.getElementById('reviewStreamUrl')?.value.trim();
    const addToLeaderboard = document.getElementById('addToLeaderboard')?.checked;
    
    if (!nicknameZh || !nicknameEn) {
        alert('请填写主播昵称（中英文）');
        return;
    }
    
    const updates = {
        status: 'approved',
        nickname: nicknameZh,
        nicknameEn: nicknameEn,
        streamUrl: streamUrl,
        inLeaderboard: addToLeaderboard,
        approvedAt: new Date().toISOString(),
        approvedBy: localStorage.getItem('currentUser')
    };
    
    try {
        await db.ref('submissions/' + currentReviewId).update(updates);
        
        if (addToLeaderboard) {
            const submissionSnapshot = await db.ref('submissions/' + currentReviewId).once('value');
            const submission = submissionSnapshot.val();
            
            const leaderboardData = {
                nameZh: nicknameZh,
                nameEn: nicknameEn,
                streamUrl: streamUrl,
                income: 0,
                hours: 0,
                fansGrowth: 0,
                badgeZh: '新人主播',
                badgeEn: 'Newcomer',
                originalName: submission.name,
                phone: submission.phone,
                addedAt: new Date().toISOString(),
                submissionId: currentReviewId
            };
            
            await db.ref('leaderboard').push(leaderboardData);
        }
        
        alert('审核通过！');
        closeReviewModal();
        loadSubmissions();
    } catch (error) {
        alert('操作失败：' + error.message);
    }
}

async function rejectApplication() {
    const reason = document.getElementById('rejectionReason')?.value.trim();
    
    if (!reason) {
        alert('请填写拒绝理由');
        return;
    }
    
    const updates = {
        status: 'rejected',
        rejectionReason: reason,
        rejectedAt: new Date().toISOString(),
        rejectedBy: localStorage.getItem('currentUser')
    };
    
    try {
        await db.ref('submissions/' + currentReviewId).update(updates);
        alert('已拒绝申请');
        closeReviewModal();
        loadSubmissions();
    } catch (error) {
        alert('操作失败：' + error.message);
    }
}

function closeReviewModal() {
    document.getElementById('reviewModal')?.classList.remove('show');
    currentReviewId = null;
}

async function deleteSubmission(key) {
    if (!confirm('确定删除这条申请吗？此操作不可恢复！')) return;
    await db.ref('submissions/' + key).remove();
    loadSubmissions();
}

// ===== Leaderboard Management =====

async function loadLeaderboard() {
    if (!db) return;
    
    const snapshot = await db.ref('leaderboard').once('value');
    const data = snapshot.val();
    const listDiv = document.getElementById('leaderboardList');
    
    if (!listDiv) return;
    
    if (!data) {
        listDiv.innerHTML = '<p>暂无排行榜</p>';
        return;
    }
    
    const leaderboard = Object.entries(data)
        .map(([k, v]) => ({...v, key: k}))
        .sort((a, b) => (b.income || 0) - (a.income || 0));
    
    let html = '';
    leaderboard.forEach((s, i) => {
        html += `<div style="padding:1rem;background:var(--bg-secondary);margin-bottom:1rem;border-radius:10px;">
            <strong>${i+1}. ${s.nameZh||'-'} / ${s.nameEn||'-'}</strong> - ¥${utils.formatNumber(s.income || 0)}
            ${s.streamUrl ? `<br><small>直播链接: <a href="${s.streamUrl}" target="_blank">${s.streamUrl}</a></small>` : ''}
            <div style="margin-top:0.5rem;">
                <button class="btn btn-small" onclick="editStreamer('${s.key}')">编辑</button>
                <button class="btn btn-small btn-secondary" onclick="deleteStreamer('${s.key}')">删除</button>
            </div>
        </div>`;
    });
    
    listDiv.innerHTML = html;
}

async function saveStreamer() {
    const editId = document.getElementById('editId')?.value;
    const streamer = {
        nameZh: document.getElementById('streamerNameZh')?.value.trim(),
        nameEn: document.getElementById('streamerNameEn')?.value.trim(),
        streamUrl: document.getElementById('streamUrl')?.value.trim(),
        income: parseInt(document.getElementById('income')?.value) || 0,
        hours: parseInt(document.getElementById('hours')?.value) || 0,
        fansGrowth: parseInt(document.getElementById('fansGrowth')?.value) || 0,
        badgeZh: document.getElementById('badgeZh')?.value.trim(),
        badgeEn: document.getElementById('badgeEn')?.value.trim()
    };
    
    if (!streamer.nameZh || !streamer.nameEn) {
        alert('请填写必填项！');
        return;
    }
    
    if (editId) {
        await db.ref('leaderboard/' + editId).update(streamer);
    } else {
        await db.ref('leaderboard').push(streamer);
    }
    
    document.getElementById('editId').value = '';
    ['streamerNameZh', 'streamerNameEn', 'streamUrl', 'income', 'hours', 'fansGrowth', 'badgeZh', 'badgeEn'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    
    loadLeaderboard();
    alert('保存成功！');
}

async function editStreamer(key) {
    const snapshot = await db.ref('leaderboard/' + key).once('value');
    const s = snapshot.val();
    
    document.getElementById('editId').value = key;
    document.getElementById('streamerNameZh').value = s.nameZh || '';
    document.getElementById('streamerNameEn').value = s.nameEn || '';
    document.getElementById('streamUrl').value = s.streamUrl || '';
    document.getElementById('income').value = s.income || '';
    document.getElementById('hours').value = s.hours || '';
    document.getElementById('fansGrowth').value = s.fansGrowth || '';
    document.getElementById('badgeZh').value = s.badgeZh || '';
    document.getElementById('badgeEn').value = s.badgeEn || '';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteStreamer(key) {
    if (!confirm('确定删除？')) return;
    await db.ref('leaderboard/' + key).remove();
    loadLeaderboard();
}

// ===== Password Change =====

async function changePassword() {
    const current = document.getElementById('currentPassword')?.value;
    const newPwd = document.getElementById('newPassword')?.value;
    const confirm = document.getElementById('confirmPassword')?.value;
    const errorDiv = document.getElementById('passwordError');
    const successDiv = document.getElementById('passwordSuccess');
    
    if (errorDiv) errorDiv.classList.remove('show');
    if (successDiv) successDiv.classList.remove('show');
    
    if (!current || !newPwd || !confirm) {
        if (errorDiv) {
            errorDiv.textContent = '请填写所有字段';
            errorDiv.classList.add('show');
        }
        return;
    }
    
    if (newPwd.length < 6) {
        if (errorDiv) {
            errorDiv.textContent = '新密码长度至少6个字符';
            errorDiv.classList.add('show');
        }
        return;
    }
    
    if (newPwd !== confirm) {
        if (errorDiv) {
            errorDiv.textContent = '两次输入的新密码不一致';
            errorDiv.classList.add('show');
        }
        return;
    }
    
    if (!currentAdminKey) {
        if (errorDiv) {
            errorDiv.textContent = '未找到当前用户，请重新登录';
            errorDiv.classList.add('show');
        }
        return;
    }
    
    const snapshot = await db.ref('admins/' + currentAdminKey).once('value');
    const admin = snapshot.val();
    
    if (!admin || admin.password !== utils.hashPassword(current)) {
        if (errorDiv) {
            errorDiv.textContent = '当前密码错误';
            errorDiv.classList.add('show');
        }
        return;
    }
    
    try {
        await db.ref('admins/' + currentAdminKey).update({
            password: utils.hashPassword(newPwd)
        });
        if (successDiv) {
            successDiv.textContent = '密码修改成功！2秒后将自动登出';
            successDiv.classList.add('show');
        }
        setTimeout(() => { logout(); }, 2000);
    } catch (error) {
        if (errorDiv) {
            errorDiv.textContent = '修改失败：' + error.message;
            errorDiv.classList.add('show');
        }
    }
}

function checkPasswordStrength() {
    const pwd = document.getElementById('newPassword')?.value;
    const bar = document.getElementById('strengthBar');
    const text = document.getElementById('strengthText');
    
    if (!pwd || !bar || !text) return;
    
    const strength = utils.checkPasswordStrength(pwd);
    
    bar.style.width = strength.width;
    bar.style.background = strength.color;
    text.textContent = '密码强度：' + strength.text;
    text.style.color = strength.color;
}

// ===== Admins Management =====

async function loadAdmins() {
    if (!db) return;
    
    const snapshot = await db.ref('admins').once('value');
    const data = snapshot.val();
    const tableDiv = document.getElementById('adminsTable');
    
    if (!tableDiv) return;
    
    if (!data) {
        tableDiv.innerHTML = '<p>暂无管理员</p>';
        return;
    }
    
    const admins = Object.entries(data).map(([k, v]) => ({...v, key: k}));
    
    let html = '<table><thead><tr><th>用户名</th><th>姓名</th><th>操作</th></tr></thead><tbody>';
    admins.forEach(admin => {
        html += `<tr>
            <td>${admin.username||'-'}</td>
            <td>${admin.name||'-'}</td>
            <td>${!admin.isDefault ? `<button class="btn btn-small btn-secondary" onclick="deleteAdmin('${admin.key}')">删除</button>` : '-'}</td>
        </tr>`;
    });
    html += '</tbody></table>';
    
    tableDiv.innerHTML = html;
}

async function addAdmin() {
    const username = document.getElementById('newAdminUsername')?.value.trim();
    const password = document.getElementById('newAdminPassword')?.value;
    const name = document.getElementById('newAdminName')?.value.trim();
    
    if (!username || !password) {
        alert('请填写用户名和密码！');
        return;
    }
    
    if (username.length < 4 || password.length < 6) {
        alert('用户名至少4个字符，密码至少6个字符！');
        return;
    }
    
    const snapshot = await db.ref('admins').once('value');
    const admins = snapshot.val();
    
    if (admins) {
        for (const admin of Object.values(admins)) {
            if (admin.username === username) {
                alert('用户名已存在！');
                return;
            }
        }
    }
    
    await db.ref('admins').push({
        username,
        password: utils.hashPassword(password),
        name,
        createdAt: new Date().toISOString(),
        isDefault: false
    });
    
    document.getElementById('newAdminUsername').value = '';
    document.getElementById('newAdminPassword').value = '';
    document.getElementById('newAdminName').value = '';
    
    loadAdmins();
    alert('添加成功！');
}

async function deleteAdmin(key) {
    if (!confirm('确定删除？')) return;
    await db.ref('admins/' + key).remove();
    loadAdmins();
}

// ===== Initialize =====

function init() {
    console.log('🔧 Initializing admin panel...');
    
    // Check authentication
    checkAuth();
    
    // Add enter key support for login
    ['loginUsername', 'loginPassword'].forEach(id => {
        document.getElementById(id)?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') login();
        });
    });
    
    console.log('✓ Admin panel initialized');
}

// Wait for Firebase, then initialize
waitForFirebase(() => {
    initDefaultAdmin();
    init();
});
