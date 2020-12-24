<template>
	<span class="Icon">
		<slot/>
	</span>
</template>

<style lang="scss">
	.Icon {
		display: inline-flex;
		align-items: center;

		svg {
			position: relative;
			width: 1em;
			height: 1em;
			top: 0.125em;
		}
	}
</style>
