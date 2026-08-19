"use client";

import { useMemo, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";

import TimelineItem from "./timelineItem";
import styles from "../../styles/home/timeline.module.css";

const FILTERS = [
  { id: "all", label: "Everything" },
  { id: "experience", label: "Work" },
  { id: "education", label: "School" },
];

function groupByYear(items) {
  const groups = [];
  items.forEach((item) => {
    const year = item.start ?? item.year;
    const last = groups[groups.length - 1];
    if (last && last.year === year) {
      last.items.push(item);
    } else {
      groups.push({ year, items: [item] });
    }
  });
  return groups;
}

export default function TimelineSection({ items }) {
  const [filter, setFilter] = useState("all");
  const railRef = useRef(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ["start 0.8", "end 0.6"],
  });
  const railProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.001,
  });

  const counts = useMemo(
    () => ({
      all: items.length,
      experience: items.filter((i) => i.type === "experience").length,
      education: items.filter((i) => i.type === "education").length,
    }),
    [items]
  );

  const groups = useMemo(() => {
    const newestFirst = [...items].reverse();
    const visible =
      filter === "all"
        ? newestFirst
        : newestFirst.filter((item) => item.type === filter);
    return groupByYear(visible);
  }, [items, filter]);

  return (
    <section className={styles.timelineContainer} aria-labelledby="journey">
      <div className={`content ${styles.timelineContent}`}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            {items[0]?.start} — Present
          </p>
          <h1 id="journey" className={styles.sectionHeading}>
            My Journey
          </h1>
          <p className={styles.route}>
            <span>Nepal</span>
            <span className={styles.routeDash} aria-hidden="true" />
            <span>Nashville</span>
            <span className={styles.routeDash} aria-hidden="true" />
            <span>Seattle</span>
          </p>
          <div className={styles.filters}>
            {FILTERS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={styles.filter}
                aria-pressed={filter === option.id}
                onClick={() => setFilter(option.id)}
              >
                {option.label}
                <span className={styles.count}>{counts[option.id]}</span>
              </button>
            ))}
          </div>
        </header>

        <div className={styles.timeline} ref={railRef}>
          <div className={styles.rail} aria-hidden="true">
            <motion.div
              className={styles.railFill}
              style={{ scaleY: reduceMotion ? 1 : railProgress }}
            />
          </div>

          <div className={styles.groups} key={filter}>
            {groups.map((group) => (
              <div className={styles.group} key={group.year}>
                <div className={styles.yearMark}>
                  <span className={styles.yearLabel}>{group.year}</span>
                  <span className={styles.yearRule} aria-hidden="true" />
                </div>
                <ul className={styles.items}>
                  {group.items.map((item, index) => (
                    <TimelineItem
                      key={`${item.title}-${item.year}`}
                      item={item}
                      index={index}
                      reduceMotion={reduceMotion}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
