import * as fs from 'fs';
import * as path from 'path';

const challengesPath = path.resolve(__dirname, '../src/data/challenges.json');
const challengesData = JSON.parse(fs.readFileSync(challengesPath, 'utf-8'));

const updatedChallenges = challengesData.challenges.map((challenge: any) => {
  const codeTest = challenge.code_test || {};
  const starterFiles = challenge.starter_files || [];

  // Extract jsx content from starter_files or code_test.files
  let jsxContent = '';
  if (starterFiles.length > 0 && starterFiles[0].content) {
    jsxContent = starterFiles[0].content;
  } else if (
    codeTest.files &&
    codeTest.files.length > 0 &&
    codeTest.files[0].content
  ) {
    jsxContent = codeTest.files[0].content;
  }

  return {
    ...challenge,
    html_content: codeTest.html || '',
    css_content: codeTest.css || '',
    js_content: codeTest.js || '',
    jsx_content: jsxContent,
  };
});

const output = {
  challenges: updatedChallenges,
};

fs.writeFileSync(challengesPath, JSON.stringify(output, null, 2));
console.log('✅ Updated challenges.json with missing fields');
