
/*
import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';
import { FitAddon } from 'xterm-addon-fit';
import { SearchAddon } from 'xterm-addon-search';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { Unicode11Addon } from 'xterm-addon-unicode11';

const HISTORY_KEY = 'smartdesk_terminal_history_v1';

export default function TerminalTab() {
    const containerRef = useRef(null);
    const termRef = useRef(null);
    const fitRef = useRef(null);
    const sessionIdRef = useRef(null);
    const [blocks, setBlocks] = useState([]); // [{command, output}]
    const currentBlockRef = useRef({ command: '', output: '' });
    const inputBufferRef = useRef(''); // bieżąca linia (do autocompl.)
    const [history, setHistory] = useState(() => {
        try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
    });
    const historyIndexRef = useRef(-1);

    // Rozpoznanie promptu (proste heurystyki)
    const promptRegex = useRef(
        process.platform === 'win32'
            ? /PS [^\n>]*> $|^[A-Z]:\\.*> $/m   // PowerShell / cmd
            : /[$#] $/m                         // bash/zsh
    );

    useEffect(() => {
        const term = new Terminal({
            allowProposedApi: true,
            cursorBlink: true,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
            fontSize: 13,
            convertEol: true,
            scrollback: 5000,
            macOptionIsMeta: true
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.loadAddon(new SearchAddon());
        term.loadAddon(new WebLinksAddon());
        term.loadAddon(new Unicode11Addon());
        termRef.current = term; fitRef.current = fitAddon;

        term.open(containerRef.current);
        fitAddon.fit();

        const setup = async () => {
            const { id } = await window.terminal.create({ cols: term.cols, rows: term.rows });
            sessionIdRef.current = id;

            window.terminal.onData(({ id: incomingId, data }) => {
                if (incomingId !== sessionIdRef.current) return;
                term.write(data);
                // akumuluj output do bieżącego bloku
                currentBlockRef.current.output += data;
            });

            window.terminal.onExit(({ id: exitingId }) => {
                if (exitingId !== sessionIdRef.current) return;
                // Możesz dodać toast „sesja zakończona”
            });
        };
        setup();

        const onResize = () => { try { fitAddon.fit(); window.terminal.resize(sessionIdRef.current, term.cols, term.rows); } catch {} };
        window.addEventListener('resize', onResize);

        // Obsługa klawiatury: historia (↑/↓), TAB-autocomplete, Enter
        term.onKey(e => {
            const { key, domEvent } = e;
            const id = sessionIdRef.current;

            // Enter → finalizuj block.command i zacznij zbierać output
            if (domEvent.key === 'Enter') {
                // inputBufferRef zawiera wpisaną komendę
                const cmd = inputBufferRef.current.trim();
                if (cmd) {
                    // zapisz do historii (unikaj duplikatu pod rząd)
                    if (history[0] !== cmd) {
                        const next = [cmd, ...history].slice(0, 500);
                        setHistory(next);
                        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
                    }
                    // rozpocznij nowy blok
                    currentBlockRef.current = { command: cmd, output: '' };
                    setBlocks(prev => [...prev, currentBlockRef.current]);
                }
                inputBufferRef.current = '';
                window.terminal.write(id, key); // normalnie wyślij Enter
                return;
            }

            // Backspace → usuń z input buffer jeśli możliwe
            if (domEvent.key === 'Backspace') {
                // xterm nie pozwala łatwo odczytać pozycji kursora względem promptu
                // prostsze: aktualizuj tylko nasz bufor, resztę robi shell
                inputBufferRef.current = inputBufferRef.current.slice(0, -1);
                window.terminal.write(id, key);
                return;
            }

            // TAB → autouzupełnianie z historii (prefix match + fuzzy)
            if (domEvent.key === 'Tab') {
                domEvent.preventDefault();
                const buf = inputBufferRef.current;
                if (!buf) return;
                const candidates = history
                    .filter(h => h.startsWith(buf))
                    .concat(history.filter(h => fuzzy(h, buf)))
                    .filter((v,i,a) => a.indexOf(v) === i);
                if (candidates.length > 0) {
                    const completion = candidates[0];
                    // uzupełnij różnicę
                    const rest = completion.slice(buf.length);
                    inputBufferRef.current = completion;
                    window.terminal.write(id, rest);
                }
                return;
            }

            // Historia ↑ / ↓
            if (domEvent.key === 'ArrowUp') {
                domEvent.preventDefault();
                if (history.length === 0) return;
                historyIndexRef.current = Math.min(historyIndexRef.current + 1, history.length - 1);
                // wyślij Ctrl+U (wyczyść linię) – działa w większości shelli
                window.terminal.write(id, '\x15'); // ^U
                const val = history[historyIndexRef.current];
                inputBufferRef.current = val;
                window.terminal.write(id, val);
                return;
            }
            if (domEvent.key === 'ArrowDown') {
                domEvent.preventDefault();
                if (history.length === 0) return;
                historyIndexRef.current = Math.max(historyIndexRef.current - 1, -1);
                window.terminal.write(id, '\x15');
                const val = historyIndexRef.current === -1 ? '' : history[historyIndexRef.current];
                inputBufferRef.current = val;
                window.terminal.write(id, val);
                return;
            }

            // Normalny znak → dopisz do input buffer
            if (key && key.length === 1) {
                inputBufferRef.current += key;
            }
            window.terminal.write(id, key);
        });

        return () => {
            window.removeEventListener('resize', onResize);
            try { window.terminal.kill(sessionIdRef.current); } catch {}
            term.dispose();
        };
    }, []);

    // Kopiowanie bloku (komenda + output)
    const copyBlock = (idx) => {
        const b = blocks[idx];
        if (!b) return;
        const text = `$ ${b.command}\n${stripAnsi(b.output)}`;
        navigator.clipboard.writeText(text);
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', height: '100%' }}>
            <div ref={containerRef} style={{ background: 'var(--bg-main)' }} />
            <aside style={{ borderLeft: '1px solid var(--border)', overflow: 'auto' }}>
                <div style={{ padding: 12, position: 'sticky', top: 0, background: 'var(--bg-main)' }}>
                    <b>Bloki poleceń</b>
                    <div style={{ opacity: 0.7, fontSize: 12 }}>Kliknij, aby skopiować cały blok</div>
                </div>
                {blocks.slice().reverse().map((b, i) => {
                    const realIndex = blocks.length - 1 - i;
                    return (
                        <div key={realIndex} style={{ padding: 10, borderBottom: '1px solid var(--hover)', cursor: 'pointer' }}
                             onClick={() => copyBlock(realIndex)}>
                            <div style={{ fontFamily: 'monospace' }}><b>$ {b.command}</b></div>
                            <pre style={{ whiteSpace: 'pre-wrap', margin: '6px 0', fontFamily: 'monospace', fontSize: 12 }}>
                {stripAnsi(b.output).slice(0, 2000)}
              </pre>
                            <button>Skopiuj blok</button>
                        </div>
                    );
                })}
            </aside>
        </div>
    );
}
*/

/* ——— Helpers ——— */
/*
function stripAnsi(s) {
    return s.replace(
        // bardzo proste czyszczenie ANSI (wystarczy do kopiowania)
        // eslint-disable-next-line no-control-regex
        /\x1B\[[0-?]*[ -/]*[@-~]/g,
        ''
    );
}
function fuzzy(hay, needle) {
    // mini fuzzy: wszystkie znaki needle w kolejności w hay
    let i = 0;
    for (const ch of hay) if (ch === needle[i]) i++;
    return i >= needle.length && needle.length > 1;
}
*/