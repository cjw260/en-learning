
export interface Options {
    rate?: number; // 语速，默认为 1
    pitch?: number; // 音调，默认为 1
    volume?: number; // 音量，默认为 1
    lang?: string; // 语言，默认为浏览器默认语言
}
let instance: SpeechSynthesisUtterance | null = null;
const getInstance = (options: Options) => {
    if (!instance) {
        instance = new SpeechSynthesisUtterance();
        const { rate = 0.7, pitch = 1, volume = 1, lang = 'en-US' } = options;
        instance.rate = rate;
        instance.pitch = pitch;
        instance.volume = volume;
        instance.lang = lang;
    }
    return instance;
}

export const useAudio = (options: Options) => {
    const playAudio = (word: string) => {
        const pronounce = getInstance(options);
        pronounce.text = word;
        speechSynthesis.speak(pronounce);
    }
    return { playAudio };
}