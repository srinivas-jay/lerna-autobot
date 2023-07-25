const { Octokit } = require('@octokit/rest');
const git = require('simple-git');
const core = require('@actions/core');
const github = require('@actions/github');
const fetch = require('node-fetch').default;

const {
	validateInputs,
	isCommitMadeByAction,
	checkoutBranch,
	commitChanges,
	runCommand,
	createPullRequest
} = require('./utils');

async function run() {
	try {
		// Get inputs
		const inputs = {
			githubToken: core.getInput('github-token'),
			branchName: core.getInput('branch-name'),
			userName: core.getInput('user-name'),
			userEmail: core.getInput('user-email')
		};

		validateInputs(inputs);

		const versionCommand = core.getInput('version-command');
		const publishCommand = core.getInput('publish-command');

		// Get the event that triggered the action
		const { context } = github;

		// Set up Git
		const gitClient = git();
		await gitClient.addConfig('user.name', userName);
		await gitClient.addConfig('user.email', userEmail);

		// Check if the commit is made by this action
		const isActionCommit = await isCommitMadeByAction(
			gitClient,
			userName,
			userEmail
		);

		// if so run the only publish command and exit
		if (isActionCommit) {
			await runCommand(publishCommand);
			return;
		}

		// Run the version command on new branch
		await checkoutBranch(gitClient, branchName);
		await runCommand(versionCommand);
		await commitChanges(gitClient, commitMsg, branchName);

		const octokit = new Octokit({
			auth: githubToken,
			request: {
				fetch: fetch
			}
		});
		await createPullRequest(octokit, context, commitTitle, branchName);
	} catch (error) {
		core.setFailed(error.message);
	}
}

run();
