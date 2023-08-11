import { channel } from "diagnostics_channel";
import { Channel, IChannel } from "./channel.model";

export async function addChannel(channel: IChannel) {
  return await Channel.create(channel);
}
