import {
  MessageEvent,
  UnsendEvent,
  FollowEvent,
  UnfollowEvent,
  JoinEvent,
  LeaveEvent,
  MemberJoinEvent,
  MemberLeaveEvent,
  PostbackEvent,
  VideoPlayCompleteEvent,
  BeaconEvent,
  AccountLinkEvent,
  DeviceLinkEvent,
  DeviceUnlinkEvent,
  LINEThingsScenarioExecutionEvent,
} from "@line/bot-sdk";

export interface ClientEventsArgs {
  message: [ev: MessageEvent];
  unsend: [ev: UnsendEvent];
  follow: [ev: FollowEvent];
  unfollow: [ev: UnfollowEvent];
  join: [ev: JoinEvent];
  leave: [ev: LeaveEvent];
  memberJoined: [ev: MemberJoinEvent];
  memberLeft: [ev: MemberLeaveEvent];
  postback: [ev: PostbackEvent];
  videoPlayComplete: [ev: VideoPlayCompleteEvent];
  beacon: [ev: BeaconEvent];
  accountLink: [ev: AccountLinkEvent];
  things:
    | [ev: DeviceLinkEvent]
    | [ev: DeviceUnlinkEvent]
    | [ev: LINEThingsScenarioExecutionEvent];
}
