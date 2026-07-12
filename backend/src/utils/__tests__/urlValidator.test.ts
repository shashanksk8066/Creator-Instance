import { describe, it, expect } from '@jest/globals';
import { containsUrl } from '../urlValidator';

describe('urlValidator', () => {
  it('should return false for valid messages without URLs', () => {
    const validInputs = [
      'Hello 👋',
      'Thanks for commenting.',
      'Version 2.0',
      'Mr. John',
      'Price is 3.5 LPA',
      'This is a normal sentence. It has punctuation!',
      'Follow up: what do you think?'
    ];

    validInputs.forEach(input => {
      expect(containsUrl(input)).toBe(false);
    });
  });

  it('should return true for invalid messages containing URLs or IPs', () => {
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

    invalidInputs.forEach(input => {
      expect(containsUrl(input)).toBe(true);
    });
  });
});
