class RestaurantChatbot {
  constructor() {
    // معلومات المطعم والمطور
    this.info = {
      restaurant: {
        name: "مطعم المدينة والمندي",
        location: "غرانيج - دير الزور",
        specialties: "أشهى المأكولات بأجود المكونات",
        workingHours: "من 10 صباحاً حتى 12 منتصف الليل",
        phone: "+966 50 123 4567",
        googleMaps: "https://goo.gl/maps/example"
      },
      developer: {
        name: "عبد المجيد القب (أبو راشد)",
        location: "سوريا - دير الزور - غرانيج",
        age: 17,
        education: "طالب مدرسة بالصف البكلوريا",
        instagram: "https://www.instagram.com/io_ccoi",
        tiktok: "https://www.tiktok.com/@io_ccoi",
        ideaForm: "" // يمكن إضافة رابط هنا لاحقاً
      }
    };

    // حالة المحادثة
    this.chatState = {
      open: false,
      loading: false,
      isSending: false,
      conversation: []
    };

    // تهيئة العناصر
    this.initElements();
    // تهيئة واجهة المستخدم
    this.initUI();
    // تحميل المحادثة المحفوظة
    this.loadConversation();
    // إضافة مستمعي الأحداث
    this.addEventListeners();
  }

  initElements() {
    // إنشاء عناصر DOM
    this.chatbotContainer = document.createElement('div');
    this.chatbotContainer.className = 'chatbot-container';
    this.chatbotContainer.innerHTML = `
      <div class="chatbot-button" id="chatbot-button">
        <div class="chatbot-icon">
          <i class="fas fa-comments"></i>
        </div>
        <div class="pulse-effect"></div>
      </div>
      <div class="chatbot-window">
        <div class="chatbot-header">
          <div class="chatbot-avatar">
            <i class="fas fa-robot"></i>
          </div>
          <div class="chatbot-title">
            <h3>مساعد المطعم الذكي</h3>
            <p>نحن هنا لمساعدتك!</p>
          </div>
          <button class="close-chatbot"><i class="fas fa-times"></i></button>
        </div>
        <div class="chatbot-messages" id="chatbot-messages">
          <div class="bot-message welcome-message">
            <div class="message-content">
              <p>مرحباً بك في ${this.info.restaurant.name}! 👋</p>
              <p>أنا مساعدك الذكي هنا لمساعدتك في أي استفسار لديك.</p>
            </div>
            <div class="quick-questions-container">
              <h4>اختر أحد الاستفسارات الشائعة:</h4>
              <div class="quick-questions-grid">
                <div class="quick-question-card" data-question="ساعات العمل">
                  <i class="fas fa-clock"></i>
                  <span>ساعات العمل</span>
                </div>
                <div class="quick-question-card" data-question="موقع المطعم">
                  <i class="fas fa-map-marker-alt"></i>
                  <span>موقع المطعم</span>
                </div>
                <div class="quick-question-card" data-question="الاطباق المميزة">
                  <i class="fas fa-utensils"></i>
                  <span>الأطباق المميزة</span>
                </div>
                <div class="quick-question-card" data-question="من طور الموقع؟">
                  <i class="fas fa-code"></i>
                  <span>مطور الموقع</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="chatbot-options">
          <div class="quick-questions-grid">
            <div class="quick-question-card" data-question="طرق التواصل">
              <i class="fas fa-phone-alt"></i>
              <span>طرق التواصل</span>
            </div>
            <div class="quick-question-card" data-question="كيف أطرح فكرتي للمطور؟">
              <i class="fas fa-lightbulb"></i>
              <span>اقتراح فكرة</span>
            </div>
            <div class="quick-question-card" data-question="بدء محادثة جديدة">
              <i class="fas fa-sync-alt"></i>
              <span>جديد</span>
            </div>
            <div class="quick-question-card" data-question="العودة للصفحة الرئيسية">
              <i class="fas fa-home"></i>
              <span>الرئيسية</span>
            </div>
          </div>
        </div>
      </div>
      <div class="service-unavailable-modal">
        <div class="modal-content">
          <div class="modal-icon">
            <i class="fas fa-tools"></i>
          </div>
          <h3>هذه الخدمة غير متوفرة حالياً</h3>
          <p>نعتذر عن عدم توفر هذه الخدمة في الوقت الحالي. سنعمل على تفعيلها قريباً.</p>
          <button class="modal-close-btn">حسناً</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.chatbotContainer);

    // تعريف العناصر المهمة
    this.chatButton = document.getElementById('chatbot-button');
    this.chatWindow = this.chatbotContainer.querySelector('.chatbot-window');
    this.messagesContainer = document.getElementById('chatbot-messages');
    this.closeButton = this.chatbotContainer.querySelector('.close-chatbot');
    this.serviceModal = this.chatbotContainer.querySelector('.service-unavailable-modal');
    this.modalCloseBtn = this.chatbotContainer.querySelector('.modal-close-btn');
  }

  initUI() {
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --primary-color: #E63946;
        --secondary-color: #F1C40F;
        --accent-color: #E67E22;
        --dark-color: #2C3E50;
        --light-color: #ECF0F1;
        --success-color: #27AE60;
        --warning-color: #E74C3C;
        --gray-color: #95A5A6;
        --shadow: 0 8px 24px rgba(230, 57, 70, 0.15);
        --transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      }
      
      .chatbot-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        font-family: 'Tajawal', sans-serif;
      }
      
      .chatbot-button {
        width: 60px;
        height: 60px;
        background-color: var(--primary-color);
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        box-shadow: var(--shadow);
        transition: var(--transition);
        position: relative;
      }
      
      .chatbot-button:hover {
        transform: scale(1.1);
        background-color: #d62c3a;
      }
      
      .chatbot-icon {
        color: white;
        font-size: 24px;
      }
      
      .pulse-effect {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: var(--primary-color);
        animation: pulse 2s infinite;
        opacity: 0;
        z-index: -1;
      }
      
      @keyframes pulse {
        0% {
          transform: scale(0.95);
          opacity: 0.7;
        }
        70% {
          transform: scale(1.3);
          opacity: 0;
        }
        100% {
          transform: scale(0.95);
          opacity: 0;
        }
      }
      
      .chatbot-window {
        width: 100vw;
        height: 100vh;
        background-color: white;
        position: fixed;
        top: 0;
        left: 0;
        display: none;
        flex-direction: column;
        overflow: hidden;
        z-index: 9998;
      }
      
      .chatbot-header {
        background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
        color: white;
        padding: 15px;
        display: flex;
        align-items: center;
        gap: 15px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }
      
      .chatbot-avatar {
        width: 40px;
        height: 40px;
        background-color: var(--secondary-color);
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      
      .chatbot-avatar i {
        color: white;
        font-size: 18px;
      }
      
      .chatbot-title h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
      }
      
      .chatbot-title p {
        margin: 0;
        font-size: 12px;
        opacity: 0.8;
      }
      
      .close-chatbot {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        margin-left: auto;
        transition: var(--transition);
      }
      
      .close-chatbot:hover {
        transform: rotate(90deg);
      }
      
      .chatbot-messages {
        flex: 1;
        padding: 15px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 15px;
        background-color: var(--light-color);
      }
      
      .bot-message, .user-message {
        max-width: 85%;
        padding: 12px 16px;
        border-radius: 18px;
        line-height: 1.5;
        position: relative;
        animation: fadeIn 0.3s ease;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .bot-message {
        background-color: white;
        align-self: flex-start;
        border-bottom-left-radius: 5px;
      }
      
      .user-message {
        background-color: var(--primary-color);
        color: white;
        align-self: flex-end;
        border-bottom-right-radius: 5px;
      }
      
      .welcome-message {
        background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
        color: white;
        padding: 20px;
        border-radius: 12px;
        margin-bottom: 15px;
      }
      
      .welcome-message .message-content p {
        margin: 5px 0;
      }
      
      .message-content {
        word-wrap: break-word;
      }
      
      .message-content a {
        color: var(--secondary-color);
        text-decoration: none;
        font-weight: bold;
      }
      
      .message-content a:hover {
        text-decoration: underline;
      }
      
      .quick-questions-container {
        margin-top: 15px;
      }
      
      .quick-questions-container h4 {
        margin: 10px 0;
        font-size: 14px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.9);
      }
      
      .quick-questions-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }
      
      .quick-question-card {
        background-color: rgba(255, 255, 255, 0.15);
        border-radius: 10px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: var(--transition);
        text-align: center;
        min-height: 70px;
      }
      
      .quick-question-card:hover {
        background-color: rgba(255, 255, 255, 0.25);
        transform: translateY(-3px);
      }
      
      .quick-question-card i {
        font-size: 18px;
        margin-bottom: 5px;
      }
      
      .quick-question-card span {
        font-size: 12px;
      }
      
      .chatbot-options {
        padding: 10px;
        background-color: white;
        border-top: 1px solid #eee;
        position: absolute; 
            bottom: 50px; 
            width: 100%; 
    
      }
      
      .contact-method {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 10px 0;
      }
      
      .contact-method i {
        width: 20px;
        text-align: center;
      }
      
      .developer-info {
        margin: 10px 0;
      }
      
      .developer-info p {
        margin: 5px 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .developer-info i {
        color: var(--accent-color);
      }
      
      .idea-form {
        background-color: rgba(0, 0, 0, 0.05);
        padding: 15px;
        border-radius: 10px;
        margin-top: 15px;
      }
      
      .idea-form h4 {
        margin-top: 0;
      }
      
      .service-unavailable-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 10000;
      }
      
      .modal-content {
        background-color: white;
        padding: 25px;
        border-radius: 15px;
        text-align: center;
        max-width: 300px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      }
      
      .modal-icon {
        font-size: 40px;
        color: var(--warning-color);
        margin-bottom: 15px;
      }
      
      .modal-content h3 {
        margin: 0 0 10px;
        color: var(--dark-color);
      }
      
      .modal-content p {
        margin: 0 0 20px;
        color: var(--gray-color);
      }
      
      .modal-close-btn {
        background-color: var(--primary-color);
        color: white;
        border: none;
        padding: 8px 20px;
        border-radius: 20px;
        cursor: pointer;
        transition: var(--transition);
      }
      
      .modal-close-btn:hover {
        background-color: #d62c3a;
      }
      
      .typing-indicator {
        display: inline-flex;
        gap: 5px;
        margin-left: 10px;
      }
      
      .typing-indicator span {
        width: 8px;
        height: 8px;
        background-color: var(--gray-color);
        border-radius: 50%;
        display: inline-block;
        opacity: 0.4;
      }
      
      .typing-indicator span:nth-child(1) {
        animation: typing 1s infinite;
      }
      
      .typing-indicator span:nth-child(2) {
        animation: typing 1s infinite 0.2s;
      }
      
      .typing-indicator span:nth-child(3) {
        animation: typing 1s infinite 0.4s;
      }
      
      @keyframes typing {
        0% { opacity: 0.4; transform: translateY(0); }
        50% { opacity: 1; transform: translateY(-5px); }
        100% { opacity: 0.4; transform: translateY(0); }
      }
      
      @media (min-width: 768px) {
        .chatbot-window {
          width: 400px;
          height: 600px;
          border-radius: 15px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        
        .quick-questions-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    `;
    document.head.appendChild(style);
  }

  addEventListeners() {
    // فتح/إغلاق الشات
    this.chatButton.addEventListener('click', () => this.toggleChat());
    this.closeButton.addEventListener('click', () => this.toggleChat());
    
    // إغلاق نافذة الخدمة غير المتوفرة
    this.modalCloseBtn.addEventListener('click', () => {
      this.serviceModal.style.display = 'none';
    });
    
    // الأسئلة السريعة
    document.querySelectorAll('.quick-question-card').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (!this.chatState.isSending) {
          const question = e.currentTarget.getAttribute('data-question');
          this.processQuestion(question);
        }
      });
    });
  }

  toggleChat() {
    this.chatState.open = !this.chatState.open;
    this.chatWindow.style.display = this.chatState.open ? 'flex' : 'none';
    
    if (this.chatState.open) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
      }, 100);
    } else {
      document.body.style.overflow = 'auto';
    }
  }

  addMessage(text, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = isUser ? 'user-message' : 'bot-message';
    
    if (typeof text === 'string') {
      messageDiv.innerHTML = `<div class="message-content">${text}</div>`;
    } else {
      messageDiv.appendChild(text);
    }
    
    this.messagesContainer.appendChild(messageDiv);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    
    this.chatState.conversation.push({
      text: messageDiv.innerHTML,
      isUser,
      timestamp: new Date().toISOString()
    });
    this.saveConversation();
  }

  showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'bot-message';
    typingDiv.innerHTML = `
      <div class="message-content">
        يكتب <span class="typing-indicator"><span></span><span></span><span></span></span>
      </div>
    `;
    
    this.messagesContainer.appendChild(typingDiv);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    
    return typingDiv;
  }

  removeTypingIndicator(typingElement) {
    if (typingElement && typingElement.parentNode) {
      typingElement.remove();
    }
  }

  processQuestion(question) {
    this.chatState.isSending = true;
    const typingElement = this.showTypingIndicator();
    
    setTimeout(() => {
      this.removeTypingIndicator(typingElement);
      
      switch(question) {
        case 'ساعات العمل':
          this.showWorkingHours();
          break;
        case 'موقع المطعم':
          this.showLocation();
          break;
        case 'الاطباق المميزة':
          this.showSpecialties();
          break;
        case 'طرق التواصل':
          this.showContactMethods();
          break;
        case 'من طور الموقع؟':
          this.showDeveloperInfo();
          break;
        case 'كيف أطرح فكرتي للمطور؟':
          this.showIdeaForm();
          break;
        case 'بدء محادثة جديدة':
          this.restartConversation();
          break;
        case 'العودة للصفحة الرئيسية':
          this.goToHome();
          break;
        default:
          this.showDefaultResponse();
      }
      
      this.chatState.isSending = false;
    }, 1000 + Math.random() * 1500);
  }

  showWorkingHours() {
    const response = `
      <p>ساعات العمل في ${this.info.restaurant.name}:</p>
      <p><strong>${this.info.restaurant.workingHours}</strong></p>
    `;
    this.addMessage(response, false);
  }

  showLocation() {
    const response = `
      <p>موقع ${this.info.restaurant.name}:</p>
      <p><strong>${this.info.restaurant.location}</strong></p>
      <p>
        <a href="${this.info.restaurant.googleMaps}" target="_blank">
          <i class="fas fa-map-marker-alt"></i> عرض على خرائط جوجل
        </a>
      </p>
    `;
    this.addMessage(response, false);
  }

  showSpecialties() {
    const response = `
      <p>من أشهر أطباقنا:</p>
      <div class="specialty-item">
        <i class="fas fa-check-circle"></i> مندي لحم
      </div>
      <div class="specialty-item">
        <i class="fas fa-check-circle"></i> كباب مشوي
      </div>
      <div class="specialty-item">
        <i class="fas fa-check-circle"></i>  مندي دجاج
      </div>
      <div class="specialty-item">
        <i class="fas fa-check-circle"></i> شغف
      </div>
      <p>جميع أطباقنا مصنوعة من أجود المكونات الطازجة.</p>
    `;
    this.addMessage(response, false);
  }

  showContactMethods() {
    const response = `
      <p>طرق التواصل مع ${this.info.restaurant.name}:</p>
      <div class="contact-method">
        <i class="fas fa-phone"></i> <strong>الهاتف:</strong> ${this.info.restaurant.phone}
      </div>
      <div class="contact-method">
        <i class="fas fa-map-marker-alt"></i> <strong>العنوان:</strong> ${this.info.restaurant.location}
      </div>
    `;
    this.addMessage(response, false);
  }

  showDeveloperInfo() {
    const response = `
      <p>معلومات المطور:</p>
      <div class="developer-info">
        <p><i class="fas fa-user"></i> <strong>الاسم:</strong> ${this.info.developer.name}</p>
        <p><i class="fas fa-map-marker-alt"></i> <strong>المكان:</strong> ${this.info.developer.location}</p>
        <p><i class="fas fa-birthday-cake"></i> <strong>العمر:</strong> ${this.info.developer.age} سنة</p>
        <p><i class="fas fa-graduation-cap"></i> <strong>الدراسة:</strong> ${this.info.developer.education}</p>
      </div>
      <p>طرق التواصل مع المطور:</p>
      <div class="contact-method">
        <i class="fab fa-instagram"></i> <strong>إنستغرام:</strong> 
        <a href="${this.info.developer.instagram}" target="_blank">@io_ccoi</a>
      </div>
      <div class="contact-method">
        <i class="fab fa-tiktok"></i> <strong>تيك توك:</strong> 
        <a href="${this.info.developer.tiktok}" target="_blank">@io_ccoi</a>
      </div>
    `;
    this.addMessage(response, false);
  }

  showIdeaForm() {
    if (this.info.developer.ideaForm) {
      const response = `
        <div class="idea-form">
          <h4>نموذج اقتراح فكرة للمطور</h4>
          <p>يمكنك مشاركة أفكارك لتحسين الموقع عبر النموذج التالي:</p>
          <a href="${this.info.developer.ideaForm}" target="_blank" class="idea-link">
            <i class="fas fa-external-link-alt"></i> الذهاب إلى نموذج الاقتراحات
          </a>
        </div>
      `;
      this.addMessage(response, false);
    } else {
      this.serviceModal.style.display = 'flex';
    }
  }

  restartConversation() {
    if (confirm('هل تريد فعلاً بدء محادثة جديدة؟ سيتم حذف سجل المحادثة الحالية.')) {
      this.chatState.conversation = [];
      this.saveConversation();
      this.messagesContainer.innerHTML = '';
      this.showWelcomeMessage();
    }
  }

  goToHome() {
    this.toggleChat();
    
    const homeNavItem = document.querySelector('.nav-item[data-section="home-section"]');
    if (homeNavItem) {
      // إزالة التنشيط من جميع الأزرار
      document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
      });
      
      // إضافة التنشيط لزر الرئيسية
      homeNavItem.classList.add('active');
      
      // إخفاء جميع الأقسام
      document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
      });
      
      // إظهار قسم الرئيسية
      const homeSection = document.getElementById('home-section');
      if (homeSection) {
        homeSection.classList.add('active');
      }
      
      // التمرير إلى أعلى الصفحة بسلاسة
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      // تشغيل أي أحداث إضافية مرتبطة
      if (typeof showSection === 'function') {
        showSection('home-section');
      }
    } else {
      window.location.href = 'index.html';
    }
  }

  showDefaultResponse() {
    const response = `
      <p>يمكنني مساعدتك في معرفة:</p>
      <div class="quick-questions-grid">
        <div class="quick-question-card" data-question="ساعات العمل">
          <i class="fas fa-clock"></i>
          <span>ساعات العمل</span>
        </div>
        <div class="quick-question-card" data-question="موقع المطعم">
          <i class="fas fa-map-marker-alt"></i>
          <span>موقع المطعم</span>
        </div>
        <div class="quick-question-card" data-question="الاطباق المميزة">
          <i class="fas fa-utensils"></i>
          <span>الأطباق المميزة</span>
        </div>
        <div class="quick-question-card" data-question="من طور الموقع؟">
          <i class="fas fa-code"></i>
          <span>مطور الموقع</span>
        </div>
      </div>
    `;
    this.addMessage(response, false);
  }

  showWelcomeMessage() {
    const welcomeMsg = document.createElement('div');
    welcomeMsg.className = 'bot-message welcome-message';
    welcomeMsg.innerHTML = `
      <div class="message-content">
        <p>مرحباً بك في ${this.info.restaurant.name}! 👋</p>
        <p>أنا مساعدك الذكي هنا لمساعدتك في أي استفسار لديك.</p>
      </div>
      <div class="quick-questions-container">
        <h4>اختر أحد الاستفسارات الشائعة:</h4>
        <div class="quick-questions-grid">
          <div class="quick-question-card" data-question="ساعات العمل">
            <i class="fas fa-clock"></i>
            <span>ساعات العمل</span>
          </div>
          <div class="quick-question-card" data-question="موقع المطعم">
            <i class="fas fa-map-marker-alt"></i>
            <span>موقع المطعم</span>
          </div>
          <div class="quick-question-card" data-question="الاطباق المميزة">
            <i class="fas fa-utensils"></i>
            <span>الأطباق المميزة</span>
          </div>
          <div class="quick-question-card" data-question="من طور الموقع؟">
            <i class="fas fa-code"></i>
            <span>مطور الموقع</span>
          </div>
        </div>
      </div>
    `;
    
    this.messagesContainer.appendChild(welcomeMsg);
    
    // إضافة مستمعي الأحداث للأسئلة السريعة
    welcomeMsg.querySelectorAll('.quick-question-card').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (!this.chatState.isSending) {
          const question = e.currentTarget.getAttribute('data-question');
          this.processQuestion(question);
        }
      });
    });
  }

  saveConversation() {
    localStorage.setItem('restaurant_chat_conversation', JSON.stringify(this.chatState.conversation));
  }

  loadConversation() {
    const savedConversation = localStorage.getItem('restaurant_chat_conversation');
    if (savedConversation) {
      this.chatState.conversation = JSON.parse(savedConversation);
      
      this.messagesContainer.innerHTML = '';
      this.chatState.conversation.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = msg.isUser ? 'user-message' : 'bot-message';
        messageDiv.innerHTML = msg.text;
        this.messagesContainer.appendChild(messageDiv);
      });
      
      if (this.chatState.conversation.length === 0) {
        this.showWelcomeMessage();
      }
    }
  }
}

// تهيئة المساعد عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  const chatbot = new RestaurantChatbot();
});