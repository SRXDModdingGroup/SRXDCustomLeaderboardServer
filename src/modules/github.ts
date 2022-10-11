import { Octokit } from "@octokit/rest";

export const getModReleases = async () => {
    const octokit = new Octokit();
    return (await octokit.rest.repos.listReleases({
        owner: "SRXDModdingGroup",
        repo: "SRXDCustomLeaderboard"
    })).data;
};

export const getLatestModRelease = async () => {
    const releases = await getModReleases();
    return releases && releases[0]
}