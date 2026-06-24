import mongoose from 'mongoose';
import '../config/loadEnv';
import User from '../models/User';
import Role from '../models/Role';
import News from '../models/News';
import Announcement from '../models/Announcement';
import Event from '../models/Event';
import Organization from '../models/Organization';
import { UserRole, Permission, NewsStatus, AnnouncementPriority, AnnouncementType, EventStatus, ContentOwnerType } from '../types';
import logger from '../utils/logger';
import { validateEnv } from '../config/validateEnv';

const seedDatabase = async () => {
  try {
    validateEnv();

    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI is required');
    }
    await mongoose.connect(mongoURI);
    logger.info('Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await User.deleteMany({});
    // await Role.deleteMany({});
    // logger.info('Cleared existing data');

    // Create default admin user
    const adminEmail = 'admin@cict.edu';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const admin = await User.create({
        email: adminEmail,
        password: 'Admin@123456', // Change this in production!
        firstName: 'System',
        lastName: 'Administrator',
        role: UserRole.FULL_ADMIN,
        isActive: true,
      });
      logger.info(`✅ Default admin created: ${admin.email}`);
      logger.info(`   Password: Admin@123456 (CHANGE THIS!)`);
    } else {
      logger.info('Admin user already exists');
    }

    // Create system roles with default permissions
    const systemRoles = [
      {
        name: 'Content Manager',
        description: 'Can manage news and announcements',
        permissions: [
          Permission.CREATE_NEWS,
          Permission.EDIT_NEWS,
          Permission.DELETE_NEWS,
          Permission.PUBLISH_NEWS,
          Permission.ARCHIVE_NEWS,
          Permission.VIEW_NEWS,
          Permission.CREATE_ANNOUNCEMENT,
          Permission.EDIT_ANNOUNCEMENT,
          Permission.DELETE_ANNOUNCEMENT,
          Permission.PUBLISH_ANNOUNCEMENT,
          Permission.ARCHIVE_ANNOUNCEMENT,
          Permission.VIEW_ANNOUNCEMENT,
          Permission.VIEW_EVENT,
          Permission.CREATE_EVENT,
          Permission.EDIT_EVENT,
          Permission.PUBLISH_EVENT,
          Permission.CANCEL_EVENT,
          Permission.COMPLETE_EVENT,
          Permission.VIEW_ORGANIZATION,
          Permission.CREATE_ORGANIZATION,
          Permission.EDIT_ORGANIZATION,
          Permission.VIEW_ROLE,
        ],
        isSystemRole: true,
      },
      {
        name: 'Member Manager',
        description: 'Can manage members and view content',
        permissions: [
          Permission.CREATE_MEMBER,
          Permission.EDIT_MEMBER,
          Permission.DELETE_MEMBER,
          Permission.VIEW_MEMBER,
          Permission.VIEW_NEWS,
          Permission.VIEW_ANNOUNCEMENT,
          Permission.VIEW_EVENT,
          Permission.VIEW_ORGANIZATION,
        ],
        isSystemRole: true,
      },
      {
        name: 'Viewer',
        description: 'Can only view content',
        permissions: [
          Permission.VIEW_NEWS,
          Permission.VIEW_ANNOUNCEMENT,
          Permission.VIEW_MEMBER,
          Permission.VIEW_EVENT,
          Permission.VIEW_ORGANIZATION,
        ],
        isSystemRole: true,
      },
    ];

    const admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      logger.error('Admin user not found');
      process.exit(1);
    }

    for (const roleData of systemRoles) {
      const existingRole = await Role.findOne({ name: roleData.name });
      if (!existingRole) {
        const role = await Role.create({
          ...roleData,
          createdBy: admin._id.toString(),
        });
        logger.info(`✅ System role created: ${role.name}`);
      } else {
        logger.info(`System role already exists: ${roleData.name}`);
      }
    }

    // Create News and Announcements
    const newsCount = await News.countDocuments();
    if (newsCount === 0) {
      const newsData = [
        {
          title: 'CICT Hosts Annual Hackathon 2024: Code for Change',
          excerpt: 'Over 200 students participated in a 48-hour coding marathon, building innovative solutions for real-world community problems.',
          content: 'The College of Information and Communication Technology successfully hosted its Annual Hackathon 2024, bringing together over 200 student developers for an intense 48-hour coding competition. Teams built innovative solutions addressing community challenges in healthcare, education, and sustainability.',
          bodyHtml: '<p>The College of Information and Communication Technology successfully hosted its Annual Hackathon 2024, bringing together over 200 student developers for an intense 48-hour coding competition. Teams built innovative solutions addressing community challenges in healthcare, education, and sustainability.</p><p>The winning team developed an AI-powered waste management system, while runners-up created a mobile health monitoring app for senior citizens.</p>',
          imageUrl: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1756660324/ict4_qnkh2y.jpg',
          coverImage: {
            imageUrl: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1756660324/ict4_qnkh2y.jpg',
            alt: 'CICT Hackathon 2024',
          },
          status: NewsStatus.PUBLISHED,
          author: admin._id,
          ownerType: ContentOwnerType.SYSTEM,
          tags: ['Hackathon', 'Innovation', 'Competition'],
          publishedAt: new Date('2024-03-15'),
        },
        {
          title: 'ICT-SF Hosts Annual Student Leadership Summit',
          excerpt: 'Student leaders from all five CICT organizations gathered for a day of leadership training, team building, and strategic planning.',
          content: 'The ICT Student Forum organized the Annual Student Leadership Summit, bringing together officers and committee heads from all five CICT organizations. The summit featured workshops on effective communication, project management, and conflict resolution led by industry professionals.',
          bodyHtml: '<p>The ICT Student Forum organized the Annual Student Leadership Summit, bringing together officers and committee heads from all five CICT organizations.</p><p>The summit featured workshops on effective communication, project management, and conflict resolution led by industry professionals. Participants also engaged in strategic planning sessions to align organizational goals for the upcoming academic year.</p>',
          imageUrl: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1752335708/photo_2024-09-22_21-31-55_2_y2irl5.jpg',
          coverImage: {
            imageUrl: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1752335708/photo_2024-09-22_21-31-55_2_y2irl5.jpg',
            alt: 'Student Leadership Summit',
          },
          status: NewsStatus.PUBLISHED,
          author: admin._id,
          ownerType: ContentOwnerType.ORGANIZATION,
          organizationId: 'ict-sf',
          tags: ['Leadership', 'Organizations', 'Community'],
          publishedAt: new Date('2024-02-20'),
        },
        {
          title: 'CICT Partners with Top Tech Companies for Internship Program',
          excerpt: 'A new partnership program connects CICT students with internship opportunities at leading technology companies across Metro Manila.',
          content: 'The College of Information and Communication Technology has signed partnership agreements with five leading technology companies to provide internship opportunities for BS Computer Science and BS Information Systems students. The program offers hands-on experience in software development, data analytics, and IT consulting.',
          bodyHtml: '<p>The College of Information and Communication Technology has signed partnership agreements with five leading technology companies to provide internship opportunities for BS Computer Science and BS Information Systems students.</p><p>The program offers hands-on experience in software development, data analytics, and IT consulting, with participating companies committed to hiring top-performing interns for full-time positions upon graduation.</p>',
          imageUrl: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1752335595/371046306_338487401938051_771479620405214262_n_rpkg1f.jpg',
          coverImage: {
            imageUrl: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1752335595/371046306_338487401938051_771479620405214262_n_rpkg1f.jpg',
            alt: 'Industry Partnership',
          },
          status: NewsStatus.PUBLISHED,
          author: admin._id,
          ownerType: ContentOwnerType.SYSTEM,
          tags: ['Partnership', 'Career', 'Industry'],
          publishedAt: new Date('2024-01-25'),
        },
        {
          title: 'ROBOTCU Wins National Robotics Innovation Challenge',
          excerpt: 'The Robotics Club University team took home first place at the National Robotics Innovation Challenge with their autonomous delivery robot.',
          content: 'ROBOTCU brought pride to CICT by winning the National Robotics Innovation Challenge. The team designed and built an autonomous delivery robot capable of navigating complex indoor environments using AI-powered computer vision and sensor fusion technology.',
          bodyHtml: '<p>ROBOTCU brought pride to CICT by winning the National Robotics Innovation Challenge. The team designed and built an autonomous delivery robot capable of navigating complex indoor environments.</p><p>The robot uses AI-powered computer vision and sensor fusion technology to detect obstacles, plan optimal routes, and deliver packages safely to designated locations. The team received a trophy and grant funding for future research.</p>',
          imageUrl: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1766939316/500122427_681028194557259_7080048757823211543_n_yeecku.jpg',
          coverImage: {
            imageUrl: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1766939316/500122427_681028194557259_7080048757823211543_n_yeecku.jpg',
            alt: 'ROBOTCU National Champions',
          },
          status: NewsStatus.PUBLISHED,
          author: admin._id,
          ownerType: ContentOwnerType.ORGANIZATION,
          organizationId: 'robotcu',
          tags: ['Robotics', 'Competition', 'Innovation', 'Award'],
          publishedAt: new Date('2024-04-10'),
        },
        {
          title: 'CSS Organizes First-Ever AI Ethics Symposium',
          excerpt: 'Computer Science Society brings together students, faculty, and industry experts to discuss the ethical implications of artificial intelligence.',
          content: 'The Computer Science Society hosted the inaugural AI Ethics Symposium, featuring keynote speakers from academia and industry who explored topics including algorithmic bias, data privacy, and responsible AI development. Over 300 students attended the day-long event.',
          bodyHtml: '<p>The Computer Science Society hosted the inaugural AI Ethics Symposium, featuring keynote speakers from academia and industry who explored topics including algorithmic bias, data privacy, and responsible AI development.</p><p>Over 300 students attended the day-long event, participating in panel discussions and interactive workshops that challenged them to think critically about the societal impact of the technologies they will build.</p>',
          imageUrl: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1782326578/Academics_nb0eat.jpg',
          coverImage: {
            imageUrl: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1782326578/Academics_nb0eat.jpg',
            alt: 'AI Ethics Symposium',
          },
          status: NewsStatus.PUBLISHED,
          author: admin._id,
          ownerType: ContentOwnerType.ORGANIZATION,
          organizationId: 'css',
          tags: ['AI', 'Ethics', 'Symposium', 'Research'],
          publishedAt: new Date('2024-03-28'),
        },
        {
          title: 'CICT Campus Life Festival Draws Record Attendance',
          excerpt: 'The annual Campus Life Festival brought together over 5,000 students for a week of sports, cultural performances, and community activities.',
          content: 'The CICT Campus Life Festival was a resounding success, attracting a record 5,000+ attendees across a week-long celebration. Activities included intramural sports tournaments, a cultural night showcasing student talents, an org fair, and a community service day.',
          bodyHtml: '<p>The CICT Campus Life Festival was a resounding success, attracting a record 5,000+ attendees across a week-long celebration.</p><p>Activities included intramural sports tournaments, a cultural night showcasing student talents, an org fair where all five student organizations recruited new members, and a community service day where students volunteered at local schools and barangay centers.</p>',
          imageUrl: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1752335598/450328906_1014347616442600_380351381824664479_n_bfxjmp.jpg',
          coverImage: {
            imageUrl: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1752335598/450328906_1014347616442600_380351381824664479_n_bfxjmp.jpg',
            alt: 'Campus Life Festival',
          },
          status: NewsStatus.PUBLISHED,
          author: admin._id,
          ownerType: ContentOwnerType.SYSTEM,
          tags: ['Campus Life', 'Festival', 'Community', 'Sports'],
          publishedAt: new Date('2024-02-14'),
        },
        {
          title: 'ISS Launches Business Analytics Laboratory',
          excerpt: 'The Information Systems Society opens a state-of-the-art business analytics lab equipped with industry-standard tools and software.',
          content: 'The Information Systems Society inaugurated the new Business Analytics Laboratory, a dedicated workspace equipped with Tableau, Power BI, SQL servers, and ERP simulation software. The lab will support IS students in coursework, research projects, and consulting engagements with local businesses.',
          bodyHtml: '<p>The Information Systems Society inaugurated the new Business Analytics Laboratory, a dedicated workspace equipped with Tableau, Power BI, SQL servers, and ERP simulation software.</p><p>The lab will support IS students in coursework, research projects, and consulting engagements with local businesses. ISS President Gabriel Villanueva described the lab as a significant step toward bridging classroom learning with real-world business technology practice.</p>',
          imageUrl: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1766939519/IMG_20250517_203753_807_ljfmdc.jpg',
          coverImage: {
            imageUrl: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1766939519/IMG_20250517_203753_807_ljfmdc.jpg',
            alt: 'Business Analytics Lab',
          },
          status: NewsStatus.PUBLISHED,
          author: admin._id,
          ownerType: ContentOwnerType.ORGANIZATION,
          organizationId: 'iss',
          tags: ['Information Systems', 'Analytics', 'Technology', 'Academics'],
          publishedAt: new Date('2024-03-05'),
        },
        {
          title: 'BEST Exchange Program Welcomes International Students',
          excerpt: 'The Board of European Students of Technology welcomes exchange students from partner universities across Europe for a semester of cultural and academic exchange.',
          content: 'BEST CICT chapter launched its international exchange program, welcoming 15 students from partner universities in Germany, Poland, Spain, and Italy. The exchange students will take CICT courses while participating in cultural immersion activities, language exchanges, and collaborative tech projects.',
          bodyHtml: '<p>BEST CICT chapter launched its international exchange program, welcoming 15 students from partner universities in Germany, Poland, Spain, and Italy.</p><p>The exchange students will take CICT courses while participating in cultural immersion activities, language exchanges, and collaborative tech projects with local CICT students. The program aims to foster global perspectives and cross-cultural collaboration in technology education.</p>',
          imageUrl: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1766945618/photo_45_2025-12-29_02-02-12_utofwa.jpg',
          coverImage: {
            imageUrl: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1766945618/photo_45_2025-12-29_02-02-12_utofwa.jpg',
            alt: 'BEST Exchange Program',
          },
          status: NewsStatus.PUBLISHED,
          author: admin._id,
          ownerType: ContentOwnerType.ORGANIZATION,
          organizationId: 'best',
          tags: ['International', 'Exchange', 'Cultural', 'Collaboration'],
          publishedAt: new Date('2024-01-10'),
        },
      ];

      await News.insertMany(newsData);
      logger.info('✅ News articles seeded');
    }

    const announcementCount = await Announcement.countDocuments();
    if (announcementCount === 0) {
      const announcementData = [
        {
          title: 'Enrollment for Academic Year 2024-2025 Now Open',
          content: 'Online enrollment is now open for incoming freshmen and returning students. Visit the admissions portal to complete your registration. Early enrollment runs from June 1 to July 15, 2024.',
          bodyHtml: '<p>Online enrollment is now open for incoming freshmen and returning students. Visit the admissions portal to complete your registration. Early enrollment runs from June 1 to July 15, 2024.</p><p>Requirements: Form 138 (Report Card), Certificate of Good Moral Character, PSA Birth Certificate, and 2x2 ID photos.</p>',
          priority: AnnouncementPriority.HIGH,
          type: AnnouncementType.ACADEMIC,
          status: NewsStatus.PUBLISHED,
          isActive: true,
          author: admin._id,
          ownerType: ContentOwnerType.SYSTEM,
          targetAudience: ['All Students', 'Prospective Students'],
          publishedAt: new Date('2024-05-15'),
          expiresAt: new Date('2024-07-16'),
        },
        {
          title: 'TechSkolar Platform Update: New Features Released',
          content: 'We have released new features on the TechSkolar platform including improved event registration, organization dashboards, and mobile QR check-in. Update your app to access the latest features.',
          bodyHtml: '<p>We have released new features on the TechSkolar platform including improved event registration, organization dashboards, and mobile QR check-in. Update your app to access the latest features.</p><p>Key updates: Real-time attendance tracking, organization membership management, event calendar sync, and enhanced notification system.</p>',
          priority: AnnouncementPriority.MEDIUM,
          type: AnnouncementType.GENERAL,
          status: NewsStatus.PUBLISHED,
          isActive: true,
          author: admin._id,
          ownerType: ContentOwnerType.SYSTEM,
          targetAudience: ['All Users'],
          publishedAt: new Date('2024-04-20'),
          expiresAt: new Date('2024-05-20'),
        },
        {
          title: 'Foundation Week 2024: Schedule of Activities',
          content: 'CICT Foundation Week will be held from August 12-16, 2024. Activities include the opening parade, academic competitions, sports tournaments, cultural night, and the Mr. & Ms. CICT pageant.',
          bodyHtml: '<p>CICT Foundation Week will be held from August 12-16, 2024. Mark your calendars for a week of celebration!</p><p>Activities include: Opening Parade (Aug 12), Academic Quiz Bee and Programming Competition (Aug 13), Intramural Finals (Aug 14), Cultural Night and Talent Showcase (Aug 15), and the Mr. & Ms. CICT Coronation Night (Aug 16).</p>',
          priority: AnnouncementPriority.HIGH,
          type: AnnouncementType.EVENT,
          status: NewsStatus.PUBLISHED,
          isActive: true,
          author: admin._id,
          ownerType: ContentOwnerType.SYSTEM,
          targetAudience: ['All Students', 'Faculty'],
          publishedAt: new Date('2024-07-20'),
          expiresAt: new Date('2024-08-17'),
        },
        {
          title: 'Important: Midterm Examination Guidelines',
          content: 'Midterm examinations for the Second Semester AY 2023-2024 will be held from April 15-19, 2024. Students must present their validated ID and examination permit.',
          bodyHtml: '<p>Midterm examinations for the Second Semester AY 2023-2024 will be held from April 15-19, 2024.</p><p>Requirements: Validated school ID, examination permit, and clearance from the Accounting Office. No permit, no exam policy will be strictly enforced. Contact your department coordinator for permit processing.</p>',
          priority: AnnouncementPriority.HIGH,
          type: AnnouncementType.ACADEMIC,
          status: NewsStatus.PUBLISHED,
          isActive: true,
          author: admin._id,
          targetAudience: ['All Students', 'Faculty'],
          publishedAt: new Date('2024-04-01'),
          expiresAt: new Date('2024-04-20'),
        },
        {
          title: 'Student Organization Recruitment Week',
          content: 'Discover your community! All five CICT student organizations — ICT-SF, CSS, ISS, ROBOTCU, and BEST — will be holding recruitment booths at the CICT lobby from May 6-10.',
          bodyHtml: '<p>Discover your community! All five CICT student organizations — ICT-SF, CSS, ISS, ROBOTCU, and BEST — will be holding recruitment booths at the CICT lobby from May 6-10.</p><p>Learn about each organization mission, programs, benefits, and how you can get involved. New members receive a welcome kit and access to exclusive events. Dont miss this chance to find your org family!</p>',
          priority: AnnouncementPriority.MEDIUM,
          type: AnnouncementType.EVENT,
          status: NewsStatus.PUBLISHED,
          isActive: true,
          author: admin._id,
          ownerType: ContentOwnerType.SYSTEM,
          targetAudience: ['All Students'],
          publishedAt: new Date('2024-04-28'),
          expiresAt: new Date('2024-05-11'),
        },
        {
          title: 'Summer Coding Bootcamp Registration Now Open',
          content: 'CICT is offering intensive summer coding bootcamps in Web Development, Mobile App Development, and Data Science. Limited slots available. Registration closes May 30, 2024.',
          bodyHtml: '<p>CICT is offering intensive summer coding bootcamps in Web Development, Mobile App Development, and Data Science. Limited slots available — only 40 students per track.</p><p>Bootcamps run from June 10 to July 19, 2024. Fee: PHP 500 for currently enrolled students, PHP 1,500 for external participants. Register at the CICT office or online through the student portal.</p>',
          priority: AnnouncementPriority.MEDIUM,
          type: AnnouncementType.ACADEMIC,
          status: NewsStatus.PUBLISHED,
          isActive: true,
          author: admin._id,
          ownerType: ContentOwnerType.SYSTEM,
          targetAudience: ['All Students'],
          publishedAt: new Date('2024-05-01'),
          expiresAt: new Date('2024-05-31'),
        },
      ];

      await Announcement.insertMany(announcementData);
      logger.info('✅ Announcements seeded');
    }

    // Create Events
    const eventCount = await Event.countDocuments();
    if (eventCount === 0) {
      const eventData = [
        {
          title: 'CICT Foundation Week 2024',
          description: 'A week-long celebration of CICT\'s founding anniversary featuring academic competitions, sports tournaments, cultural performances, and community activities.',
          bodyHtml: '<p>A week-long celebration of CICT\'s founding anniversary featuring academic competitions, sports tournaments, cultural performances, and community activities. Join us as we celebrate another year of excellence in technology education!</p>',
          excerpt: 'Join the CICT community in celebrating another year of excellence in technology education with a week of exciting activities and events.',
          organizer: admin._id,
          ownerType: ContentOwnerType.SYSTEM,
          startDate: new Date('2024-08-12T08:00:00'),
          endDate: new Date('2024-08-16T22:00:00'),
          location: 'CICT Campus Grounds',
          status: EventStatus.PUBLISHED,
          publishedAt: new Date('2024-07-20'),
          coverImage: {
            imageUrl: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1752335598/450328906_1014347616442600_380351381824664479_n_bfxjmp.jpg',
            alt: 'CICT Foundation Week 2024',
          },
          imageUrl: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1752335598/450328906_1014347616442600_380351381824664479_n_bfxjmp.jpg',
          tags: ['Foundation Week', 'Celebration', 'Community', 'Campus Life'],
          isRegistrationOpen: true,
          maxAttendees: 0,
          schedule: [
            { label: 'Day 1', title: 'Opening Parade & Program', description: 'Grand opening ceremony and parade around the campus.' },
            { label: 'Day 2', title: 'Academic Competitions', description: 'Quiz Bee, Programming Contest, and Research Poster Exhibit.' },
            { label: 'Day 3', title: 'Sports Finals', description: 'Intramural championship games for basketball, volleyball, and esports.' },
            { label: 'Day 4', title: 'Cultural Night', description: 'Talent showcase, dance competitions, and live band performances.' },
            { label: 'Day 5', title: 'Awards & Closing Ceremony', description: 'Mr. & Ms. CICT coronation and recognition of outstanding students.' },
          ],
        },
        {
          title: 'Annual Hackathon: Code for Change',
          description: 'A 48-hour coding competition where student teams build innovative solutions addressing real-world community challenges.',
          bodyHtml: '<p>A 48-hour coding competition where student teams build innovative solutions addressing real-world community challenges. Open to all CICT students regardless of year level or programming experience.</p><p>Prizes: PHP 10,000 for 1st place, PHP 5,000 for 2nd place, and PHP 3,000 for 3rd place. All participants receive certificates and swag kits.</p>',
          excerpt: 'Build innovative tech solutions for real community problems in this 48-hour hackathon. PHP 10,000 grand prize!',
          organizer: admin._id,
          ownerType: ContentOwnerType.ORGANIZATION,
          organizationId: 'css',
          startDate: new Date('2024-09-20T08:00:00'),
          endDate: new Date('2024-09-22T18:00:00'),
          location: 'CICT Computer Laboratories',
          status: EventStatus.PUBLISHED,
          publishedAt: new Date('2024-08-15'),
          coverImage: {
            imageUrl: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1756660324/ict4_qnkh2y.jpg',
            alt: 'Code for Change Hackathon',
          },
          imageUrl: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1756660324/ict4_qnkh2y.jpg',
          tags: ['Hackathon', 'Coding', 'Competition', 'Innovation'],
          isRegistrationOpen: true,
          maxAttendees: 200,
          registrationCloseAt: new Date('2024-09-18T23:59:59'),
        },
        {
          title: 'Tech Career Fair 2024',
          description: 'Connect with leading tech companies for internship and job opportunities. Bring your resume and portfolio.',
          bodyHtml: '<p>Connect with leading tech companies for internship and job opportunities. Participating companies include top software firms, IT consultancies, and startup incubators from Metro Manila.</p><p>Activities include: Company booths, on-the-spot interviews, resume review station, career talks, and portfolio showcase. Bring multiple copies of your resume!</p>',
          excerpt: 'Meet recruiters from top tech companies. On-the-spot interviews and internship opportunities available.',
          organizer: admin._id,
          ownerType: ContentOwnerType.SYSTEM,
          startDate: new Date('2024-10-05T09:00:00'),
          endDate: new Date('2024-10-05T17:00:00'),
          location: 'CICT Auditorium',
          status: EventStatus.PUBLISHED,
          publishedAt: new Date('2024-09-01'),
          coverImage: {
            imageUrl: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1752335595/371046306_338487401938051_771479620405214262_n_rpkg1f.jpg',
            alt: 'Tech Career Fair 2024',
          },
          imageUrl: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1752335595/371046306_338487401938051_771479620405214262_n_rpkg1f.jpg',
          tags: ['Career Fair', 'Internship', 'Jobs', 'Industry'],
          isRegistrationOpen: true,
          maxAttendees: 500,
          registrationCloseAt: new Date('2024-10-04T23:59:59'),
        },
        {
          title: 'ROBOTCU Workshop Series: Introduction to Robotics',
          description: 'Hands-on workshop series covering robot design, electronics, programming, and autonomous control. No prior experience needed.',
          bodyHtml: '<p>Hands-on workshop series covering robot design, electronics, programming, and autonomous control. Open to all CICT students regardless of program.</p><p>Series includes four sessions: Robot Design Basics, Electronics & Sensors, Programming with Arduino, and Autonomous Navigation. Participants who complete all four sessions receive a certificate from ROBOTCU.</p>',
          excerpt: 'Learn robotics from scratch! Four-session workshop covering design, electronics, and programming.',
          organizer: admin._id,
          ownerType: ContentOwnerType.ORGANIZATION,
          organizationId: 'robotcu',
          startDate: new Date('2024-09-07T13:00:00'),
          endDate: new Date('2024-09-28T17:00:00'),
          location: 'CICT Robotics Laboratory',
          status: EventStatus.PUBLISHED,
          publishedAt: new Date('2024-08-20'),
          coverImage: {
            imageUrl: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1766939342/500442052_681027907890621_3151875760700323871_n_mkssn9.jpg',
            alt: 'ROBOTCU Workshop Series',
          },
          imageUrl: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1766939342/500442052_681027907890621_3151875760700323871_n_mkssn9.jpg',
          tags: ['Robotics', 'Workshop', 'Hands-on', 'Engineering'],
          isRegistrationOpen: true,
          maxAttendees: 30,
          schedule: [
            { label: 'Week 1', title: 'Robot Design Basics', description: 'Principles of mechanical design and material selection.' },
            { label: 'Week 2', title: 'Electronics & Sensors', description: 'Working with motors, sensors, and microcontrollers.' },
            { label: 'Week 3', title: 'Programming with Arduino', description: 'Writing code to control robot movement and sensor input.' },
            { label: 'Week 4', title: 'Autonomous Navigation', description: 'Implementing pathfinding and obstacle avoidance algorithms.' },
          ],
        },
        {
          title: 'Information Systems Case Competition',
          description: 'Teams analyze real business cases and propose technology-driven solutions. Present your recommendations to a panel of industry judges.',
          bodyHtml: '<p>Teams of 3-4 IS students analyze real business cases and propose technology-driven solutions. Present your recommendations to a panel of industry judges from top consulting and tech firms.</p><p>Winners receive internship priority at partner companies, certificates, and cash prizes. This is an excellent opportunity to apply classroom knowledge to real business scenarios.</p>',
          excerpt: 'Apply your IS knowledge to solve real business cases. Compete for internship priority and cash prizes!',
          organizer: admin._id,
          ownerType: ContentOwnerType.ORGANIZATION,
          organizationId: 'iss',
          startDate: new Date('2024-11-15T09:00:00'),
          endDate: new Date('2024-11-16T18:00:00'),
          location: 'CICT Conference Hall',
          status: EventStatus.PUBLISHED,
          publishedAt: new Date('2024-10-20'),
          coverImage: {
            imageUrl: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1766939519/IMG_20250517_203753_807_ljfmdc.jpg',
            alt: 'IS Case Competition',
          },
          imageUrl: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1766939519/IMG_20250517_203753_807_ljfmdc.jpg',
          tags: ['Case Competition', 'Business', 'IS', 'Competition'],
          isRegistrationOpen: true,
          maxAttendees: 100,
          registrationCloseAt: new Date('2024-11-10T23:59:59'),
        },
        {
          title: 'BEST Cultural Exchange Night',
          description: 'An evening of cultural performances, international cuisine, and networking with exchange students from partner universities across Europe.',
          bodyHtml: '<p>An evening of cultural performances, international cuisine, and networking with exchange students from partner universities across Europe. Experience diverse cultures without leaving campus!</p><p>Highlights include: traditional dance performances, food tasting stations featuring dishes from 10 countries, language exchange corner, and a photo exhibit of previous exchange programs.</p>',
          excerpt: 'Experience cultures from across Europe! Food, performances, and networking with international exchange students.',
          organizer: admin._id,
          ownerType: ContentOwnerType.ORGANIZATION,
          organizationId: 'best',
          startDate: new Date('2024-10-25T18:00:00'),
          endDate: new Date('2024-10-25T22:00:00'),
          location: 'CICT Student Center',
          status: EventStatus.PUBLISHED,
          publishedAt: new Date('2024-10-01'),
          coverImage: {
            imageUrl: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1766945618/photo_45_2025-12-29_02-02-12_utofwa.jpg',
            alt: 'BEST Cultural Exchange Night',
          },
          imageUrl: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1766945618/photo_45_2025-12-29_02-02-12_utofwa.jpg',
          tags: ['Cultural', 'International', 'Exchange', 'Networking'],
          isRegistrationOpen: true,
          maxAttendees: 150,
        },
        {
          title: 'Student Leadership Summit 2024',
          description: 'A day of leadership training, team building, and strategic planning for student organization officers and aspiring leaders.',
          bodyHtml: '<p>A day of leadership training, team building, and strategic planning for student organization officers and aspiring leaders. This event has been completed successfully with over 80 participants.</p><p>Workshop topics included: Effective Communication, Conflict Resolution, Event Planning & Budgeting, and Building Inclusive Organizations. Thank you to all who participated!</p>',
          excerpt: 'A day of leadership training and team building for student leaders. Over 80 participants from all five CICT organizations.',
          organizer: admin._id,
          ownerType: ContentOwnerType.ORGANIZATION,
          organizationId: 'ict-sf',
          startDate: new Date('2024-02-15T08:00:00'),
          endDate: new Date('2024-02-15T17:00:00'),
          location: 'CICT Auditorium',
          status: EventStatus.COMPLETED,
          publishedAt: new Date('2024-02-01'),
          completedAt: new Date('2024-02-15T17:00:00'),
          coverImage: {
            imageUrl: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1752335708/photo_2024-09-22_21-31-55_2_y2irl5.jpg',
            alt: 'Student Leadership Summit 2024',
          },
          imageUrl: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1752335708/photo_2024-09-22_21-31-55_2_y2irl5.jpg',
          tags: ['Leadership', 'Training', 'Organizations', 'Community'],
          isRegistrationOpen: false,
          maxAttendees: 100,
        },
        {
          title: 'ICT-SF General Assembly & Welcome Back',
          description: 'Welcome back event for all ICT students. Meet your student government, learn about upcoming activities, and get involved.',
          bodyHtml: '<p>Welcome back event for all ICT students! Meet your ICT-SF officers, learn about upcoming activities for the semester, and discover how you can get involved in student government and college-wide initiatives.</p><p>Free snacks and refreshments will be served. New students are especially encouraged to attend!</p>',
          excerpt: 'Welcome back, ICT students! Meet your student government and learn about exciting opportunities this semester.',
          organizer: admin._id,
          ownerType: ContentOwnerType.ORGANIZATION,
          organizationId: 'ict-sf',
          startDate: new Date('2024-08-19T13:00:00'),
          endDate: new Date('2024-08-19T16:00:00'),
          location: 'CICT Auditorium',
          status: EventStatus.PUBLISHED,
          publishedAt: new Date('2024-08-10'),
          coverImage: {
            imageUrl: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1755790148/529718384_122100992648966778_7029427848362639164_n_geskab.jpg',
            alt: 'ICT-SF General Assembly',
          },
          imageUrl: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1755790148/529718384_122100992648966778_7029427848362639164_n_geskab.jpg',
          tags: ['General Assembly', 'Welcome', 'Community', 'Student Government'],
          isRegistrationOpen: true,
          maxAttendees: 0,
        },
      ];

      await Event.insertMany(eventData);
      logger.info('✅ Events seeded (8 events)');
    }

    // Create Organizations
    const orgCount = await Organization.countDocuments();
    if (orgCount === 0) {
      const orgData = [
        {
          id: 'ict-sf',
          name: 'ICT-SF',
          fullName: 'ICT Student Forum',
          description: 'The premier student organization for all ICT students.',
          longDescription: 'The ICT Student Forum serves as the umbrella organization for the College of ICT, representing the student body and organizing college-wide events.',
          logo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1756660320/cict4_qqksfh.jpg', // Placeholder
          banner: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1755790148/529718384_122100992648966778_7029427848362639164_n_geskab.jpg',
          established: '2018',
          mission: 'To empower ICT students through holistic development and representation.',
          vision: 'To be the leading student organization fostering innovation and leadership.',
          values: ['Leadership', 'Service', 'Excellence'],
          achievements: ['Best Student Council 2023'],
          members: [
            {
              id: 'ictsf-president',
              name: 'Maria Clara Santos',
              position: 'President',
              photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1752335623/462569135_2056490288117874_4448142511748007889_n_jdifnl.jpg',
              bio: 'A dedicated student leader committed to representing the ICT student body and driving meaningful change across the college.',
              joinedDate: '2022',
            },
            {
              id: 'ictsf-vp',
              name: 'Jose Rizal Cruz',
              position: 'Vice President',
              photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1756660318/DSC_0124_n8lgm1.jpg',
              bio: 'Passionate about student welfare and organizational development within the ICT community.',
              joinedDate: '2022',
            },
            {
              id: 'ictsf-secretary',
              name: 'Andrea Mae Dela Cruz',
              position: 'Secretary',
              photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1782326578/Student_Life2_tnlblr.jpg',
              bio: 'Organized and detail-oriented, ensuring smooth communication and documentation across all ICT-SF activities.',
              joinedDate: '2023',
            },
            {
              id: 'ictsf-treasurer',
              name: 'Miguel Araneta Reyes',
              position: 'Treasurer',
              photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1782326595/c3f81b43-9dd5-4cd0-87ef-89f2626c7e1a_amustm.jpg',
              bio: 'Managing the organizations finances with transparency and integrity to support student initiatives.',
              joinedDate: '2023',
            },
          ],
          color: {
            primary: '#6e29f6',
            secondary: '#f629a8',
            accent: '#29f6d2',
          },
        },
        {
          id: 'css',
          name: 'CSS',
          fullName: 'Computer Science Society',
          description: 'The academic organization for Computer Science students.',
          longDescription: 'CSS promotes academic excellence and technological advancement in the field of Computer Science.',
          logo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1756660320/cict4_qqksfh.jpg',
          banner: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1755790148/529718384_122100992648966778_7029427848362639164_n_geskab.jpg',
          established: '2019',
          mission: 'To advance computer science education and practice.',
          vision: 'A community of world-class computer scientists.',
          values: ['Innovation', 'Logic', 'Creativity'],
          achievements: ['National Coding Champions 2024'],
          members: [
            {
              id: 'css-president',
              name: 'Angelo Bautista Tan',
              position: 'President',
              photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1766939958/Messenger_creation_1447755149890924_v5hgih.jpg',
              bio: 'Advancing computer science excellence through research, competitions, and community-driven tech initiatives.',
              joinedDate: '2021',
            },
            {
              id: 'css-vp',
              name: 'Sofia Isabelle Lim',
              position: 'Vice President',
              photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1752335631/462646799_491422266587695_2829599647701455693_n_ehk9wu.png',
              bio: 'Leading academic support programs and mentorship initiatives within the computer science community.',
              joinedDate: '2022',
            },
            {
              id: 'css-secretary',
              name: 'Rafael Consunji Ong',
              position: 'Secretary',
              photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1756660333/IMG_4857_ew1wp8.jpg',
              bio: 'Coordinating symposium logistics and maintaining the society documentation and knowledge base.',
              joinedDate: '2022',
            },
          ],
          color: {
            primary: '#2563eb',
            secondary: '#60a5fa',
            accent: '#fbbf24',
          },
        },
        {
          id: 'iss',
          name: 'ISS',
          fullName: 'Information Systems Society',
          description: 'Bridging technology and business.',
          longDescription: 'ISS focuses on the strategic application of technology in business environments.',
          logo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1756660320/cict4_qqksfh.jpg',
          banner: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1755790148/529718384_122100992648966778_7029427848362639164_n_geskab.jpg',
          established: '2020',
          mission: 'To develop business-savvy technology professionals.',
          vision: 'Leaders in information systems management.',
          values: ['Integrity', 'Strategy', 'Synergy'],
          achievements: ['Digital Transformation Case Competition Winners'],
          members: [
            {
              id: 'iss-president',
              name: 'Gabriel Enrique Villanueva',
              position: 'President',
              photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1752335676/ict2_evnxgu.jpg',
              bio: 'Bridging business and technology through strategic leadership and industry collaboration.',
              joinedDate: '2021',
            },
            {
              id: 'iss-vp',
              name: 'Bianca Marie Fernandez',
              position: 'Vice President',
              photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1782326586/IMG_9662_hxo97w.jpg',
              bio: 'Developing information systems professionals through practical projects and industry engagement.',
              joinedDate: '2022',
            },
            {
              id: 'iss-treasurer',
              name: 'Karl Vincent De Leon',
              position: 'Treasurer',
              photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1752335682/IMG_4475_w1pvki.jpg',
              bio: 'Managing financial resources for consulting projects and professional development activities.',
              joinedDate: '2023',
            },
          ],
          color: {
            primary: '#059669',
            secondary: '#34d399',
            accent: '#fcd34d',
          },
        },
        {
          id: 'best',
          name: 'BEST',
          fullName: 'Board of European Students of Technology',
          description: 'Connecting students across Europe (and beyond).',
          longDescription: 'BEST provides complementary education and international opportunities.',
          logo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1756660320/cict4_qqksfh.jpg',
          banner: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1755790148/529718384_122100992648966778_7029427848362639164_n_geskab.jpg',
          established: '2015',
          mission: 'Developing students through international cooperation.',
          vision: 'Empowered diversity.',
          values: ['Fun', 'Friendship', 'Improvement'],
          achievements: ['European Student Organization Excellence Award', '100+ International Events Organized'],
          members: [
            {
              id: 'best-president',
              name: 'Marcus Heinrich Weber',
              position: 'President',
              photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1782326595/IMG_7600_maxrip.jpg',
              bio: 'Fostering international cooperation and cultural exchange among technology students across borders.',
              joinedDate: '2022',
            },
            {
              id: 'best-vp',
              name: 'Camille Therese Santiago',
              position: 'Vice President',
              photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1766939565/received_1809661546296324_nwsao0.jpg',
              bio: 'Coordinating complementary education programs and career support for international students.',
              joinedDate: '2022',
            },
            {
              id: 'best-exchange',
              name: 'Hannah Grace Villar',
              position: 'Exchange Coordinator',
              photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1782326578/Entertainment_xoxexz.jpg',
              bio: 'Managing cultural exchange events and international student networking programs.',
              joinedDate: '2023',
            },
          ],
          color: {
            primary: '#7c3aed',
            secondary: '#a78bfa',
            accent: '#c4b5fd',
          },
        },
         {
          id: 'robotcu',
          name: 'ROBOTCU',
          fullName: 'Robotics Club University',
          description: 'Innovating the future through robotics.',
          longDescription: 'ROBOTCU is dedicated to the field of robotics and automation.',
          logo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1756660320/cict4_qqksfh.jpg',
          banner: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1755790148/529718384_122100992648966778_7029427848362639164_n_geskab.jpg',
          established: '2017',
          mission: 'To build the future, one robot at a time.',
          vision: 'Pioneering robotics innovation.',
          values: ['Innovation', 'Precision', 'Teamwork'],
          achievements: ['RoboCup 2023 Finalists', 'National Robotics Competition Champions'],
          members: [
            {
              id: 'robotcu-president',
              name: 'Fernando Mateo Agustin',
              position: 'President',
              photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1766939316/500122427_681028194557259_7080048757823211543_n_yeecku.jpg',
              bio: 'Leading robotics innovation and competition teams toward national and international recognition.',
              joinedDate: '2021',
            },
            {
              id: 'robotcu-vp',
              name: 'Katrina Mae Domingo',
              position: 'Vice President',
              photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1766939342/500442052_681027907890621_3151875760700323871_n_mkssn9.jpg',
              bio: 'Coordinating workshops and build sessions that bring robotics education to every skill level.',
              joinedDate: '2022',
            },
            {
              id: 'robotcu-engineer',
              name: 'Diego Luis Pascual',
              position: 'Lead Engineer',
              photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1752335673/DSC01719_za78uq.jpg',
              bio: 'Designing and building competition-grade robots while mentoring junior members in engineering fundamentals.',
              joinedDate: '2022',
            },
            {
              id: 'robotcu-research',
              name: 'Samantha Rae Castillo',
              position: 'Research Head',
              photo: 'https://res.cloudinary.com/ddnxfpziq/image/upload/v1756660324/ict4_qnkh2y.jpg',
              bio: 'Exploring AI and automation research to push the boundaries of what student-built robots can achieve.',
              joinedDate: '2023',
            },
          ],
          color: {
            primary: '#dc2626',
            secondary: '#ef4444',
            accent: '#fee2e2',
          },
        },
      ];

      await Organization.insertMany(orgData);
      logger.info('✅ Organizations seeded');
    }

    logger.info('🎉 Database seeding completed successfully!');
    logger.info('\n📝 Next steps:');
    logger.info('1. Change the default admin password');
    logger.info('2. Start the server with: pnpm dev');
    logger.info('3. Login with: admin@cict.edu / Admin@123456');
    
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
