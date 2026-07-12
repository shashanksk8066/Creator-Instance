import { containsUrl } from './urlValidator';

const validInputs = [
  'Hello 👋',
  'Thanks for commenting.',
  'Version 2.0',
  'Mr. John',
  'Price is 3.5 LPA',
  'This is a normal sentence. It has punctuation!',
  'Follow up: what do you think?'
];

const invalidInputs = [
  'google.com',
  'www.google.com',
  'https://google.com',
  'http://google.com',
  'Check out bit.ly/test for more info',
  'Join my telegram t.me/channel',
  'discord.gg/test',
  'instagram.com/user',
  'youtube.com/watch?v=123',
  'My local router is 192.168.1.1',
  'example.app',
  'test.dev',
  'cool.ai',
  'startup.xyz',
  'project.io',
  'website.co.in'
];

let failed = false;

validInputs.forEach(input => {
  if (containsUrl(input) !== false) {
    console.error(`FAILED (expected false): ${input}`);
    failed = true;
  }
});

invalidInputs.forEach(input => {
  if (containsUrl(input) !== true) {
    console.error(`FAILED (expected true): ${input}`);
    failed = true;
  }
});

if (!failed) {
  console.log("ALL TESTS PASSED!");
}
