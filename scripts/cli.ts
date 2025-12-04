import {
  select,
  text,
  groupMultiselect,
  isCancel,
  intro,
  outro,
  confirm,
  note,
} from "@clack/prompts";
import os from "os";
import { diffLines } from "diff";
import {
  generateToDirectory,
  checkForConflicts,
  VARIANT_OPTIONS,
  getScopeOptions,
  getCommandsGroupedByCategory,
  type Variant,
  type Scope,
} from "./cli-generator.js";

type LineInfo = {
  text: string;
  type: "added" | "removed" | "unchanged";
  lineNum: number;
};

function formatCompactDiff(
  oldContent: string,
  newContent: string,
  contextLines = 2,
): string {
  const changes = diffLines(oldContent, newContent);
  const lines: string[] = [];

  const allLines: LineInfo[] = [];
  let lineNum = 1;

  for (const change of changes) {
    const changeLines = change.value.split("\n");
    if (changeLines[changeLines.length - 1] === "") changeLines.pop();

    for (const text of changeLines) {
      if (change.added) {
        allLines.push({ text, type: "added", lineNum: -1 });
      } else if (change.removed) {
        allLines.push({ text, type: "removed", lineNum: lineNum++ });
      } else {
        allLines.push({ text, type: "unchanged", lineNum: lineNum++ });
      }
    }
  }

  let i = 0;
  while (i < allLines.length) {
    if (allLines[i].type === "unchanged") {
      i++;
      continue;
    }

    const hunkStart = Math.max(0, i - contextLines);
    let hunkEnd = i;

    while (hunkEnd < allLines.length) {
      if (allLines[hunkEnd].type !== "unchanged") {
        hunkEnd++;
      } else {
        let nextChange = hunkEnd;
        while (
          nextChange < allLines.length &&
          nextChange < hunkEnd + contextLines * 2 + 1
        ) {
          if (allLines[nextChange].type !== "unchanged") break;
          nextChange++;
        }
        if (
          nextChange < allLines.length &&
          nextChange < hunkEnd + contextLines * 2 + 1 &&
          allLines[nextChange].type !== "unchanged"
        ) {
          hunkEnd = nextChange + 1;
        } else {
          break;
        }
      }
    }
    hunkEnd = Math.min(allLines.length, hunkEnd + contextLines);

    const firstLineNum =
      allLines.slice(hunkStart, hunkEnd).find((l) => l.lineNum > 0)?.lineNum ||
      1;
    lines.push(`@@ -${firstLineNum} @@`);

    for (let j = hunkStart; j < hunkEnd; j++) {
      const line = allLines[j];
      if (line.type === "added") {
        lines.push(`+ ${line.text}`);
      } else if (line.type === "removed") {
        lines.push(`- ${line.text}`);
      } else {
        lines.push(`  ${line.text}`);
      }
    }

    lines.push("");
    i = hunkEnd;
  }

  return lines.join("\n").trimEnd();
}

const BATMAN_LOGO = `
       _==/          i     i          \\==_
     /XX/            |\\___/|            \\XX\\
   /XXXX\\            |XXXXX|            /XXXX\\
  |XXXXXX\\_         _XXXXXXX_         _/XXXXXX|
 XXXXXXXXXXXxxxxxxxXXXXXXXXXXXxxxxxxxXXXXXXXXXXX
|XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX|
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
|XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX|
 XXXXXX/^^^^"\\XXXXXXXXXXXXXXXXXXXXX/^^^^^\\XXXXXX
  |XXX|       \\XXX/^^\\XXXXX/^^\\XXX/       |XXX|
    \\XX\\       \\X/    \\XXX/    \\X/       /XX/
       "\\       "      \\X/      "       /"

            @wbern/claude-instructions
`;

export interface CliArgs {
  variant?: string;
  scope?: string;
  prefix?: string;
  skipTemplateInjection?: boolean;
  commands?: string[];
}

export async function main(args?: CliArgs): Promise<void> {
  intro(BATMAN_LOGO);

  let variant: string | symbol;
  let scope: string | symbol;
  let commandPrefix: string | symbol;
  let selectedCommands: string[] | symbol | undefined;

  if (args?.variant && args?.scope && args?.prefix !== undefined) {
    variant = args.variant;
    scope = args.scope;
    commandPrefix = args.prefix;
    selectedCommands = args.commands;
  } else {
    variant = await select({
      message: "Select variant",
      options: [...VARIANT_OPTIONS],
    });

    if (isCancel(variant)) {
      return;
    }

    const terminalWidth = process.stdout.columns || 80;
    const uiOverhead = 25; // checkbox, label, padding
    scope = await select({
      message: "Select installation scope",
      options: getScopeOptions(terminalWidth - uiOverhead),
    });

    if (isCancel(scope)) {
      return;
    }

    commandPrefix = await text({
      message: "Command prefix (optional)",
      placeholder: "e.g. my-",
    });

    if (isCancel(commandPrefix)) {
      return;
    }

    const groupedCommands = await getCommandsGroupedByCategory(
      variant as Variant,
    );
    const allCommandValues = Object.values(groupedCommands)
      .flat()
      .map((cmd) => cmd.value);
    selectedCommands = await groupMultiselect({
      message: "Select commands to install (Enter to accept all)",
      options: groupedCommands,
      initialValues: allCommandValues,
    });

    if (isCancel(selectedCommands)) {
      return;
    }
  }

  const conflicts = await checkForConflicts(
    undefined,
    variant as Variant,
    scope as Scope,
    {
      commandPrefix: commandPrefix as string,
      commands: selectedCommands as string[],
    },
  );

  const skipFiles: string[] = [];
  for (const conflict of conflicts) {
    const diff = formatCompactDiff(
      conflict.existingContent,
      conflict.newContent,
    );
    note(diff, `Diff: ${conflict.filename}`);
    const shouldOverwrite = await confirm({
      message: `Overwrite ${conflict.filename}?`,
    });
    if (!shouldOverwrite) {
      skipFiles.push(conflict.filename);
    }
  }

  const result = await generateToDirectory(
    undefined,
    variant as Variant,
    scope as Scope,
    {
      commandPrefix: commandPrefix as string,
      skipTemplateInjection: args?.skipTemplateInjection,
      commands: selectedCommands as string[],
      skipFiles,
    },
  );

  const fullPath =
    scope === "project"
      ? `${process.cwd()}/.claude/commands`
      : `${os.homedir()}/.claude/commands`;

  outro(
    `Installed ${result.filesGenerated} commands to ${fullPath}\n\nIf Claude Code is already running, restart it to pick up the new commands.\n\nHappy TDD'ing!`,
  );
}
