import { channel } from "diagnostics_channel";
import { Channel, IChannel } from "./channel.model";

export async function addChannel({ chatId, userChatId, username, title }) {
  const newChannel = await Channel.findOne({ chatId: chatId });
  if (newChannel) {
    if (!newChannel.userChatIds.includes(userChatId))
      newChannel.userChatIds.push(userChatId);
    newChannel.title = title;
    newChannel.username = username;
    return await newChannel.save();
  }
  return await Channel.create({
    chatId,
    userChatIds: [userChatId],
    username,
    title,
  });
}
