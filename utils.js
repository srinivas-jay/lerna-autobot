const exec = require('@actions/exec');

export function validateInputs(inputs) {
	const { githubToken, branchName, userName, userEmail } = inputs;
	if (!githubToken) {
		throw new Error('Github token is required');
	}
	if (!branchName) {
		throw new Error('Branch name is required');
	}
	if (!userName) {
		throw new Error('User name is required');
	}
	if (!userEmail) {
		throw new Error('User email is required');
	}
}

export async function isCommitMadeByAction(gitClient, userName, userEmail) {
	console.log('userName: ', userName);
	console.log('userEmail: ', userEmail);
	const latestCommit = await gitClient.log({ maxCount: 1 });
	console.log('latestCommit.latest: ', latestCommit?.latest);
	console.log(
		'latestCommit.latest.author_email: ',
		latestCommit?.latest?.author_email
	);
	console.log(
		'latestCommit.latest.author_name: ',
		latestCommit?.latest?.author_name
	);
	if (
		latestCommit &&
		latestCommit.latest &&
		latestCommit.latest.author_email === userEmail &&
		latestCommit.latest.author_name === userName
	) {
		return true;
	}
	return false;
}

export async function checkoutBranch(gitClient, branchName) {
	await gitClient.checkoutLocalBranch(branchName);
}

export async function runCommand(command) {
	try {
		const cmd = command.split(' ');
		await exec.exec(cmd[0], cmd.slice(1));
	} catch (error) {
		throw new Error(`Error running command "${command}": ${error.message}`);
	}
}

export async function commitChanges(gitClient, commitMsg, branchName) {
	try {
		await gitClient.add('./*');
		await gitClient.commit(commitMsg);
		await gitClient.push('origin', branchName);
	} catch (error) {
		throw new Error(`Error committing changes: ${error.message}`);
	}
}

export async function createPullRequest(
	octokit,
	context,
	commitTitle,
	branchName
) {
	try {
		await octokit.pulls.create({
			owner: context.repo.owner,
			repo: context.repo.repo,
			title: commitTitle,
			head: branchName,
			base: 'main'
		});
	} catch (error) {
		throw new Error(`Error creating pull request: ${error.message}`);
	}
}
