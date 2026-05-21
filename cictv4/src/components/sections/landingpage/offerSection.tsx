import React from 'react';
import { Button } from '@/components/ui/button';
import { Code, Brain, Database, Shield, Cloud, Search, Briefcase, Users, Settings, TrendingUp, ShoppingCart, Lightbulb } from 'lucide-react';

interface CourseBenefit {
  icon: React.ReactNode;
  title: string;
}

const BSCSBenefits: CourseBenefit[] = [
  { icon: <Code className="w-5 h-5" />, title: "Software Development" },
  { icon: <Brain className="w-5 h-5" />, title: "Artificial Intelligence" },
  { icon: <Settings className="w-5 h-5" />, title: "Machine Learning" },
  { icon: <Database className="w-5 h-5" />, title: "Data Structures & Algorithms" },
  { icon: <Shield className="w-5 h-5" />, title: "Systems Programming" },
  { icon: <Shield className="w-5 h-5" />, title: "Cybersecurity" },
  { icon: <Cloud className="w-5 h-5" />, title: "Cloud Computing" },
  { icon: <Search className="w-5 h-5" />, title: "Research & Innovation" }
];

const BSISBenefits: CourseBenefit[] = [
  { icon: <Briefcase className="w-5 h-5" />, title: "Business Analysis" },
  { icon: <Database className="w-5 h-5" />, title: "Information Management" },
  { icon: <Settings className="w-5 h-5" />, title: "IT Project Management" },
  { icon: <Users className="w-5 h-5" />, title: "Enterprise Systems" },
  { icon: <Database className="w-5 h-5" />, title: "Database Design" },
  { icon: <ShoppingCart className="w-5 h-5" />, title: "E-Commerce Solutions" },
  { icon: <TrendingUp className="w-5 h-5" />, title: "Digital Transformation" },
  { icon: <Lightbulb className="w-5 h-5" />, title: "System Strategy" }
];

const BenefitItem: React.FC<{ benefit: CourseBenefit; isBottom?: boolean }> = ({ benefit, isBottom }) => (
  <div className={`
    ${isBottom 
      ? 'bg-accent/10 border-accent/20 hover:bg-accent/20' 
      : 'bg-primary/10 border-primary/20 hover:bg-primary/20'
    } 
    border rounded-lg p-4 
    transition-all duration-300 hover:scale-105 hover:shadow-md
    flex items-center gap-3
  `}>
    <div className={`
      ${isBottom ? 'text-accent-foreground' : 'text-primary'} 
      flex-shrink-0
    `}>
      {benefit.icon}
    </div>
    <span className={`
      ${isBottom ? 'text-accent-foreground' : 'text-primary'} 
      text-sm font-medium leading-tight
    `}>
      {benefit.title}
    </span>
  </div>
);

export default function OfferSection() {
  return (
    <section className="w-full ">
      {/* BSCS Section - Top */}
      <div className="relative py-16 lg:py-24 bg-primary/5 border-b border-border rounded-t-3xl 
        before:absolute before:inset-0 before:border-t-2 before:border-t-primary/20 before:rounded-t-3xl 
        after:absolute after:inset-0 after:border-t-2 after:border-t-primary/10 after:rounded-t-3xl 
        animate-border-t-pulse 
        transition-all duration-300">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-balance text-4xl font-bold lg:text-6xl bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-4">
              Bachelor of Science in Computer Science
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Master software development, AI, and cutting-edge technology
            </p>
            <p className="text-base text-accent-foreground/80 mb-12 max-w-3xl mx-auto leading-relaxed">
              Our comprehensive BSCS program equips you with the skills to excel in software development, 
              artificial intelligence, and computational problem-solving. From fundamental algorithms to 
              advanced machine learning applications, you&apos;ll be prepared for the tech industry&apos;s most 
              challenging roles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {BSCSBenefits.map((benefit, index) => (
              <BenefitItem key={index} benefit={benefit} />
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground mb-8">
              *Plus specialized tracks in cybersecurity, cloud computing, and research
            </p>
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Explore BSCS Program
            </Button>
          </div>
        </div>
      </div>

      {/* BSIS Section - Bottom */}
      <div className="relative py-16 lg:py-24 bg-accent/5 border-b border-border rounded-b-3xl
        before:absolute before:inset-0 before:border-b-2 before:border-b-accent/20 before:rounded-b-3xl 
        after:absolute after:inset-0 after:border-b-2 after:border-b-accent/10 after:rounded-b-3xl 
        animate-border-b-pulse 
        transition-all duration-300">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-balance text-4xl font-bold lg:text-6xl bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-4">
              Bachelor of Science in Information Systems
            </h2>
            <p className="text-xl text-accent-foreground/80 mb-8">
              Bridge business and technology for strategic impact
            </p>
            <p className="text-base text-accent-foreground/70 mb-12 max-w-3xl mx-auto leading-relaxed">
              Our BSIS program focuses on the strategic use of technology in business. Learn to design, 
              implement, and manage information systems that drive business value and enable digital 
              transformation across organizations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {BSISBenefits.map((benefit, index) => (
              <BenefitItem key={index} benefit={benefit} isBottom />
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-sm text-accent-foreground/60 mb-8">
              *Emphasis on business-technology alignment and strategic management
            </p>
            <Button 
              size="lg" 
              className="bg-accent text-accent-foreground hover:bg-accent/90 text-base px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Explore BSIS Program
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}