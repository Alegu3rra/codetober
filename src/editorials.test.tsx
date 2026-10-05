import React from 'react';
import {render,screen,fireEvent} from '@testing-library/react';
import {expect,test} from 'vitest';
import {Editorials} from './pages/Editorials';
import {editorialsPreviewData} from './dev/editorials-preview';
import {Scoreboard} from './pages/Scoreboard';
import {dataSchema} from './data';
test('editorial preview renders attribution, Markdown, escaped code and contribution form',()=>{
 const data=dataSchema.parse(editorialsPreviewData);
 render(<Editorials data={data} hash="#editorial-demo-two-sum" />);
 expect(screen.getByText('Idea')).toBeVisible();
 expect(screen.getByRole('link',{name:/Submit an editorial/})).toHaveAttribute('href',expect.stringContaining('1FAIpQLSf9-LzVLUh5QxSgLrp6bFqJHCmuGKhP5yyetMvY0NRG7N1owA'));
 expect(screen.getByLabelText('Solution for Two Sum')).toHaveTextContent('unordered_map<int, int>');
 expect(screen.getByText('Complexity')).toBeVisible();
});
test('raw HTML and unsafe markdown links cannot execute',()=>{
 const data=structuredClone(editorialsPreviewData);data.editorials![0].idea='<script>alert(1)</script>\n\n[bad](javascript:alert(1))';
 const {container}=render(<Editorials data={data} hash="#editorial-demo-two-sum"/>);
 expect(container.querySelector('script')).toBeNull();
 expect(container.querySelector('a[href^="javascript:"]')).toBeNull();
});
test('contributor indicator links to the latest entry and histories stay collapsed',()=>{
 const data=editorialsPreviewData;const author=data.participants[0];
 render(<Scoreboard data={data} now={Date.parse(data.generatedAt)} zone={data.event.timezone}/>);
 expect(screen.getByRole('link',{name:`View 1 editorial contribution by ${author.display_name}`})).toHaveAttribute('href','#editorial-demo-two-sum');
 fireEvent.click(screen.getByRole('button',{name:`Expand progress for ${author.display_name}`}));
 expect(screen.getAllByText('View problem history · 6 problems')).toHaveLength(3);
 expect(screen.getByText('View editorial history · 1 contribution')).toBeVisible();
 expect(screen.getByRole('link',{name:'Two Sum →'})).toHaveAttribute('href','#editorial-demo-two-sum');
 expect(screen.queryByText('Community contribution · No extra ranking points.')).toBeNull();
});
test('empty and loading editorial states are explicit',()=>{
 const {rerender}=render(<Editorials data={null} loading/>);
 expect(screen.getByRole('status')).toHaveTextContent('Loading editorials');
 rerender(<Editorials data={null}/>);expect(screen.getByText(/No editorials published yet/)).toBeVisible();
});

test('contributor Markdown tables render as accessible tables',()=>{
 const data=structuredClone(editorialsPreviewData);
 data.editorials![0].idea='| Price | Profit |\n|---|---|\n| 7 | 0 |';
 render(<Editorials data={data} hash="#editorial-demo-two-sum"/>);
 expect(screen.getByRole('table')).toBeVisible();
 expect(screen.getByRole('columnheader',{name:'Price'})).toBeVisible();
});
