import { describe, expect, it } from 'vitest';
import { parseEmbedUrl } from './embedUrl';

const URL_OK = 'https://datastudio.google.com/embed/reporting/71e72570-2c98-4d99-8b73-37d81e89d975/page/p_u56p73jk9d';

describe('parseEmbedUrl', () => {
  it('menerima URL embed Looker Studio dan Data Studio', () => {
    expect(parseEmbedUrl(URL_OK)).toEqual({ url: URL_OK });
    const looker = 'https://lookerstudio.google.com/embed/reporting/abc';
    expect(parseEmbedUrl(looker)).toEqual({ url: looker });
  });

  it('mengambil hanya src dari tag iframe yang ditempel', () => {
    const tag = `<iframe width="600" height="1500" src="${URL_OK}" frameborder="0" style="border:0" allowfullscreen sandbox="allow-scripts"></iframe>`;
    expect(parseEmbedUrl(tag)).toEqual({ url: URL_OK });
  });

  it.each([
    ['http (bukan https)', 'http://lookerstudio.google.com/embed/reporting/abc'],
    ['host lain', 'https://evil.example.com/embed/reporting/abc'],
    ['host menyerupai', 'https://lookerstudio.google.com.evil.com/embed/reporting/abc'],
    ['path bukan embed', 'https://lookerstudio.google.com/reporting/abc'],
    ['userinfo', 'https://lookerstudio.google.com@evil.com/embed/reporting/abc'],
    ['bukan URL', 'bukan url'],
    ['iframe dengan src jahat', '<iframe src="https://evil.example.com/embed/reporting/abc"></iframe>'],
    ['iframe tanpa src', '<iframe></iframe>'],
    ['javascript:', 'javascript:alert(1)'],
  ])('menolak %s', (_label, input) => {
    expect(parseEmbedUrl(input)).toHaveProperty('error');
  });
});
