const isTauri = '__TAURI_INTERNALS__' in window;

export async function writeText(text: string): Promise<void> {
  if (isTauri) {
    const { writeText: tauriWriteText } = await import(
      '@tauri-apps/plugin-clipboard-manager'
    );
    await tauriWriteText(text);
  } else {
    await navigator.clipboard.writeText(text);
  }
}
