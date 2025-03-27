import { getInput, group, info, setFailed, summary, warning } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { parseDate } from 'chrono-node';
import { intervalToDuration } from 'date-fns';

const core = require('@actions/core');

const getInputs = () => {
  const result = {};
  result.owner = context.repo.owner;
  result.repo = context.repo.repo;
  result.token = core.getInput('token');
  return result;
};

export const run = async () => {
  const inputs = getInputs();
  const ownerRepo = {
    owner: inputs.owner,
    repo: inputs.repo,
  };
  if (!inputs.token) return setFailed('`github-token` input is required');
  const octokit = getOctokit(inputs.token);
  const variablePrefix = '_SCHEDULE';
  const workflows = (await octokit.rest.actions.listRepoWorkflows(ownerRepo)).data.workflows;
  const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeStyle: 'medium',
    timeZone: inputs.timezone || 'UTC',
  });

  const getSchedules = async () => {
    const { data: { variables } } = await octokit.rest.actions.listRepoVariables(ownerRepo);
    if (!variables) return [];
    console.log('**Variables: ', variables);
    const schedules = variables
      .filter((variable) => variable.name.startsWith(variablePrefix))
      .map((variable) => {
        const parts = variable.name.split('_');
        const valParts = variable.value.split(/,(.*)/s);
        const workflowInputs = valParts[1] && valParts[1].trim().length > 0 ? JSON.parse(valParts[1]) : undefined;
        const inputsIgnore = inputs.inputsIgnore?.split(',').map((key) => key.trim());
        inputsIgnore?.forEach((key) => {
          if (workflowInputs?.[key]) delete workflowInputs[key];
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
    const _summary = summary.addHeading(`Additional Info - Scheduled Workflows`);
    if (schedules.length) {
      _summary.addTable([
        [
          { data: 'Workflow', header: true },
          { data: `Scheduled Date (${inputs.timezone})`, header: true },
          { data: 'Ref', header: true },
          { data: 'Path', header: true }
        ],
        ...schedules
          .sort((a, b) => a.date.valueOf() - b.date.valueOf())
          .map((schedule) => {
            const _workflow = workflows.find((workflow) => workflow.id === +schedule.workflow_id);
            return [
              _workflow?.name || schedule.workflow_id,
              dateTimeFormatter.format(schedule.date),
              schedule.ref,
              _workflow?.path || 'unknown'
            ];
          })
      ]);
    } else {
      _summary.addRaw('No scheduled workflows found');
    }
    return _summary.write();
  };

  await getSchedules();
};

run();
