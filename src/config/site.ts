// ============================================================
//  إعدادات الموقع — كل الصور والنصوص والشعار يمكن تعديلها من هنا
//  Site Configuration — edit all images, text, and branding here
// ============================================================

export const siteConfig = {
  // --- الشعار والهوية / Branding ---
  brand: {
    name: 'ديكو وركشوبس',
    nameEn: 'Deco Workshops',
    logo: 'DW', // حرف أو حرفين يظهران في الدائرة
    tagline: 'نحوّل مساحتك إلى تحفة فنية',
    phone: '+962 7 9000 0000',
    email: 'info@decoworkshops.com',
    address: 'عمّان، الأردن',
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com',
    whatsapp: 'https://wa.me/962790000000',
  },

  // --- صورة الواجهة الرئيسية / Hero Background ---
  // استبدل الرابط بأي صورة تريد
  heroImage: 'https://images.pexels.com/photos/6969822/pexels-photo-6969822.jpeg?auto=compress&cs=tinysrgb&w=1600',

  // --- قسم الخدمات / Services ---
  services: [
    {
      icon: '🏠',
      title: 'تجديد شامل',
      description: 'تجديد وتشطيب الشقق والفلل بالكامل بأعلى جودة',
    },
    {
      icon: '🍳',
      title: 'مطابخ',
      description: 'تصميم وتنفيذ مطابخ عصرية بأحدث المواد والتقنيات',
    },
    {
      icon: '🚿',
      title: 'حمامات',
      description: 'تشطيب حمامات بتصاميم أنيقة وعملية',
    },
    {
      icon: '🎨',
      title: 'دهانات',
      description: 'أعمال دهان داخلية وخارجية بألوان عصرية',
    },
    {
      icon: '🪵',
      title: 'نجارة',
      description: 'أعمال نجارة وديكورات خشبية مخصصة',
    },
    {
      icon: '💡',
      title: 'إضاءة',
      description: 'تصميم وتركيب أنظمة إضاءة داخلية وخارجية',
    },
  ],

  // --- معرض الأعمال / Portfolio Gallery ---
  // أضف أو عدّل الصور هنا — كل صورة لها عنوان وفئة
  portfolio: [
    {
      image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'تجديد شقة عصرية',
      category: 'تجديد شامل',
      location: 'عمّان - الأردن',
    },
    {
      image: 'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'تصميم مطبخ مفتوح',
      category: 'مطابخ',
      location: 'العبدلي - عمّان',
    },
    {
      image: 'https://images.pexels.com/photos/32870/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800',
      title: 'حمام فاخر بالكامل',
      category: 'حمامات',
      location: 'خلدا - عمّان',
    },
    {
      image: 'https://images.pexels.com/photos/1660797/pexels-photo-1660797.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'دهانات داخلية عصرية',
      category: 'دهانات',
      location: 'الزرقاء',
    },
    {
      image: 'https://images.pexels.com/photos-1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'ديكور خشبي مخصص',
      category: 'نجارة',
      location: 'إربد',
    },
    {
      image: 'https://images.pexels.com/photos/3935350/pexels-photo-3935350.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'إضاءة ديكورية',
      category: 'إضاءة',
      location: 'عمّان - الأردن',
    },
    {
      image: 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'فيلا عصرية متكاملة',
      category: 'تجديد شامل',
      location: 'دابوق - عمّان',
    },
    {
      image: 'https://images.pexels.com/photos/2253842/pexels-photo-2253842.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'مكتب احترافي',
      category: 'تجديد شامل',
      location: 'العبدلي - عمّان',
    },
  ],

  // --- آراء العملاء / Testimonials ---
  testimonials: [
    {
      name: 'أحمد الخطيب',
      role: 'صاحب شقة - عمّان',
      avatar: 'https://images.pexels.com/photos/2204573/pexels-photo-2204573.jpeg?auto=compress&cs=tinysrgb&w=200',
      rating: 5,
      text: 'فريق محترف جداً، نفّذوا تجديد الشقة بالكامل في الوقت المحدد وبجودة ممتازة. أنصح بهم بشدة.',
    },
    {
      name: 'سارة العمري',
      role: 'مهندسة معمارية',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
      rating: 5,
      text: 'تعاملت معهم في عدة مشاريع، الدقة والاهتمام بالتفاصيل مذهل. عمل متقن وأسعار مناسبة.',
    },
    {
      name: 'محمد الزعبي',
      role: 'صاحب فيلا - دابوق',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200',
      rating: 5,
      text: 'من أفضل الشركات التي تعاملت معها. التزام بالمواعيد وذوق رفيع في التصميم والتنفيذ.',
    },
  ],

  // --- إحصائيات / Stats ---
  stats: [
    { value: '250+', label: 'مشروع منجز' },
    { value: '15', label: 'سنة خبرة' },
    { value: '50+', label: 'عميل سعيد' },
    { value: '30+', label: 'عامل محترف' },
  ],

  // --- أنواع العمل في نموذج الطلب / Work Types for Order Form ---
  workTypes: [
    'تجديد شامل',
    'مطبخ',
    'حمام',
    'دهانات',
    'نجارة',
    'إضاءة',
    'أرضيات',
    'أسقف',
    'أخرى',
  ],

  // --- خيارات مساحة العمل / Space Size Options ---
  spaceSizes: [
    'أقل من 50 م²',
    '50 - 100 م²',
    '100 - 200 م²',
    '200 - 300 م²',
    'أكثر من 300 م²',
  ],
};
