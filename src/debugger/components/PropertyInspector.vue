<template>
	<div
		class="PropertyInspector"
		:class="{ 'PropertyInspector--collapsible': canCollapse }"
	>
		<span
			class="PropertyInspector__name"
			:title="path.join('.')"
			@click="handleToggleCollapse"
		>
			<angle-right v-if="canCollapse && isCollapsed" class="PropertyInspector__icon"/>
			<angle-down v-if="canCollapse && !isCollapsed" class="PropertyInspector__icon"/>

			{{ name }}
		</span>

		<value-inspector
			:depth="depth"
			:is-collapsed="isCollapsed"
			:value="value"
			:path="path"
		/>
	</div>
</template>

<script>
	import AngleDown from './../icons/angle-down.vue';
	import AngleRight from './../icons/angle-right.vue';


	export default {
		components: {
			AngleDown,
			AngleRight,
		},
		props: {
			depth: {
				type: Number,
				default: 0,
			},
			name: {
				type: String,
				required: true,
			},
			path: {
				type: Array,
				default: () => [],
			},
			value: {
				required: true,
			},
		},
		data() {
			return {
				isCollapsed: this.depth > 2
			};
		},
		computed: {
			canCollapse() {
				return this.isValueArray || this.isValueObject;
			},
			isValueObject() {
				return typeof this.value === 'object' && this.value !== null && !Array.isArray(this.value);
			},
			isValueArray() {
				return Array.isArray(this.value);
			},
		},
		methods: {
			handleToggleCollapse() {
				if (!this.canCollapse) {
					return;
				}

				this.isCollapsed = !this.isCollapsed;
			}
		}
	}
</script>

<style lang="scss">
	.PropertyInspector {
		&:not(.PropertyInspector--collapsible) {
			display: flex;
			justify-content: space-between;
			flex-wrap: wrap;
		}
	}

	.PropertyInspector__name {
		overflow: hidden;
		text-overflow: ellipsis;
		padding: 2px;

		.PropertyInspector.PropertyInspector--collapsible > & {
			cursor: pointer;
			display: block;
			width: 100%;

			&:hover {
				background-color: rgba(0, 0, 0, 0.1);
			}
		}
	}
</style>
