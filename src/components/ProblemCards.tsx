import React from "react";
import { type Day } from "../data";

export function ProblemCards({ day }: { day: Day }) {
  return (
    <div className="problems">
      {day.problems.map((problem, i) => (
        <article className="problem" key={problem.titleSlug}>
          <div className="problem-meta">
            <span>PROBLEM {i + 1}</span>
            <span className={`difficulty ${problem.difficulty.toLowerCase()}`}>
              {problem.difficulty}
            </span>
          </div>
          <h3>{problem.title}</h3>
          <a
            className="solve-link"
            href={problem.url}
            target="_blank"
            rel="noreferrer"
          >
            Solve on LeetCode ↗
          </a>
        </article>
      ))}
    </div>
  );
}
