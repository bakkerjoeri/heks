<template>
	<keep-alive>
		<ul
			v-if="isValueObject"
			class="ValueInspector"
			:class="{'is-collapsed': isCollapsed}"
		>
			<li
				v-for="([name, childValue], index) in Object.entries(value)"
				:key="index"
				class="ValueInspector__child"
			>
				<property-inspector
					:depth="depth + 1"
					:name="name"
					:path="[...path, name]"
					:value="childValue"
				/>
			</li>
		</ul>

		<ul
			v-else-if="isValueArray"
			class="ValueInspector"
			:class="{'is-collapsed': isCollapsed}"
		>
			<li
				v-for="(childValue, index) in value"
				:key="index"
				class="ValueInspector__child"
			>
				<value-inspector
					:depth="depth + 1"
					:value="childValue"
				/>
			</li>
		</ul>

		<div class="ValueInspector" v-else>
			<input class="ValueInspector__value" :value="value">
		</div>
	</keep-alive>
</template>

<script>
	export default {
		props: {
			depth: {
				type: Number,
				default: 0,
			},
			isCollapsed: {
				type: Boolean,
				default: false,
			},
			path: {
				type: Array,
				default: () => [],
			},
			value: {
				required: true,
			},
		},
		computed: {
			isValueObject() {
				return typeof this.value === 'object' && this.value !== null && !Array.isArray(this.value);
			},
			isValueArray() {
				return Array.isArray(this.value);
			},
		}
	}
</script>

<style lang="scss">
	.ValueInspector {
		flex-grow: 1;
		margin: 0;
		padding-left: 0px;
		list-style: none;
		font-family: Monaco, monospace;
		font-size: 12px;

		&.is-collapsed {
			display: none;
		}
	}

	.ValueInspector__child .ValueInspector__child {
		margin-left: 7px;
		padding-left: 7px;
		border-left: 1px solid #cccccc;
	}

	.ValueInspector__value {
		width: 100%;
		font-family: inherit;
		font-size: inherit;
		text-align: right;
	}
</style>
