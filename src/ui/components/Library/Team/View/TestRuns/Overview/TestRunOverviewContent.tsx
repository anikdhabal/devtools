import { useContext } from "react";

import { LibrarySpinner } from "ui/components/Library/LibrarySpinner";
import { RunResults } from "ui/components/Library/Team/View/TestRuns/Overview/RunResults";

import { RunSummary } from "./RunSummary";
import { TestRunOverviewContext } from "./TestRunOverviewContainerContextType";
import styles from "../../../../Library.module.css";

export function TestRunOverviewContent() {
  const { testRun } = useContext(TestRunOverviewContext);

  return (
    <div className={`flex h-full flex-col text-sm ${styles.runOverview}`}>
      {testRun ? (
        <>
          <RunSummary testRun={testRun} />
          <RunResults />
        </>
      ) : (
        <LibrarySpinner />
      )}
    </div>
  );
}
