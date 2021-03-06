/* eslint-env node, jasmine */
"use strict";
const {join} = require("path");
const {Server} = require("karma");
const getKarmaConfig = require("..");

/**
 * Runs a set of tests in Karma and returns results.
 * @param {Object} config Karma config
 */
function runKarma(config, verbose = false) {
	return new Promise((resolve) => {
		let fixtureResults;
		config.port = 9879;
		config.singleRun = true;
		if (!verbose) {
			config.reporters = [];
			config.logLevel = "OFF";
		}
		const server = new Server(config, () => {
			resolve(fixtureResults);
		});
		server.on("run_complete", (_browsers, results) => {
			fixtureResults = {
				passed: results.success,
				failed: results.failed
			};
		});
		server.start();
	});
}

describe("Fixtures", () => {
	it("No parameters", async () => {
		const config = getKarmaConfig();
		const actual = await runKarma(config);
		expect(actual).toEqual({passed: 0, failed: 0});
	}, 30000);

	it("Vanilla", async () => {
		const config = getKarmaConfig({
			files: "test/fixtures/basic/*.spec.js"
		});
		const actual = await runKarma(config);
		expect(actual).toEqual({passed: 2, failed: 1});
	}, 30000);

	it("Webpack", async () => {
		const config = getKarmaConfig({
			files: "test/fixtures/basic/*.spec.js",
			webpack: {
				mode: "development"
			}
		});
		const actual = await runKarma(config);
		expect(actual).toEqual({passed: 2, failed: 1});
	}, 60000);

	it("Custom Loader", async () => {
		const config = getKarmaConfig({
			files: "test/fixtures/loaders/*.spec.js",
			webpack: {
				mode: "development",
				module: {
					rules: [
						{
							test: /\.example$/,
							use: join(__dirname, "fixtures/loaders/example.loader.js")
						}
					]
				}
			}
		});
		const actual = await runKarma(config);
		expect(actual).toEqual({passed: 2, failed: 0});
	}, 60000);
});
