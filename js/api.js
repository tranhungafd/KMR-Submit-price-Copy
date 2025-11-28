// api.js - Xử lý các tác vụ lấy dữ liệu

const API = {
  // Lấy thông tin các teams trong khu vực
  getTeamsByRegion: function(regionId) {
    return new Promise((resolve, reject) => {
      // Kiểm tra nếu regionId hợp lệ
      if (CONFIG.REGIONS[regionId]) {
        // Trả về thông tin khu vực (không bao gồm emails và thông tin sheet)
        const region = {
          name: CONFIG.REGIONS[regionId].name,
          teams: CONFIG.REGIONS[regionId].teams.map(team => ({
            id: team.id,
            name: team.name,
            icon: team.icon,
            description: team.description
          }))
        };
        
        // Giả lập độ trễ mạng
        setTimeout(() => {
          resolve(region);
        }, 500);
      } else {
        reject(new Error('Không tìm thấy thông tin khu vực'));
      }
    });
  },

  // Lấy thông tin của một team
  getTeamInfo: function(teamId) {
    return new Promise((resolve, reject) => {
      // Tìm team dựa trên ID
      for (const regionId in CONFIG.REGIONS) {
        const region = CONFIG.REGIONS[regionId];
        for (const team of region.teams) {
          if (team.id === teamId) {
            const teamInfo = {
              id: team.id,
              name: team.name,
              icon: team.icon,
              description: team.description,
              region: regionId
            };
            
            setTimeout(() => {
              resolve(teamInfo);
            }, 300);
            return;
          }
        }
      }
      
      reject(new Error('Không tìm thấy thông tin team'));
    });
  },

  // Kiểm tra quyền truy cập của email vào team
  checkTeamAccess: function(teamId, email) {
    return new Promise((resolve, reject) => {
      // Nếu là admin, luôn cho phép truy cập
      if (CONFIG.ADMINS.includes(email)) {
        resolve({
          success: true,
          url: `webapp.html?team=${teamId}&email=${encodeURIComponent(email)}`
        });
        return;
      }
      
      // Tìm team và kiểm tra quyền
      let foundTeam = null;
      let userTeams = []; // Mảng các team mà user có quyền
      
      for (const regionId in CONFIG.REGIONS) {
        const region = CONFIG.REGIONS[regionId];
        
        for (const team of region.teams) {
          // Loại bỏ email trùng lặp trong cùng team
          if (team.emails) {
            team.emails = [...new Set(team.emails)];
          }
          
          // Ghi nhận team đang kiểm tra
          if (team.id === teamId) {
            foundTeam = team;
          }
          
          // Kiểm tra xem email thuộc team nào
          if (team.emails && team.emails.includes(email)) {
            userTeams.push(team);
          }
        }
      }
      
      // Xử lý kết quả
      if (!foundTeam) {
        reject(new Error('Không tìm thấy thông tin team'));
      } else if (userTeams.length === 0) {
        resolve({
          success: false,
          message: 'Bạn không thuộc team Sales nên không có quyền truy cập. Vui lòng liên hệ Admin.'
        });
      } else {
        // Kiểm tra xem team được yêu cầu có nằm trong danh sách team mà user có quyền không
        const hasTeamAccess = userTeams.some(team => team.id === teamId);
        
        if (hasTeamAccess) {
          // Email thuộc đúng team yêu cầu
          resolve({
            success: true,
            url: `webapp.html?team=${teamId}&email=${encodeURIComponent(email)}`
          });
        } else {
          // Email thuộc team khác
          const teamNames = userTeams.map(t => t.name).join(', ');
          resolve({
            success: false,
            message: `Bạn không thuộc ${foundTeam.name}. Bạn chỉ có quyền truy cập vào: ${teamNames}.`
          });
        }
      }
    });
  },

  // Lấy thông tin Google Sheet của team
  getTeamSheetInfo: function(teamId) {
    return new Promise((resolve, reject) => {
      // Tìm team dựa trên ID
      for (const regionId in CONFIG.REGIONS) {
        const region = CONFIG.REGIONS[regionId];
        
        for (const team of region.teams) {
          if (team.id === teamId) {
            // Kiểm tra nếu có thông tin sheet
            if (team.sheet_id) {
              const sheetInfo = {
                sheet_id: team.sheet_id,
                sheet_name: team.sheet_name || 'Sheet1',
                sheet_url: `https://docs.google.com/spreadsheets/d/${team.sheet_id}/edit#gid=0`
              };
              
              resolve(sheetInfo);
              return;
            }
          }
        }
      }
      
      // Nếu không tìm thấy, trả về sheet mặc định
      resolve({
        sheet_id: CONFIG.DEFAULT_SHEET_ID,
        sheet_name: CONFIG.DEFAULT_SHEET_NAME,
        sheet_url: CONFIG.DEFAULT_SHEET_URL
      });
    });
  },

  // Lấy tất cả các team mà user có quyền truy cập
  getUserAccessibleTeams: function(email) {
    return new Promise((resolve, reject) => {
      // Kiểm tra xem email có hợp lệ không
      if (!email) {
        reject(new Error('Email không được để trống'));
        return;
      }
      
      const accessibleTeams = [];
      const isAdmin = CONFIG.ADMINS.includes(email);
      
      // Duyệt qua tất cả các khu vực và teams
      for (const regionId in CONFIG.REGIONS) {
        const region = CONFIG.REGIONS[regionId];
        
        for (const team of region.teams) {
          // Loại bỏ email trùng lặp trong cùng team
          if (team.emails) {
            team.emails = [...new Set(team.emails)];
          }
          
          // Nếu là admin hoặc email có trong danh sách emails của team
          if (isAdmin || (team.emails && team.emails.includes(email))) {
            accessibleTeams.push({
              id: team.id,
              name: team.name,
              region: regionId,
              regionName: region.name
            });
          }
        }
      }
      
      resolve({
        teams: accessibleTeams,
        isAdmin: isAdmin
      });
    });
  },

  // Gửi dữ liệu đến Google Sheet - Using fetch instead of iframe
  sendDataToSheet: function(formData) {
    return new Promise((resolve, reject) => {
      try {
        if (!formData) {
          reject(new Error('Không có dữ liệu để gửi'));
          return;
        }

        console.log("Chuẩn bị gửi dữ liệu đến API:", CONFIG.APISPECIALPRICE_URL);
        
        // Prepare the form data
        const formDataObj = new FormData();
        formDataObj.append('action', 'saveData');
        formDataObj.append('sheetId', formData.sheetId);
        formDataObj.append('sheetName', formData.sheetName);
        formDataObj.append('teamId', formData.teamId);
        formDataObj.append('requestNo', formData.requestNo);
        formDataObj.append('userEmail', formData.userEmail);
        formDataObj.append('rowsData', JSON.stringify(formData.rowsData));
        formDataObj.append('createTraceLog', 'true');
        
        console.log("Sending data with fetch...");
        
        // Use fetch API with no-cors mode to bypass CORS issues
        fetch(CONFIG.APISPECIALPRICE_URL, {
          method: 'POST',
          mode: 'no-cors', // Important for cross-origin requests
          cache: 'no-cache',
          body: formDataObj
        })
        .then(response => {
          console.log("Response received:", response);
          
          // With no-cors mode, we can't read the response, so we assume success
          // Set a timeout to check Google Sheet for confirmation
          setTimeout(() => {
            resolve({
              success: true,
              message: "Dữ liệu đã được gửi thành công. Vui lòng kiểm tra Google Sheet để xác nhận.",
              assumedSuccess: true // Flag that we're assuming success
            });
          }, 2000);
        })
        .catch(error => {
          console.error("Error in fetch:", error);
          reject(error);
        });

      } catch (error) {
        console.error("Error in sendDataToSheet:", error);
        reject(error);
      }
    });
  },

  // Tạo hidden field cho form
  createHiddenField: function(name, value) {
    const field = document.createElement('input');
    field.type = 'hidden';
    field.name = name;
    field.value = value;
    return field;
  },

  // Gửi thông báo Slack - UPDATED to use fetch API
  sendSlackNotification: function(slackInfo) {
    return new Promise((resolve, reject) => {
      try {
        console.log("Chuẩn bị gửi thông báo Slack:", slackInfo);
        
        // Use the fetch API method
        this.sendSlackViaFetch(slackInfo)
          .then(resolve)
          .catch(reject);
      } catch (error) {
        console.error("Error in sendSlackNotification:", error);
        reject(error);
      }
    });
  },
  
  // Gửi thông báo Slack thông qua fetch API
  sendSlackViaFetch: function(slackInfo) {
    return new Promise((resolve, reject) => {
      try {
        // URL của Google Apps Script Web App
        const apiUrl = CONFIG.APISPECIALPRICE_URL;
        
        console.log("Sending Slack notification via fetch to:", apiUrl);
        
        // Prepare form data
        const formData = new FormData();
        formData.append('action', 'sendSlack');
        formData.append('slackInfo', JSON.stringify(slackInfo));
        
        // Use fetch API with no-cors mode
        fetch(apiUrl, {
          method: 'POST',
          mode: 'no-cors',
          cache: 'no-cache',
          body: formData
        })
        .then(response => {
          console.log("Slack notification response:", response);
          
          // Due to no-cors mode, we can't read the response
          // So we assume it's successful
          resolve({
            success: true,
            message: 'Đã gửi thông báo Slack thành công',
            assumedSuccess: true
          });
        })
        .catch(error => {
          console.error("Error sending Slack notification:", error);
          reject(error);
        });
      } catch (error) {
        console.error("Error in sendSlackViaFetch:", error);
        reject(error);
      }
    });
  },

  // Lấy danh sách email từ Google Sheet chung
  getTeamEmailsFromMasterSheet: function(teamId) {
    return new Promise((resolve, reject) => {
      try {
        // Kiểm tra tham số
        if (!teamId) {
          reject(new Error('Team ID là bắt buộc'));
          return;
        }
        
        // Sử dụng sheet chung từ config
        const sheetId = CONFIG.MASTER_AUTH_SHEET_ID;
        
        if (!sheetId) {
          console.error('MASTER_AUTH_SHEET_ID không được định nghĩa trong config.js');
          reject(new Error('MASTER_AUTH_SHEET_ID không tìm thấy'));
          return;
        }
        
        // Tạo URL để gọi API
        const apiUrl = `${CONFIG.SCRIPT_URL}?action=getTeamEmails&sheetId=${sheetId}&teamId=${teamId}`;
        
        console.log('Đang gọi API lấy danh sách email cho team', teamId);
        
        // Gửi request
        fetch(apiUrl)
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok: ' + response.status);
            }
            return response.json();
          })
          .then(data => {
            if (data.success) {
              console.log(`Đã lấy ${data.emails.length} email cho team ${teamId}`);
              resolve(data.emails || []);
            } else {
              console.error('Lỗi từ API:', data.message);
              throw new Error(data.message || 'Không thể lấy danh sách email');
            }
          })
          .catch(error => {
            console.error('Lỗi khi lấy email từ sheet:', error);
            
            // Fallback: Sử dụng email trong config nếu có
            console.log('Dùng fallback: Email từ config');
            this.getTeamEmailsFromConfig(teamId)
              .then(resolve)
              .catch(reject);
          });
      } catch (error) {
        console.error('Lỗi trong getTeamEmailsFromMasterSheet:', error);
        
        // Fallback
        this.getTeamEmailsFromConfig(teamId)
          .then(resolve)
          .catch(reject);
      }
    });
  },

  // Lấy email từ config (fallback)
  getTeamEmailsFromConfig: function(teamId) {
    return new Promise((resolve, reject) => {
      // Tìm team trong config
      for (const regionId in CONFIG.REGIONS) {
        const region = CONFIG.REGIONS[regionId];
        
        for (const team of region.teams) {
          if (team.id === teamId) {
            if (team.emails && Array.isArray(team.emails) && team.emails.length > 0) {
              // Trả về bản sao của mảng emails
              resolve([...team.emails]);
              return;
            }
            break;
          }
        }
      }
      
      // Không tìm thấy emails
      reject(new Error(`Không tìm thấy email cho team ${teamId} trong config`));
    });
  },

  // Hàm chính để lấy danh sách email (thay thế hàm cũ nếu có)
  getTeamEmails: function(teamId) {
    return this.getTeamEmailsFromMasterSheet(teamId)
      .catch(error => {
        console.error('Lỗi khi lấy email từ master sheet:', error);
        return this.getTeamEmailsFromConfig(teamId);
      });
  },

  // Lấy tất cả team mà user có quyền truy cập
  getUserAccessibleTeamsFromSheet: function(email) {
    return new Promise(async (resolve, reject) => {
      try {
        // Kiểm tra nếu là admin
        const isAdmin = CONFIG.ADMINS.includes(email);
        
        // Chuẩn bị kết quả
        const result = {
          teams: [],
          isAdmin: isAdmin
        };
        
        // Nếu là admin, cấp quyền tất cả team
        if (isAdmin) {
          // Duyệt qua tất cả team
          for (const regionId in CONFIG.REGIONS) {
            const region = CONFIG.REGIONS[regionId];
            
            for (const team of region.teams) {
              result.teams.push({
                id: team.id,
                name: team.name,
                icon: team.icon || '👥',
                description: team.description || '',
                region: regionId,
                regionName: region.name,
                sheet_id: team.sheet_id,
                sheet_name: team.sheet_name || 'Sheet1'
              });
            }
          }
          
          resolve(result);
          return;
        }
        
        // Đối với người dùng thường, kiểm tra từng team
        const checkPromises = [];
        
        // Duyệt qua tất cả team
        for (const regionId in CONFIG.REGIONS) {
          const region = CONFIG.REGIONS[regionId];
          
          for (const team of region.teams) {
            // Tạo promise kiểm tra quyền
            const promise = this.getTeamEmails(team.id)
              .then(emails => {
                // Nếu email có trong danh sách, thêm team vào kết quả
                if (emails.includes(email)) {
                  return {
                    id: team.id,
                    name: team.name,
                    icon: team.icon || '👥',
                    description: team.description || '',
                    region: regionId,
                    regionName: region.name,
                    sheet_id: team.sheet_id,
                    sheet_name: team.sheet_name || 'Sheet1'
                  };
                }
                return null;
              })
              .catch(() => null); // Bỏ qua lỗi
            
            checkPromises.push(promise);
          }
        }
        
        // Đợi tất cả kiểm tra hoàn tất
        const teams = await Promise.all(checkPromises);
        
        // Lọc bỏ null
        result.teams = teams.filter(team => team !== null);
        
        resolve(result);
      } catch (error) {
        console.error('Lỗi trong getUserAccessibleTeamsFromSheet:', error);
        
        // Fallback về phương thức cũ
        this.getUserAccessibleTeams(email)
          .then(resolve)
          .catch(reject);
      }
    });
  },

  // Kiểm tra quyền truy cập team từ Sheet
  checkTeamAccessFromSheet: function(teamId, email) {
    return new Promise((resolve, reject) => {
      try {
        // Nếu là admin, luôn cho phép truy cập
        if (CONFIG.ADMINS.includes(email)) {
          resolve({
            success: true,
            isAdmin: true,
            url: `webapp.html?team=${teamId}&email=${encodeURIComponent(email)}`
          });
          return;
        }
        
        // Lấy danh sách email từ sheet
        this.getTeamEmails(teamId)
          .then(emails => {
            // Kiểm tra email có nằm trong danh sách không
            if (emails.includes(email.toLowerCase())) {
              resolve({
                success: true,
                url: `webapp.html?team=${teamId}&email=${encodeURIComponent(email)}`
              });
            } else {
              // Lấy tất cả team mà email có quyền truy cập
              this.getUserAccessibleTeamsFromSheet(email)
                .then(result => {
                  if (result.teams.length === 0) {
                    // Không có quyền truy cập team nào
                    resolve({
                      success: false,
                      message: 'Bạn không thuộc team Sales nên không có quyền truy cập. Vui lòng liên hệ Admin.'
                    });
                  } else {
                    // Có quyền truy cập team khác
                    const teamNames = result.teams.map(t => t.name).join(', ');
                    
                    // Tìm tên team hiện tại
                    let currentTeamName = '';
                    for (const regionId in CONFIG.REGIONS) {
                      const region = CONFIG.REGIONS[regionId];
                      for (const team of region.teams) {
                        if (team.id === teamId) {
                          currentTeamName = team.name;
                          break;
                        }
                      }
                      if (currentTeamName) break;
                    }
                    
                    resolve({
                      success: false,
                      message: `Bạn không thuộc ${currentTeamName}. Bạn chỉ có quyền truy cập vào: ${teamNames}.`
                    });
                  }
                })
                .catch(error => {
                  console.error('Lỗi khi lấy danh sách team cho user:', error);
                  
                  // Fallback về phương thức cũ
                  this.checkTeamAccess(teamId, email)
                    .then(resolve)
                    .catch(reject);
                });
            }
          })
          .catch(error => {
            console.error('Lỗi khi kiểm tra quyền truy cập từ sheet:', error);
            
            // Fallback về phương thức cũ
            this.checkTeamAccess(teamId, email)
              .then(resolve)
              .catch(reject);
          });
      } catch (error) {
        console.error('Lỗi trong checkTeamAccessFromSheet:', error);
        
        // Fallback về phương thức cũ
        this.checkTeamAccess(teamId, email)
          .then(resolve)
          .catch(reject);
      }
    });
  }
};