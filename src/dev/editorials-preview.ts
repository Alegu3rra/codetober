import { previewData } from './preview';
import type { EventData } from '../data';
export const editorialsPreviewData: EventData = structuredClone(previewData);
const first = editorialsPreviewData.days[0];
first.title = 'Arrays · Editorial layout preview';
first.problems[0] = {titleSlug:'two-sum',title:'Two Sum',difficulty:'Easy',url:'https://leetcode.com/problems/two-sum/'};
editorialsPreviewData.participants.forEach(p=>p.results.forEach(r=>{if(r.titleSlug==='local-preview-one')r.titleSlug='two-sum';}));
const author = editorialsPreviewData.participants[0];
editorialsPreviewData.editorials = [{
  id:'demo-two-sum',titleSlug:'two-sum',participant_id:author.participant_id,authorName:author.display_name,username:author.leetcode_username,
  publishedAt:'2026-10-02T12:00:00Z',language:'C++',filename:'solution.cpp',
  idea:'Walk through the array once. Store each visited value and its index in a hash map.\n\nFor each value, look for its **complement**: `target - nums[i]`. If it is already in the map, we have found the pair.\n\n- Look up the complement before inserting the current value.\n- This prevents using the same element twice.\n\nThis is a fictional contribution for the local layout preview.',
  solution:'vector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> seen;\n    for (int i = 0; i < nums.size(); ++i) {\n        int complement = target - nums[i];\n        if (seen.count(complement)) return {seen[complement], i};\n        seen[nums[i]] = i;\n    }\n    return {};\n}',complexity:'Time: O(n) expected with a hash map.\nSpace: O(n).',
}];
