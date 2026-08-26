/**
 * Düz metni (TXT) otomatik olarak okuma sayfalarına böler.
 *
 * Algoritma:
 * 1. Metin satırlara ayrılır, boş satırlar paragraf sınırı kabul edilir.
 * 2. Paragraflar sırayla sayfalara yerleştirilir; hedef sayfa uzunluğu
 *    aşılmadan paragraf tamamlanır.
 * 3. Tek bir paragraf hedef uzunluktan uzunsa cümle sınırlarından bölünür,
 *    cümle de çok uzunsa kelime sınırlarından bölünür.
 * 4. Bölüm başlıkları ("Bölüm X", "1." vb. kısa satırlar) yeni sayfaya
 *    alınmaz, akış içinde kalır - böylece sayfa dolulukları dengeli olur.
 */

const CHARS_PER_PAGE = 1600;

export const splitTextIntoPages = (
  rawText: string,
  charsPerPage: number = CHARS_PER_PAGE
): string[] => {
  const normalized = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\u00a0/g, ' ')
    .trim();

  if (!normalized) return [];

  // Paragraflara ayır (boş satırlar ayraç)
  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((p) => p.replace(/[ \t]+/g, ' ').replace(/ ?\n ?/g, ' ').trim())
    .filter(Boolean);

  // Çok uzun paragrafları cümle/kelime sınırlarında parçalara böl
  const chunks = splitLongParagraphs(paragraphs, charsPerPage);

  // Parçaları sayfalara grupla
  const pages: string[] = [];
  let current = '';
  let currentLength = 0;

  for (const chunk of chunks) {
    const chunkLength = chunk.length;

    if (currentLength === 0 || currentLength + chunkLength + 1 <= charsPerPage + 200) {
      current += (current ? '\n\n' : '') + chunk;
      currentLength += chunkLength + (current ? 2 : 0);
    } else {
      pages.push(current);
      current = chunk;
      currentLength = chunkLength;
    }
  }

  if (current) pages.push(current);
  return pages;
};

const splitLongParagraphs = (paragraphs: string[], limit: number): string[] => {
  const result: string[] = [];

  for (const para of paragraphs) {
    if (para.length <= limit + 400) {
      result.push(para);
      continue;
    }

    // Cümlelere böl (. ! ? ... sonrası)
    const sentences = para.match(/[^.!?…]+[.!?…]+["')\]]*|\S+$/g) || [para];
    let buf = '';

    for (const sentence of sentences) {
      if ((buf + ' ' + sentence).trim().length > limit && buf) {
        result.push(buf.trim());
        buf = sentence;
      } else {
        buf = buf ? buf + ' ' + sentence : sentence;
      }

      // Tek cümle bile çok uzundaysa kelime bazında böl
      while (buf.length > limit * 1.5) {
        const cutAt = findWordBoundary(buf, Math.round(limit * 1.25));
        result.push(buf.slice(0, cutAt).trim());
        buf = buf.slice(cutAt).trim();
      }
    }

    if (buf.trim()) result.push(buf.trim());
  }

  return result;
};

const findWordBoundary = (text: string, target: number): number => {
  const spaceIdx = text.lastIndexOf(' ', target);
  return spaceIdx > target / 2 ? spaceIdx : target;
};

/** Kısa satırları bölüm başlığı olarak yakalar (İçindekiler için) */
export const detectChapterTitle = (pageText: string): string | null => {
  const firstLine = pageText.split('\n')[0]?.trim() || '';
  if (
    firstLine.length > 0 &&
    firstLine.length <= 60 &&
    /^(bölüm|kısım|chapter|bap|önsöz|giriş|sonuç)/i.test(firstLine)
  ) {
    return firstLine;
  }
  return null;
};
