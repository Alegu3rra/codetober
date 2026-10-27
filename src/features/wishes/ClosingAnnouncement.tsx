import React from 'react';
import type { EventData } from '../../data/schema';
import { WishArt } from './WishArt';
import './closing-announcement.css';

// Public announcement confirmed by the organizer; independent of the score snapshot.
export const closingWish = { year: '2026', winnerId: 'participant-004', username: 'Jirafa745', wishId: 'choose-the-last-problem' } as const;
export function closingWishWinner(data: EventData) {
  if (!data.event.startAt.startsWith(closingWish.year)) return undefined;
  return data.participants.find(p => p.participant_id === closingWish.winnerId && p.leetcode_username.toLowerCase() === closingWish.username.toLowerCase());
}

export function WinnerNotice() {
  return <aside className="final-wish-home-notice" aria-label="Make a Wish winner">
    <span aria-hidden="true">✧</span><div><p className="final-wish-eyebrow">Make a Wish · Winner announced</p><h2>Rafael’s wish will shape our final day.</h2><p>Rafael López (@Jirafa745) chose Choose the Last Problem. One secret problem, one regular daily slot, October 31.</p></div><a href="#make-a-wish">Meet the winner & see the plan →</a>
  </aside>;
}

export function WinnerAnnouncement() {
  return <section className="final-wish-announcement" aria-label="Make a Wish winner announcement">
          <section className="final-wish-hero" aria-labelledby="final-wish-title">
            <div className="final-wish-copy">
              <p className="final-wish-eyebrow">✧ Make a Wish · The winner’s choice</p>
              <h1 id="final-wish-title">One wish.<br />One last <em>surprise.</em></h1>
              <p className="final-wish-lead">The Sunday challenge has a winner.<br />And our final day has a new storyteller.</p>
              <div className="final-wish-winner"><span className="final-wish-medal" aria-hidden="true">✧</span><div><small>MAKE A WISH WINNER</small><strong>Rafael López</strong><a href="https://leetcode.com/u/Jirafa745/" target="_blank" rel="noreferrer">@Jirafa745 ↗</a></div><span className="final-wish-confirmed">Confirmed</span></div>
              <p className="final-wish-caption">Rafael completed both October 25 problems and earned the community wish.</p>
            </div>
            <div className="final-wish-seal"><WishArt motif="star" /><span>THE FINAL WISH</span><strong>31</strong><span>OCTOBER 2026</span><p>A secret worth keeping.</p></div>
          </section>

          <section className="final-wish-choice" aria-labelledby="choice-title"><div><p className="final-wish-eyebrow">His choice · Wish 05</p><h2 id="choice-title">Choose the Last Problem</h2><p>Rafael will propose one problem for October 31, subject to organizer review. It will take one of the two regular daily slots, alongside a LeetCode problem.</p><span className="final-wish-status"><i aria-hidden="true" /> Choice received · Problem under review</span></div><WishArt motif="book" /></section>

          <section className="final-wish-plan" aria-labelledby="closing-plan-title"><div className="final-wish-heading"><p className="final-wish-eyebrow">Your guide to the final day</p><h2 id="closing-plan-title">A familiar challenge.<br />A different way to answer.</h2><p>We’re preparing an Advent-style format: solve locally in any language and submit only your final answer. Access and submission instructions will be announced before opening.</p></div>
            <ol className="final-wish-steps"><li><span>01</span><h3>Open your input</h3><p>At release, read the problem and download your assigned input using a private code sent to your registration email.</p></li><li><span>02</span><h3>Find your answer</h3><p>Use any programming language on your own computer. Each participant gets an individual input.</p></li><li><span>03</span><h3>Submit during the window</h3><p>Send the final answer on Codetober. Your first correct submission counts toward the regular score.</p></li></ol>
          </section>
        <section className="final-wish-window" aria-labelledby="window-title"><div><p className="final-wish-eyebrow">Save the window · Mexico City time (UTC−6)</p><h2 id="window-title">October 31, 06:00 <span>→</span> November 1, 06:00</h2><p>Opens Saturday morning. Closes Sunday morning. Submissions at or after closing do not count.</p></div><span className="final-wish-hours">24<small>HOURS</small></span></section>

        <section className="final-wish-bottom"><div className="final-wish-secret"><span aria-hidden="true">✧</span><p className="final-wish-eyebrow">Sealed until October 31</p><h2>The problem is still a secret.</h2><p>No title. No hints. No early input.<br />The last surprise opens with the final daily release.</p><span className="final-wish-lock">Reveals at 06:00 · Mexico City</span></div><div className="final-wish-rules"><p className="final-wish-eyebrow">Same score. Shared finale.</p><h2>What stays the same</h2><ul><li>Two problems on the final day. Complete both to complete the day and maintain your streak.</li><li>Normal points and timing. No extra problem or special time discount.</li><li>Rafael must also submit during the official window. His review materials do not count as an accepted submission.</li><li>His editorial is delivered privately before opening and published after closing, with no additional editorial credit.</li></ul><p className="final-wish-author-note">As the author, Rafael knows the approach in advance. He will receive his official input at opening.</p></div></section>
        <div className="final-wish-signoff"><span aria-hidden="true">✧</span><p>Thirty-one days of practice.<br /><strong>Let’s write the last chapter together.</strong></p><a href="#problems">Back to the problems →</a></div>
  </section>;
}

