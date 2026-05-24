import { NewsStatus } from '@/types';

export interface NewsArticle {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: NewsStatus;
  publishedAt: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export const newsArticles: NewsArticle[] = [
  {
    _id: 'cict-hackathon-2024',
    title: 'CICT Hosts Annual Hackathon 2024',
    excerpt: 'Over 200 students participated in the biggest coding competition of the year, showcasing innovative solutions to real-world problems.',
    content: `The College of Information and Communication Technology successfully hosted its Annual Hackathon 2024, bringing together over 200 talented students from various programs. The 48-hour coding marathon challenged participants to develop innovative solutions addressing real-world problems in healthcare, education, and sustainability.

The event featured mentorship sessions from industry professionals, workshops on cutting-edge technologies, and networking opportunities with potential employers. Teams worked tirelessly to create functional prototypes, with judges evaluating projects based on innovation, technical implementation, and potential impact.

The winning team, "CodeCrafters," developed an AI-powered platform for early disease detection using machine learning algorithms. Their solution impressed judges with its practical application and scalability potential. The team received a cash prize of $5,000 and mentorship opportunities with leading tech companies.

This year's hackathon also emphasized diversity and inclusion, with special tracks for underrepresented groups in technology. The event successfully fostered collaboration, creativity, and problem-solving skills among participants while strengthening the CICT community.`,
    imageUrl: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1755790148/529718384_122100992648966778_7029427848362639164_n_geskab.jpg',
    status: NewsStatus.PUBLISHED,
    author: {
      _id: 'auth-1',
      firstName: 'Maria',
      lastName: 'Santos',
      email: 'maria.santos@cict.edu'
    },
    publishedAt: '2024-03-15T10:00:00Z',
    tags: ['Hackathon', 'Innovation', 'Competition', 'Technology'],
    createdAt: '2024-03-15T09:00:00Z',
    updatedAt: '2024-03-15T09:00:00Z',
  },
  {
    _id: 'research-excellence-award',
    title: 'CICT Faculty Receives National Research Excellence Award',
    excerpt: 'Professor John Doe recognized for groundbreaking work in artificial intelligence and machine learning applications.',
    content: `Professor John Doe from the Computer Science department has been awarded the prestigious National Research Excellence Award for his groundbreaking contributions to artificial intelligence and machine learning. His research on neural network optimization has been published in top-tier international journals and has garnered significant attention from the global research community.

The award recognizes Professor Doe's innovative approach to solving complex computational problems and his dedication to advancing the field of AI. His work has practical applications in various industries, including healthcare diagnostics, financial forecasting, and autonomous systems.

Professor Doe's research team, comprising graduate students and fellow faculty members, has been instrumental in developing novel algorithms that improve the efficiency and accuracy of machine learning models. Their collaborative efforts have resulted in multiple patents and industry partnerships.

This recognition not only highlights individual excellence but also showcases CICT's commitment to fostering a research-driven academic environment. The college continues to invest in cutting-edge facilities and resources to support faculty and student research initiatives.`,
    imageUrl: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1756660320/cict4_qqksfh.jpg',
    status: NewsStatus.PUBLISHED,
    author: {
      _id: 'auth-2',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@cict.edu'
    },
    publishedAt: '2024-03-10T14:30:00Z',
    tags: ['Research', 'Award', 'AI', 'Faculty'],
    createdAt: '2024-03-10T14:00:00Z',
    updatedAt: '2024-03-10T14:00:00Z',
  },
  {
    _id: 'new-ai-lab-opening',
    title: 'State-of-the-Art AI Research Lab Opens at CICT',
    excerpt: 'New facility equipped with latest technology to support advanced research in artificial intelligence and data science.',
    content: `CICT proudly announces the opening of its new state-of-the-art Artificial Intelligence Research Laboratory, a cutting-edge facility designed to support advanced research and innovation in AI, machine learning, and data science. The lab features high-performance computing clusters, specialized AI hardware, and collaborative workspaces for researchers and students.

The facility is equipped with the latest NVIDIA GPUs, quantum computing simulators, and advanced visualization tools, enabling researchers to tackle complex computational challenges. The lab will serve as a hub for interdisciplinary collaboration, bringing together experts from computer science, mathematics, and domain-specific fields.

Students will have access to industry-standard tools and platforms, providing hands-on experience with technologies used by leading tech companies. The lab will also host workshops, seminars, and training sessions to build AI literacy across the college community.

This investment reflects CICT's commitment to staying at the forefront of technological advancement and preparing students for careers in emerging fields. The lab is expected to attract top talent and foster partnerships with industry leaders and research institutions worldwide.`,
    imageUrl: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1756660318/459388087_1210395166778357_1242381946816835441_n_vrx5th.jpg',
    status: NewsStatus.PUBLISHED,
    author: {
      _id: 'auth-3',
      firstName: 'Admin',
      lastName: 'Office',
      email: 'admin@cict.edu'
    },
    publishedAt: '2024-03-05T09:15:00Z',
    tags: ['Infrastructure', 'AI', 'Research', 'Innovation'],
    createdAt: '2024-03-05T09:00:00Z',
    updatedAt: '2024-03-05T09:00:00Z',
  },
  {
    _id: 'student-startup-success',
    title: 'CICT Students Launch Successful Tech Startup',
    excerpt: 'Alumni-founded company secures $2M in seed funding for innovative EdTech platform.',
    content: `A group of CICT alumni has successfully launched TechLearn, an innovative educational technology platform that recently secured $2 million in seed funding from prominent venture capital firms. The startup, founded by three Computer Science graduates, aims to revolutionize online learning through AI-powered personalized education.

The platform uses advanced machine learning algorithms to adapt content delivery based on individual learning styles and pace. Early adopters have reported significant improvements in student engagement and learning outcomes. The company has already partnered with several educational institutions and plans to expand its services globally.

The founders credit their success to the strong foundation they received at CICT, particularly the entrepreneurship programs and mentorship from faculty members. They actively engage with current students, offering internships and sharing insights about the startup ecosystem.

This success story exemplifies CICT's mission to nurture not just technically skilled graduates but also innovative entrepreneurs who can create solutions to real-world challenges. The college continues to support student ventures through its incubation center and startup accelerator programs.`,
    imageUrl: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
    status: NewsStatus.PUBLISHED,
    author: {
      _id: 'auth-4',
      firstName: 'Alumni',
      lastName: 'Relations',
      email: 'alumni@cict.edu'
    },
    publishedAt: '2024-02-28T11:00:00Z',
    tags: ['Startup', 'Alumni', 'EdTech', 'Success'],
    createdAt: '2024-02-28T10:00:00Z',
    updatedAt: '2024-02-28T10:00:00Z',
  },
  {
    _id: 'community-outreach-program',
    title: 'CICT Launches Digital Literacy Program for Underserved Communities',
    excerpt: 'New initiative aims to bridge the digital divide by providing free technology education to 500 individuals.',
    content: `CICT has launched an ambitious community outreach program aimed at promoting digital literacy in underserved communities. The initiative, titled "Tech for All," will provide free technology education and training to 500 individuals over the next year, focusing on basic computer skills, internet safety, and digital citizenship.

The program is a collaborative effort involving faculty, students, and community partners. Volunteer instructors from CICT will conduct weekly workshops at community centers, libraries, and schools in target areas. The curriculum is designed to be accessible and practical, covering essential skills needed for modern employment and daily life.

Participants will learn how to use productivity software, navigate online resources, create digital content, and protect themselves from cyber threats. The program also includes a mentorship component, pairing participants with CICT students for ongoing support and guidance.

This initiative reflects CICT's commitment to social responsibility and its belief that technology education should be accessible to all. By empowering individuals with digital skills, the program aims to create opportunities for economic advancement and social inclusion.`,
    imageUrl: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1756660317/462565204_1269444047476302_4529409729196861854_n_axdm9t.jpg',
    status: NewsStatus.PUBLISHED,
    author: {
      _id: 'auth-5',
      firstName: 'Community',
      lastName: 'Office',
      email: 'community@cict.edu'
    },
    publishedAt: '2024-02-20T13:45:00Z',
    tags: ['Community', 'Education', 'Outreach', 'Digital Literacy'],
    createdAt: '2024-02-20T13:00:00Z',
    updatedAt: '2024-02-20T13:00:00Z',
  },
  {
    _id: 'international-collaboration',
    title: 'CICT Partners with Leading International Universities',
    excerpt: 'New partnerships enable student exchange programs and collaborative research opportunities.',
    content: `CICT has established strategic partnerships with three leading international universities, opening new avenues for student exchange programs, collaborative research, and faculty development. The partnerships with institutions in Singapore, Australia, and Germany will provide CICT students with opportunities to gain global perspectives and international experience.

Under the exchange program, selected students will spend a semester abroad, taking courses and participating in research projects at partner institutions. This exposure to different educational systems and cultures will enhance students' global competence and employability in the international job market.

The collaboration also facilitates joint research initiatives, allowing CICT faculty to work with international colleagues on cutting-edge projects. These partnerships will lead to co-authored publications, shared resources, and access to specialized facilities and expertise.

Additionally, the agreements include provisions for faculty exchange, enabling CICT professors to teach and conduct research abroad while hosting visiting scholars from partner universities. This exchange of knowledge and best practices will enrich the academic environment and strengthen CICT's position as a globally connected institution.`,
    imageUrl: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1755790148/529718384_122100992648966778_7029427848362639164_n_geskab.jpg',
    status: NewsStatus.PUBLISHED,
    author: {
      _id: 'auth-6',
      firstName: 'International',
      lastName: 'Relations',
      email: 'international@cict.edu'
    },
    publishedAt: '2024-02-15T15:20:00Z',
    tags: ['Partnership', 'International', 'Exchange', 'Collaboration'],
    createdAt: '2024-02-15T15:00:00Z',
    updatedAt: '2024-02-15T15:00:00Z',
  },
];
