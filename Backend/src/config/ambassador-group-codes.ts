export const AMBASSADOR_GROUP_INVITE_CODES: Readonly<Record<number, readonly string[]>> = {
  1: ["G01-T69DDZ", "G01-WP3GEM", "G01-AQDXDJ"],
  2: ["G02-WYBH8F", "G02-BKAJ8S", "G02-8V2YFF"],
  3: ["G03-742C4C", "G03-UGJJU5", "G03-G97QFJ"],
  4: ["G04-NUUYD7", "G04-KPL7JP", "G04-FU62RA"],
  5: ["G05-MGPMPK", "G05-L3MUDD", "G05-94LKDT"],
  6: ["G06-DS7SGE", "G06-JLNLWK", "G06-86Z2XJ"],
  7: ["G07-FJK6U4", "G07-XEQ98C", "G07-28UTY2"],
  8: ["G08-G3DWYW", "G08-WA6WCS", "G08-6KXX4D"],
  9: ["G09-WZWH7R", "G09-7FYQ82", "G09-SS863E"],
  10: ["G10-4A7AY3", "G10-KF5JY8", "G10-N57W22"],
};

const codeToGroup = new Map(
  Object.entries(AMBASSADOR_GROUP_INVITE_CODES).flatMap(([groupNumber, codes]) =>
    codes.map((code) => [code, Number(groupNumber)] as const),
  ),
);

export const groupNumberForInviteCode = (code?: string) => code
  ? codeToGroup.get(code.trim().toUpperCase())
  : undefined;

