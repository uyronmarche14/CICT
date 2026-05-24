/**
 * Organization data for the enhanced tabs
 * Each organization includes detailed descriptions, member information, and visual assets
 */

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  category: 'achievement' | 'project' | 'milestone' | 'award' | 'education';
  details?: string[];
}

export interface OrganizationMember {
  id: string;
  name: string;
  position: string;
  photo: string;
  bio: string;
  joinedDate?: string;
  achievements?: string[];
  responsibilities?: string[];
  skills?: string[];
  timeline?: TimelineEvent[];
  gallery?: string[];
  social?: {
    linkedin?: string;
    github?: string;
    email?: string;
  };
}

export interface Organization {
  id: string;
  name: string;
  fullName: string;
  description: string;
  longDescription: string;
  logo: string;
  banner: string;
  established: string;
  mission: string;
  vision: string;
  values: string[];
  achievements: string[];
  members: OrganizationMember[];
  color: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export const organizations: Organization[] = [
  {
    id: 'ict-sf',
    name: 'ICT-SF',
    fullName: 'ICT Student Forum',
    description: 'The premier student organization for ICT students, fostering innovation, collaboration, and professional development in the digital age.',
    longDescription: 'The ICT Student Forum serves as the central hub for Information and Communications Technology students, providing a dynamic platform for learning, networking, and professional growth. We organize technical workshops, industry talks, hackathons, and career development programs that bridge the gap between academic learning and industry demands. Our community fosters innovation, creativity, and collaboration among future tech leaders.',
    logo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1756660317/462565204_1269444047476302_4529409729196861854_n_axdm9t.jpg',
    banner: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1755790148/529718384_122100992648966778_7029427848362639164_n_geskab.jpg',
    established: '2018',
    mission: 'To empower ICT students through innovative programs, industry partnerships, and collaborative projects that prepare them for successful careers in technology.',
    vision: 'To be the leading student-driven ICT organization that shapes future technology leaders and innovators.',
    values: ['Innovation', 'Collaboration', 'Excellence', 'Integrity', 'Continuous Learning'],
    achievements: [
      'Best Student Organization 2023',
      'National Hackathon Champions 2022',
      'Industry Partnership Excellence Award',
      '1000+ Members Empowered',
      '50+ Successful Events Organized'
    ],
    members: [
      {
        id: '1',
        name: 'Alexandra Chen',
        position: 'President',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Senior Computer Science student with a passion for AI and machine learning. Leading the organization towards greater innovation and impact.',
        joinedDate: '2022-08',
        achievements: [
          'Led 15+ successful tech workshops',
          'Increased membership by 40%',
          'Secured partnerships with 5 tech companies',
          'Organized annual hackathon with 200+ participants'
        ],
        responsibilities: [
          'Strategic planning and organizational leadership',
          'Stakeholder management and partnerships',
          'Event coordination and execution',
          'Team development and mentorship'
        ],
        skills: ['Leadership', 'AI/ML', 'Python', 'Public Speaking', 'Project Management'],
        timeline: [
          {
            year: '2025',
            title: 'Elected as ICT-SF President',
            description: 'Led organization to unprecedented growth with innovative programs and strategic partnerships',
            category: 'milestone',
            details: [
              'Increased active membership from 250 to 350 members (40% growth)',
              'Launched 3 flagship programs: AI Workshop Series, Industry Mentorship, and Tech Career Fair',
              'Secured $50K in corporate sponsorships from Microsoft, Google, and AWS',
              'Established partnerships with 5 leading tech companies for internship opportunities',
              'Organized largest annual hackathon with 200+ participants and $15K prize pool'
            ]
          },
          {
            year: '2024',
            title: 'National Tech Innovation Challenge - Champion',
            description: 'Won first place at National Tech Innovation Challenge with AI-powered sustainability solution',
            category: 'award',
            details: [
              'Led cross-functional team of 5 developers, designers, and data scientists',
              'Built "EcoTrack AI" - ML platform reducing carbon footprint by 30% for SMEs',
              'Received $10K prize money and 6-month accelerator program mentorship',
              'Featured in TechCrunch and local news outlets for innovative solution',
              'Solution adopted by 3 pilot companies with measurable environmental impact'
            ]
          },
          {
            year: '2023',
            title: 'Machine Learning Research Publication',
            description: 'Published groundbreaking research on neural network optimization in peer-reviewed journal',
            category: 'project',
            details: [
              'Collaborated with 3 CS professors on novel optimization algorithms',
              'Presented findings at International Conference on Machine Learning (ICML)',
              'Paper cited 15+ times within first year by leading researchers',
              'Research improved training efficiency by 25% for large-scale models',
              'Received Best Student Paper Award at university research symposium'
            ]
          },
          {
            year: '2022',
            title: 'Joined ICT Student Forum',
            description: 'Started journey as Technical Committee member, building foundation for future leadership',
            category: 'milestone',
            details: [
              'Organized first Python & Machine Learning workshop with 80+ attendees',
              'Built peer mentorship program connecting 50+ junior and senior students',
              'Grew technical community engagement by 60% through innovative events',
              'Initiated weekly coding challenges that became organization tradition',
              'Received "Rising Star" award for outstanding first-year contributions'
            ]
          },
          {
            year: '2021',
            title: 'Started Computer Science Degree',
            description: 'Began Computer Science journey with full academic scholarship and honors distinction',
            category: 'education',
            details: [
              'Maintained 3.95 GPA - Dean\'s List every semester for 4 consecutive years',
              'Awarded full merit-based scholarship covering tuition and research stipend',
              'Founded "Code & Coffee" study group serving 100+ students weekly',
              'Completed advanced coursework in AI, Machine Learning, and Distributed Systems',
              'Selected as Teaching Assistant for Data Structures and Algorithms courses'
            ]
          }
        ],
        gallery: [
          'https://res.cloudinary.com/ddnxfpziq/image/upload/v1755790148/529718384_122100992648966778_7029427848362639164_n_geskab.jpg',
          'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
          'https://res.cloudinary.com/ddnxfpziq/image/upload/v1756660317/462565204_1269444047476302_4529409729196861854_n_axdm9t.jpg',
          'https://res.cloudinary.com/ddnxfpziq/image/upload/v1756660320/cict4_qqksfh.jpg',
          'https://res.cloudinary.com/ddnxfpziq/image/upload/v1756660318/459388087_1210395166778357_1242381946816835441_n_vrx5th.jpg',
          'https://res.cloudinary.com/ddnxfpziq/image/upload/v1755790148/529718384_122100992648966778_7029427848362639164_n_geskab.jpg',
          'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
          'https://res.cloudinary.com/ddnxfpziq/image/upload/v1756660317/462565204_1269444047476302_4529409729196861854_n_axdm9t.jpg',
          'https://res.cloudinary.com/ddnxfpziq/image/upload/v1756660320/cict4_qqksfh.jpg'
        ],
        social: {
          linkedin: 'https://linkedin.com/in/alexandra-chen',
          github: 'https://github.com/alexandra-chen',
          email: 'alexandra@ict-sf.org'
        }
      },
      {
        id: '2',
        name: 'Marcus Rodriguez',
        position: 'Vice President',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Information Systems major specializing in cybersecurity and digital infrastructure. Committed to building secure tech communities.',
        timeline: [
          {
            year: '2025',
            title: 'Promoted to Vice President - Operations & Security',
            description: 'Elevated to VP role, overseeing all operational excellence and cybersecurity initiatives',
            category: 'milestone',
            details: [
              'Implemented enterprise-grade security protocols reducing incidents by 60%',
              'Managed cross-functional team of 20+ members across 4 departments',
              'Established 24/7 security monitoring system for organization infrastructure',
              'Led digital transformation initiative migrating 15+ systems to secure cloud',
              'Achieved ISO 27001 compliance standards for student organization'
            ]
          },
          {
            year: '2024',
            title: 'Advanced Cybersecurity Certifications',
            description: 'Earned industry-recognized CompTIA Security+ and Certified Ethical Hacker (CEH) certifications',
            category: 'achievement',
            details: [
              'Passed CompTIA Security+ with 95% score (industry average: 75%)',
              'Achieved CEH certification on first attempt with distinction',
              'Conducted 8 comprehensive security workshops training 50+ students',
              'Developed cybersecurity curriculum adopted by 3 other student organizations',
              'Recognized as youngest certified ethical hacker in university history'
            ]
          },
          {
            year: '2023',
            title: 'Campus-Wide Security Audit Initiative',
            description: 'Led comprehensive security assessment for university IT infrastructure',
            category: 'project',
            details: [
              'Identified and documented 30+ critical vulnerabilities across systems',
              'Implemented remediation plan with 100% resolution rate within 3 months',
              'Received official commendation from University IT Security Department',
              'Saved university estimated $200K in potential breach costs',
              'Created security best practices guide now used campus-wide'
            ]
          },
          {
            year: '2022',
            title: 'Joined ICT-SF Security Committee',
            description: 'Started cybersecurity journey as founding member of Security Committee',
            category: 'milestone',
            details: [
              'Built comprehensive security awareness program reaching 500+ students',
              'Organized first Capture The Flag (CTF) competition with 100+ participants',
              'Created organization security guidelines and incident response protocols',
              'Established bug bounty program discovering 15+ vulnerabilities',
              'Won "Security Champion" award for outstanding contributions'
            ]
          }
        ],
        gallery: [
          'https://res.cloudinary.com/ddnxfpziq/image/upload/v1756660320/cict4_qqksfh.jpg',
          'https://res.cloudinary.com/ddnxfpziq/image/upload/v1756660318/459388087_1210395166778357_1242381946816835441_n_vrx5th.jpg',
          'https://res.cloudinary.com/ddnxfpziq/image/upload/v1755790148/529718384_122100992648966778_7029427848362639164_n_geskab.jpg',
          'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
          'https://res.cloudinary.com/ddnxfpziq/image/upload/v1756660317/462565204_1269444047476302_4529409729196861854_n_axdm9t.jpg',
          'https://res.cloudinary.com/ddnxfpziq/image/upload/v1756660320/cict4_qqksfh.jpg',
          'https://res.cloudinary.com/ddnxfpziq/image/upload/v1756660318/459388087_1210395166778357_1242381946816835441_n_vrx5th.jpg',
          'https://res.cloudinary.com/ddnxfpziq/image/upload/v1755790148/529718384_122100992648966778_7029427848362639164_n_geskab.jpg',
          'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg'
        ],
        social: {
          linkedin: 'https://linkedin.com/in/marcus-rodriguez',
          github: 'https://github.com/marcus-rodriguez',
          email: 'marcus@ict-sf.org'
        }
      },
      {
        id: '3',
        name: 'Sarah Kim',
        position: 'Technical Lead',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Computer Science junior with expertise in full-stack development and cloud technologies. Leading technical workshops and projects.',
        timeline: [
          {
            year: '2025',
            title: 'Appointed Technical Lead - ICT-SF',
            description: 'Leading all technical initiatives, infrastructure, and developer education programs',
            category: 'milestone',
            details: [
              'Organized 12 comprehensive technical workshops reaching 400+ students',
              'Mentored 30+ junior developers through structured 6-month program',
              'Architected and built organization\'s modern tech stack (Next.js, AWS, PostgreSQL)',
              'Established technical standards and code review processes adopted organization-wide',
              'Led team of 8 developers building internal tools used by 300+ members'
            ]
          },
          {
            year: '2024',
            title: 'AWS Cloud Migration & Infrastructure Overhaul',
            description: 'Led complete migration of organization infrastructure to AWS cloud platform',
            category: 'project',
            details: [
              'Reduced operational costs by 40% ($12K annual savings) through optimization',
              'Improved system uptime from 95% to 99.9% with zero critical incidents',
              'Implemented full CI/CD pipeline reducing deployment time from hours to minutes',
              'Migrated 8 legacy applications to containerized microservices architecture',
              'Received "Technical Excellence Award" from university IT department'
            ]
          },
          {
            year: '2023',
            title: 'Full-Stack Developer Intern - TechVenture Inc.',
            description: 'Software engineering internship at fast-growing fintech startup',
            category: 'achievement',
            details: [
              'Built 5 production features serving 50K+ active users daily',
              'Developed with React, Node.js, TypeScript, and PostgreSQL stack',
              'Improved application performance by 35% through optimization',
              'Received return offer with 20% salary increase for exceptional performance',
              'Contributed to open-source projects gaining 500+ GitHub stars'
            ]
          },
          {
            year: '2022',
            title: 'Started Computer Science Degree',
            description: 'Began CS journey with focus on full-stack development and cloud technologies',
            category: 'education',
            details: [
              'Maintained 3.9/4.0 GPA with Dean\'s List honors every semester',
              'Won "Best Capstone Project" award for innovative web application',
              'Served as Teaching Assistant for Web Development and Database Systems',
              'Completed advanced coursework in Cloud Computing and Software Architecture',
              'Founded "Web Dev Club" growing to 80+ active members'
            ]
          }
        ],
        gallery: [
          'https://res.cloudinary.com/ddnxfpziq/image/upload/v1756660317/462565204_1269444047476302_4529409729196861854_n_axdm9t.jpg',
          'https://res.cloudinary.com/ddnxfpziq/image/upload/v1755790148/529718384_122100992648966778_7029427848362639164_n_geskab.jpg',
          'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
          'https://res.cloudinary.com/ddnxfpziq/image/upload/v1756660320/cict4_qqksfh.jpg',
          'https://res.cloudinary.com/ddnxfpziq/image/upload/v1756660318/459388087_1210395166778357_1242381946816835441_n_vrx5th.jpg',
          'https://res.cloudinary.com/ddnxfpziq/image/upload/v1756660317/462565204_1269444047476302_4529409729196861854_n_axdm9t.jpg',
          'https://res.cloudinary.com/ddnxfpziq/image/upload/v1755790148/529718384_122100992648966778_7029427848362639164_n_geskab.jpg',
          'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
          'https://res.cloudinary.com/ddnxfpziq/image/upload/v1756660320/cict4_qqksfh.jpg'
        ],
        social: {
          linkedin: 'https://linkedin.com/in/sarah-kim',
          github: 'https://github.com/sarah-kim',
          email: 'sarah@ict-sf.org'
        }
      },
      {
        id: '4',
        name: 'David Thompson',
        position: 'Events Coordinator',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Information Systems senior with strong organizational skills. Coordinating major events and hackathons for the organization.',
        social: {
          linkedin: 'https://linkedin.com/in/david-thompson',
          email: 'david@ict-sf.org'
        }
      },
      {
        id: '5',
        name: 'Jessica Lee',
        position: 'Marketing Director',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Communications major with expertise in digital marketing and social media strategy. Building the organization\'s brand presence.',
        social: {
          linkedin: 'https://linkedin.com/in/jessica-lee',
          email: 'jessica@ict-sf.org'
        }
      },
      {
        id: '6',
        name: 'Robert Chen',
        position: 'Finance Officer',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Business Administration student managing the organization\'s finances and sponsorship programs.',
        social: {
          linkedin: 'https://linkedin.com/in/robert-chen',
          email: 'robert@ict-sf.org'
        }
      },
      {
        id: '7',
        name: 'Emily Santos',
        position: 'Community Manager',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Information Technology student fostering community engagement and member relations.',
        social: {
          linkedin: 'https://linkedin.com/in/emily-santos',
          email: 'emily@ict-sf.org'
        }
      },
      {
        id: '8',
        name: 'Michael Park',
        position: 'Partnerships Lead',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Computer Science senior building strategic partnerships with industry leaders and tech companies.',
        social: {
          linkedin: 'https://linkedin.com/in/michael-park',
          email: 'michael@ict-sf.org'
        }
      },
      {
        id: '9',
        name: 'Amanda Rivera',
        position: 'Content Creator',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Multimedia Arts student creating engaging content for the organization\'s digital platforms.',
        social: {
          linkedin: 'https://linkedin.com/in/amanda-rivera',
          email: 'amanda@ict-sf.org'
        }
      }
    ],
    color: {
      primary: '#6e29f6',
      secondary: '#f629a8',
      accent: '#29f6d2'
    }
  },
  {
    id: 'css',
    name: 'CSS',
    fullName: 'Computer Science Society',
    description: 'Dedicated to advancing computer science education, research, and innovation through collaborative learning and cutting-edge projects.',
    longDescription: 'The Computer Science Society is the academic and professional backbone for computer science students, focusing on advanced technical skills, research opportunities, and industry connections. We organize coding competitions, technical seminars, research symposiums, and mentorship programs. Our members engage in open-source projects, research publications, and innovative solutions to real-world problems.',
    logo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1756660320/cict4_qqksfh.jpg',
    banner: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1755790148/529718384_122100992648966778_7029427848362639164_n_geskab.jpg',
    established: '2019',
    mission: 'To advance computer science education through research, innovation, and collaborative learning experiences that prepare students for cutting-edge careers.',
    vision: 'To be the premier computer science society that fosters research excellence and technological innovation.',
    values: ['Academic Excellence', 'Research Innovation', 'Technical Mastery', 'Collaborative Learning', 'Ethical Computing'],
    achievements: [
      'Research Publication Excellence',
      'International Programming Competition Finalists',
      'Open Source Contribution Award',
      'Academic Partnership Recognition',
      '25+ Research Projects Completed'
    ],
    members: [
      {
        id: '5',
        name: 'Dr. Emily Watson',
        position: 'Faculty Advisor',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Computer Science Professor with expertise in artificial intelligence and machine learning. Guiding research initiatives and academic programs.',
        social: {
          linkedin: 'https://linkedin.com/in/emily-watson',
          email: 'emily.watson@university.edu'
        }
      },
      {
        id: '6',
        name: 'Ryan Patel',
        position: 'Research Lead',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Graduate student specializing in AI and robotics. Leading research projects and publications for the society.',
        social: {
          linkedin: 'https://linkedin.com/in/ryan-patel',
          github: 'https://github.com/ryan-patel',
          email: 'ryan@css-society.org'
        }
      },
      {
        id: '7',
        name: 'Lisa Chang',
        position: 'Competition Coordinator',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Senior Computer Science student with multiple competition wins. Organizing coding competitions and hackathons.',
        social: {
          linkedin: 'https://linkedin.com/in/lisa-chang',
          github: 'https://github.com/lisa-chang',
          email: 'lisa@css-society.org'
        }
      },
      {
        id: '8',
        name: 'James Wilson',
        position: 'Mentorship Director',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Experienced software developer and senior student. Coordinating mentorship programs and career guidance.',
        social: {
          linkedin: 'https://linkedin.com/in/james-wilson',
          email: 'james@css-society.org'
        }
      },
      {
        id: '9',
        name: 'Nina Patel',
        position: 'Workshop Coordinator',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Computer Science junior organizing technical workshops and training sessions for members.',
        social: {
          linkedin: 'https://linkedin.com/in/nina-patel',
          email: 'nina@css-society.org'
        }
      },
      {
        id: '10',
        name: 'Daniel Kim',
        position: 'Outreach Director',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Senior student managing external relations and community outreach programs.',
        social: {
          linkedin: 'https://linkedin.com/in/daniel-kim',
          email: 'daniel@css-society.org'
        }
      },
      {
        id: '11',
        name: 'Sophia Martinez',
        position: 'Publications Lead',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Graduate student managing research publications and academic journals.',
        social: {
          linkedin: 'https://linkedin.com/in/sophia-martinez',
          github: 'https://github.com/sophia-martinez',
          email: 'sophia@css-society.org'
        }
      },
      {
        id: '12',
        name: 'Alex Johnson',
        position: 'Technology Officer',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Computer Science senior maintaining the society\'s technical infrastructure and platforms.',
        social: {
          linkedin: 'https://linkedin.com/in/alex-johnson',
          github: 'https://github.com/alex-johnson',
          email: 'alex@css-society.org'
        }
      },
      {
        id: '13',
        name: 'Rachel Green',
        position: 'Events Manager',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Information Systems student coordinating society events and symposiums.',
        social: {
          linkedin: 'https://linkedin.com/in/rachel-green',
          email: 'rachel@css-society.org'
        }
      }
    ],
    color: {
      primary: '#2563eb',
      secondary: '#0891b2',
      accent: '#06b6d4'
    }
  },
  {
    id: 'iss',
    name: 'ISS',
    fullName: 'Information Systems Society',
    description: 'Bridging business and technology through comprehensive information systems solutions and strategic digital transformation initiatives.',
    longDescription: 'The Information Systems Society focuses on the intersection of business and technology, preparing students for careers in business analysis, systems design, and digital transformation. We emphasize practical skills in database management, enterprise systems, business intelligence, and project management. Our members work on real-world consulting projects and develop solutions that drive business value.',
    logo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1756660318/459388087_1210395166778357_1242381946816835441_n_vrx5th.jpg',
    banner: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1755790148/529718384_122100992648966778_7029427848362639164_n_geskab.jpg',
    established: '2020',
    mission: 'To develop information systems professionals who can bridge business needs with technological solutions through strategic thinking and practical implementation.',
    vision: 'To be the leading society for information systems excellence, producing graduates who drive digital transformation in organizations.',
    values: ['Business-Technology Integration', 'Strategic Thinking', 'Data-Driven Decision Making', 'User-Centered Design', 'Continuous Innovation'],
    achievements: [
      'Best Business-Technology Integration Project',
      'Industry Consulting Excellence Award',
      'Digital Transformation Case Competition Winners',
      'Enterprise Systems Certification Program',
      '30+ Business Solutions Delivered'
    ],
    members: [
      {
        id: '9',
        name: 'Michael Brown',
        position: 'President',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Information Systems senior with expertise in business intelligence and enterprise systems. Leading strategic initiatives for the society.',
        social: {
          linkedin: 'https://linkedin.com/in/michael-brown',
          email: 'michael@iss-society.org'
        }
      },
      {
        id: '10',
        name: 'Anna Martinez',
        position: 'Business Analysis Lead',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Information Systems junior specializing in business process analysis and requirements gathering. Leading consulting projects.',
        social: {
          linkedin: 'https://linkedin.com/in/anna-martinez',
          email: 'anna@iss-society.org'
        }
      },
      {
        id: '11',
        name: 'Kevin Zhang',
        position: 'Database & Analytics Lead',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Senior Information Systems student with strong database and analytics skills. Managing data-driven projects and workshops.',
        social: {
          linkedin: 'https://linkedin.com/in/kevin-zhang',
          github: 'https://github.com/kevin-zhang',
          email: 'kevin@iss-society.org'
        }
      },
      {
        id: '12',
        name: 'Sophie Anderson',
        position: 'Project Management Lead',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Information Systems senior with project management certification. Coordinating society projects and initiatives.',
        social: {
          linkedin: 'https://linkedin.com/in/sophie-anderson',
          email: 'sophie@iss-society.org'
        }
      },
      {
        id: '13',
        name: 'Christopher Lee',
        position: 'Systems Analyst',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Information Systems junior specializing in systems analysis and process optimization.',
        social: {
          linkedin: 'https://linkedin.com/in/christopher-lee',
          email: 'christopher@iss-society.org'
        }
      },
      {
        id: '14',
        name: 'Victoria Chen',
        position: 'UX Research Lead',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Senior student conducting user experience research and usability testing.',
        social: {
          linkedin: 'https://linkedin.com/in/victoria-chen',
          email: 'victoria@iss-society.org'
        }
      },
      {
        id: '15',
        name: 'Brandon Taylor',
        position: 'Integration Specialist',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Information Systems senior working on enterprise system integration projects.',
        social: {
          linkedin: 'https://linkedin.com/in/brandon-taylor',
          email: 'brandon@iss-society.org'
        }
      },
      {
        id: '16',
        name: 'Olivia White',
        position: 'Business Intelligence Lead',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Graduate student specializing in business intelligence and data visualization.',
        social: {
          linkedin: 'https://linkedin.com/in/olivia-white',
          email: 'olivia@iss-society.org'
        }
      },
      {
        id: '17',
        name: 'Nathan Garcia',
        position: 'Security Analyst',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Information Systems senior focusing on information security and risk management.',
        social: {
          linkedin: 'https://linkedin.com/in/nathan-garcia',
          email: 'nathan@iss-society.org'
        }
      }
    ],
    color: {
      primary: '#059669',
      secondary: '#0d9488',
      accent: '#10b981'
    }
  },
  {
    id: 'robotcu',
    name: 'ROBOTCU',
    fullName: 'Robotics Club University',
    description: 'Pioneering robotics and automation through hands-on projects, competitions, and cutting-edge research in artificial intelligence and mechanical systems.',
    longDescription: 'ROBOTCU is the premier robotics organization dedicated to advancing robotics education, research, and competition. We bring together students from various disciplines to work on complex robotics projects, participate in national and international competitions, and push the boundaries of what\'s possible in automation and AI. Our projects range from autonomous vehicles to humanoid robots, industrial automation to space robotics.',
    logo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1756660320/cict4_qqksfh.jpg',
    banner: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1755790148/529718384_122100992648966778_7029427848362639164_n_geskab.jpg',
    established: '2017',
    mission: 'To advance robotics education and innovation through interdisciplinary collaboration, competitive excellence, and cutting-edge research that shapes the future of automation.',
    vision: 'To be the leading university robotics organization that produces world-class roboticists and transformative robotic solutions.',
    values: ['Innovation Excellence', 'Interdisciplinary Collaboration', 'Competitive Spirit', 'Ethical Robotics', 'Knowledge Sharing'],
    achievements: [
      'National Robotics Competition Champions',
      'International Autonomous Vehicle Challenge Finalists',
      'Best Research Paper in Robotics',
      'Industry Partnership for Robotics Innovation',
      '15+ Competition Awards Won'
    ],
    members: [
      {
        id: '13',
        name: 'Dr. Robert Kim',
        position: 'Faculty Advisor & Research Lead',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Robotics Engineering Professor with expertise in autonomous systems and AI. Leading research initiatives and competition teams.',
        social: {
          linkedin: 'https://linkedin.com/in/robert-kim',
          email: 'robert.kim@university.edu'
        }
      },
      {
        id: '14',
        name: 'Jennifer Wu',
        position: 'Team Captain',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Mechanical Engineering senior specializing in robotic systems design. Leading competition teams and technical projects.',
        social: {
          linkedin: 'https://linkedin.com/in/jennifer-wu',
          github: 'https://github.com/jennifer-wu',
          email: 'jennifer@robotcu.org'
        }
      },
      {
        id: '15',
        name: 'Carlos Rodriguez',
        position: 'Software Lead',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Computer Science senior with expertise in robotic software and AI algorithms. Developing autonomous navigation systems.',
        social: {
          linkedin: 'https://linkedin.com/in/carlos-rodriguez',
          github: 'https://github.com/carlos-rodriguez',
          email: 'carlos@robotcu.org'
        }
      },
      {
        id: '16',
        name: 'Maya Patel',
        position: 'Hardware Lead',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Electrical Engineering junior specializing in embedded systems and sensor integration. Designing robotic hardware platforms.',
        social: {
          linkedin: 'https://linkedin.com/in/maya-patel',
          email: 'maya@robotcu.org'
        }
      },
      {
        id: '17',
        name: 'Tyler Anderson',
        position: 'Mechanical Design Lead',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Mechanical Engineering senior designing robotic chassis and mechanical systems.',
        social: {
          linkedin: 'https://linkedin.com/in/tyler-anderson',
          email: 'tyler@robotcu.org'
        }
      },
      {
        id: '18',
        name: 'Isabella Moore',
        position: 'Vision Systems Lead',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Computer Engineering student developing computer vision and image processing systems.',
        social: {
          linkedin: 'https://linkedin.com/in/isabella-moore',
          github: 'https://github.com/isabella-moore',
          email: 'isabella@robotcu.org'
        }
      },
      {
        id: '19',
        name: 'Ethan Wright',
        position: 'Control Systems Engineer',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Electrical Engineering junior working on robot control systems and automation.',
        social: {
          linkedin: 'https://linkedin.com/in/ethan-wright',
          email: 'ethan@robotcu.org'
        }
      },
      {
        id: '20',
        name: 'Ava Thompson',
        position: 'AI Research Assistant',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Computer Science senior researching machine learning applications in robotics.',
        social: {
          linkedin: 'https://linkedin.com/in/ava-thompson',
          github: 'https://github.com/ava-thompson',
          email: 'ava@robotcu.org'
        }
      },
      {
        id: '21',
        name: 'Lucas Martinez',
        position: 'Competition Manager',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Mechanical Engineering senior coordinating robotics competitions and team logistics.',
        social: {
          linkedin: 'https://linkedin.com/in/lucas-martinez',
          email: 'lucas@robotcu.org'
        }
      }
    ],
    color: {
      primary: '#dc2626',
      secondary: '#ea580c',
      accent: '#f59e0b'
    }
  },
  {
    id: 'best',
    name: 'BEST',
    fullName: 'Board of European Students of Technology',
    description: 'International student organization fostering international cooperation, cultural exchange, and technological advancement across European universities.',
    longDescription: 'BEST is a non-profit, non-political organization run entirely by students for students. We provide complementary education, career support, and cultural exchange opportunities for engineering and technology students across Europe. Our activities include academic courses, educational events, competitions, and cultural exchanges that help students develop both professionally and personally while experiencing European diversity.',
    logo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1756660317/462565204_1269444047476302_4529409729196861854_n_axdm9t.jpg',
    banner: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1755790148/529718384_122100992648966778_7029427848362639164_n_geskab.jpg',
    established: '1989',
    mission: 'To provide complementary education and career support for students of technology, while fostering international cooperation and cultural understanding.',
    vision: 'To create a world where technology students can develop their full potential through international experiences and lifelong learning.',
    values: ['Friendship', 'Flexibility', 'Fun', 'Improvement', 'Learning', 'European Cooperation'],
    achievements: [
      'European Student Organization Excellence Award',
      '100+ International Events Organized',
      '5000+ Students Impacted',
      'Cultural Exchange Program Recognition',
      '25+ Years of Continuous Operation'
    ],
    members: [
      {
        id: '17',
        name: 'Elena Dimitriou',
        position: 'Local Group President',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'International Business student with a passion for European cooperation and cultural exchange. Leading local BEST initiatives and international collaborations.',
        social: {
          linkedin: 'https://linkedin.com/in/elena-dimitriou',
          email: 'elena@best-university.org'
        }
      },
      {
        id: '18',
        name: 'Thomas Mueller',
        position: 'Academic Responsible',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Mechanical Engineering student from Germany. Coordinating academic courses and educational events for international students.',
        social: {
          linkedin: 'https://linkedin.com/in/thomas-mueller',
          email: 'thomas@best-university.org'
        }
      },
      {
        id: '19',
        name: 'Sofia Rossi',
        position: 'Public Relations',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Marketing and Communications student from Italy. Managing public relations and promotional activities for BEST events.',
        social: {
          linkedin: 'https://linkedin.com/in/sofia-rossi',
          email: 'sofia@best-university.org'
        }
      },
      {
        id: '20',
        name: 'Pierre Dubois',
        position: 'Human Resources',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Psychology student from France. Managing member recruitment, training, and organizational development for the local group.',
        social: {
          linkedin: 'https://linkedin.com/in/pierre-dubois',
          email: 'pierre@best-university.org'
        }
      },
      {
        id: '21',
        name: 'Maria Gonzalez',
        position: 'Events Coordinator',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Engineering student from Spain organizing international events and exchanges.',
        social: {
          linkedin: 'https://linkedin.com/in/maria-gonzalez',
          email: 'maria@best-university.org'
        }
      },
      {
        id: '22',
        name: 'Henrik Larsson',
        position: 'IT Coordinator',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Computer Science student from Sweden managing technical infrastructure and digital platforms.',
        social: {
          linkedin: 'https://linkedin.com/in/henrik-larsson',
          github: 'https://github.com/henrik-larsson',
          email: 'henrik@best-university.org'
        }
      },
      {
        id: '23',
        name: 'Anna Kowalski',
        position: 'Finance Manager',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Business student from Poland handling financial planning and budget management.',
        social: {
          linkedin: 'https://linkedin.com/in/anna-kowalski',
          email: 'anna@best-university.org'
        }
      },
      {
        id: '24',
        name: 'Dimitri Popov',
        position: 'Training Coordinator',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Engineering student from Bulgaria organizing training programs and skill development workshops.',
        social: {
          linkedin: 'https://linkedin.com/in/dimitri-popov',
          email: 'dimitri@best-university.org'
        }
      },
      {
        id: '25',
        name: 'Lucia Romano',
        position: 'Corporate Relations',
        photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1761991328/CHOSEN_113_UY_RON_MARCHE_RHYSS_TCU02223_d0xhvg.jpg',
        bio: 'Business Administration student from Italy building partnerships with corporate sponsors.',
        social: {
          linkedin: 'https://linkedin.com/in/lucia-romano',
          email: 'lucia@best-university.org'
        }
      }
    ],
    color: {
      primary: '#7c3aed',
      secondary: '#8b5cf6',
      accent: '#a78bfa'
    }
  }
];