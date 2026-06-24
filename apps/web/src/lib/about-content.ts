import {
  GraduationCap,
  Lightbulb,
  Users,
  Heart,
  Trophy,

  Code,
  Globe,
  BookOpen,
  Sparkles,
  Shield,
  Star,
  Zap,
  Calendar,
  MapPin,
  Camera,
  Award,
  HeartHandshake,
  type LucideIcon,
} from "lucide-react";

export type ContentBlock =
  | { type: "heroIntro"; title: string; subtitle: string; image: string }
  | { type: "stats"; items: { label: string; value: string; icon: LucideIcon }[] }
  | { type: "text"; title?: string; content: string; image?: string; imageRight?: boolean }
  | { type: "grid"; columns: 2 | 3 | 4; items: { title: string; description: string; icon: LucideIcon; accent?: string }[] }
  | { type: "list"; title?: string; items: { text: string; icon?: LucideIcon }[] }
  | { type: "timeline"; items: { year: string; title: string; description: string }[] }
  | { type: "quote"; text: string; author: string; role: string; image?: string }
  | { type: "cta"; title: string; description: string; buttonText: string; buttonUrl: string }
  | { type: "imageGrid"; images: { src: string; alt: string; caption?: string }[] };

export interface TabContent {
  id: string;
  number: string;
  label: string;
  eyebrow: string;
  title: string;
  summary: string;
  sections: ContentBlock[];
}

const cictImage = (path: string) =>
  `https://res.cloudinary.com/ddnxfpziq/image/upload/f_auto,q_auto/${path}`;

const aboutImages = [
  cictImage("v1766939565/received_1809661546296324_nwsao0.jpg"),
  cictImage("v1756660317/462565204_1269444047476302_4529409729196861854_n_axdm9t.jpg"),
  cictImage("v1782326578/Entertainment_xoxexz.jpg"),
  cictImage("v1782326578/Student_Life2_tnlblr.jpg"),
];

const academicsImages = [
  cictImage("v1756660333/IMG_4857_ew1wp8.jpg"),
  cictImage("v1766939958/Messenger_creation_1447755149890924_v5hgih.jpg"),
  cictImage("v1752335682/IMG_4475_w1pvki.jpg"),
  cictImage("v1752335631/462646799_491422266587695_2829599647701455693_n_ehk9wu.png"),
  cictImage("v1782326593/IMG_0813_t0rhrc.jpg"),
];

const innovationImages = [
  cictImage("v1756660324/ict4_qnkh2y.jpg"),
  cictImage("v1782326578/Academics_nb0eat.jpg"),
  cictImage("v1756660322/cict5_wspa6y.jpg"),
  cictImage("v1766939316/500122427_681028194557259_7080048757823211543_n_yeecku.jpg"),
  cictImage("v1766939342/500442052_681027907890621_3151875760700323871_n_mkssn9.jpg"),
  cictImage("v1752335673/DSC01719_za78uq.jpg"),
];

const campusLifeImages = [
  cictImage("v1756660318/DSC_0124_n8lgm1.jpg"),
  cictImage("v1782326584/IMG_3898_ugsls9.heic"),
  cictImage("v1782326586/IMG_9662_hxo97w.jpg"),
  cictImage("v1752335623/462569135_2056490288117874_4448142511748007889_n_jdifnl.jpg"),
  cictImage("v1782326595/c3f81b43-9dd5-4cd0-87ef-89f2626c7e1a_amustm.jpg"),
  cictImage("v1752335676/ict2_evnxgu.jpg"),
];

const organizationImages = [
  cictImage("v1752335708/photo_2024-09-22_21-31-55_2_y2irl5.jpg"),
  cictImage("v1755790148/529718384_122100992648966778_7029427848362639164_n_geskab.jpg"),
  cictImage("v1782326595/IMG_7600_maxrip.jpg"),
  cictImage("v1766945618/photo_45_2025-12-29_02-02-12_utofwa.jpg"),
  cictImage("v1752335598/450328906_1014347616442600_380351381824664479_n_bfxjmp.jpg"),
  cictImage("v1752335595/371046306_338487401938051_771479620405214262_n_rpkg1f.jpg"),
];

export const aboutTabs: TabContent[] = [
  {
    id: "about",
    number: "01",
    label: "About",
    eyebrow: "Who We Are",
    title: "About CICT",
    summary:
      "The College of Information and Communication Technology is Taguig's premier institution for technology education, empowering students to become future-ready innovators.",
    sections: [
      {
        type: "heroIntro",
        title: "Shaping Future-Ready Technology Leaders",
        subtitle:
          "CICT bridges academic excellence with real-world innovation, equipping students with the skills, mindset, and community to thrive in the digital age.",
        image: aboutImages[0],
      },
      {
        type: "stats",
        items: [
          { label: "Students", value: "10,000+", icon: Users },
          { label: "Programs", value: "2", icon: BookOpen },
          { label: "Organizations", value: "5", icon: HeartHandshake },
          { label: "Years", value: "10+", icon: Award },
        ],
      },
      {
        type: "text",
        title: "Our Mission",
        image: aboutImages[1],
        content:
          "To provide accessible, industry-aligned technology education that empowers Taguig's youth with the knowledge, skills, and ethical foundation to become leaders and innovators in the digital economy. We are committed to fostering a culture of excellence, collaboration, and lifelong learning.",
      },
      {
        type: "text",
        title: "Our Vision",
        image: aboutImages[2],
        imageRight: true,
        content:
          "To be the leading college of information and communication technology in the Philippines — recognized for producing globally competitive graduates who drive innovation, create meaningful impact, and shape the future of technology in service of the nation.",
      },
      {
        type: "imageGrid",
        images: [
          {
            src: aboutImages[3],
            alt: "CICT student life moment",
            caption: "Student life",
          },
        ],
      },
      {
        type: "grid",
        columns: 3,
        items: [
          {
            title: "Excellence",
            description:
              "We pursue the highest standards in teaching, research, and community engagement.",
            icon: Trophy,
            accent: "from-primary to-secondary",
          },
          {
            title: "Innovation",
            description:
              "We embrace creativity, experimentation, and forward-thinking solutions.",
            icon: Lightbulb,
            accent: "from-secondary to-accent",
          },
          {
            title: "Integrity",
            description:
              "We uphold honesty, transparency, and ethical responsibility in all we do.",
            icon: Shield,
            accent: "from-accent to-primary",
          },
          {
            title: "Community",
            description:
              "We build an inclusive, supportive environment where everyone belongs and thrives.",
            icon: Users,
            accent: "from-primary to-accent",
          },
          {
            title: "Leadership",
            description:
              "We develop students into confident leaders who inspire and drive positive change.",
            icon: Star,
            accent: "from-secondary to-primary",
          },
          {
            title: "Service",
            description:
              "We commit to serving Taguig and the nation through technology-driven solutions.",
            icon: Heart,
            accent: "from-accent to-secondary",
          },
        ],
      },
      {
        type: "timeline",
        items: [
          {
            year: "2014",
            title: "CICT Established",
            description:
              "The College of Information and Communication Technology was founded as part of Taguig City's commitment to technology education.",
          },
          {
            year: "2015",
            title: "First BS Programs",
            description:
              "Bachelor of Science in Computer Science and Bachelor of Science in Information Systems programs were launched with the first cohort of students.",
          },
          {
            year: "2017",
            title: "First Student Organizations",
            description:
              "ICT-SF and CSS were established as the pioneering student organizations, creating a foundation for student leadership.",
          },
          {
            year: "2019",
            title: "Campus Growth",
            description:
              "Enrollment surpassed 8,000 students with expanded facilities including new computer laboratories and collaborative workspaces.",
          },
          {
            year: "2022",
            title: "Digital Transformation",
            description:
              "Expanded digital support for events, attendance, and organization management across the CICT community.",
          },
          {
            year: "2024",
            title: "Expanding Horizons",
            description:
              "Introduced coding bootcamps, hackathons, and industry partnerships to bridge academic learning with real-world technology practice.",
          },
        ],
      },
      {
        type: "quote",
        text: "At CICT, we believe that technology education is not just about learning to code — it's about empowering young minds to solve real problems, build meaningful solutions, and shape a better future for our community and our country.",
        author: "CICT Administration",
        role: "College of Information and Communication Technology",
      },
    ],
  },
  {
    id: "academics",
    number: "02",
    label: "Academics",
    eyebrow: "Academic Programs",
    title: "Academics",
    summary:
      "Explore our industry-aligned degree programs designed to build foundational knowledge and advanced skills for the technology workforce.",
    sections: [
      {
        type: "heroIntro",
        title: "Build Your Future with Industry-Aligned Programs",
        subtitle:
          "CICT offers two comprehensive degree programs that combine theoretical foundations with hands-on practical experience, preparing students for the demands of the modern technology industry.",
        image: academicsImages[0],
      },
      {
        type: "text",
        title: "Bachelor of Science in Computer Science",
        image: academicsImages[1],
        content:
          "The BS Computer Science program focuses on the theoretical and practical foundations of computing. Students develop expertise in algorithms, artificial intelligence, machine learning, software engineering, cybersecurity, and data structures. The curriculum emphasizes problem-solving through code and prepares graduates for roles in software development, AI research, and systems architecture.",
      },
      {
        type: "text",
        title: "Bachelor of Science in Information Systems",
        image: academicsImages[2],
        imageRight: true,
        content:
          "The BS Information Systems program bridges technology and business. Students learn to design, implement, and manage information systems that drive organizational success. The curriculum covers enterprise resource planning, database management, data analytics, project management, and business process optimization — preparing graduates for roles as systems analysts, IT consultants, and business technology leaders.",
      },
      {
        type: "imageGrid",
        images: [
          {
            src: academicsImages[3],
            alt: "CICT academic activity",
            caption: "Academic activity",
          },
          {
            src: academicsImages[4],
            alt: "CICT academic community",
            caption: "Program community",
          },
        ],
      },
      {
        type: "list",
        title: "Learning Approach",
        items: [
          { text: "Industry-aligned curriculum reviewed by tech partners annually", icon: Code },
          { text: "Hands-on projects and capstone experiences with real-world applications", icon: Zap },
          { text: "Expert faculty with industry experience and academic credentials", icon: GraduationCap },
          { text: "Internship and mentorship programs connecting students with employers", icon: Globe },
          { text: "State-of-the-art computer laboratories and collaborative spaces", icon: Sparkles },
          { text: "Continuous curriculum evolution based on emerging technology trends", icon: Lightbulb },
        ],
      },
      {
        type: "cta",
        title: "Start Your Academic Journey",
        description:
          "Explore detailed program requirements, curriculum maps, and admission guidelines.",
        buttonText: "View Academics",
        buttonUrl: "/academics",
      },
    ],
  },
  {
    id: "innovation",
    number: "03",
    label: "Innovation",
    eyebrow: "Tech & Innovation",
    title: "Innovation",
    summary:
      "Where ideas become technology. CICT fuels a culture of creation through coding bootcamps, hackathons, research projects, and hands-on innovation labs.",
    sections: [
      {
        type: "heroIntro",
        title: "Where Ideas Become Technology",
        subtitle:
          "Innovation at CICT goes beyond the classroom. Students participate in intensive bootcamps, competitive hackathons, and collaborative research projects that turn learning into tangible impact.",
        image: innovationImages[0],
      },
      {
        type: "text",
        title: "Coding Bootcamps",
        image: innovationImages[1],
        content:
          "CICT's coding bootcamps are intensive, project-based programs where students learn modern development stacks including React, Node.js, Python, and cloud technologies. These bootcamps simulate real industry sprints — building production-ready applications from scratch in collaborative team environments. No prior experience is needed. Our bootcamps are designed for beginners and intermediate learners alike, with mentorship from industry professionals.",
      },
      {
        type: "text",
        title: "Hackathons & Competitions",
        image: innovationImages[2],
        imageRight: true,
        content:
          "CICT hosts and participates in hackathons throughout the academic year — from internal department challenges to inter-school and national competitions. Students form teams, ideate solutions, and build working prototypes within 24-72 hours. These events sharpen problem-solving skills, foster teamwork, and often lead to award-winning projects that gain recognition from industry judges.",
      },
      {
        type: "imageGrid",
        images: [
          {
            src: innovationImages[3],
            alt: "CICT innovation activity",
            caption: "Project work",
          },
          {
            src: innovationImages[4],
            alt: "CICT student builders",
            caption: "Student builders",
          },
          {
            src: innovationImages[5],
            alt: "CICT technology event",
            caption: "Tech events",
          },
        ],
      },
      {
        type: "grid",
        columns: 3,
        items: [
          {
            title: "Full-Stack Web Development",
            description:
              "React, Next.js, Node.js, Express, and modern frontend frameworks",
            icon: Code,
            accent: "from-primary to-secondary",
          },
          {
            title: "AI & Machine Learning",
            description:
              "Python, TensorFlow, data science, and intelligent systems",
            icon: Lightbulb,
            accent: "from-secondary to-accent",
          },
          {
            title: "Mobile Development",
            description:
              "React Native, Expo, and cross-platform application building",
            icon: Zap,
            accent: "from-accent to-primary",
          },
          {
            title: "Cloud & DevOps",
            description:
              "AWS, Docker, CI/CD pipelines, and cloud-native architecture",
            icon: Globe,
            accent: "from-primary to-accent",
          },
          {
            title: "Cybersecurity",
            description:
              "Network security, ethical hacking, and defensive programming",
            icon: Shield,
            accent: "from-secondary to-primary",
          },
          {
            title: "Data Science & Analytics",
            description:
              "SQL, visualization, statistical modeling, and business intelligence",
            icon: Sparkles,
            accent: "from-accent to-secondary",
          },
        ],
      },
      {
        type: "quote",
        text: "The bootcamp wasn't just about learning code — it was about building something real with a team, meeting deadlines, and presenting to actual developers. It changed how I think about software.",
        author: "Bootcamp Participant",
        role: "BS Computer Science, Batch 2024",
        image: innovationImages[5],
      },
      {
        type: "cta",
        title: "Ready to Build Something?",
        description:
          "Check out upcoming bootcamps, hackathons, and tech events.",
        buttonText: "Browse Events",
        buttonUrl: "/events",
      },
    ],
  },
  {
    id: "campus-life",
    number: "04",
    label: "Campus Life",
    eyebrow: "Student Experience",
    title: "Campus Life",
    summary:
      "Beyond the classroom — discover a vibrant campus culture with sports, events, student organizations, and a connected community experience.",
    sections: [
      {
        type: "heroIntro",
        title: "Beyond the Classroom — Discover Life at CICT",
        subtitle:
          "CICT is more than lectures and labs. It's a thriving community where students build friendships, discover passions, and create lasting memories through sports, events, and campus traditions.",
        image: campusLifeImages[0],
      },
      {
        type: "text",
        title: "Sports & Athletics",
        image: campusLifeImages[1],
        content:
          "CICT promotes holistic growth through physical wellness and team spirit. Students participate in intramural leagues, inter-school tournaments, and fitness programs that build discipline, teamwork, and school pride. From basketball and volleyball to esports and chess, there's a sport for every student. Our athletic programs foster camaraderie and develop leadership skills that extend far beyond the playing field.",
      },
      {
        type: "text",
        title: "Events & Traditions",
        image: campusLifeImages[2],
        imageRight: true,
        content:
          "The CICT calendar is packed with events that bring the community together — from Foundation Week celebrations and tech expos to cultural nights, org fairs, and awards ceremonies. Every event is an opportunity to learn, network, and celebrate achievements. Student organizations host flagship events throughout the year, creating a dynamic and engaging campus atmosphere.",
      },
      {
        type: "imageGrid",
        images: [
          {
            src: campusLifeImages[3],
            alt: "CICT Students at an Event",
            caption: "Campus gathering",
          },
          {
            src: campusLifeImages[4],
            alt: "Students collaborating",
            caption: "Collaborative learning",
          },
          {
            src: campusLifeImages[5],
            alt: "Tech workshop",
            caption: "Hands-on workshops",
          },
        ],
      },
      {
        type: "list",
        title: "Your Student Journey",
        items: [
          { text: "Real-time attendance tracking with QR passes — every event builds your unique student profile", icon: MapPin },
          { text: "Event participation history and achievement badges that showcase your involvement", icon: Award },
          { text: "Stay updated with announcements, news, and event reminders — all in one place", icon: Calendar },
          { text: "Capture campus milestones and memories throughout your CICT journey", icon: Camera },
          { text: "Connect with peers, mentors, and alumni through campus activities and networks", icon: Users },
        ],
      },
      {
        type: "cta",
        title: "Experience Campus Life",
        description:
          "See what's happening around CICT — upcoming events, activities, and community news.",
        buttonText: "View Updates",
        buttonUrl: "/updates",
      },
    ],
  },
  {
    id: "organizations",
    number: "05",
    label: "Organizations",
    eyebrow: "Student Organizations",
    title: "Organizations",
    summary:
      "Find your community. Join student-led organizations, develop leadership skills, and make a lasting impact on campus and beyond.",
    sections: [
      {
        type: "heroIntro",
        title: "Find Your Community. Lead. Create. Belong.",
        subtitle:
          "CICT is home to five dynamic student organizations — each with its own mission, culture, and community. Whether you're into tech, leadership, service, or the arts, there's a place for you.",
        image: organizationImages[0],
      },
      {
        type: "imageGrid",
        images: [
          {
            src: organizationImages[1],
            alt: "CICT organization members",
            caption: "Organization community",
          },
          {
            src: organizationImages[2],
            alt: "CICT organization event",
            caption: "Student-led events",
          },
          {
            src: organizationImages[3],
            alt: "CICT organization gathering",
            caption: "Campus leadership",
          },
        ],
      },
      {
        type: "grid",
        columns: 3,
        items: [
          {
            title: "ICT-SF",
            description:
              "Information and Communication Technology Student Federation — the pioneering student government representing all CICT students.",
            icon: Shield,
            accent: "from-primary to-secondary",
          },
          {
            title: "CSS",
            description:
              "Computer Science Society — dedicated to advancing computer science education through workshops, competitions, and community outreach.",
            icon: Code,
            accent: "from-secondary to-accent",
          },
          {
            title: "ISS",
            description:
              "Information Systems Society — bridging technology and business through seminars, case studies, and industry partnerships.",
            icon: Globe,
            accent: "from-accent to-primary",
          },
          {
            title: "ROBOTCU",
            description:
              "Robotics and Technology Club United — exploring robotics, IoT, and embedded systems through hands-on projects and competitions.",
            icon: Zap,
            accent: "from-primary to-accent",
          },
          {
            title: "BEST",
            description:
              "Board of European Students of Technology — CICT's international student organization fostering cooperation and cultural exchange in technology.",
            icon: Camera,
            accent: "from-secondary to-primary",
          },
          {
            title: "And More",
            description:
              "New organizations and interest groups form every year — there's always room for new ideas and growing communities.",
            icon: Sparkles,
            accent: "from-accent to-secondary",
          },
        ],
      },
      {
        type: "text",
        title: "Leadership Development",
        content:
          "Student organizations at CICT are more than clubs — they are leadership incubators. From serving as an officer or committee head to organizing flagship events and managing budgets, students gain real-world leadership experience that shapes their professional careers. Our organizations foster skills in project management, public speaking, event coordination, and team leadership.",
      },
      {
        type: "list",
        title: "What You Gain",
        items: [
          { text: "Leadership and management skills through officer roles and committee work", icon: Star },
          { text: "Networking opportunities with peers, alumni, and industry professionals", icon: HeartHandshake },
          { text: "Hands-on event management experience — from planning to execution", icon: Calendar },
          { text: "Community service and outreach opportunities that create real impact", icon: Heart },
          { text: "Recognition and achievement badges that showcase your contributions", icon: Trophy },
          { text: "A lifelong network of friends, mentors, and collaborators", icon: Users },
        ],
      },
      {
        type: "quote",
        text: "Joining CSS as a freshman was the best decision I made. It gave me mentors, friends, and leadership opportunities I never imagined. Now as an officer, I get to give back and help the next generation of students find their path.",
        author: "Organization Leader",
        role: "BS Information Systems, Batch 2025",
        image: organizationImages[4],
      },
      {
        type: "imageGrid",
        images: [
          {
            src: organizationImages[5],
            alt: "CICT student organization activity",
            caption: "Organization activity",
          },
        ],
      },
      {
        type: "cta",
        title: "Find Your Organization",
        description:
          "Explore all student organizations at CICT and discover where you belong.",
        buttonText: "Explore Organizations",
        buttonUrl: "/organizations",
      },
    ],
  },
];
