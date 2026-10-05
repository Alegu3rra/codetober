import React from 'react';
import {render,screen,fireEvent,waitFor,act} from '@testing-library/react';
import {beforeEach,afterEach,expect,test,vi} from 'vitest';
import {useViewedContent,ViewedContentContext,editorialViewId} from './hooks/useViewedContent';
import {ProblemCards} from './components/ProblemCards';
import {Editorials} from './pages/Editorials';
import {editorialsPreviewData as data} from './dev/editorials-preview';
const key='codetober:test:2026';
function Example({scope=key,extra=false}:{scope?:string;extra?:boolean}) {
 const value=useViewedContent(scope);
 const fixture=extra ? {...data,editorials:[...data.editorials!,{...data.editorials![0],id:'new-contribution'}]} : data;
 return <ViewedContentContext.Provider value={value}>
  <span data-testid="pending">{String(value.isUnseen(editorialViewId('demo-two-sum')))}</span>
  <ProblemCards day={data.days[0]} />
  <Editorials data={fixture}/>
 </ViewedContentContext.Provider>;
}
function openEditorial(container:HTMLElement) {
 const details=container.querySelector('details')!;
 details.open=true;fireEvent(details,new Event('toggle'));
}
beforeEach(()=>localStorage.clear());
afterEach(()=>vi.restoreAllMocks());
test('problems have no indicators and do not record clicks',()=>{
 const {container}=render(<Example/>);
 expect(container.querySelectorAll('.problem.has-unseen-content')).toHaveLength(0);
 fireEvent.click(screen.getAllByRole('link',{name:'Solve on LeetCode ↗'})[0]);
 expect(localStorage.getItem(key)).toBeNull();
 expect(screen.getByTestId('pending')).toHaveTextContent('true');
});
test('opened editorials stay read after remount; new contributions glow independently',async()=>{
 const {container,unmount}=render(<Example/>);
 openEditorial(container);
 await waitFor(()=>expect(screen.getByTestId('pending')).toHaveTextContent('false'));
 unmount();
 const next=render(<Example extra/>);
 expect(next.container.querySelectorAll('.editorial-entry.has-unseen-content')).toHaveLength(1);
 expect(next.container.querySelector('.editorial-entry.has-unseen-content')).toHaveAttribute('id','editorial-new-contribution');
});
test('editions and previews have independent storage',()=>{
 const {container,rerender}=render(<Example/>);openEditorial(container);
 rerender(<Example scope="codetober:test:2027"/>);
 expect(screen.getByTestId('pending')).toHaveTextContent('true');
 rerender(<Example/>);expect(screen.getByTestId('pending')).toHaveTextContent('false');
});
test('blocked storage still clears the indicator for this visit',()=>{
 localStorage.setItem(key,'broken json');
 vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('Disabled');});
 const {container}=render(<Example/>);openEditorial(container);
 expect(screen.getByTestId('pending')).toHaveTextContent('false');
});
test('another tab can clear an editorial indicator',()=>{
 render(<Example/>);
 localStorage.setItem(key,JSON.stringify([editorialViewId('demo-two-sum')]));
 act(()=>window.dispatchEvent(new StorageEvent('storage',{key})));
 expect(screen.getByTestId('pending')).toHaveTextContent('false');
});
