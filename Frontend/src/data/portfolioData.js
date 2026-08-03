export const sectionsList = [
  { name: 'about.tsx', id: 'about' },
  { name: 'work.js', id: 'work' },
  { name: 'skills.json', id: 'skills' },
  { name: 'experience.log', id: 'experience' },
  { name: 'contact.md', id: 'contact' }
];

export const stats = [
  { value: '8+', label: 'Years Experience' },
  { value: '40+', label: 'Shipped Projects' },
  { value: '99.99%', label: 'System Uptime' }
];

export const projects = [
  {
    name: 'AI Powered Intern Management System',
    extension: '.tsx',
    desc: 'A smart management system powered by AI to automate intern onboarding, task assignment, progress tracking, and performance evaluation.',
    metric: 'Live at intern-management-system.vercel.app',
    tech: 'React / TypeScript / OpenAI / Node.js',
    href: 'https://github.com/vrajgoti07/AI-powered-intern-management-system'
  },
  {
    name: 'Smart Timetable Generation',
    extension: '.js',
    desc: 'An intelligent scheduling system that automatically generates clash-free academic timetables using genetic algorithms and resource constraints.',
    metric: 'Optimized scheduling conflict resolution by 95%',
    tech: 'JavaScript / Node.js / HTML5 / CSS3',
    href: 'https://github.com/vrajgoti07/Smart-TimeTable-Generation'
  },
  {
    name: 'AI Learning Roadmap',
    extension: '.md',
    desc: 'A curated roadmap and resource collection for mastering artificial intelligence, machine learning, and neural network foundations.',
    metric: 'Comprehensive guide for learners',
    tech: 'Markdown / Git / AI Resources',
    href: 'https://github.com/vrajgoti07/AI-Learning-RoadMap'
  }
];

export const skills = [
  { name: 'Backend Architecture & APIs', percentage: 94 },
  { name: 'Python Development (Django / FastAPI)', percentage: 88 },
  { name: 'Distributed Systems & Databases', percentage: 91 },
  { name: 'Performance Optimization & Scripting', percentage: 85 }
];

export const experience = [
  {
    hash: 'commit e24b7a1',
    role: 'Principal Backend Developer @ Voxel Systems',
    dates: '2024 - Present',
    desc: 'Led migration to micro-frontends and event-driven backends. Mentored 12+ developers, established CI/CD pipelines, and reduced cloud infrastructure spend by 30%.'
  },
  {
    hash: 'commit d9f10a8',
    role: 'Senior Backend Developer @ CloudScale',
    dates: '2021 - 2024',
    desc: 'Architected Go-based message queue broker scaling to billions of daily messages. Replaced legacy services in Go, cutting memory footprint by 65%.'
  },
  {
    hash: 'commit b5a371c',
    role: 'Python Developer @ ApexLabs',
    dates: '2018 - 2021',
    desc: 'Developed real-time collaborative whiteboards and data visualization dashboards using React and WebSockets.'
  }
];
