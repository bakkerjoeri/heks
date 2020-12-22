<template>
	<div>
		<header>
			<button v-if="!isRunning" @click="$startGame">
				Start
			</button>
			<button v-if="isRunning"  @click="$stopGame">
				Pause
			</button>
			<button v-if="!isRunning" @click="$tickGame">
				Tick
			</button>
		</header>

		<aside>
			<pre>
{{ stateString }}
			</pre>
		</aside>
	</div>
</template>

<script>
	export default {
		inject: ['heksData'],
		computed: {
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
	};
</script>
