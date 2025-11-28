// auth.js - Xử lý logic xác thực với Google OAuth

// Quản lý xác thực
const AuthManager = {
    // Cấu hình Google OAuth
    googleConfig: {
        clientId: CONFIG.GOOGLE_AUTH.CLIENT_ID,
        hostedDomain: CONFIG.GOOGLE_AUTH.HOSTED_DOMAIN,
        autoSelect: false,
        prompt: 'select_account' // Luôn hiển thị màn hình chọn tài khoản
    },
    
    // Khởi tạo
    init: function() {
        console.log('Khởi tạo AuthManager với Google OAuth');
        
        // Kiểm tra phiên đăng nhập hiện tại
        if (this.checkExistingSession()) {
            return; // Đã có phiên đăng nhập hợp lệ, đã chuyển hướng
        }
        
        // Thiết lập các sự kiện
        this.setupEventListeners();
        
        // Thêm nút debug khi chạy trên localhost
        this.addDebugButton();
        
        // Khởi tạo Google Sign-In
        this.initGoogleSignIn();
    },
    
    // Kiểm tra phiên đăng nhập hiện tại
    checkExistingSession: function() {
        try {
            // Kiểm tra nếu có phiên đăng nhập hợp lệ
            const sessionData = localStorage.getItem('kmr_auth_session');
            if (!sessionData) return false;
            
            const session = JSON.parse(sessionData);
            
            // Kiểm tra phiên còn hạn không
            if (new Date(session.expiryTime) < new Date()) {
                console.log('Phiên đăng nhập đã hết hạn');
                localStorage.removeItem('kmr_auth_session');
                sessionStorage.removeItem('kmr_auth_session');
                return false;
            }
            
            console.log('Đã có phiên đăng nhập hợp lệ, chuyển hướng đến webapp');
            window.location.href = `webapp.html?team=${session.teamId}&email=${encodeURIComponent(session.email)}`;
            return true;
        } catch (error) {
            console.error('Lỗi khi kiểm tra phiên đăng nhập:', error);
            return false;
        }
    },
    
    // Thêm nút debug khi chạy trên localhost
    addDebugButton: function() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            const container = document.querySelector('.auth-body') || document.body;
            const debugBtn = document.createElement('button');
            debugBtn.textContent = 'Debug Auth (Local Dev Only)';
            debugBtn.style.marginTop = '20px';
            debugBtn.style.padding = '8px 12px';
            debugBtn.style.background = '#f8f9fa';
            debugBtn.style.border = '1px solid #ddd';
            debugBtn.style.borderRadius = '4px';
            
            debugBtn.addEventListener('click', () => {
                console.log('Forced auth bypass for development');
                // Sử dụng email test để bypass xác thực
                const testEmail = 'debug@kamereo.vn';
                this.findUserTeamAndRedirect(testEmail);
            });
            
            container.appendChild(debugBtn);
        }
    },
    
    // Thiết lập sự kiện
    setupEventListeners: function() {
        // Nút quay lại
        const backButton = document.getElementById('backButton');
        if (backButton) {
            backButton.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }
    },
    
    // Khởi tạo Google Sign-In
    initGoogleSignIn: function() {
        // Kiểm tra nếu script Google đã được tải
        if (typeof google !== 'undefined' && google.accounts) {
            console.log('Google API đã tải, thiết lập Google Sign-In...');
            this.setupGoogleSignIn();
        } else {
            console.log('Google API chưa tải, đang thiết lập event handler...');
            // Nếu chưa tải, đợi script load xong
            window.onGoogleLibraryLoad = () => {
                console.log('Google API đã tải xong (từ callback)');
                this.setupGoogleSignIn();
            };
            
            // Thêm script Google Sign-In nếu chưa có
            if (!document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
                console.log('Đang thêm script Google Sign-In...');
                const script = document.createElement('script');
                script.src = "https://accounts.google.com/gsi/client";
                script.async = true;
                script.defer = true;
                script.onload = () => {
                    console.log('Script Google Sign-In đã tải xong');
                };
                script.onerror = (error) => {
                    console.error('Lỗi khi tải script Google Sign-In:', error);
                    this.showError('Không thể tải Google Sign-In. Vui lòng tải lại trang hoặc thử lại sau.');
                };
                document.head.appendChild(script);
            }
        }
    },
    
    // Thiết lập Google Sign-In
    setupGoogleSignIn: function() {
        try {
            console.log('Đang thiết lập Google Sign-In...');
            
            // Cấu hình với UX mode là popup để tránh lỗi redirect_uri_mismatch
            google.accounts.id.initialize({
                client_id: this.googleConfig.clientId,
                callback: this.handleCredentialResponse.bind(this),
                auto_select: this.googleConfig.autoSelect,
                cancel_on_tap_outside: true,
                ux_mode: 'popup',
                context: 'signin'
            });
            
            // Kiểm tra phần tử có tồn tại không
            const buttonContainer = document.getElementById('googleSignInButton');
            if (!buttonContainer) {
                console.error('Không tìm thấy phần tử có ID "googleSignInButton"');
                this.showError('Lỗi: Không tìm thấy container cho nút đăng nhập Google.');
                return;
            }
            
            // Render nút đăng nhập
            console.log('Render nút Google Sign-In...');
            google.accounts.id.renderButton(
                buttonContainer, 
                { 
                    type: 'standard',
                    theme: 'outline', 
                    size: 'large',
                    shape: 'rectangular',
                    text: 'signin_with',
                    logo_alignment: 'left'
                }
            );
            
            console.log('Google Sign-In đã được thiết lập thành công');
        } catch (error) {
            console.error('Lỗi khi thiết lập Google Sign-In:', error);
            this.showError(`Lỗi khi thiết lập Google Sign-In: ${error.message}`);
        }
    },
    
    // Xử lý phản hồi đăng nhập từ Google
    handleCredentialResponse: function(response) {
        console.log('Nhận được phản hồi từ Google');
        
        // Hiển thị đang xác thực
        const loadingMsg = document.getElementById('loading-message');
        const errorMsg = document.getElementById('error-message');
        
        if (loadingMsg) loadingMsg.style.display = 'block';
        if (errorMsg) errorMsg.style.display = 'none';
        
        try {
            // Giải mã JWT token để lấy thông tin người dùng
            const payload = this.parseJwt(response.credential);
            console.log("Google Auth Payload:", payload);
            
            // Lấy email từ payload
            const email = payload.email;
            console.log("Email người dùng:", email);
            console.log("Email verified:", payload.email_verified);
            
            // Kiểm tra email domain
            if (!email || !email.toLowerCase().endsWith('@kamereo.vn')) {
                console.error('Email không thuộc domain Kamereo:', email);
                this.showError('Chỉ tài khoản Kamereo (@kamereo.vn) mới được phép truy cập');
                return;
            }
            
            // Lưu thông tin người dùng
            const userInfo = {
                email: email,
                name: payload.name,
                picture: payload.picture,
                timestamp: new Date().getTime()
            };
            
            localStorage.setItem('kmr_user_info', JSON.stringify(userInfo));
            console.log('Đã lưu thông tin người dùng vào localStorage');
            
            // Tìm team của người dùng và chuyển hướng
            this.findUserTeamAndRedirect(email);
        } catch (error) {
            console.error('Lỗi khi xử lý phản hồi đăng nhập từ Google:', error);
            this.showError(`Lỗi xác thực: ${error.message}`);
        }
    },
    
    // Giải mã JWT token
    parseJwt: function(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Lỗi khi giải mã JWT:', error);
            throw new Error('Không thể giải mã token đăng nhập: ' + error.message);
        }
    },
    
    // Tìm team của người dùng và chuyển hướng tới webapp
    findUserTeamAndRedirect: function(email) {
        console.log('Tìm team của người dùng với email:', email);
        
        // Hiển thị đang xác thực
        const loadingMsg = document.getElementById('loading-message');
        if (loadingMsg) loadingMsg.style.display = 'block';
        
        try {
            // Kiểm tra xem email có phải admin không
            const isAdmin = CONFIG.ADMINS.includes(email);
            console.log('Là admin?', isAdmin);
            
            // Sử dụng hàm mới để lấy teams từ sheet
            API.getUserAccessibleTeamsFromSheet(email)
                .then(result => {
                    const userTeams = result.teams;
                    console.log('Người dùng có quyền truy cập', userTeams.length, 'team(s)');
                    
                    // Xử lý dựa trên kết quả tìm kiếm
                    if (userTeams.length === 0) {
                        console.error('Email không thuộc bất kỳ team nào');
                        this.showError('Bạn không thuộc team Sales nên không có quyền truy cập. Vui lòng liên hệ Admin.');
                        return;
                    }
                    
                    // Nếu người dùng thuộc nhiều team, hiển thị giao diện chọn team
                    if (userTeams.length > 1) {
                        console.log('Người dùng thuộc nhiều team, hiển thị trang chọn team');
                        this.showTeamSelectionUI(email, userTeams, isAdmin);
                        return;
                    }
                    
                    // Nếu người dùng thuộc 1 team - chọn team đó
                    const selectedTeam = userTeams[0];
                    console.log('Chọn team:', selectedTeam.name);
                    
                    // Tạo phiên và chuyển hướng
                    this.createSession(selectedTeam.id, email, userTeams, isAdmin);
                    window.location.href = `webapp.html?team=${selectedTeam.id}&email=${encodeURIComponent(email)}`;
                })
                .catch(error => {
                    console.error('Lỗi khi lấy teams từ Sheet:', error);
                    
                    // Fallback: Sử dụng phương thức cũ để tìm teams
                    console.log('Fallback: Sử dụng phương thức truyền thống');
                    
                    // Tìm các team mà người dùng có quyền truy cập
                    const userTeams = [];
                    
                    // Duyệt qua tất cả các khu vực và team
                    for (const regionId in CONFIG.REGIONS) {
                        const region = CONFIG.REGIONS[regionId];
                        
                        for (const team of region.teams) {
                            // Loại bỏ email trùng lặp trong danh sách
                            if (team.emails) {
                                team.emails = [...new Set(team.emails)];
                            }
                            
                            // Kiểm tra xem email có trong danh sách team không
                            if (isAdmin || (team.emails && team.emails.includes(email))) {
                                userTeams.push({
                                    id: team.id,
                                    name: team.name,
                                    icon: team.icon || '👥',
                                    description: team.description || '',
                                    region: regionId,
                                    regionName: region.name || (regionId === 'hanoi' ? 'Miền Bắc' : 'Miền Nam'),
                                    sheet_id: team.sheet_id,
                                    sheet_name: team.sheet_name || 'Sheet1'
                                });
                            }
                        }
                    }
                    
                    console.log('Người dùng có quyền truy cập', userTeams.length, 'team(s)');
                    
                    // Xử lý dựa trên kết quả tìm kiếm
                    if (userTeams.length === 0) {
                        console.error('Email không thuộc bất kỳ team nào');
                        this.showError('Bạn không thuộc team Sales nên không có quyền truy cập. Vui lòng liên hệ Admin.');
                        return;
                    }
                    
                    // Nếu người dùng thuộc nhiều team, hiển thị giao diện chọn team 
                    if (userTeams.length > 1) {
                        console.log('Người dùng thuộc nhiều team, hiển thị trang chọn team');
                        this.showTeamSelectionUI(email, userTeams, isAdmin);
                        return;
                    }
                    
                    // Nếu người dùng thuộc 1 team - chọn team đó
                    const selectedTeam = userTeams[0];
                    console.log('Chọn team:', selectedTeam.name);
                    
                    // Tạo phiên và chuyển hướng
                    this.createSession(selectedTeam.id, email, userTeams, isAdmin);
                    window.location.href = `webapp.html?team=${selectedTeam.id}&email=${encodeURIComponent(email)}`;
                });
        } catch (error) {
            console.error('Lỗi khi tìm team của người dùng:', error);
            this.showError('Lỗi: ' + error.message);
        }
    },
    
    // Hiển thị giao diện chọn team (chung cho cả admin và người dùng thường)
    showTeamSelectionUI: function(email, userTeams, isAdmin) {
        // Ẩn loading
        const loadingMsg = document.getElementById('loading-message');
        if (loadingMsg) loadingMsg.style.display = 'none';
        
        // Tạo và hiển thị giao diện chọn team
        const authContainer = document.querySelector('.auth-container');
        if (!authContainer) return;
        
        // Lưu nội dung gốc để có thể khôi phục nếu cần
        const originalContent = authContainer.innerHTML;
        
        // Nhóm team theo khu vực
        const regionGroups = {};
        
        // Lấy tất cả các team hiện có trong hệ thống
        const allTeams = [];
        
        for (const regionId in CONFIG.REGIONS) {
            const region = CONFIG.REGIONS[regionId];
            const regionName = region.name || (regionId === 'hanoi' ? 'Miền Bắc' : 'Miền Nam');
            
            if (!regionGroups[regionName]) {
                regionGroups[regionName] = [];
            }
            
            // Duyệt qua tất cả các team trong khu vực
            region.teams.forEach(team => {
                // Kiểm tra xem người dùng có quyền truy cập vào team này không
                const hasAccess = isAdmin || userTeams.some(ut => ut.id === team.id);
                
                // Thêm team vào danh sách với trạng thái quyền truy cập
                regionGroups[regionName].push({
                    id: team.id,
                    name: team.name,
                    icon: team.icon || '👥',
                    description: team.description || '',
                    region: regionId,
                    regionName: regionName,
                    hasAccess: hasAccess
                });
                
                allTeams.push(team.id);
            });
        }
        
        // Tạo HTML cho tiêu đề
        let contentHTML = `
            <div class="auth-header">
                <img src="images/Logo.png" alt="Logo">
                <h1>[BOS] KMR Special Price Record</h1>
            </div>
            
            <div class="auth-body admin-team-selection">
                <div class="admin-welcome">
                    ${isAdmin ? '<div class="admin-badge">ADMIN</div>' : ''}
                    <h2>Chào mừng, ${email}</h2>
                    <p>Vui lòng chọn team bạn muốn truy cập:</p>
                </div>
                
                <div class="admin-team-container">
        `;
        
        // Tạo HTML cho các khu vực và team
        for (const regionName in regionGroups) {
            contentHTML += `
                <div class="admin-region">
                    <div class="admin-region-header">
                        <h3>${regionName}</h3>
                    </div>
                    <div class="admin-team-grid">
            `;
            
            // Thêm các team trong khu vực
            regionGroups[regionName].forEach(team => {
                // Thêm các class và thuộc tính dựa vào quyền truy cập
                const accessClass = team.hasAccess ? '' : 'no-access';
                const accessTitle = team.hasAccess ? 
                    `Nhấp để truy cập ${team.name}` : 
                    'Bạn không có quyền truy cập team này';
                
                contentHTML += `
                    <div class="admin-team-card ${accessClass}" data-team-id="${team.id}" title="${accessTitle}">
                        <div class="admin-team-icon">${team.icon || '👥'}</div>
                        <div class="admin-team-details">
                            <h4>${team.name}</h4>
                            <p>${team.description || ''}</p>
                        </div>
                        ${!team.hasAccess ? '<div class="no-access-icon"><i class="fas fa-ban"></i></div>' : ''}
                    </div>
                `;
            });
            
            contentHTML += `
                    </div>
                </div>
            `;
        }
        
        // Đóng các thẻ HTML và thêm nút quay lại
        contentHTML += `
                </div>
                
                <button class="btn btn-back" id="backToLoginButton">Quay lại đăng nhập</button>
            </div>
        `;
        
        // Thay đổi nội dung container
        authContainer.innerHTML = contentHTML;
        authContainer.className = 'auth-container admin-container';
        
        // Thêm style cho giao diện team selection
        const style = document.createElement('style');
        style.textContent = `
            .auth-container.admin-container {
                max-width: 900px;
                width: 90%;
            }
            
            .admin-team-selection {
                text-align: left;
            }
            
            .admin-welcome {
                text-align: center;
                margin-bottom: 30px;
                position: relative;
                padding-bottom: 20px;
                border-bottom: 1px solid #e2e8f0;
            }
            
            .admin-badge {
                background-color: #3b82f6;
                color: white;
                font-weight: 600;
                padding: 5px 15px;
                border-radius: 20px;
                display: inline-block;
                margin-bottom: 10px;
                font-size: 12px;
                letter-spacing: 1px;
            }
            
            .admin-welcome h2 {
                color: #333;
                margin: 0 0 10px;
                font-size: 1.6rem;
            }
            
            .admin-welcome p {
                color: #666;
                font-size: 1rem;
                margin: 0;
            }
            
            .admin-team-container {
                max-height: 60vh;
                overflow-y: auto;
                padding-right: 10px;
            }
            
            .admin-region {
                margin-bottom: 25px;
            }
            
            .admin-region-header {
                border-bottom: 2px solid #e2e8f0;
                margin-bottom: 15px;
                padding-bottom: 5px;
            }
            
            .admin-region-header h3 {
                color: #3b82f6;
                font-size: 1.2rem;
                margin: 0;
            }
            
            .admin-team-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 15px;
            }
            
            .admin-team-card {
                background-color: #f7fafc;
                border-radius: 10px;
                border: 1px solid #e2e8f0;
                padding: 15px;
                display: flex;
                align-items: center;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .admin-team-card:hover {
                transform: translateY(-3px);
                box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08);
                background-color: white;
                border-color: #3b82f6;
            }
            
            .admin-team-card.no-access {
                opacity: 0.6;
                background-color: #f0f0f0;
                cursor: not-allowed;
                border-color: #ddd;
            }
            
            .admin-team-card.no-access:hover {
                transform: none;
                box-shadow: none;
                background-color: #f0f0f0;
                border-color: #ddd;
            }
            
            .no-access-icon {
                position: absolute;
                top: 10px;
                right: 10px;
                color: #e53e3e;
                font-size: 1.2rem;
            }
            
            .admin-team-icon {
                font-size: 30px;
                margin-right: 15px;
                min-width: 40px;
                text-align: center;
            }
            
            .admin-team-details {
                flex: 1;
            }
            
            .admin-team-details h4 {
                margin: 0 0 5px;
                font-size: 1rem;
                color: #2d3748;
            }
            
            .admin-team-details p {
                margin: 0;
                font-size: 0.8rem;
                color: #718096;
                line-height: 1.3;
            }
            
            #backToLoginButton {
                margin-top: 20px;
            }
            
            @media (max-width: 768px) {
                .admin-team-grid {
                    grid-template-columns: 1fr;
                }
                
                .auth-container.admin-container {
                    padding: 20px;
                }
            }
        `;
        
        document.head.appendChild(style);
        
        // Thêm FontAwesome nếu chưa có
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const fontAwesome = document.createElement('link');
            fontAwesome.rel = 'stylesheet';
            fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(fontAwesome);
        }
        
        // Thêm sự kiện cho các team card
        const teamCards = document.querySelectorAll('.admin-team-card:not(.no-access)');
        teamCards.forEach(card => {
            card.addEventListener('click', () => {
                const teamId = card.getAttribute('data-team-id');
                
                // Tìm thông tin team được chọn
                const selectedTeam = userTeams.find(team => team.id === teamId);
                
                if (selectedTeam) {
                    // Hiển thị loading
                    authContainer.innerHTML = `
                        <div class="auth-header">
                            <img src="images/Logo.png" alt="Logo">
                            <h1>[BOS] KMR Special Price Record</h1>
                        </div>
                        
                        <div class="auth-body">
                            <div class="loading-message" style="display: block;">
                                <div class="loading-spinner"></div>
                                <p>Đang chuyển hướng đến ${selectedTeam.name}...</p>
                            </div>
                        </div>
                    `;
                    
                    // Tạo phiên và chuyển hướng
                    setTimeout(() => {
                        // Lưu phiên đăng nhập
                        this.createSession(teamId, email, userTeams, isAdmin);
                        window.location.href = `webapp.html?team=${teamId}&email=${encodeURIComponent(email)}`;
                    }, 800); // Delay nhỏ để hiển thị loading
                }
            });
        });
        
        // Thêm sự kiện cho nút quay lại
        const backButton = document.getElementById('backToLoginButton');
        if (backButton) {
            backButton.addEventListener('click', () => {
                // Khôi phục nội dung gốc
                authContainer.innerHTML = originalContent;
                authContainer.className = 'auth-container';
                
                // Thiết lập lại Google Sign-In
                this.setupGoogleSignIn();
                
                // Thiết lập lại sự kiện quay lại
                this.setupEventListeners();
                
                // Xóa style đã thêm
                if (style && style.parentNode) {
                    style.parentNode.removeChild(style);
                }
            });
        }
    },
    
    // Tạo phiên làm việc
    createSession: function(teamId, email, userTeams, isAdmin) {
        console.log('Tạo phiên làm việc cho team:', teamId, 'và email:', email);
        
        // Tạo thông tin phiên
        const session = {
            teamId: teamId,
            email: email,
            userTeams: userTeams || [],
            isAdmin: isAdmin,
            createdAt: new Date().getTime(),
            expiryTime: new Date(Date.now() + CONFIG.SESSION_DURATION * 60 * 60 * 1000).getTime()
        };
        
        // Lưu phiên vào localStorage
        localStorage.setItem('kmr_auth_session', JSON.stringify(session));
        
        // Lưu thêm vào sessionStorage để quản lý phiên
        sessionStorage.setItem('kmr_auth_session', JSON.stringify(session));
        
        console.log('Đã lưu phiên đăng nhập');
    },
    
    // Hiển thị lỗi
    showError: function(message) {
        console.error('Hiển thị lỗi:', message);
        
        // Ẩn loading
        const loadingElement = document.getElementById('loading-message');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
        // Hiển thị lỗi
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        } else {
            console.error('Không tìm thấy phần tử có ID "error-message"');
            alert('Lỗi: ' + message);
        }
    }
};

// Khởi tạo khi trang đã tải xong
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM đã tải xong, khởi tạo AuthManager...');
    AuthManager.init();
});