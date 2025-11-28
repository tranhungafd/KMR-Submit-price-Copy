const CONFIG = {
  // Sheet chung cho quản lý quyền truy cập
  MASTER_AUTH_SHEET_ID: "1it3ljYVN8js5u3TlcrbYWfnmJsYeMLHSTYSgllTrL8w",
  
  // URL của Google Apps Script để xử lý dữ liệu Special Price
  APISPECIALPRICE_URL: "https://script.google.com/macros/s/AKfycbwYHcoJbot0sFLQUYSL8fIHlDFkEPc5ATixVipRTzWiu6EBe0-ML1CuTSNxsgxjN8KE/exec",

  // Dữ liệu các khu vực và teams
  REGIONS: {
    hanoi: {
      name: 'Khu vực Miền Bắc',
      teams: [
        { 
          id: 'sme_hn', 
          name: 'SME Horeca Miền Bắc', 
          icon: '👥', 
          description: '', 
          emails: ['tam.le@kamereo.vn','thaonguyen@kamereo.vn'], 
          sheet_id: '1Yib-LG1VBlXruGJcZgEmjE3Qf9Ct37wZKeefTfbtKMk',
          sheet_name: 'Sheet1'
        },
        { 
          id: 'ka_mt_hn', 
          name: 'KA MT Miền Bắc', 
          icon: '🛒', 
          description: '',
          emails: ['tam.le@kamereo.vn','tu.hoang@kamereo.vn'],
          sheet_id: '1YaI4aeh8mJ5i1g7fM2JJUSezVDISXAYFbQPH5NEbSUo',
          sheet_name: 'Sheet1'
        },
        { 
          id: 'ka_fc_hn', 
          name: 'KA FC & Others Miền Bắc', 
          icon: '🏢', 
          description: '',
          emails: ['tam.le@kamereo.vn','tuuyen.nguyen@kamereo.vn', 'van.nguyen@kamereo.vn','trang.doan@kamereo.vn'],
          sheet_id: '1nRYjW0X5NWB5F-XmvMJsmQ-8mgr0UU8gm4ZGUYb5nSU',
          sheet_name: 'Sheet1'
        }
        // ,
        // { 
        //   id: 'ka_school_hn', 
        //   name: 'KA School-Factory Miền Bắc', 
        //   icon: '🏫', 
        //   description: '',
        //   emails: ['tam.le@kamereo.vn','van.nguyen@kamereo.vn','trang.doan@kamereo.vn','tuuyen.nguyen@kamereo.vn'],
        //   sheet_id: '1SvBqFeDML8vCknUf19Pggy8tsc60nEVkhhRZz2gbmP4',
        //   sheet_name: 'Sheet1'
        // },
        // { 
        //   id: 'ka_hotel_hn', 
        //   name: 'KA Hotel-Convention Miền Bắc', 
        //   icon: '🏨', 
        //   description: '',
        //   emails: ['tam.le@kamereo.vn','tuyen.nguyen@kamereo.vn','kien.le@kamereo.vn'],
        //   sheet_id: '1GI3U3TTvxds0IQBBj-TFhA3YuEevXRYPUQ1XClxN1rw',
        //   sheet_name: 'Sheet1'
        // }
      ]
    },
    hcm: {
      name: 'Khu vực Miền Nam',
      teams: [
        { 
          id: 'sme_hcm', 
          name: 'SME Horeca Miền Nam', 
          icon: '👥', 
          description: '',
          emails: ['phong.ha@kamereo.vn','hieu.ngoc@kamereo.vn', 'vi.dang@kamereo.vn','duong.doan@kamereo.vn','tri.nguyen@kamereo.vn','kien.huynh@kamereo.vn','tram.nguyen@kamereo.vn','diuthuong.nguyen@kamereo.vn','yen.nguyen@kamereo.vn','nhan.luu@kamereo.vn','nguyen.hoang@kamereo.vn'],
          sheet_id: '1XkHZ_0PBzBLL-rhW5Ldb5YkxRfXm_WJKQrRYCgd7W5I',
          sheet_name: 'Sheet1'
        },
        { 
          id: 'ka_mt_hcm', 
          name: 'KA MT Miền Nam', 
          icon: '🛒', 
          description: '',
          emails: ['thanhphong.pham@kamereo.vn','mythanh.tran@kamereo.vn','mai.vu@kamereo.vn','han.vu@kamereo.vn'],
          sheet_id: '1-6pZBacYy_OPhnKE7hMEnHxdXqcXLIkn_H7jdEDZIz0',
          sheet_name: 'Sheet1'
        },
        { 
          id: 'ka_fc_hcm', 
          name: 'KA FC Miền Nam', 
          icon: '🏢', 
          description: '',
          emails: ['san.le@kamereo.vn','dat.pham@kamereo.vn','trongnhan.nguyen@kamereo.vn','han.vu@kamereo.vn','nhi.tran@kamereo.vn','doan.tran@kamereo.vn','huong.cao@kamereo.vn'],
          sheet_id: '1UIxh6YeaRgU85pa21nhpe15bUBtTywn5LoK8tafbSJ4',
          sheet_name: 'Sheet1'
        },
        // { 
        //   id: 'ka_school_hcm', 
        //   name: 'KA School-Factory Miền Nam', 
        //   icon: '🏫', 
        //   description: '',
        //   emails: [ 'ngocanh.tran@kamereo.vn','man.mai@kamereo.vn','dat.pham@kamereo.vn'],
        //   sheet_id: '1WTPREnRKUFKXO8sxy509jkch0SwmLwJc7UgXCUGvhTA',
        //   sheet_name: 'Sheet1'
        // },
        { 
          id: 'ka_hotel_hcm', 
          name: 'KA SCHOOL-HOTEL Miền Nam', 
          icon: '🏨', 
          description: '',
          emails: [ 'haiphuong.le@kamereo.vn','camlinh.nguyen@kamereo.vn','dat.pham@kamereo.vn','ngocanh.tran@kamereo.vn','san.le@kamereo.vn'],
          sheet_id: '1uQBVYigXFHoIFcGYr2XDcGDT273WV-SxiTSmcUpV5Jk',
          sheet_name: 'Sheet1'
        }
      ]
    }
  },

  // Danh sách admin có quyền truy cập mọi team
  ADMINS: ['khanh.le@kamereo.vn', 'hung.tran@kamereo.vn','taku.tanaka@kamereo.vn','thanhbinh.le@kamereo.vn','viet.truong@kamereo.vn','kien.le@kamereo.vn','ducphong.nguyen@kamereo.vn','chinh.van@kamereo.vn'],

  // Thời gian phiên làm việc (giờ)
  SESSION_DURATION: 8,
  
  // URL sheet mặc định cho admin nếu cần
  DEFAULT_SHEET_URL: 'https://docs.google.com/spreadsheets/d/1jVuPH8o5uhA4xhyx940Vx_VzXE6guGT7swq22QApR18/edit?gid=0#gid=0',
  DEFAULT_SHEET_ID: '1jVuPH8o5uhA4xhyx940Vx_VzXE6guGT7swq22QApR18',
  DEFAULT_SHEET_NAME: 'Sheet1',
  
  // URL của Google Apps Script để xử lý lấy dữ liệu từ Google Sheets để xác thực quyền truy cập
  SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwxUiqmL-3iDHNm10JMy_57qZVR6YNQoedFQp-QV0cPkw9s9b9ctZhmWo2Kq2q8DF0/exec',
  // Cấu hình Google OAuth
  GOOGLE_AUTH: {
    CLIENT_ID: '252140887716-576f1gevc9hck56960jq4f0vsaq5rl5h.apps.googleusercontent.com',
    HOSTED_DOMAIN: 'kamereo.vn'
  },
  
  // Cấu hình ứng dụng
  APP: {
    NAME: '[BOS] KMR Special Price Record',
    VERSION: '1.0.0',
    REQUIRED_FIELDS: [
      'priceType', 
      'startDate', 
      'endDate', 
      'buyers', 
      'products'
    ],
    MIN_PRICE: 1000,
    MAX_DURATION_MONTHS: 3
  },
  
  // Cấu hình debug và phát triển
  DEBUG: {
    ENABLED: true,
    LOG_LEVEL: 'info',
    MOCK_API: false
  },
  
  // Cấu hình Slack cho thông báo
  SLACK: {
    WEBHOOK_URL: 'https://hooks.slack.com/services/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',
    CHANNEL: '#special-price-notifications'
  }
};
