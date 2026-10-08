import React from "react";
import { type Day, type Editorial } from "../data";

export function ProblemCards({ day, editorials = [], showFocus = false }: { day: Day; editorials?: Editorial[]; showFocus?: boolean }) {
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
          {showFocus && <p className="problem-focus">Daily focus: <strong>{day.title}</strong>
            {day.description && <span>{day.description}</span>}
          </p>}
          <a
            className="solve-link"
            href={problem.url}
            target="_blank"
            rel="noreferrer"
          >
            Solve on LeetCode ↗
          </a>
          {editorials.some(e => e.titleSlug === problem.titleSlug) && <p><a href={`#editorial-${editorials.find(e => e.titleSlug === problem.titleSlug)!.id}`}>View editorial →</a></p>}
        </article>
      ))}
    </div>
  );
}
