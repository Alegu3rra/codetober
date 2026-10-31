import type {EventData} from '../data/schema';
import {Timestamp} from './Timestamp';
import {closingWishWinner} from '../features/wishes/ClosingAnnouncement';

export function EventArchive({data}:{data:EventData}) {
  const winner=closingWishWinner(data)??data.participants.find(p=>p.participant_id===data.event.makeAWish?.result.winnerId),events=data.event.extraordinaryEvents??[];
  const finishers=data.participants.filter(p=>p.problemsCompleted===data.event.totalProblems).length;
  return <section className="event-archive" aria-label="Edition archive">
    <p className="eyebrow">EDITION ARCHIVE</p><h2>The month ends. Your progress stays.</h2>
    <p>Submissions closed on <Timestamp value={data.event.closeAt} zone={data.event.timezone}/>. Problems, recorded results and editorials remain available. Verified corrections can still update results.</p>
    <p className="muted">{finishers} participant{finishers===1?'':'s'} recorded all {data.event.totalProblems} problems. Closing tags recognize participation, more than half, or the complete edition.</p>
    {(data.event.makeAWish||events.length>0)&&<details className="archive-day"><summary>Event memories · Make a Wish &amp; Extraordinarios</summary>
      <div className="event-archive-details">
        {data.event.makeAWish&&<section><h3>Make a Wish</h3>
          {winner?<p>{winner.display_name} (@{winner.leetcode_username}) won the community wish and chose to propose one of the final day’s two problems.</p>:<p>The community wish and its recorded result remain part of this edition’s history.</p>}
          <p>The submission window has ended. Author materials do not grant an automatic solve. The editorial is available after review and closing, without additional author credit.</p>
        </section>}
        {events.length>0&&<section><h3>Extraordinarios</h3><p>Recovery windows are closed. Earned adjustments remain in the ranking; they do not restore missed streaks.</p>
          <ul>{events.map(event=><li key={event.id}>{event.title}: <Timestamp value={event.startAt} zone={data.event.timezone}/> → <Timestamp value={event.endAt} zone={data.event.timezone}/>.</li>)}</ul>
        </section>}
      </div>
    </details>}
  </section>;
}
