"use client";

import styles from "../../styles/home/page.module.css";
import Interest from "./interest";
import { FaLaptop, FaChartLine, FaBook, FaAtom } from "react-icons/fa";
import { GiSoccerKick } from "react-icons/gi";

export default function Interests({ interests }) {
  const iconMap = {
    FaLaptop: FaLaptop,
    GiSoccerKick: GiSoccerKick,
    FaChartLine: FaChartLine,
    FaBook: FaBook,
    FaAtom: FaAtom,
  };

  return (
    <div className={styles.interestsContainer}>
      <div className={`content ${styles.interestsContent}`}>
        <h1 className={styles.sectionHeading}>Interests</h1>
        <div className={styles.interestList}>
          {interests.map((interest, idx) => {
            const IconComponent = iconMap[interest.icon];
            return (
              <Interest
                key={idx}
                name={interest.name}
                description={interest.description}
                channels={interest.channels}
                icon={<IconComponent />}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
