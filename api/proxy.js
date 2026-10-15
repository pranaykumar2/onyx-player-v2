/**
 * ONYX Player Vercel Serverless CORS & HLS Stream Proxy
 * Handles cross-origin video streams, m3u8 playlist rewriting, and HTTP range streaming.
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

module.exports = async function handler(req, res) {
    // 1. Enable Global CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Range, Authorization');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Content-Type, Accept-Ranges');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const targetUrl = req.query.url;
    if (!targetUrl) {
        return res.status(400).json({
            error: 'Missing required "url" parameter',
            usage: '/api/proxy?url=https://example.com/stream.m3u8'
        });
    }

    let parsedUrl;
    try {
        parsedUrl = new URL(targetUrl);
    } catch (e) {
        return res.status(400).json({ error: 'Invalid URL provided' });
    }

    // Set up request options
    const protocol = parsedUrl.protocol === 'http:' ? http : https;
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': `${parsedUrl.origin}/`,
        'Origin': parsedUrl.origin
    };

    // Forward Range header if present (crucial for video seeking)
    if (req.headers.range) {
        headers['range'] = req.headers.range;
    }

    const options = {
        method: req.method,
        headers: headers,
        timeout: 15000
    };

    const proxyReq = protocol.request(targetUrl, options, (proxyRes) => {
        const statusCode = proxyRes.statusCode || 200;
        const contentType = proxyRes.headers['content-type'] || '';

        // Forward caching and range headers
        if (proxyRes.headers['accept-ranges']) {
            res.setHeader('Accept-Ranges', proxyRes.headers['accept-ranges']);
        }
        if (proxyRes.headers['content-range']) {
            res.setHeader('Content-Range', proxyRes.headers['content-range']);
        }
        if (proxyRes.headers['content-length']) {
            res.setHeader('Content-Length', proxyRes.headers['content-length']);
        }

        // Check if the response is an HLS playlist (.m3u8)
        const isM3U8 = contentType.includes('mpegurl') ||
                       contentType.includes('application/x-mpegurl') ||
                       parsedUrl.pathname.endsWith('.m3u8');

        if (isM3U8 && statusCode >= 200 && statusCode < 300) {
            // Buffer the playlist and rewrite all chunk and sub-playlist URLs
            let data = '';
            res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');

            proxyRes.on('data', chunk => { data += chunk; });
            proxyRes.on('end', () => {
                const rewritten = rewriteM3u8(data, targetUrl);
                res.status(statusCode);
                res.send(rewritten);
            });
        } else {
            // Binary stream (TS segments, MP4, WebM, etc.)
            res.setHeader('Content-Type', contentType || 'application/octet-stream');
            res.status(statusCode);
            proxyRes.pipe(res);
        }
    });

    proxyReq.on('error', (err) => {
        console.error('Proxy request error:', err.message);
        if (!res.headersSent) {
            res.status(502).json({
                error: 'Failed to fetch upstream media source',
                details: err.message
            });
        }
    });

    proxyReq.on('timeout', () => {
        proxyReq.destroy();
        if (!res.headersSent) {
            res.status(504).json({ error: 'Gateway timeout fetching upstream media' });
        }
    });

    proxyReq.end();
};

/**
 * Rewrites relative and absolute URIs in an M3U8 manifest
 * so all segment and key downloads flow through this proxy.
 */
function rewriteM3u8(content, baseUrl) {
    const proxyPrefix = '/api/proxy?url=';
    return content.split(/\r?\n/).map(line => {
        const trimmed = line.trim();
        if (!trimmed) return line;

        // Rewrite encryption keys or media initialization maps
        if (trimmed.startsWith('#EXT-X-KEY:') || trimmed.startsWith('#EXT-X-MAP:')) {
            return line.replace(/URI="([^"]+)"/g, (match, uri) => {
                try {
                    const abs = new URL(uri, baseUrl).href;
                    return `URI="${proxyPrefix}${encodeURIComponent(abs)}"`;
                } catch (e) {
                    return match;
                }
            });
        }

        // Leave comments and metadata tags untouched
        if (trimmed.startsWith('#')) return line;

        // Rewrite segment or sub-variant manifest URIs
        try {
            const abs = new URL(trimmed, baseUrl).href;
            return `${proxyPrefix}${encodeURIComponent(abs)}`;
        } catch (e) {
            return line;
        }
    }).join('\n');
}
