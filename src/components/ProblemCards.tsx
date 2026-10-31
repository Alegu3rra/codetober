import React from "react";
import { type Day, type Editorial } from "../data/schema";

export function ProblemCards({ day, editorials = [], showFocus = false, renderExtra, renderAction }: { day: Day; editorials?: Editorial[]; showFocus?: boolean; renderExtra?: (problem: Day['problems'][number]) => React.ReactNode; renderAction?: (problem: Day['problems'][number]) => React.ReactNode }) {
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
          {renderAction?.(problem) ?? <a
            className="solve-link"
            href={problem.url}
            target="_blank"
            rel="noreferrer"
          >
            {problem.source === 'answer-challenge' ? 'Open final challenge →' : 'Solve on LeetCode ↗'}
          </a>}
          {editorials.some(e => e.titleSlug === problem.titleSlug) && <p><a href={`#editorial-${editorials.find(e => e.titleSlug === problem.titleSlug)!.id}`}>View editorial →</a></p>}
          {renderExtra?.(problem)}
        </article>
      ))}
    </div>
  );
}
