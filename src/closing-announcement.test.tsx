import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { closingWishWinner } from './features/wishes/ClosingAnnouncement';
import { ParticipantRow } from './components/ParticipantRow';
import { previewData } from './dev/preview';

describe('confirmed closing wish announcement', () => {
  it('recognizes the organizer-confirmed winner even while the snapshot is pending review', () => {
    const data = structuredClone(previewData);
    const person = data.participants[0];
    person.participant_id = 'participant-004';
    person.leetcode_username = 'Jirafa745';
    person.display_name = 'Rafael López';
    expect(closingWishWinner(data)).toBe(person);
    render(<ParticipantRow person={person} data={data} now={Date.parse(data.generatedAt)} zone="America/Mexico_City" started />);
    const tag = screen.getByRole('link', { name: 'Make a Wish winner' });
    expect(tag.closest('[aria-label="Featured participant tags"]')).not.toBeNull();
  });

  it('does not award the confirmed tag to a different account or edition', () => {
    const data = structuredClone(previewData);
    data.participants[0].participant_id = 'participant-004';
    expect(closingWishWinner(data)).toBeUndefined();
    data.participants[0].leetcode_username = 'Jirafa745';
    data.event.startAt = '2027-10-01T12:00:00Z';
    expect(closingWishWinner(data)).toBeUndefined();
  });
});
