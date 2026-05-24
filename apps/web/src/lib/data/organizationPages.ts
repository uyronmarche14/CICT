export interface OrganizationPage {
  id: string;
  name: string;
  fullName: string;
  tagline: string;
  description: string;
  mission: string;
  vision: string;
  established: string;
  heroImage: string;
  logo: string;
  color: {
    primary: string;
    secondary: string;
  };
  programs: {
    title: string;
    description: string;
    icon: string;
  }[];
  achievements: string[];
  events: {
    title: string;
    description: string;
    frequency: string;
  }[];
  benefits: string[];
  joinInfo: {
    requirements: string[];
    process: string[];
    contact: string;
  };
}

export const organizationPages: OrganizationPage[] = [
  {
    id: 'ict-sf',
    name: 'ICT-SF',
    fullName: 'ICT Student Forum',
    tagline: 'Empowering Future Tech Leaders',
    description: 'The ICT Student Forum is the premier student organization for Information and Communication Technology students. We foster innovation, collaboration, and professional development through workshops, hackathons, and industry partnerships.',
    mission: 'To empower ICT students through innovative programs, industry partnerships, and collaborative projects that prepare them for successful careers in technology.',
    vision: 'To be the leading student-driven ICT organization that shapes future technology leaders and innovators.',
    established: '2018',
    heroImage: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1755790148/529718384_122100992648966778_7029427848362639164_n_geskab.jpg',
    logo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1756660317/462565204_1269444047476302_4529409729196861854_n_axdm9t.jpg',
    color: {
      primary: '#6e29f6',
      secondary: '#f629a8',
    },
    programs: [
      {
        title: 'Tech Workshops',
        description: 'Hands-on workshops covering latest technologies, frameworks, and industry best practices.',
        icon: '💻',
      },
      {
        title: 'Hackathons',
        description: 'Annual coding competitions bringing together students to solve real-world problems.',
        icon: '🏆',
      },
      {
        title: 'Industry Talks',
        description: 'Guest speakers from leading tech companies sharing insights and career advice.',
        icon: '🎤',
      },
      {
        title: 'Mentorship Program',
        description: 'Connecting junior students with senior mentors for guidance and support.',
        icon: '🤝',
      },
    ],
    achievements: [
      'Best Student Organization 2023',
      'National Hackathon Champions 2022',
      'Industry Partnership Excellence Award',
      '1000+ Members Empowered',
      '50+ Successful Events Organized',
    ],
    events: [
      {
        title: 'Annual Hackathon',
        description: '48-hour coding marathon with prizes and industry mentorship',
        frequency: 'Yearly',
      },
      {
        title: 'Tech Talks Series',
        description: 'Monthly sessions with industry professionals',
        frequency: 'Monthly',
      },
      {
        title: 'Workshop Wednesdays',
        description: 'Weekly hands-on technical workshops',
        frequency: 'Weekly',
      },
    ],
    benefits: [
      'Access to exclusive workshops and training',
      'Networking opportunities with industry professionals',
      'Career development and mentorship',
      'Leadership and project management experience',
      'Certificate of participation and recognition',
    ],
    joinInfo: {
      requirements: [
        'Currently enrolled ICT student',
        'Passion for technology and innovation',
        'Commitment to attend regular meetings',
        'Willingness to contribute to projects',
      ],
      process: [
        'Fill out online application form',
        'Attend orientation session',
        'Complete onboarding activities',
        'Start participating in events',
      ],
      contact: 'ictsf@university.edu',
    },
  },
  {
    id: 'css',
    name: 'CSS',
    fullName: 'Computer Science Society',
    tagline: 'Advancing Computer Science Excellence',
    description: 'The Computer Science Society is dedicated to advancing computer science education, research, and innovation. We organize coding competitions, research symposiums, and collaborative projects that push the boundaries of technology.',
    mission: 'To advance computer science education through research, innovation, and collaborative learning experiences that prepare students for cutting-edge careers.',
    vision: 'To be the premier computer science society that fosters research excellence and technological innovation.',
    established: '2019',
    heroImage: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1756660320/cict4_qqksfh.jpg',
    logo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1757693143/CSS_Logo_PNG_x0jjcp.png',
    color: {
      primary: '#2563eb',
      secondary: '#0891b2',
    },
    programs: [
      {
        title: 'Research Projects',
        description: 'Collaborative research initiatives in AI, ML, and emerging technologies.',
        icon: '🔬',
      },
      {
        title: 'Coding Competitions',
        description: 'Regular programming contests to sharpen problem-solving skills.',
        icon: '⚡',
      },
      {
        title: 'Open Source Contributions',
        description: 'Contributing to open-source projects and building portfolios.',
        icon: '🌐',
      },
      {
        title: 'Academic Support',
        description: 'Peer tutoring and study groups for CS courses.',
        icon: '📚',
      },
    ],
    achievements: [
      'Research Publication Excellence',
      'International Programming Competition Finalists',
      'Open Source Contribution Award',
      'Academic Partnership Recognition',
      '25+ Research Projects Completed',
    ],
    events: [
      {
        title: 'Research Symposium',
        description: 'Annual showcase of student research projects',
        frequency: 'Yearly',
      },
      {
        title: 'Code Sprint',
        description: 'Monthly competitive programming challenges',
        frequency: 'Monthly',
      },
      {
        title: 'Algorithm Study Group',
        description: 'Weekly sessions on data structures and algorithms',
        frequency: 'Weekly',
      },
    ],
    benefits: [
      'Research opportunities with faculty',
      'Access to advanced computing resources',
      'Competitive programming training',
      'Publication and conference opportunities',
      'Strong alumni network in tech industry',
    ],
    joinInfo: {
      requirements: [
        'Computer Science major or minor',
        'Strong interest in research and innovation',
        'Basic programming knowledge',
        'Academic standing in good standing',
      ],
      process: [
        'Submit application with academic transcript',
        'Attend welcome meeting',
        'Join a research or project team',
        'Participate in society activities',
      ],
      contact: 'css@university.edu',
    },
  },
  {
    id: 'iss',
    name: 'ISS',
    fullName: 'Information Systems Society',
    tagline: 'Bridging Business and Technology',
    description: 'The Information Systems Society focuses on the intersection of business and technology. We prepare students for careers in business analysis, systems design, and digital transformation through practical projects and industry collaboration.',
    mission: 'To develop information systems professionals who can bridge business needs with technological solutions through strategic thinking and practical implementation.',
    vision: 'To be the leading society for information systems excellence, producing graduates who drive digital transformation in organizations.',
    established: '2020',
    heroImage: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1756660318/459388087_1210395166778357_1242381946816835441_n_vrx5th.jpg',
    logo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1757693146/ISS_Logo_bgwwn0.png',
    color: {
      primary: '#059669',
      secondary: '#0d9488',
    },
    programs: [
      {
        title: 'Business Analysis',
        description: 'Training in requirements gathering, process modeling, and stakeholder management.',
        icon: '📊',
      },
      {
        title: 'Consulting Projects',
        description: 'Real-world consulting engagements with local businesses.',
        icon: '💼',
      },
      {
        title: 'Database Management',
        description: 'Workshops on database design, SQL, and data analytics.',
        icon: '🗄️',
      },
      {
        title: 'Enterprise Systems',
        description: 'Training on ERP, CRM, and enterprise software solutions.',
        icon: '🏢',
      },
    ],
    achievements: [
      'Best Business-Technology Integration Project',
      'Industry Consulting Excellence Award',
      'Digital Transformation Case Competition Winners',
      'Enterprise Systems Certification Program',
      '30+ Business Solutions Delivered',
    ],
    events: [
      {
        title: 'Case Competition',
        description: 'Annual business-technology case analysis competition',
        frequency: 'Yearly',
      },
      {
        title: 'Industry Panels',
        description: 'Monthly discussions with IS professionals',
        frequency: 'Monthly',
      },
      {
        title: 'Project Workshops',
        description: 'Weekly hands-on business analysis sessions',
        frequency: 'Weekly',
      },
    ],
    benefits: [
      'Real-world consulting experience',
      'Business analysis certification prep',
      'Industry networking events',
      'Internship and job placement support',
      'Professional development workshops',
    ],
    joinInfo: {
      requirements: [
        'Information Systems student',
        'Interest in business and technology',
        'Strong analytical skills',
        'Team collaboration mindset',
      ],
      process: [
        'Complete online registration',
        'Attend orientation workshop',
        'Join a project team',
        'Engage in society activities',
      ],
      contact: 'iss@university.edu',
    },
  },
  {
    id: 'robotcu',
    name: 'ROBOTCU',
    fullName: 'Robotics Club University',
    tagline: 'Building the Future with Robotics',
    description: 'ROBOTCU is the premier robotics organization dedicated to advancing robotics education, research, and competition. We bring together students to work on complex robotics projects and participate in national and international competitions.',
    mission: 'To advance robotics education and innovation through interdisciplinary collaboration, competitive excellence, and cutting-edge research that shapes the future of automation.',
    vision: 'To be the leading university robotics organization that produces world-class roboticists and transformative robotic solutions.',
    established: '2017',
    heroImage: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
    logo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1757693129/ROBOTCU_Logo_hvrjkk.png',
    color: {
      primary: '#dc2626',
      secondary: '#ea580c',
    },
    programs: [
      {
        title: 'Robot Design',
        description: 'Hands-on experience designing and building robots from scratch.',
        icon: '🤖',
      },
      {
        title: 'Competition Teams',
        description: 'Participate in national and international robotics competitions.',
        icon: '🏅',
      },
      {
        title: 'AI & Automation',
        description: 'Implementing AI algorithms for autonomous robot control.',
        icon: '🧠',
      },
      {
        title: 'Workshops',
        description: 'Regular training on electronics, programming, and mechanical design.',
        icon: '🔧',
      },
    ],
    achievements: [
      'National Robotics Competition Champions',
      'International Autonomous Vehicle Challenge Finalists',
      'Best Research Paper in Robotics',
      'Industry Partnership for Robotics Innovation',
      '15+ Competition Awards Won',
    ],
    events: [
      {
        title: 'RoboCup',
        description: 'Annual robotics competition with multiple categories',
        frequency: 'Yearly',
      },
      {
        title: 'Build Sessions',
        description: 'Monthly robot building and testing workshops',
        frequency: 'Monthly',
      },
      {
        title: 'Tech Talks',
        description: 'Weekly discussions on robotics technologies',
        frequency: 'Weekly',
      },
    ],
    benefits: [
      'Access to robotics lab and equipment',
      'Competition funding and support',
      'Mentorship from experienced members',
      'Industry connections and internships',
      'Hands-on engineering experience',
    ],
    joinInfo: {
      requirements: [
        'Interest in robotics and automation',
        'Basic programming or electronics knowledge',
        'Commitment to team projects',
        'Willingness to learn and experiment',
      ],
      process: [
        'Attend open house event',
        'Complete safety training',
        'Join a project team',
        'Start building robots!',
      ],
      contact: 'robotcu@university.edu',
    },
  },
  {
    id: 'best',
    name: 'BEST',
    fullName: 'Board of European Students of Technology',
    tagline: 'Connecting Technology Students Across Europe',
    description: 'BEST is an international student organization fostering cooperation, cultural exchange, and technological advancement. We provide complementary education, career support, and cultural exchange opportunities for engineering and technology students.',
    mission: 'To provide complementary education and career support for students of technology, while fostering international cooperation and cultural understanding.',
    vision: 'To create a world where technology students can develop their full potential through international experiences and lifelong learning.',
    established: '1989',
    heroImage: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1755790148/529718384_122100992648966778_7029427848362639164_n_geskab.jpg',
    logo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1757693131/BEST_CS_Logo_svstr3.png',
    color: {
      primary: '#7c3aed',
      secondary: '#8b5cf6',
    },
    programs: [
      {
        title: 'Academic Courses',
        description: 'Complementary courses on various engineering topics.',
        icon: '🎓',
      },
      {
        title: 'Cultural Exchange',
        description: 'International events and student exchanges across Europe.',
        icon: '🌍',
      },
      {
        title: 'Career Events',
        description: 'Job fairs, company visits, and career development workshops.',
        icon: '💼',
      },
      {
        title: 'Competitions',
        description: 'Engineering competitions and case study challenges.',
        icon: '🏆',
      },
    ],
    achievements: [
      'European Student Organization Excellence Award',
      '100+ International Events Organized',
      '5000+ Students Impacted',
      'Cultural Exchange Program Recognition',
      '25+ Years of Continuous Operation',
    ],
    events: [
      {
        title: 'BEST Engineering Competition',
        description: 'Annual European-wide engineering challenge',
        frequency: 'Yearly',
      },
      {
        title: 'Academic Courses',
        description: 'Semester-long specialized courses',
        frequency: 'Semesterly',
      },
      {
        title: 'Cultural Nights',
        description: 'Monthly cultural exchange events',
        frequency: 'Monthly',
      },
    ],
    benefits: [
      'International networking opportunities',
      'Cultural exchange experiences',
      'Complementary education programs',
      'Career development support',
      'Leadership training',
    ],
    joinInfo: {
      requirements: [
        'Engineering or technology student',
        'Interest in international cooperation',
        'Good English communication skills',
        'Open to cultural diversity',
      ],
      process: [
        'Submit application form',
        'Attend introduction meeting',
        'Complete training program',
        'Join local group activities',
      ],
      contact: 'best@university.edu',
    },
  },
];
