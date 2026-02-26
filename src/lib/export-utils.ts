import { writeText } from '../hooks/clipboard-bridge';

export function copyNotionBlock(mermaidCode: string): Promise<void> {
  const notion = '```mermaid\n' + mermaidCode + '\n```';
  return writeText(notion);
}

export function copyRawMermaid(mermaidCode: string): Promise<void> {
  return writeText(mermaidCode);
}

export function downloadSvg(svgElement: SVGElement, filename = 'workflow.svg'): void {
  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(svgElement);

  if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
    svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  triggerDownload(blob, filename);
}

export async function downloadPng(
  svgElement: SVGElement,
  filename = 'workflow.png',
  scale = 2,
): Promise<void> {
  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(svgElement);

  if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
    svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.crossOrigin = 'anonymous';

  await new Promise<void>((resolve, reject) => {
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth * scale;
      canvas.height = img.naturalHeight * scale;

      const ctx = canvas.getContext('2d')!;
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          triggerDownload(blob, filename);
          resolve();
        } else {
          reject(new Error('PNG conversion failed'));
        }
      }, 'image/png');

      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('SVG image load failed'));
    };
    img.src = url;
  });
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
