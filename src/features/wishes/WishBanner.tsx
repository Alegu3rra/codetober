import React from 'react';
import type { WishEvent } from './schema';
import { Countdown } from '../../components/Countdown';

export function WishBanner({ event, now }: { event?: WishEvent; now: number }) {
  if (!event) return null;
  const before = now < Date.parse(event.startAt), active = !before && now < Date.parse(event.endAt);
  return <a className="wish-banner" href="#make-a-wish" aria-label="Discover Make a Wish">
    <span className="wish-banner-star" aria-hidden="true">✧</span>
    <strong>Make a Wish</strong>
    <span>{before ? 'Two problems. One community wish. Starts in' : active ? 'Solve both Sunday problems · ends in' : 'Discover the result & community wishes'}</span>
    {(before || active) && <Countdown target={before ? event.startAt : event.endAt} now={now} />}
    <span className="wish-banner-action">Explore wishes →</span>
  </a>;
}
