"use client";

import { motion } from "framer-motion";
import { ContentBlock } from "@/lib/about-content";
import { HeroIntro } from "./HeroSection";
import { StatsGrid } from "./StatsGrid";
import { ContentGrid } from "./ContentGrid";
import { TextBlock } from "./TextBlock";
import { ListBlock } from "./ListBlock";
import { TimelineBlock } from "./TimelineBlock";
import { QuoteBlock } from "./QuoteBlock";
import { CTABlock } from "./CTABlock";
import { ImageGridBlock } from "./ImageGridBlock";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export function RenderSection({ block, index }: { block: ContentBlock; index: number }) {
  return (
    <motion.div
      variants={fadeInUp}
      key={index}
    >
      {block.type === "heroIntro" && <HeroIntro block={block} />}
      {block.type === "stats" && <StatsGrid block={block} />}
      {block.type === "grid" && <ContentGrid block={block} />}
      {block.type === "text" && <TextBlock block={block} />}
      {block.type === "list" && <ListBlock block={block} />}
      {block.type === "timeline" && <TimelineBlock block={block} />}
      {block.type === "quote" && <QuoteBlock block={block} />}
      {block.type === "cta" && <CTABlock block={block} />}
      {block.type === "imageGrid" && <ImageGridBlock block={block} />}
    </motion.div>
  );
}
