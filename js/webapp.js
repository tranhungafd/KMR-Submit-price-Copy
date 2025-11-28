// Hàm trợ giúp để xử lý và chuẩn hóa giá
function parsePrice(priceStr) {
  if (!priceStr) return 0;
  
  let cleaned = priceStr.toString().replace(/[^\d.,]/g, '');

  // Phân tích dấu phân cách
  // Case 1: 160,000.00 -> 160000
  // Case 2: 160.000,00 -> 160000
  // Case 3: 160,000 -> 160000
  // Case 4: 160000 -> 160000
  
  // Kiểm tra nếu có cả dấu chấm và dấu phẩy
  if (cleaned.includes('.') && cleaned.includes(',')) {
    // Kiểm tra vị trí của chúng để xác định định dạng
    const dotIndex = cleaned.lastIndexOf('.');
    const commaIndex = cleaned.lastIndexOf(',');
    
    if (dotIndex > commaIndex) {
      // Định dạng US: 1,000.00
      cleaned = cleaned.replace(/,/g, '');
      // Chỉ giữ 2 số sau dấu chấm
      const parts = cleaned.split('.');
      cleaned = parts[0] + (parts.length > 1 ? '' : '');
    } else {
      // Định dạng EU: 1.000,00
      cleaned = cleaned.replace(/\./g, '');
      // Loại bỏ dấu phẩy thập phân
      const parts = cleaned.split(',');
      cleaned = parts[0] + (parts.length > 1 ? '' : '');
    }
  } else if (cleaned.includes(',')) {
    // Chỉ có dấu phẩy
    if (cleaned.length - cleaned.lastIndexOf(',') <= 3) {
      // Có vẻ là dấu phẩy thập phân, loại bỏ nó
      const parts = cleaned.split(',');
      cleaned = parts[0] + (parts.length > 1 ? '' : '');
    } else {
      // Dấu phẩy ngăn cách hàng nghìn
      cleaned = cleaned.replace(/,/g, '');
    }
  } else if (cleaned.includes('.')) {
    // Chỉ có dấu chấm
    if (cleaned.length - cleaned.lastIndexOf('.') <= 3) {
      // Có vẻ là dấu chấm thập phân, loại bỏ nó
      const parts = cleaned.split('.');
      cleaned = parts[0] + (parts.length > 1 ? '' : '');
    } else {
      // Dấu chấm ngăn cách hàng nghìn
      cleaned = cleaned.replace(/\./g, '');
    }
  }
  
  // Chuyển về số
  const numValue = parseInt(cleaned, 10);
  return isNaN(numValue) ? 0 : numValue;
}
// Hàm kiểm tra giá có phải bội số của 100 không
function isPriceMultipleOf500(price) {
  return price % 100 === 0;
}

// Hàm hiển thị loading overlay
function createLoadingOverlay() {
  // Kiểm tra nếu đã có overlay
  if (document.getElementById('loading-overlay')) return;
  
  const overlay = document.createElement('div');
  overlay.id = 'loading-overlay';
  overlay.className = 'loading-overlay';
  overlay.style.display = 'none';
  
  overlay.innerHTML = `
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <div class="loading-text">Đang tải...</div>
      <div class="loading-progress-container">
        <div class="loading-progress-bar"></div>
      </div>
      <div class="loading-percentage">0%</div>
    </div>
  `;
  
  document.body.appendChild(overlay);
}

// Hiển thị loading 
function showLoading(message, initialProgress = 0) {
  const overlay = document.getElementById('loading-overlay');
  if (!overlay) return;
  
  const textElement = overlay.querySelector('.loading-text');
  const progressBar = overlay.querySelector('.loading-progress-bar');
  const percentageText = overlay.querySelector('.loading-percentage');
  
  if (textElement) textElement.textContent = message || 'Đang tải...';
  if (progressBar) progressBar.style.width = initialProgress + '%';
  if (percentageText) percentageText.textContent = initialProgress + '%';
  
  overlay.style.display = 'flex';
}

// Cập nhật tiến trình loading
function updateLoadingProgress(progress, message) {
  const overlay = document.getElementById('loading-overlay');
  if (!overlay) return;
  
  const textElement = overlay.querySelector('.loading-text');
  const progressBar = overlay.querySelector('.loading-progress-bar');
  const percentageText = overlay.querySelector('.loading-percentage');
  
  if (message && textElement) textElement.textContent = message;
  if (progressBar) progressBar.style.width = progress + '%';
  if (percentageText) percentageText.textContent = progress + '%';
}

// Ẩn loading
function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (!overlay) return;
  
  overlay.style.opacity = '0';
  setTimeout(() => {
    overlay.style.display = 'none';
    overlay.style.opacity = '1';
  }, 300);
}

// Hiển thị xác nhận giá cao - fixed version
function showHighPriceConfirmation(message, onConfirm) {
  // Use the existing dialog element instead of creating a new one
  const confirmDialog = document.getElementById('confirm-dialog');
  if (!confirmDialog) {
    console.error('Confirm dialog element not found');
    return;
  }
  
  // Set the message
  const messageElement = confirmDialog.querySelector('.confirm-message');
  if (messageElement) {
    messageElement.innerHTML = message;
  }
  
  // Show the dialog
  confirmDialog.style.display = 'flex';
  
  // Add fade-in effect
  setTimeout(() => {
    confirmDialog.classList.add('show');
  }, 10);
  
  // Get buttons from the existing dialog
  const confirmBtn = confirmDialog.querySelector('#confirm-btn');
  const cancelBtn = confirmDialog.querySelector('#cancel-btn');
  
  // Remove any existing event listeners
  const newConfirmBtn = confirmBtn.cloneNode(true);
  const newCancelBtn = cancelBtn.cloneNode(true);
  
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
  cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
  
  // Add new event listeners
  newConfirmBtn.addEventListener('click', function() {
    confirmDialog.classList.remove('show');
    confirmDialog.style.display = 'none';
    if (typeof onConfirm === 'function') {
      onConfirm();
    }
  });
  
  newCancelBtn.addEventListener('click', function() {
    confirmDialog.classList.remove('show');
    confirmDialog.style.display = 'none';
  });
}

// Make the function globally available
window.showHighPriceConfirmation = showHighPriceConfirmation;

function showSuccessMessage(title, message, buttons) {
  const successDialog = document.createElement('div');
  successDialog.className = 'success-dialog';
  
  let buttonsHtml = '';
  if (buttons && buttons.length > 0) {
    buttonsHtml = '<div class="success-buttons">';
    buttons.forEach(button => {
      buttonsHtml += `
        <button id="${button.id}" 
                class="btn ${button.primary ? 'btn-primary' : 'btn-secondary'}"
                data-keep-open="${button.keepOpen || false}">
          ${button.icon ? `<i class="${button.icon}"></i>` : ''} ${button.text}
        </button>
      `;
    });
    buttonsHtml += '</div>';
  }
  
  successDialog.innerHTML = `
    <div class="success-content">
      <button class="success-close-btn" title="Đóng">&times;</button>
      <div class="success-icon">
        <i class="fas fa-check-circle"></i>
      </div>
      <h3>${title}</h3>
      <div class="success-message">${message}</div>
      ${buttonsHtml}
    </div>
  `;
  
  document.body.appendChild(successDialog);
  
  // Hiệu ứng fade in
  setTimeout(() => {
    successDialog.classList.add('show');
  }, 10);
  
  // Thêm sự kiện cho nút đóng
  const closeBtn = successDialog.querySelector('.success-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      successDialog.classList.remove('show');
      setTimeout(() => {
        if (document.body.contains(successDialog)) {
          document.body.removeChild(successDialog);
        }
      }, 300);
    });
  }
  
  // Thêm sự kiện cho các nút
  if (buttons && buttons.length > 0) {
    buttons.forEach(button => {
      const buttonElement = document.getElementById(button.id);
      if (buttonElement && typeof button.onClick === 'function') {
        buttonElement.addEventListener('click', () => {
          // Gọi hàm onClick
          button.onClick();
          
          // Chỉ đóng dialog nếu nút không có thuộc tính keepOpen
          if (!button.keepOpen) {
            successDialog.classList.remove('show');
            setTimeout(() => {
              if (document.body.contains(successDialog)) {
                document.body.removeChild(successDialog);
              }
            }, 300);
          }
        });
      }
    });
  }
}

// Hiển thị xác nhận gửi email - ĐỊNH NGHĨA ĐÚNG VỊ TRÍ
function showEmailConfirmation(message, onConfirm, onCancel) {
  // Tạo div cho dialog
  const confirmDialog = document.createElement('div');
  confirmDialog.className = 'confirm-dialog email-confirm-dialog';
  confirmDialog.style.display = 'flex';
  
  confirmDialog.innerHTML = `
    <div class="confirm-content">
      <h3>Xác nhận gửi email</h3>
      <div class="confirm-message">${message}</div>
      <div class="confirm-buttons">
        <button class="btn btn-secondary" id="email-cancel-btn">Hủy</button>
        <button class="btn btn-primary" id="email-confirm-btn">Gửi Email</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(confirmDialog);
  
  // Hiệu ứng fade in
  setTimeout(() => {
    confirmDialog.classList.add('show');
  }, 10);
  
  // Xử lý sự kiện cho các nút
  const confirmBtn = confirmDialog.querySelector('#email-confirm-btn');
  const cancelBtn = confirmDialog.querySelector('#email-cancel-btn');
  
  confirmBtn.addEventListener('click', function() {
    confirmDialog.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(confirmDialog);
      if (typeof onConfirm === 'function') {
        onConfirm();
      }
    }, 300);
  });
  
  cancelBtn.addEventListener('click', function() {
    confirmDialog.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(confirmDialog);
      if (typeof onCancel === 'function') {
        onCancel();
      }
    }, 300);
  });
}

// Quản lý ứng dụng web
const WebAppManager = {
  // Biến lưu trữ dữ liệu
  data: {
    teamId: null,
    teamInfo: null,
    userEmail: null,
    userName: null,
    userPicture: null,
    sheetInfo: null,  // Thông tin về sheet
    requestNo: null,  // Request No để tham chiếu
    highPriceConfirmed: false, // Đã xác nhận giá cao chưa
    slackNotificationSent: false, // THÊM: Flag để theo dõi Slack notification
    // Dữ liệu form nhập
    form: {
      priceType: '',
      startDate: '',
      endDate: '',
      buyers: [],
      products: [],
      vatType: 'before' // MẶC ĐỊNH LÀ 'before'
    },
    // Dữ liệu preview
    preview: null,
    // Lưu trữ các SKU có lỗi
    errorSkus: {
      duplicate: [],
      lowPrice: [],
      noPrice: [],
      nonNumericPrice: [],
      highPrice: [],
      veryHighPrice: []
    }
  },
  
  // Khởi tạo
  init: function() {
    console.log('Khởi tạo WebAppManager');
    
    // Tạo overlay loading ngay từ đầu
    createLoadingOverlay();
    
    // Kiểm tra phiên đăng nhập trước
    if (!this.validateSession()) {
      return; // Đã chuyển hướng sang trang đăng nhập
    }
    
    // Lấy thông tin từ URL (trong trường hợp chưa có phiên)
    if (!this.data.teamId || !this.data.userEmail) {
      const urlParams = new URLSearchParams(window.location.search);
      this.data.teamId = urlParams.get('team');
      this.data.userEmail = urlParams.get('email');
      
      if (!this.data.teamId || !this.data.userEmail) {
        console.error('Thiếu thông tin team hoặc user');
        this.redirectToHomePage();
        return;
      }
    }
    
    // Hiển thị loading khi khởi tạo
    showLoading('Đang tải dữ liệu...', 10);
    
    // Tải thông tin Google Sheet
    this.loadSheetInfo()
      .then(() => {
        updateLoadingProgress(50, 'Đang tải thông tin người dùng...');
        
        // Hiển thị thông tin người dùng
        this.displayUserInfo();
        
        // Thiết lập giá trị mặc định
        this.setDefaultValues();
        
        // Thiết lập sự kiện
        this.setupEventListeners();
      
        // Tạo iframe ẩn để xử lý việc gửi form
        this.createHiddenIframe();
        
        // Khởi động giám sát kết nối mạng
        this.monitorNetworkStatus();
        
        // Ẩn loading
        updateLoadingProgress(100, 'Hoàn thành!');
        setTimeout(() => {
          hideLoading();
        }, 300);
      })
      .catch(error => {
        console.error('Lỗi khi khởi tạo:', error);
        hideLoading();
        this.showResultMessage('Lỗi khi tải dữ liệu: ' + error.message, 'error');
      });
  },
  
  // Xác thực phiên đăng nhập
  validateSession: function() {
    // Lấy thông tin phiên từ localStorage
    const sessionData = localStorage.getItem('kmr_auth_session');
    
    if (!sessionData) {
      console.log('Không tìm thấy dữ liệu phiên đăng nhập');
      this.redirectToAuth();
      return false;
    }
    
    try {
      const session = JSON.parse(sessionData);
      
      // Kiểm tra phiên hết hạn
      if (new Date(session.expiryTime) < new Date()) {
        console.log('Phiên đăng nhập đã hết hạn');
        localStorage.removeItem('kmr_auth_session');
        sessionStorage.removeItem('kmr_auth_session');
        this.redirectToAuth();
        return false;
      }
      
      // Kiểm tra nếu người dùng có quyền truy cập vào team hiện tại
      const currentTeamId = this.data.teamId || new URLSearchParams(window.location.search).get('team');
      const hasAccess = session.isAdmin || session.userTeams.some(team => team.id === currentTeamId);
      
      if (!hasAccess) {
        console.log('Người dùng không có quyền truy cập vào team này');
        this.redirectToAuth();
        return false;
      }
      
      // Cập nhật thông tin từ phiên
      this.data.teamId = currentTeamId;
      this.data.userEmail = session.email;
      this.data.isAdmin = session.isAdmin;
      this.data.userTeams = session.userTeams;
      this.data.teamInfo = session.teamInfo || session.userTeams.find(team => team.id === currentTeamId);
      
      // Kiểm tra nếu có thông tin bổ sung
      const userInfoStr = localStorage.getItem('kmr_user_info');
      if (userInfoStr) {
        try {
          const userInfo = JSON.parse(userInfoStr);
          this.data.userName = userInfo.name;
          this.data.userPicture = userInfo.picture;
        } catch (e) {
          console.error('Lỗi khi đọc thông tin người dùng:', e);
        }
      }
      
      return true;
    } catch (e) {
      console.error('Lỗi khi xác thực phiên đăng nhập:', e);
      localStorage.removeItem('kmr_auth_session');
      sessionStorage.removeItem('kmr_auth_session');
      this.redirectToAuth();
      return false;
    }
  },
  
  // Kiểm tra phiên đơn giản, chỉ xác minh là phiên còn hạn
  validateSessionSimple: function() {
    const sessionData = localStorage.getItem('kmr_auth_session');
    if (!sessionData) return false;
    
    try {
      const session = JSON.parse(sessionData);
      // Kiểm tra phiên hết hạn
      if (new Date(session.expiryTime) < new Date()) return false;
      // Kiểm tra quyền truy cập vào team hiện tại
      return session.isAdmin || session.userTeams.some(team => team.id === this.data.teamId);
    } catch (e) {
      return false;
    }
  },
  
  // Chuyển hướng đến trang đăng nhập
  redirectToAuth: function() {
    window.location.href = 'auth.html';
  },
  
  // Chuyển hướng về trang chủ
  redirectToHomePage: function() {
    // Xác minh xem người dùng có muốn rời khỏi trang không
    if (this.data.preview) {
      const confirmed = confirm('Bạn có dữ liệu chưa lưu. Bạn có chắc muốn quay lại trang chủ không?');
      if (!confirmed) {
        return;
      }
    }
    
    window.location.href = 'index.html';
  },
  
  // Giám sát trạng thái kết nối mạng
  monitorNetworkStatus: function() {
    window.addEventListener('online', () => {
      this.showResultMessage('Kết nối mạng đã được khôi phục', 'success');
    });
    
    window.addEventListener('offline', () => {
      this.showResultMessage('Mất kết nối mạng. Dữ liệu có thể không được lưu.', 'warning');
    });
  },
  
  // Hiển thị thông tin người dùng
  displayUserInfo: function() {
    // Hiển thị tên team
    const teamNameDisplay = document.getElementById('team-name-display');
    if (teamNameDisplay && this.data.teamInfo) {
      teamNameDisplay.textContent = this.data.teamInfo.name;
    }
    
    // Hiển thị thông tin người dùng
    const userInfoContainer = document.getElementById('user-info');
    if (userInfoContainer) {
      let userDisplayName = this.data.userName || this.data.userEmail.split('@')[0];
      
      if (this.data.userPicture) {
        userInfoContainer.innerHTML = `
          <img class="user-avatar" src="${this.data.userPicture}" alt="Avatar">
          <span class="user-email">${userDisplayName}</span>
        `;
      } else {
        // Tạo avatar từ chữ cái đầu của tên
        const initial = userDisplayName.charAt(0).toUpperCase();
        userInfoContainer.innerHTML = `
          <div class="user-avatar-placeholder">${initial}</div>
          <span class="user-email">${userDisplayName}</span>
        `;
      }
      
      // Thêm tooltip nếu có tên hiển thị khác email
      if (this.data.userName && this.data.userName !== this.data.userEmail) {
        userInfoContainer.title = this.data.userEmail;
      }
    }
    
    // Thêm team switcher nếu user có quyền truy cập nhiều team
    this.addTeamSwitcher();
    
    // Thêm liên kết Admin Tools nếu user là admin
    this.addAdminToolsLink();
  },
  
  // Thêm liên kết Admin Tools nếu user là admin
  addAdminToolsLink: function() {
    if (this.data.isAdmin) {
      const userActions = document.querySelector('.user-actions');
      if (userActions) {
        const adminLink = document.createElement('button');
        adminLink.className = 'btn-icon btn-admin';
        adminLink.title = 'Admin Tools';
        adminLink.innerHTML = '<i class="fas fa-tools"></i>';
        
        adminLink.addEventListener('click', () => {
          window.location.href = 'admin-tools.html';
        });
        
        userActions.insertBefore(adminLink, userActions.firstChild);
      }
    }
  },
  
  // Thêm team switcher
  addTeamSwitcher: function() {
    // Lấy dữ liệu phiên
    const userTeams = this.data.userTeams || [];
    
    // Chỉ hiển thị team switcher nếu có nhiều hơn 1 team
    if (userTeams.length <= 1) return;
    
    // Tạo team switcher
    const teamSwitcherContainer = document.getElementById('team-switcher-container');
    if (!teamSwitcherContainer) return;
    
    const teamSwitcher = document.createElement('div');
    teamSwitcher.className = 'team-switcher';
    
    let switcherHtml = `
      <button class="team-switcher-btn">Chuyển đổi team <span class="dropdown-icon">▼</span></button>
      <div class="team-dropdown">
    `;
    
    // Nhóm teams theo region
    const regionGroups = {};
    
    userTeams.forEach(team => {
      const regionName = team.regionName || 'Khác';
      if (!regionGroups[regionName]) {
        regionGroups[regionName] = [];
      }
      regionGroups[regionName].push(team);
    });
    
    // Tạo danh sách teams
    for (const regionName in regionGroups) {
      switcherHtml += `<div class="region-name">${regionName}</div>`;
      
      regionGroups[regionName].forEach(team => {
        const isActive = team.id === this.data.teamId;
        switcherHtml += `
          <a href="webapp.html?team=${team.id}&email=${encodeURIComponent(this.data.userEmail)}" 
             class="team-option ${isActive ? 'active' : ''}">
              ${team.name}
          </a>
        `;
      });
    }
    
    switcherHtml += `</div>`;
    teamSwitcher.innerHTML = switcherHtml;
    
    // Thêm vào container
    teamSwitcherContainer.appendChild(teamSwitcher);
    
    // Xử lý sự kiện hiển thị/ẩn dropdown
    const switcherBtn = teamSwitcher.querySelector('.team-switcher-btn');
    const dropdown = teamSwitcher.querySelector('.team-dropdown');
    
    if (switcherBtn && dropdown) {
      switcherBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
      });
      
      // Đóng dropdown khi click ra ngoài
      document.addEventListener('click', (event) => {
        if (!teamSwitcher.contains(event.target)) {
          dropdown.classList.remove('show');
        }
      });
    }
  },
 
  // Tạo iframe ẩn để xử lý form
  createHiddenIframe: function() {
    // Tạo iframe nếu chưa có
    if (!document.getElementById('hidden_iframe')) {
      const iframe = document.createElement('iframe');
      iframe.setAttribute('name', 'hidden_iframe');
      iframe.setAttribute('id', 'hidden_iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      // Xử lý sự kiện load của iframe
      iframe.addEventListener('load', () => {
        const iframeUrl = iframe.contentWindow.location.href;
        // Chỉ xử lý khi iframe đã load một URL thực sự, không phải about:blank
        if (iframeUrl && iframeUrl !== 'about:blank') {
          try {
            // Thử lấy nội dung từ iframe
            const iframeContent = iframe.contentDocument || iframe.contentWindow.document;
            const responseText = iframeContent.body.innerText;
            
            if (responseText) {
              console.log("Raw response from iframe:", responseText);
              try {
                const result = JSON.parse(responseText);
                this.handleSubmitResponse(result);
              } catch (e) {
                console.error("Không thể parse JSON từ response:", e);
                // Giả định thành công nếu không parse được
                this.handleSubmitResponse({
                  success: true,
                  message: "Dữ liệu đã được gửi thành công (không thể xác nhận kết quả chính xác)"
                });
              }
            } else {
              // Nếu không đọc được nội dung do CORS
              console.log("Không thể đọc nội dung iframe do CORS, giả định thành công");
              this.handleSubmitResponse({
                success: true,
                message: "Dữ liệu đã được gửi thành công (không thể xác nhận kết quả do CORS)"
              });
            }
          } catch (error) {
            console.error("Lỗi khi đọc kết quả từ iframe:", error);
            // Giả định thành công
            this.handleSubmitResponse({
              success: true,
              message: "Dữ liệu đã được gửi thành công (không thể xác nhận kết quả do CORS)"
            });
          }
        }
      });
    }
  },
  
  // Tải thông tin Google Sheet
  loadSheetInfo: function() {
    return new Promise((resolve, reject) => {
      try {
        // Nếu đã có thông tin sheet trong teamInfo từ session, sử dụng nó
        if (this.data.teamInfo && this.data.teamInfo.sheet_id) {
          this.data.sheetInfo = {
            sheet_id: this.data.teamInfo.sheet_id,
            sheet_name: this.data.teamInfo.sheet_name || 'Sheet1',
            sheet_url: `https://docs.google.com/spreadsheets/d/${this.data.teamInfo.sheet_id}/edit#gid=0`
          };
          
          // Cập nhật URL sheet trong giao diện
          this.updateSheetLinks();
          resolve();
          return;
        }
        
        // Lấy thông tin phiên từ localStorage
        const sessionData = localStorage.getItem('kmr_auth_session');
        if (sessionData) {
          try {
            const session = JSON.parse(sessionData);
            const teamInfo = session.userTeams.find(team => team.id === this.data.teamId);
            
            if (teamInfo && teamInfo.sheet_id) {
              this.data.sheetInfo = {
                sheet_id: teamInfo.sheet_id,
                sheet_name: teamInfo.sheet_name || 'Sheet1',
                sheet_url: `https://docs.google.com/spreadsheets/d/${teamInfo.sheet_id}/edit#gid=0`
              };
              
              // Cập nhật URL sheet trong giao diện
              this.updateSheetLinks();
              resolve();
              return;
            }
          } catch (e) {
            console.error('Lỗi khi đọc thông tin sheet từ session:', e);
          }
        }
        
        // Sử dụng API để lấy thông tin sheet
        API.getTeamSheetInfo(this.data.teamId)
          .then(sheetInfo => {
            this.data.sheetInfo = sheetInfo;
            this.updateSheetLinks();
            resolve();
          })
          .catch(error => {
            console.error('Lỗi khi lấy thông tin sheet từ API:', error);
            
            // Sử dụng sheet mặc định
            this.data.sheetInfo = {
              sheet_id: CONFIG.DEFAULT_SHEET_ID,
              sheet_name: CONFIG.DEFAULT_SHEET_NAME,
              sheet_url: CONFIG.DEFAULT_SHEET_URL
            };
            
            this.updateSheetLinks();
            resolve(); // Vẫn resolve để tiếp tục
          });
      } catch (error) {
        console.error('Lỗi trong loadSheetInfo:', error);
        reject(error);
      }
    });
  },
  
  // Cập nhật links đến Google Sheet trong giao diện
  updateSheetLinks: function() {
    if (!this.data.sheetInfo) return;
    
    // Cập nhật link trong navbar
    const sheetLinkElem = document.getElementById('sheet-link');
    
    // Cập nhật link trong info box
    const sheetLinkViewElem = document.getElementById('sheet-link-view');
    const sheetNameDisplayElem = document.getElementById('sheet-name-display');
    
    if (sheetLinkElem && this.data.sheetInfo.sheet_url) {
      sheetLinkElem.href = this.data.sheetInfo.sheet_url;
      sheetLinkElem.title = `Mở Google Sheet của ${this.data.teamInfo?.name || 'Team'} trong tab mới`;
    }
    
    if (sheetLinkViewElem && this.data.sheetInfo.sheet_url) {
      sheetLinkViewElem.href = this.data.sheetInfo.sheet_url;
    }
    
    if (sheetNameDisplayElem && this.data.teamInfo) {
      sheetNameDisplayElem.textContent = `${this.data.teamInfo.name || 'Team'} - Google Sheets`;
    }
  },
  
  // Thiết lập giá trị mặc định cho form 
  setDefaultValues: function() {
    // Thiết lập ngày mặc định cho ngày bắt đầu và kết thúc
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Tính ngày cuối cùng của tháng hiện tại
    const currentDate = new Date();
    // Đặt ngày là 1 của tháng tiếp theo sau đó lùi lại 1 ngày = ngày cuối cùng của tháng hiện tại
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Giới hạn không được chọn quá 3 tháng từ hiện tại
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
    
    // Format ngày thành YYYY-MM-DD
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    // Thiết lập giá trị mặc định cho các field
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (startDateInput) {
      startDateInput.min = formatDate(tomorrow);
      startDateInput.value = formatDate(tomorrow);
      this.data.form.startDate = formatDate(tomorrow);
    }
    
    if (endDateInput) {
      endDateInput.min = formatDate(tomorrow);
      endDateInput.max = formatDate(threeMonthsLater);
      endDateInput.value = formatDate(lastDayOfMonth);
      this.data.form.endDate = formatDate(lastDayOfMonth);
    }

    // MẶC ĐỊNH VAT TYPE
    this.data.form.vatType = 'before';
  },
  
  // Thiết lập các sự kiện
  setupEventListeners: function() {
    // Thiết lập các sự kiện tab với hiệu ứng
    this.setupTabEvents();
    
    // Thiết lập sự kiện paste với hiệu ứng
    this.setupPasteEvents();
    this.setupVatSelectionEvents();
    
    // Thiết lập SKU Preview khi hover
    this.setupSkuPreview();
    
    // Sự kiện cho form
    const priceTypeSelect = document.getElementById('priceType');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (priceTypeSelect) {
      priceTypeSelect.addEventListener('change', () => {
        this.data.form.priceType = priceTypeSelect.value;
        
        // Hiệu ứng highlight khi thay đổi
        priceTypeSelect.classList.add('field-highlight');
        setTimeout(() => {
          priceTypeSelect.classList.remove('field-highlight');
        }, 500);
      });
    }
    
    if (startDateInput) {
      startDateInput.addEventListener('change', () => {
        this.data.form.startDate = startDateInput.value;
        
        // Hiệu ứng highlight khi thay đổi
        startDateInput.classList.add('field-highlight');
        setTimeout(() => {
          startDateInput.classList.remove('field-highlight');
        }, 500);
        
        // Đảm bảo ngày kết thúc sau ngày bắt đầu
        if (endDateInput && endDateInput.value < startDateInput.value) {
          endDateInput.value = startDateInput.value;
          this.data.form.endDate = startDateInput.value;
          
          // Highlight cho endDate
          endDateInput.classList.add('field-highlight');
          setTimeout(() => {
            endDateInput.classList.remove('field-highlight');
          }, 500);
        }
      });
    }
    
    if (endDateInput) {
      endDateInput.addEventListener('change', () => {
        this.data.form.endDate = endDateInput.value;
        
        // Hiệu ứng highlight khi thay đổi
        endDateInput.classList.add('field-highlight');
        setTimeout(() => {
          endDateInput.classList.remove('field-highlight');
        }, 500);
      });
    }
    
    // Nút preview với hiệu ứng
    const previewButton = document.getElementById('previewButton');
    if (previewButton) {
      previewButton.addEventListener('click', () => {
        // Hiệu ứng khi nhấn nút
        previewButton.classList.add('btn-active');
        setTimeout(() => {
          previewButton.classList.remove('btn-active');
          this.previewData();
        }, 150);
      });
    }
    
    // Nút submit với hiệu ứng
    const submitButton = document.getElementById('submitButton');
    if (submitButton) {
      submitButton.addEventListener('click', () => {
        // Hiệu ứng khi nhấn nút
        submitButton.classList.add('btn-active');
        setTimeout(() => {
          submitButton.classList.remove('btn-active');
          this.submitData();
        }, 150);
      });
    }

    // Nút quay lại trang chủ
    const homeButton = document.getElementById('homeButton');
    if (homeButton) {
      homeButton.addEventListener('click', () => {
        this.redirectToHomePage();
      });
    }

    // Nút đăng xuất
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
      logoutButton.addEventListener('click', () => {
        this.logout();
      });
    }
    
    // Thiết lập phím tắt
    this.setupKeyboardShortcuts();
  },

  // THAY ĐỔI: setupVatSelectionEvents - Đơn giản hóa vì chỉ có 1 loại VAT
  setupVatSelectionEvents: function() {
    // Mặc định VAT type là 'before'
    this.data.form.vatType = 'before';
    console.log('VAT type mặc định: Giá Trước VAT');
  },
  
  // Thiết lập phím tắt
  setupKeyboardShortcuts: function() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + P: Preview dữ liệu
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        this.previewData();
      }
      
      // Ctrl/Cmd + Enter: Submit dữ liệu
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (this.data.preview) {
          this.submitData();
        } else {
          this.previewData();
        }
      }
      
      // Ctrl/Cmd + H: Hiển thị trợ giúp
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        const helpTab = document.querySelector('.nav-tab[data-section="help"]');
        if (helpTab) {
          helpTab.click();
        }
      }
      
      // Ctrl/Cmd + I: Chuyển về tab nhập liệu
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        const inputTab = document.querySelector('.nav-tab[data-section="input"]');
        if (inputTab) {
          inputTab.click();
        }
      }
    });
  },
  
  // Thiết lập sự kiện tab với hiệu ứng
  setupTabEvents: function() {
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Xóa active cho tất cả tab
        navTabs.forEach(t => t.classList.remove('active'));
        
        // Thêm active cho tab được chọn với hiệu ứng
        tab.classList.add('active');
        
        // Lấy id section
        const sectionId = tab.getAttribute('data-section');
        const navContents = document.querySelectorAll('.nav-content');
        
        // Hiển thị nội dung tương ứng với hiệu ứng fade
        navContents.forEach(content => {
          if (content.id === sectionId + '-section') {
            // Fade out nội dung hiện tại
            content.style.opacity = '0';
            content.classList.add('active');
            
            // Sau đó fade in
            setTimeout(() => {
              content.style.opacity = '1';
            }, 50);
          } else {
            content.classList.remove('active');
          }
        });
        
        // Lưu tab đã chọn vào localStorage để giữ nguyên khi reload trang
        localStorage.setItem('last_active_tab', sectionId);
      });
    });
    
    // Khôi phục tab đã chọn
    const lastActiveTab = localStorage.getItem('last_active_tab');
    if (lastActiveTab) {
      const tab = document.querySelector(`.nav-tab[data-section="${lastActiveTab}"]`);
      if (tab) {
        tab.click();
      }
    }
  },
  
  // Thiết lập sự kiện paste với hiệu ứng
  setupPasteEvents: function() {
    const buyerTextArea = document.getElementById('buyerPasteArea');
    const skuTextArea = document.getElementById('skuPasteArea');
    
    const handlePaste = (textarea, validateFn) => {
      // Hiệu ứng khi paste
      textarea.addEventListener('paste', (e) => {
        // Thêm class để hiển thị hiệu ứng
        textarea.classList.add('paste-highlight');
        
        // Xóa class sau khi hiệu ứng kết thúc
        setTimeout(() => {
          textarea.classList.remove('paste-highlight');
          
          // Validate sau khi paste
          setTimeout(() => {
            validateFn.call(this);
          }, 100);
        }, 300);
      });
      
      // Hiệu ứng khi thay đổi nội dung
      textarea.addEventListener('input', (e) => {
        // Highlight khi có thay đổi
        textarea.classList.add('content-changed');
        
        // Xóa highlight sau một khoảng thời gian
        setTimeout(() => {
          textarea.classList.remove('content-changed');
          
          // Validate sau khi thay đổi
          validateFn.call(this);
        }, 300);
      });
    };
    
    if (buyerTextArea) {
      handlePaste(buyerTextArea, this.validateBuyerData);
    }
    
    if (skuTextArea) {
      handlePaste(skuTextArea, this.validateSkuData);
    }
  },
  
  // Thêm tính năng hiển thị SKU Preview khi hover
  setupSkuPreview: function() {
    const skuTextArea = document.getElementById('skuPasteArea');
    if (!skuTextArea) return;
    
    // Tạo tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'sku-preview-tooltip';
    tooltip.style.display = 'none';
    document.body.appendChild(tooltip);
    
    // Kiểm tra vị trí chuột để hiển thị chi tiết SKU
    skuTextArea.addEventListener('mousemove', (e) => {
      // Lấy vị trí con trỏ trong textarea
      const textAreaRect = skuTextArea.getBoundingClientRect();
      const scrollTop = skuTextArea.scrollTop;
      
      // Tính toán vị trí dòng
      const relativeY = e.clientY - textAreaRect.top + scrollTop;
      const lineHeight = parseInt(getComputedStyle(skuTextArea).lineHeight) || 18;
      const lineNumber = Math.floor(relativeY / lineHeight);
      
      // Lấy nội dung của dòng đó
      const lines = skuTextArea.value.split('\n');
      if (lineNumber >= 0 && lineNumber < lines.length) {
        const line = lines[lineNumber].trim();
        
        if (line) {
          // Phân tích dòng
          const parts = line.split(/\t|\s{2,}/);
          if (parts.length >= 2) {
            const sku = parts[0].trim();
            const price = parts[parts.length - 1].trim();
            const name = parts.slice(1, parts.length - 1).join(' ').trim();
            
            // Hiển thị tooltip với thông tin chi tiết
            tooltip.innerHTML = `
              <div class="sku-preview-header">Chi tiết SKU</div>
              <div class="sku-preview-content">
                <div><strong>SKU:</strong> ${sku}</div>
                ${name ? `<div><strong>Tên:</strong> ${name}</div>` : ''}
                <div><strong>Giá:</strong> ${price}</div>
              </div>
            `;
            
            tooltip.style.display = 'block';
            tooltip.style.left = (e.clientX + 15) + 'px';
            tooltip.style.top = (e.clientY + 15) + 'px';
            return;
          }
        }
      }
      
      // Ẩn tooltip nếu không có dữ liệu
      tooltip.style.display = 'none';
    });
    
    // Ẩn tooltip khi di chuột ra khỏi textarea
    skuTextArea.addEventListener('mouseout', () => {
      tooltip.style.display = 'none';
    });
  },
  
  // Đăng xuất
  logout: function() {
    // Hiển thị xác nhận
    const confirmed = confirm('Bạn có chắc muốn đăng xuất?');
    if (!confirmed) {
      return;
    }
    
    // Xóa phiên đăng nhập
    localStorage.removeItem('kmr_auth_session');
    sessionStorage.removeItem('kmr_auth_session');
    localStorage.removeItem('kmr_user_info');
    
    // Đăng xuất khỏi Google
    if (typeof google !== 'undefined' && google.accounts) {
      try {
        google.accounts.id.disableAutoSelect();
        google.accounts.id.revoke(this.data.userEmail, () => {
          console.log('Đã thu hồi token Google OAuth');
        });
      } catch (e) {
        console.error('Lỗi khi đăng xuất Google:', e);
      }
    }
    
    // Chuyển hướng đến trang chủ
    window.location.href = 'index.html';
  },
  
  // Kiểm tra dữ liệu buyer
  validateBuyerData: function() {
    const buyerTextArea = document.getElementById('buyerPasteArea');
    if (!buyerTextArea) return;
    
    const text = buyerTextArea.value.trim();
    if (!text) return;
    
    // Kiểm tra định dạng paste - Giờ đây chỉ cần Buyer ID
    const lines = text.split('\n');
    
    // Kiểm tra định dạng cụ thể
    let isValid = true;
    const invalidLines = [];
    let lineNumber = 0;
    
    for (const line of lines) {
      lineNumber++;
      if (!line.trim()) continue;
      
      // Với định dạng đơn giản, chỉ cần ID không trống
      if (!line.trim()) {
        invalidLines.push(`Dòng ${lineNumber}: Không có dữ liệu`);
        isValid = false;
      }
    }
    
    // Báo lỗi nếu định dạng không hợp lệ
    if (!isValid) {
      this.showResultMessage(`Định dạng dữ liệu khách hàng không hợp lệ: ${invalidLines.join(', ')}. Mỗi dòng phải chứa một Buyer ID.`, 'error');
    } else {
      this.showResultMessage('', 'clear'); // Xóa thông báo lỗi nếu có
    }
  },
  
  // Kiểm tra dữ liệu SKU
  validateSkuData: function() {
    const skuTextArea = document.getElementById('skuPasteArea');
    if (!skuTextArea) return;
    
    const text = skuTextArea.value.trim();
    if (!text) return;
    
    // Kiểm tra định dạng paste
    const lines = text.split('\n');
    let isValid = true;
    const invalidLines = [];
    const skusWithoutPrice = [];
    const skusWithNonNumericPrice = [];
    let lineNumber = 0;
    
    // Kiểm tra ít nhất 2 cột và giá là số hợp lệ
    for (const line of lines) {
      lineNumber++;
      if (!line.trim()) continue;
      
      const parts = line.trim().split(/\t|\s{2,}/);
      
      // Kiểm tra có ít nhất 2 cột (SKU và giá)
      if (parts.length < 2) {
        invalidLines.push(`Dòng ${lineNumber}: "${line}" (thiếu giá)`);
        isValid = false;
        continue;
      }
      
      const sku = parts[0].trim();
      
      // Lấy phần tử cuối cùng là giá
      const lastPart = parts[parts.length - 1].trim();
      
      // Kiểm tra nếu phần giá là trống
      if (!lastPart) {
        skusWithoutPrice.push(`${sku} (dòng ${lineNumber})`);
        isValid = false;
        continue;
      }
      
      // Xử lý để lấy giá thuần từ định dạng giá
      const price = parsePrice(lastPart);
      
      // Kiểm tra nếu giá không hợp lệ
      if (price <= 0) {
        skusWithNonNumericPrice.push(`${sku} (dòng ${lineNumber}: "${lastPart}")`);
        isValid = false;
      }
    }
    
    // Hiển thị thông báo lỗi chi tiết
    if (!isValid) {
      let errorMessage = 'Định dạng dữ liệu SKU không hợp lệ:';
      
      if (invalidLines.length > 0) {
        errorMessage += `\n Các dòng thiếu cột: ${invalidLines.join(', ')}`;
      }
      
      if (skusWithoutPrice.length > 0) {
        errorMessage += `\n Các SKU thiếu giá: ${skusWithoutPrice.join(', ')}`;
      }
      
      if (skusWithNonNumericPrice.length > 0) {
        errorMessage += `\n Các SKU có giá không phải số: ${skusWithNonNumericPrice.join(', ')}`;
      }
      
      this.showResultMessage(errorMessage, 'error');
    } else {
      this.showResultMessage('', 'clear'); // Xóa thông báo lỗi nếu có
    }
  },
  
  // Phân tích dữ liệu từ textarea Buyer - chỉ lấy Buyer ID, không cần tên
  parseBuyerData: function() {
    const buyerTextArea = document.getElementById('buyerPasteArea');
    if (!buyerTextArea) return [];
    
    const text = buyerTextArea.value.trim();
    if (!text) return [];
    
    const buyers = [];
    const uniqueBuyerIds = new Set(); // Để kiểm tra ID trùng lặp
    const duplicateBuyerIds = []; // Lưu các ID trùng lặp
    
    // Tách thành các dòng
    const lines = text.split('\n');
    for (const line of lines) {
      if (!line.trim()) continue;
      
      // Với định dạng đơn giản, chỉ lấy Buyer ID từ mỗi dòng
      // Xử lý cả trường hợp có nhiều cột nhưng chỉ lấy cột đầu tiên
      const parts = line.trim().split(/\t|\s{2,}/);
      const buyerId = parts[0].trim();
      
      // Kiểm tra ID trùng lặp
      if (uniqueBuyerIds.has(buyerId)) {
        duplicateBuyerIds.push(buyerId);
      } else {
        uniqueBuyerIds.add(buyerId);
        
        // Thêm vào mảng buyers - chỉ lưu ID không cần customerName
        buyers.push({
          buyerId: buyerId
        });
      }
    }
    
    // Hiển thị lỗi cụ thể nếu có ID trùng lặp
    if (duplicateBuyerIds.length > 0) {
      this.showResultMessage(`Buyer ID bị trùng lặp: ${duplicateBuyerIds.join(', ')}. Vui lòng kiểm tra lại danh sách khách hàng.`, 'error');
      return [];
    }
    
    return buyers;
  },
  
  // Chuẩn bị chuỗi Buyer IDs để hiển thị và lưu trữ
  formatBuyerIdsString: function(buyers) {
    // Nối tất cả các buyer ID với dấu cách để tạo thành một chuỗi
    return buyers.map(buyer => buyer.buyerId).join(' ');
  },
  
  // Tạo Request No theo định dạng mới: #"team"-"khu vực"-"No. of each submit"
  generateRequestNo: function() {
    // Lấy thông tin team và khu vực
    let teamCode = "UNKNOWN";
    let regionCode = "UNKNOWN";
    
    if (this.data.teamInfo) {
      // Lấy mã team (lấy phần đầu của team ID, chuyển thành chữ hoa)
      const teamParts = this.data.teamInfo.id.split('_');
      if (teamParts.length > 1) {
        teamCode = teamParts[0].toUpperCase() + "_" + teamParts[1].toUpperCase();
      }
      
      // Lấy mã khu vực (MN: Miền Nam, MB: Miền Bắc)
      if (this.data.teamInfo.region === 'hcm') {
        regionCode = "MN";
      } else if (this.data.teamInfo.region === 'hanoi') {
        regionCode = "MB";
      }
    }
    
    // Trong triển khai thực tế, nên có một hệ thống đếm số lần submit
    const now = new Date();
    const sequenceNumber = Math.floor(Math.random() * 9000) + 1000; // Số ngẫu nhiên 4 chữ số
    
    // Tạo request no
    return `#${teamCode}-${regionCode}-${sequenceNumber}`;
  },
  
  // Định dạng timestamp ngắn gọn: yyyy-MM-dd HH:mm:ss
  formatTimestamp: function() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  },
  
  // Phân tích dữ liệu từ textarea SKU
  parseSkuData: function() {
    const skuTextArea = document.getElementById('skuPasteArea');
    if (!skuTextArea) return [];
    
    const text = skuTextArea.value.trim();
    if (!text) return [];
    
    const products = [];
    const uniqueSkus = new Set();
    const duplicateSkus = [];
    const skusWithoutPrice = [];
    const skusWithNonNumericPrice = [];
    const lowPriceSkus = [];
    const highPriceSkus = [];
    const veryHighPriceSkus = [];
    const invalidPriceFormatSkus = []; // THÊM: SKU có giá không phải bội số 500
    
    // Reset error data
this.data.errorSkus = {
  duplicate: [],
  lowPrice: [],
  noPrice: [],
  nonNumericPrice: [],
  highPrice: [],
  veryHighPrice: [],
  invalidPriceFormat: [] // THÊM: Lỗi giá không phải bội số 500
};
  const shouldValidatePriceMultiple = this.shouldValidatePriceMultiple();
    const lines = text.split('\n');
    for (const line of lines) {
      if (!line.trim()) continue;
      
      const parts = line.trim().split(/\t|\s{2,}/);
      
      if (parts.length < 2) {
        const sku = parts[0]?.trim() || '';
        skusWithoutPrice.push(sku);
        this.data.errorSkus.noPrice.push(sku);
        continue;
      }
      
      const sku = parts[0].trim();
      
      // Kiểm tra SKU trùng lặp
      if (uniqueSkus.has(sku)) {
        if (!duplicateSkus.includes(sku)) {
          duplicateSkus.push(sku);
          this.data.errorSkus.duplicate.push(sku);
        }
        continue;
      }
      uniqueSkus.add(sku);
      
      const priceStr = parts[parts.length - 1].trim();
      
      if (!priceStr) {
        skusWithoutPrice.push(sku);
        this.data.errorSkus.noPrice.push(sku);
        continue;
      }
      
      const price = parsePrice(priceStr);
      
      if (price <= 0) {
        skusWithNonNumericPrice.push(sku);
        this.data.errorSkus.nonNumericPrice.push(sku);
        continue;
      }
      // THÊM: Kiểm tra giá có phải bội số của 500 không
if (shouldValidatePriceMultiple && !isPriceMultipleOf500(price)) {
        invalidPriceFormatSkus.push(sku);
        this.data.errorSkus.invalidPriceFormat.push(sku);
      }
      // Kiểm tra giá - SỬA ĐIỀU KIỆN CHO CONFIG
      if (typeof CONFIG !== 'undefined' && CONFIG.APP && price < CONFIG.APP.MIN_PRICE) {
        lowPriceSkus.push(sku);
        this.data.errorSkus.lowPrice.push(sku);
      }
      
      if (price > 1000000) {
        highPriceSkus.push(sku);
        this.data.errorSkus.highPrice.push(sku);
      }
      
      if (price > 4000000) {
        veryHighPriceSkus.push(sku);
        this.data.errorSkus.veryHighPrice.push(sku);
      }
      
      // Lấy tên SKU nếu có
      let skuName = '';
      if (parts.length > 2) {
        skuName = parts.slice(1, parts.length - 1).join(' ').trim();
      }
      
      products.push({
        sku: sku,
        skuName: skuName,
        specialPrice: price,
        originalPriceString: priceStr
      });
    }
    
    // Xử lý xác nhận giá cao
    if (highPriceSkus.length > 0 && !this.data.highPriceConfirmed) {
      let confirmMessage = 'Các sản phẩm sau có giá trên 1 triệu, vui lòng xác nhận:<br><br>';
      highPriceSkus.forEach(sku => {
        const product = products.find(p => p.sku === sku);
        if (product) {
          confirmMessage += `- ${sku} ${product.skuName ? '(' + product.skuName + ')' : ''}: ${product.specialPrice.toLocaleString('vi-VN')} VNĐ<br>`;
        }
      });
      
      // Sử dụng hàm showHighPriceConfirmation
      if (typeof showHighPriceConfirmation === 'function') {
        showHighPriceConfirmation(confirmMessage, () => {
          this.data.highPriceConfirmed = true;
          this.previewData();
        });
      }
      
      return [];
    }
    
    // Kiểm tra các lỗi khác
    let hasError = false;
    let errorMessage = '';
    
    if (skusWithoutPrice.length > 0) {
      hasError = true;
      errorMessage += `Các SKU thiếu giá: ${skusWithoutPrice.join(', ')}\n\n`;
    }
    
    if (skusWithNonNumericPrice.length > 0) {
      hasError = true;
      errorMessage += `Các SKU có giá không hợp lệ: ${skusWithNonNumericPrice.join(', ')}\n\n`;
    }
    
    if (duplicateSkus.length > 0) {
      hasError = true;
      errorMessage += `SKU trùng lặp: ${duplicateSkus.join(', ')}\n\n`;
    }
// CHỈ HIỂN THỊ LỖI BỘI SỐ 100 CHO CÁC TEAM CẦN VALIDATE
  if (shouldValidatePriceMultiple && invalidPriceFormatSkus.length > 0) {
    hasError = true;
    errorMessage += `SKU có giá không phải bội số 100: ${invalidPriceFormatSkus.join(', ')}\n`;
    errorMessage += `(Chỉ chấp nhận giá theo bội số 100: 12,100, 12,200, 13,500, ...)\n\n`;
  }
    if (lowPriceSkus.length > 0) {
      hasError = true;
      const minPrice = (typeof CONFIG !== 'undefined' && CONFIG.APP) ? CONFIG.APP.MIN_PRICE : 1000;
      errorMessage += `SKU có giá thấp: ${lowPriceSkus.join(', ')} (dưới ${minPrice.toLocaleString('vi-VN')} VNĐ)`;
    }
    
    if (hasError) {
      this.showResultMessage(errorMessage, 'error');
      return [];
    }
    
    return products;
  },

  // Handle Send Email - Hàm chính để gửi email
  handleSendEmail: function () {
    console.log("DEBUG handleSendEmail", {
      preview: this.data.preview,
      teamInfo: this.data.teamInfo,
      requestNo: this.data.requestNo,
    });
    
    const preview = this.data.preview;
    if (!preview || !this.data.teamInfo || !this.data.requestNo) {
      alert("Thiếu dữ liệu để tạo email.");
      return;
    }

    this.createAndSendEmail(this.data.requestNo, preview, this.data.teamInfo, this.data.userEmail);
  },

  // Hàm mới để xử lý email với dữ liệu được truyền vào
  handleSendEmailWithData: function(requestNo, preview, teamInfo, userEmail) {
    console.log("DEBUG handleSendEmailWithData", {
      preview: preview,
      teamInfo: teamInfo,
      requestNo: requestNo,
      userEmail: userEmail
    });
    
    if (!preview || !teamInfo || !requestNo) {
      alert("Thiếu dữ liệu để tạo email.");
      return;
    }

    // Sử dụng userEmail được truyền vào thay vì this.data.userEmail
    this.createAndSendEmail(requestNo, preview, teamInfo, userEmail || this.data.userEmail);
  },

// Tạo và gửi email với xác nhận
  createAndSendEmail: function(requestNo, preview, teamInfo, userEmail) {
    try {
      // Format date để hiển thị (DD/MM/YYYY)
      const formatDateDisplay = (dateStr) => {
        const date = new Date(dateStr);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      };

      // Format date ngắn gọn cho tiêu đề (DD/MM)
      const formatDateShort = (dateStr) => {
        const date = new Date(dateStr);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      };

      // Xác định region name dựa trên team info
      let regionName = "UNKNOWN";
      if (teamInfo && teamInfo.region) {
        if (teamInfo.region === 'hcm') {
          regionName = "HCM";
        } else if (teamInfo.region === 'hanoi') {
          regionName = "HN";
        }
      }

      // Lấy tên người dùng từ email (phần trước @)
      const userName = userEmail.split('@')[0];

      //[HCM] Special Price - 01/09 - 30/09 - #KA_HOTEL-MN-3864 - haiphuong.le
      // Tạo tiêu đề email theo format: [Region] Special Price - user.name - DD/MM - DD/MM
      const startDateShort = formatDateShort(preview.startDate);
      const endDateShort = formatDateShort(preview.endDate);
      const subject = `[${regionName}] Special Price - ${startDateShort} - ${endDateShort} - ${requestNo} - ${userName}`;

      // Tạo danh sách email chính
      const mainRecipients = [
        'bos@kamereo.vn',
        'viet.truong@kamereo.vn', 
        'thanhbinh.le@kamereo.vn',
        'hung.tran@kamereo.vn',
        'internal-accounting@kamereo.vn'
      ];

      // Tạo danh sách CC dựa trên team
      let ccRecipients = [];
      
      // Danh sách các team KA (đã loại bỏ ka_mt_hcm)
      const kaHCMTeams = ['ka_fc_hcm', 'ka_hotel_hcm', 'ka_school_hcm'];
      const kaHNTeams = ['ka_fc_hn', 'ka_hotel_hn', 'ka_mt_hn', 'ka_school_hn', 'sme_hn'];
      // Danh sách các team SME  
      const smeHCMTeams = ['sme_hcm'];

      if (kaHCMTeams.includes(teamInfo.id)) {
        // Team KA FC/Hotel/School HCM chỉ cc Ms. Khanh
        ccRecipients.push('khanh.le@kamereo.vn');
      } else if (teamInfo.id === 'ka_mt_hcm') {
        // Team KA MT HCM cc thanhphong.pham
        ccRecipients.push('thanhphong.pham@kamereo.vn','khai.ta@kamereo.vn');
      } else if (kaHNTeams.includes(teamInfo.id)) {
        // Team KA HN cc cả  Tâm Lê, junji
        ccRecipients.push('junji.yamamoto@kamereo.vn');
      } else if (smeHCMTeams.includes(teamInfo.id)) {
        // Team SME cc cả phong.ha
        ccRecipients.push('phong.ha@kamereo.vn');
      }

      // Tạo chuỗi buyer IDs
      const buyerIds = preview.buyers.map(b => b.buyerId).join(', ');

      // Lấy URL sheet
      const sheetUrl = this.data.sheetInfo ? this.data.sheetInfo.sheet_url : 'N/A';

      // Tạo nội dung email với VAT info - LUÔN LÀ "Giá Trước VAT"
    // Trong createEmailPreview
const emailBodyContent = 
  `Hi Team BOS,\n\n` +
  `Mình đã gửi thông tin special price qua website, chi tiết như sau:\n\n` +
  `• LINK: ${sheetUrl}\n` +
  `• TEAM: ${teamInfo.name}\n` +
  `• REQUEST_NO: ${requestNo}\n` +
  `• CUSTOMER_ID: ${buyerIds}\n` +  // Cập nhật tên trong email
  `• NUMBER OF SKU: ${preview.products.length}\n` +
  `• PRICE TYPE: ${preview.priceType}\n` +
  `• VAT TYPE: Giá Trước VAT\n` +
  `• ÁP DỤNG TỪ: ${formatDateDisplay(preview.startDate)} ĐẾN: ${formatDateDisplay(preview.endDate)}\n\n\n\n` +
  `Vui lòng chèn ảnh Anh TAKU đã duyệt để minh chứng\n\n\n\n` +
  `Thanks,\n${userEmail}`;

      // Encode email body
      const body = encodeURIComponent(emailBodyContent);

      // Tạo URL Gmail với to và cc
      const emailTo = mainRecipients.join(',');
      const emailCc = ccRecipients.length > 0 ? ccRecipients.join(',') : '';
      
      let gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailTo)}&su=${encodeURIComponent(subject)}&body=${body}`;
      
      // Thêm CC nếu có
      if (emailCc) {
        gmailUrl += `&cc=${encodeURIComponent(emailCc)}`;
      }

      // Tạo preview content cho dialog xác nhận
      const previewContent = this.createEmailPreview(
      mainRecipients, 
      ccRecipients, 
      subject, 
      sheetUrl, 
      teamInfo, 
      requestNo, 
      buyerIds, 
      preview, 
      formatDateDisplay, 
      userEmail
    );

      // Hiển thị dialog xác nhận gửi email
      this.showEmailConfirmationDialog(previewContent, gmailUrl);

    } catch (error) {
      console.error('Lỗi khi tạo email:', error);
      this.showResultMessage(`Lỗi khi tạo email: ${error.message}`, 'error');
    }
  },

// Tạo nội dung preview cho email - DESIGN MỚI VỚI LAYOUT TỐI ƯU
createEmailPreview: function(mainRecipients, ccRecipients, subject, sheetUrl, teamInfo, requestNo, buyerIds, preview, formatDateDisplay, userEmail) {
  return `
    <div style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      font-size: 15px; 
      line-height: 1.6; 
      color: #2c3e50; 
      max-width: 100%; 
      margin: 0;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 25px;
      border-radius: 12px;
    ">
      
      <!-- Header Alert -->
      <div style="
        background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 16px;
        border-radius: 8px;
        text-align: center;
        margin-bottom: 20px;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
      ">
        <div style="font-size: 16px; font-weight: 600; margin-bottom: 6px;">
          🚀 XÁC NHẬN GỬI EMAIL SPECIAL PRICE
        </div>
        <div style="font-size: 13px; opacity: 0.9;">
          💡 Email sẽ mở trong Gmail - Bạn có thể chỉnh sửa trước khi gửi
        </div>
      </div>

      <!-- Email Info Section -->
      <div style="
        background: white;
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 16px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        border-left: 4px solid #3498db;
      ">
        <h3 style="
          margin: 0 0 12px 0;
          color: #2c3e50;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        ">
          📧 THÔNG TIN EMAIL
        </h3>
        
        <div style="margin-bottom: 10px;">
          <span style="
            font-weight: 600;
            color: #34495e;
            display: inline-block;
            width: 100px;
            font-size: 13px;
          ">👥 Người nhận:</span>
          <span style="
            background: #ecf0f1;
            padding: 6px 10px;
            border-radius: 4px;
            font-size: 12px;
            font-family: monospace;
            word-break: break-all;
          ">${mainRecipients.join(', ')}</span>
        </div>
        
        ${ccRecipients.length > 0 ? `
        <div style="margin-bottom: 10px;">
          <span style="
            font-weight: 600;
            color: #34495e;
            display: inline-block;
            width: 100px;
            font-size: 13px;
          ">📋 CC:</span>
          <span style="
            background: #fff3cd;
            padding: 6px 10px;
            border-radius: 4px;
            font-size: 12px;
            font-family: monospace;
            border: 1px solid #ffeaa7;
            word-break: break-all;
          ">${ccRecipients.join(', ')}</span>
        </div>
        ` : ''}
        
        <div>
          <span style="
            font-weight: 600;
            color: #34495e;
            display: inline-block;
            width: 100px;
            font-size: 13px;
          ">📌 Tiêu đề:</span>
          <span style="
            background: #d1ecf1;
            padding: 6px 10px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            color: #0c5460;
            word-break: break-all;
          ">${subject}</span>
        </div>
      </div>

      <!-- Email Content Section -->
      <div style="
        background: white;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        border-left: 4px solid #e74c3c;
      ">
        <h3 style="
          margin: 0 0 12px 0;
          color: #2c3e50;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        ">
          📝 NỘI DUNG EMAIL
        </h3>
        
        <div style="
          background: #f8f9fa;
          padding: 16px;
          border-radius: 6px;
          border: 1px solid #dee2e6;
          font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
          font-size: 12px;
          line-height: 1.6;
        ">
          <div style="margin-bottom: 12px; font-size: 14px; font-weight: 600; color: #2c3e50;">
            Hi Team BOS,
          </div>
          
          <div style="margin-bottom: 16px; color: #5a6c7d;">
            Mình đã gửi thông tin special price qua website, chi tiết như sau:
          </div>
          
          <!-- Key Information Grid -->
          <div style="
            background: white;
            padding: 12px;
            border-radius: 6px;
            border: 2px solid #3498db;
            margin-bottom: 16px;
            box-shadow: 0 2px 6px rgba(52, 152, 219, 0.1);
          ">
            <div style="display: flex; flex-direction: column; gap: 8px;">
              
              <div style="display: flex; align-items: flex-start; padding: 6px 0; border-bottom: 1px solid #ecf0f1;">
                <span style="font-weight: 600; color: #34495e; min-width: 120px; font-size: 11px;">🔗 LINK:</span>
                <a href="${sheetUrl}" target="_blank" style="
                  color: #3498db; 
                  text-decoration: underline;
                  font-weight: 500;
                  font-size: 11px;
                  word-break: break-all;
                  flex: 1;
                ">${sheetUrl}</a>
              </div>
              
              <div style="display: flex; align-items: center; padding: 6px 0; border-bottom: 1px solid #ecf0f1;">
                <span style="font-weight: 600; color: #34495e; min-width: 120px; font-size: 11px;">👥 TEAM:</span>
                <span style="color: #2c3e50; font-weight: 500; font-size: 11px;">${teamInfo.name}</span>
              </div>
              
              <div style="display: flex; align-items: center; padding: 8px 0; border-bottom: 1px solid #ecf0f1; background: #fff5f5;">
                <span style="font-weight: 600; color: #34495e; min-width: 120px; font-size: 11px;">🎯 REQUEST_NO:</span>
                <span style="
                  background: #e74c3c;
                  color: white;
                  padding: 4px 8px;
                  border-radius: 12px;
                  font-weight: 700;
                  font-size: 11px;
                  box-shadow: 0 2px 4px rgba(231, 76, 60, 0.3);
                ">${requestNo}</span>
              </div>
              
              <div style="display: flex; align-items: center; padding: 6px 0; border-bottom: 1px solid #ecf0f1;">
                <span style="font-weight: 600; color: #34495e; min-width: 120px; font-size: 11px;">🆔 BUYER_ID:</span>
                <span style="
                  background: #f39c12;
                  color: white;
                  padding: 3px 6px;
                  border-radius: 3px;
                  font-family: monospace;
                  font-weight: 600;
                  font-size: 10px;
                  word-break: break-all;
                ">${buyerIds}</span>
              </div>
              
              <div style="display: flex; align-items: center; padding: 8px 0; border-bottom: 1px solid #ecf0f1; background: #f0fff4;">
                <span style="font-weight: 600; color: #34495e; min-width: 120px; font-size: 11px;">📦 NUMBER OF SKU:</span>
                <span style="
                  background: #27ae60;
                  color: white;
                  padding: 4px 8px;
                  border-radius: 12px;
                  font-weight: 700;
                  font-size: 12px;
                  box-shadow: 0 2px 4px rgba(39, 174, 96, 0.3);
                ">${preview.products.length}</span>
              </div>
              
              <div style="display: flex; align-items: center; padding: 6px 0; border-bottom: 1px solid #ecf0f1;">
                <span style="font-weight: 600; color: #34495e; min-width: 120px; font-size: 11px;">💰 PRICE TYPE:</span>
                <span style="color: #2c3e50; font-weight: 500; font-size: 11px;">${preview.priceType}</span>
              </div>
              
              <div style="display: flex; align-items: center; padding: 8px 0; border-bottom: 1px solid #ecf0f1; background: #f8f3ff;">
                <span style="font-weight: 600; color: #34495e; min-width: 120px; font-size: 11px;">🏷️ VAT TYPE:</span>
                <span style="
                  background: linear-gradient(45deg, #8e44ad, #3498db);
                  color: white;
                  padding: 6px 12px;
                  border-radius: 16px;
                  font-weight: 700;
                  font-size: 11px;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                  box-shadow: 0 3px 6px rgba(142, 68, 173, 0.4);
                ">GIÁ TRƯỚC VAT</span>
              </div>
              
              <div style="display: flex; align-items: center; padding: 8px 0; background: #fffbf0;">
                <span style="font-weight: 600; color: #34495e; min-width: 120px; font-size: 11px;">📅 ÁP DỤNG:</span>
                <span style="
                  background: linear-gradient(45deg, #f39c12, #e67e22);
                  color: white;
                  padding: 6px 12px;
                  border-radius: 6px;
                  font-weight: 700;
                  font-size: 11px;
                  box-shadow: 0 3px 6px rgba(243, 156, 18, 0.3);
                ">TỪ ${formatDateDisplay(preview.startDate)} ĐẾN ${formatDateDisplay(preview.endDate)}</span>
              </div>
              
            </div>
          </div>
          
          <div style="
            background: #fff3cd;
            padding: 10px;
            border-radius: 4px;
            border: 1px solid #ffeaa7;
            margin-bottom: 16px;
            font-weight: 600;
            color: #856404;
            text-align: center;
            font-size: 11px;
          ">
            ⚠️ Vui lòng chèn ảnh Anh TAKU đã duyệt để minh chứng
          </div>
          
          <div style="margin-top: 16px; font-size: 12px;">
            <div style="color: #5a6c7d; margin-bottom: 6px;">Thanks,</div>
            <div style="
              font-weight: 700;
              color: #2c3e50;
              font-size: 13px;
              background: #ecf0f1;
              padding: 6px 10px;
              border-radius: 4px;
              display: inline-block;
            ">${userEmail}</div>
          </div>
        </div>
      </div>
    </div>
  `;
},

  // Hiển thị dialog xác nhận gửi email
  showEmailConfirmationDialog: function(previewContent, gmailUrl) {
    // Kiểm tra nếu hàm showEmailConfirmation có tồn tại
    if (typeof showEmailConfirmation !== 'function') {
      console.error('Hàm showEmailConfirmation không tồn tại');
      // Fallback: Sử dụng confirm đơn giản
      if (confirm('Bạn có muốn gửi email thông báo không?')) {
        this.openGmailWithEmail(gmailUrl);
      }
      return;
    }

    showEmailConfirmation(
      previewContent,
      // Callback khi người dùng bấm Gửi Email
      () => {
        this.openGmailWithEmail(gmailUrl);
      },
      // Callback khi người dùng bấm Hủy
      () => {
        console.log('Người dùng đã hủy gửi email');
      }
    );
  },

  // Mở Gmail với email đã soạn sẵn
  openGmailWithEmail: function(gmailUrl) {
    try {
      // Mở Gmail trong tab mới
      const newTab = window.open(gmailUrl, '_blank', 'noopener,noreferrer');
      
      // Kiểm tra nếu pop-up bị chặn
      if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {
        console.warn('Pop-up bị chặn, hiển thị link thủ công');
        
        // Hiển thị thông báo với link thủ công
        this.showResultMessage(
          `
          <div style="text-align: center;">
            <p><strong>⚠️ Pop-up bị chặn!</strong></p>
            <p>Vui lòng bật pop-up cho trang web này hoặc click vào nút bên dưới để mở Gmail:</p>
            <br>
            <a href="${gmailUrl}" target="_blank" class="manual-email-link" 
               style="display: inline-block; background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              <i class="fas fa-envelope"></i> Mở Gmail để gửi email
            </a>
            <br><br>
            <small style="color: #666;">Nếu vẫn không hoạt động, hãy copy URL từ thanh địa chỉ và mở trong tab mới</small>
          </div>
          `,
          'warning'
        );
      } else {
        // Thông báo thành công
        this.showResultMessage(
          `
          <div style="text-align: center;">
            <p><strong>✅ Thành công!</strong></p>
            <p>Đã mở Gmail trong tab mới. Vui lòng kiểm tra và gửi email.</p>
            <br>
            <small style="color: #666;">💡 Bạn có thể chỉnh sửa nội dung email trước khi gửi</small>
          </div>
          `,
          'success'
        );
      }
    } catch (error) {
      console.error('Lỗi khi mở Gmail:', error);
      
      // Hiển thị link backup
      this.showResultMessage(
        `
        <div style="text-align: center;">
          <p><strong>❌ Lỗi khi mở Gmail</strong></p>
          <p>Vui lòng click vào link bên dưới để mở Gmail thủ công:</p>
          <br>
          <a href="${gmailUrl}" target="_blank" class="manual-email-link"
             style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            <i class="fas fa-envelope"></i> Mở Gmail
          </a>
        </div>
        `,
        'error'
      );
    }
  },

  // THÊM: Hiển thị VAT confirmation dialog
  showVatConfirmationDialog: function() {
    return new Promise((resolve, reject) => {
      const dialog = document.getElementById('vat-confirm-dialog');
      if (!dialog) {
        console.error('VAT confirmation dialog not found');
        resolve(); // Tiếp tục nếu không tìm thấy dialog
        return;
      }
      
      // Hiển thị dialog
      dialog.style.display = 'flex';
      setTimeout(() => {
        dialog.classList.add('show');
      }, 10);
      
      // Xử lý nút xác nhận
      const confirmBtn = document.getElementById('vat-confirm-btn');
      const cancelBtn = document.getElementById('vat-cancel-btn');
      const closeBtn = document.getElementById('vat-close-btn');
      
      // Tạo các event handler mới
      const handleConfirm = () => {
        console.log('User confirmed VAT type: Giá Trước VAT');
        this.hideVatConfirmationDialog();
        resolve(); // Tiếp tục với preview
      };
      
      const handleCancel = () => {
        console.log('User cancelled VAT confirmation');
        this.hideVatConfirmationDialog();
        reject('User cancelled VAT confirmation');
      };
      
      // Remove existing event listeners và add new ones
      if (confirmBtn) {
        confirmBtn.removeEventListener('click', handleConfirm);
        confirmBtn.addEventListener('click', handleConfirm);
      }
      
      if (cancelBtn) {
        cancelBtn.removeEventListener('click', handleCancel);
        cancelBtn.addEventListener('click', handleCancel);
      }
      
      if (closeBtn) {
        closeBtn.removeEventListener('click', handleCancel);
        closeBtn.addEventListener('click', handleCancel);
      }
      
      // ESC key để đóng
      const handleEsc = (e) => {
        if (e.key === 'Escape') {
          handleCancel();
          document.removeEventListener('keydown', handleEsc);
        }
      };
      
      document.addEventListener('keydown', handleEsc);
      
      // Click outside để đóng với shake effect
      const handleClickOutside = (e) => {
        if (e.target === dialog) {
          // Thêm shake animation
          const content = dialog.querySelector('.vat-confirm-content');
          if (content) {
            content.classList.add('shake-animation');
            setTimeout(() => {
              content.classList.remove('shake-animation');
            }, 600);
          }
        }
      };
      
      dialog.addEventListener('click', handleClickOutside);
    });
  },

  // THÊM: Ẩn VAT confirmation dialog
  hideVatConfirmationDialog: function() {
    const dialog = document.getElementById('vat-confirm-dialog');
    if (dialog) {
      dialog.classList.remove('show');
      setTimeout(() => {
        dialog.style.display = 'none';
      }, 300);
    }
  },

  // Cải tiến hiển thị thông báo lỗi
  showResultMessage: function(message, type) {
    const resultElement = document.getElementById('result');
    if (!resultElement) return;
    
    if (type === 'clear') {
      // Xóa thông báo
      resultElement.style.opacity = '0';
      setTimeout(() => {
        resultElement.style.display = 'none';
        resultElement.innerHTML = '';
      }, 300);
      return;
    }
    
    // Ẩn trước khi hiển thị để có hiệu ứng fade-in
    resultElement.style.opacity = '0';
    
    // Thiết lập nội dung và kiểu
    let icon = '';
    switch(type) {
      case 'error':
        icon = '<i class="fas fa-exclamation-circle"></i>';
        break;
      case 'success':
        icon = '<i class="fas fa-check-circle"></i>';
        break;
      case 'warning':
        icon = '<i class="fas fa-exclamation-triangle"></i>';
        break;
      case 'info':
        icon = '<i class="fas fa-info-circle"></i>';
        break;
    }
    
    // Định dạng thông báo lỗi với định dạng có cấu trúc
    if (type === 'error' && message.includes('\n')) {
      const parts = message.split('\n');
      let formattedMessage = parts[0]; // Dòng đầu tiên giữ nguyên
      
      // Chuyển các dòng còn lại thành danh sách có cấu trúc
      let listItems = '';
      
      // Xử lý các danh sách lỗi quá dài (ví dụ: các SKU lỗi)
      const MAX_ITEMS = 20; // Giới hạn số lượng mục hiển thị
      
      // Lọc ra các dòng có nội dung
      const contentLines = parts.slice(1).filter(line => line.trim());
      
      // Nếu có quá nhiều lỗi, chỉ hiển thị một số và tóm tắt phần còn lại
      if (contentLines.length > MAX_ITEMS) {
        for (let i = 0; i < MAX_ITEMS; i++) {
          if (contentLines[i].trim()) {
            listItems += `<li>${contentLines[i].trim()}</li>`;
          }
        }
        
        const remainingCount = contentLines.length - MAX_ITEMS;
        listItems += `<li class="error-summary">...và ${remainingCount} lỗi khác nữa. Vui lòng kiểm tra dữ liệu cẩn thận.</li>`;
      } else {
        // Hiển thị tất cả nếu ít hơn mức giới hạn
        for (let i = 0; i < contentLines.length; i++) {
          if (contentLines[i].trim()) {
            listItems += `<li>${contentLines[i].trim()}</li>`;
          }
        }
      }
      
      if (listItems) {
        formattedMessage += `<ul class="error-list">${listItems}</ul>`;
      }
      
      resultElement.innerHTML = `${icon} ${formattedMessage}`;
    } else {
      resultElement.innerHTML = `${icon} ${message}`;
    }
    
    // Xóa class cũ
    resultElement.classList.remove('success', 'error', 'warning', 'info');
    
    // Thêm class mới
    resultElement.classList.add(type);
    
    // Hiển thị và thiết lập hiệu ứng
    resultElement.style.display = 'block';
    
    // Hiệu ứng fade-in
    setTimeout(() => {
      resultElement.style.opacity = '1';
    }, 10);
    
    // Cuộn đến phần tử với hiệu ứng mượt
    resultElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Thêm nút đóng thông báo
    if (!resultElement.querySelector('.close-btn')) {
      const closeBtn = document.createElement('span');
      closeBtn.className = 'close-btn';
      closeBtn.innerHTML = '&times;';
      closeBtn.title = 'Đóng thông báo';
      closeBtn.addEventListener('click', () => {
        resultElement.style.opacity = '0';
        setTimeout(() => {
          resultElement.style.display = 'none';
        }, 300);
      });
      resultElement.appendChild(closeBtn);
    }
    
    // Tự động ẩn thông báo thành công sau 5 giây
    if (type === 'success') {
      setTimeout(() => {
        resultElement.style.opacity = '0';
        setTimeout(() => {
          resultElement.style.display = 'none';
        }, 300);
      }, 5000);
    }
    
    // Highlight cho các SKU có lỗi trong textarea
    if (type === 'error') {
      this.highlightErrorsInTextarea();
    }
  },

  // Tô sáng các SKU lỗi trong textarea
  highlightErrorsInTextarea: function() {
    // Chỉ áp dụng nếu có dữ liệu về SKU lỗi
    if (!this.data.errorSkus) return;
    
    const skuTextArea = document.getElementById('skuPasteArea');
    if (!skuTextArea) return;
    
    // Lấy dữ liệu từ textarea
    const text = skuTextArea.value;
    
    // Tạm thời lưu vị trí con trỏ
    const scrollTop = skuTextArea.scrollTop;
    const selectionStart = skuTextArea.selectionStart;
    const selectionEnd = skuTextArea.selectionEnd;
    
    // Tạo một overlay trên textarea để hiển thị các gạch chân và các dấu hiệu lỗi
    // Chỉ hiển thị trực quan, không thay đổi nội dung thực tế
    const lines = text.split('\n');
    const errorLines = [];
    
// Chứa tất cả các SKU lỗi - CHỈ THÊM invalidPriceFormat CHO CÁC TEAM CẦN VALIDATE
    const allErrorSkus = [
      ...this.data.errorSkus.duplicate,
      ...this.data.errorSkus.lowPrice,
      ...this.data.errorSkus.noPrice,
      ...this.data.errorSkus.nonNumericPrice,
      ...this.data.errorSkus.highPrice
    ];
    
    // CHỈ THÊM invalidPriceFormat CHO CÁC TEAM CẦN VALIDATE BỘI SỐ 500
    if (this.shouldValidatePriceMultiple() && this.data.errorSkus.invalidPriceFormat) {
      allErrorSkus.push(...this.data.errorSkus.invalidPriceFormat);
    }
    
    // Tìm các dòng có lỗi
    lines.forEach((line, index) => {
      if (!line.trim()) return;
      
      const parts = line.trim().split(/\t|\s{2,}/);
      if (parts.length > 0) {
        const sku = parts[0].trim();
        
        // Kiểm tra xem SKU này có lỗi không
        if (allErrorSkus.includes(sku)) {
          errorLines.push(index);
          
          // Thêm class vào textarea để tạo hiệu ứng highlight
          skuTextArea.classList.add('has-errors');
          
          // Xác định loại lỗi
          let errorType = '';
          if (this.data.errorSkus.duplicate.includes(sku)) {
            errorType = 'duplicate';
          } else if (this.data.errorSkus.lowPrice.includes(sku)) {
            errorType = 'low-price';
          } else if (this.data.errorSkus.noPrice.includes(sku)) {
            errorType = 'no-price';
          }  else if (this.data.errorSkus.nonNumericPrice.includes(sku)) {
            errorType = 'non-numeric-price';
          } else if (this.shouldValidatePriceMultiple() && this.data.errorSkus.invalidPriceFormat && this.data.errorSkus.invalidPriceFormat.includes(sku)) {
            errorType = 'invalid-price-format';
          } else if (this.data.errorSkus.highPrice.includes(sku)) {
            errorType = 'high-price';
          }
          
          // Tạo một marker ở bên trái textarea
          const lineHeight = parseInt(getComputedStyle(skuTextArea).lineHeight) || 18;
          const markerTop = (index * lineHeight) + 'px';
          
          // Tạo một marker element
          const marker = document.createElement('div');
          marker.className = `error-marker ${errorType}-error`;
          marker.style.top = markerTop;
          marker.title = this.getErrorTooltip(sku);
          
          // Thêm marker vào container nếu có
          const container = skuTextArea.parentElement;
          if (container && container.classList.contains('textarea-container')) {
            container.appendChild(marker);
            
            // Đảm bảo container có position relative
            container.style.position = 'relative';
          }
        }
      }
    });
    
    // Hiệu ứng flash các dòng lỗi
    if (errorLines.length > 0) {
      // Thêm hiệu ứng flash lần lượt cho các dòng lỗi
      let delay = 0;
      errorLines.forEach(lineIndex => {
        setTimeout(() => {
          // Tính vị trí dòng
          let lineStart = 0;
          for (let i = 0; i < lineIndex; i++) {
            lineStart += lines[i].length + 1; // +1 cho ký tự xuống dòng
          }
          
          // Đặt vị trí con trỏ tại dòng có lỗi và cuộn đến đó
          skuTextArea.focus();
          skuTextArea.setSelectionRange(lineStart, lineStart + lines[lineIndex].length);
          
          // Highlight tạm thời
          skuTextArea.classList.add('flash-error');
          setTimeout(() => {
            skuTextArea.classList.remove('flash-error');
          }, 500);
        }, delay);
        
        delay += 700; // Mỗi dòng lỗi hiển thị cách nhau 700ms
      });
      
      // Khôi phục vị trí con trỏ và cuộn sau khi hiệu ứng hoàn tất
      setTimeout(() => {
        skuTextArea.setSelectionRange(selectionStart, selectionEnd);
        skuTextArea.scrollTop = scrollTop;
        
        // Cũng xóa các marker sau một thời gian
        setTimeout(() => {
          const markers = document.querySelectorAll('.error-marker');
          markers.forEach(marker => marker.remove());
          skuTextArea.classList.remove('has-errors');
        }, 5000); // Xóa markers sau 5 giây
      }, delay + 500);
    }
  },

  // Lấy tooltip mô tả lỗi tương ứng cho SKU
  getErrorTooltip: function(sku) {
    if (!this.data.errorSkus) return '';
    
    if (this.data.errorSkus.duplicate.includes(sku)) {
      return 'SKU trùng lặp';
    } else if (this.data.errorSkus.lowPrice.includes(sku)) {
      return `Giá thấp hơn ${CONFIG.APP.MIN_PRICE.toLocaleString('vi-VN')} VNĐ`;
    } else if (this.data.errorSkus.noPrice.includes(sku)) {
      return 'Thiếu giá';
    } else if (this.data.errorSkus.nonNumericPrice.includes(sku)) {
  return 'Giá không phải số';
} else if (this.data.errorSkus.invalidPriceFormat && this.data.errorSkus.invalidPriceFormat.includes(sku)) {
      // CHỈ HIỂN THỊ TOOLTIP NÀY CHO CÁC TEAM CẦN VALIDATE BỘI SỐ 500
      if (this.shouldValidatePriceMultiple()) {
        return 'Giá phải là bội số của 100 (ví dụ: 12,100, 12,500, 12,700)';
      }
    } else if (this.data.errorSkus.highPrice.includes(sku)) {
  return 'Giá cao (trên 1 triệu VNĐ)';
}
    return '';
  },
  
  // THAY ĐỔI: Xem trước dữ liệu - CẬP NHẬT LOGIC VAT
  previewData: function() {
    // Kiểm tra dữ liệu đầu vào
    const priceTypeSelect = document.getElementById('priceType');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    // Lấy giá trị từ form
    const priceType = priceTypeSelect ? priceTypeSelect.value : '';
    const startDate = startDateInput ? startDateInput.value : '';
    const endDate = endDateInput ? endDateInput.value : '';
    
    // Validate dữ liệu
    if (!priceType) {
      this.showResultMessage('Vui lòng chọn loại giá', 'error');
      // Tạo hiệu ứng nhấp nháy cho dropdown chưa chọn
      if (priceTypeSelect) {
        priceTypeSelect.classList.add('highlight-error');
        setTimeout(() => {
          priceTypeSelect.classList.remove('highlight-error');
        }, 1000);
      }
      return;
    }
    
    // BỎ VALIDATE VAT TYPE - MẶC ĐỊNH LÀ 'before'
    this.data.form.vatType = 'before';
    
    if (!startDate || !endDate) {
      this.showResultMessage('Vui lòng chọn ngày áp dụng', 'error');
      // Tạo hiệu ứng nhấp nháy cho các trường ngày chưa chọn
      if (!startDate && startDateInput) {
        startDateInput.classList.add('highlight-error');
        setTimeout(() => {
          startDateInput.classList.remove('highlight-error');
        }, 1000);
      }
      if (!endDate && endDateInput) {
        endDateInput.classList.add('highlight-error');
        setTimeout(() => {
          endDateInput.classList.remove('highlight-error');
        }, 1000);
      }
      return;
    }
    
    // Kiểm tra ngày
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startDateObj = new Date(startDate);
    startDateObj.setHours(0, 0, 0, 0);
    
    const endDateObj = new Date(endDate);
    endDateObj.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (startDateObj < tomorrow) {
      this.showResultMessage('Ngày bắt đầu phải từ ngày mai trở đi', 'error');
      if (startDateInput) {
        startDateInput.classList.add('highlight-error');
        setTimeout(() => {
          startDateInput.classList.remove('highlight-error');
        }, 1000);
      }
      return;
    }
    
    if (endDateObj < startDateObj) {
      this.showResultMessage('Ngày kết thúc phải sau ngày bắt đầu', 'error');
      if (endDateInput) {
        endDateInput.classList.add('highlight-error');
        setTimeout(() => {
          endDateInput.classList.remove('highlight-error');
        }, 1000);
      }
      return;
    }
    
    const threeMonthsLater = new Date(today);
    threeMonthsLater.setMonth(today.getMonth() + CONFIG.APP.MAX_DURATION_MONTHS);
    
    if (endDateObj > threeMonthsLater) {
      this.showResultMessage(`Ngày kết thúc không được quá ${CONFIG.APP.MAX_DURATION_MONTHS} tháng từ ngày hiện tại`, 'error');
      if (endDateInput) {
        endDateInput.classList.add('highlight-error');
        setTimeout(() => {
          endDateInput.classList.remove('highlight-error');
        }, 1000);
      }
      return;
    }
    
    // Lấy dữ liệu từ textarea để kiểm tra ngay cả khi trống
    const buyerTextArea = document.getElementById('buyerPasteArea');
    const skuTextArea = document.getElementById('skuPasteArea');
    
    if (!buyerTextArea || !buyerTextArea.value.trim()) {
      this.showResultMessage('Vui lòng nhập thông tin khách hàng', 'error');
      if (buyerTextArea) {
        buyerTextArea.classList.add('highlight-error');
        setTimeout(() => {
          buyerTextArea.classList.remove('highlight-error');
        }, 1000);
      }
      return;
    }
    
    if (!skuTextArea || !skuTextArea.value.trim()) {
      this.showResultMessage('Vui lòng nhập thông tin SKU và giá', 'error');
      if (skuTextArea) {
        skuTextArea.classList.add('highlight-error');
        setTimeout(() => {
          skuTextArea.classList.remove('highlight-error');
        }, 1000);
      }
      return;
    }
    
    // Hiển thị trạng thái đang xử lý
    showLoading('Đang xử lý dữ liệu...', 20);
    
    // Sử dụng setTimeout để có thể hiển thị đang loading
    setTimeout(() => {
      // Phân tích dữ liệu
      const buyers = this.parseBuyerData();
      
      updateLoadingProgress(50, 'Đang xử lý dữ liệu sản phẩm...');
      
      const products = this.parseSkuData();
      
      // Ẩn trạng thái đang xử lý
      hideLoading();
      
      // Kiểm tra dữ liệu đã phân tích
      if (buyers.length === 0 || products.length === 0) {
        return; // Không hiển thị thông báo lỗi ở đây vì đã có thông báo từ các hàm parse
      }
      
      // HIỂN THị VAT CONFIRMATION DIALOG TRƯỚC KHI TIẾP TỤC
      this.showVatConfirmationDialog()
        .then(() => {
          // User đã xác nhận, tiếp tục với preview
          this.continueWithPreview(buyers, products, priceType, startDate, endDate);
        })
        .catch(() => {
          // User đã hủy, không làm gì cả
          console.log('VAT confirmation cancelled');
        });
    }, 300);
  },

  // THÊM: Tiếp tục với preview sau khi đã xác nhận VAT
  continueWithPreview: function(buyers, products, priceType, startDate, endDate) {
    // Lưu trữ dữ liệu đã phân tích
    this.data.form.priceType = priceType;
    this.data.form.startDate = startDate;
    this.data.form.endDate = endDate;
    this.data.form.buyers = buyers;
    this.data.form.products = products;
    this.data.form.vatType = 'before'; // LUÔN LÀ 'before'
    
    // Tạo dữ liệu preview
    this.data.preview = {
      priceType: priceType,
      startDate: startDate,
      endDate: endDate,
      buyers: buyers,
      products: products,
      vatType: 'before', // LUÔN LÀ 'before'
      timestamp: new Date(),
      userEmail: this.data.userEmail
    };
    
    // Hiển thị preview
    this.displayPreview();
    
    // Hiển thị thông báo thành công
    this.showResultMessage('Dữ liệu không có lỗi. Bạn có thể gửi dữ liệu.', 'success');
  },
  
  displayPreview: function() {
    // Hiển thị phần Preview với hiệu ứng fade-in
    const previewContainer = document.getElementById('previewContainer');
    if (previewContainer) {
      previewContainer.style.opacity = '0';
      previewContainer.style.display = 'block';
      setTimeout(() => {
        previewContainer.style.opacity = '1';
      }, 50);
    }
    
    // Lấy dữ liệu preview
    const preview = this.data.preview;
    const previewContent = document.getElementById('previewContent');
    
    if (!previewContent || !preview) {
      return;
    }
    
    // Tạo Request No nếu chưa có
    if (!this.data.requestNo) {
      this.data.requestNo = this.generateRequestNo();
    }
    
    // Hiển thị Request No với hiệu ứng highlight
    const requestNoDisplay = document.getElementById('request-no-display');
    if (requestNoDisplay) {
      requestNoDisplay.textContent = this.data.requestNo;
      requestNoDisplay.classList.add('highlight-requestno');
      setTimeout(() => {
        requestNoDisplay.classList.remove('highlight-requestno');
      }, 1000);
    }
    
    // Format date to display in Vietnamese format (DD/MM/YYYY)
    const formatDateDisplay = (dateStr) => {
      const date = new Date(dateStr);
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };
    
    // Tạo phần preview buyers
    const buyerIds = this.formatBuyerIdsString(preview.buyers);
    
    // Tạo phần preview dữ liệu với hiệu ứng animation - LUÔN HIỂN THỊ "Giá Trước VAT"
    let previewHTML = `
      <div class="preview-section fade-in-section">
        <div class="preview-header">
          <i class="fas fa-info-circle"></i>
          <h4>Thông tin chung</h4>
        </div>
        <div class="preview-info">
          <div class="preview-row">
            <div class="preview-label">Request No:</div>
            <div class="preview-value">${this.data.requestNo}</div>
          </div>
          <div class="preview-row">
            <div class="preview-label">Số Lượng Buyer_IDs:</div>
            <div class="preview-value">${preview.buyers.length}</div>
          </div>
          <div class="preview-row">
            <div class="preview-label">Số Lượng SKUs:</div>
            <div class="preview-value">${preview.products.length}</div>
          </div>
          <div class="preview-row">
            <div class="preview-label">Loại giá:</div>
            <div class="preview-value">${preview.priceType}</div>
          </div>
          <div class="preview-row">
            <div class="preview-label">Loại giá theo VAT:</div>
            <div class="preview-value" style="color: #6f42c1; font-weight: bold;">Giá Trước VAT</div>
          </div>
          <div class="preview-row">
            <div class="preview-label">Áp dụng từ:</div>
            <div class="preview-value">${formatDateDisplay(preview.startDate)}</div>
          </div>
          <div class="preview-row">
            <div class="preview-label">Đến ngày:</div>
            <div class="preview-value">${formatDateDisplay(preview.endDate)}</div>
          </div>
          <div class="preview-row">
            <div class="preview-label">Người tạo:</div>
            <div class="preview-value">${preview.userEmail}</div>
          </div>
        </div>
      </div>
      
      <div class="preview-section fade-in-section" style="animation-delay: 0.1s">
        <div class="preview-header">
          <i class="fas fa-users"></i>
          <h4>Khách hàng (${preview.buyers.length})</h4>
        </div>
        <div class="preview-info">
          <div class="preview-row">
            <div class="preview-label">Buyer ID gộp:</div>
            <div class="preview-value buyer-ids">${buyerIds}</div>
          </div>
          <table class="preview-table">
            <thead>
              <tr>
                <th>Buyer ID</th>
              </tr>
            </thead>
            <tbody>
    `;
    
    // Thêm các buyers
    preview.buyers.forEach(buyer => {
      previewHTML += `
        <tr>
          <td>${buyer.buyerId}</td>
        </tr>
      `;
    });
    
    previewHTML += `
            </tbody>
          </table>
        </div>
      </div>
      
      <div class="preview-section fade-in-section" style="animation-delay: 0.2s">
        <div class="preview-header">
          <i class="fas fa-tags"></i>
          <h4>Sản phẩm (${preview.products.length})</h4>
        </div>
        <div class="preview-info">
          <table class="preview-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Giá đặc biệt</th>
              </tr>
            </thead>
            <tbody>
    `;
    
    // Thêm các products với tô đỏ các lỗi
    preview.products.forEach(product => {
      // Kiểm tra lỗi SKU
      const isErrorSku = (
        this.data.errorSkus && (
          this.data.errorSkus.duplicate.includes(product.sku) ||
          this.data.errorSkus.lowPrice.includes(product.sku) ||
          this.data.errorSkus.noPrice.includes(product.sku) ||
          this.data.errorSkus.nonNumericPrice.includes(product.sku) ||
          this.data.errorSkus.highPrice.includes(product.sku)
        )
      );
      
      // Xác định loại lỗi để hiển thị tooltip
      let errorTooltip = '';
      if (this.data.errorSkus) {
        if (this.data.errorSkus.duplicate.includes(product.sku)) {
          errorTooltip = 'SKU trùng lặp';
        } else if (this.data.errorSkus.lowPrice.includes(product.sku)) {
          errorTooltip = `Giá thấp hơn ${CONFIG.APP.MIN_PRICE.toLocaleString('vi-VN')} VNĐ`;
        } else if (this.data.errorSkus.noPrice.includes(product.sku)) {
          errorTooltip = 'Thiếu giá';
        } else if (this.data.errorSkus.nonNumericPrice.includes(product.sku)) {
          errorTooltip = 'Giá không phải số';
        } else if (this.data.errorSkus.highPrice.includes(product.sku)) {
          errorTooltip = 'Giá cao (trên 1 triệu)';
        }
      }
      
      // Tạo các class CSS tùy theo loại lỗi
      const skuClass = isErrorSku ? 'error-sku' : '';
      const priceClass = (this.data.errorSkus && 
        (this.data.errorSkus.lowPrice.includes(product.sku) || 
         this.data.errorSkus.highPrice.includes(product.sku))) 
        ? 'error-price' : '';
      
      // Thêm icon và tooltip nếu có lỗi
      const errorIcon = isErrorSku ? `<i class="fas fa-exclamation-circle error-icon" title="${errorTooltip}"></i>` : '';
      
      previewHTML += `
        <tr class="${isErrorSku ? 'error-row' : ''}">
          <td class="${skuClass}">${product.sku} ${errorIcon}</td>
          <td class="right-align ${priceClass}">${product.specialPrice.toLocaleString('vi-VN')} VNĐ</td>
        </tr>
      `;
    });
    
    previewHTML += `
            </tbody>
          </table>
        </div>
      </div>
      
       <div class="preview-section fade-in-section" style="animation-delay: 0.3s">
    <div class="preview-header">
      <i class="fas fa-table"></i>
      <h4>Dữ liệu sẽ được ghi vào bảng</h4>
    </div>
    <div class="preview-info">
      <table class="preview-table">
        <thead>
          <tr>
            <th>Request No</th>
            <th>CUSTOMER_ID</th>
            <th>Loại Giá</th>
            <th>Loại giá theo VAT</th>
            <th>SKU_CODE</th>
            <th>SPECIAL_PRICE</th>
            <th>Áp dụng Từ</th>
            <th>Đến</th>
          </tr>
        </thead>
        <tbody>
`;
    
    // Thêm các dòng theo định dạng mới, LUÔN HIỂN THỊ "Giá Trước VAT"
    preview.products.forEach(product => {
      // Kiểm tra lỗi SKU
      const isErrorSku = (
        this.data.errorSkus && (
          this.data.errorSkus.duplicate.includes(product.sku) ||
          this.data.errorSkus.lowPrice.includes(product.sku) ||
          this.data.errorSkus.noPrice.includes(product.sku) ||
          this.data.errorSkus.nonNumericPrice.includes(product.sku) ||
          this.data.errorSkus.highPrice.includes(product.sku)
        )
      );
      
      // Xác định class CSS tùy theo loại lỗi
      const skuClass = isErrorSku ? 'error-sku' : '';
      const priceClass = (this.data.errorSkus && 
        (this.data.errorSkus.lowPrice.includes(product.sku) || 
         this.data.errorSkus.highPrice.includes(product.sku))) 
        ? 'error-price' : '';
        
      previewHTML += `
        <tr class="${isErrorSku ? 'error-row' : ''}">
          <td>${this.data.requestNo}</td>
          <td>${buyerIds}</td>
          <td>${preview.priceType}</td>
          <td style="color: #6f42c1; font-weight: bold;">Giá Trước VAT</td>
          <td class="${skuClass}">${product.sku}</td>
          <td class="right-align ${priceClass}">${product.specialPrice.toLocaleString('vi-VN')}</td>
          <td>${formatDateDisplay(preview.startDate)}</td>
          <td>${formatDateDisplay(preview.endDate)}</td>
        </tr>
      `;
    });
    
    previewHTML += `
            </tbody>
          </table>
        </div>
      </div>
      
      <div class="preview-section fade-in-section" style="animation-delay: 0.4s">
        <div class="preview-header">
          <i class="fas fa-info-circle"></i>
          <h4>Ghi chú</h4>
        </div>
        <div class="preview-info">
          <div class="preview-note">
            <p>- Các dòng tô đỏ là dữ liệu có lỗi cần kiểm tra lại.</p>
            <p>- Vui lòng kiểm tra kỹ thông tin trước khi gửi.</p>
            <p>- <strong style="color: #6f42c1;">Loại giá theo VAT:</strong> Giá Trước VAT</p>
          </div>
        </div>
      </div>
    `;
    
    // Hiển thị dữ liệu
    previewContent.innerHTML = previewHTML;
    
    // Cuộn đến phần preview
    setTimeout(() => {
      previewContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    
    // Hiệu ứng nhấp nháy cho các dòng lỗi
    const errorRows = previewContent.querySelectorAll('.error-row');
    errorRows.forEach(row => {
      row.classList.add('highlight-error');
      setTimeout(() => {
        row.classList.remove('highlight-error');
      }, 1500);
    });
  },

  submitData: function() {
    // Kiểm tra xem đã preview chưa
    if (!this.data.preview) {
      this.showResultMessage('Vui lòng xem trước dữ liệu trước khi gửi', 'error');
      return;
    }
    
    // Kiểm tra kết nối mạng
    if (!navigator.onLine) {
      this.showResultMessage('Không có kết nối mạng. Vui lòng kiểm tra lại kết nối của bạn trước khi gửi dữ liệu.', 'error');
      return;
    }
    
    // Kiểm tra phiên đăng nhập
    const sessionData = localStorage.getItem('kmr_auth_session');
    if (!sessionData) {
      this.showResultMessage('Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.', 'error');
      setTimeout(() => {
        this.redirectToAuth();
      }, 2000);
      return;
    }
    
    // RESET flag Slack notification
    this.data.slackNotificationSent = false;
    
    // Vô hiệu hóa nút gửi để tránh nhấn nhiều lần
    const submitButton = document.getElementById('submitButton');
    if (submitButton) {
      submitButton.disabled = true;
    }
    
    // Hiển thị loading với hiệu ứng đặc biệt cho gửi dữ liệu
    showLoading('📦 Đang gửi dữ liệu...', 20);
    
    // Ẩn các nút điều khiển và thông báo lỗi
    document.getElementById('result').style.display = 'none';
    
    // Chuẩn bị dữ liệu để gửi
    setTimeout(() => {
      updateLoadingProgress(40, '📦 Đang chuẩn bị dữ liệu...');
      const formData = this.prepareFormData();
      
      updateLoadingProgress(60, '📡 Đang gửi dữ liệu lên hệ thống...');
      
      // Gọi API để gửi dữ liệu
      this.sendDataToSheet(formData);
    }, 300);
  },
  
  // Gửi dữ liệu đến Google Sheet
  sendDataToSheet: function(formData) {
    updateLoadingProgress(80, '📨 Đang tải dữ liệu lên hệ thống...');
    if (!formData) {
      this.showResultMessage('Không có dữ liệu để gửi', 'error');
      hideLoading(); // Ensure loading is hidden if there's an error
      return;
    }
    
    try {
      // URL của Google Apps Script Web App
      const apiUrl = CONFIG.APISPECIALPRICE_URL || "https://script.google.com/macros/s/AKfycbwYHcoJbot0sFLQUYSL8fIHlDFkEPc5ATixVipRTzWiu6EBe0-ML1CuTSNxsgxjN8KE/exec";
      
      console.log("Chuẩn bị gửi dữ liệu đến:", apiUrl);
      console.log("🔥 DỮ LIỆU CHI TIẾT:", JSON.stringify(formData, null, 2));
      // console.log("Dữ liệu gửi:", formData);
      
      // Make sure loading is visible with proper message
      showLoading('Đang gửi dữ liệu...', 50);
      
      // Tạo form ẩn để gửi dữ liệu (tránh CORS)
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = apiUrl;
      form.target = 'hidden_iframe';
      
      // Thêm các field
      form.appendChild(this.createHiddenField('action', 'saveData'));
      form.appendChild(this.createHiddenField('sheetId', formData.sheetId));
      form.appendChild(this.createHiddenField('sheetName', formData.sheetName));
      form.appendChild(this.createHiddenField('teamId', formData.teamId));
      form.appendChild(this.createHiddenField('requestNo', formData.requestNo));
      form.appendChild(this.createHiddenField('userEmail', formData.userEmail));
      form.appendChild(this.createHiddenField('rowsData', JSON.stringify(formData.rowsData)));
      
      // Thêm flag để tạo sheet TraceLog nếu cần
      form.appendChild(this.createHiddenField('createTraceLog', 'true'));
      
      // Tạo một timestamp để theo dõi lần submit này
      const submitTimestamp = Date.now();
      
      // Đặt thời gian chờ để xử lý trường hợp không nhận được phản hồi
      setTimeout(() => {
        console.log("Kiểm tra timeout, timestamp:", submitTimestamp);
        
        // Kiểm tra xem overlay có hiển thị không để xác định chưa nhận phản hồi
        const overlay = document.getElementById('loading-overlay');
        if (overlay && overlay.style.display === 'flex') {
          // Giả định thành công nếu không nhận được phản hồi sau 10 giây
          hideLoading(); // Ẩn loading indicator
          
          this.handleSubmitResponse({
            success: true,
            message: "Dữ liệu đã được gửi thành công (không nhận được phản hồi từ server sau 10 giây)"
          });
        }
      }, 20000); // Sửa thành 20000 ngày 06/11/2025
      
      // Hiển thị cập nhật tiến trình
      updateLoadingProgress(70, '🚀 Đang gửi dữ liệu...');
      
      // Thêm vào trang và gửi
      document.body.appendChild(form);
      console.log("Đang submit form...");
      form.submit();
      
      // Xóa form sau khi gửi
      setTimeout(() => {
        document.body.removeChild(form);
      }, 500);
      
    } catch (error) {
      console.error('Lỗi khi gửi dữ liệu:', error);
      hideLoading(); // Ensure loading is hidden on error
      
      this.showResultMessage(`Lỗi khi gửi dữ liệu: ${error.message}`, 'error');
      // Khôi phục trạng thái nút gửi
      const submitButton = document.getElementById('submitButton');
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-paper-plane btn-icon"></i> Gửi dữ liệu';
        submitButton.classList.remove('sending');
      }
      // Hiển thị lại các nút
      document.getElementById('buttonContainer').style.display = 'flex';
    }
  },
  
  // Tạo field ẩn cho form
  createHiddenField: function(name, value) {
    const field = document.createElement('input');
    field.type = 'hidden';
    field.name = name;
    field.value = value;
    return field;
  },
  
  // Xử lý phản hồi từ form submit - ĐÃ SỬA LỖI SLACK DUPLICATE
  handleSubmitResponse: function(response) {
    // Hiển thị lại các nút
    document.getElementById('buttonContainer').style.display = 'flex';
    
    console.log('Phản hồi từ server:', response);
    
    if (response.success) {
      updateLoadingProgress(90, '✅ Dữ liệu đã được gửi thành công!');

      // QUAN TRỌNG: Lưu lại thông tin cần thiết TRƯỚC KHI RESET
      const savedRequestNo = this.data.requestNo;
      const savedPreview = JSON.parse(JSON.stringify(this.data.preview)); // Deep copy để tránh reference
      const savedTeamInfo = JSON.parse(JSON.stringify(this.data.teamInfo)); // Deep copy
      const savedUserEmail = this.data.userEmail;

      console.log('Đã lưu dữ liệu trước khi reset:', {
        requestNo: savedRequestNo,
        preview: savedPreview,
        teamInfo: savedTeamInfo
      });

      // KIỂM TRA VÀ GỬI SLACK NOTIFICATION CHỈ MỘT LẦN
      if (!this.data.slackNotificationSent) {
        console.log('Gửi Slack notification lần đầu tiên');
        this.data.slackNotificationSent = true;
        this.sendSlackNotification();
      } else {
        console.log('Slack notification đã được gửi rồi, bỏ qua');
      }

      showSuccessMessage(
        'Gửi dữ liệu thành công!',
        `
        <p>Yêu cầu của bạn đã được gửi thành công với thông tin sau:</p>
        <div style="text-align: left; margin: 10px 0; padding: 10px; background: #f0f9ff; border-radius: 4px;">
          <p><strong>Request No:</strong> ${savedRequestNo}</p>
          <p><strong>Khách hàng:</strong> ${savedPreview ? savedPreview.buyers.length : 0} khách hàng</p>
          <p><strong>Sản phẩm:</strong> ${savedPreview ? savedPreview.products.length : 0} sản phẩm</p>
        </div>
        <p class="success-note">Dữ liệu đã được ghi vào Google Sheet và thông báo đã được gửi đến team.</p>
        `,
        [
          {
            id: 'view-sheet-btn',
            text: 'Xem Google Sheet',
            icon: 'fas fa-table',
            primary: false,
            keepOpen: true,
            onClick: () => {
              window.open(this.data.sheetInfo ? this.data.sheetInfo.sheet_url : CONFIG.DEFAULT_SHEET_URL, '_blank');
            }
          },
          {
            id: 'new-request-btn', 
            text: 'Tạo yêu cầu mới',
            icon: 'fas fa-plus-circle',
            primary: false,
            keepOpen: false,
            onClick: () => {
              location.reload();
            }
          },
          {
            id: 'send-email-btn',
            text: 'Gửi Email',
            icon: 'fas fa-envelope', 
            primary: true,
            keepOpen: true,
            onClick: () => {
              console.log('Nút Gửi Email được click, sử dụng dữ liệu đã lưu');
              this.handleSendEmailWithData(savedRequestNo, savedPreview, savedTeamInfo, savedUserEmail);
            }
          }
        ]
      );
      
      // QUAN TRỌNG: Setup auto-reset khi dialog đóng
      this.setupDialogAutoReset();
    } else {
      // Xử lý lỗi - Reset trạng thái nút gửi
      this.resetSubmitButtonState();
      
      let errorMessage = 'Lỗi: ' + (response.message || response.error || 'Không thể gửi dữ liệu');
      
      if (response.slackError) {
        errorMessage += '\n\nThông báo Slack không được gửi: ' + response.slackError;
      }
      
      if (response.details) {
        errorMessage += '\n\nChi tiết: ' + response.details;
      }
      
      this.showResultMessage(errorMessage, 'error');
    }
    
    // Ẩn loading
    setTimeout(() => {
      hideLoading();
    }, 500);
  },

  // Gửi thông báo đến Slack - THÊM KIỂM TRA DUPLICATE
// Gửi thông báo đến Slack - VERSION ĐÃ SỬA ĐỂ GỬI TRỰC TIẾP
  sendSlackNotification: function() {
  try {
    // KIỂM TRA ĐÃ GỬI SLACK CHƯA
    if (this.data.slackNotificationSent) {
      console.log('Slack notification đã được gửi trước đó, bỏ qua');
      return;
    }

    // Kiểm tra dữ liệu cần thiết
    if (!this.data.preview || !this.data.requestNo || !this.data.teamInfo) {
      console.error('Thiếu thông tin cần thiết để gửi thông báo Slack');
      return;
    }
    
    // Kiểm tra CONFIG có webhook URL không
    if (!CONFIG || !CONFIG.SLACK || !CONFIG.SLACK.WEBHOOK_URL) {
      console.error('Không tìm thấy Slack webhook URL trong CONFIG');
      return;
    }
    
    // ĐÁNH DẤU ĐÃ GỬI NGAY KHI BẮT ĐẦU
    this.data.slackNotificationSent = true;
    
    // Format date để hiển thị
    const formatDateDisplay = (dateStr) => {
      const date = new Date(dateStr);
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };
    
    // Tạo message cho Slack với VAT info - LUÔN LÀ "Giá Trước VAT"
    const message = {
      text: `🔔 *Special Price Request* - ${this.data.requestNo}`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `🔔 Special Price Request - ${this.data.requestNo}`
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Team:*\n${this.data.teamInfo.name}`
            },
            {
              type: "mrkdwn",
              text: `*PIC:*\n${this.data.userEmail}`
            },
            {
              type: "mrkdwn",
              text: `*Buyer Count:*\n${this.data.preview.buyers.length} khách hàng`
            },
            {
              type: "mrkdwn",
              text: `*SKU Count:*\n${this.data.preview.products.length} sản phẩm`
            },
            {
              type: "mrkdwn",
              text: `*Price Type:*\n${this.data.preview.priceType}`
            },
            {
              type: "mrkdwn",
              text: `*VAT Type:*\nGiá Trước VAT`
            },
            {
              type: "mrkdwn",
              text: `*Duration:*\n${formatDateDisplay(this.data.preview.startDate)} - ${formatDateDisplay(this.data.preview.endDate)}`
            }
          ]
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Buyer IDs:* ${this.formatBuyerIdsString(this.data.preview.buyers)}`
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Google Sheet:* <${this.data.sheetInfo.sheet_url}|View Sheet>`
          }
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `Submitted at ${this.formatTimestamp()}`
            }
          ]
        }
      ]
    };
    
    console.log('Đang gửi Slack notification với VAT info:', message);
    
    // Gửi đến Slack webhook
    fetch(CONFIG.SLACK.WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message)
    })
    .then(response => {
      console.log('Slack response status:', response.status);
      if (response.ok) {
        console.log('✅ Slack notification sent successfully');
      } else {
        console.error('❌ Failed to send Slack notification:', response.status, response.statusText);
        this.data.slackNotificationSent = false;
      }
      return response.text();
    })
    .then(data => {
      console.log('Slack response data:', data);
    })
    .catch(error => {
      console.error('❌ Error sending Slack notification:', error);
      this.data.slackNotificationSent = false;
    });
      
  } catch (error) {
    console.error('❌ Error in sendSlackNotification:', error);
    this.data.slackNotificationSent = false;
  }
},
  
  // Chuẩn bị dữ liệu cho form với định dạng mới - LUÔN LÀ "Giá Trước VAT"
  // Trong webapp.js - Hàm prepareFormData
prepareFormData: function() {
  const preview = this.data.preview;
  
  if (!preview) return null;
  
  const formatDateForSheet = (dateStr) => {
    const date = new Date(dateStr);
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
  };
  
  const timestamp = this.formatTimestamp();
  
  // UPDATED - Sử dụng formatBuyerIdsString (giữ nguyên tên hàm nhưng nó sẽ trả về Customer IDs)
  const customerIdsString = this.formatBuyerIdsString(preview.buyers);
  
  // UPDATED - Tạo rowsData với tên cột mới
  const rowsData = [];
  
  preview.products.forEach(product => {
    rowsData.push({
      'Request No': this.data.requestNo,
      'CUSTOMER_ID': customerIdsString,        // UPDATED - Đổi từ 'Buyer ID'
      'Loại Giá': preview.priceType,
      'Loại giá theo VAT': 'Giá Trước VAT',
      'SKU_CODE': product.sku,                 // UPDATED - Đổi từ 'SKU'
      'SPECIAL_PRICE': product.specialPrice,   // UPDATED - Đổi từ 'Special Price'
      'Áp dụng Từ': formatDateForSheet(preview.startDate),
      'Đến': formatDateForSheet(preview.endDate),
      'Timestamp': timestamp,
      'PIC': preview.userEmail
    });
  });
  
  return {
    sheetId: this.data.sheetInfo.sheet_id,
    sheetName: this.data.sheetInfo.sheet_name,
    teamId: this.data.teamId,
    requestNo: this.data.requestNo,
    userEmail: this.data.userEmail,
    rowsData: rowsData
  };
},

  // THÊM HÀM MỚI: Setup auto-reset khi dialog đóng
  setupDialogAutoReset: function() {
    // Sử dụng MutationObserver để theo dõi khi dialog bị xóa khỏi DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((node) => {
          // Kiểm tra nếu node bị xóa là success dialog
          if (node.nodeType === Node.ELEMENT_NODE && 
              node.classList && 
              node.classList.contains('success-dialog')) {
            
            console.log('Success dialog đã bị đóng, tự động reset để sẵn sàng cho lần tiếp theo');
            
            // Auto-reset trạng thái để có thể tiếp tục sử dụng
            this.autoResetAfterSuccess();
            
            // Dừng observer
            observer.disconnect();
          }
        });
      });
    });
    
    // Bắt đầu observe
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  },

  // THÊM HÀM MỚI: Auto-reset sau khi thành công (không reload trang)
  autoResetAfterSuccess: function() {
    console.log('Auto-reset sau khi đóng dialog thành công');
    
    // Reset form data
    document.getElementById('buyerPasteArea').value = '';
    document.getElementById('skuPasteArea').value = '';
    
    // BỎ resetVatSelection vì không cần thiết nữa
    // if (this.resetVatSelection) {
    //   this.resetVatSelection();
    // }

    // Reset preview data
    this.data.preview = null;
    this.data.requestNo = null;
    this.data.highPriceConfirmed = false;
    this.data.form.vatType = 'before'; // MẶC ĐỊNH 'before'
    
    // RESET SLACK NOTIFICATION FLAG
    this.data.slackNotificationSent = false;
    
    // Reset error data
    this.data.errorSkus = {
      duplicate: [],
      lowPrice: [],
      noPrice: [],
      nonNumericPrice: [],
      highPrice: [],
      veryHighPrice: []
    };
    
    // Ẩn preview container
    const previewContainer = document.getElementById('previewContainer');
    if (previewContainer) {
      previewContainer.style.display = 'none';
    }
    
    // Reset trạng thái nút gửi
    this.resetSubmitButtonState();
    
    // Clear bất kỳ thông báo lỗi nào
    this.showResultMessage('', 'clear');
    
    // Reset giá trị mặc định cho form
    this.setDefaultValues();
    
    // Chuyển về tab input
    const inputTab = document.querySelector('.nav-tab[data-section="input"]');
    if (inputTab) {
      inputTab.click();
    }
    
    // Hiển thị thông báo nhẹ nhàng
    setTimeout(() => {
      this.showResultMessage('✨ Sẵn sàng cho yêu cầu mới! Bạn có thể nhập dữ liệu ngay.', 'success');
      
      // Focus vào textarea đầu tiên
      const buyerTextArea = document.getElementById('buyerPasteArea');
      if (buyerTextArea) {
        buyerTextArea.focus();
      }
    }, 500);
  },

  // THÊM HÀM MỚI: Reset trạng thái nút gửi
  resetSubmitButtonState: function() {
    const submitButton = document.getElementById('submitButton');
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerHTML = '<i class="fas fa-paper-plane btn-icon"></i> Gửi dữ liệu';
      submitButton.classList.remove('sending');
    }
    
    // Hiển thị lại các nút
    const buttonContainer = document.getElementById('buttonContainer');
    if (buttonContainer) {
      buttonContainer.style.display = 'flex';
    }
  },
  // THÊM HÀM MỚI: Kiểm tra xem team hiện tại có cần validate bội số 500 không
  shouldValidatePriceMultiple: function() {
    // Danh sách các team KHÔNG cần kiểm tra bội số 500
    const exemptTeams = ['ka_mt_hcm','ka_mt_hn','ka_hotel_hcm','ka_fc_hcm', 'ka_fc_hn'];
    
    // Kiểm tra team hiện tại
    const currentTeamId = this.data.teamId;
    
    if (!currentTeamId) {
      // Nếu không xác định được team, mặc định là validate
      console.warn('Không xác định được team ID, mặc định validate bội số 100');
      return true;
    }
    
    // Nếu team nằm trong danh sách exempt, không validate
    if (exemptTeams.includes(currentTeamId)) {
      console.log(`Team ${currentTeamId} được miễn kiểm tra bội số 100`);
      return false;
    }
    
    // Các team khác phải validate
    console.log(`Team ${currentTeamId} cần kiểm tra bội số 100`);
    return true;
  }
};


// Khởi tạo WebAppManager khi trang đã tải xong
document.addEventListener('DOMContentLoaded', function() {
  WebAppManager.init();
});