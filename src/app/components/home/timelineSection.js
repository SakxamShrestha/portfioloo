"use client";

import TimelineItem from "./timelineItem";
import styles from "../../styles/home/timeline.module.css";

export default function TimelineSection({ items }) {
  const reversedItems = [...items].reverse();
  return (
    <div className={styles.timelineContainer}>
      <div className={`content ${styles.timelineContent}`}>
        <h1 className={styles.sectionHeading}>My Journey</h1>
        <div className={styles.timeline}>
          {reversedItems.map((item, index) => (
            <TimelineItem
              key={index}
              item={item}
              isLeft={index % 2 === 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
