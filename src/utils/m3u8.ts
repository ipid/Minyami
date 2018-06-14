const fs = require('fs');
import M3U8 from "../core/m3u8";
import Log from "./log";
import axios from 'axios';

export async function loadM3U8(path: string, retries: number = 1, timeout = 60000) {
    let m3u8Content;
    if (path.startsWith('http')) {
        Log.info('Start fetching M3U8 file.');
        while (retries >= 0) {
            try {
                const response = await axios.get(path, {
                    timeout
                });
                Log.info('M3U8 file fetched.');
                m3u8Content = response.data;
                break;
            } catch (e) {
                Log.warning(`Fail to fetch M3U8 file: [${e.code || 'UNKNOWN'}]`);
                Log.warning('If you are downloading a live stream, this may result in a broken output video.');
                retries--;
                if (retries >= 0) {
                    Log.info('Try again.');
                } else {
                    Log.error('Max retries exceeded. Abort.');
                }
            }
        }
    } else {
        // is a local file path
        if (!fs.existsSync(path)) {
            Log.error(`File '${path}' not found.`);
        }
        Log.info('Loading M3U8 file.');
        m3u8Content = fs.readFileSync(path).toString();
    }
    return new M3U8(m3u8Content);
}