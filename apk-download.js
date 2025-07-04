/**
 * APK Download Manager - v3.2
 * يعرض زر تحميل APK مع صفحة تتبع التنزيل
 * خاص بأجهزة الأندرويد فقط
 */
document.addEventListener('DOMContentLoaded', function() {
  // التحقق من نظام التشغيل (أندرويد فقط)
  if (!/Android/i.test(navigator.userAgent)) return;

  // 1. إنشاء زر التحميل العائم
  const apkButton = document.createElement('div');
  apkButton.id = 'apk-floating-btn';
  apkButton.innerHTML = `
    <button class="apk-btn">
      <i class="fas fa-download"></i>
      <span class="apk-btn-text">APK</span>
    </button>
  `;
  document.body.appendChild(apkButton);

  // 2. إنشاء صفحة التحميل
  const downloadModal = document.createElement('div');
  downloadModal.id = 'apk-download-modal';
  downloadModal.innerHTML = `
    <div class="download-overlay"></div>
    <div class="download-content">
      <div class="download-header">
        <i class="fas fa-mobile-alt"></i>
        <h3>تحميل تطبيق المطعم</h3>
        <p>النسخة الأندرويد</p>
      </div>
      
      <div class="download-progress">
        <div class="progress-container">
          <div class="progress-bar"></div>
        </div>
        <div class="progress-percent">0%</div>
      </div>
      
      <div class="download-steps">
        <div class="step active">
          <div class="step-number">1</div>
          <div class="step-text">جاري التجهيز</div>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-text">جاري التنزيل</div>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-text">الاكتمال</div>
        </div>
      </div>
      
      <button class="close-modal">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
  document.body.appendChild(downloadModal);

  // 3. إضافة التنسيقات
  const style = document.createElement('style');
  style.textContent = `
    /* زر التحميل العائم */
    #apk-floating-btn {
      position: fixed;
      top: 95px;
      right: 25px;
      z-index: 999;
      animation: fadeIn 0.5s ease-out;
    }
    
    .apk-btn {
      background: linear-gradient(135deg, #5F3BFF 0%, #7B5BFF 100%);
      color: white;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(95, 59, 255, 0.4);
      transition: all 0.3s ease;
    }
    
    .apk-btn:hover {
      transform: translateY(-3px) scale(1.1);
      box-shadow: 0 6px 20px rgba(95, 59, 255, 0.5);
    }
    
    .apk-btn i {
      font-size: 20px;
    }
    
    .apk-btn-text {
      font-size: 11px;
      font-weight: bold;
      margin-top: 3px;
      font-family: 'Tajawal', sans-serif;
    }
    
    /* نافذة التحميل */
    #apk-download-modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1000;
    }
    
    .download-overlay {
      position: absolute;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
    }
    
    .download-content {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      width: 90%;
      max-width: 400px;
      border-radius: 15px;
      padding: 25px;
      text-align: center;
      box-shadow: 0 10px 35px rgba(0, 0, 0, 0.15);
    }
    
    .download-header i {
      font-size: 50px;
      color: #5F3BFF;
      margin-bottom: 10px;
    }
    
    .download-header h3 {
      color: #333;
      margin: 0 0 5px;
      font-size: 22px;
    }
    
    .download-header p {
      color: #666;
      margin: 0 0 20px;
      font-size: 14px;
    }
    
    .download-progress {
      margin: 25px 0;
    }
    
    .progress-container {
      height: 8px;
      background: #f0f0f0;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 10px;
    }
    
    .progress-bar {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #5F3BFF, #00A082);
      transition: width 0.5s ease;
      border-radius: 4px;
    }
    
    .progress-percent {
      font-size: 16px;
      color: #5F3BFF;
      font-weight: bold;
    }
    
    .download-steps {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
    }
    
    .step {
      flex: 1;
      position: relative;
    }
    
    .step-number {
      width: 30px;
      height: 30px;
      line-height: 30px;
      border-radius: 50%;
      background: #f0f0f0;
      color: #999;
      margin: 0 auto 8px;
      font-size: 14px;
    }
    
    .step-text {
      font-size: 12px;
      color: #999;
    }
    
    .step.active .step-number {
      background: #5F3BFF;
      color: white;
    }
    
    .step.active .step-text {
      color: #333;
      font-weight: bold;
    }
    
    .close-modal {
      position: absolute;
      top: 15px;
      left: 15px;
      background: none;
      border: none;
      color: #999;
      font-size: 20px;
      cursor: pointer;
      transition: color 0.2s;
    }
    
    .close-modal:hover {
      color: #5F3BFF;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @media (max-width: 480px) {
      #apk-floating-btn {
        bottom: 70px;
        right: 25px;
      }
      
      .apk-btn {
        width: 55px;
        height: 55px;
      }
      
      .download-content {
        padding: 20px;
      }
    }
  `;
  document.head.appendChild(style);

  // 4. التحكم في الأحداث
  const floatingBtn = document.querySelector('.apk-btn');
  const modal = document.getElementById('apk-download-modal');
  const closeBtn = document.querySelector('.close-modal');
  const progressBar = document.querySelector('.progress-bar');
  const progressPercent = document.querySelector('.progress-percent');
  const steps = document.querySelectorAll('.step');

  // فتح نافذة التحميل
  floatingBtn.addEventListener('click', function() {
    modal.style.display = 'block';
    simulateDownload();
  });

  // إغلاق النافذة
  closeBtn.addEventListener('click', function() {
    modal.style.display = 'none';
    resetDownload();
  });

  // محاكاة عملية التحميل
  function simulateDownload() {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 100) progress = 100;
      
      progressBar.style.width = progress + '%';
      progressPercent.textContent = Math.round(progress) + '%';
      
      // تحديث خطوات التقدم
      if (progress >= 35 && !steps[1].classList.contains('active')) {
        steps[1].classList.add('active');
      }
      
      if (progress >= 75 && !steps[2].classList.contains('active')) {
        steps[2].classList.add('active');
      }
      
      // اكتمال التحميل
      if (progress === 100) {
        clearInterval(interval);
        setTimeout(startRealDownload, 1000);
      }
    }, 300);
  }

  // بدء التنزيل الفعلي
  function startRealDownload() {
    const link = document.createElement('a');
    link.href = 'mdenh.apk'; // استبدل برابط APK الفعلي
    link.download = 'mdenh.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      modal.style.display = 'none';
      resetDownload();
    }, 1500);
  }

  // إعادة تعيين حالة التحميل
  function resetDownload() {
    progressBar.style.width = '0%';
    progressPercent.textContent = '0%';
    steps.forEach((step, index) => {
      if (index > 0) step.classList.remove('active');
    });
  }
});