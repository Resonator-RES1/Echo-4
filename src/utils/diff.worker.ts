import { diffLines } from 'diff';

self.onmessage = (e: MessageEvent) => {
  const { original, polished } = e.data;
  if (typeof original !== 'string' || typeof polished !== 'string') {
    return;
  }

  const diffResult = diffLines(original, polished);
  self.postMessage({ diffResult });
};
