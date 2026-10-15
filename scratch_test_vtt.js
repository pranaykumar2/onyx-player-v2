function parseCues(content) {
    const cues = [];
    const text = content.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const blocks = text.split(/\n\s*\n/);
    
    for (const block of blocks) {
        const lines = block.trim().split('\n');
        if (lines.length < 2) continue;
        
        let timeLine = '';
        let textLines = [];
        
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('-->')) {
                timeLine = lines[i];
                textLines = lines.slice(i + 1);
                break;
            }
        }
        
        if (!timeLine) continue;
        
        const [startStr, endStr] = timeLine.split('-->').map(s => s.trim().split(' ')[0]);
        
        const parseTime = (t) => {
            const parts = t.replace(',', '.').split(':');
            if (parts.length === 3) {
                return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
            } else if (parts.length === 2) {
                return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
            }
            return 0;
        };
        
        const start = parseTime(startStr);
        const end = parseTime(endStr);
        const cueText = textLines.join('<br>').trim();
        
        if (end > start && cueText) {
            cues.push({ start, end, text: cueText });
        }
    }
    return cues;
}

const sampleSRT = `
1
00:00:01,500 --> 00:00:04,800
[Marvel Studios & Sony Pictures]

2
00:00:05,200 --> 00:00:09,100
Spider-Man: Brand New Day (2026)
`;

console.log('Parsed Cues:', parseCues(sampleSRT));
