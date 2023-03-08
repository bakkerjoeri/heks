export default {
	testEnvironment: "jsdom",
	resolver: "ts-jest-resolver",
	transform: {
		"^.+\\.ts?$": [
			"ts-jest",
			{
				useESM: true,
			},
		],
	},
	extensionsToTreatAsEsm: [".ts"],
};
