export interface AboutItem {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  heading: string;
  paragraphs: string[];
  keyPoints: string[];
  visualType: "story" | "mission" | "build" | "process" | "values";
  layout: "image-left" | "image-right" | "image-top" | "process" | "values-grid";
  cta?: {
    label: string;
    href: string;
  };
}

export const aboutItems: AboutItem[] = [
  {
    id: "our-story",
    number: "01",
    title: "Our Story",
    subtitle: "Established 2014",
    heading: "Our Story",
    paragraphs: [
      "The College of Information and Communication Technology was founded in 2014 as part of Taguig City University's commitment to technology education. What started with a vision to bridge academic excellence with real-world innovation has grown into a college of over 10,000 students.",
      "Today, CICT offers two industry-aligned degree programs — BS Computer Science and BS Information Systems — and is home to five active student organizations: ICT-SF, CSS, ISS, ROBOTCU, and BEST.",
    ],
    keyPoints: [
      "Founded in 2014 as part of Taguig City University",
      "Over 10,000 students enrolled",
      "BS Computer Science and BS Information Systems programs",
      "Five student organizations driving campus life",
    ],
    visualType: "story",
    layout: "image-left",
    cta: { label: "Learn More About CICT", href: "/about" },
  },
  {
    id: "mission-vision",
    number: "02",
    title: "Mission & Vision",
    subtitle: "Purpose and direction",
    heading: "Mission & Vision",
    paragraphs: [
      "Our mission is to provide accessible, industry-aligned technology education that empowers Taguig's youth with the knowledge, skills, and ethical foundation to become leaders and innovators in the digital economy.",
      "Our vision is to be the leading college of information and communication technology in the Philippines — recognized for producing globally competitive graduates who drive innovation, create meaningful impact, and shape the future of technology in service of the nation.",
    ],
    keyPoints: [
      "Accessible, industry-aligned technology education",
      "Empowering Taguig's youth with digital skills",
      "Fostering a culture of excellence and collaboration",
      "Producing globally competitive graduates",
    ],
    visualType: "mission",
    layout: "image-right",
  },
  {
    id: "our-values",
    number: "03",
    title: "Our Values",
    subtitle: "Principles that guide us",
    heading: "Our Values",
    paragraphs: [
      "Everything we build and teach is guided by six core values that define the CICT community — shaping how we learn, work, and serve.",
    ],
    keyPoints: [
      "Excellence — Pursuing the highest standards in education and innovation",
      "Innovation — Embracing creativity and forward-thinking solutions",
      "Integrity — Upholding honesty and ethical responsibility",
      "Community — Building an inclusive environment where everyone belongs",
      "Leadership — Developing confident graduates who inspire change",
      "Service — Using technology to serve Taguig and the nation",
    ],
    visualType: "values",
    layout: "values-grid",
  },
];
