const { Octokit } = require('@octokit/rest');
const exec = require('@actions/exec');
const git = require('simple-git');
const core = require('@actions/core');
const github = require('@actions/github');
const fetch = require('node-fetch').default;

async function checkoutBranch(gitClient, branchName) {
	await gitClient.checkoutLocalBranch(branchName);
}

async function runCommand(command) {
	const cmd = command.split(' ');
	await exec.exec(cmd[0], cmd.slice(1));
}

async function commitChanges(gitClient, commitMsg, branchName) {
	await gitClient.add('./*');
	await gitClient.commit(commitMsg);
	await gitClient.push('origin', branchName);
}

async function createPullRequest(octokit, context, commitTitle, branchName) {
	await octokit.pulls.create({
		owner: context.repo.owner,
		repo: context.repo.repo,
		title: commitTitle,
		head: branchName,
		base: 'main'
	});
}

async function run() {
	try {
		// Get inputs
		const githubToken = core.getInput('github-token');
		const versionCommand = core.getInput('version-command');
		const publishCommand = core.getInput('publish-command');
		const commitMsg = core.getInput('commit-msg');
		const commitTitle = core.getInput('commit-title');
		const branchName = core.getInput('branch-name');
		const userName = core.getInput('user-name');
		const userEmail = core.getInput('user-email');

		// Get the event that triggered the action
		const { context } = github;
		const event = context.eventName;

		// Set up Git
		const gitClient = git();
		await gitClient.addConfig('user.name', userName);
		await gitClient.addConfig('user.email', userEmail);

		if (event === 'push') {
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
		} else if (
			event === 'pull_request' &&
			context.payload.pull_request.merged
		) {
			await runCommand(publishCommand);
		}
	} catch (error) {
		core.setFailed(error.message);
	}
}

run();
