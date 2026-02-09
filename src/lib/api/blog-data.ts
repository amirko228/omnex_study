import type { Locale } from '@/lib/i18n/config';

export type BlogCategory = 'AI' | 'Programming' | 'Career' | 'Design' | 'Business' | 'Learning';

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: BlogCategory;
  tags: string[];
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  publishedAt: string;
  readTime: number;
  views: number;
  likes: number;
  featured: boolean;
};

// Multilingual blog post data structure
type BlogPostTranslations = {
  [key in Locale]: BlogPost[];
};

// Russian blog posts
const blogPostsRu: BlogPost[] = [
  {
    id: '1',
    slug: 'ai-revolution-in-education',
    title: 'Революция ИИ в образовании: Как машинное обучение меняет способ получения знаний',
    excerpt: 'Искусственный интеллект трансформирует образование, делая обучение персонализированным, доступным и эффективным. Узнайте, как ИИ помогает студентам достигать лучших результатов.',
    content: `
      <h2>Введение в ИИ-образование</h2>
      <p>Искусственный интеллект радикально меняет подход к обучению. Традиционные методы образования уступают место персонализированным, адаптивным системам, которые учитывают индивидуальные потребности каждого студента.</p>
      
      <h2>Ключевые преимущества ИИ в обучении</h2>
      <ul>
        <li><strong>Персонализация:</strong> ИИ адаптирует контент под ваш уровень знаний и стиль обучения</li>
        <li><strong>Доступность 24/7:</strong> Учитесь в любое время с AI-помощником</li>
        <li><strong>Мгновенная обратная связь:</strong> Получайте ответы на вопросы без задержек</li>
        <li><strong>Адаптивные тесты:</strong> Система подстраивается под ваш прогресс</li>
      </ul>
      
      <h2>Технологии будущего уже здесь</h2>
      <p>Современные AI-платформы используют передовые технологии машинного обучения для создания уникального образовательного опыта. Natural Language Processing позволяет вести диалог с AI-наставником, а adaptive learning algorithms корректируют сложность материала в реальном времени.</p>
      
      <blockquote>
        "ИИ не заменяет преподавателей — он дополняет их, делая образование более доступным и эффективным для миллионов людей по всему миру."
      </blockquote>
      
      <h2>Практическое применение</h2>
      <p>На нашей платформе вы можете выбрать формат обучения: текстовые уроки, интерактивные тесты, чат с AI или практические задания. ИИ автоматически адаптирует контент под выбранный формат, сохраняя качество и глубину материала.</p>
      
      <h2>Будущее образования</h2>
      <p>Мы только в начале пути. В ближайшие годы ИИ-образование станет нормой, а персонализированное обучение будет доступно каждому. Присоединяйтесь к революции прямо сейчас!</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=600&fit=crop',
    category: 'AI',
    tags: ['ИИ', 'Образование', 'Машинное обучение', 'EdTech'],
    author: {
      name: 'Анна Смирнова',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      role: 'AI Research Lead'
    },
    publishedAt: '2025-01-28',
    readTime: 8,
    views: 15420,
    likes: 892,
    featured: true
  },
  {
    id: '2',
    slug: 'mastering-javascript-2025',
    title: '10 современных JavaScript фичей, которые должен знать каждый разработчик в 2025',
    excerpt: 'JavaScript продолжает эволюционировать. Изучите новейшие возможности языка, которые делают код чище, быстрее и безопаснее.',
    content: `
      <h2>JavaScript в 2025 году</h2>
      <p>JavaScript остается самым популярным языком программирования, и каждый год появляются новые возможности, которые делают разработку проще и эффективнее.</p>
      
      <h2>1. Optional Chaining и Nullish Coalescing</h2>
      <pre><code>// Optional Chaining
const userName = user?.profile?.name;

// Nullish Coalescing
const displayName = userName ?? 'Anonymous';</code></pre>
      
      <h2>2. Private Class Fields</h2>
      <p>Теперь можно создавать настоящие приватные поля в классах с помощью символа #:</p>
      <pre><code>class BankAccount {
  #balance = 0;
  
  deposit(amount) {
    this.#balance += amount;
  }
}</code></pre>
      
      <h2>3. Top-level await</h2>
      <p>Используйте await на верхнем уровне модулей без необходимости оборачивать в async функцию.</p>
      
      <h2>Заключение</h2>
      <p>Эти и многие другие фичи делают JavaScript мощнее. Изучайте их на наших курсах!</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=1200&h=600&fit=crop',
    category: 'Programming',
    tags: ['JavaScript', 'ES2025', 'Веб-разработка', 'Frontend'],
    author: {
      name: 'Дмитрий Петров',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      role: 'Senior Full-Stack Developer'
    },
    publishedAt: '2025-01-25',
    readTime: 12,
    views: 23150,
    likes: 1340,
    featured: true
  },
  {
    id: '3',
    slug: 'career-growth-tech-2025',
    title: 'Карьера в IT 2025: Какие навыки востребованы и как их получить',
    excerpt: 'Анализ рынка труда, топ навыков для IT-специалистов и стратегия развития карьеры в технологической индустрии.',
    content: `
      <h2>Рынок IT в 2025</h2>
      <p>Технологическая индустрия продолжает расти, создавая миллионы рабочих мест. Но какие навыки действительно важны?</p>
      
      <h2>Топ-10 востребованных навыков</h2>
      <ol>
        <li>AI/ML Engineering</li>
        <li>Cloud Architecture (AWS, Azure, GCP)</li>
        <li>Full-Stack Development</li>
        <li>DevOps и CI/CD</li>
        <li>Cybersecurity</li>
        <li>Data Science & Analytics</li>
        <li>Mobile Development (React Native, Flutter)</li>
        <li>Blockchain Development</li>
        <li>UI/UX Design</li>
        <li>Product Management</li>
      </ol>
      
      <h2>Как развивать карьеру</h2>
      <p>Постоянное обучение — ключ к успеху. Инвестируйте в себя, проходите курсы, участвуйте в проектах и не бойтесь пробовать новое.</p>
      
      <h2>Зарплаты в IT</h2>
      <p>По данным исследований, средняя зарплата AI-инженера в 2025 году составляет $150,000-$250,000 в год. Full-stack разработчики зарабатывают $100,000-$180,000.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=600&fit=crop',
    category: 'Career',
    tags: ['Карьера', 'IT', 'Навыки', 'Зарплата'],
    author: {
      name: 'Елена Волкова',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      role: 'Career Coach & HR Expert'
    },
    publishedAt: '2025-01-20',
    readTime: 10,
    views: 18700,
    likes: 1120,
    featured: false
  },
  {
    id: '4',
    slug: 'design-trends-2025',
    title: 'Тренды веб-дизайна 2025: От минимализма до AI-генерации',
    excerpt: 'Обзор актуальных трендов в дизайне интерфейсов, которые формируют визуальный язык современного веба.',
    content: `
      <h2>Эволюция веб-дизайна</h2>
      <p>Дизайн веб-приложений меняется каждый год. В 2025 году мы наблюдаем интересное сочетание минимализма и сложных AI-генерированных элементов.</p>
      
      <h2>Главные тренды 2025</h2>
      <h3>1. Glassmorphism 2.0</h3>
      <p>Стеклянные эффекты с размытием фона стали еще более утонченными и практичными.</p>
      
      <h3>2. AI-Generated Graphics</h3>
      <p>Искусственный интеллект создает уникальные визуальные элементы для каждого пользователя.</p>
      
      <h3>3. Dark Mode First</h3>
      <p>Темная тема стала стандартом, а светлая — опциональной.</p>
      
      <h3>4. Micro-interactions</h3>
      <p>Небольшие анимации делают интерфейс живым и отзывчивым.</p>
      
      <h2>Инструменты дизайнера</h2>
      <p>Figma, Framer, и AI-powered tools вроде Midjourney и DALL-E изменили рабочий процесс дизайнеров навсегда.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=600&fit=crop',
    category: 'Design',
    tags: ['Дизайн', 'UI/UX', 'Тренды', 'Веб'],
    author: {
      name: 'Максим Новиков',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      role: 'Lead UI/UX Designer'
    },
    publishedAt: '2025-01-15',
    readTime: 7,
    views: 12300,
    likes: 780,
    featured: false
  },
  {
    id: '5',
    slug: 'startup-guide-2025',
    title: 'Запуск стартапа в 2025: От идеи до первых клиентов за 90 дней',
    excerpt: 'Пошаговое руководство по созданию успешного стартапа: валидация идеи, MVP, привлечение пользователей и монетизация.',
    content: `
      <h2>Стартап-путь в 2025</h2>
      <p>Запустить стартап никогда не было так просто благодаря low-code платформам, AI-инструментам и облачным сервисам. Но как сделать это правильно?</p>
      
      <h2>Этап 1: Валидация идеи (Дни 1-21)</h2>
      <ul>
        <li>Найдите проблему, которую хотите решить</li>
        <li>Проведите интервью с потенциальными клиентами</li>
        <li>Изучите конкурентов</li>
        <li>Создайте landing page для сбора email</li>
      </ul>
      
      <h2>Этап 2: Создание MVP (Дни 22-60)</h2>
      <ul>
        <li>Определите минимальный набор функций</li>
        <li>Выберите технологический стек</li>
        <li>Разработайте прототип</li>
        <li>Проведите beta-тестирование</li>
      </ul>
      
      <h2>Этап 3: Запуск и рост (Дни 61-90)</h2>
      <ul>
        <li>Публичный запуск на Product Hunt</li>
        <li>Контент-маркетинг и SEO</li>
        <li>Работа с первыми клиентами</li>
        <li>Итерации на основе feedback</li>
      </ul>
      
      <h2>Ключевые метрики</h2>
      <p>Отслеживайте: CAC (стоимость привлечения клиента), LTV (пожизненная ценность), churn rate, и MRR (месячный повторяющийся доход).</p>
      
      <blockquote>
        "Лучший способ предсказать будущее — создать его. Начните сегодня!"
      </blockquote>
    `,
    coverImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&h=600&fit=crop',
    category: 'Business',
    tags: ['Стартап', 'Бизнес', 'Предпринимательство', 'MVP'],
    author: {
      name: 'Алексей Соколов',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      role: 'Startup Founder & Business Coach'
    },
    publishedAt: '2025-01-10',
    readTime: 15,
    views: 9800,
    likes: 620,
    featured: false
  },
  {
    id: '6',
    slug: 'effective-learning-strategies',
    title: 'Наука эффективного обучения: 7 техник для быстрого усвоения информации',
    excerpt: 'Научно обоснованные методики обучения, которые помогут вам учиться быстрее и запоминать больше.',
    content: `
      <h2>Как учиться эффективно</h2>
      <p>Исследования в области нейронауки показывают, что правильные техники обучения могут увеличить скорость усвоения информации в 3-5 раз.</p>
      
      <h2>7 доказанных техник</h2>
      
      <h3>1. Spaced Repetition (Интервальные повторения)</h3>
      <p>Повторяйте материал через увеличивающиеся интервалы: 1 день, 3 дня, 7 дней, 14 дней.</p>
      
      <h3>2. Active Recall (Активное воспроизведение)</h3>
      <p>Вместо перечитывания — закройте книгу и попытайтесь вспомнить материал.</p>
      
      <h3>3. Feynman Technique</h3>
      <p>Объясните тему простыми словами, как будто учите ребенка.</p>
      
      <h3>4. Pomodoro Method</h3>
      <p>25 минут фокусной работы, 5 минут отдыха. После 4 циклов — длинный перерыв.</p>
      
      <h3>5. Interleaving (Чередование)</h3>
      <p>Смешивайте разные темы вместо изучения одной темы за раз.</p>
      
      <h3>6. Teaching Others</h3>
      <p>Обучение других — лучший способ закрепить знания.</p>
      
      <h3>7. Sleep and Exercise</h3>
      <p>Полноценный сон (7-9 часов) и физические упражнения улучшают память на 40%.</p>
      
      <h2>Практическое применение</h2>
      <p>Комбинируйте эти техники в своем обучении. Наша платформа уже использует spaced repetition и active recall в интерактивных тестах!</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=600&fit=crop',
    category: 'Learning',
    tags: ['Обучение', 'Продуктивность', 'Память', 'Нейронаука'],
    author: {
      name: 'Ирина Кузнецова',
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop',
      role: 'Learning Science Expert'
    },
    publishedAt: '2025-01-05',
    readTime: 9,
    views: 21400,
    likes: 1580,
    featured: true
  }
];

// English blog posts
const blogPostsEn: BlogPost[] = [
  {
    id: '1',
    slug: 'ai-revolution-in-education',
    title: 'AI Revolution in Education: How Machine Learning is Transforming the Way We Learn',
    excerpt: 'Artificial Intelligence is transforming education, making learning personalized, accessible, and effective. Discover how AI helps students achieve better results.',
    content: `
      <h2>Introduction to AI-Powered Education</h2>
      <p>Artificial Intelligence is radically changing the approach to learning. Traditional education methods are giving way to personalized, adaptive systems that consider the individual needs of each student.</p>
      
      <h2>Key Benefits of AI in Learning</h2>
      <ul>
        <li><strong>Personalization:</strong> AI adapts content to your knowledge level and learning style</li>
        <li><strong>24/7 Availability:</strong> Learn anytime with an AI assistant</li>
        <li><strong>Instant Feedback:</strong> Get answers to questions without delays</li>
        <li><strong>Adaptive Tests:</strong> The system adjusts to your progress</li>
      </ul>
      
      <h2>Future Technologies Are Already Here</h2>
      <p>Modern AI platforms use cutting-edge machine learning technologies to create a unique educational experience. Natural Language Processing enables dialogue with AI tutors, while adaptive learning algorithms adjust material difficulty in real-time.</p>
      
      <blockquote>
        "AI doesn't replace teachers—it complements them, making education more accessible and effective for millions of people worldwide."
      </blockquote>
      
      <h2>Practical Application</h2>
      <p>On our platform, you can choose your learning format: text lessons, interactive quizzes, AI chat, or practical assignments. AI automatically adapts content to the selected format while maintaining quality and depth.</p>
      
      <h2>The Future of Education</h2>
      <p>We're only at the beginning. In the coming years, AI-powered education will become the norm, and personalized learning will be available to everyone. Join the revolution today!</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=600&fit=crop',
    category: 'AI',
    tags: ['AI', 'Education', 'Machine Learning', 'EdTech'],
    author: {
      name: 'Anna Smirnova',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      role: 'AI Research Lead'
    },
    publishedAt: '2025-01-28',
    readTime: 8,
    views: 15420,
    likes: 892,
    featured: true
  },
  {
    id: '2',
    slug: 'mastering-javascript-2025',
    title: '10 Modern JavaScript Features Every Developer Should Know in 2025',
    excerpt: 'JavaScript continues to evolve. Learn the latest language features that make code cleaner, faster, and safer.',
    content: `
      <h2>JavaScript in 2025</h2>
      <p>JavaScript remains the most popular programming language, and new features emerge every year that make development easier and more efficient.</p>
      
      <h2>1. Optional Chaining and Nullish Coalescing</h2>
      <pre><code>// Optional Chaining
const userName = user?.profile?.name;

// Nullish Coalescing
const displayName = userName ?? 'Anonymous';</code></pre>
      
      <h2>2. Private Class Fields</h2>
      <p>Now you can create truly private fields in classes using the # symbol:</p>
      <pre><code>class BankAccount {
  #balance = 0;
  
  deposit(amount) {
    this.#balance += amount;
  }
}</code></pre>
      
      <h2>3. Top-level await</h2>
      <p>Use await at the top level of modules without wrapping in an async function.</p>
      
      <h2>Conclusion</h2>
      <p>These and many other features make JavaScript more powerful. Learn them in our courses!</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=1200&h=600&fit=crop',
    category: 'Programming',
    tags: ['JavaScript', 'ES2025', 'Web Development', 'Frontend'],
    author: {
      name: 'Dmitry Petrov',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      role: 'Senior Full-Stack Developer'
    },
    publishedAt: '2025-01-25',
    readTime: 12,
    views: 23150,
    likes: 1340,
    featured: true
  },
  {
    id: '3',
    slug: 'career-growth-tech-2025',
    title: 'Tech Career 2025: In-Demand Skills and How to Acquire Them',
    excerpt: 'Job market analysis, top skills for IT professionals, and career development strategy in the tech industry.',
    content: `
      <h2>IT Market in 2025</h2>
      <p>The tech industry continues to grow, creating millions of jobs. But what skills really matter?</p>
      
      <h2>Top 10 In-Demand Skills</h2>
      <ol>
        <li>AI/ML Engineering</li>
        <li>Cloud Architecture (AWS, Azure, GCP)</li>
        <li>Full-Stack Development</li>
        <li>DevOps and CI/CD</li>
        <li>Cybersecurity</li>
        <li>Data Science & Analytics</li>
        <li>Mobile Development (React Native, Flutter)</li>
        <li>Blockchain Development</li>
        <li>UI/UX Design</li>
        <li>Product Management</li>
      </ol>
      
      <h2>How to Grow Your Career</h2>
      <p>Continuous learning is the key to success. Invest in yourself, take courses, participate in projects, and don't be afraid to try new things.</p>
      
      <h2>IT Salaries</h2>
      <p>According to research, the average AI engineer salary in 2025 is $150,000-$250,000 per year. Full-stack developers earn $100,000-$180,000.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=600&fit=crop',
    category: 'Career',
    tags: ['Career', 'IT', 'Skills', 'Salary'],
    author: {
      name: 'Elena Volkova',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      role: 'Career Coach & HR Expert'
    },
    publishedAt: '2025-01-20',
    readTime: 10,
    views: 18700,
    likes: 1120,
    featured: false
  },
  {
    id: '4',
    slug: 'design-trends-2025',
    title: 'Web Design Trends 2025: From Minimalism to AI Generation',
    excerpt: 'Overview of current interface design trends shaping the visual language of modern web.',
    content: `
      <h2>Evolution of Web Design</h2>
      <p>Web application design changes every year. In 2025, we observe an interesting combination of minimalism and complex AI-generated elements.</p>
      
      <h2>Main Trends of 2025</h2>
      <h3>1. Glassmorphism 2.0</h3>
      <p>Glass effects with background blur have become even more refined and practical.</p>
      
      <h3>2. AI-Generated Graphics</h3>
      <p>Artificial intelligence creates unique visual elements for each user.</p>
      
      <h3>3. Dark Mode First</h3>
      <p>Dark theme has become the standard, while light theme is optional.</p>
      
      <h3>4. Micro-interactions</h3>
      <p>Small animations make the interface alive and responsive.</p>
      
      <h2>Designer's Tools</h2>
      <p>Figma, Framer, and AI-powered tools like Midjourney and DALL-E have changed designers' workflow forever.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=600&fit=crop',
    category: 'Design',
    tags: ['Design', 'UI/UX', 'Trends', 'Web'],
    author: {
      name: 'Maxim Novikov',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      role: 'Lead UI/UX Designer'
    },
    publishedAt: '2025-01-15',
    readTime: 7,
    views: 12300,
    likes: 780,
    featured: false
  },
  {
    id: '5',
    slug: 'startup-guide-2025',
    title: 'Launching a Startup in 2025: From Idea to First Customers in 90 Days',
    excerpt: 'Step-by-step guide to creating a successful startup: idea validation, MVP, user acquisition, and monetization.',
    content: `
      <h2>The Startup Path in 2025</h2>
      <p>Launching a startup has never been easier thanks to low-code platforms, AI tools, and cloud services. But how to do it right?</p>
      
      <h2>Stage 1: Idea Validation (Days 1-21)</h2>
      <ul>
        <li>Find a problem you want to solve</li>
        <li>Conduct interviews with potential customers</li>
        <li>Study competitors</li>
        <li>Create a landing page to collect emails</li>
      </ul>
      
      <h2>Stage 2: Building MVP (Days 22-60)</h2>
      <ul>
        <li>Define minimum feature set</li>
        <li>Choose tech stack</li>
        <li>Develop prototype</li>
        <li>Conduct beta testing</li>
      </ul>
      
      <h2>Stage 3: Launch and Growth (Days 61-90)</h2>
      <ul>
        <li>Public launch on Product Hunt</li>
        <li>Content marketing and SEO</li>
        <li>Work with first customers</li>
        <li>Iterate based on feedback</li>
      </ul>
      
      <h2>Key Metrics</h2>
      <p>Track: CAC (customer acquisition cost), LTV (lifetime value), churn rate, and MRR (monthly recurring revenue).</p>
      
      <blockquote>
        "The best way to predict the future is to create it. Start today!"
      </blockquote>
    `,
    coverImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&h=600&fit=crop',
    category: 'Business',
    tags: ['Startup', 'Business', 'Entrepreneurship', 'MVP'],
    author: {
      name: 'Alexey Sokolov',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      role: 'Startup Founder & Business Coach'
    },
    publishedAt: '2025-01-10',
    readTime: 15,
    views: 9800,
    likes: 620,
    featured: false
  },
  {
    id: '6',
    slug: 'effective-learning-strategies',
    title: 'The Science of Effective Learning: 7 Techniques for Fast Information Absorption',
    excerpt: 'Science-based learning methods that will help you learn faster and remember more.',
    content: `
      <h2>How to Learn Effectively</h2>
      <p>Neuroscience research shows that proper learning techniques can increase information absorption speed by 3-5 times.</p>
      
      <h2>7 Proven Techniques</h2>
      
      <h3>1. Spaced Repetition</h3>
      <p>Repeat material at increasing intervals: 1 day, 3 days, 7 days, 14 days.</p>
      
      <h3>2. Active Recall</h3>
      <p>Instead of rereading—close the book and try to remember the material.</p>
      
      <h3>3. Feynman Technique</h3>
      <p>Explain the topic in simple words, as if teaching a child.</p>
      
      <h3>4. Pomodoro Method</h3>
      <p>25 minutes of focused work, 5 minutes of rest. After 4 cycles—a long break.</p>
      
      <h3>5. Interleaving</h3>
      <p>Mix different topics instead of studying one topic at a time.</p>
      
      <h3>6. Teaching Others</h3>
      <p>Teaching others is the best way to consolidate knowledge.</p>
      
      <h3>7. Sleep and Exercise</h3>
      <p>Full sleep (7-9 hours) and physical exercise improve memory by 40%.</p>
      
      <h2>Practical Application</h2>
      <p>Combine these techniques in your learning. Our platform already uses spaced repetition and active recall in interactive tests!</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=600&fit=crop',
    category: 'Learning',
    tags: ['Learning', 'Productivity', 'Memory', 'Neuroscience'],
    author: {
      name: 'Irina Kuznetsova',
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop',
      role: 'Learning Science Expert'
    },
    publishedAt: '2025-01-05',
    readTime: 9,
    views: 21400,
    likes: 1580,
    featured: true
  }
];

// German, Spanish, French use same structure (abbreviated for space)
const blogPostsDe: BlogPost[] = blogPostsEn.map(post => ({
  ...post,
  tags: post.tags.map(tag => tag) // Keep English tags for simplicity
}));

const blogPostsEs: BlogPost[] = blogPostsEn.map(post => ({
  ...post,
  tags: post.tags.map(tag => tag)
}));

const blogPostsFr: BlogPost[] = blogPostsEn.map(post => ({
  ...post,
  tags: post.tags.map(tag => tag)
}));

// Centralized blog posts by locale
const blogPostsByLocale: BlogPostTranslations = {
  ru: blogPostsRu,
  en: blogPostsEn,
  de: blogPostsDe,
  es: blogPostsEs,
  fr: blogPostsFr
};

// Get blog posts for specific locale
export const getBlogPosts = (locale: Locale = 'en'): BlogPost[] => {
  return blogPostsByLocale[locale] || blogPostsByLocale.en;
};

// Get blog post by slug for specific locale
export const getBlogPostBySlug = (slug: string, locale: Locale = 'en'): BlogPost | undefined => {
  const posts = getBlogPosts(locale);
  return posts.find(post => post.slug === slug);
};

// Get featured posts for specific locale
export const getFeaturedPosts = (locale: Locale = 'en'): BlogPost[] => {
  const posts = getBlogPosts(locale);
  return posts.filter(post => post.featured);
};

// Get posts by category for specific locale
export const getPostsByCategory = (category: BlogCategory, locale: Locale = 'en'): BlogPost[] => {
  const posts = getBlogPosts(locale);
  return posts.filter(post => post.category === category);
};

// Get related posts (same category, excluding current post) for specific locale
export const getRelatedPosts = (currentPostId: string, locale: Locale = 'en', limit: number = 3): BlogPost[] => {
  const posts = getBlogPosts(locale);
  const currentPost = posts.find(post => post.id === currentPostId);
  if (!currentPost) return [];
  
  return posts
    .filter(post => post.id !== currentPostId && post.category === currentPost.category)
    .slice(0, limit);
};

// Search posts for specific locale
export const searchPosts = (query: string, locale: Locale = 'en'): BlogPost[] => {
  const posts = getBlogPosts(locale);
  const lowerQuery = query.toLowerCase();
  return posts.filter(post => 
    post.title.toLowerCase().includes(lowerQuery) ||
    post.excerpt.toLowerCase().includes(lowerQuery) ||
    post.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

// Keep backward compatibility
export const mockBlogPosts = blogPostsEn;
