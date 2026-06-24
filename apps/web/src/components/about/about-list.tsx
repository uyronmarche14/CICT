"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { aboutItems } from "./about-data";
import AboutListRow from "./about-list-row";
import AboutExpandedPanel from "./about-expanded-panel";

export default function AboutList() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
      }}
    >
      {aboutItems.map((item) => {
        const isOpen = activeId === item.id;
        return (
          <motion.div
            key={item.id}
            variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } }}
          >
            <AboutListRow
              item={item}
              isOpen={isOpen}
              onToggle={() => setActiveId(isOpen ? null : item.id)}
            />
            {isOpen && (
              <div
                id={`about-panel-${item.id}`}
                role="region"
                aria-labelledby={`about-row-${item.id}`}
              >
                <AboutExpandedPanel item={item} />
              </div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
