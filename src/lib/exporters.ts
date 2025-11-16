import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import type { ChatMessage } from '@/types/chat';
import type { RankedChunk, SourceRef } from '@/types/data';

export async function exportConversationPdf(messages: ChatMessage[]) {
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  const lineHeight = 18;
  let y = 40;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.text('Conversation Summary', 40, y);
  y += lineHeight * 1.5;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);

  messages.forEach((message) => {
    const role = message.role === 'assistant' ? 'Assistant' : 'You';
    const block = `${role}: ${message.content}`;
    const lines = pdf.splitTextToSize(block, 520);
    if (y + lines.length * lineHeight > 780) {
      pdf.addPage();
      y = 40;
    }
    pdf.text(lines, 40, y);
    y += lines.length * lineHeight + lineHeight * 0.6;
  });

  pdf.save('conversation-summary.pdf');
}

export async function downloadSourcesArchive(sources: SourceRef[], chunks: RankedChunk[]) {
  const zip = new JSZip();
  sources.forEach((source) => {
    const chunk = chunks.find((item) => item.id === source.chunkId);
    const content = chunk?.text ?? source.snippet;
    zip.file(`${source.chunkId.replace(/[^a-z0-9_-]/gi, '_')}.txt`, `${content}\n\n(${source.label})`);
  });
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, 'portfolio-evidence.zip');
}

export function buildHrSummary(messages: ChatMessage[]): string {
  const assistantReplies = messages.filter((msg) => msg.role === 'assistant');
  return assistantReplies
    .slice(-3)
    .map((msg) => msg.content)
    .join('\n\n');
}
