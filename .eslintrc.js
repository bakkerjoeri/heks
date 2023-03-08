export default {
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint", "import"],
	env: {
		browser: true,
		es6: true,
	},
	extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
	rules: {
		"no-empty-function": "allow",
	},
};
