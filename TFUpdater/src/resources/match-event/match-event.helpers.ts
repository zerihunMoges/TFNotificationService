import { IEvent } from "./match-event.type";
const overShortStatus = new Set(["FT", "AET", "PEN", "WO"]);

export function isEventChanged(prevEvent: IEvent, event: IEvent) {
  const { team, player, assist, time, type, detail, comments } =
    prevEvent || {};
  const {
    team: prevTeam,
    player: prevPlayer,
    assist: prevAssist,
    time: prevTime,
    type: prevType,
    detail: prevDetail,
    comments: prevComments,
  } = event || {};

  return (
    team?.id === prevTeam?.id &&
    player?.id === prevPlayer?.id &&
    assist?.id === prevAssist?.id &&
    type === prevType &&
    time?.elapsed === prevTime?.elapsed &&
    detail === prevDetail &&
    comments === prevComments
  );
}

export function isMatchOver(status: string) {
  return overShortStatus.has(status);
}
