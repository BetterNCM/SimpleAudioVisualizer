import {
	SoundProcessor
} from 'sound-processor';
import {reduce} from './util.js';
import VisualCanvas from "./VisualCanvas.js";
const AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;;
const FFT_SIZE = 1024;
const START_F = 150; //起始频率
const END_F = 4500; //截止频率
const V_TARGETS = 81;


class Player {
	constructor(audio, vcs=[]) {


		// 创建上下文
		this.AC = loadedPlugins.LibFrontendPlay.currentAudioContext;



		// 创建analyser实例
		this.analyser = this.AC.createAnalyser();
		this.analyser.fftSize = FFT_SIZE;

		// 实例化可视化元素
		this.vc = vcs;

		this.refreshFrame = this.refreshFrame.bind(this);
		this.setAudio = this.setAudio.bind(this);

        if (audio) {
			this.setAudio(audio);
		}
	}

	setAudio(audio, type) {
		if (!audio) {
			console.error('need a audio dom');
			return;
		}
		const {
			AC,
			analyser
		} = this;
		this.audio = audio;


		// 实例化音频处理器
		this.soundProcessor = new SoundProcessor({
			filterParams: {
				sigma: 1,
				radius: 2
			},
			sampleRate: AC.sampleRate,
			fftSize: FFT_SIZE,
			endFrequency: END_F,
			startFrequency: type === 2 ? 1000 : START_F,
			outBandsQty: type === 2 ? 1 : V_TARGETS,
			tWeight: true,
			aWeight: true
		});

		console.log('soundProcessor', this.soundProcessor)
	}

	play() {
            this.refreshFrame();
	}

	pause() {

	}

	refreshFrame() {
		const array = this.getFre();
		this.vc.forEach(vc=>vc.update(array));
		if (!this.paused) {
			window.requestAnimationFrame(this.refreshFrame);
		}
	}

	getFre() {
		return this.soundProcessor.process(loadedPlugins.LibFrontendPlay.getFFTData());
	}
}


export default Player;