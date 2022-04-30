export default {
    // pathPrefix: '/api',
    port: 8090,
    auth: {
        '^/api/[^/]+?/[^/]+?$': [1],
        '^/api/user/login$': [0],
        '^/api/dev/[^/]+?$': [0],
    } as { [key: string]: Array<any> },
    db: {
        host: '127.0.0.1',
        port: 3306,
        database: 'toshokan',
        account: 'root',
        password: 'root',
    },
    suffixRef: {
        video: ['mp4', 'avi', 'mkv', 'm4a', '3gp',],
        audio: ['wav', 'flac', 'mp3', 'aac',],
        image: ['jpg', 'png', 'jpeg', 'tif', 'tiff', 'bmp', 'gif', 'webp',],
        text: ['txt', 'html', 'json',],
        subtitle: ['vtt', 'ass', 'ssa', 'sub', 'srt', 'pjs',],
    } as { [key: string]: Array<any> },
    fileRoot: process.cwd() + '/file/',
    webFileRoot: '/file/',
    webDavRoot: '/webdav/',
    // webFileRoot: 'http://sample.org/file/',
    fileParseConfig: {
        //@see https://slhck.info/video/2017/02/24/vbr-settings.html
        i_cover: {
            length: 640,
            quality: 70,
            format: 'webp',
            codec_lib: 'libwebp',
            allow_size: 1024 * 128,
            allow_container: ['jpg', 'jpeg', 'image2', 'png', 'gif', 'webp',],
        },
        i_preview: {
            length: 1280,
            quality: 75,
            format: 'webp',
            codec_lib: 'webp',
            allow_size: 1024 * 256 * 3,
            allow_container: ['jpg', 'jpeg', 'image2', 'png', 'gif', 'webp',],
        },
        i_normal: {
            length: 2560,
            quality: 90,
            format: 'webp',
            codec_lib: 'webp',
            allow_size: 1024 * 1024 * 2,
            allow_container: ['jpg', 'jpeg', 'image2', 'png', 'gif', 'webp',],
        },
        v_normal: {
            length: 1920,
            length_small: 1440,
            format: 'mp4',
            allow_codec: ['vp8', 'vp9', 'h264',],
            // allow_rate: 4000 * 1000,
            allow_rate: 10000 * 1000,
            allow_container: ['mp4', 'ogg', 'webm', 'm4a',],
            //
            cur_lib: 'h264_nvenc',
            libx264: {
                codec_lib: 'libx264',
                pixFmt: 'yuv422p10',
                quality: 15,  //+- 3500
                quality_small: 15,  //
            },
            h264_nvenc: {
                codec_lib: 'h264_nvenc',
                pixFmt: 'yuv420p',
                target_rate: 6000,  //bufsize *= 5
                target_rate_small: 3000,
                lookahead: 40,
                preset: 'slow',
            },
        },
        a_normal: {
            quality: 1.5,  //+- 110
            format: 'aac',
            codec_lib: 'aac',
            allow_codec: ['mp3', 'aac',],
            allow_container: ['flac', 'mp3', 'aac', 'wav',],
            // allow_rate: 120 * 1000,
            allow_rate: 400 * 1000,
        },
        stt_normal: {
            format: 'vtt',
        },
    },
};