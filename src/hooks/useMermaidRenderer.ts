import { useEffect, useRef, useCallback, useState } from 'react';
import mermaid from 'mermaid';
import type { MermaidTheme } from '../types/workflow';

let renderCounter = 0;

export function useMermaidRenderer(code: string, theme: MermaidTheme) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [svgElement, setSvgElement] = useState<SVGElement | null>(null);

  const render = useCallback(async () => {
    if (!containerRef.current || !code) {
      if (containerRef.current) containerRef.current.innerHTML = '';
      setSvgElement(null);
      setError(null);
      return;
    }

    mermaid.initialize({
      startOnLoad: false,
      theme,
      securityLevel: 'loose',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
      },
    });

    try {
      const id = `mermaid-${++renderCounter}`;
      const { svg } = await mermaid.render(id, code);
      if (!containerRef.current) return;
      containerRef.current.innerHTML = svg;
      const svgEl = containerRef.current.querySelector('svg');
      setSvgElement(svgEl);
      setError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      if (containerRef.current) containerRef.current.innerHTML = '';
      setSvgElement(null);
    }
  }, [code, theme]);

  useEffect(() => {
    render();
  }, [render]);

  return { containerRef, error, svgElement };
}
