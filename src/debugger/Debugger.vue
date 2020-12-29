<template>
	<div class="Debugger">
		<header class="Debugger__header">
			<div class="FpsMeter">
				{{ fps }} FPS
			</div>

			<div class="Controls">
				<button v-if="!isRunning" @click="$startGame">
					Resume
				</button>

				<button v-if="isRunning"  @click="$stopGame">
					Pause
				</button>

				<button v-if="!isRunning" @click="$tickGame">
					Tick
				</button>

				<input
					v-if="!isRunning"
					type="range"
					step="1"
					min="0"
					:max="stateHistory.length - 1"
					v-model.number="stateHistoryIndex"
					@input="handleChangeStateHistory"
				>

				<button v-if="!isReplaying && !isRunning" @click="isReplaying = true" :disabled="stateHistoryIndex === stateHistory.length - 1">
					Replay
				</button>

				<button v-if="isReplaying" @click="isReplaying = false">
					Pause replay
				</button>

				<select v-model="replaySpeed" :disabled="isReplaying" v-if="!isRunning">
					<option :value="0.05">0.05x</option>
					<option :value="0.1">0.1x</option>
					<option :value="0.25">0.25x</option>
					<option :value="0.5">0.5x</option>
					<option :value="0.75">0.75x</option>
					<option :value="1">1x</option>
				</select>
			</div>
		</header>

		<aside class="Debugger__sidebar StateInspector">
			<value-inspector :value="state"/>
		</aside>

		<main
			ref="gameContainer"
			class="Debugger__mainContent GameContainer"
		/>
	</div>
</template>

<script>
	export default {
		inject: ['heksData'],
		data() {
			return {
				isReplaying: false,
				stateHistory: [{
					time: this.heksData.value.time,
					state: this.heksData.value.state,
				}],
				stateHistoryIndex: 0,
				replaySpeed: 1,
				replayFrameCount: 0,
				replayRafHandle: null,
			};
		},
		computed: {
			time() {
				return this.heksData.value.time;
			},
			fps() {
				return this.heksData.value.fps.toFixed(1);
			},
			isRunning() {
				return this.heksData.value.isRunning;
			},
			state() {
				return this.heksData.value.state;
			},
			stateString() {
				return JSON.stringify(this.heksData.value.state, null, 4);
			},
		},
		methods: {
			handleChangeStateHistory(event) {
				this.$stopGame();
				this.$updateState(this.stateHistory[this.stateHistoryIndex].state, this.stateHistory[this.stateHistoryIndex].time);
			},
			replay() {
				if (!this.isReplaying) {
					return;
				}

				this.replayRafHandle = window.requestAnimationFrame((time) => {
					this.replayFrameCount += 1;

					if (this.replayFrameCount >= (1 / this.replaySpeed)) {
						this.replayFrameCount = 0;
						this.stateHistoryIndex = Math.min(this.stateHistory.length - 1, this.stateHistoryIndex + 1);
						this.$updateState(this.stateHistory[this.stateHistoryIndex].state, this.stateHistory[this.stateHistoryIndex].time);
					}

					this.replay();
				});
			},
		},
		watch: {
			state() {
				if (this.isRunning) {
					this.stateHistory.push({
						time: this.time,
						state: this.state,
					});

					this.stateHistoryIndex = this.stateHistory.length - 1;
				}
			},
			isReplaying(value) {
				if (value && !this.isRunning) {
					this.replay();
				} else {
					window.cancelAnimationFrame(this.replayRafHandle);
				}
			},
			isRunning(value) {
				if (value) {
					this.isReplaying = false;
				}
			}
		},
		mounted() {
			this.$refs.gameContainer.appendChild(this.$canvas);
		}
	};
</script>

<style lang="scss">
	* {
		box-sizing: border-box;
	}

	.Debugger {
		display: grid;
		grid-template-columns: 1fr 320px;
		grid-template-rows: 32px 1fr;
	}

	.Debugger__header {
		display: flex;
		align-items: center;
		grid-column: 1 / -1;
		grid-row: 1;
	}

	.Debugger__sidebar {
		grid-column: 2;
		grid-row: 2 / -1;
	}

	.Debugger__mainContent {
		grid-column: 1;
		grid-row: 2 / 3;
	}

	.FpsMeter {
		min-width: 60px;
		font-family: Monaco, monospace;
		font-size: 12px;
	}

	.Controls {
		display: flex;
		align-items: center;
		padding: 5px 0px;
	}

	.StateInspector {
		padding: 0px 5px;
	}
</style>
