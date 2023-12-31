import React from "react";
import { Grid, Stack } from "@mui/material";
import Link from "@mui/material/Link";
import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";
import CollapsableTableCell from "components/CollapsableTableCell";
import FormattedDigitalUnit from "components/FormattedDigitalUnit";
import FormattedDuration from "components/FormattedDuration";
import KeyValueLabel from "components/KeyValueLabel";
import MlRunStatus from "components/MlRunStatus/MlRunStatus";
import RunGoals from "components/RunGoals/RunGoals";
import SubTitle from "components/SubTitle";
import SummaryGrid from "components/SummaryGrid";
import TypographyLoader from "components/TypographyLoader";
import ExecutionBreakdownContainer from "containers/ExecutionBreakdownContainer";
import { ML_RUN_STATUS, SUMMARY_VALUE_COMPONENT_TYPES } from "utils/constants";
import { SPACING_1, SPACING_2 } from "utils/layouts";
import { isEmpty as isEmptyObject } from "utils/objects";

const LOADER_LINES = 5;

const Summary = ({ dataRead, dataWritten, tasksCPU, cpuUptime, isLoading = false, onSeeExecutorsClick }) => (
  <>
    <SubTitle>
      <FormattedMessage id="executorsSummary" />
    </SubTitle>
    {isLoading ? (
      <TypographyLoader linesCount={LOADER_LINES} />
    ) : (
      <>
        <KeyValueLabel messageId="dataRead" value={dataRead ? <FormattedDigitalUnit value={dataRead} /> : null} />
        <KeyValueLabel messageId="dataWritten" value={dataWritten ? <FormattedDigitalUnit value={dataWritten} /> : null} />
        <KeyValueLabel messageId="tasksCPU" value={tasksCPU ?? null} />
        <KeyValueLabel sx={{ mb: SPACING_1 }} messageId="cpuUptime" value={cpuUptime ?? null} />
        <FormattedMessage
          id="seeExecutorsListForThisRun"
          values={{
            link: (chunks) => (
              <Link
                sx={{
                  ":hover": {
                    cursor: "pointer"
                  }
                }}
                onClick={onSeeExecutorsClick}
              >
                {chunks}
              </Link>
            )
          }}
        />
      </>
    )}
  </>
);

const Status = ({ cost, status, duration, isLoading }) => (
  <SummaryGrid
    summaryData={[
      {
        key: "status",
        valueComponentType: SUMMARY_VALUE_COMPONENT_TYPES.Custom,
        CustomValueComponent: MlRunStatus,
        valueComponentProps: { status, iconSize: "medium" },
        color: {
          [ML_RUN_STATUS.RUNNING]: "primary",
          [ML_RUN_STATUS.ABORTED]: "primary",
          [ML_RUN_STATUS.COMPLETED]: "success",
          [ML_RUN_STATUS.FAILED]: "error"
        }[status],
        captionMessageId: "status",
        renderCondition: () => status !== undefined,
        isLoading,
        dataTestIds: {
          cardTestId: "card_run_status"
        }
      },
      {
        key: "duration",
        valueComponentType: SUMMARY_VALUE_COMPONENT_TYPES.Custom,
        CustomValueComponent: FormattedDuration,
        valueComponentProps: {
          durationInSeconds: duration
        },
        renderCondition: () => status !== ML_RUN_STATUS.FAILED,
        captionMessageId: "duration",
        isLoading,
        dataTestIds: {
          cardTestId: "card_run_duration"
        }
      },
      {
        key: "cost",
        valueComponentType: SUMMARY_VALUE_COMPONENT_TYPES.FormattedMoney,
        valueComponentProps: {
          value: cost
        },
        captionMessageId: "expenses",
        dataTestIds: {
          cardTestId: "card_expenses"
        },
        isLoading
      }
    ]}
  />
);

const Goals = ({ reachedGoals, isLoading }) => {
  if (isLoading) {
    return <TypographyLoader linesCount={LOADER_LINES} />;
  }

  return !reachedGoals || isEmptyObject(reachedGoals) ? <FormattedMessage id="noGoals" /> : <RunGoals goals={reachedGoals} />;
};

const Tags = ({ tags, isLoading }) => {
  if (isLoading) {
    return <TypographyLoader linesCount={LOADER_LINES} />;
  }
  return !tags || isEmptyObject(tags) ? <FormattedMessage id="noTags" /> : <CollapsableTableCell tags={tags} />;
};

const Overview = ({
  status,
  duration,
  dataRead,
  dataWritten,
  cost,
  tasksCPU,
  cpuUptime,
  hostCPU,
  processCPU,
  hostRAM,
  processRAM,
  reachedGoals = {},
  tags,
  isLoading = false,
  onSeeExecutorsClick
}) => (
  <Stack spacing={SPACING_2}>
    <div>
      <Status cost={cost} status={status} isLoading={isLoading} duration={duration} />
    </div>
    <div>
      <Grid container spacing={SPACING_2}>
        <Grid item xs={12} sm={4}>
          <Summary
            dataRead={dataRead}
            dataWritten={dataWritten}
            tasksCPU={tasksCPU}
            cpuUptime={cpuUptime}
            hostCPU={hostCPU}
            processCPU={processCPU}
            hostRAM={hostRAM}
            processRAM={processRAM}
            isLoading={isLoading}
            onSeeExecutorsClick={onSeeExecutorsClick}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SubTitle>
            <FormattedMessage id="goals" />
          </SubTitle>
          <Goals reachedGoals={reachedGoals} isLoading={isLoading} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SubTitle>
            <FormattedMessage id="tags" />
          </SubTitle>
          <Tags tags={tags} isLoading={isLoading} />
        </Grid>
      </Grid>
    </div>
    <div>
      <SubTitle>
        <FormattedMessage id="execution" />
      </SubTitle>
      <ExecutionBreakdownContainer reachedGoals={reachedGoals} />
    </div>
  </Stack>
);

Overview.propTypes = {
  status: PropTypes.string,
  startedAt: PropTypes.number,
  duration: PropTypes.number,
  dataRead: PropTypes.number,
  dataWritten: PropTypes.number,
  cost: PropTypes.number,
  tasksCPU: PropTypes.number,
  cpuUptime: PropTypes.number,
  hostCPU: PropTypes.number,
  processCPU: PropTypes.number,
  hostRAM: PropTypes.number,
  processRAM: PropTypes.number,
  goals: PropTypes.array,
  tags: PropTypes.object,
  isLoading: PropTypes.bool,
  onSeeExecutorsClick: PropTypes.func,
  reachedGoals: PropTypes.object
};

export default Overview;
