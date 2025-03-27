// output-action.js
const { getInput, setFailed, summary } = require("@actions/core");
const { context, getOctokit } = require("@actions/github");

// Modify getInputs to accept overrides
const getInputs = (overrides = {}) => {
  const result = {};
  // If overrides.repo is provided (as "owner/repo"), split it
  if (overrides.repo && overrides.repo.includes("/")) {
    const [owner, repo] = overrides.repo.split("/");
    result.owner = owner;
    result.repo = repo;
  } else {
    result.owner = context.repo.owner;
    result.repo = context.repo.repo;
  }

  // Use the override token if provided, else read from core inputs.
  result.token = overrides.token || getInput("token");
  // You can add additional inputs similarly:
  result.timezone = overrides.timezone || getInput("timezone");
  result.inputsIgnore = overrides.inputsIgnore || getInput("inputs-ignore");

  return result;
};

const run = async (runtime, overrideInputs = {}) => {
  // Destructure runtime objects if needed
  const { github, context, core } = runtime;
  // Get our inputs, merging any overrides
  const inputs = getInputs(overrideInputs);
  const ownerRepo = {
    owner: inputs.owner,
    repo: inputs.repo,
  };

  if (!inputs.token) {
    return setFailed("`token` input is required");
  }

  const octokit = getOctokit(inputs.token);
  const variablePrefix = "_SCHEDULE";

  // Retrieve the workflows from the repository
  const workflows = (await octokit.rest.actions.listRepoWorkflows(ownerRepo)).data
    .workflows;

  // Setup a date formatter
  const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "medium",
    timeZone: inputs.timezone || "UTC",
  });

  // Function to get schedules
  const getSchedules = async () => {
    const {
      data: { variables },
    } = await octokit.rest.actions.listRepoVariables(ownerRepo);
    if (!variables) return [];
    console.log("**Variables: ", variables);
    const schedules = variables
      .filter((variable) => variable.name.startsWith(variablePrefix))
      .map((variable) => {
        const parts = variable.name.split("_");
        const valParts = variable.value.split(/,(.*)/s);
        const workflowInputs =
          valParts[1] && valParts[1].trim().length > 0
            ? JSON.parse(valParts[1])
            : undefined;
        const inputsIgnore = inputs.inputsIgnore
          ? inputs.inputsIgnore.split(",").map((key) => key.trim())
          : [];
        inputsIgnore.forEach((key) => {
          if (workflowInputs && workflowInputs[key]) {
            delete workflowInputs[key];
          }
        });
        return {
          variableName: variable.name,
          workflow_id: parts[2],
          date: new Date(+parts[3]),
          ref: valParts[0],
          inputs: workflowInputs,
        };
      });
    return schedules;
  };

  const summaryWrite = async () => {
    const schedules = await getSchedules();
    const _summary = summary.addHeading(
      "Additional Info - Scheduled Workflows"
    );
    if (schedules.length) {
      _summary.addTable([
        [
          { data: "Workflow", header: true },
          {
            data: `Scheduled Date (${inputs.timezone || "UTC"})`,
            header: true,
          },
          { data: "Ref", header: true },
          { data: "Path", header: true },
        ],
        ...schedules
          .sort((a, b) => a.date.valueOf() - b.date.valueOf())
          .map((schedule) => {
            const _workflow = workflows.find(
              (workflow) => workflow.id === +schedule.workflow_id
            );
            return [
              _workflow?.name || schedule.workflow_id,
              dateTimeFormatter.format(schedule.date),
              schedule.ref,
              _workflow?.path || "unknown",
            ];
          }),
      ]);
    } else {
      _summary.addRaw("No scheduled workflows found");
    }
    return _summary.write();
  };

  // Execute the summary write
  return await summaryWrite();
};

// Export the run function so your composite action can call it.
module.exports = run;
