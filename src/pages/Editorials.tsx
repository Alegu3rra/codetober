import { useContentIndicators, editorialViewId } from "../hooks/useViewedContent";
import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { EventData } from '../data';
import { selectedEdition } from '../editions';

const contributionForm = 'https://docs.google.com/forms/d/e/1FAIpQLSf9-LzVLUh5QxSgLrp6bFqJHCmuGKhP5yyetMvY0NRG7N1owA/viewform?usp=header';
export function Editorials({data, loading = false, error = false, hash = ''}: {data:EventData|null; loading?:boolean; error?:boolean; hash?:string}) {
  const { isUnseen, markViewed } = useContentIndicators();
  const entries = data?.editorials ?? [];
  return <section className="editorials">
    <h2>Community editorials</h2>
    <p>Different approaches, shared by the people solving the challenge.</p>
    <p className="muted">Reviewed contributions appear after the problem’s daily window closes at 06:00 Guadalajara time. Reading is open to everyone; contributor badges do not add points.</p>
    {selectedEdition.year === 2026 && <aside className="notice">
      <strong>Share your approach</strong>
      <p>Send your LeetCode username, problem name or number, idea.md, solution file, and time / space complexity. You can also propose a video or another format for review.</p>
      <a href={contributionForm} target="_blank" rel="noreferrer">Submit an editorial in a new tab ↗</a>
      <p className="muted">Submissions close November 2, 2026. Contributions are reviewed before publication and credited to their authors.</p>
    </aside>}
    {data?.editorialsFailed && <p role="status" className="notice warning">Editorial updates are delayed. Previously published contributions are still available.</p>}
    {loading && !data ? <p className="empty" role="status">Loading editorials…</p> : error && !data ? <p className="empty">Editorials could not be loaded. Please retry using the message above.</p> : !entries.length ? <p className="empty">No editorials published yet. Be the first to share your approach.</p> : null}
    {[...(data?.days ?? [])].reverse().filter(day => entries.some(e=>day.problems.some(p=>p.titleSlug===e.titleSlug))).map(day => <section key={day.id} className="editorial-day">
      <div className="section-heading"><h3>Day {Number(day.date.slice(-2))} · {day.title}</h3><span className="muted">{day.date}</span></div>
      {day.problems.map(problem => entries.filter(e=>e.titleSlug===problem.titleSlug).map(entry => <details className={`editorial-entry ${isUnseen(editorialViewId(entry.id)) ? 'has-unseen-content' : ''}`}
        onToggle={event => { if (event.currentTarget.open) markViewed(editorialViewId(entry.id)); }} id={`editorial-${entry.id}`} key={`${entry.id}-${hash}`} open={hash===`#editorial-${entry.id}` || undefined}>
        <summary><span>{problem.title} {isUnseen(editorialViewId(entry.id)) && <span className="unread-label">· New</span>}<small>By {entry.authorName} · {entry.language}</small></span><span className="muted">Read approach</span></summary>
        <div className="editorial-body">
          <p><a href={`https://leetcode.com/u/${encodeURIComponent(entry.username)}/`} target="_blank" rel="noreferrer">@{entry.username} ↗</a> · <a href={problem.url} target="_blank" rel="noreferrer">Problem on LeetCode ↗</a></p>
          <h4>Idea</h4>
          <div className="editorial-markdown"><Markdown remarkPlugins={[remarkGfm]} skipHtml components={{img:()=>null, a:({href,children})=><a href={href} target="_blank" rel="noreferrer">{children}</a>}}>{entry.idea}</Markdown></div>
          {entry.solution && <><h4>Solution · {entry.filename}</h4><pre tabIndex={0} aria-label={`Solution for ${problem.title}`}><code>{entry.solution}</code></pre></>}
          <h4>Complexity</h4><p className="editorial-complexity">{entry.complexity}</p>
          {entry.videoUrl && <p><a href={entry.videoUrl} target="_blank" rel="noreferrer">Watch the author’s explanation ↗</a></p>}
        </div>
      </details>))}
    </section>)}
  </section>;
}
